const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');
require('dotenv').config();

// Registrar novo usuário
exports.register = async (req, res) => {
  try {
    // Validar erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { nome, email, senha } = req.body;

    // Verificar se usuário já existe
    const [existingUser] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email já cadastrado' 
      });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir novo usuário
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    // Gerar token
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: {
        id: result.insertId,
        nome,
        email,
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao cadastrar usuário' 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // Validar erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, senha, expoPushToken } = req.body;

    // Buscar usuário
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    const user = users[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Atualizar expo push token se fornecido
    if (expoPushToken) {
      await db.query(
        'UPDATE usuarios SET expo_push_token = ? WHERE id = ?',
        [expoPushToken, user.id]
      );
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao realizar login' 
    });
  }
};

// Obter perfil do usuário autenticado
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, nome, email, created_at FROM usuarios WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar perfil' 
    });
  }
};
