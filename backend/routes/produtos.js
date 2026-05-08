const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de produtos requerem autenticação
router.use(authMiddleware);

// GET /api/produtos - Listar todos os produtos
router.get('/', produtoController.listarProdutos);

// GET /api/produtos/:id - Buscar produto por ID
router.get('/:id', produtoController.buscarProduto);

// POST /api/produtos - Criar novo produto
router.post('/', produtoController.criarProduto);

// PUT /api/produtos/:id - Atualizar produto
router.put('/:id', produtoController.atualizarProduto);

// PATCH /api/produtos/:id/estoque - Atualizar estoque
router.patch('/:id/estoque', produtoController.atualizarEstoque);

module.exports = router;
