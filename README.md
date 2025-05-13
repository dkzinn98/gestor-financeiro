# 💰 Gestor Financeiro

**Gestor Financeiro** é um sistema completo de gestão de finanças pessoais. Com ele, você pode controlar receitas e despesas, visualizar seu balanço financeiro e manter suas finanças organizadas de forma prática e moderna.

---

## 📌 Funcionalidades

- 👤 Autenticação de usuários (login e registro)  
- 📊 Dashboard com resumo financeiro  
- 📋 Cadastro de transações (receitas e despesas)  
- 🏷️ Categorização de transações  
- 🔍 Listagem e filtragem por tipo  
- 📝 Edição e exclusão de transações  
- 💹 Cálculo automático de balanço  
- 🛠️ API RESTful para integração total  
- 🎨 Interface moderna com Angular Material  
- ✅ Validações e mensagens de erro

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Angular)
- Angular 16+
- Angular Material
- TypeScript
- RxJS
- SCSS

### Backend (Laravel + PHP)
- PHP 8+
- Laravel 10+
- Eloquent ORM
- API RESTful
- Sistema de autenticação com tokens

### Banco de Dados
- PostgreSQL 14+
- Migrations e Seeders com Laravel

---

## 🚀 Como Rodar o Projeto

### 🔹 Pré-requisitos
Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) e Angular CLI  
- [PHP 8+](https://www.php.net/) e Composer  
- [PostgreSQL](https://www.postgresql.org/)

---

### 🔹 Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
```

Configure o `.env` com os dados do seu banco:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=desafio_uitec
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
```

```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

---

### 🔹 Banco de Dados (PostgreSQL)

```sql
CREATE DATABASE desafio_uitec;
```

Importe os dados iniciais (opcional):

```bash
psql -U postgres -d desafio_uitec -f banco/script.sql
```

---

### 🔹 Frontend (Angular)

```bash
cd frontend
npm install
ng serve --open
```

Acesse em: [http://localhost:4200](http://localhost:4200)

---

## 📂 Estrutura do Projeto

```
Gestor-Financeiro/
├── banco/              # Scripts SQL
├── backend/            # Código Laravel
│   ├── app/
│   │   ├── Models/     # Eloquent Models
│   │   ├── Http/       # Controllers e Middlewares
│   ├── database/       # Migrations e Seeders
│   ├── routes/         # Rotas da API
├── frontend/           # Código Angular
│   ├── src/app/
│   │   ├── components/ # Componentes
│   │   ├── services/   # Serviços
```

---

## 🌐 Endpoints da API

### 📁 Categorias

```
GET /api/categorias
```

### 💸 Transações

```
GET    /api/transacoes
GET    /api/transacoes/{id}
POST   /api/transacoes
PUT    /api/transacoes/{id}
DELETE /api/transacoes/{id}
```

---

## ❗ Possíveis Erros e Soluções

| Erro | Solução |
|------|---------|
| ❌ Erro de conexão com o banco | Verifique `.env` do backend |
| 🚫 API não responde | Verifique se o Laravel está rodando |
| ⚠️ Angular com erro | Execute `npm install` |
| 📉 Erro no balanço | Verifique `calcularResumoManualmente()` no `transacao-list.component.ts` |

---

## 📈 Melhorias Futuras

- 📱 Aplicativo mobile (React Native)
- 🔔 Notificações e lembretes
- 📤 Exportação em PDF/CSV
- 🔄 Importação de extratos bancários

---

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

---

## 💡 Desenvolvido por: Deryk Silva | @dkode.js
