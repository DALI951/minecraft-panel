const { spawn } = require("child_process");
const config = require("../config");
const fs = require("fs");

function tailLog(onLine, onError) {
  const logPath = config.mc.logPath;

  if (!fs.existsSync(logPath)) {
    onError(new Error(`Log file not found: ${logPath}`));
    return null;
  }

  const tail = spawn("tail", ["-f", "-n", "100", logPath]);
  let buffer = "";

  tail.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.trim()) onLine(line);
    }
  });

  tail.stderr.on("data", (data) => {
    onError(new Error(data.toString()));
  });

  tail.on("error", onError);

  return tail;
}

module.exports = { tailLog };
