const { Client } = require("ssh2");
const SftpClient = require("ssh2-sftp-client");
const fs = require("fs");
const path = require("path");

const REMOTE_HOST = "212.227.215.235";
const REMOTE_USER = "modali";
const REMOTE_PASS = "Hp9conDIhfVuBtxY";
const REMOTE_DIR = "/home/modali/minecraft-panel";

const conn = new Client();
const sftp = new SftpClient("deploy");

function log(msg) { console.log(`[DEPLOY] ${msg}`); }

async function uploadDir(localDir, remoteDir) {
  const items = fs.readdirSync(localDir);
  for (const item of items) {
    if (item === "node_modules" || item === "dist" || item === ".git" || item === "data") continue;
    const localPath = path.join(localDir, item);
    const remotePath = remoteDir + "/" + item;
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      await sftp.mkdir(remotePath);
      await uploadDir(localPath, remotePath);
    } else {
      process.stdout.write(`  Uploading ${item}...`);
      await sftp.put(localPath, remotePath);
      console.log(" done");
    }
  }
}

async function run(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      let errOut = "";
      stream.on("close", (code) => {
        if (code !== 0) reject(new Error(`Command failed (code ${code}): ${errOut}`));
        else resolve(out);
      });
      stream.on("data", (d) => { out += d; process.stdout.write(d.toString()); });
      stream.stderr.on("data", (d) => { errOut += d; });
    });
  });
}

async function main() {
  log("Connecting to server...");
  await sftp.connect({ host: REMOTE_HOST, port: 22, username: REMOTE_USER, password: REMOTE_PASS });
  log("Connected via SFTP");

  log("Creating remote directory...");
  try { await sftp.mkdir(REMOTE_DIR); } catch {}

  log("Uploading project files...");
  await uploadDir(__dirname, REMOTE_DIR);

  log("Uploading .env...");
  await sftp.put(path.join(__dirname, ".env"), REMOTE_DIR + "/.env");

  sftp.end();

  log("Connecting via SSH to install dependencies...");
  await new Promise((resolve, reject) => {
    conn.on("ready", resolve).on("error", reject).connect({
      host: REMOTE_HOST, port: 22, username: REMOTE_USER, password: REMOTE_PASS,
    });
  });

  log("Checking Node.js...");
  try { await run("node --version"); } catch {
    log("Installing Node.js...");
    await run("curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -");
    await run("sudo apt-get install -y nodejs");
  }

  log("Installing npm dependencies...");
  await run(`cd ${REMOTE_DIR} && npm install`);

  log("Installing client dependencies...");
  await run(`cd ${REMOTE_DIR}/client && npm install`);

  log("Building frontend...");
  await run(`cd ${REMOTE_DIR}/client && npm run build`);

  log("Creating admin password...");
  await run(`cd ${REMOTE_DIR} && node -e "const bcrypt = require('bcryptjs'); const fs = require('fs'); bcrypt.hash('admin123', 12).then(h => { fs.writeFileSync('data/admin.json', JSON.stringify({hash: h}, null, 2)); console.log('Admin password set'); })"`);

  log("Installing pm2...");
  await run("sudo npm install -g pm2");

  log("Starting panel with pm2...");
  try { await run(`pm2 delete minecraft-panel 2>/dev/null`); } catch {}
  await run(`cd ${REMOTE_DIR} && pm2 start server.js --name minecraft-panel`);
  await run("pm2 startup");
  await run("pm2 save");

  log("Done! Panel should be at http://modali.powerpme.com/");
  conn.end();
}

main().catch((err) => { console.error("Deploy failed:", err.message); process.exit(1); });
