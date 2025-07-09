#!/bin/bash

# DK Transactions - Deploy Script
# Este script automatiza o deploy da aplicação usando Docker

set -e

echo "🚀 Iniciando deploy do DK Transactions..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker não está instalado. Instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose não está instalado. Instale o Docker Compose primeiro."
    exit 1
fi

# Parar containers existentes
log_info "Parando containers existentes..."
docker-compose down

# Limpar volumes antigos (opcional)
read -p "Deseja limpar os volumes do banco de dados? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_warn "Removendo volumes do banco de dados..."
    docker-compose down -v
fi

# Configurar arquivo .env para o backend
log_info "Configurando arquivo .env do backend..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    log_info "Arquivo .env criado a partir do .env.example"
fi

# Atualizar configurações do banco no .env
sed -i 's/DB_HOST=127.0.0.1/DB_HOST=db/' backend/.env
sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=postgres123/' backend/.env

# Construir e iniciar containers
log_info "Construindo e iniciando containers..."
docker-compose up -d --build

# Aguardar o banco de dados ficar pronto
log_info "Aguardando banco de dados ficar pronto..."
sleep 30

# Executar migrações
log_info "Executando migrações do banco de dados..."
docker-compose exec backend php artisan migrate --force

# Executar seeders
log_info "Executando seeders..."
docker-compose exec backend php artisan db:seed --force

# Verificar status dos containers
log_info "Verificando status dos containers..."
docker-compose ps

# Mostrar logs se houver problemas
if [ $? -ne 0 ]; then
    log_error "Alguns containers não estão rodando corretamente."
    log_info "Logs dos containers:"
    docker-compose logs
    exit 1
fi

# Informações finais
log_info "✅ Deploy concluído com sucesso!"
echo
echo "🌐 Aplicação disponível em:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost/api"
echo "   - Banco de dados: localhost:5432"
echo
echo "📊 Para monitorar os logs:"
echo "   docker-compose logs -f"
echo
echo "🔄 Para reiniciar a aplicação:"
echo "   docker-compose restart"
echo
echo "🛑 Para parar a aplicação:"
echo "   docker-compose down"