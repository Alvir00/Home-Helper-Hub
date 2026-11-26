# Deploying Meraki

This guide takes you from a GitHub repository to a live site. Meraki is one
container (API + web app) plus PostgreSQL, so any host that can run a Dockerfile
works. Pick one option below — you do not need all of them.

- [What you need](#what-you-need)
- [Environment variables](#environment-variables)
- [Option A — Render + Neon (easiest)](#option-a--render--neon-easiest)
- [Option B — Railway](#option-b--railway)
- [Option C — VPS + Caddy (cheapest long-term)](#option-c--vps--caddy-cheapest-long-term)
- [Option D — Replit](#option-d--replit)
- [First-run checklist](#first-run-checklist)
- [Backups and restore](#backups-and-restore)
- [Monitoring](#monitoring)
- [Updating and rollback](#updating-and-rollback)
- [Troubleshooting](#troubleshooting)

---

## What you need

| Thing | Why | Cost |
|---|---|---|
| GitHub repo with this code | Hosts pull from it | Free |
| PostgreSQL 16 database | All app data | Neon free tier, or ~$6/mo |
| A host (Render, Railway, or a VPS) | Runs the container | ~$5–7/mo |
| A domain (optional at first) | Professional URL + TLS | ~$10/year |
| Resend account (recommended) | Password-reset and booking emails | Free up to 3,000/mo |

You can launch on the host's own subdomain first and add the domain later.

---

## Environment variables

Set these in the host's dashboard (or in `.env` next to `docker-compose.yml` on a
VPS). Only the first two are strictly required.

| Variable | Required | Example / notes |
|---|---|---|
| `DATABASE_URL` | **Yes** | `postgres://user:pass@host:5432/meraki`. Use the **direct** (non-pooled) URL for migrations if the provider offers both. |
| `APP_URL` | **Yes** in production | `https://meraki.example.com` — no trailing slash. Used for email links, canonical tags, and sitemap URLs. |
| `PORT` | No | Defaults to `8080`; most hosts set it automatically. |
| `NODE_ENV` | No | `production` in the image. |
| `ALLOWED_ORIGINS` | No | Extra browser origins, comma-separated. Same-origin needs nothing. |
| `RESEND_API_KEY` | No | From resend.com. Without it, emails are logged and skipped. |
| `MAIL_FROM` | With Resend | `Meraki <no-reply@yourdomain.com>` — the domain must be verified in Resend. |
| `BOOKING_NOTIFY_EMAIL` | No | Operator inbox that receives every new booking. |
| `ERROR_WEBHOOK_URL` | No | Slack/Discord/Teams webhook for crash alerts (throttled to 1/min). |
| `LOG_LEVEL` | No | `info` by default; `debug` for investigations. |
| `ALLOW_UNPAID_SUBSCRIPTIONS` | No | Leave `0`. Setting `1` activates paid plans without payment — development only. |

Seed-only variables (used by `node api/seed.mjs`, never by the running app):

| Variable | Notes |
|---|---|
| `ADMIN_EMAIL` | Creates the first admin if it does not exist. |
| `ADMIN_PASSWORD` | Minimum 10 characters in production. Store it in a password manager. |
| `SEED_DEMO_DATA` | `1` adds demo helpers/reviews. Leave `0`/unset for a real launch. |

> **Never** commit `.env` files or paste secrets into chat. Rotate the admin
> password if it has ever been shared.

---

## Option A — Render + Neon (easiest)

**1. Create the database (Neon)**

1. Sign up at <https://neon.tech> and create a project in the region closest to
   your users (Frankfurt or AWS eu-central-1 for Ethiopia).
2. Copy the **connection string** (starts with `postgres://`). Keep the
   `?sslmode=require` part.

**2. Create the web service (Render)**

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, choose the repo. `render.yaml` creates the
   service automatically. (Or **New → Web Service → Docker** with
   `Dockerfile` as the path.)
3. When prompted, fill in:
   - `DATABASE_URL` — the Neon string
   - `APP_URL` — `https://<your-service>.onrender.com` for now
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` — the first admin login
   - `RESEND_API_KEY`, `MAIL_FROM`, `BOOKING_NOTIFY_EMAIL` — optional
4. Deploy. Render runs `node api/migrate.mjs` before the new version starts,
   then `node api/seed.mjs` once after the first successful deploy, and checks
   `/api/healthz`.
5. Sign in at `https://<your-service>.onrender.com/login`.

If the seed did not create the admin (for example, the password was shorter
than 10 characters), open the **Shell** tab and run it again:

```sh
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-strong-password' node api/seed.mjs
```

**3. Custom domain**

Render → Settings → Custom Domains → add `meraki.example.com`, then create the
CNAME record it shows. After TLS is active, change `APP_URL` to the custom
domain and redeploy (email links and canonical tags use it).

**If the pre-deploy command is unavailable on your plan**, run
`node api/migrate.mjs` once from the Shell before the first deploy, and after
every update that includes a migration.

---

## Option B — Railway

1. **New Project → Deploy from GitHub repo.** Railway detects the `Dockerfile`.
2. **New → Database → PostgreSQL.** Railway creates `DATABASE_URL` for you.
3. Open the app service → **Variables** and add:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `APP_URL` = `https://<generated-domain>` (update after adding a domain)
   - optional mail/alert variables from the table above
4. **Settings → Deploy → Pre-deploy command**: `node api/migrate.mjs`.
5. Deploy. Under **Settings → Networking**, generate a public domain.
6. Open the service **Shell** and create the admin (safe to re-run):

   ```sh
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-strong-password' node api/seed.mjs
   ```

Railway restarts the container automatically and keeps the previous deployment
available for rollback.

---

## Option C — VPS + Caddy (cheapest long-term)

Tested target: Ubuntu 24.04, 2 GB RAM (Hetzner CX22 ~€4/mo, DigitalOcean
$6/mo). You need SSH access and a domain.

**1. Point DNS at the server**

Create an `A` record for `meraki.example.com` → server IPv4 (and `AAAA` for
IPv6 if you have one).

**2. Install Docker and Caddy**

```sh
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo apt install -y caddy git ufw
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw --force enable
```

**3. Get the code and configure**

```sh
sudo mkdir -p /srv/meraki && sudo chown $USER /srv/meraki
git clone https://github.com/<you>/Home-Helper-Hub.git /srv/meraki
cd /srv/meraki
cp .env.example .env
```

Edit `/srv/meraki/.env`:

```ini
APP_URL=https://meraki.example.com
# Leave DATABASE_URL unset to use the bundled Postgres container.
# DATABASE_URL=postgres://user:pass@managed-host:5432/meraki
RESEND_API_KEY=re_xxxxxxxx
MAIL_FROM=Meraki <no-reply@meraki.example.com>
BOOKING_NOTIFY_EMAIL=bookings@meraki.example.com
```

**4. Start the stack**

```sh
docker compose up -d --build
docker compose ps          # db, migrate (exited 0), app (healthy)
```

Create the admin (one time):

```sh
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-strong-password' \
  docker compose --profile tools run --rm seed
```

**5. Put Caddy in front**

```sh
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile      # replace meraki.example.com
sudo systemctl reload caddy
```

Caddy obtains the TLS certificate automatically. Check
`https://meraki.example.com/api/readyz` returns `{"status":"ok"}`.

> The compose file binds the app to `127.0.0.1:8080` and Postgres to
> `127.0.0.1:5432`, so neither is reachable from the internet — only Caddy is.
> The bundled database uses the local demo password `meraki`. For a public
> launch, use a managed database (recommended), or change `POSTGRES_PASSWORD`
> and the matching `DATABASE_URL` in `docker-compose.yml` before the first
> start. Changing it after the volume exists requires an `ALTER USER`.

**6. Backups**

```sh
sudo mkdir -p /var/backups/meraki
sudo crontab -e
```

Add:

```cron
0 3 * * * cd /srv/meraki && BACKUP_DIR=/var/backups/meraki ./deploy/backup.sh >> /var/log/meraki-backup.log 2>&1
```

Copy backups off the server weekly (rclone, S3, or `scp`). A backup on the same
disk is not a backup.

---

## Option D — Replit

The single-container Docker path (Options A–C) is the most predictable. Use
Replit only if you are already working in its workspace, which runs each
artifact separately:

1. Use **Deploy → Reserved VM** (Autoscale does not keep the session cookie
   store warm and is not recommended).
2. Add the environment variables from the table above in **Secrets**.
3. Run `pnpm --filter @workspace/db run migrate` once from the Shell.
4. Run `pnpm --filter @workspace/db run seed` with `ADMIN_EMAIL` and
   `ADMIN_PASSWORD` set.
5. Set `APP_URL` to the deployment URL.

`WEB_DIST` is only for the single-container image; leave it unset on Replit.

---

## First-run checklist

- [ ] `https://your-domain/api/healthz` returns `{"status":"ok"}`
- [ ] `https://your-domain/api/readyz` returns `{"status":"ok"}`
- [ ] Home page loads over HTTPS with no mixed-content warnings
- [ ] Admin sign-in works, and `/admin` is reachable
- [ ] A test booking can be created and cancelled
- [ ] Password-reset email arrives (check spam; verify the Resend domain)
- [ ] `robots.txt` and `sitemap.xml` show the real domain
- [ ] Demo data is **not** present on a real launch (`SEED_DEMO_DATA` unset or `0`)
- [ ] A strong, unique admin password is set (never the local demo password)
- [ ] Backups run and a restore has been tested once

---

## Backups and restore

```sh
# Manual backup
./deploy/backup.sh                       # bundled Postgres
DATABASE_URL=postgres://... ./deploy/backup.sh   # managed Postgres (needs pg_dump)

# Restore (stops writes first)
docker compose stop app
./deploy/restore.sh backups/meraki-20261124T030000Z.sql.gz
docker compose start app
```

Backups are gzip-compressed SQL, kept 14 days by default (`RETENTION_DAYS`).
The restore script clears the `public` schema first, then replays the dump in a
single transaction, so it works on a non-empty database. Test a restore into a
scratch database at least once before launch.

---

## Monitoring

- **Uptime:** point UptimeRobot (free) or Better Stack at `/api/readyz` every
  5 minutes. `/api/healthz` only proves the process is alive; `/api/readyz`
  proves the database is reachable.
- **Errors:** set `ERROR_WEBHOOK_URL` to a Slack or Discord webhook. Fatal
  errors and unhandled rejections are posted there, throttled to one alert per
  minute.
- **Logs:** `docker compose logs -f app`; JSON logs include a request id that is
  also returned as `X-Request-Id`. Log rotation is configured in compose.
- **Disk:** `df -h` weekly on a VPS; Postgres and Docker images grow slowly.

---

## Updating and rollback

```sh
cd /srv/meraki
git pull
docker compose up -d --build      # migrations run before the new app starts
docker compose ps
```

Rollback:

```sh
git log --oneline -5
git checkout <previous-commit>
docker compose up -d --build
```

Database migrations are forward-only. If the bad release included a schema
change, restore the most recent backup **before** starting the old image.

---

## Troubleshooting

| Symptom | Check |
|---|---|
| 502 from the proxy | `docker compose ps`; `docker compose logs app`; is `/api/readyz` 503? |
| Login appears to succeed, then you are logged out | The proxy must send `X-Forwarded-Proto: https` so the session cookie is marked Secure; the app trusts one proxy hop. `APP_URL` should match the public origin exactly (https, no trailing slash) for email links. |
| Emails never arrive | `RESEND_API_KEY` set? Domain verified in Resend? `MAIL_FROM` uses that domain? Check app logs for `email was not sent`. |
| `migrate` exits non-zero | Read its logs. Common cause: `DATABASE_URL` missing or the database was created by the old `drizzle-kit push`; recreate it or baseline the first migration. |
| Admin login missing after deploy | Run the seed command with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. It is safe to re-run. |
| Subscription button says unavailable | Expected until a payment provider is connected; `ALLOW_UNPAID_SUBSCRIPTIONS=1` is development-only. |
| Images missing after an upgrade | The app now serves `.jpg` assets. Clear the CDN/browser cache; old `.png` paths are gone. |
