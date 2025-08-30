import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function Sidebar() {
  const [usage, setUsage] = useState<string>("-");
  useEffect(() => {
    fetch(`${API}/api/storage/usage`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsage(formatBytes(d.bytesUsed)))
      .catch(() => {});
  }, []);
  return (
    <div className="sidebar">
      <div className="top">
        <div className="storage">Speicher: {usage}</div>
        <NavLink className="navlink" to="/videos">Videos</NavLink>
        <NavLink className="navlink" to="/favorites">Favoriten</NavLink>
        <NavLink className="navlink" to="/upload">Upload</NavLink>
      </div>
      <div className="bottom">
        <NavLink className="navlink" to="/settings">Einstellungen</NavLink>
        <NavLink className="navlink" to="/categories">Kategorien</NavLink>
        <NavLink className="navlink" to="/login">Logout</NavLink>
      </div>
    </div>
  );
}

function Layout({ children }: { children: any }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">{children}</div>
    </div>
  );
}

function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const nav = useNavigate();
  const onSubmit = async (e: any) => {
    e.preventDefault();
    const r = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });
    if (r.ok) nav("/videos");
    else alert("Login fehlgeschlagen");
  };
  return (
    <div className="grid" style={{ maxWidth: 360, margin: "80px auto" }}>
      <h2>Login</h2>
      <input className="input" placeholder="Benutzername" value={username} onChange={(e) => setU(e.target.value)} />
      <input className="input" placeholder="Passwort" type="password" value={password} onChange={(e) => setP(e.target.value)} />
      <button className="btn" onClick={onSubmit}>Anmelden</button>
    </div>
  );
}

