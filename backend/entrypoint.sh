#!/bin/sh

# Neon Cloud Database targeted. Skipping local wait logic...
echo "Starting entrypoint script..."

# 1. Collect static files - Handles Cloudinary/WhiteNoise missing file errors safely
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Static collection failed, but moving forward..."

# 2. Run migrations - Ensures DB is updated without crashing the container
echo "Running migrations..."
python manage.py migrate --noinput || echo "Migration failed, but keeping container alive..."

# 3. Start server on Render's default port 10000
echo "Starting server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:10000