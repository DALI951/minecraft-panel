import { useState, useEffect } from "react";
import { api } from "../api";

const FIELDS = {
  "level-name":           { type: "text", label: "Level Name", default: "world" },
  "level-seed":           { type: "text", label: "Level Seed", default: "" },
  "level-type":           { type: "select", label: "Level Type", options: ["minecraft:normal", "minecraft:flat", "minecraft:largebiomes", "minecraft:amplified", "minecraft:single_biome_surface"] },
  "gamemode":             { type: "select", label: "Default Gamemode", options: ["survival", "creative", "adventure", "spectator"] },
  "difficulty":           { type: "select", label: "Difficulty", options: ["peaceful", "easy", "normal", "hard"] },
  "server-port":          { type: "number", label: "Server Port", default: 25565, min: 1, max: 65535 },
  "max-players":          { type: "number", label: "Max Players", default: 20, min: 1, max: 1000 },
  "view-distance":        { type: "number", label: "View Distance", default: 10, min: 2, max: 32 },
  "simulation-distance":  { type: "number", label: "Simulation Distance", default: 10, min: 2, max: 32 },
  "spawn-protection":     { type: "number", label: "Spawn Protection", default: 16, min: 0, max: 100 },
  "max-world-size":       { type: "number", label: "Max World Size", default: 29999984, min: 1 },
  "max-tick-time":        { type: "number", label: "Max Tick Time (ms)", default: 60000, min: -1 },
  "network-compression-threshold": { type: "number", label: "Compression Threshold", default: 256, min: 0 },
  "rate-limit":           { type: "number", label: "Rate Limit", default: 0, min: 0 },
  "online-mode":          { type: "toggle", label: "Online Mode" },
  "white-list":           { type: "toggle", label: "White List" },
  "pvp":                  { type: "toggle", label: "PvP" },
  "allow-flight":         { type: "toggle", label: "Allow Flight" },
  "hardcore":             { type: "toggle", label: "Hardcore" },
  "enable-command-block": { type: "toggle", label: "Command Block" },
  "enforce-whitelist":    { type: "toggle", label: "Enforce Whitelist" },
  "hide-online-players":  { type: "toggle", label: "Hide Online Players" },
  "require-resource-pack": { type: "toggle", label: "Require Resource Pack" },
  "log-ips":              { type: "toggle", label: "Log IPs" },
  "motd":                 { type: "text", label: "MOTD", default: "A Minecraft Server" },
  "resource-pack":        { type: "text", label: "Resource Pack URL", default: "" },
  "resource-pack-sha1":   { type: "text", label: "Resource Pack SHA1", default: "" },
  "resource-pack-prompt": { type: "text", label: "Resource Pack Prompt", default: "" },
  "generator-settings":   { type: "text", label: "Generator Settings (JSON)", default: "{}" },
  "text-filtering-config": { type: "text", label: "Text Filtering Config", default: "" },
};

const inputStyle = { padding: "0.4rem 0.5rem", background: "#0d1117", border: "1px solid #30363d", borderRadius: "4px", color: "#e1e4e8", fontSize: "14px", fontFamily: "monospace" };
const labelStyle = { width: "250px", fontSize: "14px", color: "#8b949e", fontFamily: "monospace", flexShrink: 0 };

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "40px", height: "22px", borderRadius: "11px", cursor: "pointer",
        background: checked ? "#238636" : "#30363d", position: "relative", transition: "background 0.2s",
      }}
    >
      <div style={{
        width: "18px", height: "18px", borderRadius: "50%", background: "white",
        position: "absolute", top: "2px", left: checked ? "20px" : "2px", transition: "left 0.2s",
      }} />
    </div>
  );
}

function FieldRow({ fieldKey, config, value, onChange }) {
  if (!config) {
    return (
      <div style={rowStyle}>
        <label style={labelStyle}>{fieldKey}</label>
        <input
          value={value || ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>
    );
  }

  if (config.type === "toggle") {
    return (
      <div style={rowStyle}>
        <label style={labelStyle}>{config.label}</label>
        <Toggle checked={value === "true"} onChange={(v) => onChange(fieldKey, v ? "true" : "false")} />
      </div>
    );
  }

  if (config.type === "select") {
    return (
      <div style={rowStyle}>
        <label style={labelStyle}>{config.label}</label>
        <select
          value={value || config.options[0]}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          style={{ ...inputStyle, flex: 1, cursor: "pointer" }}
        >
          {config.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (config.type === "number") {
    return (
      <div style={rowStyle}>
        <label style={labelStyle}>{config.label}</label>
        <input
          type="number"
          value={value || ""}
          min={config.min}
          max={config.max}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          style={{ ...inputStyle, flex: 1, maxWidth: "200px" }}
        />
      </div>
    );
  }

  return (
    <div style={rowStyle}>
      <label style={labelStyle}>{config.label}</label>
      <input
        value={value || ""}
        placeholder={config.default || ""}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        style={{ ...inputStyle, flex: 1 }}
      />
    </div>
  );
}

const rowStyle = { display: "flex", alignItems: "center", marginBottom: "0.6rem", gap: "1rem" };

export default function ConfigEditor() {
  const [props, setProps] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProps(); }, []);

  async function fetchProps() {
    try {
      const data = await api("/api/server-properties");
      setProps(data);
    } catch {
      setProps({});
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key, value) {
    setProps((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api("/api/server-properties", { method: "PUT", body: props });
      alert("Saved! Restart server to apply.");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  const knownKeys = Object.keys(FIELDS);
  const extraKeys = Object.keys(props).filter((k) => !FIELDS[k]);
  const allKeys = [...knownKeys, ...extraKeys];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "24px" }}>Server Properties</h1>
        <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1.5rem", background: "#238636", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "14px" }}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <div style={{ background: "#1a1d23", borderRadius: "8px", padding: "1rem" }}>
        {allKeys.map((key) => (
          <FieldRow key={key} fieldKey={key} config={FIELDS[key]} value={props[key]} onChange={handleChange} />
        ))}
      </div>
    </div>
  );
}
