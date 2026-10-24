/*
 * Patient enquiry storage.
 *
 * The site previously had no database. This module adds a small SQLite
 * database using Node's built-in `node:sqlite` driver (Node 22.13+), so the
 * application stays dependency-free. The database lives outside the built
 * client bundle and is safe to keep across restarts and deployments.
 *
 * Migrations are additive and versioned. Existing content in data/content.json
 * and uploads/ are not touched.
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const STATUSES = ["new", "contacted", "completed"];
const STATUS_SET = new Set(STATUSES);
const MAX_AGE = 120;
const LIMITS = {
  patientName: 120,
  email: 254,
  phone: 24,
  locality: 120,
  healthConcern: 2000,
  search: 100,
};

const MIGRATIONS = [
  {
    version: 1,
    name: "create_patient_enquiries",
    sql: `
      CREATE TABLE enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        request_token TEXT NOT NULL UNIQUE,
        patient_name TEXT NOT NULL,
        email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        locality TEXT NOT NULL DEFAULT '',
        age INTEGER,
        preferred_date TEXT,
        health_concern TEXT NOT NULL DEFAULT '',
        consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0, 1)),
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX idx_enquiries_created_at ON enquiries (created_at DESC);
      CREATE INDEX idx_enquiries_status ON enquiries (status);
      CREATE INDEX idx_enquiries_phone ON enquiries (phone);
      CREATE INDEX idx_enquiries_name ON enquiries (patient_name COLLATE NOCASE);
    `,
  },
];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value, maxLength, multiline = false) {
  if (typeof value !== "string") return "";
  let text = value.normalize("NFC");
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  text = multiline
    ? text.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
    : text.replace(/\s+/g, " ");
  return text.trim().slice(0, maxLength);
}

function normalizeEmail(value) {
  return cleanText(value, LIMITS.email).toLowerCase();
}

function normalizePhone(value) {
  const raw = cleanText(value, LIMITS.phone + 8);
  if (!raw) return "";
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (hasPlus) return `+${digits}`;
  return digits;
}

function isValidEmail(value) {
  if (!value || value.length > LIMITS.email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidPhone(value) {
  return /^\+?\d{7,15}$/.test(value || "");
}

function normalizeDate(value) {
  const text = cleanText(value, 10);
  if (!text) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  const date = new Date(`${text}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text ? "" : text;
}

/**
 * Validate and normalise a public submission. Optional health/date fields are
 * never required. Only a name, one contact channel and consent are mandatory.
 */
function validateEnquiry(input) {
  if (!isPlainObject(input)) {
    return { ok: false, error: "Invalid enquiry.", fields: {} };
  }

  const patientName = cleanText(input.patientName ?? input.name, LIMITS.patientName);
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const locality = cleanText(input.locality ?? input.city, LIMITS.locality);
  const healthConcern = cleanText(input.healthConcern ?? input.concern, LIMITS.healthConcern, true);
  const preferredDate = normalizeDate(input.preferredDate);
  const consent = input.consent === true || input.consent === "true" || input.consent === 1;
  const fields = {};

  if (!patientName) fields.patientName = "Please enter the patient's name.";

  if (input.email && !isValidEmail(email)) {
    fields.email = "Please enter a valid email address.";
  }
  if (input.phone && !isValidPhone(phone)) {
    fields.phone = "Please enter a valid phone number.";
  }
  if (!email && !phone) {
    fields.contact = "Enter a phone number or email address so we can respond.";
  }
  if (input.age !== "" && input.age !== null && input.age !== undefined) {
    const age = Number(input.age);
    if (!Number.isInteger(age) || age < 0 || age > MAX_AGE) {
      fields.age = "Enter an age between 0 and 120, or leave it blank.";
    }
  }
  if (input.preferredDate && !preferredDate) {
    fields.preferredDate = "Enter a valid preferred date, or leave it blank.";
  }
  if (!consent) {
    fields.consent = "Please confirm that we may contact you about this enquiry.";
  }

  if (Object.keys(fields).length) {
    return { ok: false, error: "Please check the highlighted fields.", fields };
  }

  const age =
    input.age === "" || input.age === null || input.age === undefined ? null : Number(input.age);
  const requestToken =
    typeof input.requestId === "string" && /^[A-Za-z0-9-]{16,64}$/.test(input.requestId)
      ? input.requestId
      : crypto.randomUUID();

  return {
    ok: true,
    value: {
      patientName,
      email,
      phone,
      locality,
      age,
      preferredDate: preferredDate || null,
      healthConcern,
      consent: consent ? 1 : 0,
      requestToken,
    },
  };
}

function rowToEnquiry(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    reference: row.reference,
    patientName: row.patient_name,
    email: row.email,
    phone: row.phone,
    locality: row.locality,
    age: row.age === null || row.age === undefined ? null : Number(row.age),
    preferredDate: row.preferred_date || "",
    healthConcern: row.health_concern || "",
    consent: Boolean(row.consent),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function escapeLike(value) {
  return String(value).replace(/[\\%_]/g, "\\$&");
}

function safeDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function buildFilters(filters = {}) {
  const clauses = [];
  const params = [];
  const q = cleanText(filters.q, LIMITS.search);
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    clauses.push("(patient_name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\')");
    params.push(pattern, pattern);
  }
  if (STATUS_SET.has(filters.status)) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  const from = safeDate(filters.from);
  const to = safeDate(filters.to);
  if (from) {
    clauses.push("created_at >= ?");
    params.push(`${from}T00:00:00.000Z`);
  }
  if (to) {
    clauses.push("created_at <= ?");
    params.push(`${to}T23:59:59.999Z`);
  }
  return { where: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "", params };
}

