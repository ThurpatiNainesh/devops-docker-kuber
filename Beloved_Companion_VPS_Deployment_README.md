# Beloved Companion --- VPS Deployment README

## 1. Server and architecture

-   Hostinger KVM 2 VPS, IP: `200.234.46.201`
-   OS: Ubuntu 26.04.1 LTS
-   Node.js: v22.23.5; npm: 10.9.9
-   PM2: 7.1.2; Nginx: 1.28.3; Git: 2.53.0
-   Initial deployment user: `root` (we deferred creating a dedicated
    `deploy` user; migrate away from root later)

### Domains (same VPS)

  Purpose       Domain                      IP
  ------------- --------------------------- ------------------
  Frontend      `belovedcompanion.in`       `200.234.46.201`
  Frontend      `www.belovedcompanion.in`   `200.234.46.201`
  Backend API   `api-beloved.tech`          `200.234.46.201`

### Repositories / processes

Already cloned under `~/apps`:

``` text
/root/apps/
├── BACKEND/
└── BELOVED-COMPANION/
```

  Folder                App                        Port PM2 name
  --------------------- ------------------------ ------ ----------
  `BACKEND`             Backend                    3001 `bc-api`
  `BELOVED-COMPANION`   Frontend + Node server     3000 `bc-web`

Nginx receives public traffic and proxies it to the two local Node
ports. Do not expose ports 3000 or 3001 publicly.

------------------------------------------------------------------------

## 2. SSH into VPS

From your Mac Terminal:

``` bash
ssh root@200.234.46.201
```

## 3. Update OS and install tools

On the VPS:

``` bash
apt update && apt upgrade -y
apt install -y git curl nginx ufw build-essential
timedatectl set-timezone Asia/Kolkata
```

Check installed versions:

``` bash
node -v
npm -v
pm2 -v
nginx -v
git --version
```

If PM2 is not installed:

``` bash
npm install -g pm2
```

## 4. DNS

In your domain provider's DNS panel, set A records: -
`belovedcompanion.in` (host `@`) → `200.234.46.201` -
`www.belovedcompanion.in` → `200.234.46.201` - `api-beloved.tech` (its
root `@`) → `200.234.46.201`

Verify:

``` bash
dig +short belovedcompanion.in
dig +short www.belovedcompanion.in
dig +short api-beloved.tech
```

All should return `200.234.46.201`. Wait for DNS propagation before
requesting SSL.

## 5. Firewall

Allow SSH and web traffic:

``` bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw status
```

If UFW is not enabled, enable only after confirming SSH is allowed:

``` bash
ufw --force enable
```

Also allow TCP 22, 80 and 443 in Hostinger's firewall if one is active.
Keep application ports 3000 and 3001 private.

## 6. Confirm repositories

``` bash
cd ~/apps
ls -la
cd ~/apps/BACKEND && git remote -v
cd ~/apps/BELOVED-COMPANION && git remote -v
```

For private GitHub repositories, configure SSH authentication on the
VPS. Avoid embedding tokens/passwords in repository URLs.

## 7. Backend `.env`

``` bash
cd ~/apps/BACKEND
nano .env
```

Use this as a template; fill in your actual database details and retain
any additional keys your backend requires:

``` dotenv
NODE_ENV=production
PORT=3001

API_BASE_URL=https://api-beloved.tech
WEB_ORIGIN=https://www.belovedcompanion.in
ADMIN_ORIGIN=https://www.belovedcompanion.in
CORS_ORIGIN=https://www.belovedcompanion.in,https://belovedcompanion.in

DB_SYNC=false
DATABASE_URL=

DB_HOST=YOUR_DATABASE_HOST
DB_PORT=5432
DB_NAME=YOUR_DATABASE_NAME
DB_USER=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_SSL=true

JWT_SECRET=REPLACE_WITH_RANDOM_SECRET
REFRESH_TOKEN_SECRET=REPLACE_WITH_DIFFERENT_RANDOM_SECRET
ADMIN_JWT_SECRET=REPLACE_WITH_ANOTHER_RANDOM_SECRET

SUPER_ADMIN_EMAIL=YOUR_ADMIN_EMAIL
SUPER_ADMIN_PASSWORD=USE_A_STRONG_PASSWORD

ENABLE_JOBS=true
```

