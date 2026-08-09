const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const dataDir = path.join(__dirname, "data");
const adminFile = path.join(dataDir, "admin.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("=== Minecraft Panel - Setup ===\n");

  const password = await ask("Enter admin password: ");
  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    rl.close();
    process.exit(1);
  }

  const confirm = await ask("Confirm password: ");
  if (password !== confirm) {
    console.error("Passwords do not match.");
    rl.close();
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  fs.writeFileSync(adminFile, JSON.stringify({ hash }, null, 2));

  console.log("\nAdmin password saved to data/admin.json");
  console.log("You can now run: npm start");
  rl.close();
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
