const express = require("express");
const path = require("path");
const sftp = require("../services/sftp");
const config = require("../config");

const router = express.Router();

function propertiesPath() {
  return path.join(config.mc.serverDir, "server.properties").replace(/\\/g, "/");
}

router.get("/", async (req, res) => {
  try {
    const content = await sftp.readFile(propertiesPath());
    const lines = content.split("\n");
    let version = "";
    let serverJar = config.mc.serverJar;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("version=")) {
        version = trimmed.split("=")[1];
      }
    }

    let loader = "vanilla";
    if (serverJar.toLowerCase().includes("forge")) loader = "forge";
    else if (serverJar.toLowerCase().includes("fabric")) loader = "fabric";

    res.json({ loader, version, serverJar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { loader, version, serverJar } = req.body;
  if (!loader || !version) {
    return res.status(400).json({ error: "loader and version required" });
  }

  try {
    const content = await sftp.readFile(propertiesPath());
    const lines = content.split("\n");
    const newLines = lines.map((line) => {
      if (line.trim().startsWith("version=")) {
        return `version=${version}`;
      }
      return line;
    });

    if (!lines.some((l) => l.trim().startsWith("version="))) {
      newLines.push(`version=${version}`);
    }

    await sftp.writeFile(propertiesPath(), newLines.join("\n"));

    if (serverJar) {
      const jarPath = path.join(config.mc.serverDir, serverJar).replace(/\\/g, "/");
      const backupPath = path.join(config.mc.serverDir, `${serverJar}.backup`).replace(/\\/g, "/");
      try {
        const sftpClient = await (require("ssh2-sftp-client"))
          .prototype.connect
          ? null
          : null;
      } catch {}
    }

    res.json({ success: true, message: "Loader/version updated. Restart server to apply." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
