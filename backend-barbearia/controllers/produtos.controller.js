const db = require("../config/db.js");

// ==================== CATEGORIAS ====================

// Listar categorias da unidade
exports.listarCategorias = async (req, res) => {
  try {
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem gerenciar categorias." 
      });
    }

    const sql = `
      SELECT 
        id,
        unidade_id,
        nome,
        descricao,
        ativo,
        criado_em,
        atualizado_em
      FROM categorias
      WHERE unidade_id = ?
      ORDER BY nome ASC
    `;

    const [categorias] = await db.execute(sql, [unidade_id]);

    res.json({ 
      categorias,
      total: categorias.length 
    });
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
};

// Criar categoria
exports.criarCategoria = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem criar categorias." 
      });
    }

    if (!nome) {
      return res.status(400).json({ error: "Nome da categoria é obrigatório." });
    }

    const sql = `
      INSERT INTO categorias (unidade_id, nome, descricao, ativo)
      VALUES (?, ?, ?, TRUE)
    `;

    const [result] = await db.execute(sql, [unidade_id, nome, descricao || null]);

    res.status(201).json({
      message: "Categoria criada com sucesso",
      categoria: {
        id: result.insertId,
        unidade_id,
        nome,
        descricao,
        ativo: true
      }
    });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
};

// Atualizar categoria
exports.atualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, ativo } = req.body;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem atualizar categorias." 
      });
    }

    // Verificar se a categoria pertence à unidade
    const [categoria] = await db.execute(
      'SELECT id FROM categorias WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ 
        error: "Categoria não encontrada ou não pertence a esta unidade." 
      });
    }

    const campos = [];
    const valores = [];

    if (nome) {
      campos.push('nome = ?');
      valores.push(nome);
    }

    if (descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(descricao || null);
    }

    if (ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(ativo ? 1 : 0);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar." });
    }

    valores.push(id);

    const sql = `UPDATE categorias SET ${campos.join(', ')} WHERE id = ?`;
    await db.execute(sql, valores);

    res.json({ message: "Categoria atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({ error: "Erro ao atualizar categoria" });
  }
};

// Excluir categoria
exports.excluirCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem excluir categorias." 
      });
    }

    // Verificar se a categoria pertence à unidade
    const [categoria] = await db.execute(
      'SELECT id FROM categorias WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ 
        error: "Categoria não encontrada ou não pertence a esta unidade." 
      });
    }

    // Verificar se há produtos vinculados
    const [produtos] = await db.execute(
      'SELECT COUNT(*) as total FROM servicos WHERE categoria_id = ?',
      [id]
    );

    if (produtos[0].total > 0) {
      return res.status(400).json({ 
        error: `Não é possível excluir esta categoria. Existem ${produtos[0].total} produto(s) vinculado(s).` 
      });
    }

    await db.execute('DELETE FROM categorias WHERE id = ?', [id]);

    res.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    res.status(500).json({ error: "Erro ao excluir categoria" });
  }
};

// ==================== PRODUTOS ====================

// Listar produtos da unidade
exports.listarProdutos = async (req, res) => {
  try {
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem gerenciar serviços." 
      });
    }

    const sql = `
      SELECT 
        s.id,
        s.unidade_id,
        s.nome,
        s.descricao,
        s.preco,
        s.duracao,
        s.ativo,
        s.created_at as criado_em,
        s.updated_at as atualizado_em
      FROM servicos s
      WHERE s.unidade_id = ?
      ORDER BY s.nome ASC
    `;

    const [produtos] = await db.execute(sql, [unidade_id]);

    res.json({ 
      produtos,
      total: produtos.length 
    });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(500).json({ error: "Erro ao listar serviços" });
  }
};

// Buscar produto por ID
exports.buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem visualizar serviços." 
      });
    }

    const sql = `
      SELECT 
        s.id,
        s.unidade_id,
        s.nome,
        s.descricao,
        s.preco,
        s.duracao,
        s.ativo,
        s.created_at as criado_em,
        s.updated_at as atualizado_em
      FROM servicos s
      WHERE s.id = ? AND s.unidade_id = ?
    `;

    const [produtos] = await db.execute(sql, [id, unidade_id]);

    if (produtos.length === 0) {
      return res.status(404).json({ 
        error: "Serviço não encontrado ou não pertence a esta unidade." 
      });
    }

    res.json({ produto: produtos[0] });
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(500).json({ error: "Erro ao buscar serviço" });
  }
};

// Criar produto
exports.criarProduto = async (req, res) => {
  try {
    const { categoria_id, nome, descricao, preco, estoque, foto_url } = req.body;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem criar serviços." 
      });
    }

    if (!nome || !preco) {
      return res.status(400).json({ error: "Nome e preço são obrigatórios." });
    }

    const sql = `
      INSERT INTO servicos (
        unidade_id, nome, descricao, preco, duracao, ativo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      unidade_id,
      nome,
      descricao || null,
      preco,
      estoque || 30,
      1
    ]);

    res.status(201).json({
      message: "Serviço criado com sucesso",
      produto: {
        id: result.insertId,
        unidade_id,
        nome,
        descricao,
        preco,
        duracao: estoque || 30,
        ativo: true
      }
    });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(500).json({ error: "Erro ao criar serviço" });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria_id, nome, descricao, preco, estoque, foto_url, ativo } = req.body;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem atualizar serviços." 
      });
    }

    // Verificar se o produto pertence à unidade
    const [produtos] = await db.execute(
      'SELECT id FROM servicos WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ 
        error: "Serviço não encontrado ou não pertence a esta unidade." 
      });
    }

    const campos = [];
    const valores = [];

    if (nome) {
      campos.push('nome = ?');
      valores.push(nome);
    }

    if (descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(descricao || null);
    }

    if (preco !== undefined) {
      campos.push('preco = ?');
      valores.push(preco);
    }

    if (estoque !== undefined) {
      campos.push('duracao = ?');
      valores.push(estoque);
    }

    if (ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(ativo ? 1 : 0);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar." });
    }

    valores.push(id);

    const sql = `UPDATE servicos SET ${campos.join(', ')} WHERE id = ?`;
    await db.execute(sql, valores);

    res.json({ message: "Serviço atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(500).json({ error: "Erro ao atualizar serviço" });
  }
};

// Excluir produto
exports.excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem excluir serviços." 
      });
    }

    // Verificar se o serviço pertence à unidade
    const [servicos] = await db.execute(
      'SELECT id FROM servicos WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (servicos.length === 0) {
      return res.status(404).json({ 
        error: "Serviço não encontrado ou não pertence a esta unidade." 
      });
    }

    // Deletar serviço permanentemente
    await db.execute('DELETE FROM servicos WHERE id = ?', [id]);

    res.json({ message: "Serviço excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    res.status(500).json({ 
      error: "Erro ao excluir serviço",
      details: error.message 
    });
  }
};

// Alternar status do produto
exports.alternarStatusProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem alterar status de serviços." 
      });
    }

    const [produtos] = await db.execute(
      'SELECT ativo FROM servicos WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ 
        error: "Serviço não encontrado ou não pertence a esta unidade." 
      });
    }

    // Converter para booleano e inverter
    const statusAtual = Boolean(produtos[0].ativo);
    const novoStatus = !statusAtual;

    await db.execute('UPDATE servicos SET ativo = ? WHERE id = ?', [novoStatus ? 1 : 0, id]);

    res.json({ 
      message: `Serviço ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
      ativo: novoStatus
    });
  } catch (error) {
    console.error("Erro ao alternar status:", error);
    res.status(500).json({ error: "Erro ao alternar status do serviço" });
  }
};
