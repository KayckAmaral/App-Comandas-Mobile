# ⚡ COMANDOS RÁPIDOS - FastComanda

Referência rápida de comandos para desenvolvimento.

## 🚀 INICIALIZAÇÃO RÁPIDA

```bash
# Terminal 1 - Backend
cd fastcomanda/backend
npm run dev

# Terminal 2 - Frontend
cd fastcomanda/frontend
npm start
```

## 📦 INSTALAÇÃO

```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install

# Instalar Expo CLI globalmente
npm install -g expo-cli
```

## 🗄️ BANCO DE DADOS

```bash
# Criar banco
mysql -u root -p < backend/schema.sql

# Acessar MySQL
mysql -u root -p

# Usar banco
USE fastcomanda;

# Ver tabelas
SHOW TABLES;

# Ver dados
SELECT * FROM usuarios;
SELECT * FROM produtos;
SELECT * FROM comandas;
```

## 🔧 BACKEND

```bash
# Desenvolvimento (auto-reload)
npm run dev

# Produção
npm start

# Testar API
curl http://localhost:3000
```

## 📱 FRONTEND

```bash
# Iniciar
npm start

# Android
npm run android

# iOS  
npm run ios

# Web (experimental)
npm run web

# Limpar cache
expo start -c

# Reinstalar dependências
rm -rf node_modules && npm install
```

## 🧪 TESTES

```bash
# Testar endpoints da API
curl http://localhost:3000/api/produtos
curl http://localhost:3000/api/clientes

# Login de teste
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fastcomanda.com","senha":"admin123"}'
```

## 🔍 DEBUG

```bash
# Ver logs do backend
# (já aparecem automaticamente no terminal)

# Ver logs do Expo
# Shake o celular → "Debug Remote JS"

# Limpar cache do Metro Bundler
expo start -c

# Reset completo
rm -rf node_modules
npm install
expo start -c
```

## 📊 MYSQL ÚTIL

```sql
-- Ver todas as comandas de hoje
SELECT * FROM comandas 
WHERE DATE(data_abertura) = CURDATE();

-- Ver produtos com estoque baixo
SELECT nome, quantidade_estoque, estoque_minimo 
FROM produtos 
WHERE quantidade_estoque <= estoque_minimo;

-- Ver total de vendas do dia
SELECT SUM(valor_total) as total_vendas 
FROM comandas 
WHERE DATE(data_abertura) = CURDATE() 
AND status = 'fechada';

-- Resetar senha de um usuário
UPDATE usuarios 
SET senha = '$2a$10$rR5vY4L4qZqZxqZ0qZqZxOYJ1kVYJ1kVYJ1kVYJ1kVYJ1kVYJ1kVY' 
WHERE email = 'admin@fastcomanda.com';
-- Senha volta a ser: admin123

-- Limpar todas as comandas (CUIDADO!)
DELETE FROM comandas_itens;
DELETE FROM comandas;
```

## 🌐 DESCOBRIR IP DO COMPUTADOR

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep "inet "

# Ou
hostname -I
```

## 🔐 CREDENCIAIS DE TESTE

```
Email: admin@fastcomanda.com
Senha: admin123
```

## 📁 ESTRUTURA DE ARQUIVOS

```
fastcomanda/
├── backend/
│   ├── config/database.js      # Conexão MySQL
│   ├── controllers/            # Lógica de negócio
│   ├── middleware/auth.js      # Autenticação JWT
│   ├── routes/                 # Rotas da API
│   ├── server.js              # Servidor Express
│   ├── schema.sql             # Estrutura do banco
│   └── .env                   # Configurações (CRIAR!)
│
└── frontend/
    ├── src/
    │   ├── contexts/AuthContext.js
    │   ├── routes/index.js
    │   ├── screens/
    │   └── services/
    │       ├── api.js         # Configurar IP aqui!
    │       └── notifications.js
    └── App.js
```

## 🛠️ CONFIGURAÇÃO MÍNIMA

### backend/.env
```env
DB_PASSWORD=sua_senha_mysql
JWT_SECRET=qualquer_string_segura
```

### frontend/src/services/api.js
```javascript
// Trocar IP conforme necessário
const API_URL = 'http://192.168.1.100:3000/api';
```

## 🚨 PROBLEMAS FREQUENTES

### Backend não conecta
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar .env
cat backend/.env
```

### Frontend não conecta
```bash
# Verificar IP
ping SEU_IP

# Testar no navegador do celular
http://SEU_IP:3000

# Desativar firewall temporariamente
```

### App não atualiza
```bash
cd frontend
expo start -c
```

## 📦 BUILD (PRODUÇÃO)

```bash
# Android (APK)
cd frontend
expo build:android

# iOS (IPA - apenas Mac)
expo build:ios

# Web
expo build:web
```

## 🗑️ LIMPAR TUDO

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .expo
npm install
expo start -c

# Banco de dados (CUIDADO!)
mysql -u root -p
DROP DATABASE fastcomanda;
# Depois rodar schema.sql novamente
```

---

## ⌨️ ATALHOS DO EXPO

Quando o Metro Bundler estiver rodando:

- `a` - Abrir no Android
- `i` - Abrir no iOS
- `w` - Abrir na Web
- `r` - Reload
- `c` - Limpar cache e reload
- `d` - Toggle development mode
- `shift+d` - Toggle performance monitor

---

**FastComanda** - Comandos Rápidos  
Desenvolvido por Kayck Moreira Amaral
