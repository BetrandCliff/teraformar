#!/bin/bash

PROJECT="/home/teradnjo/public_html/teraformar"
NODE_ENV="/home/teradnjo/nodevenv/public_html/teraformar/22"
TRIGGER="$PROJECT/.deploy-trigger"
DEPLOYED="$PROJECT/.deployed-commit"
LOG="$PROJECT/deploy.log"
LOCK="/tmp/teraformar-deploy.lock"

if [ ! -f "$TRIGGER" ]; then
    exit 0
fi

TRIGGER_COMMIT=$(cat "$TRIGGER" 2>/dev/null)

if [ -z "$TRIGGER_COMMIT" ]; then
    exit 0
fi

if [ -f "$DEPLOYED" ] && [ "$(cat "$DEPLOYED")" = "$TRIGGER_COMMIT" ]; then
    exit 0
fi

if [ -f "$LOCK" ]; then
    exit 0
fi

touch "$LOCK"

cd "$PROJECT" || {
    rm -f "$LOCK"
    exit 1
}

echo "========================================" >> "$LOG"
echo "Deployment started: $(date)" >> "$LOG"
echo "Commit: $TRIGGER_COMMIT" >> "$LOG"

echo "Activating Node environment..." >> "$LOG"
source "$NODE_ENV/bin/activate"

if [ $? -ne 0 ]; then
    echo "Failed to activate Node environment: $(date)" >> "$LOG"
    rm -f "$LOCK"
    exit 1
fi

echo "Installing production dependencies..." >> "$LOG"
npm ci --omit=dev >> "$LOG" 2>&1

if [ $? -ne 0 ]; then
    echo "npm ci FAILED: $(date)" >> "$LOG"
    rm -f "$LOCK"
    exit 1
fi

echo "Skipping production build - build already completed in GitHub Actions." >> "$LOG"

echo "Restarting application..." >> "$LOG"
mkdir -p "$PROJECT/tmp"
touch "$PROJECT/tmp/restart.txt"

echo "$TRIGGER_COMMIT" > "$DEPLOYED"

echo "Deployment successful: $(date)" >> "$LOG"

rm -f "$LOCK"

exit 0