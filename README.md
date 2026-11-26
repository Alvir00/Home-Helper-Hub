# Meraki

On-demand home cleaning and laundry for Addis Ababa. Households book vetted
helpers by the hour, pay after the job, and leave a review. Includes subscription
plans, a helper application flow, and an admin console.

The whole product — API and web app — ships as **one container** so the session
cookie works on a single origin. PostgreSQL is the only external dependency.

## Quick start (Docker)

Requirements: Docker Desktop (or Docker Engine + Compose v2).

```sh
docker compose up -d --build
```

Then open <http://localhost:8080>. Create the first admin and, for a local demo,
some helpers and reviews:

```sh
docker compose --profile tools run --rm -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD='choose-a-strong-password' -e SEED_DEMO_DATA=1 seed
```

The seed is idempotent: services and plans are always ensured, demo helpers and
reviews are added only when `SEED_DEMO_DATA=1`, and the admin is created only if
the email does not exist. **Leave `SEED_DEMO_DATA` unset on a real launch** so
customers see only real helpers.

> **Existing local database?** The project moved from `drizzle-kit push` to
> versioned migrations. A database created by `push` must be recreated once:
> `docker compose down -v && docker compose up -d --build`. There has been no
> production deployment, so nothing is lost beyond local demo data.

## What is where

| Area | Path |
|---|---|
| API (Express 5) | `artifacts/api-server/src` |
| Web app (React 19 + Vite) | `artifacts/meraki-web/src` |
| Database schema | `lib/db/src/schema` |
| SQL migrations | `lib/db/drizzle` |
| Seed / admin bootstrap | `lib/db/src/seed.ts` |
| Deployment guide | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| Caddy + backup scripts | `deploy/` |

## Common commands

```sh
docker compose logs -f app                 # follow logs
docker compose run --rm migrate            # apply pending migrations
docker compose --profile tools run --rm seed               # seed / create admin
docker compose exec db psql -U meraki      # open a database shell
./deploy/backup.sh                         # compressed SQL backup
docker compose down                        # stop (data is kept)
```

Without Docker (Node 24 + pnpm 10 + PostgreSQL 16):

```sh
pnpm install
pnpm run typecheck
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/meraki-web run dev
```

## Health checks

- `GET /api/healthz` — process is up (used by Docker and load balancers).
- `GET /api/readyz` — database reachable; returns 503 otherwise.

## Deployment

The app runs on Render, Railway, any VPS with Docker, or Replit. The full
checklist — environment variables, migrations, TLS, backups, monitoring — is in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Security notes

- Passwords are bcrypt-hashed; sessions live in PostgreSQL and are revoked on
  password reset.
- Rate limits cover login, registration, password reset, bookings, and helper
  applications.
- CSP, HSTS (at the proxy), `X-Content-Type-Options`, and a CORS allowlist are
  enabled.
- Admin access is re-checked against the database on every admin request.
- No payment card data is handled: customers pay helpers directly in cash or by
  Telebirr, and the admin console records whether a booking was paid.