**Database notes:** You said you already have PostgreSQL credentials, so
use your existing DB/provider rather than creating a new database. If
`DATABASE_URL` overrides the individual `DB_*` values in your code,
ensure it is blank or correctly configured---don't leave an outdated
URL. Set SSL according to your DB provider's instructions. Keep any
additional required payment/email/SMS/AWS/etc. variables from your
application environment.

Generate three distinct random secrets (run three times, use a different
result for each):

``` bash
openssl rand -hex 32
```

Save nano: `Ctrl+O`, Enter, `Ctrl+X`. Restrict permissions:

``` bash
chmod 600 .env
```

Never commit or share `.env` contents.

## 8. Backend install and inspect scripts

``` bash
cd ~/apps/BACKEND
npm ci
node -e "const p=require('./package.json'); console.log(p.scripts)"
```

Inspect the script output and your project's migration instructions. Run
migrations only when the correct DB connection is configured and the
command exists. Run seed only when needed (usually initial setup); don't
blindly seed production.

## 9. Start backend with PM2

Assuming `server.js` is the backend entry point:

``` bash
cd ~/apps/BACKEND
pm2 start server.js --name bc-api
pm2 status
pm2 logs bc-api --lines 50
```

Exit the log view with `Ctrl+C`; this does not stop the app. Test the
backend's actual health endpoint, if implemented, for example:

``` bash
curl -i http://127.0.0.1:3001/api/health
```

If that route isn't available, use the endpoint your backend actually
provides.

## 10. Frontend `.env`

``` bash
cd ~/apps/BELOVED-COMPANION
nano .env
```

Contents:

