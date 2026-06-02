const db = require('../config/database');

// Listar todas as comandas
exports.listarComandas = async (req, res) => {
  try {
    const { status, data } = req.query;
    
    let query = `
      SELECT
        c.*,
        cl.nome as cliente_nome,
        u.nome as usuario_nome
      FROM comandas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.deleted_at IS NULL
    `;
    
    const params = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (data) {
      query += ' AND DATE(c.data_abertura) = ?';
      params.push(data);
    }

    query += ' ORDER BY c.data_abertura DESC';

    const [comandas] = await db.query(query, params);

    res.json({
      success: true,
      data: comandas
    });

  } catch (error) {
    console.error('Erro ao listar comandas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao listar comandas' 
    });
  }
};

// Buscar comanda por ID com itens
exports.buscarComanda = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar comanda (apenas as não apagadas)
    const [comandas] = await db.query(`
      SELECT
        c.*,
        cl.nome as cliente_nome,
        cl.telefone as cliente_telefone,
        u.nome as usuario_nome
      FROM comandas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ? AND c.deleted_at IS NULL
    `, [id]);

    if (comandas.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comanda não encontrada' 
      });
    }

    const comanda = comandas[0];

    // Buscar itens da comanda
    const [itens] = await db.query(`
      SELECT 
        ci.*,
        p.nome as produto_nome,
        p.descricao as produto_descricao
      FROM comandas_itens ci
      JOIN produtos p ON ci.produto_id = p.id
      WHERE ci.comanda_id = ?
    `, [id]);

    comanda.itens = itens;

    res.json({
      success: true,
      data: comanda
    });

  } catch (error) {
    console.error('Erro ao buscar comanda:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar comanda' 
    });
  }
};

// Criar nova comanda
exports.criarComanda = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { cliente_id, tipo_venda, itens, observacoes, mesa } = req.body;
    const usuario_id = req.userId;

    if (!itens || itens.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'A comanda deve ter pelo menos um item' 
      });
    }

    // Validar cliente se fornecido
    if (cliente_id) {
      const [clientes] = await connection.query(
        'SELECT id FROM clientes WHERE id = ?',
        [cliente_id]
      );
      
      if (clientes.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }
    }

    // Criar comanda
    const [resultComanda] = await connection.query(
      'INSERT INTO comandas (cliente_id, usuario_id, tipo_venda, observacoes, mesa) VALUES (?, ?, ?, ?, ?)',
      [cliente_id || null, usuario_id, tipo_venda || 'vista', observacoes || null, mesa || null]
    );

    const comanda_id = resultComanda.insertId;
    let valor_total = 0;

    // Adicionar itens
    for (let item of itens) {
      const { produto_id, quantidade } = item;

      // Buscar produto e verificar estoque
      const [produtos] = await connection.query(
        'SELECT * FROM produtos WHERE id = ? AND ativo = 1',
        [produto_id]
      );

      if (produtos.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          success: false, 
          message: `Produto ID ${produto_id} não encontrado ou inativo` 
        });
      }

      const produto = produtos[0];

      // Verificar estoque disponível
      if (produto.quantidade_estoque < quantidade) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.quantidade_estoque}` 
        });
      }

      const preco_unitario = produto.preco;
      const subtotal = preco_unitario * quantidade;
      valor_total += subtotal;

      // Inserir item da comanda
      await connection.query(
        'INSERT INTO comandas_itens (comanda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [comanda_id, produto_id, quantidade, preco_unitario, subtotal]
      );

      // Atualizar estoque
      await connection.query(
        'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
        [quantidade, produto_id]
      );
    }

    // Atualizar valor total da comanda
    await connection.query(
      'UPDATE comandas SET valor_total = ? WHERE id = ?',
      [valor_total, comanda_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Comanda criada com sucesso',
      data: {
        id: comanda_id,
        valor_total,
        tipo_venda: tipo_venda || 'vista'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar comanda:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar comanda' 
    });
  } finally {
    connection.release();
  }
};

// Adicionar item a uma comanda existente
exports.adicionarItem = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { produto_id, quantidade } = req.body;

    // Verificar se comanda existe e está aberta
    const [comandas] = await connection.query(
      'SELECT * FROM comandas WHERE id = ? AND status = "aberta"',
      [id]
    );

    if (comandas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Comanda não encontrada ou já está fechada' 
      });
    }

    const comanda = comandas[0];

    // Buscar produto
    const [produtos] = await connection.query(
      'SELECT * FROM produtos WHERE id = ? AND ativo = 1',
      [produto_id]
    );

    if (produtos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Produto não encontrado ou inativo' 
      });
    }

    const produto = produtos[0];

    // Verificar estoque
    if (produto.quantidade_estoque < quantidade) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Estoque insuficiente. Disponível: ${produto.quantidade_estoque}` 
      });
    }

    const preco_unitario = produto.preco;
    const subtotal = preco_unitario * quantidade;

    // Adicionar item
    await connection.query(
      'INSERT INTO comandas_itens (comanda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
      [id, produto_id, quantidade, preco_unitario, subtotal]
    );

    // Atualizar estoque
    await connection.query(
      'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
      [quantidade, produto_id]
    );

    // Atualizar valor total da comanda
    await connection.query(
      'UPDATE comandas SET valor_total = valor_total + ? WHERE id = ?',
      [subtotal, id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Item adicionado com sucesso'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar item' 
    });
  } finally {
    connection.release();
  }
};

