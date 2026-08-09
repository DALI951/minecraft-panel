const { Rcon } = require("rcon-client");
const config = require("../config");

let cachedClient = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const client = await Rcon.connect({
    host: config.rcon.host,
    port: config.rcon.port,
    password: config.rcon.password,
  });
  cachedClient = client;
  client.on("error", () => {
    cachedClient = null;
  });
  client.on("end", () => {
    cachedClient = null;
  });
  return client;
}

async function send(command) {
  const client = await getClient();
  const response = await client.send(command);
  return response;
}

async function getStatus() {
  try {
    const client = await getClient();
    const motd = await client.send("list");
    const playerList = await client.send("list");

    let maxPlayers = 0;
    let onlinePlayers = 0;
    let playerNames = [];

    const queryResult = await client.send("query");
    if (queryResult) {
      const lines = queryResult.split("\n");
      for (const line of lines) {
        if (line.startsWith("numplayers=")) {
          onlinePlayers = parseInt(line.split("=")[1], 10);
        }
        if (line.startsWith("maxplayers=")) {
          maxPlayers = parseInt(line.split("=")[1], 10);
        }
        if (line.startsWith("player_")) {
          const name = line.split("=")[1];
          if (name) playerNames.push(name);
        }
      }
    }

    return {
      online: true,
      motd: motd,
      onlinePlayers,
      maxPlayers,
      playerNames,
    };
  } catch {
    return { online: false, motd: "", onlinePlayers: 0, maxPlayers: 0, playerNames: [] };
  }
}

async function disconnect() {
  if (cachedClient) {
    cachedClient.end();
    cachedClient = null;
  }
}

module.exports = { send, getStatus, disconnect };
