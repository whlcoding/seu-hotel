FROM php:8.3-cli-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    libicu-dev \
    libzip-dev \
    libonig-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    intl \
    zip \
    bcmath

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

RUN npm ci && npm run build

RUN chmod -R 775 storage bootstrap/cache \
    && chmod +x docker/start.sh

EXPOSE 8080

CMD ["docker/start.sh"]
