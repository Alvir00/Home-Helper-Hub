# Meraki

On-demand home help for Addis Ababa: households book vetted cleaners for home cleaning, kitchen cleaning, laundry & ironing, combined packages, and bedroom deep cleans, then track and review the job. Includes a subscription tier for repeat customers and an admin console for workers, bookings, and users.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (port 8080, `/api/*`); builds with esbuild then starts
- `pnpm --filter @workspace/meraki-web run dev` — main customer web app (port 18304, `/`)
- `pnpm --filter @workspace/meraki-mobile run dev` — Expo app (port 21448, `/meraki-mobile/`)
- `pnpm --filter @workspace/meraki-slides run dev` — pitch deck (port 25793, `/meraki-slides/`)
- `pnpm --filter @workspace/meraki-video run dev` — promo video (port 20335, `/meraki-video/`)
- `pnpm --filter @workspace/db run seed` — seed services, workers, plans, and demo users; safe to re-run (each block skips rows that already exist) and creates the admin login `admin@meraki.et` / `admin123`
- `pnpm --filter @workspace/db run push` — push Drizzle schema to Postgres (dev only)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks + Zod schemas from `openapi.yaml`
- `pnpm run typecheck` — library `tsc --build` project references, then each artifact
- `pnpm run build` — typecheck + build every package

Required env:

| Var | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | `lib/db`, drizzle-kit | Postgres connection string; both throw at import time if missing |
| `PORT` | API server, every Vite config, mobile server | Throw-on-missing in `vite.config.ts`, so dev servers will not start without it |
| `BASE_PATH` | every Vite config, mobile build/serve | Mount path of the artifact; also drives `wouter`'s router base |
| `REPL_ID` | Replit Auth OIDC | **Optional.** Only needed if you keep the Replit login path; email/password needs no OIDC config |
| `ISSUER_URL` | Replit Auth OIDC | Optional, defaults to `https://replit.com/oidc` |
| `ALLOWED_ORIGINS` | CORS in `app.ts` | Optional comma-separated allowlist. Same-host origins are always allowed; set this only for extra origins (e.g. a separate marketing domain). Leaving it empty in production means cross-origin browser calls are refused. |
| `LOG_LEVEL` | pino logger | Optional, defaults to `info` |
| `APP_URL` | password-reset links | Public base URL, e.g. `https://app.example.com`; falls back to the request host, which is wrong behind a proxy |
| `RESEND_API_KEY` | `lib/mailer.ts` | Optional. Without it, reset requests succeed but the link is only logged (never in production) |
| `MAIL_FROM` | `lib/mailer.ts` | Sender for reset email, e.g. `Meraki <no-reply@example.com>` |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9 (`tsconfig.base.json` + project references)
- API: Express 5, pino/pino-http logging, bundled to a single ESM file with esbuild
- DB: PostgreSQL 16 + Drizzle ORM, `drizzle-zod` for insert schemas, `drizzle-kit push` (no migration files)
- Validation: Zod v4 (`zod/v4`) generated from the OpenAPI spec
- API codegen: Orval (React Query client + Zod) from `lib/api-spec/openapi.yaml`
- Web: React 19 + Vite 7 + Tailwind v4 + shadcn/Radix UI, `wouter` routing, TanStack Query
- Mobile: Expo 54 / React Native 0.81 with `expo-router`
- Auth: session cookies backed by the `sessions` table. Email/password is the default (web + mobile); Replit OIDC (`openid-client`) remains available when `REPL_ID` is set, and shares the same session store.

## Where things live

