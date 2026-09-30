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

echo "Installing dependencies..." >> "$LOG"
npm ci --include=dev >> "$LOG" 2>&1

if [ $? -ne 0 ]; then
    echo "npm ci FAILED: $(date)" >> "$LOG"
    rm -f "$LOCK"
    exit 1
fi

echo "Building application..." >> "$LOG"
npm run build >> "$LOG" 2>&1

if [ $? -ne 0 ]; then
    echo "BUILD FAILED: $(date)" >> "$LOG"
    rm -f "$LOCK"
    exit 1
fi

echo "Restarting application..." >> "$LOG"
mkdir -p "$PROJECT/tmp"
touch "$PROJECT/tmp/restart.txt"

echo "$TRIGGER_COMMIT" > "$DEPLOYED"

echo "Deployment successful: $(date)" >> "$LOG"

rm -f "$LOCK"

exit 0