const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const config = require("../config");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  try {
    const adminData = JSON.parse(fs.readFileSync(config.adminHashFile, "utf8"));
    const valid = await bcrypt.compare(password, adminData.hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ role: "admin" }, config.jwtSecret, { expiresIn: "24h" });
    res.json({ token });
  } catch {
    res.status(500).json({ error: "Admin password not configured. Run: npm run setup" });
  }
});

router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    jwt.verify(auth.split(" ")[1], config.jwtSecret);
    res.json({ authenticated: true });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
