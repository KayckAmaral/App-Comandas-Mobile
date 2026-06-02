const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/comandas', require('./routes/comandas'));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FastComanda API está rodando! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      produtos: '/api/produtos',
      clientes: '/api/clientes',
      comandas: '/api/comandas'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

function getLocalIPs() {
  const os = require('os');
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

app.listen(PORT, HOST, () => {
  const ips = getLocalIPs();
  console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║     🍽️  FastComanda API Server       ║
║                                       ║
║  ✅ Servidor rodando na porta ${PORT}   ║
║  🌐 http://localhost:${PORT}           ║
║  📚 Documentação: /api                ║
║                                       ║
╚═══════════════════════════════════════╝
  `);
  if (ips.length) {
    console.log('🔌 Acessível na rede em:');
    ips.forEach((ip) => console.log(`   http://${ip}:${PORT}`));
  }
});

module.exports = app;
