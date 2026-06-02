const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', categoriaController.listarCategorias);

module.exports = router;
