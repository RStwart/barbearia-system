const db = require("../config/db");

// ==================== ESTATÍSTICAS ====================

// Obter estatísticas do dashboard
exports.obterEstatisticas = async (req, res) => {
  try {
    const { unidade_id, tipo, id } = req.user;

    if (tipo !== 'GERENTE' && tipo !== 'ADM' && tipo !== 'FUNCIONARIO') {
      return res.status(403).json({ 
        error: "Acesso negado." 
      });
    }

    // Filtro adicional para funcionários (apenas suas vendas)
    const filtroFuncionario = tipo === 'FUNCIONARIO' ? ' AND funcionario_id = ?' : '';
    const paramsFuncionario = tipo === 'FUNCIONARIO' ? [unidade_id, id] : [unidade_id];

    // Vendas do dia
    const [vendasDia] = await db.execute(
      `SELECT COUNT(*) as total, COALESCE(SUM(valor_total), 0) as valor
       FROM vendas 
       WHERE unidade_id = ? AND DATE(criado_em) = CURDATE()${filtroFuncionario}`,
      paramsFuncionario
    );

    // Vendas da semana
    const [vendasSemana] = await db.execute(
      `SELECT COUNT(*) as total, COALESCE(SUM(valor_total), 0) as valor
       FROM vendas 
       WHERE unidade_id = ? AND YEARWEEK(criado_em) = YEARWEEK(NOW())${filtroFuncionario}`,
      paramsFuncionario
    );

    // Vendas do mês
    const [vendasMes] = await db.execute(
      `SELECT COUNT(*) as total, COALESCE(SUM(valor_total), 0) as valor
       FROM vendas 
       WHERE unidade_id = ? AND YEAR(criado_em) = YEAR(NOW()) AND MONTH(criado_em) = MONTH(NOW())${filtroFuncionario}`,
      paramsFuncionario
    );

    // Vendas do ano
    const [vendasAno] = await db.execute(
      `SELECT COUNT(*) as total, COALESCE(SUM(valor_total), 0) as valor
       FROM vendas 
       WHERE unidade_id = ? AND YEAR(criado_em) = YEAR(NOW())${filtroFuncionario}`,
      paramsFuncionario
    );

    // Vendas por tipo
    const [vendasPorTipo] = await db.execute(
      `SELECT tipo_venda, COUNT(*) as quantidade, COALESCE(SUM(valor_total), 0) as total
       FROM vendas 
       WHERE unidade_id = ? AND YEAR(criado_em) = YEAR(NOW()) AND MONTH(criado_em) = MONTH(NOW())${filtroFuncionario}
       GROUP BY tipo_venda`,
      paramsFuncionario
    );

    // Serviços mais vendidos do mês
    const [servicosMaisVendidos] = await db.execute(
      `SELECT vs.servico_nome, SUM(vs.quantidade) as total_vendido, COALESCE(SUM(vs.subtotal), 0) as valor_total
       FROM venda_servicos vs
       INNER JOIN vendas v ON vs.venda_id = v.id
       WHERE v.unidade_id = ? AND YEAR(v.criado_em) = YEAR(NOW()) AND MONTH(v.criado_em) = MONTH(NOW())${filtroFuncionario}
       GROUP BY vs.servico_nome
       ORDER BY total_vendido DESC
       LIMIT 5`,
      paramsFuncionario
    );

    // Vendas por forma de pagamento (mês)
    const [vendasPorPagamento] = await db.execute(
      `SELECT forma_pagamento, COUNT(*) as quantidade, COALESCE(SUM(valor_total), 0) as total
       FROM vendas 
       WHERE unidade_id = ? AND YEAR(criado_em) = YEAR(NOW()) AND MONTH(criado_em) = MONTH(NOW())${filtroFuncionario}
       GROUP BY forma_pagamento`,
      paramsFuncionario
    );

    res.json({
      vendasDia: vendasDia[0],
      vendasSemana: vendasSemana[0],
      vendasMes: vendasMes[0],
      vendasAno: vendasAno[0],
      vendasPorTipo,
      servicosMaisVendidos,
      vendasPorPagamento
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({ error: "Erro ao obter estatísticas" });
  }
};

// ==================== VENDAS ====================

// Listar vendas
exports.listarVendas = async (req, res) => {
  try {
    const { unidade_id, tipo, id } = req.user;

    console.log('📊 Listar Vendas - Tipo:', tipo, 'ID:', id, 'Unidade:', unidade_id);

    if (tipo !== 'GERENTE' && tipo !== 'ADM' && tipo !== 'FUNCIONARIO') {
      return res.status(403).json({ 
        error: "Acesso negado." 
      });
    }

    // Funcionários veem apenas suas vendas, Gerentes veem todas da unidade
    const filtroFuncionario = tipo === 'FUNCIONARIO' ? 'AND v.funcionario_id = ?' : '';
    const params = tipo === 'FUNCIONARIO' ? [unidade_id, id] : [unidade_id];

    console.log('🔍 Filtro Funcionário:', filtroFuncionario);
    console.log('📋 Params:', params);

    const sql = `
      SELECT 
        v.id,
        v.unidade_id,
        v.funcionario_id,
        uf.nome as funcionario_nome,
        v.cliente_id,
        uc.nome as cliente_nome,
        v.tipo_venda,
        v.valor_total,
        v.forma_pagamento,
        v.status_pagamento,
        v.nota_fiscal,
        v.status_nf,
        v.observacoes,
        v.criado_em,
        v.atualizado_em
      FROM vendas v
      LEFT JOIN usuarios uf ON v.funcionario_id = uf.id
      LEFT JOIN usuarios uc ON v.cliente_id = uc.id
      WHERE v.unidade_id = ? ${filtroFuncionario}
      ORDER BY v.criado_em DESC
    `;

    console.log('🔎 SQL:', sql);

    const [vendas] = await db.execute(sql, params);

    console.log('✅ Vendas encontradas:', vendas.length);

    // Buscar itens de cada venda
    for (let venda of vendas) {
      // Buscar serviços
      const [servicos] = await db.execute(
        `SELECT * FROM venda_servicos WHERE venda_id = ?`,
        [venda.id]
      );
      venda.servicos = servicos;
      
      // Produtos virão em futuras implementações
      venda.produtos = [];
    }

    res.json({ vendas });
  } catch (error) {
    console.error("Erro ao listar vendas:", error);
    res.status(500).json({ error: "Erro ao listar vendas" });
  }
};

// Buscar venda por ID
exports.buscarVendaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo, id: usuario_id } = req.user;

    // Montar query com filtro por tipo de usuário
    let query = `SELECT v.*, uf.nome as funcionario_nome, uc.nome as cliente_nome
       FROM vendas v
       LEFT JOIN usuarios uf ON v.funcionario_id = uf.id
       LEFT JOIN usuarios uc ON v.cliente_id = uc.id
       WHERE v.id = ? AND v.unidade_id = ?`;
    
    let params = [id, unidade_id];

    // FUNCIONARIO só pode ver suas próprias vendas
    if (tipo === 'FUNCIONARIO') {
      query += ' AND v.funcionario_id = ?';
      params.push(usuario_id);
    }

    const [vendas] = await db.execute(query, params);

    if (vendas.length === 0) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    const venda = vendas[0];

    // Buscar serviços
    const [servicos] = await db.execute(
      `SELECT * FROM venda_servicos WHERE venda_id = ?`,
      [id]
    );
    venda.servicos = servicos;
    venda.produtos = [];

    res.json(venda);
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    res.status(500).json({ error: "Erro ao buscar venda" });
  }
};

