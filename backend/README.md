# FastComanda Backend

API REST para o sistema FastComanda - Gerenciamento de Comandas para Restaurantes.

## 🛠️ Tecnologias

- Node.js
- Express
- MySQL
- JWT (autenticação)
- Bcryptjs (criptografia)
- Expo Server SDK (notificações push)

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v5.7 ou superior)
- npm ou yarn

## ⚙️ Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar banco de dados

Crie o banco de dados MySQL:

```bash
mysql -u root -p < schema.sql
```

Ou execute manualmente:

```sql
mysql -u root -p
source schema.sql
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=fastcomanda
JWT_SECRET=seu_secret_jwt_seguro
```

### 4. Iniciar o servidor

**Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📚 Endpoints da API

### Autenticação

**POST** `/api/auth/register`
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**GET** `/api/auth/profile` (requer token)

### Produtos

**GET** `/api/produtos` - Listar produtos
**GET** `/api/produtos/:id` - Buscar produto
**POST** `/api/produtos` - Criar produto
**PUT** `/api/produtos/:id` - Atualizar produto
**PATCH** `/api/produtos/:id/estoque` - Atualizar estoque

### Clientes

**GET** `/api/clientes` - Listar clientes
**GET** `/api/clientes/:id` - Buscar cliente
**POST** `/api/clientes` - Criar cliente
**PUT** `/api/clientes/:id` - Atualizar cliente
**DELETE** `/api/clientes/:id` - Deletar cliente

### Comandas

**GET** `/api/comandas` - Listar comandas
**GET** `/api/comandas/dashboard` - Estatísticas do dia
**GET** `/api/comandas/:id` - Buscar comanda
**POST** `/api/comandas` - Criar comanda
**POST** `/api/comandas/:id/itens` - Adicionar item
**PATCH** `/api/comandas/:id/finalizar` - Finalizar comanda

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens). Após o login, inclua o token no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 📱 Notificações Push

O sistema envia notificações quando:
- Estoque de um produto fica abaixo do mínimo

Para receber notificações, o app mobile deve enviar o `expoPushToken` no login.

## 🗄️ Estrutura do Banco de Dados

- **usuarios** - Usuários do sistema
- **clientes** - Clientes do restaurante
- **produtos** - Produtos disponíveis
- **comandas** - Comandas/pedidos
- **comandas_itens** - Itens de cada comanda

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente
2. Use PM2 para gerenciar o processo:

```bash
npm install -g pm2
pm2 start server.js --name fastcomanda-api
pm2 save
pm2 startup
```

## 📝 Licença

Este projeto foi desenvolvido por Kayck Moreira Amaral.
