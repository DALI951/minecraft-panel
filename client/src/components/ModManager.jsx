import { useState, useEffect } from "react";
import { api } from "../api";

export default function ModManager() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchMods(); }, []);

  async function fetchMods() {
    try {
      const data = await api("/api/mods");
      setMods(data);
    } catch {
      setMods([]);
    } finally {
      setLoading(false);
    }
  }

  async function uploadMod(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("mod", file);
      await fetch("/api/mods", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      fetchMods();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function deleteMod(name) {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await api(`/api/mods/${encodeURIComponent(name)}`, { method: "DELETE" });
      fetchMods();
    } catch (err) {
      alert("Delete failed: " + err.message);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "24px" }}>Mod Manager</h1>
        <label style={{ padding: "0.5rem 1rem", background: "#238636", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "14px" }}>
          {uploading ? "Uploading..." : "Upload Mod"}
          <input type="file" accept=".jar" onChange={uploadMod} style={{ display: "none" }} />
        </label>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #30363d", textAlign: "left" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Size</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mods.length === 0 && (
            <tr><td colSpan={3} style={{ padding: "1rem", color: "#8b949e" }}>No mods found</td></tr>
          )}
          {mods.map((mod) => (
            <tr key={mod.name} style={{ borderBottom: "1px solid #21262d" }}>
              <td style={{ padding: "0.75rem" }}>{mod.name}</td>
              <td style={{ padding: "0.75rem", color: "#8b949e" }}>{formatSize(mod.size)}</td>
              <td style={{ padding: "0.75rem" }}>
                <button onClick={() => deleteMod(mod.name)} style={{ padding: "0.25rem 0.75rem", background: "#da3633", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "13px" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { padding: "0.75rem", color: "#8b949e", fontWeight: "600", fontSize: "14px" };
