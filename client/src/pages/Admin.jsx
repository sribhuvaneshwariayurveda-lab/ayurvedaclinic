import { useEffect, useRef, useState } from "react";
import { getContentSnapshot, saveContent } from "../data/store.js";

/**
 * Admin panel (unlinked from public navigation; open /admin directly).
 * All security is enforced server-side: this page only renders forms and
 * calls the /api/admin/* endpoints. No password, hash or token is ever
 * embedded in this code or stored in localStorage — the session lives in
 * an HttpOnly cookie set by the server.
 */
async function api(path, options = {}) {
  const url = new URL(path, window.location.href).toString();
  const res = await fetch(url, { credentials: "same-origin", ...options });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

/**
 * Map a server response to a safe, specific message. The server never sends
 * secrets; `data.code` distinguishes config vs credential vs session issues.
 */
function messageFor(status, data) {
  const code = data && data.code;
  if (status === 429 || code === "rate_limited") {
    return "Too many attempts. Please wait 10 minutes and try again.";
  }
  if (code === "config_missing") {
    return "Admin panel is not configured on this server yet (ADMIN_USERNAME / ADMIN_PASSWORD_HASH missing).";
  }
  if (code === "config_invalid") {
    return "Server admin credential is misconfigured. An administrator must fix ADMIN_PASSWORD_HASH (expected $scrypt$N=…,r=…,p=…$<salt>$<hash>).";
  }
  if (code === "origin_rejected") {
    return "Request blocked (host mismatch). Open the site at its real hostname and try again.";
  }
  if (code === "invalid_credentials") {
    return "Invalid username or password.";
  }
  if (status === 503) {
    return "Admin panel is not configured on this server yet.";
  }
  if (status === 401) {
    return "Your session has ended. Please sign in again.";
  }
  if (data && data.error) {
    return data.error;
  }
  // No JSON body at all — usually the request did not reach the admin API
  // (e.g. the site is served statically, so /api/* returns HTML).
  return "The request did not reach the content API. Confirm the Node.js app (server.js) is running and routing /api/admin/*.";
}

const deepCopy = (value) => JSON.parse(JSON.stringify(value));

const TABS = [
  { id: "images", label: "Images" },
  { id: "about", label: "About Us" },
  { id: "products", label: "Products" },
  { id: "diseases", label: "Diseases" },
  { id: "testimonials", label: "Testimonials" },
  { id: "gallery", label: "Gallery" }
];

/* ------------------------------------------------------------- form fields */
function TextRow({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextAreaRow({ label, value, onChange, rows = 4 }) {
  return (
    <label className="field field--full">
      <span>{label}</span>
      <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/** Editor for a list of plain strings (credentials, symptoms, highlights…). */
function StringList({ label, items, onChange }) {
  const list = Array.isArray(items) ? items : [];
  const update = (index, next) => {
    const copy = list.slice();
    copy[index] = next;
    onChange(copy);
  };
  const remove = (index) => onChange(list.filter((_, i) => i !== index));
  return (
    <div className="field field--full">
      <span>{label}</span>
      <div className="admin-editor__list">
        {list.map((value, i) => (
          <div className="admin-editor__listrow" key={i}>
            <input type="text" value={value ?? ""} onChange={(e) => update(i, e.target.value)} />
            <button className="btn btn--outline btn--sm" type="button" onClick={() => remove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn--outline btn--sm" type="button" onClick={() => onChange([...list, ""])}>
        Add item
      </button>
    </div>
  );
}

/** Editor for a list of {title, text} objects (pillars, values, journey steps). */
function ObjectList({ label, items, onChange, extraFields = [] }) {
  const list = Array.isArray(items) ? items : [];
  const update = (index, key, next) => {
    const copy = deepCopy(list);
    copy[index] = { ...copy[index], [key]: next };
    onChange(copy);
  };
  const remove = (index) => onChange(list.filter((_, i) => i !== index));
  const add = () => {
    const blank = { title: "", text: "" };
    extraFields.forEach((f) => {
      blank[f.key] = "";
    });
    onChange([...list, blank]);
  };
  return (
    <div className="field field--full">
      <span>{label}</span>
      <div className="admin-editor__list">
        {list.map((item, i) => (
          <div className="admin-editor__item" key={i}>
            <div className="admin-editor__listrow">
              <input
                type="text"
                value={item?.title ?? ""}
                placeholder="Title"
                onChange={(e) => update(i, "title", e.target.value)}
              />
              <button className="btn btn--outline btn--sm" type="button" onClick={() => remove(i)}>
                Remove
              </button>
            </div>
            <textarea
              rows={3}
              value={item?.text ?? ""}
              placeholder="Description"
              onChange={(e) => update(i, "text", e.target.value)}
            />
            {extraFields.map((f) => (
              <TextRow
                key={f.key}
                label={f.label}
                value={item?.[f.key]}
                onChange={(next) => update(i, f.key, next)}
              />
            ))}
          </div>
        ))}
      </div>
      <button className="btn btn--outline btn--sm" type="button" onClick={add}>
        Add item
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- the panel */
export default function Admin() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);
  const uploadInputRef = useRef(null);
  const pendingUpload = useRef(null);

  const [tab, setTab] = useState("images");
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState(null);

  const refreshFiles = async () => {
    const { status: code, data } = await api("/api/admin/uploads");
    if (code === 200) setFiles(data.files || []);
  };

  const loadDraft = () => {
    const content = getContentSnapshot();
    setDraft({
      about: deepCopy(content.about || {}),
      products: deepCopy(content.products || { items: [] }),
      diseases: deepCopy(content.diseases || { items: [] }),
      testimonialsNote: content.testimonialsNote || "",
      testimonials: deepCopy(content.testimonials || []),
      gallery: deepCopy(content.gallery || { images: [] })
    });
  };

  useEffect(() => {
    let cancelled = false;
    api("/api/admin/session")
      .then(({ status: code, data }) => {
        if (cancelled) return;
        if (code === 200 && data && data.authenticated) {
          setUser(data.username);
          loadDraft();
          refreshFiles();
        } else if (code === 503) {
          setError(messageFor(code, data));
        }
        // Any other status (including 401 no_session) simply shows the login form.
      })
      .catch(() => {
        // Backend unreachable (e.g. preview/test render) — show login form.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { status: code, data } = await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (code === 200 && data && data.username) {
        setUser(data.username);
        setPassword("");
        loadDraft();
        refreshFiles();
      } else {
        setError(messageFor(code, data));
      }
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    await api("/api/admin/logout", { method: "POST" });
    setUser(null);
    setFiles([]);
    setUsername("");
    setPassword("");
    setDraft(null);
    setStatus(null);
  };

  const onUpload = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const file = fileRef.current && fileRef.current.files[0];
    if (!file) {
      setError("Choose an image first (JPEG, PNG or WebP, up to 5 MB).");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(new URL("/api/admin/uploads", window.location.href).toString(), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": file.type },
        body: file
      });
      const data = await res.json().catch(() => null);
      if (res.status === 201) {
        setNotice(`Uploaded: ${data.url}`);
        fileRef.current.value = "";
        refreshFiles();
      } else {
        setError((data && data.error) || "Upload failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (name) => {
    setError("");
    setNotice("");
    const { status: code, data } = await api(`/api/admin/uploads/${encodeURIComponent(name)}`, { method: "DELETE" });
    if (code === 200) {
      setNotice(`Deleted: ${name}`);
      refreshFiles();
    } else {
      setError((data && data.error) || "Delete failed.");
    }
  };

  /* Upload from inside an editor field: the shared file input posts the file
     and the resulting URL is written back into the field that asked for it. */
  const requestUpload = (apply) => {
    pendingUpload.current = { apply };
    if (uploadInputRef.current) uploadInputRef.current.click();
  };

  const onFieldUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    const apply = pendingUpload.current && pendingUpload.current.apply;
    pendingUpload.current = null;
    if (!file || !apply) return;
    setStatus({ kind: "busy", text: "Uploading image…" });
    try {
      const res = await fetch(new URL("/api/admin/uploads", window.location.href).toString(), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": file.type },
        body: file
      });
      const data = await res.json().catch(() => null);
      if (res.status === 201) {
        apply(data.url);
        setStatus({ kind: "ok", text: `Image uploaded: ${data.url}` });
      } else {
        setStatus({ kind: "error", text: (data && data.error) || "Upload failed." });
      }
    } catch (err) {
      setStatus({ kind: "error", text: "Could not reach the upload endpoint." });
    } finally {
      e.target.value = "";
    }
  };

  const onSave = async (patch, label) => {
    if (!draft) return;
    setStatus({ kind: "busy", text: "Saving…" });
    const res = await saveContent(patch);
    if (res.ok) {
      setStatus({ kind: "ok", text: `Saved. The ${label} section is now live on the site.` });
    } else {
      setStatus({ kind: "error", text: messageFor(res.status, res.data) });
    }
  };

  /* ---- draft helpers --------------------------------------------------- */
  const setSection = (section) => (updater) => {
    setDraft((current) => {
      const next = { ...current };
      const value = deepCopy(current[section]);
      next[section] = typeof updater === "function" ? updater(value) : updater;
      return next;
    });
  };

  const moveItem = (section, index, direction) => {
    setSection(section)((value) => {
      const items = value.items || [];
      const target = index + direction;
      if (target < 0 || target >= items.length) return value;
      const copy = items.slice();
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return { ...value, items: copy };
    });
  };

  const removeItem = (section, index) => {
    setSection(section)((value) => ({
      ...value,
      items: (value.items || []).filter((_, i) => i !== index)
    }));
  };

  const addItem = (section, blank) => {
    setSection(section)((value) => ({ ...value, items: [...(value.items || []), blank] }));
  };

  const setItem = (section, index, patch) => {
    setSection(section)((value) => {
      const items = (value.items || []).slice();
      items[index] = { ...items[index], ...patch };
      return { ...value, items };
    });
  };

  const imageOptions = (() => {
    const content = getContentSnapshot();
    const list = new Set();
    (content.products?.items || []).forEach((p) => p.image?.src && list.add(p.image.src));
    (content.diseases?.items || []).forEach((d) => d.image?.src && list.add(d.image.src));
    (content.gallery?.images || []).forEach((g) => g.src && list.add(g.src));
    if (content.about?.photos?.doctor?.src) list.add(content.about.photos.doctor.src);
    if (content.about?.photos?.clinic?.src) list.add(content.about.photos.clinic.src);
    return [...list];
  })();

  /* ---- render ---------------------------------------------------------- */
  const renderAboutEditor = () => {
    if (!draft?.about) return null;
    const about = draft.about;
    const set = (key) => (value) => setSection("about")((a) => ({ ...a, [key]: value }));
    const setIn = (key, sub) => (value) =>
      setSection("about")((a) => ({ ...a, [key]: { ...(a[key] || {}), [sub]: value } }));

    return (
      <div className="admin-editor">
        <div className="admin-editor__block">
          <h3>Page heading</h3>
          <div className="admin-editor__row">
            <TextRow label="Label" value={about.label} onChange={set("label")} />
            <TextRow label="Title" value={about.title} onChange={set("title")} />
            <TextRow label="Title accent" value={about.titleAccent} onChange={set("titleAccent")} />
            <TextRow label="Quote" value={about.quote} onChange={set("quote")} />
          </div>
          <StringList label="Intro paragraphs" items={about.paragraphs} onChange={set("paragraphs")} />
        </div>

        <div className="admin-editor__block">
          <h3>Our story</h3>
          <TextRow label="Heading" value={about.story?.title} onChange={setIn("story", "title")} />
          <StringList
            label="Story paragraphs"
            items={about.story?.paragraphs}
            onChange={(value) => setSection("about")((a) => ({ ...a, story: { ...(a.story || {}), paragraphs: value } }))}
          />
        </div>

        <div className="admin-editor__block">
          <h3>Credentials &amp; values</h3>
          <StringList label="Credentials" items={about.credentials} onChange={set("credentials")} />
          <ObjectList label="Pillars" items={about.pillars} onChange={set("pillars")} />
          <ObjectList label="Values" items={about.values} onChange={set("values")} />
          <ObjectList label="Visit journey steps" items={about.journey?.steps} onChange={(value) => setSection("about")((a) => ({ ...a, journey: { ...(a.journey || {}), steps: value } }))} />
          <StringList label="Focus areas" items={about.specialities} onChange={set("specialities")} />
        </div>

        <div className="admin-editor__block">
          <h3>Photographs</h3>
          <div className="admin-editor__row">
            <div className="field">
              <span>Doctor photograph</span>
              <div className="admin-editor__listrow">
                <input
                  type="text"
                  value={about.photos?.doctor?.src ?? ""}
                  onChange={(e) => setIn("photos", "doctor")({ ...(about.photos?.doctor || {}), src: e.target.value })}
                />
                <button
                  className="btn btn--outline btn--sm"
                  type="button"
                  onClick={() => requestUpload((url) => setIn("photos", "doctor")({ ...(about.photos?.doctor || {}), src: url }))}
                >
                  Upload
                </button>
              </div>
            </div>
            <div className="field">
              <span>Clinic photograph</span>
              <div className="admin-editor__listrow">
                <input
                  type="text"
                  value={about.photos?.clinic?.src ?? ""}
                  onChange={(e) => setIn("photos", "clinic")({ ...(about.photos?.clinic || {}), src: e.target.value })}
                />
                <button
                  className="btn btn--outline btn--sm"
                  type="button"
                  onClick={() => requestUpload((url) => setIn("photos", "clinic")({ ...(about.photos?.clinic || {}), src: url }))}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductsEditor = () => {
    if (!draft?.products) return null;
    const products = draft.products;
    const set = (key) => (value) => setSection("products")((p) => ({ ...p, [key]: value }));
    const items = products.items || [];

    return (
      <div className="admin-editor">
        <div className="admin-editor__block">
          <h3>Section copy</h3>
          <div className="admin-editor__row">
            <TextRow label="Label" value={products.label} onChange={set("label")} />
            <TextRow label="Title" value={products.title} onChange={set("title")} />
            <TextRow label="Title accent" value={products.titleAccent} onChange={set("titleAccent")} />
          </div>
          <TextAreaRow label="Description" value={products.desc} onChange={set("desc")} rows={3} />
          <TextAreaRow label="Note shown under the products" value={products.note} onChange={set("note")} rows={3} />
        </div>

        <div className="admin-editor__block">
          <h3>
            Products ({items.length})
            <button
              className="btn btn--outline btn--sm"
              type="button"
              onClick={() =>
                addItem("products", {
                  slug: "",
                  name: "New product",
                  tag: "Clinic product",
                  category: "Clinic product",
                  price: "",
                  text: "",
                  details: "",
                  highlights: [],
                  usage: "",
                  disclaimer: "",
                  image: { src: "", alt: "" },
                  gallery: []
                })
              }
            >
              Add product
            </button>
          </h3>

          <div className="admin-editor__list">
            {items.map((item, index) => (
              <div className="admin-editor__item" key={index}>
                <div className="admin-editor__item-head">
                  <b>{item.name || `Product ${index + 1}`}</b>
                  <div className="admin-editor__actions">
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => moveItem("products", index, -1)}>
                      Up
                    </button>
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => moveItem("products", index, 1)}>
                      Down
                    </button>
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => removeItem("products", index)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="admin-editor__row">
                  <TextRow
                    label="Name"
                    value={item.name}
                    onChange={(v) => setItem("products", index, { name: v })}
                  />
                  <TextRow
                    label="URL slug"
                    value={item.slug}
                    onChange={(v) => setItem("products", index, { slug: v })}
                  />
                  <TextRow
                    label="Tag"
                    value={item.tag}
                    onChange={(v) => setItem("products", index, { tag: v })}
                  />
                  <TextRow
                    label="Category"
                    value={item.category}
                    onChange={(v) => setItem("products", index, { category: v })}
                  />
                  <TextRow
                    label="Price (optional — leave empty if not on offer)"
                    value={item.price}
                    placeholder="e.g. ₹450 or Ask at the clinic"
                    onChange={(v) => setItem("products", index, { price: v })}
                  />
                </div>

                <TextAreaRow
                  label="Short description (card)"
                  rows={3}
                  value={item.text}
                  onChange={(v) => setItem("products", index, { text: v })}
                />
                <TextAreaRow
                  label="Full description"
                  rows={4}
                  value={item.details}
                  onChange={(v) => setItem("products", index, { details: v })}
                />

                <div className="field field--full">
                  <span>Poster image</span>
                  <div className="admin-editor__listrow">
                    <input
                      type="text"
                      list="admin-image-list"
                      value={item.image?.src ?? ""}
                      onChange={(e) =>
                        setItem("products", index, {
                          image: { ...(item.image || {}), src: e.target.value }
                        })
                      }
                    />
                    <button
                      className="btn btn--outline btn--sm"
                      type="button"
                      onClick={() =>
                        requestUpload((url) =>
                          setItem("products", index, { image: { ...(item.image || {}), src: url } })
                        )
                      }
                    >
                      Upload
                    </button>
                  </div>
                  {item.image?.src ? (
                    <span className="admin-editor__preview" style={{ marginTop: "0.5rem" }}>
                      <img src={item.image.src} alt="" />
                    </span>
                  ) : null}
                </div>

                <TextRow
                  label="Image alt text"
                  value={item.image?.alt}
                  onChange={(v) =>
                    setItem("products", index, { image: { ...(item.image || {}), alt: v } })
                  }
                />

                <StringList
                  label="Highlights"
                  items={item.highlights}
                  onChange={(v) => setItem("products", index, { highlights: v })}
                />
                <TextAreaRow
                  label="How it is used"
                  rows={3}
                  value={item.usage}
                  onChange={(v) => setItem("products", index, { usage: v })}
                />
                <TextAreaRow
                  label="Disclaimer"
                  rows={3}
                  value={item.disclaimer}
                  onChange={(v) => setItem("products", index, { disclaimer: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDiseasesEditor = () => {
    if (!draft?.diseases) return null;
    const diseases = draft.diseases;
    const set = (key) => (value) => setSection("diseases")((d) => ({ ...d, [key]: value }));
    const items = diseases.items || [];

    return (
      <div className="admin-editor">
        <div className="admin-editor__block">
          <h3>Section copy</h3>
          <div className="admin-editor__row">
            <TextRow label="Label" value={diseases.label} onChange={set("label")} />
            <TextRow label="Title" value={diseases.title} onChange={set("title")} />
            <TextRow label="Title accent" value={diseases.titleAccent} onChange={set("titleAccent")} />
          </div>
          <TextAreaRow label="Description" value={diseases.desc} onChange={set("desc")} rows={3} />
          <TextAreaRow label="Medical note" value={diseases.note} onChange={set("note")} rows={3} />
          <StringList label="Filter categories" items={diseases.categories} onChange={set("categories")} />
        </div>

        <div className="admin-editor__block">
          <h3>
            Conditions ({items.length})
            <button
              className="btn btn--outline btn--sm"
              type="button"
              onClick={() =>
                addItem("diseases", {
                  slug: "",
                  name: "New condition",
                  category: "General",
                  summary: "",
                  symptoms: [],
                  approach: "",
                  lifestyle: [],
                  disclaimer: "",
                  image: { src: "", alt: "" },
                  credit: ""
                })
              }
            >
              Add condition
            </button>
          </h3>

          <div className="admin-editor__list">
            {items.map((item, index) => (
              <div className="admin-editor__item" key={index}>
                <div className="admin-editor__item-head">
                  <b>{item.name || `Condition ${index + 1}`}</b>
                  <div className="admin-editor__actions">
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => moveItem("diseases", index, -1)}>
                      Up
                    </button>
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => moveItem("diseases", index, 1)}>
                      Down
                    </button>
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => removeItem("diseases", index)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="admin-editor__row">
                  <TextRow
                    label="Name"
                    value={item.name}
                    onChange={(v) => setItem("diseases", index, { name: v })}
                  />
                  <TextRow
                    label="URL slug"
                    value={item.slug}
                    onChange={(v) => setItem("diseases", index, { slug: v })}
                  />
                  <TextRow
                    label="Category"
                    value={item.category}
                    onChange={(v) => setItem("diseases", index, { category: v })}
                  />
                  <TextRow
                    label="Image credit"
                    value={item.credit}
                    onChange={(v) => setItem("diseases", index, { credit: v })}
                  />
                </div>

                <TextAreaRow
                  label="Summary"
                  rows={3}
                  value={item.summary}
                  onChange={(v) => setItem("diseases", index, { summary: v })}
                />

                <div className="field field--full">
                  <span>Illustration</span>
                  <div className="admin-editor__listrow">
                    <input
                      type="text"
                      list="admin-image-list"
                      value={item.image?.src ?? ""}
                      onChange={(e) =>
                        setItem("diseases", index, {
                          image: { ...(item.image || {}), src: e.target.value }
                        })
                      }
                    />
                    <button
                      className="btn btn--outline btn--sm"
                      type="button"
                      onClick={() =>
                        requestUpload((url) =>
                          setItem("diseases", index, { image: { ...(item.image || {}), src: url } })
                        )
                      }
                    >
                      Upload
                    </button>
                  </div>
                  {item.image?.src ? (
                    <span className="admin-editor__preview" style={{ marginTop: "0.5rem" }}>
                      <img src={item.image.src} alt="" />
                    </span>
                  ) : null}
                </div>

                <StringList
                  label="Features people commonly notice"
                  items={item.symptoms}
                  onChange={(v) => setItem("diseases", index, { symptoms: v })}
                />
                <TextAreaRow
                  label="Ayurvedic approach"
                  rows={4}
                  value={item.approach}
                  onChange={(v) => setItem("diseases", index, { approach: v })}
                />
                <StringList
                  label="Lifestyle and dietary guidance"
                  items={item.lifestyle}
                  onChange={(v) => setItem("diseases", index, { lifestyle: v })}
                />
                <TextAreaRow
                  label="Disclaimer"
                  rows={3}
                  value={item.disclaimer}
                  onChange={(v) => setItem("diseases", index, { disclaimer: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTestimonialsEditor = () => {
    if (!draft) return null;
    const list = Array.isArray(draft.testimonials) ? draft.testimonials : [];
    const update = (index, patch) => {
      setSection("testimonials")((value) => {
        const copy = deepCopy(Array.isArray(value) ? value : []);
        copy[index] = { ...copy[index], ...patch };
        return copy;
      });
    };
    const remove = (index) => {
      setSection("testimonials")((value) =>
        (Array.isArray(value) ? value : []).filter((_, i) => i !== index)
      );
    };
    const add = () => {
      setSection("testimonials")((value) => [
        ...(Array.isArray(value) ? value : []),
        { quote: "", name: "", treatment: "" }
      ]);
    };
    return (
      <div className="admin-editor">
        <div className="admin-editor__block">
          <h3>Consent note</h3>
          <TextAreaRow
            label="Note shown under the testimonials heading"
            rows={3}
            value={draft.testimonialsNote}
            onChange={(v) => setSection("testimonialsNote")(() => v)}
          />
          <p className="admin-editor__hint">
            Only publish a testimonial when the patient has given genuine written consent. Leave
            the name empty to publish it anonymously.
          </p>
        </div>

        <div className="admin-editor__block">
          <h3>
            Testimonials ({list.length})
            <button className="btn btn--outline btn--sm" type="button" onClick={add}>
              Add testimonial
            </button>
          </h3>
          <div className="admin-editor__list">
            {list.map((item, index) => (
              <div className="admin-editor__item" key={index}>
                <div className="admin-editor__item-head">
                  <b>{item.name || `Testimonial ${index + 1}`}</b>
                  <div className="admin-editor__actions">
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => remove(index)}>
                      Delete
                    </button>
                  </div>
                </div>
                <TextAreaRow
                  label="Patient's words (as written by the patient)"
                  rows={4}
                  value={item.quote}
                  onChange={(v) => update(index, { quote: v })}
                />
                <div className="admin-editor__row">
                  <TextRow
                    label="Name (or leave empty for anonymous)"
                    value={item.name}
                    onChange={(v) => update(index, { name: v })}
                  />
                  <TextRow
                    label="Treatment mentioned (optional)"
                    value={item.treatment}
                    onChange={(v) => update(index, { treatment: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGalleryEditor = () => {
    if (!draft?.gallery) return null;
    const gallery = draft.gallery;
    const set = (key) => (value) => setSection("gallery")((g) => ({ ...g, [key]: value }));
    const images = Array.isArray(gallery.images) ? gallery.images : [];

    const updateImage = (index, patch) => {
      setSection("gallery")((g) => {
        const copy = (Array.isArray(g.images) ? g.images : []).slice();
        copy[index] = { ...copy[index], ...patch };
        return { ...g, images: copy };
      });
    };
    const removeImage = (index) => {
      setSection("gallery")((g) => ({
        ...g,
        images: (Array.isArray(g.images) ? g.images : []).filter((_, i) => i !== index)
      }));
    };
    const addImage = () => {
      setSection("gallery")((g) => ({
        ...g,
        images: [...(Array.isArray(g.images) ? g.images : []), { src: "", alt: "", caption: "", credit: "" }]
      }));
    };

    return (
      <div className="admin-editor">
        <div className="admin-editor__block">
          <h3>Section copy</h3>
          <div className="admin-editor__row">
            <TextRow label="Label" value={gallery.label} onChange={set("label")} />
            <TextRow label="Title" value={gallery.title} onChange={set("title")} />
            <TextRow label="Title accent" value={gallery.titleAccent} onChange={set("titleAccent")} />
          </div>
          <TextAreaRow label="Description" rows={3} value={gallery.desc} onChange={set("desc")} />
        </div>

        <div className="admin-editor__block">
          <h3>
            Images ({images.length})
            <button className="btn btn--outline btn--sm" type="button" onClick={addImage}>
              Add image
            </button>
          </h3>
          <div className="admin-editor__list">
            {images.map((item, index) => (
              <div className="admin-editor__item" key={index}>
                <div className="admin-editor__item-head">
                  <b>{item.caption || `Image ${index + 1}`}</b>
                  <div className="admin-editor__actions">
                    <button className="btn btn--outline btn--sm" type="button" onClick={() => removeImage(index)}>
                      Delete
                    </button>
                  </div>
                </div>
                <div className="field field--full">
                  <span>Image</span>
                  <div className="admin-editor__listrow">
                    <input
                      type="text"
                      list="admin-image-list"
                      value={item.src || ""}
                      onChange={(e) => updateImage(index, { src: e.target.value })}
                    />
                    <button
                      className="btn btn--outline btn--sm"
                      type="button"
                      onClick={() => requestUpload((url) => updateImage(index, { src: url }))}
                    >
                      Upload
                    </button>
                  </div>
                  {item.src ? (
                    <span className="admin-editor__preview" style={{ marginTop: "0.5rem" }}>
                      <img src={item.src} alt="" />
                    </span>
                  ) : null}
                </div>
                <TextRow
                  label="Caption"
                  value={item.caption}
                  onChange={(v) => updateImage(index, { caption: v })}
                />
                <TextRow
                  label="Alt text"
                  value={item.alt}
                  onChange={(v) => updateImage(index, { alt: v })}
                />
                <TextRow
                  label="Credit"
                  value={item.credit}
                  onChange={(v) => updateImage(index, { credit: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>
            Admin
          </span>
          <h1>Clinic admin panel</h1>
          <p>
            Sign in to manage the About Us page, the product list, the conditions we cover and the
            images used across the site. Changes are saved to the server and appear immediately.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {checking ? (
            <p>Checking session…</p>
          ) : !user ? (
            <form className="appt-form" onSubmit={onLogin} noValidate>
              <div className="appt-form__grid">
                <label className="field">
                  <span>Username</span>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" autoComplete="username" required />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required />
                </label>
              </div>
              {error ? <p className="appt-form__error">{error}</p> : null}
              <button className="btn btn--gold btn--block" type="submit" disabled={busy}>
                {busy ? "Signing in…" : "Sign In"}
              </button>
            </form>
          ) : (
            <>
              <p>
                Signed in as <strong>{user}</strong>.{" "}
                <button className="btn btn--outline btn--sm" type="button" onClick={onLogout}>
                  Sign Out
                </button>
              </p>

              <datalist id="admin-image-list">
                {imageOptions.map((src) => (
                  <option key={src} value={src} />
                ))}
              </datalist>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFieldUpload}
                style={{ display: "none" }}
              />

              <div className="admin-tabs" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    className={`admin-tab${tab === t.id ? " is-active" : ""}`}
                    onClick={() => {
                      setTab(t.id);
                      setStatus(null);
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {status ? (
                <p
                  className={`admin-editor__status${status.kind === "error" ? " admin-editor__status--error" : ""}`}
                  style={{ marginBottom: "1.2rem" }}
                >
                  {status.text}
                </p>
              ) : null}

              {tab === "images" ? (
                <div className="admin-editor">
                  <div className="admin-editor__block">
                    <h3>Upload an image</h3>
                    <form className="appt-form" onSubmit={onUpload} style={{ boxShadow: "none", padding: 0, border: "none" }}>
                      <label className="field field--full">
                        <span>Upload image (JPEG, PNG or WebP, max 5 MB)</span>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" />
                      </label>
                      {error ? <p className="appt-form__error">{error}</p> : null}
                      {notice ? <p className="appt-form__note">{notice}</p> : null}
                      <button className="btn btn--gold btn--block" type="submit" disabled={busy}>
                        {busy ? "Uploading…" : "Upload Image"}
                      </button>
                    </form>
                  </div>

                  <div className="admin-editor__block">
                    <h3>Uploaded images ({files.length})</h3>
                    {files.length === 0 ? (
                      <p className="section-desc">No uploads yet.</p>
                    ) : (
                      <ul className="admin-editor__list">
                        {files.map((f) => (
                          <li key={f.name} className="admin-editor__listrow">
                            <span className="admin-editor__preview">
                              <img src={f.url} alt="" />
                            </span>
                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                              <code style={{ fontSize: "0.78rem" }}>{f.url}</code>
                              <span style={{ display: "block", fontSize: "0.78rem", opacity: 0.7 }}>
                                {(f.size / 1024).toFixed(1)} KB
                              </span>
                            </span>
                            <button className="btn btn--outline btn--sm" type="button" onClick={() => onDelete(f.name)}>
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}

              {tab === "about" ? (
                <>
                  {renderAboutEditor()}
                  <div style={{ marginTop: "1.4rem" }}>
                    <button className="btn btn--green" type="button" onClick={() => onSave({ about: draft.about }, "About Us")}>
                      Save About Us
                    </button>
                  </div>
                </>
              ) : null}

              {tab === "products" ? (
                <>
                  {renderProductsEditor()}
                  <div style={{ marginTop: "1.4rem" }}>
                    <button className="btn btn--green" type="button" onClick={() => onSave({ products: draft.products }, "Products")}>
                      Save Products
                    </button>
                  </div>
                </>
              ) : null}

              {tab === "diseases" ? (
                <>
                  {renderDiseasesEditor()}
                  <div style={{ marginTop: "1.4rem" }}>
                    <button className="btn btn--green" type="button" onClick={() => onSave({ diseases: draft.diseases }, "Diseases")}>
                      Save Conditions
                    </button>
                  </div>
                </>
              ) : null}

              {tab === "testimonials" ? (
                <>
                  {renderTestimonialsEditor()}
                  <div style={{ marginTop: "1.4rem" }}>
                    <button
                      className="btn btn--green"
                      type="button"
                      onClick={() =>
                        onSave(
                          { testimonialsNote: draft.testimonialsNote, testimonials: draft.testimonials },
                          "Testimonials"
                        )
                      }
                    >
                      Save Testimonials
                    </button>
                  </div>
                </>
              ) : null}

              {tab === "gallery" ? (
                <>
                  {renderGalleryEditor()}
                  <div style={{ marginTop: "1.4rem" }}>
                    <button className="btn btn--green" type="button" onClick={() => onSave({ gallery: draft.gallery }, "Gallery")}>
                      Save Gallery
                    </button>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
