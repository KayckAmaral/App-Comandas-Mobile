# 🍽️ FastComanda

Sistema completo de gerenciamento de comandas para restaurantes, lanchonetes e estabelecimentos alimentícios.

**Desenvolvido por:** Kayck Moreira Amaral

## 📖 Sobre o Projeto

O FastComanda é uma solução moderna que elimina o uso de comandas em papel, reduz erros de anotação, acelera o atendimento e proporciona controle em tempo real do estoque.

### 🎯 Problemas Resolvidos

- ❌ Uso de papel (comandas físicas)
- ❌ Erros na anotação de pedidos
- ❌ Lentidão no atendimento
- ❌ Falta de atualização imediata do estoque

### ✨ Funcionalidades Principais

#### 📋 Comandas
- Criar nova comanda
- Selecionar cliente
- Adicionar produtos
- Definir tipo de venda (à vista ou fiado)
- Finalizar pedido
- Visualizar histórico

#### 📦 Estoque
- Listar produtos
- Visualizar quantidade disponível
- Atualizar quantidade manualmente
- Alertas de estoque baixo (notificação push)

#### 📊 Dashboard
- Total de comandas do dia
- Faturamento diário
- Produtos mais vendidos
- Acesso rápido às telas principais

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **Bcryptjs** - Criptografia de senhas
- **Expo Server SDK** - Notificações push

### Frontend (Mobile)
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação (Stack + Tab)
- **AsyncStorage** - Persistência local
- **Axios** - Cliente HTTP
- **Expo Notifications** - Push notifications

## 📋 Requisitos do Projeto Atendidos

✅ **React Navigation** com Stack e Tab Navigation  
✅ **Integração com Web API** (API REST própria)  
✅ **Formulários com validação** (login, cadastro, criação de comanda)  
✅ **Persistência de dados** (AsyncStorage)  
✅ **Recurso nativo** (Notificações Push)  
✅ **Design responsivo** e usável  

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (v14+)
- MySQL (v5.7+)
- Expo CLI
- Android Studio ou Xcode (opcional, para emuladores)

### Passo 1: Configurar o Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Criar banco de dados
mysql -u root -p < schema.sql

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar servidor
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Passo 2: Configurar o Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Configurar URL da API
# Edite frontend/src/services/api.js com o IP correto

# Iniciar o app
npm start
```

### Passo 3: Executar no Dispositivo

**Opção 1: Dispositivo Físico (Recomendado)**
1. Instale o Expo Go (Play Store ou App Store)
2. Escaneie o QR Code que aparece no terminal
3. Aguarde carregar

**Opção 2: Emulador**
```bash
npm run android  # Android
npm run ios      # iOS (apenas Mac)
```

## 📱 Telas do Aplicativo

### Navegação por Tabs
1. **Início (Dashboard)** - Visão geral e estatísticas
2. **Comandas** - Gerenciamento de pedidos
3. **Estoque** - Controle de produtos

### Navegação por Stack
- Login / Cadastro
- Nova Comanda
- Detalhes da Comanda

## 🔐 Autenticação

O sistema possui autenticação completa com:
- Cadastro de usuários
- Login com email e senha
- JWT para sessões seguras
- Validação de formulários
- Persistência de sessão

**Credenciais de teste:**
- Email: `admin@fastcomanda.com`
- Senha: `admin123`

## 📲 Notificações Push

O app envia notificações quando:
- Estoque de um produto fica abaixo do mínimo definido

## 🗄️ Estrutura do Banco de Dados

```
usuarios
├── id
├── nome
├── email
├── senha
└── expo_push_token

clientes
├── id
├── nome
├── telefone
└── cpf

produtos
├── id
├── nome
├── descricao
├── preco
├── quantidade_estoque
├── estoque_minimo
└── ativo

comandas
├── id
├── cliente_id
├── usuario_id
├── tipo_venda
├── status
├── valor_total
├── data_abertura
└── data_fechamento

comandas_itens
├── id
├── comanda_id
├── produto_id
├── quantidade
├── preco_unitario
└── subtotal
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário

### Produtos
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `PATCH /api/produtos/:id/estoque` - Atualizar estoque

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente

### Comandas
- `GET /api/comandas` - Listar comandas
- `POST /api/comandas` - Criar comanda
- `GET /api/comandas/:id` - Detalhes
- `PATCH /api/comandas/:id/finalizar` - Finalizar
- `GET /api/comandas/dashboard` - Estatísticas

## 🎨 Design e UX

- Interface limpa e intuitiva
- Cores consistentes (verde #4CAF50 como principal)
- Ícones emoji para facilitar identificação
- Feedback visual (loading, success, error)
- Pull-to-refresh em todas as listas
- Modals para ações importantes

## 📦 Estrutura de Pastas

```
fastcomanda/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── schema.sql
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── contexts/
    │   ├── routes/
    │   ├── screens/
    │   └── services/
    ├── App.js
    ├── app.json
    └── package.json
```

## 🐛 Troubleshooting

### Backend não conecta ao MySQL
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais no .env
```

### App não conecta ao backend
```bash
# Verificar IP em frontend/src/services/api.js
# Testar API no navegador: http://SEU_IP:3000
# Desabilitar firewall temporariamente
```

### Notificações não funcionam
- Use dispositivo físico (não funciona em emuladores)
- Verifique permissões
- Confira expo_push_token no banco

## 📈 Próximas Melhorias

- [ ] Relatórios em PDF
- [ ] Gráficos de vendas
- [ ] Modo offline completo com sincronização
- [ ] Impressão de comandas via Bluetooth
- [ ] Scanner de QR Code para produtos
- [ ] Painel web administrativo
- [ ] Multi-estabelecimento
- [ ] Integração com pagamentos

## 👨‍💻 Desenvolvedor

**Kayck Moreira Amaral**

Projeto desenvolvido como trabalho acadêmico para disciplina de Desenvolvimento Mobile.

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

---

**FastComanda** - Transformando o atendimento em restaurantes! 🍽️✨