function csvCell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  // Prevent spreadsheet formula injection in exported patient data.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

class EnquiryStore {
  constructor(file) {
    this.file = file;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let DatabaseSync;
    try {
      ({ DatabaseSync } = require("node:sqlite"));
    } catch {
      throw new Error(
        "Patient enquiries require Node.js 22.13 or newer (built-in node:sqlite). Set the host to Node 22.13+ and restart."
      );
    }
    this.db = new DatabaseSync(file);
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA busy_timeout = 5000;");
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.migrate();
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS enquiry_schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);
    const applied = new Set(
      this.db.prepare("SELECT version FROM enquiry_schema_migrations").all().map((row) => Number(row.version))
    );
    for (const migration of MIGRATIONS) {
      if (applied.has(migration.version)) continue;
      this.db.exec("BEGIN IMMEDIATE;");
      try {
        this.db.exec(migration.sql);
        this.db
          .prepare("INSERT INTO enquiry_schema_migrations (version, name, applied_at) VALUES (?, ?, ?)")
          .run(migration.version, migration.name, new Date().toISOString());
        this.db.exec("COMMIT;");
      } catch (err) {
        this.db.exec("ROLLBACK;");
        throw err;
      }
    }
  }

  makeReference() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    for (let i = 0; i < 5; i += 1) {
      const reference = `ENQ-${date}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const found = this.db.prepare("SELECT 1 FROM enquiries WHERE reference = ?").get(reference);
      if (!found) return reference;
    }
    return `ENQ-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }

  create(value) {
    const existing = this.db
      .prepare("SELECT * FROM enquiries WHERE request_token = ?")
      .get(value.requestToken);
    if (existing) return { duplicate: true, record: rowToEnquiry(existing) };

    const now = new Date().toISOString();
    const reference = this.makeReference();
    try {
      const result = this.db
        .prepare(
          `INSERT INTO enquiries
            (reference, request_token, patient_name, email, phone, locality, age, preferred_date,
             health_concern, consent, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`
        )
        .run(
          reference,
          value.requestToken,
          value.patientName,
          value.email,
          value.phone,
          value.locality,
          value.age,
          value.preferredDate,
          value.healthConcern,
          value.consent,
          now,
          now
        );
      return { duplicate: false, record: this.getById(Number(result.lastInsertRowid)) };
    } catch (err) {
      // A simultaneous retry with the same token may hit the UNIQUE constraint.
      if (/UNIQUE constraint failed: enquiries\.request_token/.test(String(err.message))) {
        const row = this.db
          .prepare("SELECT * FROM enquiries WHERE request_token = ?")
          .get(value.requestToken);
        return { duplicate: true, record: rowToEnquiry(row) };
      }
      throw err;
    }
  }

  getById(id) {
    return rowToEnquiry(this.db.prepare("SELECT * FROM enquiries WHERE id = ?").get(Number(id)));
  }

  list(filters = {}) {
    const { where, params } = buildFilters(filters);
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;
    const total =
      Number(this.db.prepare(`SELECT COUNT(*) AS count FROM enquiries${where}`).get(...params).count) || 0;
    const rows = this.db
      .prepare(`SELECT * FROM enquiries${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);
    const countRows = this.db
      .prepare("SELECT status, COUNT(*) AS count FROM enquiries GROUP BY status")
      .all();
    const counts = { new: 0, contacted: 0, completed: 0, all: 0 };
    for (const row of countRows) {
      const count = Number(row.count) || 0;
      counts[row.status] = count;
      counts.all += count;
    }
    return {
      items: rows.map(rowToEnquiry),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
      counts,
    };
  }

  updateStatus(id, status) {
    if (!STATUS_SET.has(status)) return { ok: false, error: "Invalid status." };
    const now = new Date().toISOString();
    const result = this.db
      .prepare("UPDATE enquiries SET status = ?, updated_at = ? WHERE id = ?")
      .run(status, now, Number(id));
    if (!result.changes) return { ok: false, error: "Enquiry not found.", notFound: true };
    return { ok: true, record: this.getById(id) };
  }

  remove(id) {
    const result = this.db.prepare("DELETE FROM enquiries WHERE id = ?").run(Number(id));
    return result.changes > 0;
  }

  csv(filters = {}) {
    const { where, params } = buildFilters(filters);
    const rows = this.db
      .prepare(`SELECT * FROM enquiries${where} ORDER BY created_at DESC, id DESC LIMIT 10000`)
      .all(...params);
    const header = [
      "Reference",
      "Patient name",
      "Email",
      "Phone",
      "Locality / city",
      "Age",
      "Preferred consultation date",
      "Health concern / reason",
      "Consent",
      "Status",
      "Received at",
      "Updated at",
    ];
    const lines = [header.map(csvCell).join(",")];
    for (const row of rows) {
      const item = rowToEnquiry(row);
      lines.push(
        [
          item.reference,
          item.patientName,
          item.email,
          item.phone,
          item.locality,
          item.age ?? "",
          item.preferredDate,
          item.healthConcern,
          item.consent ? "Yes" : "No",
          item.status,
          item.createdAt,
          item.updatedAt,
        ]
          .map(csvCell)
          .join(",")
      );
    }
    return `\uFEFF${lines.join("\r\n")}\r\n`;
  }

  close() {
    try {
      this.db.close();
    } catch {
      /* already closed */
    }
  }
}

function createEnquiryStore(file) {
  return new EnquiryStore(file);
}

module.exports = {
  STATUSES,
  createEnquiryStore,
  validateEnquiry,
  isValidEmail,
  isValidPhone,
};
