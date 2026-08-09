const express = require("express");
const ssh = require("../services/ssh");

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    const cmd = process.env.SSH_ALLOWED_COMMANDS.split(",").map(c => c.trim()).find(c => c.includes("start"));
    if (!cmd) return res.status(400).json({ error: "No start command configured in SSH_ALLOWED_COMMANDS" });
    const output = await ssh.execCommand(cmd);
    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stop", async (req, res) => {
  try {
    const cmd = process.env.SSH_ALLOWED_COMMANDS.split(",").map(c => c.trim()).find(c => c.includes("stop"));
    if (!cmd) return res.status(400).json({ error: "No stop command configured in SSH_ALLOWED_COMMANDS" });
    const output = await ssh.execCommand(cmd);
    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/restart", async (req, res) => {
  try {
    const cmd = process.env.SSH_ALLOWED_COMMANDS.split(",").map(c => c.trim()).find(c => c.includes("restart"));
    if (!cmd) return res.status(400).json({ error: "No restart command configured in SSH_ALLOWED_COMMANDS" });
    const output = await ssh.execCommand(cmd);
    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
