#!/bin/bash
set -e

echo "=== HEADZ UP Starting ==="

# Run migrations
python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear
python manage.py make_admin
python manage.py seed_data

echo "=== Starting reminder loop (every 5 min) ==="

# Background reminder loop — runs every 5 minutes
# This ensures the 2hr and at-time windows are caught accurately
(
  # Wait 30 seconds after boot before first run
  sleep 30
  while true; do
    python manage.py send_reminders >> /tmp/reminders.log 2>&1
    sleep 300   # 5 minutes
  done
) &

echo "=== Starting Gunicorn ==="
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:${PORT} \
  --workers 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
