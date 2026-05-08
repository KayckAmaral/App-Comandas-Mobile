# 🍽️ FastComanda

App mobile para gerenciamento de comandas em restaurantes e lanchonetes — substitui anotação em papel por um fluxo digital com controle de estoque em tempo real.

## Stack

- **Frontend mobile**: React Native + Expo (SDK 54)
- **Backend**: Node.js + Express
- **Banco**: MySQL
- **Autenticação**: JWT + bcrypt

## Funcionalidades

- **Login e cadastro** de usuários (atendentes).
- **Comandas**: criar, listar, ver detalhes, editar (cliente, itens, quantidades, observações), finalizar.
- **Estoque**: lista de produtos com indicador visual (OK / baixo / sem estoque) e atualização rápida da quantidade.
- **Dashboard**: total de comandas, faturamento e produtos mais vendidos do dia.
- **Navegação por swipe**: arrastar lateralmente em qualquer ponto da tela alterna entre Início, Comandas e Estoque (além dos ícones do menu inferior).
- Layout responsivo para iPhone (notch + barra de gestos) e Android, com tema vermelho pastel.

## Estrutura

```
fastcomanda/
├── backend/      API REST (Node + Express + MySQL)
└── frontend/     App Expo (React Native)
```

## Como rodar localmente

### 1. Banco de dados

Subir o MySQL local (XAMPP, MySQL Server, etc) e rodar `backend/schema.sql` para criar o schema `fastcomanda` com as tabelas e dados iniciais.

### 2. Backend

```powershell
cd backend
copy .env.example .env       # ajustar credenciais do MySQL
npm install
npm start
```

Servidor sobe na porta 3000 e imprime o IP da rede local (necessário para o app no celular físico).

### 3. Frontend

```powershell
cd frontend
npm install
npx expo start
```

- **iPhone (Expo Go)**: PC e celular na mesma rede WiFi → escanear o QR.
- **Android Studio**: tecla `a` no terminal do Expo.

A URL da API é detectada automaticamente a partir do host do Expo — não precisa editar nada.

> Em ambos os casos, libere a porta **3000** no firewall do Windows para o celular conseguir acessar o backend.

## Autor

Kayck Moreira Amaral — projeto da disciplina de Desenvolvimento Mobile.
