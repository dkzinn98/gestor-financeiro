@echo off
echo 🚀 Iniciando deploy do DK Transactions...

REM Verificar se Docker está rodando
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está instalado ou não está rodando!
    echo Instale o Docker Desktop e certifique-se de que está rodando.
    pause
    exit /b 1
)

echo ✅ Docker detectado!

REM Parar containers existentes
echo 📦 Parando containers existentes...
docker-compose down

REM Construir e iniciar containers
echo 🏗️ Construindo e iniciando containers...
docker-compose up -d --build

REM Aguardar containers ficarem prontos
echo ⏳ Aguardando containers ficarem prontos...
timeout /t 30 /nobreak >nul

REM Verificar status
echo 📊 Verificando status dos containers...
docker-compose ps

echo.
echo ✅ Deploy concluído!
echo.
echo 🌐 Aplicação disponível em:
echo    - Backend: http://localhost:8000
echo    - API: http://localhost:8000/api/categorias
echo    - Banco: localhost:5433
echo.
echo 📋 Comandos úteis:
echo    - Ver logs: docker-compose logs -f
echo    - Parar: docker-compose down
echo    - Reiniciar: docker-compose restart
echo.
pause