const express = require("express");
const rcon = require("../services/rcon");

const router = express.Router();

router.get("/status", async (req, res) => {
  try {
    const status = await rcon.getStatus();
    res.json(status);
  } catch (err) {
    res.json({ online: false, error: err.message });
  }
});

module.exports = router;
