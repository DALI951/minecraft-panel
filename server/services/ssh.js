const { Client } = require("ssh2");
const config = require("../config");

function execCommand(command) {
  return new Promise((resolve, reject) => {
    if (!config.ssh.allowedCommands.includes(command)) {
      return reject(
        new Error(`Command not whitelisted: "${command}". Allowed: ${config.ssh.allowedCommands.join(", ")}`)
      );
    }

    const conn = new Client();
    let stdout = "";
    let stderr = "";

    conn
      .on("ready", () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          stream
            .on("close", (code) => {
              conn.end();
              if (code !== 0) {
                reject(new Error(`Command exited with code ${code}: ${stderr}`));
              } else {
                resolve(stdout);
              }
            })
            .on("data", (data) => {
              stdout += data.toString();
            })
            .stderr.on("data", (data) => {
              stderr += data.toString();
            });
        });
      })
      .on("error", reject)
      .connect({
        host: config.ssh.host,
        port: config.ssh.port,
        username: config.ssh.username,
        password: config.ssh.password || undefined,
        privateKey: config.ssh.privateKey || undefined,
      });
  });
}

module.exports = { execCommand };
