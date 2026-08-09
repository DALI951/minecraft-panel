const express = require("express");
const http = require("http");
const path = require("path");
const { WebSocketServer } = require("ws");
const config = require("./server/config");
const authMiddleware = require("./server/auth");
const { handleConsole } = require("./server/websocket");

const authRoutes = require("./server/routes/auth");
const dashboardRoutes = require("./server/routes/dashboard");
const controlRoutes = require("./server/routes/control");
const modsRoutes = require("./server/routes/mods");
const worldsRoutes = require("./server/routes/worlds");
const configRoutes = require("./server/routes/config");
const loaderRoutes = require("./server/routes/loader");

const app = express();
const server = http.createServer(app);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/server", authMiddleware, dashboardRoutes);
app.use("/api/server", authMiddleware, controlRoutes);
app.use("/api/mods", authMiddleware, modsRoutes);
app.use("/api/worlds", authMiddleware, worldsRoutes);
app.use("/api/server-properties", authMiddleware, configRoutes);
app.use("/api/loader", authMiddleware, loaderRoutes);

// Serve React frontend
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// WebSocket for live console
const wss = new WebSocketServer({ noServer: true });
server.on("upgrade", (request, socket, head) => {
  if (request.url === "/ws/console") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
wss.on("connection", handleConsole);

server.listen(config.port, () => {
  console.log(`Minecraft Panel running on http://localhost:${config.port}`);
});
