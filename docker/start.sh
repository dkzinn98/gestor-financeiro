#!/bin/bash

# Aguardar banco de dados ficar pronto
echo "Aguardando banco de dados..."
sleep 10

# Executar migrações se necessário
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Executando migrações..."
    php artisan migrate --force
fi

# Iniciar serviços
echo "Iniciando nginx..."
service nginx start

echo "Iniciando php-fpm..."
php-fpm