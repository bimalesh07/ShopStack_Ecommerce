#!/bin/sh

# Neon Cloud Database targeted. Skipping local wait logic...
echo "Starting entrypoint script..."

# 1. Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "Static collection failed, but moving forward..."

# 2. Run migrations
echo "Running migrations..."
python manage.py migrate --noinput || echo "Migration failed, but keeping container alive..."

# 3. FIX: Dono Backend aur Worker ke liye Celery aur Gunicorn saath mein chalayenge
echo "Starting Celery Worker and Gunicorn Server..."

# Celery ko background mein chalao (& lagana zaroori hai)
python -m celery -A config worker --loglevel=info &

# Gunicorn ko main process bana kar chalao (Isse container zinda rahega aur Port detect hoga)
exec gunicorn config.wsgi:application --bind 0.0.0.0:10000