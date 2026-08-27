# Minecraft Panel

A **self-hosted Minecraft server control panel** — manage a server over **SSH/SFTP + RCON** from a slick web UI.

> Node.js (Express + SSH2 + rcon-client) backend · Vite React client · JWT auth

---

## What it does

A web control panel for Dali's Minecraft servers. It connects to servers over **SSH/SFTP** (to manage files/process) and **RCON** (to send in-game commands), letting you start/stop, configure, upload/download world files, run commands and watch from the browser.

## Setup

```bash
npm install
cp .env.example .env    # set your secrets/connections
npm run setup           # one-time setup (creates admin user etc.)
npm start               # run server.js
```

The React client is in `client/` (build with `npm run build:client`, or `dev:client` during development). There's an auto-update helper (`update.sh`) and a `deploy.js`/`SETUP.md` for deployment.

## Stack

- **Backend:** Express, `ssh2` + `ssh2-sftp-client` (remote file + command), `rcon-client` (in-game commands), `jsonwebtoken` + `bcryptjs` (auth), `multer` (uploads), `ws` (live status).
- **Frontend:** React + Vite (`client/`).
- **Environments:** Node 18+, `.env` config.

## Repo layout

```
server/   Express routes + services (routes/, services/)
client/   React UI
server.js, setup.js, deploy.js
.setup: SETUP.md, .env.example, update.sh
```
