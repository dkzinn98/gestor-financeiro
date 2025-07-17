FROM php:8.2-fpm

# Install system dependencies
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

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY backend/ /var/www/html/

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Create startup script directly in Dockerfile
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'echo "Iniciando aplicacao..."' >> /start.sh && \
    echo 'cd /var/www/html' >> /start.sh && \
    echo 'php artisan serve --host=0.0.0.0 --port=80' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 80

# Start services
CMD ["/start.sh"]