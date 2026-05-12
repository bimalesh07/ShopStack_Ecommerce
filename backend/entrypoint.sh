#!/bin/sh

# Exit so contenir not crash
# set -e  if use this then entrypoint will not run if any error comes in migration so now not using this.

echo "Neon Cloud Database targeted. Skipping local wait logic..."

# Run migrations even erros comes
echo "Running migrations..."
python manage.py migrate --noinput || echo "Migration failed, but keeping container alive..."

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Static collection failed..."

echo "Starting server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:10000