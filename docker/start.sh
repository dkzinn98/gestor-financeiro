#!/bin/bash
echo "Iniciando aplicacao..."
cd /var/www/html
service nginx start
php-fpm
