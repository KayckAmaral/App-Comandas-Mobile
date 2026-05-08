# 🚀 GUIA COMPLETO DE INSTALAÇÃO - FastComanda

Este guia detalha passo a passo como configurar e executar o projeto FastComanda.

## 📋 CHECKLIST DE PRÉ-REQUISITOS

Antes de começar, certifique-se de ter instalado:

- [ ] Node.js v14 ou superior → https://nodejs.org
- [ ] MySQL v5.7 ou superior → https://dev.mysql.com/downloads/mysql/
- [ ] Expo CLI → `npm install -g expo-cli`
- [ ] Git (opcional) → https://git-scm.com

**Para testar no celular:**
- [ ] App Expo Go (Android: Play Store | iOS: App Store)

**Para testar em emulador:**
- [ ] Android Studio (Android) → https://developer.android.com/studio
- [ ] Xcode (iOS, apenas Mac) → App Store

---

## PARTE 1: CONFIGURAR O BACKEND ⚙️

### 1.1 - Instalar Dependências do Backend

Abra o terminal na pasta do projeto:

```bash
cd fastcomanda/backend
npm install
```

Aguarde a instalação de todas as dependências.

### 1.2 - Configurar o Banco de Dados MySQL

**Opção A: Via Terminal**

```bash
# Entrar no MySQL
mysql -u root -p
# Digite sua senha quando solicitado

# Executar o script
source schema.sql

# Ou se não funcionar:
mysql -u root -p < schema.sql
```

**Opção B: Via MySQL Workbench**

1. Abra o MySQL Workbench
2. Conecte ao servidor MySQL
3. Abra o arquivo `schema.sql`
4. Execute o script (botão de raio ⚡)

**Verificar se deu certo:**

```sql
USE fastcomanda;
SHOW TABLES;
```

Deve mostrar: usuarios, clientes, produtos, comandas, comandas_itens

### 1.3 - Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env (use seu editor preferido)
nano .env
# ou
code .env
```

**Configure assim:**

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA_MYSQL_AQUI
DB_NAME=fastcomanda
DB_PORT=3306

JWT_SECRET=meu_secret_super_seguro_123456
JWT_EXPIRES_IN=7d
```

⚠️ **IMPORTANTE:** Troque `SUA_SENHA_MYSQL_AQUI` pela senha do seu MySQL!

### 1.4 - Testar o Backend

```bash
npm run dev
```

Se tudo estiver correto, você verá:

```
✅ Conectado ao MySQL com sucesso!
🍽️  FastComanda API Server
✅ Servidor rodando na porta 3000
🌐 http://localhost:3000
```

**Teste no navegador:**

Abra: http://localhost:3000

Deve retornar um JSON com a mensagem de boas-vindas.

---

## PARTE 2: CONFIGURAR O FRONTEND 📱

### 2.1 - Instalar Dependências do Frontend

**Abra um NOVO terminal** (deixe o backend rodando no outro):

```bash
cd fastcomanda/frontend
npm install
```

### 2.2 - Configurar a URL da API

**MUITO IMPORTANTE:** O app precisa saber onde está o backend.

Edite o arquivo: `frontend/src/services/api.js`

**Escolha uma opção:**

**Opção 1: Emulador Android**
```javascript
const API_URL = 'http://10.0.2.2:3000/api';
```

**Opção 2: Simulator iOS**
```javascript
const API_URL = 'http://localhost:3000/api';
```

**Opção 3: Celular Físico (RECOMENDADO)**

Primeiro, descubra o IP do seu computador:

**Windows:**
```bash
ipconfig
```
Procure por "IPv4" na seção Wi-Fi. Exemplo: 192.168.1.100

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
Procure pelo IP que começa com 192.168. Exemplo: 192.168.1.100

Depois configure:
```javascript
const API_URL = 'http://192.168.1.100:3000/api';
```

⚠️ **ATENÇÃO:** 
- Seu celular DEVE estar na mesma rede Wi-Fi do computador
- Substitua 192.168.1.100 pelo IP do SEU computador

### 2.3 - Iniciar o App

```bash
npm start
```

Você verá um QR Code no terminal e uma página web abrirá.

---

## PARTE 3: EXECUTAR NO DISPOSITIVO 📲

### Opção 1: Celular Físico (RECOMENDADO) ⭐

