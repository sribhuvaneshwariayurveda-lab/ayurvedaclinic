import { useEffect, useRef, useState } from "react";

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

  const refreshFiles = async () => {
    const { status, data } = await api("/api/admin/uploads");
    if (status === 200) setFiles(data.files || []);
  };

  useEffect(() => {
    let cancelled = false;
    api("/api/admin/session")
      .then(({ status, data }) => {
        if (cancelled) return;
        if (status === 200 && data && data.authenticated) {
          setUser(data.username);
          refreshFiles();
        } else if (status === 503) {
          setError("Admin panel is not configured on this server yet.");
        }
        // Any other status (including 401) simply shows the login form.
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
      const { status, data } = await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (status === 200) {
        setUser(data.username);
        setPassword("");
        refreshFiles();
      } else if (status === 429) {
        setError("Too many attempts. Please wait 10 minutes and try again.");
      } else if (status === 503) {
        setError("Admin panel is not configured on this server yet.");
      } else {
        setError((data && data.error) || "Login failed.");
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
    const { status, data } = await api(`/api/admin/uploads/${encodeURIComponent(name)}`, { method: "DELETE" });
    if (status === 200) {
      setNotice(`Deleted: ${name}`);
      refreshFiles();
    } else {
      setError((data && data.error) || "Delete failed.");
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>Admin</span>
          <h1>Clinic admin panel</h1>
          <p>Sign in to manage uploaded clinic photographs, gallery images and product entries.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
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
              <form className="appt-form" onSubmit={onUpload} style={{ marginTop: "1.5rem" }}>
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
              <div style={{ marginTop: "2rem" }}>
                <h2 className="section-title" style={{ fontSize: "1.4rem" }}>Uploaded images</h2>
                {files.length === 0 ? (
                  <p className="section-desc">No uploads yet.</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.8rem" }}>
                    {files.map((f) => (
                      <li key={f.name} className="pillar" style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <img src={f.url} alt="" width={72} height={72} style={{ objectFit: "cover", borderRadius: 8 }} loading="lazy" />
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
            </>
          )}
        </div>
      </section>
    </>
  );
}
