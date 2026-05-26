FROM php:8.3-cli-bookworm

WORKDIR /app

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    libicu-dev \
    libzip-dev \
    libonig-dev

# Extensões PHP
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    intl \
    zip \
    bcmath

# Node 22 (necessário pro Vite 8)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copia projeto
COPY . .

# Instala PHP
RUN composer install \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

# Instala Node
RUN npm ci

# Build React/Vite
RUN npm run build

# Cache Laravel
RUN php artisan optimize

# Permissões
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=10000
