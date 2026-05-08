const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Validações
const validateRegister = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

// Rotas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Rotas protegidas
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