// Atualizar metadados da comanda (cliente, tipo de venda, observações)
exports.atualizarComanda = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente_id, tipo_venda, observacoes, mesa } = req.body;

    // Verificar se comanda existe e está aberta
    const [comandas] = await db.query(
      'SELECT id FROM comandas WHERE id = ? AND status = "aberta"',
      [id]
    );

    if (comandas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comanda não encontrada ou já está fechada',
      });
    }

    // Validar cliente se fornecido
    if (cliente_id) {
      const [clientes] = await db.query(
        'SELECT id FROM clientes WHERE id = ?',
        [cliente_id]
      );
      if (clientes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado',
        });
      }
    }

    if (tipo_venda && !['vista', 'fiado'].includes(tipo_venda)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de venda inválido',
      });
    }

    await db.query(
      'UPDATE comandas SET cliente_id = ?, tipo_venda = ?, observacoes = ?, mesa = ? WHERE id = ?',
      [cliente_id || null, tipo_venda || 'vista', observacoes || null, mesa || null, id]
    );

    res.json({ success: true, message: 'Comanda atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar comanda:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar comanda' });
  }
};

// Atualizar quantidade de um item da comanda
exports.atualizarItem = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id, itemId } = req.params;
    const { quantidade } = req.body;

    const novaQtd = parseInt(quantidade, 10);
    if (isNaN(novaQtd) || novaQtd < 1) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Quantidade inválida',
      });
    }

    // Verificar comanda aberta
    const [comandas] = await connection.query(
      'SELECT id FROM comandas WHERE id = ? AND status = "aberta"',
      [id]
    );
    if (comandas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Comanda não encontrada ou já está fechada',
      });
    }

    // Buscar item atual
    const [itens] = await connection.query(
      'SELECT * FROM comandas_itens WHERE id = ? AND comanda_id = ?',
      [itemId, id]
    );
    if (itens.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado nesta comanda',
      });
    }
    const item = itens[0];
    const diferenca = novaQtd - item.quantidade;

    // Se aumentou, conferir estoque do produto
    if (diferenca > 0) {
      const [produtos] = await connection.query(
        'SELECT quantidade_estoque, nome FROM produtos WHERE id = ?',
        [item.produto_id]
      );
      if (produtos.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado',
        });
      }
      if (produtos[0].quantidade_estoque < diferenca) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente para ${produtos[0].nome}. Disponível: ${produtos[0].quantidade_estoque}`,
        });
      }
    }

    const novoSubtotal = Number(item.preco_unitario) * novaQtd;
    const diferencaSubtotal = novoSubtotal - Number(item.subtotal);

    // Atualiza estoque (devolve se diminuiu, retira se aumentou)
    if (diferenca !== 0) {
      await connection.query(
        'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
        [diferenca, item.produto_id]
      );
    }

    // Atualiza item
    await connection.query(
      'UPDATE comandas_itens SET quantidade = ?, subtotal = ? WHERE id = ?',
      [novaQtd, novoSubtotal, itemId]
    );

    // Atualiza valor_total da comanda
    await connection.query(
      'UPDATE comandas SET valor_total = valor_total + ? WHERE id = ?',
      [diferencaSubtotal, id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Item atualizado com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar item' });
  } finally {
    connection.release();
  }
};

// Remover item da comanda (devolve ao estoque)
exports.removerItem = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id, itemId } = req.params;

    // Verificar comanda aberta
    const [comandas] = await connection.query(
      'SELECT id FROM comandas WHERE id = ? AND status = "aberta"',
      [id]
    );
    if (comandas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Comanda não encontrada ou já está fechada',
      });
    }

    // Buscar item
    const [itens] = await connection.query(
      'SELECT * FROM comandas_itens WHERE id = ? AND comanda_id = ?',
      [itemId, id]
    );
    if (itens.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado nesta comanda',
      });
    }
    const item = itens[0];

    // Devolve ao estoque
    await connection.query(
      'UPDATE produtos SET quantidade_estoque = quantidade_estoque + ? WHERE id = ?',
      [item.quantidade, item.produto_id]
    );

    // Remove o item
    await connection.query('DELETE FROM comandas_itens WHERE id = ?', [itemId]);

    // Recalcula valor_total subtraindo o subtotal removido
    await connection.query(
      'UPDATE comandas SET valor_total = valor_total - ? WHERE id = ?',
      [item.subtotal, id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Item removido com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao remover item:', error);
    res.status(500).json({ success: false, message: 'Erro ao remover item' });
  } finally {
    connection.release();
  }
};

// Finalizar/Fechar comanda
exports.finalizarComanda = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se comanda existe e está aberta
    const [comandas] = await db.query(
      'SELECT * FROM comandas WHERE id = ? AND status = "aberta"',
      [id]
    );

    if (comandas.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comanda não encontrada ou já está fechada' 
      });
    }

    // Fechar comanda
    await db.query(
      'UPDATE comandas SET status = "fechada", data_fechamento = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Comanda finalizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao finalizar comanda:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao finalizar comanda' 
    });
  }
};

// Apagar (soft delete) comanda — apenas comandas fechadas/canceladas
exports.apagarComanda = async (req, res) => {
  try {
    const { id } = req.params;

    const [comandas] = await db.query(
      'SELECT id, status FROM comandas WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (comandas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comanda não encontrada',
      });
    }

    if (comandas[0].status === 'aberta') {
      return res.status(400).json({
        success: false,
        message: 'Comandas abertas não podem ser apagadas. Finalize ou cancele antes.',
      });
    }

    await db.query(
      'UPDATE comandas SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Comanda apagada com sucesso' });
  } catch (error) {
    console.error('Erro ao apagar comanda:', error);
    res.status(500).json({ success: false, message: 'Erro ao apagar comanda' });
  }
};

// Estatísticas do dia (Dashboard)
exports.estatisticasDia = async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    // Total de comandas do dia
    const [totalComandas] = await db.query(
      'SELECT COUNT(*) as total FROM comandas WHERE DATE(data_abertura) = ? AND deleted_at IS NULL',
      [hoje]
    );

    // Comandas por status
    const [porStatus] = await db.query(
      `SELECT
        status,
        COUNT(*) as total
      FROM comandas
      WHERE DATE(data_abertura) = ? AND deleted_at IS NULL
      GROUP BY status`,
      [hoje]
    );

    // Valor total do dia
    const [valorTotal] = await db.query(
      'SELECT SUM(valor_total) as total FROM comandas WHERE DATE(data_abertura) = ? AND status = "fechada" AND deleted_at IS NULL',
      [hoje]
    );

    // Produtos mais vendidos do dia
    const [topProdutos] = await db.query(
      `SELECT
        p.nome,
        SUM(ci.quantidade) as total_vendido
      FROM comandas_itens ci
      JOIN comandas c ON ci.comanda_id = c.id
      JOIN produtos p ON ci.produto_id = p.id
      WHERE DATE(c.data_abertura) = ? AND c.deleted_at IS NULL
      GROUP BY p.id, p.nome
      ORDER BY total_vendido DESC
      LIMIT 5`,
      [hoje]
    );

    res.json({
      success: true,
      data: {
        total_comandas: totalComandas[0].total,
        comandas_por_status: porStatus,
        valor_total: valorTotal[0].total || 0,
        produtos_mais_vendidos: topProdutos
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar estatísticas' 
    });
  }
};

// Cancelar comanda aberta (devolve itens ao estoque)
exports.cancelarComanda = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [comandas] = await connection.query(
      'SELECT id FROM comandas WHERE id = ? AND status = "aberta"',
      [id]
    );

    if (comandas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Comanda não encontrada ou não está aberta',
      });
    }

    const [itens] = await connection.query(
      'SELECT produto_id, quantidade FROM comandas_itens WHERE comanda_id = ?',
      [id]
    );

    for (const item of itens) {
      await connection.query(
        'UPDATE produtos SET quantidade_estoque = quantidade_estoque + ? WHERE id = ?',
        [item.quantidade, item.produto_id]
      );
    }

    await connection.query(
      'UPDATE comandas SET status = "cancelada", data_fechamento = NOW() WHERE id = ?',
      [id]
    );

    await connection.commit();

    res.json({ success: true, message: 'Comanda cancelada com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao cancelar comanda:', error);
    res.status(500).json({ success: false, message: 'Erro ao cancelar comanda' });
  } finally {
    connection.release();
  }
};

module.exports = exports;
