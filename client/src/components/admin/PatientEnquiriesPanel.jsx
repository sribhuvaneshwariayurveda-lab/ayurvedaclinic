import { useEffect, useRef, useState } from "react";
import { IconMail, IconPhone, IconX } from "../ui/Icons.jsx";

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  completed: "Completed",
};

function formatReceived(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function statusLabel(value) {
  return STATUS_LABELS[value] || value || "New";
}

async function request(path, options = {}) {
  const res = await fetch(path, { credentials: "same-origin", ...options });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

export default function PatientEnquiriesPanel({ onSessionExpired }) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const closeRef = useRef(null);
  const expiryRef = useRef(onSessionExpired);

  useEffect(() => {
    expiryRef.current = onSessionExpired;
  }, [onSessionExpired]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(page));
    params.set("limit", "20");
    request(`/api/admin/enquiries?${params.toString()}`)
      .then(({ status: code, data: result }) => {
        if (cancelled) return;
        if (code === 401) {
          expiryRef.current?.();
          return;
        }
        if (code !== 200 || !result) {
          setError(result?.error || "Could not load patient enquiries.");
          return;
        }
        setData(result);
        if (result.pages && page > result.pages) setPage(result.pages);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the enquiry API. Check the server and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, status, from, to, page, refresh]);

  useEffect(() => {
    if (!selected) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (event) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const changeStatus = async (id, nextStatus) => {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const { status: code, data: result } = await request(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (code === 401) {
        expiryRef.current?.();
        return;
      }
      if (code !== 200 || !result?.enquiry) {
        setError(result?.error || "Could not update the enquiry.");
        return;
      }
      setNotice(`Marked ${result.enquiry.patientName} as ${statusLabel(result.enquiry.status).toLowerCase()}.`);
      setSelected((current) => (current && current.id === id ? result.enquiry : current));
      setRefresh((value) => value + 1);
    } catch {
      setError("Could not update the enquiry. Check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  };

  const removeEnquiry = async (record) => {
    const ok = window.confirm(
      `Delete the enquiry from ${record.patientName}? This permanently removes the record and cannot be undone.`
    );
    if (!ok) return;
    setDetailBusy(true);
    setError("");
    setNotice("");
    try {
      const { status: code, data: result } = await request(`/api/admin/enquiries/${record.id}`, {
        method: "DELETE",
      });
      if (code === 401) {
        expiryRef.current?.();
        return;
      }
      if (code !== 200) {
        setError(result?.error || "Could not delete the enquiry.");
        return;
      }
      setSelected(null);
      setNotice("Enquiry deleted.");
      setRefresh((value) => value + 1);
    } catch {
      setError("Could not delete the enquiry. Check your connection and try again.");
    } finally {
      setDetailBusy(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setQuery("");
    setStatus("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const exportParams = new URLSearchParams();
  if (query) exportParams.set("q", query);
  if (status) exportParams.set("status", status);
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);
  const exportHref = `/api/admin/enquiries/export.csv${exportParams.toString() ? `?${exportParams}` : ""}`;
  const counts = data?.counts || { new: 0, contacted: 0, completed: 0, all: 0 };
  const hasFilters = Boolean(query || status || from || to);

  return (
    <div className="admin-enquiries">
      <div className="admin-enquiries__head">
        <div>
          <span className="admin-enquiries__eyebrow">Patient enquiries</span>
          <h2>Enquiries from the website</h2>
          <p>
            {counts.all} total · {counts.new} new · {counts.contacted} contacted · {counts.completed} completed
          </p>
        </div>
        <a className="btn btn--outline btn--sm" href={exportHref} download>
          Export CSV
        </a>
      </div>

      <div className="admin-enquiries__toolbar">
        <label className="admin-enquiries__search">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or phone number"
            aria-label="Search patient enquiries by name or phone"
          />
        </label>
        <label>
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          <span>From</span>
          <input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          <span>To</span>
          <input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </label>
        {hasFilters && (
          <button className="btn btn--outline btn--sm admin-enquiries__clear" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {notice ? <p className="admin-enquiries__notice">{notice}</p> : null}
      {error ? <p className="admin-enquiries__error" role="alert">{error}</p> : null}

      {loading && !data ? (
        <p className="admin-enquiries__empty">Loading patient enquiries…</p>
      ) : data && data.items.length === 0 ? (
        <div className="admin-enquiries__empty">
          <p>{hasFilters ? "No enquiries match these filters." : "No patient enquiries yet."}</p>
          {hasFilters && <button className="btn btn--outline btn--sm" type="button" onClick={clearFilters}>Clear filters</button>}
        </div>
      ) : data ? (
        <>
          <div className={`admin-enquiries__tablewrap${loading ? " is-loading" : ""}`}>
            <table className="admin-enquiries__table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Locality</th>
                  <th>Preferred</th>
                  <th>Status</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Received">
                      <time dateTime={item.createdAt}>{formatReceived(item.createdAt)}</time>
                      <small>{item.reference}</small>
                    </td>
                    <td data-label="Patient">
                      <strong>{item.patientName}</strong>
                      {item.age !== null ? <small>Age {item.age}</small> : null}
                    </td>
                    <td data-label="Contact">
                      {item.phone ? (
                        <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}>
                          <IconPhone width="13" height="13" /> {item.phone}
                        </a>
                      ) : null}
                      {item.email ? (
                        <a href={`mailto:${item.email}`}>
                          <IconMail width="13" height="13" /> {item.email}
                        </a>
                      ) : null}
                      {!item.phone && !item.email ? "—" : null}
                    </td>
                    <td data-label="Locality">{item.locality || "—"}</td>
                    <td data-label="Preferred">{formatDay(item.preferredDate)}</td>
                    <td data-label="Status">
                      <select
                        className={`admin-enquiries__status is-${item.status}`}
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(event) => changeStatus(item.id, event.target.value)}
                        aria-label={`Status for ${item.patientName}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn--outline btn--sm"
                        type="button"
                        onClick={() => setSelected(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-enquiries__pager">
            <span>
              Page {data.page} of {data.pages} · {data.total} {data.total === 1 ? "enquiry" : "enquiries"}
            </span>
            <div>
              <button
                className="btn btn--outline btn--sm"
                type="button"
                disabled={data.page <= 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>
              <button
                className="btn btn--outline btn--sm"
                type="button"
                disabled={data.page >= data.pages || loading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      {selected ? (
        <div
          className="admin-enquiry-detail__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="admin-enquiry-detail" role="dialog" aria-modal="true" aria-labelledby="enquiry-detail-title">
            <button
              ref={closeRef}
              type="button"
              className="admin-enquiry-detail__close"
              onClick={() => setSelected(null)}
              aria-label="Close enquiry details"
            >
              <IconX width="18" height="18" />
            </button>
            <span className="admin-enquiries__eyebrow">{selected.reference}</span>
            <h2 id="enquiry-detail-title">{selected.patientName}</h2>
            <p className="admin-enquiry-detail__received">Received {formatReceived(selected.createdAt)}</p>

            <div className="admin-enquiry-detail__status">
              <span>Status</span>
              <select
                className={`admin-enquiries__status is-${selected.status}`}
                value={selected.status}
                disabled={busyId === selected.id || detailBusy}
                onChange={(event) => changeStatus(selected.id, event.target.value)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <dl className="admin-enquiry-detail__list">
              <div>
                <dt>Phone</dt>
                <dd>
                  {selected.phone ? (
                    <a href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}>{selected.phone}</a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  {selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : "Not provided"}
                </dd>
              </div>
              <div>
                <dt>Locality / city</dt>
                <dd>{selected.locality || "Not provided"}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{selected.age !== null ? selected.age : "Not provided"}</dd>
              </div>
              <div>
                <dt>Preferred consultation date</dt>
                <dd>{formatDay(selected.preferredDate)}</dd>
              </div>
              <div>
                <dt>Consent to be contacted</dt>
                <dd>{selected.consent ? "Yes" : "No"}</dd>
              </div>
            </dl>

            <div className="admin-enquiry-detail__concern">
              <h3>Health concern / reason</h3>
              <p>{selected.healthConcern || "Not provided."}</p>
            </div>

            <p className="admin-enquiry-detail__updated">Last updated {formatReceived(selected.updatedAt)}</p>

            <div className="admin-enquiry-detail__actions">
              <button className="btn btn--outline btn--sm" type="button" onClick={() => setSelected(null)}>
                Close
              </button>
              <button
                className="admin-enquiry-detail__delete"
                type="button"
                disabled={detailBusy}
                onClick={() => removeEnquiry(selected)}
              >
                {detailBusy ? "Deleting…" : "Delete enquiry"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
