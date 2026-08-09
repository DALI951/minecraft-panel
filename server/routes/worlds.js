const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sftp = require("../services/sftp");
const config = require("../config");

const router = express.Router();
const upload = multer({ dest: "/tmp/mc-panel-uploads/" });

const backupsDir = path.join(config.mc.serverDir, "backups");

router.get("/", async (req, res) => {
  try {
    const worldPath = path.join(config.mc.serverDir, config.mc.worldDir).replace(/\\/g, "/");
    const files = await sftp.list(worldPath);
    const worldFiles = files.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      modified: f.modifyTime,
    }));
    res.json(worldFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload", upload.single("world"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const worldPath = path.join(config.mc.serverDir, config.mc.worldDir).replace(/\\/g, "/");
    const remotePath = worldPath + "/" + req.file.originalname;
    await sftp.upload(req.file.path, remotePath);
    res.json({ success: true, name: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

router.get("/download/:name", async (req, res) => {
  try {
    const worldPath = path.join(config.mc.serverDir, config.mc.worldDir).replace(/\\/g, "/");
    const remotePath = worldPath + "/" + req.params.name;
    const tempPath = path.join("/tmp", req.params.name);
    await sftp.download(remotePath, tempPath);
    res.download(tempPath, req.params.name, () => {
      fs.unlinkSync(tempPath);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/backups", async (req, res) => {
  try {
    await sftp.mkdir(backupsDir.replace(/\\/g, "/"));
    const files = await sftp.list(backupsDir.replace(/\\/g, "/"));
    const backups = files
      .filter((f) => f.name.endsWith(".zip"))
      .map((f) => ({
        name: f.name,
        size: f.size,
        modified: f.modifyTime,
      }));
    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
