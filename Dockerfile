#
# Meraki — single-container image (API + built web app, Postgres external).
#
# Why one container: the session cookie is `sameSite=lax`, so a browser only
# sends it when the SPA and the API share an origin. The API process serves the
# built SPA from WEB_DIST (see artifacts/api-server/src/static.ts).
#
#   docker build -t meraki .
#   docker run -p 8080:8080 -e DATABASE_URL=... meraki
#
# Target `builder` skips the typecheck gate and drops you into an image that has
# the repo, node_modules and dist — useful for running commands by hand:
#   docker build --target builder -t meraki:builder .

FROM node:24-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54 AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true
RUN npm install -g pnpm@10
WORKDIR /app

# ── dependencies ─────────────────────────────────────────────────────────────
# Only manifests are copied here so the install layer survives source edits.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY artifacts/api-server/package.json       artifacts/api-server/
COPY artifacts/meraki-mobile/package.json    artifacts/meraki-mobile/
COPY artifacts/meraki-slides/package.json    artifacts/meraki-slides/
COPY artifacts/meraki-video/package.json     artifacts/meraki-video/
COPY artifacts/meraki-web/package.json       artifacts/meraki-web/
COPY artifacts/mockup-sandbox/package.json   artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json       lib/api-client-react/
COPY lib/api-spec/package.json               lib/api-spec/
COPY lib/api-zod/package.json                lib/api-zod/
COPY lib/db/package.json                     lib/db/
COPY lib/replit-auth-web/package.json        lib/replit-auth-web/
COPY scripts/package.json                    scripts/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── build ────────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
# Vite reads PORT and BASE_PATH at config load and throws when they are missing.
# BASE_PATH is baked into asset URLs, so it must match the public path at runtime.
ENV NODE_ENV=production \
    PORT=8080 \
    BASE_PATH=/
RUN pnpm --filter @workspace/meraki-web run build
RUN pnpm --filter @workspace/api-server run build

# ── typecheck gate ───────────────────────────────────────────────────────────
# Runs on every normal build; a type error fails the image instead of shipping.
FROM builder AS verify
RUN pnpm run typecheck

# ── schema push (one-shot, bootstrap only) ───────────────────────────────────
# Uses `push` because this repo has no generated migrations yet. Replace with
# `drizzle-kit migrate` once migrations exist — push can drop columns.
FROM builder AS migrate
CMD ["pnpm", "--filter", "@workspace/db", "run", "push-force"]

# ── runtime ──────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    PORT=8080 \
    WEB_DIST=/app/web
COPY --from=verify /app/artifacts/api-server/dist ./api
COPY --from=verify /app/artifacts/meraki-web/dist/public ./web
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||'8080')+'/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "api/index.mjs"]