- `lib/api-spec/openapi.yaml` — **source of truth for every API contract**; edit here, then run codegen
- `lib/api-spec/orval.config.ts` — codegen targets (`api-client-react` → `lib/api-client-react/src/generated`, `zod` → `lib/api-zod/src/generated`); forces `info.title: "Api"` because export paths depend on it
- `lib/db/src/schema/*` — **source of truth for the DB**: `users`, `auth` (sessions), `workers`, `services`, `bookings` (+ reviews), `subscriptions`
- `lib/db/src/seed.ts` — demo data (5 services, 5 approved workers, plans, admin + household users)
- `artifacts/api-server/src/app.ts` — Express wiring (security headers, CORS allowlist, rate limits, cookie-parser, json, `authMiddleware`, mounts `/api`)
- `artifacts/api-server/src/lib/bookingPolicy.ts` — **booking status state machine** (who may set which status)
- `artifacts/api-server/src/lib/rateLimit.ts` + `middlewares/securityHeaders.ts` — dependency-free abuse limits and API security headers
- `artifacts/api-server/src/routes/*` — one file per domain: `auth`, `replitAuth`, `users`, `services`, `workers`, `bookings`, `subscriptions`, `dashboard`, `health`
- `artifacts/api-server/src/lib/auth.ts` + `middlewares/` — OIDC session helpers, `requireAuth` / `requireAdmin` / `optionalAuth`
- `artifacts/meraki-web/src/App.tsx` — public routes, protected household routes, protected `requireAdmin` routes
- `artifacts/meraki-web/src/pages/*` — one page per route; `components/ui/*` is generated shadcn primitives
- `artifacts/meraki-mobile/app/*` — `expo-router` tree: tabs (home, book, bookings, profile), `auth`, `workers/[id]`, `bookings/[id]`
- `artifacts/meraki-slides/src/pages/slides/*` — Slide01–09 (cover, problem, solution, market, business model, social impact, traction, team, ask)
- `artifacts/meraki-video/src/components/video/*` — 5 scenes + player controls
- `artifacts/mockup-sandbox` — Replit "Canvas" component preview server (`/__mockup`), tooling only
- `scripts/post-merge.sh` — installs with a frozen lockfile and pushes the DB schema

## Architecture decisions

- **Contract-first API.** `openapi.yaml` is hand-maintained; React Query hooks (`lib/api-client-react`) and Zod validators (`lib/api-zod`) are generated. Handlers import their types from `@workspace/api-zod` rather than declaring shapes locally, so the server cannot drift from the spec without a type error.
- **Schema-first DB.** Every table lives in `lib/db` and exports a `drizzle-zod` insert schema, so "insert" validation and the Postgres DDL come from one definition. Schema changes are applied with `drizzle-kit push`, not migrations.
- **Dual auth, one session table.** Replit OIDC logins create a row in `sessions` (cookie `sid`, 7-day TTL, refreshed via refresh token); the same `sid` is also accepted as a `Bearer` token so the Expo app can reuse it after `mobile-auth/token-exchange`. `authMiddleware` populates `req.userId`/`req.userRole`, which is the bridge that lets `requireAuth`/`requireAdmin` stay auth-mechanism agnostic.
- **Each artifact deploys independently.** Every frontend reads its own `PORT`/`BASE_PATH` at config load and is served as static files under that path; the API is the only long-running service and is `/api`-prefixed. Ports and preview paths are declared in each artifact's `.replit-artifact/artifact.toml`, not in shared config.
- **API is pre-bundled, not transpiled at runtime.** `build.mjs` bundles to `dist/index.mjs` with a native-module externalization list and a CJS-compat banner; `dev` runs the same build, so dev and prod exercise identical output.

## Product

- **Browse & book**: five service packages with hourly pricing and duration; pick an approved worker, a date, and an address; bookings move `pending → confirmed → in_progress → completed` (or `cancelled`). Creating a booking requires a future slot, a worker who actually offers that service, and no overlap with the worker's active bookings; the household can only cancel — an admin advances the status from `/admin/bookings`.
- **Workers**: public profiles with bio, photo, rating, review count, completed bookings, and the services they cover.
- **Household account**: register/login, password reset by token, profile with phone/address/neighborhood, booking history, one star review per completed booking.
- **Subscriptions**: monthly plans with a bookings-per-month allowance and a discount percentage; tracks `bookingsUsed` and expiry.
- **Admin**: dashboard summary, worker approval/suspension, all bookings, all users.
- **Marketing**: pitch deck and promo video artifacts, used for fundraising rather than the product itself.

## User preferences

- Target market is Addis Ababa, Ethiopia; prices are in ETB (e.g. 150/hr home cleaning) and worker phone numbers use `+251` format.
- Brand tone is warm/terracotta ("Your home, spotless and serene"), English-language UI.

## Gotchas

