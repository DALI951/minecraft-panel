const express = require("express");
const multer = require("multer");
const path = require("path");
const sftp = require("../services/sftp");
const config = require("../config");

const router = express.Router();
const upload = multer({ dest: "/tmp/mc-panel-uploads/" });

router.get("/", async (req, res) => {
  try {
    const modsPath = path.join(config.mc.serverDir, config.mc.modsDir).replace(/\\/g, "/");
    const files = await sftp.list(modsPath);
    const mods = files
      .filter((f) => f.name.endsWith(".jar"))
      .map((f) => ({
        name: f.name,
        size: f.size,
        modified: f.modifyTime,
      }));
    res.json(mods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", upload.single("mod"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const modsPath = path.join(config.mc.serverDir, config.mc.modsDir).replace(/\\/g, "/");
    const remotePath = modsPath + "/" + req.file.originalname;
    await sftp.upload(req.file.path, remotePath);
    res.json({ success: true, name: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    require("fs").unlinkSync(req.file.path);
  }
});

router.delete("/:name", async (req, res) => {
  try {
    const modsPath = path.join(config.mc.serverDir, config.mc.modsDir).replace(/\\/g, "/");
    const remotePath = modsPath + "/" + req.params.name;
    await sftp.remove(remotePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
