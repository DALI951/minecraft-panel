import { useState, useEffect } from "react";
import { api } from "../api";

export default function WorldManager() {
  const [worldFiles, setWorldFiles] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [world, bkps] = await Promise.all([
        api("/api/worlds"),
        api("/api/worlds/backups"),
      ]);
      setWorldFiles(world);
      setBackups(bkps);
    } catch {
      setWorldFiles([]);
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }

  async function uploadWorld(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("world", file);
      await fetch("/api/worlds/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      fetchData();
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
    e.target.value = "";
  }

  async function downloadWorld(name) {
    try {
      const res = await fetch(`/api/worlds/download/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  }

  function formatSize(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(1)} ${units[i]}`;
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "24px" }}>World Manager</h1>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "18px" }}>Current World</h2>
          <label style={{ padding: "0.5rem 1rem", background: "#238636", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "14px" }}>
            Upload World Zip
            <input type="file" accept=".zip" onChange={uploadWorld} style={{ display: "none" }} />
          </label>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #30363d", textAlign: "left" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Size</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {worldFiles.length === 0 && (
              <tr><td colSpan={4} style={{ padding: "1rem", color: "#8b949e" }}>No files</td></tr>
            )}
            {worldFiles.map((f) => (
              <tr key={f.name} style={{ borderBottom: "1px solid #21262d" }}>
                <td style={{ padding: "0.75rem" }}>{f.name}</td>
                <td style={{ padding: "0.75rem", color: "#8b949e" }}>{f.type === "d" ? "Dir" : "File"}</td>
                <td style={{ padding: "0.75rem", color: "#8b949e" }}>{formatSize(f.size)}</td>
                <td style={{ padding: "0.75rem" }}>
                  {f.type !== "d" && (
                    <button onClick={() => downloadWorld(f.name)} style={btnBlue}>Download</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 style={{ fontSize: "18px", marginBottom: "1rem" }}>Backups</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #30363d", textAlign: "left" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Size</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 && (
              <tr><td colSpan={3} style={{ padding: "1rem", color: "#8b949e" }}>No backups</td></tr>
            )}
            {backups.map((b) => (
              <tr key={b.name} style={{ borderBottom: "1px solid #21262d" }}>
                <td style={{ padding: "0.75rem" }}>{b.name}</td>
                <td style={{ padding: "0.75rem", color: "#8b949e" }}>{formatSize(b.size)}</td>
                <td style={{ padding: "0.75rem" }}>
                  <button onClick={() => downloadWorld(b.name)} style={btnBlue}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: "0.75rem", color: "#8b949e", fontWeight: "600", fontSize: "14px" };
const btnBlue = { padding: "0.25rem 0.75rem", background: "#1f6feb", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "13px" };
