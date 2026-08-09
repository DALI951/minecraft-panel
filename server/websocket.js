const jwt = require("jsonwebtoken");
const config = require("./config");
const { tailLog } = require("./services/log");
const rcon = require("./services/rcon");

function handleConsole(ws, req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    ws.close(4001, "No token");
    return;
  }

  try {
    jwt.verify(token, config.jwtSecret);
  } catch {
    ws.close(4001, "Invalid token");
    return;
  }

  const tail = tailLog(
    (line) => {
      ws.send(JSON.stringify({ type: "log", line }));
    },
    (err) => {
      ws.send(JSON.stringify({ type: "error", line: err.message }));
    }
  );

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "command" && msg.command) {
        const response = await rcon.send(msg.command);
        ws.send(JSON.stringify({ type: "response", line: response }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", line: err.message }));
    }
  });

  ws.on("close", () => {
    if (tail) tail.kill();
  });
}

module.exports = { handleConsole };
