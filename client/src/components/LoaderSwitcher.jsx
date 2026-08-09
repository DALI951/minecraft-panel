import { useState, useEffect } from "react";
import { api } from "../api";

export default function LoaderSwitcher() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchInfo(); }, []);

  async function fetchInfo() {
    try {
      const data = await api("/api/loader");
      setInfo(data);
    } catch {
      setInfo({ loader: "vanilla", version: "", serverJar: "" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "24px" }}>Loader / Version Switcher</h1>
      <div style={{ background: "#1a1d23", borderRadius: "8px", padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ color: "#8b949e", fontSize: "14px", marginBottom: "0.5rem" }}>Current Loader</p>
          <p style={{ fontSize: "18px", fontWeight: "600" }}>{info?.loader || "Unknown"}</p>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ color: "#8b949e", fontSize: "14px", marginBottom: "0.5rem" }}>Current Version</p>
          <p style={{ fontSize: "18px", fontWeight: "600" }}>{info?.version || "Unknown"}</p>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ color: "#8b949e", fontSize: "14px", marginBottom: "0.5rem" }}>Server JAR</p>
          <p style={{ fontSize: "18px", fontWeight: "600", fontFamily: "monospace" }}>{info?.serverJar || "Unknown"}</p>
        </div>
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#0d1117", borderRadius: "4px", borderLeft: "3px solid #1f6feb" }}>
          <p style={{ color: "#8b949e", fontSize: "14px" }}>
            To change the loader or version, update your server jar file and the <code style={{ color: "#58a6ff" }}>version</code> field in <code style={{ color: "#58a6ff" }}>server.properties</code>, then restart the server.
            Download links will be available once configured by the server owner.
          </p>
        </div>
      </div>
    </div>
  );
}
