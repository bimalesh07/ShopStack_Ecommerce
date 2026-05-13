#!/bin/sh

# Neon Cloud Database targeted. Skipping local wait logic...
echo "Starting entrypoint script..."

#  Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Static collection failed, but moving forward..."

#  Run migrations
echo "Running migrations..."
python manage.py migrate --noinput || echo "Migration failed, but keeping container alive..."

# 3. RAM bachane ke liye concurrency limit lagayi
echo "Starting Celery Worker (Limited) and Gunicorn Server..."

# --concurrency=1 lagana sabse zaroori hai, varna RAM crash ho jayegi
python -m celery -A config worker --loglevel=info --concurrency=1 &

# Gunicorn mein bhi workers kam rakho taaki RAM bache
exec gunicorn config.wsgi:application --bind 0.0.0.0:10000 --workers 1 --threads 2