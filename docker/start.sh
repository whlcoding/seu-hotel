#!/bin/sh
set -e

cd /var/www/html

if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY environment variable is required."
    echo "Generate one with: php -r \"echo 'base64:' . base64_encode(random_bytes(32));\""
    exit 1
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link --force 2>/dev/null || true

chown -R www-data:www-data storage bootstrap/cache

# Start PHP-FPM in background, then Nginx in foreground
php-fpm -D
exec nginx -g "daemon off;"