``` dotenv
NODE_ENV=production
PORT=3000
VITE_API_BASE_URL=https://api-beloved.tech/api/v1
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Put in your actual Gemini key and save (`Ctrl+O`, Enter, `Ctrl+X`),
then:

``` bash
chmod 600 .env
```

Vite variables are embedded at build time, so changing them requires
rebuilding.

## 11. Fix `__dirname` for ES modules

Frontend `package.json` contains `"type": "module"`. In ES modules,
`__dirname` is not automatically available. The frontend previously
failed with:

``` text
ReferenceError: __dirname is not defined
```

Ensure the beginning of `server.ts` has imports and definitions like
below, without duplicate imports/declarations:

``` typescript
import { fileURLToPath } from 'node:url';
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
```

If any imports already exist, remove duplicates. Keep the rest of the
server code below these declarations.

## 12. Install and build frontend

``` bash
cd ~/apps/BELOVED-COMPANION
npm ci
npm run build
ls -la dist
```

Confirm the build produces the expected `dist/index.html` and production
server entry. The deployment command below expects `dist/server.cjs`; if
your build emits a different filename, use the actual output.

Do not keep `npm run dev` running in production. Use the built server
file.

## 13. Start frontend with PM2

After build succeeds:

``` bash
cd ~/apps/BELOVED-COMPANION
pm2 start dist/server.cjs --name bc-web
pm2 status
pm2 logs bc-web --lines 50
```

Exit logs with `Ctrl+C`.

## 14. Test both services locally

``` bash
curl -I http://127.0.0.1:3000
curl -i http://127.0.0.1:3001/api/health
pm2 status
```

The health URL may differ depending on backend routes. If a service
fails, inspect `pm2 logs` and verify its port and environment.

## 15. Configure Nginx

Create the site config:

``` bash
nano /etc/nginx/sites-available/belovedcompanion
```

Paste:

``` nginx
# Frontend
server {
    listen 80;
    server_name belovedcompanion.in www.belovedcompanion.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Backend API
server {
    listen 80;
    server_name api-beloved.tech;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

``` bash
ln -s /etc/nginx/sites-available/belovedcompanion /etc/nginx/sites-enabled/belovedcompanion
rm -f /etc/nginx/sites-enabled/default
nginx -t
```

Only if the test succeeds:

``` bash
systemctl reload nginx
systemctl status nginx --no-pager
```

At this point HTTP should work once DNS is correct and both apps are
running.

## 16. SSL / HTTPS with Certbot

Install:

``` bash
apt update
apt install -y certbot python3-certbot-nginx
```

Ensure all DNS names point to the VPS and port 80 is reachable. Then
request certificates:

``` bash
certbot --nginx -d belovedcompanion.in -d www.belovedcompanion.in -d api-beloved.tech
```

Follow prompts for email and Terms. Sharing email with EFF is
optional---choose `N` if you prefer not to receive their emails. If
asked about redirecting HTTP to HTTPS, select redirect.

Test renewal:

``` bash
certbot renew --dry-run
systemctl list-timers | grep certbot
```

## 17. PM2 reboot persistence

When both applications are working:

``` bash
pm2 save
pm2 startup
```

PM2 prints a system startup command. Copy and run the complete command
it provides. Verify:

``` bash
pm2 status
```

## 18. Final verification

-   `pm2 status` --- both `bc-api` and `bc-web` online
-   `curl -I http://127.0.0.1:3000` --- frontend responds
-   `curl` backend health route --- backend responds
-   `nginx -t` --- config valid
-   `systemctl status nginx --no-pager` --- Nginx active
-   `certbot renew --dry-run` --- renewal test succeeds

Visit: - `https://belovedcompanion.in` -
`https://www.belovedcompanion.in` - `https://api-beloved.tech` or the
API's actual health/docs route

## 19. Useful PM2 commands

  Task                        Command
  --------------------------- --------------------------------------------
  List processes              `pm2 status`
  All logs                    `pm2 logs`
  Backend logs                `pm2 logs bc-api`
  Frontend logs               `pm2 logs bc-web`
  Restart backend             `pm2 restart bc-api`
  Restart frontend            `pm2 restart bc-web`
  Restart both                `pm2 restart all`
  Stop backend                `pm2 stop bc-api`
  Stop frontend               `pm2 stop bc-web`
  Delete PM2 process          `pm2 delete bc-api` or `pm2 delete bc-web`
  Save current process list   `pm2 save`

## 20. Troubleshooting

**502 Bad Gateway:** App is down or listening on the wrong port.

``` bash
pm2 status
pm2 logs bc-api --lines 100
pm2 logs bc-web --lines 100
```

**Frontend build/blank page:** Confirm output exists and rebuild after
environment changes.

``` bash
cd ~/apps/BELOVED-COMPANION
ls -la dist
npm run build
pm2 restart bc-web
```

**Backend DB connection failure:** Verify DB
host/port/name/user/password, provider allowlist/network rules, and SSL
settings. Never paste secrets into chat.

**CORS errors:** Ensure backend allows both frontend origins exactly as
needed (including `https://`, without trailing slash, if that is what
the code expects), then restart:

``` bash
pm2 restart bc-api
```

**Nginx errors:**

``` bash
nginx -t
tail -50 /var/log/nginx/error.log
systemctl status nginx --no-pager
```

**DNS/SSL failures:**

``` bash
dig +short belovedcompanion.in
dig +short www.belovedcompanion.in
dig +short api-beloved.tech
```

Ensure they all return the VPS IP and ports 80/443 are allowed.

## 21. Future deployments

SSH:

``` bash
ssh root@200.234.46.201
```

### Backend update

``` bash
cd ~/apps/BACKEND
git pull
npm ci
# Run migrations only if required by the update and after reviewing them
pm2 restart bc-api
pm2 logs bc-api --lines 30
```

### Frontend update

``` bash
cd ~/apps/BELOVED-COMPANION
git pull
npm ci
npm run build
pm2 restart bc-web
```

Then:

``` bash
pm2 status
pm2 save
```

## 22. Security checklist

-   Keep `.env` out of Git and never share its contents.
-   Use unique, strong secrets and passwords.
-   Keep application ports 3000/3001 private; expose only SSH and web
    ports.
-   Long-term, run Node apps under a non-root deployment user rather
    than root (we deferred this during initial deployment).
-   Review dependency audit changes before applying `npm audit fix` in
    production.
-   Back up your database regularly.

## Architecture

``` text
Internet / Browser
       |
       v
  Nginx :80/:443
       |
       |-- belovedcompanion.in / www
       |       └── PM2 bc-web → Node :3000
       |
       |-- api-beloved.tech
               └── PM2 bc-api → Node :3001
                         |
                         └── Existing PostgreSQL provider
```

**Recommended deployment sequence:** DNS → environment files → backend
install/test/start → frontend environment/fix/build/start → local tests
→ Nginx → SSL → PM2 startup persistence → browser verification.
