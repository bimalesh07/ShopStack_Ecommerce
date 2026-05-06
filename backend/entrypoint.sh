#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z $DB_HOSTNAME $DB_PORT; do
  sleep 0.1
done

echo "PostgreSQL started"

python manage.py migrate
python manage.py collectstatic --noinput

exec "$@"