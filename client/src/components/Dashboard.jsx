import { useState, useEffect } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const data = await api("/api/server/status");
      setStatus(data);
    } catch {
      setStatus({ online: false, error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  }

  async function sendCommand(action) {
    try {
      await api(`/api/server/${action}`, { method: "POST" });
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "24px" }}>Dashboard</h1>
      <div style={{ background: "#1a1d23", borderRadius: "8px", padding: "1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: status?.online ? "#3fb950" : "#f85149" }} />
          <span style={{ fontSize: "18px", fontWeight: "600" }}>{status?.online ? "Online" : "Offline"}</span>
        </div>
        {status?.online && (
          <div style={{ color: "#8b949e", fontSize: "14px" }}>
            <p>Players: {status.onlinePlayers} / {status.maxPlayers}</p>
            {status.motd && <p>MOTD: {status.motd}</p>}
          </div>
        )}
        {status?.error && <p style={{ color: "#f85149", fontSize: "14px" }}>{status.error}</p>}
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={() => sendCommand("start")} style={btnStyle("#238636")}>Start</button>
        <button onClick={() => sendCommand("stop")} style={btnStyle("#da3633")}>Stop</button>
        <button onClick={() => sendCommand("restart")} style={btnStyle("#1f6feb")}>Restart</button>
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: "0.5rem 1.5rem",
  background: bg,
  border: "none",
  borderRadius: "4px",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
});
