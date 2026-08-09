import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { setToken, getToken, api } from "./api";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Console from "./components/Console";
import ModManager from "./components/ModManager";
import WorldManager from "./components/WorldManager";
import ConfigEditor from "./components/ConfigEditor";
import LoaderSwitcher from "./components/LoaderSwitcher";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      setToken(saved);
      api("/api/auth/me")
        .then((data) => {
          if (data.authenticated) setAuthed(true);
          else localStorage.removeItem("token");
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function handleLogin(token) {
    setToken(token);
    localStorage.setItem("token", token);
    setAuthed(true);
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("token");
    setAuthed(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/console" element={<Console />} />
        <Route path="/mods" element={<ModManager />} />
        <Route path="/worlds" element={<WorldManager />} />
        <Route path="/config" element={<ConfigEditor />} />
        <Route path="/loader" element={<LoaderSwitcher />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