- **Set `PORT` and `BASE_PATH` even for local frontend work.** Each `vite.config.ts` throws at load if either is missing — this is the most common way a dev server "fails to start".
- **Run codegen after editing `openapi.yaml`.** Generated files live in `src/generated` and are cleaned on each run; hand-editing them is lost, and a stale `lib/api-zod` breaks API typechecking.
- **Do not rename `info.title` in the spec.** Orval's config pins it to `Api` so output lands in `api.ts`; changing it breaks every import path.
- **Do not drop the `sessions` table** — it holds every login (OIDC and password); dropping it signs everyone out.
- **Booking status is not user-controlled.** Households may only `cancel` a `pending`/`confirmed` booking; `confirmed`, `in_progress`, and `completed` are admin-only and must respect the transitions in `lib/bookingPolicy.ts` (terminal states cannot be reopened). Marking a booking `completed` also increments the worker's `completedBookings`, so it is a trusted action.
- **CORS is deny-by-default outside same-host.** In production an unknown `Origin` gets no CORS headers (and a `warn` log, "Blocked cross-origin request"). Add the origin to `ALLOWED_ORIGINS` if a new browser origin must call the API; native mobile requests carry no `Origin` and are unaffected.
- **Rate limits are per-instance.** `lib/rateLimit.ts` is an in-memory fixed-window limiter, so N instances allow N× the limit — fine as abuse mitigation, not as a hard quota. Auth routes are capped separately (login 10/15min per IP+email, register 10/h, reset 5/h).
- **One session store, two transports.** `authMiddleware` resolves the `sid` cookie *or* `Authorization: Bearer <sid>` into `req.userId`/`req.userRole`; guards never inspect tokens themselves. The same `sid` is returned as `token` from login/register so the Expo app can use it, and sessions survive restarts and work across instances.
- **Password reset is DB-backed and single-use.** `password_reset_tokens` stores only a SHA-256 digest, newest link wins, links expire in an hour, and every outstanding link is deleted after use. Delivery goes through `lib/mailer.ts` (Resend via `RESEND_API_KEY`, no SDK); with no key the request still returns 200 and the link is logged outside production only.
- **`minimumReleaseAge: 1440` in `pnpm-workspace.yaml` is a deliberate supply-chain guard.** Do not set it to 0; if an urgent package is needed, add it to `minimumReleaseAgeExclude` temporarily instead.
- **After any schema change** run `pnpm --filter @workspace/db run push`, and re-run `seed` if the change affects demo data.
- **Mobile env is Replit-specific.** `meraki-mobile`'s dev script needs `REPLIT_EXPO_DEV_DOMAIN`/`REPLIT_DEV_DOMAIN`, and `app/_layout.tsx` derives the API base from `EXPO_PUBLIC_DOMAIN`; it will not talk to the API outside a Repl without those set.

## Deploying outside Replit

The app is a plain Node service plus a Vite SPA, so it runs anywhere — but it must be built on **linux-x64**, because `pnpm-workspace.yaml` overrides delete every non-Linux `esbuild`/`rollup`/`lightningcss` binary. A Docker build is the portable way to satisfy that.

- `docker build -t meraki .` — install, build web + API, then run the typecheck gate. A type error fails the image rather than shipping.
- `docker build --target builder -t meraki:builder .` — skips the gate; the image has the repo, `node_modules`, and `dist` for running commands by hand.
- `docker compose up --build` — Postgres + schema push + app on `:8080`.
- `docker compose run --rm migrate pnpm --filter @workspace/db run seed` — demo data.
- `.github/workflows/ci.yml` — on every push it runs `pnpm install --frozen-lockfile`, `pnpm run typecheck`, and both builds on `ubuntu-latest`. **This is the fastest way to compile the workspace from a Windows checkout**, which cannot install the linux-only binaries the overrides leave in the lockfile.

The container serves the SPA and `/api` from one origin (`WEB_DIST=/app/web`), which is required: the session cookie is `sameSite=lax`, so splitting the web app and API across hostnames silently breaks login. `WEB_DIST` unset disables static hosting, which is how Replit keeps working.

Sign-in works without Replit: the web app posts to `/api/auth/login` / `/api/auth/register`, the API stores a session row and sets the `sid` cookie, and `useAuth` only reads `/api/auth/user`. `REPL_ID` is needed solely if you also want the OIDC path. Password reset links are generated and emailed when `RESEND_API_KEY` is set (see `lib/mailer.ts`); with no key they are only logged outside production.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
- Each artifact's deployment/preview contract: `artifacts/<name>/.replit-artifact/artifact.toml`.
- API route list: paths in `lib/api-spec/openapi.yaml` map 1:1 to `artifacts/api-server/src/routes/`.
