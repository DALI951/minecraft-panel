import { useState, useEffect, useRef } from "react";
import { getToken } from "../api";

export default function Console() {
  const [lines, setLines] = useState([]);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/console?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setLines((prev) => [...prev.slice(-500), msg]);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  function sendCommand(e) {
    e.preventDefault();
    if (!command.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "command", command: command.trim() }));
    setLines((prev) => [...prev, { type: "input", line: `> ${command}` }]);
    setCommand("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h1 style={{ marginBottom: "1rem", fontSize: "24px" }}>Console</h1>
      <div style={{ marginBottom: "0.5rem", fontSize: "14px", color: connected ? "#3fb950" : "#f85149" }}>
        {connected ? "Connected" : "Disconnected"}
      </div>
      <div style={{ flex: 1, background: "#0d1117", border: "1px solid #30363d", borderRadius: "4px", padding: "0.75rem", overflow: "auto", fontFamily: "monospace", fontSize: "13px", marginBottom: "0.75rem" }}>
        {lines.map((msg, i) => (
          <div key={i} style={{ color: msg.type === "input" ? "#58a6ff" : msg.type === "error" ? "#f85149" : "#e1e4e8" }}>
            {msg.line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendCommand} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="RCON command..."
          style={{ flex: 1, padding: "0.5rem", background: "#0d1117", border: "1px solid #30363d", borderRadius: "4px", color: "#e1e4e8", fontFamily: "monospace", fontSize: "14px" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", background: "#238636", border: "none", borderRadius: "4px", color: "white", cursor: "pointer" }}>
          Send
        </button>
      </form>
    </div>
  );
}
