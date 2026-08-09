const express = require("express");
const path = require("path");
const sftp = require("../services/sftp");
const config = require("../config");

const router = express.Router();

function propertiesPath() {
  return path.join(config.mc.serverDir, "server.properties").replace(/\\/g, "/");
}

function parseProperties(content) {
  const props = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    const value = trimmed.substring(idx + 1).trim();
    props[key] = value;
  }
  return props;
}

function stringifyProperties(props) {
  return Object.entries(props)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

router.get("/", async (req, res) => {
  try {
    const content = await sftp.readFile(propertiesPath());
    const props = parseProperties(content);
    res.json(props);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const content = stringifyProperties(req.body);
    await sftp.writeFile(propertiesPath(), content);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
