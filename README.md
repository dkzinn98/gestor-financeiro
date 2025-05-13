# CRUD de Transações Financeiras

## Descrição
Aplicativo web desenvolvido para gerenciar transações financeiras, permitindo o cadastro, listagem, edição e exclusão de receitas e despesas. O projeto é composto por um frontend em Angular, backend em PHP (Laravel) e banco de dados PostgreSQL.

---

## Tecnologias Utilizadas
- **Frontend:** Angular 16+
- **Backend:** PHP (Laravel 11)
- **Banco de Dados:** PostgreSQL

---

## Estrutura do Projeto
```
banco => Scripts SQL para criação do banco de dados
backend => Código do backend (Laravel)
frontend => Código do frontend (Angular)
# Instruções para rodar o projeto

```

---

## Configuração do Banco de Dados

### 1. Criar o Banco de Dados
```sql
CREATE DATABASE desafio_uitec;
```

### 2. Executar o Script SQL
```bash
psql -U postgres -d desafio_uitec -f banco/script.sql
```

*Certifique-se de ajustar o nome do usuário e senha conforme sua configuração do PostgreSQL.*

---

## Backend (Laravel)

### 1. Navegue até a pasta do backend:
```bash
cd backend
```

### 2. Instale as dependências do Laravel:
```bash
composer install
```

### 3. Configure o arquivo `.env`:
Copie o `.env.example` para `.env` e atualize as configurações do banco de dados:
```bash
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=desafio_uitec
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
```

### 4. Gere a chave da aplicação:
```bash
php artisan key:generate
```

### 5. Rode as migrações e seeders (se aplicável):
```bash
php artisan migrate --seed
```

### 6. Inicie o servidor Laravel:
```bash
php artisan serve
```
O backend estará disponível em: [http://localhost:8000](http://localhost:8000)

---

## Frontend (Angular)

### 1. Navegue até a pasta do frontend:
```bash
cd frontend
```

### 2. Instale as dependências do Angular:
```bash
npm install
```

### 3. Inicie o servidor Angular:
```bash
ng serve
```
O frontend estará disponível em: [http://localhost:4200](http://localhost:4200)

---

## Endpoints da API

### Categorias
- `GET /api/categorias` - Listar categorias

### Transações
- `GET /api/transacoes` - Listar transações
- `POST /api/transacoes` - Criar nova transação
- `PUT /api/transacoes/{id}` - Atualizar transação existente
- `DELETE /api/transacoes/{id}` - Excluir transação

---

## Funcionalidades

- ✅ Cadastro de transações (receitas e despesas)
- ✅ Filtragem por tipo de transação
- ✅ Edição e exclusão de transações
- ✅ Validação de campos obrigatórios
- ✅ Integração com PostgreSQL

---

## Possíveis Erros e Correções
- **Erro de conexão com o banco:** Verifique o arquivo `.env` no backend.
- **API não responde:** Verifique se o servidor do Laravel está rodando.
- **Problemas no Angular:** Execute `npm install` para garantir que todas as dependências estão instaladas.

---

## Contribuições
Sinta-se à vontade para abrir issues ou enviar pull requests para melhorias.

---

## Licença
Este projeto está sob a licença MIT.

