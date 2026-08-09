const SftpClient = require("ssh2-sftp-client");
const config = require("../config");

function getClient() {
  const sftp = new SftpClient("minecraft-panel");
  return sftp.connect({
    host: config.sftp.host,
    port: config.sftp.port,
    username: config.sftp.username,
    password: config.sftp.password || undefined,
  }).then(() => sftp);
}

async function list(dirPath) {
  const sftp = await getClient();
  try {
    const list = await sftp.list(dirPath);
    return list.map((item) => ({
      name: item.name,
      type: item.type,
      size: item.size,
      modifyTime: item.modifyTime,
    }));
  } finally {
    sftp.end();
  }
}

async function upload(localPath, remotePath) {
  const sftp = await getClient();
  try {
    await sftp.put(localPath, remotePath);
  } finally {
    sftp.end();
  }
}

async function download(remotePath, localPath) {
  const sftp = await getClient();
  try {
    await sftp.get(remotePath, localPath);
  } finally {
    sftp.end();
  }
}

async function downloadBuffer(remotePath) {
  const sftp = await getClient();
  try {
    const buffer = await sftp.get(remotePath);
    return buffer;
  } finally {
    sftp.end();
  }
}

async function remove(remotePath) {
  const sftp = await getClient();
  try {
    await sftp.delete(remotePath);
  } finally {
    sftp.end();
  }
}

async function mkdir(dirPath) {
  const sftp = await getClient();
  try {
    const exists = await sftp.exists(dirPath);
    if (!exists) {
      await sftp.mkdir(dirPath, true);
    }
  } finally {
    sftp.end();
  }
}

async function rename(oldPath, newPath) {
  const sftp = await getClient();
  try {
    await sftp.rename(oldPath, newPath);
  } finally {
    sftp.end();
  }
}

async function readFile(remotePath) {
  const sftp = await getClient();
  try {
    const data = await sftp.get(remotePath);
    return data.toString();
  } finally {
    sftp.end();
  }
}

async function writeFile(remotePath, content) {
  const sftp = await getClient();
  try {
    const stream = await sftp.createWriteStream(remotePath);
    return new Promise((resolve, reject) => {
      stream.on("close", resolve);
      stream.on("error", reject);
      stream.end(content);
    });
  } finally {
    sftp.end();
  }
}

module.exports = { list, upload, download, downloadBuffer, remove, mkdir, rename, readFile, writeFile };
