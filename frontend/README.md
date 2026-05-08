# FastComanda - Frontend Mobile

Aplicativo React Native para gerenciamento de comandas em restaurantes.

## 🚀 Tecnologias

- React Native
- Expo
- React Navigation (Stack + Tab)
- AsyncStorage (persistência local)
- Expo Notifications (push notifications)
- Axios (requisições HTTP)

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go (app para testar em dispositivo físico)
- Android Studio ou Xcode (para emuladores)

## ⚙️ Instalação

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar a API

Edite o arquivo `src/services/api.js` e configure a URL da API:

```javascript
// Para Android Emulator
const API_URL = 'http://10.0.2.2:3000/api';

// Para iOS Simulator
const API_URL = 'http://localhost:3000/api';

// Para dispositivo físico (use o IP da sua máquina na rede local)
const API_URL = 'http://192.168.1.100:3000/api';
```

**Como descobrir seu IP local:**

**Windows:**
```bash
ipconfig
```
Procure por "IPv4 Address" na conexão Wi-Fi

**Mac/Linux:**
```bash
ifconfig
```
Procure por "inet" na conexão en0 ou wlan0

### 3. Iniciar o aplicativo

```bash
npm start
```

Isso abrirá o Metro Bundler no navegador.

### 4. Executar no dispositivo/emulador

**Opção 1: Dispositivo Físico (Recomendado)**
1. Instale o app "Expo Go" na Play Store (Android) ou App Store (iOS)
2. Escaneie o QR Code que aparece no terminal/navegador
3. Aguarde o app carregar

**Opção 2: Emulador Android**
```bash
npm run android
```

**Opção 3: Simulator iOS** (apenas Mac)
```bash
npm run ios
```

## 📱 Funcionalidades

### ✅ Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Validação de formulários
- Persistência de sessão (AsyncStorage)

### ✅ Dashboard
- Total de comandas do dia
- Faturamento do dia
- Produtos mais vendidos
- Acesso rápido às funcionalidades

### ✅ Comandas
- Listar todas as comandas
- Criar nova comanda
- Adicionar produtos
- Selecionar cliente
- Definir tipo de venda (à vista/fiado)
- Ver detalhes da comanda
- Finalizar comanda

### ✅ Estoque
- Listar todos os produtos
- Ver quantidade disponível
- Atualizar estoque manualmente
- Alertas de estoque baixo
- Status visual (OK, Baixo, Sem Estoque)

### ✅ Notificações Push
- Notificação quando estoque fica baixo
- Configuração automática ao fazer login
- Suporte a iOS e Android

## 🎨 Estrutura de Pastas

```
frontend/
├── App.js                      # Componente raiz
├── app.json                    # Configuração do Expo
├── package.json                # Dependências
├── babel.config.js             # Configuração Babel
├── src/
│   ├── contexts/
│   │   └── AuthContext.js      # Contexto de autenticação
│   ├── routes/
│   │   └── index.js            # Navegação do app
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ComandasScreen.js
│   │   ├── NovaComandaScreen.js
│   │   ├── DetalhesComandaScreen.js
│   │   └── EstoqueScreen.js
│   └── services/
│       ├── api.js              # Configuração Axios
│       └── notifications.js     # Notificações Push
└── assets/                     # Imagens e ícones
```

## 🔐 Fluxo de Autenticação

1. Usuário faz login/cadastro
2. App solicita permissão para notificações
3. Token JWT é salvo no AsyncStorage
4. Token é enviado em todas as requisições
5. Se token expirar, usuário é deslogado automaticamente

## 📲 Notificações Push

As notificações são enviadas automaticamente quando:
- Estoque de um produto fica abaixo do mínimo

Para testar notificações:
1. Faça login no app
2. Permita notificações quando solicitado
3. No backend, atualize o estoque de um produto para abaixo do mínimo
4. Receberá uma notificação

## 🐛 Troubleshooting

### Erro: "Network request failed"
- Verifique se o backend está rodando
- Confirme se a URL da API está correta
- Em dispositivo físico, certifique-se de estar na mesma rede Wi-Fi

### Erro: "Unable to resolve module"
```bash
npm install
expo start -c
```

### Notificações não funcionam
- Certifique-se de estar em um dispositivo físico
- Verifique se as permissões foram concedidas
- Notificações push não funcionam em emuladores iOS/Android

### App não conecta ao backend
1. Verifique o IP em `src/services/api.js`
2. Teste a API no navegador: `http://SEU_IP:3000`
3. Desative firewall temporariamente para testar

## 📦 Build de Produção

### Android (APK)

```bash
expo build:android
```

### iOS (IPA)

```bash
expo build:ios
```

## 🔧 Variáveis de Ambiente

Opcionalmente, você pode usar variáveis de ambiente:

Crie um arquivo `.env` na raiz:

```
API_URL=http://192.168.1.100:3000/api
```

## 📄 Credenciais de Teste

Após rodar o `schema.sql` no backend:

- **Email:** admin@fastcomanda.com
- **Senha:** admin123

## 📝 Próximas Melhorias

- [ ] Modo offline completo
- [ ] Sincronização automática
- [ ] Relatórios e gráficos
- [ ] Impressão de comandas
- [ ] Scanner de QR Code
- [ ] Suporte a múltiplos estabelecimentos
- [ ] Tema dark mode

## 👨‍💻 Desenvolvedor

Kayck Moreira Amaral

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.
