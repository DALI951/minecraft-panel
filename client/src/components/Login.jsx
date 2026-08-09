import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { password },
      });
      if (data.token) {
        onLogin(data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form onSubmit={handleSubmit} style={{ background: "#1a1d23", padding: "2rem", borderRadius: "8px", width: "320px" }}>
        <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>Minecraft Panel</h2>
        {error && <p style={{ color: "#f85149", marginBottom: "0.5rem" }}>{error}</p>}
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", background: "#0d1117", border: "1px solid #30363d", borderRadius: "4px", color: "#e1e4e8", fontSize: "14px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "0.5rem", background: "#238636", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "14px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
