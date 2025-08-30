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
      </div>
      <div className="bottom">
        <NavLink className="navlink" to="/settings">Einstellungen</NavLink>
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

  const doUpload = async () => {
    if (!title || !videoFile || !coverFile || !prevFile) return alert("Daten unvollständig");

    const up = async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API}/api/tus/upload/${Date.now()}`, {
        method: "POST",
        body: file,
      });
      if (!r.ok) throw new Error("upload_failed");
      setP1((x) => Math.min(100, x + 30));
      return "/tmp/uploaded";
    };

    setP1(0); setP2(0);
    await up(videoFile);
    await up(coverFile);
    await up(prevFile);
    setP1(100);

    const finalize = await fetch(`${API}/api/videos/finalize`, {
      method: "POST",
      credentials: "include",
      body: new URLSearchParams({
        title,
        videoPath: "/tmp/video",
        coverPath: "/tmp/cover",
        previewPath: "/tmp/preview"
      })
    });
    if (finalize.ok) {
      setP2(100);
      alert("Upload erfolgreich");
    } else {
      alert("Finalisierung fehlgeschlagen");
    }
  };

  return (
    <Layout>
      <div className="grid" style={{ maxWidth: 640 }}>
        <h2>Upload</h2>
        <input className="input" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="row"><input type="file" onChange={(e) => setVideo(e.target.files?.[0] || null)} /></div>
        <div className="row"><input type="file" onChange={(e) => setCover(e.target.files?.[0] || null)} /></div>
        <div className="row"><input type="file" onChange={(e) => setPrev(e.target.files?.[0] || null)} /></div>
        <button className="btn" onClick={doUpload}>Hochladen</button>
        <div>Fortschritt 1: {p1}%</div>
        <div>Fortschritt 2: {p2}%</div>
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
