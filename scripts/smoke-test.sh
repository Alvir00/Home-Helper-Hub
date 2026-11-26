#!/usr/bin/env bash
# End-to-end smoke test against a running Meraki instance.
#
#   BASE_URL=http://127.0.0.1:8080 ./scripts/smoke-test.sh
#   ADMIN_EMAIL=... ADMIN_PASSWORD=... CHECK_WEB=1 ./scripts/smoke-test.sh
#
# Creates one throwaway household account and one cancelled booking. Requires
# curl and jq. Exits non-zero on the first failed check, so CI can gate deploys.

set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8080}"
API="$BASE_URL/api"
JAR="$(mktemp)"
ADMIN_JAR="$(mktemp)"
trap 'rm -f "$JAR" "$ADMIN_JAR"' EXIT

pass=0
ok() { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass + 1)); }
fail() { printf '  \033[31m✗\033[0m %s\n' "$1"; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1"; exit 1; }; }

need curl
need jq

echo "Smoke testing $BASE_URL"

# ── Liveness and readiness ───────────────────────────────────────────────────
[ "$(curl -fsS "$API/healthz" | jq -r .status)" = "ok" ] || fail "healthz"
ok "healthz returns ok"
[ "$(curl -fsS "$API/readyz" | jq -r .status)" = "ok" ] || fail "readyz"
ok "readyz returns ok (database reachable)"

# ── Public catalogue ─────────────────────────────────────────────────────────
SERVICES="$(curl -fsS "$API/services")"
[ "$(echo "$SERVICES" | jq 'length > 0')" = "true" ] || fail "no services returned"
ok "services list is populated"

WORKERS="$(curl -fsS "$API/workers")"
[ "$(echo "$WORKERS" | jq '.workers | length > 0')" = "true" ] || fail "no workers returned"
ok "worker list is populated"

read -r WORKER_ID SERVICE_ID <<EOF
$(echo "$WORKERS" | jq -r '[.workers[] | select(.services | length > 0)][0] | "\(.id) \(.services[0].id)"')
EOF
[ -n "${WORKER_ID:-}" ] && [ "$WORKER_ID" != "null" ] || fail "no worker with services"
ok "found bookable helper #$WORKER_ID (service #$SERVICE_ID)"

# ── Registration and session ─────────────────────────────────────────────────
EMAIL="smoke-$(date +%s)-$$@example.com"
REGISTER="$(curl -fsS -c "$JAR" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Smoke Test\",\"email\":\"$EMAIL\",\"password\":\"SmokeTest123!\",\"phone\":\"+251911000000\"}" \
  "$API/auth/register")"
[ "$(echo "$REGISTER" | jq -r .user.email)" = "$EMAIL" ] || fail "registration response"
ok "household registration"

[ "$(curl -fsS -b "$JAR" "$API/users/me" | jq -r .email)" = "$EMAIL" ] || fail "session cookie"
ok "session cookie authenticates /users/me"

# ── Booking lifecycle ────────────────────────────────────────────────────────
# Far enough ahead to avoid demo bookings, but still a valid future slot.
SCHEDULED="$(node -e 'const d = new Date(Date.now() + (200 + Math.floor(Math.random() * 60)) * 864e5); d.setUTCHours(8 + Math.floor(Math.random() * 9), 0, 0, 0); console.log(d.toISOString())')"
BOOKING="$(curl -fsS -b "$JAR" \
  -H 'Content-Type: application/json' \
  -d "{\"workerId\":$WORKER_ID,\"serviceId\":$SERVICE_ID,\"scheduledDate\":\"$SCHEDULED\",\"address\":\"Bole, smoke test address\",\"notes\":\"smoke-test\"}" \
  "$API/bookings")"
BOOKING_ID="$(echo "$BOOKING" | jq -r .id)"
[ "$(echo "$BOOKING" | jq -r .status)" = "pending" ] || fail "new booking status"
ok "booking created (#$BOOKING_ID)"

[ "$(curl -fsS -b "$JAR" "$API/bookings" | jq --argjson id "$BOOKING_ID" '[.bookings[] | select(.id == $id)] | length')" = "1" ] \
  || fail "booking missing from list"
ok "booking appears in the household list"

CANCELLED="$(curl -fsS -b "$JAR" -X PATCH \
  -H 'Content-Type: application/json' \
  -d '{"status":"cancelled"}' \
  "$API/bookings/$BOOKING_ID")"
[ "$(echo "$CANCELLED" | jq -r .status)" = "cancelled" ] || fail "booking cancellation"
ok "booking cancelled"

# ── Authorisation boundaries ─────────────────────────────────────────────────
[ "$(curl -s -o /dev/null -w '%{http_code}' "$API/bookings")" = "401" ] || fail "unauthenticated booking list"
ok "anonymous booking list is rejected (401)"

[ "$(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" "$API/dashboard/admin/summary")" = "403" ] || fail "household reached admin API"
ok "household cannot reach admin API (403)"

# ── Optional admin path ──────────────────────────────────────────────────────
if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  curl -fsS -c "$ADMIN_JAR" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
    "$API/auth/login" >/dev/null
  curl -fsS -b "$ADMIN_JAR" "$API/dashboard/admin/summary" >/dev/null || fail "admin summary"
  ok "admin sign-in and dashboard summary"

  curl -fsS -b "$ADMIN_JAR" "$API/dashboard/admin/worker-applications" >/dev/null || fail "admin applications"
  ok "admin can list helper applications"
fi

# ── Optional static web app ──────────────────────────────────────────────────
if [ "${CHECK_WEB:-0}" = "1" ]; then
  curl -fsS "$BASE_URL/" | grep -qi "Meraki" || fail "home page"
  ok "home page renders"
  curl -fsS "$BASE_URL/sitemap.xml" | grep -q "<urlset" || fail "sitemap"
  ok "sitemap.xml is served"
  curl -fsS "$BASE_URL/robots.txt" | grep -q "Sitemap:" || fail "robots.txt"
  ok "robots.txt points at the sitemap"
fi

# ── Logout ───────────────────────────────────────────────────────────────────
curl -fsS -b "$JAR" -X POST "$API/auth/logout" >/dev/null || fail "logout"
[ "$(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" "$API/users/me")" = "401" ] || fail "session survived logout"
ok "logout clears the session"

echo ""
echo "All $pass checks passed."
