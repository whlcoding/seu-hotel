# ── Stage 1: build ────────────────────────────────────────────────────────────
# php:8.3-cli (Debian) has glibc, so the prebuilt *-linux-x64-gnu binaries
# for rolldown/lightningcss/tailwind-oxide work without compiling from source.
# Node is also installed here because the wayfinder Vite plugin calls
# `php artisan` during `npm run build`.
FROM php:8.3-cli AS builder

RUN apt-get update && apt-get install -y --no-install-recommends curl unzip \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# PHP deps first for better layer caching
# --no-scripts skips post-autoload-dump (which calls artisan) before source exists
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Node deps
COPY package*.json ./
RUN npm ci

# Full source now available — artisan can run
COPY . .
RUN php artisan package:discover --ansi

# Minimal .env so wayfinder can bootstrap Laravel during the Vite build
RUN APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')" \
    && printf "APP_KEY=%s\nAPP_ENV=local\nDB_CONNECTION=sqlite\nDB_DATABASE=/app/database/database.sqlite\nSESSION_DRIVER=file\nCACHE_STORE=file\n" "$APP_KEY" > .env \
    && touch database/database.sqlite \
    && npm run build

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx \
    libpng-dev libjpeg-turbo-dev libwebp-dev freetype-dev \
    icu-dev oniguruma-dev libzip-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif pcntl bcmath gd intl zip opcache

WORKDIR /var/www/html

# App source (vendor and public/build excluded via .dockerignore)
COPY . .
COPY --from=builder /app/vendor       ./vendor
COPY --from=builder /app/public/build ./public/build

# No .env in the image — Render injects all values as environment variables
RUN rm -f .env \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 755 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh   /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