function VideosList({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState("25");

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL(`${API}/api/videos`);
    if (q) url.searchParams.set("search", q);
    url.searchParams.set("limit", limit);
    fetch(url.toString(), { credentials: "include", signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        setItems(favoritesOnly ? d.filter((x: any) => x.favorite) : d);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [q, limit, favoritesOnly]);

  return (
    <Layout>
      <div className="grid" style={{ gap: 16 }}>
        <div className="row">
          <input className="input" placeholder="Suche" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={limit} onChange={(e) => setLimit(e.target.value)}>
            <option>25</option>
            <option>50</option>
            <option value="100000">Alle</option>
          </select>
        </div>
        <div className="grid covers">
          {items.map((v) => (
            <div key={v.id} className="cover">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="badge">{formatDuration(v.duration_sec)}</div>
                {v.favorite ? <div className="star">★</div> : null}
              </div>
              <div>{v.title}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function Favorites() {
  return <VideosList favoritesOnly />;
}

function Upload() {
  const [title, setTitle] = useState("");
  const [videoFile, setVideo] = useState<File | null>(null);
  const [coverFile, setCover] = useState<File | null>(null);
  const [prevFile, setPrev] = useState<File | null>(null);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [videoPath, setVideoPath] = useState<string>("");
  const [coverPath, setCoverPath] = useState<string>("");
  const [previewPath, setPreviewPath] = useState<string>("");

  const [uVideo, setUVideo] = useState<any>(null);
  const [uCover, setUCover] = useState<any>(null);
  const [uPrev, setUPrev] = useState<any>(null);

  const startTus = (file: File, onProgress: (pct: number) => void, setPath: (p: string) => void, setUploadRef: (u: any) => void) => {
    const tus = (window as any).tus || undefined;
    return new Promise<void>((resolve, reject) => {
      if (!tus) return reject(new Error("tus not available"));
      const upload = new tus.Upload(file, {
        endpoint: `${API}/api/tus`,
        metadata: { filename: file.name, filetype: file.type },
        onError: (e: Error) => reject(e),
        onProgress: (sent: number, total: number) => onProgress(Math.round((sent / total) * 100)),
        onSuccess: async () => {
          try {
            const url = upload.url || "";
            const r = await fetch(`${API}/api/tus/resolve-path?uploadUrl=${encodeURIComponent(url)}`, { credentials: "include" });
            const j = await r.json();
            setPath(j.path);
            resolve();
          } catch (e) {
            reject(e as any);
          }
        }
      });
      setUploadRef(upload);
      upload.start();
    });
  };

  const doUpload = async () => {
    if (!title || !videoFile || !coverFile || !prevFile) return alert("Daten unvollständig");
    setErr(null);
    setUploading(true);
    setPaused(false);
    setP1(0); setP2(0);

    try {
      await startTus(videoFile, (pct) => setP1(Math.min(99, Math.floor(pct * 0.5))), setVideoPath, (u) => setUVideo(u));
      await startTus(coverFile, (pct) => setP1((prev) => Math.min(99, Math.floor(50 + pct * 0.25))), setCoverPath, (u) => setUCover(u));
      await startTus(prevFile, (pct) => setP1((prev) => Math.min(99, Math.floor(75 + pct * 0.25))), setPreviewPath, (u) => setUPrev(u));
      setP1(100);

      const finalize = await fetch(`${API}/api/videos/finalize`, {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams({
          title,
          videoPath,
          coverPath,
          previewPath
        })
      });
      if (!finalize.ok) throw new Error("Finalisierung fehlgeschlagen");
      setP2(100);
      alert("Upload erfolgreich");
    } catch (e: any) {
      setErr(e?.message || "Fehler beim Upload");
    } finally {
      setUploading(false);
    }
  };

  const pause = () => {
    setPaused(true);
    uVideo?.abort?.();
    uCover?.abort?.();
    uPrev?.abort?.();
  };

  const resume = () => {
    setPaused(false);
    uVideo?.start?.();
    uCover?.start?.();
    uPrev?.start?.();
  };

  return (
    <Layout>
      <div className="grid" style={{ maxWidth: 640 }}>
        <h2>Upload</h2>
        <input className="input" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="row"><input type="file" onChange={(e) => setVideo(e.target.files?.[0] || null)} /></div>
        <div className="row"><input type="file" onChange={(e) => setCover(e.target.files?.[0] || null)} /></div>
        <div className="row"><input type="file" onChange={(e) => setPrev(e.target.files?.[0] || null)} /></div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={doUpload} disabled={uploading}>Hochladen</button>
          <button className="btn" onClick={pause} disabled={!uploading || paused}>Pause</button>
          <button className="btn" onClick={resume} disabled={!uploading || !paused}>Weiter</button>
        </div>
        <div>Fortschritt Upload: {p1}%</div>
        <div>Finalisierung: {p2}%</div>
        {err ? <div style={{ color: "salmon" }}>{err}</div> : null}
      </div>
    </Layout>
  );
}
function Categories() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const load = () => {
    fetch(`${API}/api/categories`, { credentials: "include" })
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!name) return;
    await fetch(`${API}/api/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name }) });
    setName("");
    load();
  };
  const rename = async (id: number, newName: string) => {
    await fetch(`${API}/api/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name: newName }) });
    load();
  };
  const del = async (id: number) => {
    await fetch(`${API}/api/categories/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };
  return (
    <Layout>
      <div className="grid" style={{ maxWidth: 640 }}>
        <h2>Kategorien</h2>
        <div className="row">
          <input className="input" placeholder="Neue Kategorie" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn" onClick={add}>Hinzufügen</button>
        </div>
        <div className="grid">
          {items.map((c: any) => (
            <div key={c.id} className="row" style={{ gap: 8, alignItems: "center" }}>
              <input className="input" defaultValue={c.name} onBlur={(e) => rename(c.id, e.target.value)} />
              <button className="btn" onClick={() => del(c.id)}>Löschen</button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}


function Settings() {
  return (
    <Layout>
      <h2>Einstellungen</h2>
      <div>Kategorien und Tags Verwaltung folgt.</div>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/videos" element={<VideosList />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

function formatBytes(n: number) {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${u[i]}`;
}

function formatDuration(s: number) {
  const m = Math.floor((s || 0) / 60);
  const r = (s || 0) % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
