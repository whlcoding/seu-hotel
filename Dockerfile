# Stage 1: Build stage (needs both PHP and Node.js)
FROM php:8.3-cli AS builder

# Install Node.js 22 and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Install PHP dependencies (--no-scripts avoids post-autoload-dump calling artisan before source is copied)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-scripts

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Copy full source (artisan is now available)
COPY . .

# Run post-install hook now that artisan exists
RUN php artisan package:discover --ansi

# Create a minimal .env so artisan works during the build
# (wayfinder:generate calls php artisan, needs APP_KEY + a valid DB driver)
RUN APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')" \
    && printf "APP_KEY=%s\nAPP_ENV=local\nDB_CONNECTION=sqlite\nDB_DATABASE=/app/database/database.sqlite\nSESSION_DRIVER=file\nCACHE_STORE=file\n" "$APP_KEY" > .env \
    && touch database/database.sqlite

# Build frontend assets (wayfinder plugin calls php artisan during this step)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: PHP runtime (lean Alpine image)
# ─────────────────────────────────────────────
FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    libzip-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        intl \
        zip \
        opcache

WORKDIR /var/www/html

# Copy application source (vendor and public/build excluded via .dockerignore)
COPY . .

# Copy built artifacts from builder
COPY --from=builder /app/vendor       ./vendor
COPY --from=builder /app/public/build ./public/build

# Remove build-time .env — runtime uses environment variables set by Render
RUN rm -f .env

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

COPY docker/nginx.conf              /etc/nginx/nginx.conf
COPY docker/supervisord.conf        /etc/supervisor/conf.d/supervisord.conf
COPY docker/start.sh                /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
