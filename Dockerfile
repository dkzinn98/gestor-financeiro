FROM php:8.2-fpm

# Instalar dependências
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    nginx \
    zip \
    unzip

# Limpar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensões PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Obter Composer mais recente
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar código da aplicação
COPY ./backend /var/www/html

# Instalar dependências
WORKDIR /var/www/html
RUN composer install --optimize-autoloader --no-dev

# Configurar nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Definir permissões
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Configurar arquivo .env
RUN cp .env.example .env

# Definir variáveis de ambiente para o banco de dados SQLite
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/var/www/html/database/database.sqlite

# Configuração para SQLite
RUN touch database/database.sqlite
RUN chmod -R 777 database

# Executar apenas migrações específicas que sabemos que funcionam
RUN php artisan migrate --path=database/migrations/0001_01_01_000000_create_users_table.php --force && \
    php artisan migrate --path=database/migrations/0001_01_01_000001_create_cache_table.php --force && \
    php artisan migrate --path=database/migrations/0001_01_01_000002_create_jobs_table.php --force && \
    php artisan migrate --path=database/migrations/2025_02_03_153937_create_transacaos_table.php --force && \
    php artisan migrate --path=database/migrations/2025_02_03_183935_create_categorias_table.php --force && \
    php artisan migrate --path=database/migrations/2025_05_12_222839_create_personal_access_tokens_table.php --force

# Executar o seeder de categorias
RUN php artisan db:seed --force

# Expor porta 80
EXPOSE 80

# Script de inicialização para executar nginx e php-fpm
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh
CMD ["/usr/local/bin/start.sh"]