**Android:**
1. Instale o app "Expo Go" na Play Store
2. Abra o Expo Go
3. Escaneie o QR Code que aparece no terminal
4. Aguarde carregar (primeira vez demora mais)

**iOS:**
1. Instale o app "Expo Go" na App Store
2. Abra o app Câmera do iPhone
3. Aponte para o QR Code
4. Toque na notificação que aparecer
5. Abrirá no Expo Go

### Opção 2: Emulador Android

**Pré-requisito:** Android Studio instalado

```bash
# Iniciar emulador
# Abra o Android Studio → AVD Manager → Play em algum emulador

# Depois, no terminal do projeto:
npm run android
```

### Opção 3: Simulator iOS (apenas Mac)

**Pré-requisito:** Xcode instalado

```bash
npm run ios
```

---

## PARTE 4: TESTAR O APP ✅

### 4.1 - Fazer Login

Use as credenciais de teste (criadas pelo schema.sql):

- **Email:** admin@fastcomanda.com
- **Senha:** admin123

Ou crie uma nova conta clicando em "Cadastre-se".

### 4.2 - Testar Funcionalidades

1. **Dashboard** - Veja as estatísticas
2. **Comandas** - Crie uma nova comanda
3. **Estoque** - Atualize a quantidade de algum produto

### 4.3 - Testar Notificações Push

1. Permita notificações quando o app solicitar
2. Vá em "Estoque"
3. Escolha um produto (ex: Água Mineral)
4. Atualize para uma quantidade MENOR que o mínimo
   - Ex: Se mínimo é 30, coloque 20
5. Você deve receber uma notificação! 🔔

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ "Error: connect ECONNREFUSED"

**Causa:** Backend não está rodando ou URL está errada

**Solução:**
1. Verifique se o backend está rodando
2. Confirme a URL em `frontend/src/services/api.js`
3. Teste http://SEU_IP:3000 no navegador do celular

### ❌ "Access denied for user"

**Causa:** Senha do MySQL incorreta no .env

**Solução:**
1. Edite `backend/.env`
2. Corrija a senha do MySQL
3. Reinicie o backend

### ❌ "Network request failed"

**Causa:** Celular não consegue acessar o backend

**Solução:**
1. Certifique-se de estar na MESMA rede Wi-Fi
2. Verifique o IP do computador
3. Desative temporariamente o firewall:
   - Windows: Configurações → Firewall → Desativar
   - Mac: Preferências → Segurança → Firewall → Desativar

### ❌ "Unable to resolve module"

**Solução:**
```bash
cd frontend
rm -rf node_modules
npm install
expo start -c
```

### ❌ Notificações não funcionam

**Lembretes:**
- Notificações NÃO funcionam em emuladores
- Deve usar dispositivo físico
- Permissões devem ser concedidas

---

## 📊 VERIFICAR SE ESTÁ TUDO FUNCIONANDO

### Backend (Terminal 1)
```
✅ Conectado ao MySQL com sucesso!
✅ Servidor rodando na porta 3000
```

### Frontend (Terminal 2)
```
Metro waiting on exp://...
```

### No Navegador
- Backend: http://localhost:3000 → JSON de resposta
- Frontend: DevTools do Expo aberta

### No App
- Login funciona ✅
- Dashboard carrega dados ✅
- Comandas aparecem ✅
- Estoque atualiza ✅
- Notificações chegam ✅

---

## 🎯 DICAS IMPORTANTES

1. **Sempre deixe o backend rodando** enquanto usa o app
2. **Mesma rede Wi-Fi** é essencial para celular físico
3. **Primeira execução** demora mais para carregar
4. **Hot reload** funciona - salve os arquivos e veja as mudanças
5. **Shake o celular** para abrir o menu de desenvolvimento

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique os logs no terminal
2. Veja os erros no console do navegador
3. Shake o celular → "Debug Remote JS" para ver erros
4. Consulte a documentação:
   - Expo: https://docs.expo.dev
   - React Navigation: https://reactnavigation.org

---

## ✨ PRÓXIMOS PASSOS

Agora que está funcionando:

1. Explore todas as telas
2. Crie comandas de teste
3. Adicione novos produtos
4. Teste o fluxo completo
5. Personalize cores e estilos se quiser

**Bom desenvolvimento! 🚀**

---

Desenvolvido por **Kayck Moreira Amaral**
