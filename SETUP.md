# Minecraft Server Panel - Installation Guide

## Prerequisites

1. **Install Node.js** (version 18 or higher)
   - Go to https://nodejs.org
   - Download the **LTS** version
   - Run the installer, click Next through everything

2. **Verify Node.js is installed**
   - Open Terminal (Linux/Mac) or Command Prompt (Windows)
   - Type: `node --version`
   - You should see something like `v18.17.0` or higher

## Installation

1. **Download or clone the project**
   ```
   git clone https://github.com/DALI951/minecraft-panel.git minecraft-panel
   ```

2. **Open a terminal in the project folder**
   ```
   cd minecraft-panel
   ```

3. **Install dependencies**
   ```
   npm install
   cd client
   npm install
   cd ..
   ```

4. **Configure the environment**
   ```
   cp .env.example .env
   ```
   Then open `.env` in a text editor and fill in the values:

   ```
   PORT=3000
   JWT_SECRET=any-random-string-here-change-this

   SSH_HOST=localhost
   SSH_PORT=22
   SSH_USER=your-linux-username
   SSH_PASSWORD=your-linux-password
   SSH_ALLOWED_COMMANDS=systemctl restart mcserver,systemctl stop mcserver,systemctl start mcserver

   SFTP_HOST=localhost
   SFTP_PORT=22
   SFTP_USER=your-linux-username
   SFTP_PASSWORD=your-linux-password

   RCON_HOST=localhost
   RCON_PORT=25575
   RCON_PASSWORD=your-rcon-password

   MC_SERVER_DIR=/home/your-username/mcserver
   MC_SERVER_JAR=server.jar
   MC_LOG_PATH=/home/your-username/mcserver/logs/latest.log
   MC_WORLD_DIR=world
   MC_MODS_DIR=mods
   ```

5. **Set admin password**
   ```
   npm run setup
   ```
   Enter a password when prompted (minimum 6 characters). Remember this password - it's how you log into the panel.

6. **Build the frontend**
   ```
   npm run build:client
   ```

7. **Start the panel**
   ```
   npm start
   ```

8. **Open in browser**
   - Go to: `http://your-server-ip:3000`
   - Login with the password you set in step 5

## Keep It Running (Recommended)

The panel needs to stay running. Use one of these methods:

### Option A: PM2 (easiest)

1. Install PM2:
   ```
   npm install -g pm2
   ```

2. Start the panel:
   ```
   pm2 start server.js --name minecraft-panel
   ```

3. Auto-start on boot:
   ```
   pm2 startup
   pm2 save
   ```

4. Useful commands:
   - `pm2 status` - check if running
   - `pm2 logs minecraft-panel` - view logs
   - `pm2 restart minecraft-panel` - restart

### Option B: systemd service

1. Create file `/etc/systemd/system/minecraft-panel.service`:
   ```
   [Unit]
   Description=Minecraft Server Panel
   After=network.target

   [Service]
   Type=simple
   User=your-linux-username
   WorkingDirectory=/path/to/minecraft-panel
   ExecStart=/usr/bin/node server.js
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

2. Enable and start:
   ```
   sudo systemctl daemon-reload
   sudo systemctl enable minecraft-panel
   sudo systemctl start minecraft-panel
   ```

## Troubleshooting

- **"Admin password not configured"** - Run `npm run setup` again
- **"EACCES" or permission errors** - Make sure the SSH user has permissions to the Minecraft server directory
- **RCON not connecting** - Check that `enable-rcon=true` and `rcon.port=25575` in your `server.properties`
- **SSH commands not working** - Make sure the commands in `SSH_ALLOWED_COMMANDS` match exactly what you can run manually

## Security Notes

- The `.env` file contains passwords - never share it
- The `data/admin.json` file contains your hashed password - never share it
- Change `JWT_SECRET` to a long random string
- This panel is designed to run on the same machine as your Minecraft server
- Do not expose port 3000 to the public internet without adding HTTPS (use nginx or caddy as reverse proxy)

## How to Update the Panel (for Dali)

If Dali needs to update the frontend design or code:

1. **SSH into the server**
   ```
   ssh your-username@your-server-ip
   ```

2. **Go to the panel directory**
   ```
   cd /path/to/minecraft-panel
   ```

3. **Pull latest changes**
   ```
   git pull origin master
   ```

4. **Rebuild frontend**
   ```
   cd client && npm install && npm run build
   ```

5. **Restart panel**
   ```
   pm2 restart minecraft-panel
   ```

That's it. The owner doesn't need to do anything — Dali handles updates directly.
