const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: process.env.JWT_SECRET || "change-me",

  ssh: {
    host: process.env.SSH_HOST || "localhost",
    port: parseInt(process.env.SSH_PORT || "22", 10),
    username: process.env.SSH_USER || "",
    password: process.env.SSH_PASSWORD || "",
    privateKey: process.env.SSH_KEY_PATH
      ? require("fs").readFileSync(process.env.SSH_KEY_PATH)
      : undefined,
    allowedCommands: (process.env.SSH_ALLOWED_COMMANDS || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
  },

  sftp: {
    host: process.env.SFTP_HOST || "localhost",
    port: parseInt(process.env.SFTP_PORT || "22", 10),
    username: process.env.SFTP_USER || "",
    password: process.env.SFTP_PASSWORD || "",
  },

  rcon: {
    host: process.env.RCON_HOST || "localhost",
    port: parseInt(process.env.RCON_PORT || "25575", 10),
    password: process.env.RCON_PASSWORD || "",
  },

  mc: {
    serverDir: process.env.MC_SERVER_DIR || "/home/user/mcserver",
    serverJar: process.env.MC_SERVER_JAR || "server.jar",
    logPath: process.env.MC_LOG_PATH || "/home/user/mcserver/logs/latest.log",
    worldDir: process.env.MC_WORLD_DIR || "world",
    modsDir: process.env.MC_MODS_DIR || "mods",
  },

  adminHashFile: path.join(__dirname, "..", "data", "admin.json"),
};

module.exports = config;
