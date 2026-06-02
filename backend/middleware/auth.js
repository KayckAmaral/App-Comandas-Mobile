const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      });
    }

    // Formato: Bearer TOKEN
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ 
        success: false, 
        message: 'Formato de token inválido' 
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token mal formatado' 
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido ou expirado' 
        });
      }

      // Adicionar informações do usuário na requisição
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;
      
      return next();
    });

  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Falha na autenticação' 
    });
  }
};

module.exports = authMiddleware;
