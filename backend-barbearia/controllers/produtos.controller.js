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
      valores.push(ativo);
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
      'SELECT COUNT(*) as total FROM produtos WHERE categoria_id = ?',
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
        error: "Acesso negado. Apenas gerentes podem gerenciar produtos." 
      });
    }

    const sql = `
      SELECT 
        p.id,
        p.unidade_id,
        p.categoria_id,
        c.nome as categoria_nome,
        p.nome,
        p.descricao,
        p.preco,
        p.estoque,
        p.foto_url,
        p.ativo,
        p.criado_em,
        p.atualizado_em
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.unidade_id = ?
      ORDER BY c.nome, p.nome ASC
    `;

    const [produtos] = await db.execute(sql, [unidade_id]);

    res.json({ 
      produtos,
      total: produtos.length 
    });
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
};

// Buscar produto por ID
exports.buscarProdutoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem visualizar produtos." 
      });
    }

    const sql = `
      SELECT 
        p.id,
        p.unidade_id,
        p.categoria_id,
        c.nome as categoria_nome,
        p.nome,
        p.descricao,
        p.preco,
        p.estoque,
        p.foto_url,
        p.ativo,
        p.criado_em,
        p.atualizado_em
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ? AND p.unidade_id = ?
    `;

    const [produtos] = await db.execute(sql, [id, unidade_id]);

    if (produtos.length === 0) {
      return res.status(404).json({ 
        error: "Produto não encontrado ou não pertence a esta unidade." 
      });
    }

    res.json({ produto: produtos[0] });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
};

// Criar produto
exports.criarProduto = async (req, res) => {
  try {
    const { categoria_id, nome, descricao, preco, estoque, foto_url } = req.body;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem criar produtos." 
      });
    }

    if (!nome || !preco) {
      return res.status(400).json({ error: "Nome e preço são obrigatórios." });
    }

    // Verificar se a categoria pertence à unidade (se fornecida)
    if (categoria_id) {
      const [categoria] = await db.execute(
        'SELECT id FROM categorias WHERE id = ? AND unidade_id = ?',
        [categoria_id, unidade_id]
      );

      if (categoria.length === 0) {
        return res.status(400).json({ 
          error: "Categoria não encontrada ou não pertence a esta unidade." 
        });
      }
    }

    const sql = `
      INSERT INTO produtos (
        unidade_id, categoria_id, nome, descricao, preco, estoque, foto_url, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
    `;

    const [result] = await db.execute(sql, [
      unidade_id,
      categoria_id || null,
      nome,
      descricao || null,
      preco,
      estoque || 0,
      foto_url || null
    ]);

    res.status(201).json({
      message: "Produto criado com sucesso",
      produto: {
        id: result.insertId,
        unidade_id,
        categoria_id,
        nome,
        descricao,
        preco,
        estoque,
        foto_url,
        ativo: true
      }
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
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
        error: "Acesso negado. Apenas gerentes podem atualizar produtos." 
      });
    }

    // Verificar se o produto pertence à unidade
    const [produto] = await db.execute(
      'SELECT id FROM produtos WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (produto.length === 0) {
      return res.status(404).json({ 
        error: "Produto não encontrado ou não pertence a esta unidade." 
      });
    }

    // Verificar se a categoria pertence à unidade (se fornecida)
    if (categoria_id) {
      const [categoria] = await db.execute(
        'SELECT id FROM categorias WHERE id = ? AND unidade_id = ?',
        [categoria_id, unidade_id]
      );

      if (categoria.length === 0) {
        return res.status(400).json({ 
          error: "Categoria não encontrada ou não pertence a esta unidade." 
        });
      }
    }

    const campos = [];
    const valores = [];

    if (categoria_id !== undefined) {
      campos.push('categoria_id = ?');
      valores.push(categoria_id || null);
    }

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
      campos.push('estoque = ?');
      valores.push(estoque);
    }

    if (foto_url !== undefined) {
      campos.push('foto_url = ?');
      valores.push(foto_url || null);
    }

    if (ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(ativo);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar." });
    }

    valores.push(id);

    const sql = `UPDATE produtos SET ${campos.join(', ')} WHERE id = ?`;
    await db.execute(sql, valores);

    res.json({ message: "Produto atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
};

// Excluir produto
exports.excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem excluir produtos." 
      });
    }

    // Verificar se o produto pertence à unidade
    const [produto] = await db.execute(
      'SELECT id FROM produtos WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (produto.length === 0) {
      return res.status(404).json({ 
        error: "Produto não encontrado ou não pertence a esta unidade." 
      });
    }

    // Deletar produto permanentemente
    await db.execute('DELETE FROM produtos WHERE id = ?', [id]);

    res.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
};

// Alternar status do produto
exports.alternarStatusProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem alterar status de produtos." 
      });
    }

    const [produto] = await db.execute(
      'SELECT ativo FROM produtos WHERE id = ? AND unidade_id = ?',
      [id, unidade_id]
    );

    if (produto.length === 0) {
      return res.status(404).json({ 
        error: "Produto não encontrado ou não pertence a esta unidade." 
      });
    }

    const novoStatus = !produto[0].ativo;

    await db.execute('UPDATE produtos SET ativo = ? WHERE id = ?', [novoStatus, id]);

    res.json({ 
      message: `Produto ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
      ativo: novoStatus
    });
  } catch (error) {
    console.error("Erro ao alternar status:", error);
    res.status(500).json({ error: "Erro ao alternar status do produto" });
  }
};
