const express = require('express');
const router = express.Router();
const comandaController = require('../controllers/comandaController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de comandas requerem autenticação
router.use(authMiddleware);

// GET /api/comandas - Listar todas as comandas
router.get('/', comandaController.listarComandas);

// GET /api/comandas/dashboard - Estatísticas do dia
router.get('/dashboard', comandaController.estatisticasDia);

// GET /api/comandas/relatorios - Relatório por período (apenas gerente)
router.get('/relatorios', comandaController.relatorios);

// GET /api/comandas/:id - Buscar comanda por ID
router.get('/:id', comandaController.buscarComanda);

// POST /api/comandas - Criar nova comanda
router.post('/', comandaController.criarComanda);

// POST /api/comandas/:id/itens - Adicionar item à comanda
router.post('/:id/itens', comandaController.adicionarItem);

// PATCH /api/comandas/:id - Atualizar metadados (cliente, tipo de venda, observações)
router.patch('/:id', comandaController.atualizarComanda);

// PATCH /api/comandas/:id/itens/:itemId - Alterar quantidade de um item
router.patch('/:id/itens/:itemId', comandaController.atualizarItem);

// DELETE /api/comandas/:id/itens/:itemId - Remover item da comanda
router.delete('/:id/itens/:itemId', comandaController.removerItem);

// PATCH /api/comandas/:id/finalizar - Finalizar/fechar comanda
router.patch('/:id/finalizar', comandaController.finalizarComanda);

// PATCH /api/comandas/:id/cancelar - Cancelar comanda (devolve estoque)
router.patch('/:id/cancelar', comandaController.cancelarComanda);

// DELETE /api/comandas/:id - Apagar (soft delete) comanda fechada/cancelada
router.delete('/:id', comandaController.apagarComanda);

module.exports = router;
