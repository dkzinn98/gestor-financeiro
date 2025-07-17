FROM php:8.2-fpm

<<<<<<< HEAD
# Install system dependencies
=======
# Instalar dependências (adicionando libpq-dev para PostgreSQL)
>>>>>>> e03ce5d4a7cf4749095a10ab43be224a455572d0
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    nginx \
    zip \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

<<<<<<< HEAD
# Install Composer
=======
# Instalar extensões PHP (mudando para PostgreSQL)
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Obter Composer mais recente
>>>>>>> e03ce5d4a7cf4749095a10ab43be224a455572d0
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-available/default

<<<<<<< HEAD
# Copy start script
=======
# Definir permissões
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expor porta 80
EXPOSE 80

# Script de inicialização para executar nginx e php-fpm
>>>>>>> e03ce5d4a7cf4749095a10ab43be224a455572d0
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose port
EXPOSE 80

# Start services
CMD ["/usr/local/bin/start.sh"]