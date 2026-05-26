#!/bin/sh

echo "Starting Laravel production setup..."

# limpa caches antigos
php artisan optimize:clear

# gera caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# roda migrations
php artisan migrate --force

echo "Application ready"

php artisan serve \
    --host=0.0.0.0 \
    --port=10000
