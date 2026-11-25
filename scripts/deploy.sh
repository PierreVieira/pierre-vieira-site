#!/usr/bin/env bash
# Deploys the site: runs `npx wrangler deploy` and tries again when the Cloudflare API rate limits it.
# Wrangler gives up on the first rate-limited request (code 971), which fails a deploy that a short wait would have
# let through. Any other failure (a résumé that doesn't compile, a bad config) ends at once.
# On a terminal Wrangler runs as it is, with its prompts and no new tries: reading its output would take the
# terminal from it, and whoever is there can run the deploy again.
# Arguments go to `wrangler deploy` as they are. DEPLOY_RETRY_WAITS holds the seconds to wait before each new try.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

if [[ -t 1 ]]; then
  exec npx wrangler deploy "$@"
fi

WAITS_SPEC="${DEPLOY_RETRY_WAITS:-30 60}"
if [[ ! "$WAITS_SPEC" =~ ^[0-9[:space:]]*$ ]]; then
  echo "deploy: DEPLOY_RETRY_WAITS must be whole seconds separated by spaces, not '$WAITS_SPEC'" >&2
  exit 1
fi
read -r -a WAITS <<< "$WAITS_SPEC"
# Only the Cloudflare API's own words: the log also holds npx's and the résumé build's output.
RATE_LIMITED='code: 971|throttling your request'

LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT

try=0
while true; do
  npx wrangler deploy "$@" 2>&1 | tee "$LOG"
  status="${PIPESTATUS[0]}"
  if [[ "$status" -eq 0 ]]; then
    exit 0
  fi
  if ! grep -qE "$RATE_LIMITED" "$LOG"; then
    exit "$status"
  fi
  if [[ "$try" -ge "${#WAITS[@]}" ]]; then
    echo "deploy: still rate limited after $((try + 1)) tries" >&2
    exit "$status"
  fi
  echo "deploy: rate limited by the Cloudflare API, trying again in ${WAITS[$try]}s" >&2
  sleep "${WAITS[$try]}"
  try=$((try + 1))
done
