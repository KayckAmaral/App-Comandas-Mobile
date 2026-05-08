# 🍽️ FastComanda - PROJETO COMPLETO

**Desenvolvido por:** Kayck Moreira Amaral

---

## 📦 CONTEÚDO DO PROJETO

Você recebeu um projeto completo de gerenciamento de comandas para restaurantes!

### ✅ O QUE ESTÁ INCLUÍDO:

#### 🔧 Backend (Node.js + Express + MySQL)
- ✅ API REST completa
- ✅ Autenticação com JWT
- ✅ CRUD de Comandas, Produtos e Clientes
- ✅ Sistema de notificações push
- ✅ Banco de dados MySQL estruturado
- ✅ Controle de estoque automático

#### 📱 Frontend (React Native + Expo)
- ✅ App móvel completo
- ✅ 7 telas desenvolvidas
- ✅ Navegação Stack + Tab
- ✅ Persistência local (AsyncStorage)
- ✅ Notificações push
- ✅ Interface moderna e responsiva

#### 📚 Documentação
- ✅ README principal
- ✅ Guia de instalação detalhado
- ✅ Comandos rápidos
- ✅ READMEs específicos (backend/frontend)

---

## 🚀 COMO COMEÇAR - 3 PASSOS

### PASSO 1: Leia os arquivos
1. Abra `README.md` - Visão geral do projeto
2. Abra `GUIA_INSTALACAO.md` - Instruções passo a passo
3. Tenha o `COMANDOS_RAPIDOS.md` como referência

### PASSO 2: Configure o Backend
```bash
cd backend
npm install
# Configure o MySQL (veja GUIA_INSTALACAO.md)
npm run dev
```

### PASSO 3: Configure o Frontend
```bash
cd frontend
npm install
# Configure o IP da API (veja GUIA_INSTALACAO.md)
npm start
```

---

## 📋 REQUISITOS DO PROJETO ATENDIDOS

✅ **React Navigation** - Stack e Tab Navigation implementados  
✅ **Web API** - API REST própria com MySQL  
✅ **Formulários com validação** - Login, Cadastro, Comandas  
✅ **Persistência** - AsyncStorage para dados locais  
✅ **Recurso nativo** - Notificações Push (Expo Notifications)  
✅ **Design responsivo** - Interface moderna e usável  

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### 📋 Comandas
- Criar nova comanda
- Adicionar múltiplos produtos
- Selecionar cliente (opcional)
- Tipo de venda: À vista ou Fiado
- Visualizar detalhes
- Finalizar comanda

### 📦 Estoque
- Listar todos os produtos
- Ver quantidade disponível
- Atualizar manualmente
- Alertas automáticos quando estoque baixo
- Status visual (OK, Baixo, Sem Estoque)

### 📊 Dashboard
- Total de comandas do dia
- Faturamento diário
- Produtos mais vendidos
- Comandas por status
- Acesso rápido às funcionalidades

### 🔐 Autenticação
- Login com email/senha
- Cadastro de novos usuários
- JWT para sessões seguras
- Validação de formulários

---

## 📱 TELAS DO APP

1. **Login** - Autenticação
2. **Cadastro** - Registro de usuários
3. **Dashboard** - Visão geral (Tab)
4. **Comandas** - Lista de comandas (Tab)
5. **Nova Comanda** - Criar pedido (Stack)
6. **Detalhes** - Ver comanda completa (Stack)
7. **Estoque** - Gerenciar produtos (Tab)

---

## 🗄️ ESTRUTURA DE PASTAS

```
fastcomanda/
│
├── backend/                    # Servidor Node.js
│   ├── config/
│   │   └── database.js        # Conexão MySQL
│   ├── controllers/           # Lógica de negócio
│   │   ├── authController.js
│   │   ├── comandaController.js
│   │   ├── produtoController.js
│   │   └── clienteController.js
│   ├── middleware/
│   │   └── auth.js           # Autenticação JWT
│   ├── routes/               # Rotas da API
│   ├── server.js             # Servidor principal
│   ├── schema.sql            # Banco de dados
│   ├── .env.example          # Exemplo de configuração
│   └── package.json
│
├── frontend/                  # App React Native
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── routes/
│   │   │   └── index.js      # Navegação
│   │   ├── screens/          # 7 telas
│   │   └── services/
│   │       ├── api.js        # Config API
│   │       └── notifications.js
│   ├── App.js                # Raiz do app
│   ├── app.json              # Config Expo
│   └── package.json
│
├── README.md                  # Visão geral
├── GUIA_INSTALACAO.md        # Tutorial completo
└── COMANDOS_RAPIDOS.md       # Referência rápida
```

---

## 🔑 CREDENCIAIS DE TESTE

Após configurar o banco de dados:

```
Email: admin@fastcomanda.com
Senha: admin123
```

---

## ⚠️ IMPORTANTE ANTES DE COMEÇAR

1. **Instale os pré-requisitos:**
   - Node.js
   - MySQL
   - Expo CLI: `npm install -g expo-cli`

2. **Configure o MySQL:**
   - Execute o arquivo `backend/schema.sql`
   - Crie o arquivo `backend/.env` baseado no `.env.example`

3. **Configure o IP da API:**
   - Edite `frontend/src/services/api.js`
   - Use seu IP local se for testar no celular

4. **Mesma rede Wi-Fi:**
   - Celular e computador devem estar na mesma rede

---

## 📚 DOCUMENTAÇÃO COMPLETA

### Para entender o projeto:
1. `README.md` - Visão geral e tecnologias

### Para instalar e rodar:
2. `GUIA_INSTALACAO.md` - Passo a passo detalhado

### Para desenvolver:
3. `COMANDOS_RAPIDOS.md` - Comandos úteis
4. `backend/README.md` - Documentação da API
5. `frontend/README.md` - Documentação do app

---

## 🐛 SE TIVER PROBLEMAS

1. Consulte o `GUIA_INSTALACAO.md` - seção "Problemas Comuns"
2. Verifique os logs no terminal
3. Certifique-se que backend está rodando
4. Confirme que o IP está correto
5. Teste a API no navegador: http://localhost:3000

---

## 🎓 TECNOLOGIAS UTILIZADAS

**Backend:**
- Node.js, Express, MySQL
- JWT, Bcrypt, Expo Server SDK

**Frontend:**
- React Native, Expo
- React Navigation
- AsyncStorage
- Axios

---

## 📞 PRÓXIMOS PASSOS

1. Leia o `GUIA_INSTALACAO.md` completo
2. Instale os pré-requisitos
3. Configure o backend
4. Configure o frontend
5. Teste todas as funcionalidades
6. Explore o código e personalize!

---

## ✨ RECURSOS EXTRAS

- Hot reload no desenvolvimento
- Validação de formulários
- Feedback visual (loading, success, error)
- Pull-to-refresh em listas
- Modals para ações importantes
- Tratamento de erros

---

**Bom desenvolvimento! 🚀**

Qualquer dúvida, consulte a documentação incluída.

---

Desenvolvido por **Kayck Moreira Amaral**  
FastComanda © 2024
