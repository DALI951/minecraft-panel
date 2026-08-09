import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/console", label: "Console" },
  { to: "/mods", label: "Mods" },
  { to: "/worlds", label: "Worlds" },
  { to: "/config", label: "Config" },
  { to: "/loader", label: "Loader" },
];

export default function Layout({ children, onLogout }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <nav style={{ width: "220px", background: "#161b22", borderRight: "1px solid #30363d", padding: "1rem", display: "flex", flexDirection: "column" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "16px", color: "#58a6ff" }}>MC Panel</h2>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              display: "block",
              padding: "0.5rem 0.75rem",
              marginBottom: "0.25rem",
              borderRadius: "4px",
              color: isActive ? "#ffffff" : "#8b949e",
              background: isActive ? "#21262d" : "transparent",
              textDecoration: "none",
              fontSize: "14px",
            })}
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={onLogout}
          style={{ marginTop: "auto", padding: "0.5rem", background: "#da3633", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontSize: "14px" }}
        >
          Logout
        </button>
      </nav>
      <main style={{ flex: 1, padding: "1.5rem", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
