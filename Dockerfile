FROM php:8.3-cli-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    libicu-dev \
    libzip-dev \
    libonig-dev

RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    intl \
    zip \
    bcmath

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

RUN npm ci
RUN npm run build

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080
CMD ["sh", "-c", "php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate && php -S 0.0.0.0:$PORT -t public"]
