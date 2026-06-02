#!/bin/sh
set -e

echo "Clearing and rebuilding caches..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Resetting database and seeding..."
php artisan migrate:fresh --seed --force

PORT="${PORT:-8080}"
echo "Starting server on 0.0.0.0:${PORT}..."
exec php -S "0.0.0.0:${PORT}" -t public
