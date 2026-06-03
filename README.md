# FastComanda

App mobile para gerenciamento de comandas em restaurantes — substitui anotações em papel por um fluxo digital com controle de estoque.

## Stack

- **Frontend**: React Native + Expo (SDK 54)
- **Backend**: Node.js + Express
- **Banco**: MySQL
- **Auth**: JWT + bcrypt

## Funcionalidades

- Login e cadastro de atendentes
- Criar, editar e finalizar comandas (vista/fiado)
- Cadastro e histórico de clientes
- Controle de estoque com indicador visual
- Dashboard com faturamento e produtos mais vendidos
- Relatórios

## Estrutura

```
fastcomanda/
├── backend/    API REST (Express + MySQL)
└── frontend/   App Expo (React Native)
```

## Como rodar

**1. Banco de dados** — suba o MySQL e execute `backend/schema.sql`.

**2. Backend:**
```bash
cd backend
cp .env.example .env   # preencher DB_PASSWORD e JWT_SECRET
npm install
npm run dev
```

**3. Frontend:**
```bash
cd frontend
npm install
npx expo start
```

Escaneie o QR com o Expo Go (mesma rede Wi-Fi) ou pressione `a` para Android Studio. A URL da API é detectada automaticamente — não é necessário editar nada. Libere a porta **3000** no firewall.

## Autor

Kayck Moreira Amaral — Desenvolvimento Mobile · UNOESTE
