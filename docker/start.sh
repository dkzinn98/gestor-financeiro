#!/bin/bash

# Wait for database
echo "Waiting for database..."
sleep 10

# Install dependencies if needed
if [ ! -d "vendor" ]; then
    echo "Installing composer dependencies..."
    composer install --optimize-autoloader --no-dev
fi

# Setup Laravel
if [ ! -f ".env" ]; then
    echo "Setting up Laravel..."
    cp .env.example .env
fi

# Generate app key if needed
php artisan key:generate --force

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders
echo "Running seeders..."
php artisan db:seed --force || true

# Set permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Start services
echo "Starting nginx..."
service nginx start

echo "Starting php-fpm..."
php-fpm