// Criar venda
exports.criarVenda = async (req, res) => {
  try {
    const { unidade_id, tipo, id: usuario_id } = req.user;
    const {
      cliente_id,
      tipo_venda,
      valor_total,
      forma_pagamento,
      status_pagamento,
      observacoes,
      servicos,
      produtos
    } = req.body;

    if (tipo !== 'GERENTE' && tipo !== 'FUNCIONARIO') {
      return res.status(403).json({ 
        error: "Acesso negado." 
      });
    }

    // Validações
    if (!tipo_venda || !valor_total || !forma_pagamento) {
      return res.status(400).json({ 
        error: "Campos obrigatórios: tipo_venda, valor_total, forma_pagamento" 
      });
    }

    // Inserir venda
    const [result] = await db.execute(
      `INSERT INTO vendas (unidade_id, funcionario_id, cliente_id, tipo_venda, valor_total, 
        forma_pagamento, status_pagamento, observacoes, status_nf) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AGUARDANDO_AJUSTE')`,
      [unidade_id, usuario_id, cliente_id || null, tipo_venda, valor_total, 
       forma_pagamento, status_pagamento || 'PAGO', observacoes || null]
    );

    const venda_id = result.insertId;

    // Inserir serviços
    if (servicos && servicos.length > 0) {
      for (let servico of servicos) {
        await db.execute(
          `INSERT INTO venda_servicos (venda_id, agendamento_id, servico_id, servico_nome, servico_preco, quantidade, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [venda_id, servico.agendamento_id || null, servico.servico_id || null, 
           servico.servico_nome, servico.servico_preco, servico.quantidade || 1, servico.subtotal]
        );
      }
    }

    // Produtos virão em futuras implementações
    // A tabela venda_produtos ainda não foi criada

    res.status(201).json({ 
      message: "Venda criada com sucesso",
      venda_id 
    });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    res.status(500).json({ error: "Erro ao criar venda" });
  }
};

// Atualizar nota fiscal
exports.atualizarNotaFiscal = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;
    const { nota_fiscal, status_nf } = req.body;

    if (tipo !== 'GERENTE' && tipo !== 'FUNCIONARIO') {
      return res.status(403).json({ 
        error: "Acesso negado." 
      });
    }

    // Verificar se a venda existe e pertence à unidade
    const [vendas] = await db.execute(
      `SELECT id FROM vendas WHERE id = ? AND unidade_id = ?`,
      [id, unidade_id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    await db.execute(
      `UPDATE vendas SET nota_fiscal = ?, status_nf = ? WHERE id = ?`,
      [nota_fiscal || null, status_nf || 'EMITIDA', id]
    );

    res.json({ message: "Nota fiscal atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar nota fiscal:", error);
    res.status(500).json({ error: "Erro ao atualizar nota fiscal" });
  }
};

// Atualizar venda
exports.atualizarVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;
    const { observacoes, status_pagamento } = req.body;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem editar vendas." 
      });
    }

    const [vendas] = await db.execute(
      `SELECT id FROM vendas WHERE id = ? AND unidade_id = ?`,
      [id, unidade_id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    const campos = [];
    const valores = [];

    if (observacoes !== undefined) {
      campos.push('observacoes = ?');
      valores.push(observacoes);
    }

    if (status_pagamento !== undefined) {
      campos.push('status_pagamento = ?');
      valores.push(status_pagamento);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    valores.push(id);

    await db.execute(
      `UPDATE vendas SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    res.json({ message: "Venda atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    res.status(500).json({ error: "Erro ao atualizar venda" });
  }
};

// Excluir venda
exports.excluirVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem excluir vendas." 
      });
    }

    const [vendas] = await db.execute(
      `SELECT id FROM vendas WHERE id = ? AND unidade_id = ?`,
      [id, unidade_id]
    );

    if (vendas.length === 0) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    // Produtos virão em futuras implementações
    // Serviços não têm estoque para restaurar

    // Excluir venda (cascade vai deletar os itens)
    await db.execute(`DELETE FROM vendas WHERE id = ?`, [id]);

    res.json({ message: "Venda excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir venda:", error);
    res.status(500).json({ error: "Erro ao excluir venda" });
  }
};

module.exports = exports;
