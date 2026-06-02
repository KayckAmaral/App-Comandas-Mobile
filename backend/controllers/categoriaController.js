const db = require('../config/database');

exports.listarCategorias = async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT * FROM categorias ORDER BY nome ASC');
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar categorias' });
  }
};
