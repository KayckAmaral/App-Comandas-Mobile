const db = require('../config/database');

// Listar todos os clientes
exports.listarClientes = async (req, res) => {
  try {
    const [clientes] = await db.query(
      'SELECT * FROM clientes ORDER BY nome ASC'
    );

    res.json({
      success: true,
      data: clientes
    });

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao listar clientes' 
    });
  }
};

// Buscar cliente por ID
exports.buscarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const [clientes] = await db.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado' 
      });
    }

    res.json({
      success: true,
      data: clientes[0]
    });

  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar cliente' 
    });
  }
};

// Criar novo cliente
exports.criarCliente = async (req, res) => {
  try {
    const { nome, telefone, cpf } = req.body;

    if (!nome) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome é obrigatório' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO clientes (nome, telefone, cpf) VALUES (?, ?, ?)',
      [nome, telefone || null, cpf || null]
    );

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso',
      data: {
        id: result.insertId,
        nome,
        telefone,
        cpf
      }
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao cadastrar cliente' 
    });
  }
};

// Atualizar cliente
exports.atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, cpf } = req.body;

    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (telefone !== undefined) {
      updates.push('telefone = ?');
      values.push(telefone);
    }
    if (cpf !== undefined) {
      updates.push('cpf = ?');
      values.push(cpf);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum campo para atualizar' 
      });
    }

    values.push(id);

    await db.query(
      `UPDATE clientes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar cliente' 
    });
  }
};

// Deletar cliente
exports.deletarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se cliente tem comandas
    const [comandas] = await db.query(
      'SELECT COUNT(*) as total FROM comandas WHERE cliente_id = ?',
      [id]
    );

    if (comandas[0].total > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cliente possui comandas vinculadas e não pode ser excluído' 
      });
    }

    await db.query('DELETE FROM clientes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir cliente' 
    });
  }
};

// Histórico de comandas e resumo de fiado do cliente
exports.historicoCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const [clientes] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
    if (clientes.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }

    const [comandas] = await db.query(
      `SELECT c.id, c.mesa, c.status, c.tipo_venda, c.valor_total, c.data_abertura, c.data_fechamento
       FROM comandas c
       WHERE c.cliente_id = ? AND c.deleted_at IS NULL
       ORDER BY c.data_abertura DESC`,
      [id]
    );

    const fiadoAberto = comandas.filter(c => c.tipo_venda === 'fiado' && c.status === 'aberta');
    const totalFiado = fiadoAberto.reduce((sum, c) => sum + Number(c.valor_total), 0);

    res.json({
      success: true,
      data: {
        cliente: clientes[0],
        comandas,
        fiado: {
          quantidade: fiadoAberto.length,
          total: totalFiado,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar histórico do cliente' });
  }
};

module.exports = exports;
