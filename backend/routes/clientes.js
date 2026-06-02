const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de clientes requerem autenticação
router.use(authMiddleware);

// GET /api/clientes - Listar todos os clientes
router.get('/', clienteController.listarClientes);

// GET /api/clientes/:id/historico - Histórico de comandas e fiado do cliente
router.get('/:id/historico', clienteController.historicoCliente);

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', clienteController.buscarCliente);

// POST /api/clientes - Criar novo cliente
router.post('/', clienteController.criarCliente);

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', clienteController.atualizarCliente);

// DELETE /api/clientes/:id - Deletar cliente
router.delete('/:id', clienteController.deletarCliente);

module.exports = router;
