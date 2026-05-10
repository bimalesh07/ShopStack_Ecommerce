#!/bin/sh

echo "Waiting for postgres..."

# Railway par DB_HOSTNAME aur DB_PORT variables dashboard se aayenge
while ! nc -z $DB_HOSTNAME $DB_PORT; do
  sleep 0.1
done

echo "PostgreSQL started"

# Tables banana
python manage.py migrate --noinput

# Static files collect karna (Production mein zaroori hai)
python manage.py collectstatic --noinput

# AGAR tum local pe ho toh runserver chalega, 
# AGAR cloud (Railway) pe ho toh Gunicorn chalega.
if [ "$DEBUG" = "True" ]
then
    echo "Starting Development Server..."
    exec python manage.py runserver 0.0.0.0:8000
else
    echo "Starting Production Server with Gunicorn..."
    # Railway automatically $PORT variable deta hai
    exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
fi