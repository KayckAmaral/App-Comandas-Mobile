const db = require('../config/database');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

// Listar todos os produtos
exports.listarProdutos = async (req, res) => {
  try {
    const { ativo } = req.query;
    
    let query = `
      SELECT p.*, c.nome as categoria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    let params = [];

    if (ativo !== undefined) {
      query += ' WHERE p.ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    query += ' ORDER BY c.nome ASC, p.nome ASC';

    const [produtos] = await db.query(query, params);

    res.json({
      success: true,
      data: produtos
    });

  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao listar produtos' 
    });
  }
};

// Buscar produto por ID
exports.buscarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const [produtos] = await db.query(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produto não encontrado' 
      });
    }

    res.json({
      success: true,
      data: produtos[0]
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar produto' 
    });
  }
};

// Criar novo produto
exports.criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, quantidade_estoque, estoque_minimo } = req.body;

    const [result] = await db.query(
      'INSERT INTO produtos (nome, descricao, preco, quantidade_estoque, estoque_minimo) VALUES (?, ?, ?, ?, ?)',
      [nome, descricao || null, preco, quantidade_estoque || 0, estoque_minimo || 5]
    );

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: {
        id: result.insertId,
        nome,
        preco,
        quantidade_estoque: quantidade_estoque || 0
      }
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar produto' 
    });
  }
};

// Atualizar estoque
exports.atualizarEstoque = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade_estoque } = req.body;

    // Buscar produto atual
    const [produtos] = await db.query(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produto não encontrado' 
      });
    }

    const produto = produtos[0];

    // Atualizar estoque
    await db.query(
      'UPDATE produtos SET quantidade_estoque = ? WHERE id = ?',
      [quantidade_estoque, id]
    );

    // Verificar se estoque ficou baixo e enviar notificação
    if (quantidade_estoque <= produto.estoque_minimo) {
      await enviarNotificacaoEstoqueBaixo(produto.nome, quantidade_estoque);
    }

    res.json({
      success: true,
      message: 'Estoque atualizado com sucesso',
      data: {
        id,
        quantidade_estoque
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar estoque' 
    });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, ativo } = req.body;

    const updates = [];
    const values = [];

    if (nome !== undefined) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }
    if (preco !== undefined) {
      updates.push('preco = ?');
      values.push(preco);
    }
    if (ativo !== undefined) {
      updates.push('ativo = ?');
      values.push(ativo ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum campo para atualizar' 
      });
    }

    values.push(id);

    await db.query(
      `UPDATE produtos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar produto' 
    });
  }
};

// Função auxiliar para enviar notificação de estoque baixo
async function enviarNotificacaoEstoqueBaixo(nomeProduto, quantidadeAtual) {
  try {
    // Buscar tokens de push de todos os usuários
    const [usuarios] = await db.query(
      'SELECT expo_push_token FROM usuarios WHERE expo_push_token IS NOT NULL'
    );

    if (usuarios.length === 0) return;

    const messages = [];
    
    for (let usuario of usuarios) {
      const pushToken = usuario.expo_push_token;

      if (!Expo.isExpoPushToken(pushToken)) {
        console.warn(`Token inválido: ${pushToken}`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: '⚠️ Estoque Baixo!',
        body: `${nomeProduto} está com apenas ${quantidadeAtual} unidade(s) disponível(is).`,
        data: { 
          tipo: 'estoque_baixo',
          produto: nomeProduto,
          quantidade: quantidadeAtual
        },
        priority: 'high'
      });
    }

    if (messages.length === 0) return;

    // Enviar notificações em lotes
    let chunks = expo.chunkPushNotifications(messages);
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('✅ Notificações enviadas:', ticketChunk);
      } catch (error) {
        console.error('❌ Erro ao enviar notificação:', error);
      }
    }

  } catch (error) {
    console.error('Erro ao processar notificações:', error);
  }
}

module.exports = exports;
