const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ================ LISTAR USUÁRIOS ================
const listarUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        nome, 
        email, 
        telefone, 
        foto_perfil, 
        tipo, 
        unidade_id, 
        ativo, 
        criado_em,
        primeiro_acesso
      FROM usuarios 
      ORDER BY criado_em DESC
    `;
    
    const [usuarios] = await db.execute(query);
    
    res.json({
      success: true,
      usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ BUSCAR USUÁRIO POR ID ================
const buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, 
        nome, 
        email, 
        telefone, 
        foto_perfil, 
        tipo, 
        unidade_id, 
        ativo, 
        criado_em 
      FROM usuarios 
      WHERE id = ?
    `;
    
    const [usuarios] = await db.execute(query, [id]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }
    
    res.json({
      success: true,
      usuario: usuarios[0]
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ CRIAR USUÁRIO ================
const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, telefone, foto_perfil, tipo, unidade_id, ativo = true, primeiro_acesso = true } = req.body;
    
    // Validações
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({
        success: false,
        message: "Nome, email, senha e tipo são obrigatórios"
      });
    }
    
    // Verificar se email já existe
    const [existeEmail] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ?", 
      [email]
    );
    
    if (existeEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este email já está em uso"
      });
    }
    
    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 12);
    
    const query = `
      INSERT INTO usuarios (nome, email, senha, telefone, foto_perfil, tipo, unidade_id, ativo, primeiro_acesso) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      nome, 
      email, 
      senhaHash, 
      telefone || null,
      foto_perfil || null,
      tipo, 
      unidade_id || null, 
      ativo,
      primeiro_acesso
    ]);
    
    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      usuario: {
        id: result.insertId,
        nome,
        email,
        telefone,
        foto_perfil,
        tipo,
        unidade_id,
        ativo,
        primeiro_acesso
      }
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ ATUALIZAR USUÁRIO ================
const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, telefone, foto_perfil, tipo, unidade_id, ativo, primeiro_acesso } = req.body;
    
    // Verificar se usuário existe
    const [usuarioExiste] = await db.execute(
      "SELECT id FROM usuarios WHERE id = ?", 
      [id]
    );
    
    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }
    
    // Verificar se email já existe (exceto o próprio usuário)
    if (email) {
      const [existeEmail] = await db.execute(
        "SELECT id FROM usuarios WHERE email = ? AND id != ?", 
        [email, id]
      );
      
      if (existeEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Este email já está em uso por outro usuário"
        });
      }
    }
    
    // Preparar campos para atualização
    let campos = [];
    let valores = [];
    
    if (nome) {
      campos.push("nome = ?");
      valores.push(nome);
    }
    
    if (email) {
      campos.push("email = ?");
      valores.push(email);
    }
    
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 12);
      campos.push("senha = ?");
      valores.push(senhaHash);
    }
    
    if (telefone !== undefined) {
      campos.push("telefone = ?");
      valores.push(telefone || null);
    }

    if (foto_perfil !== undefined) {
      campos.push("foto_perfil = ?");
      valores.push(foto_perfil || null);
    }
    
    if (tipo) {
      campos.push("tipo = ?");
      valores.push(tipo);
    }
    
    if (unidade_id !== undefined) {
      campos.push("unidade_id = ?");
      valores.push(unidade_id || null);
    }
    
    if (ativo !== undefined) {
      campos.push("ativo = ?");
      valores.push(ativo);
    }

    if (primeiro_acesso !== undefined) {
      campos.push("primeiro_acesso = ?");
      valores.push(primeiro_acesso);
    }
    
    if (campos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nenhum campo para atualizar foi fornecido"
      });
    }
    
    valores.push(id);
    
    const query = `UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`;
    
    await db.execute(query, valores);
    
    res.json({
      success: true,
      message: "Usuário atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ EXCLUIR USUÁRIO ================
const excluirUsuario = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Verificar se usuário existe
    const [usuarioExiste] = await connection.execute(
      "SELECT id FROM usuarios WHERE id = ?", 
      [id]
    );
    
    if (usuarioExiste.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }
    
    // 1. Deletar venda_servicos relacionados às vendas onde o usuário é funcionário ou cliente
    await connection.execute(`
      DELETE vs FROM venda_servicos vs
      INNER JOIN vendas v ON vs.venda_id = v.id
      WHERE v.funcionario_id = ? OR v.cliente_id = ?
    `, [id, id]);
    
    // 2. Deletar vendas onde o usuário é funcionário ou cliente
    await connection.execute(
      "DELETE FROM vendas WHERE funcionario_id = ? OR cliente_id = ?", 
      [id, id]
    );
    
    // 3. Deletar agendamentos onde o usuário é cliente ou funcionário
    await connection.execute(
      "DELETE FROM agendamentos WHERE funcionario_id = ? OR cliente_id = ?", 
      [id, id]
    );
    
    // 4. Deletar o usuário
    await connection.execute("DELETE FROM usuarios WHERE id = ?", [id]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: "Usuário excluído com sucesso"
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao excluir usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ================ ALTERAR STATUS ================
const alterarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    
    // Verificar se usuário existe
    const [usuarioExiste] = await db.execute(
      "SELECT id FROM usuarios WHERE id = ?", 
      [id]
    );
    
    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }
    
    await db.execute("UPDATE usuarios SET ativo = ? WHERE id = ?", [ativo, id]);
    
    res.json({
      success: true,
      message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ ESTATÍSTICAS ================
const obterEstatisticas = async (req, res) => {
  try {
    const { unidade_id } = req.query;
    
    console.log('📊 Carregando estatísticas - Unidade ID:', unidade_id || 'TODAS');

    // Filtro de unidade
    const filtroUnidade = unidade_id ? 'WHERE unidade_id = ?' : '';
    const filtroUnidadeParams = unidade_id ? [unidade_id] : [];

    // Total de usuários
    const [totalResult] = await db.execute("SELECT COUNT(*) as total FROM usuarios");
    const totalUsuarios = totalResult[0].total;
    
    // Usuários ativos
    const [ativosResult] = await db.execute("SELECT COUNT(*) as ativos FROM usuarios WHERE ativo = 1");
    const usuariosAtivos = ativosResult[0].ativos;
    
    // Estabelecimentos (unidades ativas da tabela unidades)
    const [estabelecimentosResult] = await db.execute("SELECT COUNT(*) as estabelecimentos FROM unidades WHERE ativo = 1");
    const estabelecimentos = estabelecimentosResult[0].estabelecimentos;
    
    // Novos cadastros (últimos 30 dias)
    const [novosResult] = await db.execute(
      "SELECT COUNT(*) as novos FROM usuarios WHERE criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const novosCadastros = novosResult[0].novos;

    // Usuários por tipo (com filtro de unidade opcional)
    let queryUsuariosPorTipo = `
      SELECT tipo, COUNT(*) as quantidade 
      FROM usuarios 
      ${unidade_id ? 'WHERE unidade_id = ?' : ''}
      GROUP BY tipo 
      ORDER BY quantidade DESC
    `;
    const [usuariosPorTipo] = await db.execute(queryUsuariosPorTipo, filtroUnidadeParams);

    // Agendamentos hoje (com filtro de unidade)
    let queryAgendamentosHoje = `
      SELECT COUNT(*) as total 
      FROM agendamentos 
      WHERE DATE(data_agendamento) = CURDATE()
      ${unidade_id ? 'AND unidade_id = ?' : ''}
    `;
    const [agendamentosHoje] = await db.execute(queryAgendamentosHoje, filtroUnidadeParams);

    // Agendamentos por status (com filtro de unidade)
    let queryAgendamentosPorStatus = `
      SELECT status, COUNT(*) as quantidade 
      FROM agendamentos
      ${unidade_id ? 'WHERE unidade_id = ?' : ''}
      GROUP BY status
    `;
    const [agendamentosPorStatus] = await db.execute(queryAgendamentosPorStatus, filtroUnidadeParams);

    // Vendas do mês (com filtro de unidade)
    let queryVendasMes = `
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor_total), 0) as valor_total
      FROM vendas 
      WHERE MONTH(criado_em) = MONTH(CURDATE()) 
      AND YEAR(criado_em) = YEAR(CURDATE())
      ${unidade_id ? 'AND unidade_id = ?' : ''}
    `;
    const [vendasMes] = await db.execute(queryVendasMes, filtroUnidadeParams);

    // Vendas hoje (com filtro de unidade)
    let queryVendasHoje = `
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor_total), 0) as valor_total
      FROM vendas 
      WHERE DATE(criado_em) = CURDATE()
      ${unidade_id ? 'AND unidade_id = ?' : ''}
    `;
    const [vendasHoje] = await db.execute(queryVendasHoje, filtroUnidadeParams);

    // Unidades mais ativas (com filtro de unidade)
    let queryUnidadesAtivas = `
      SELECT 
        u.nome,
        COUNT(a.id) as total_agendamentos,
        COALESCE(SUM(v.valor_total), 0) as receita_mes
      FROM unidades u
      LEFT JOIN agendamentos a ON u.id_unidade = a.unidade_id 
        AND MONTH(a.data_agendamento) = MONTH(CURDATE())
        AND YEAR(a.data_agendamento) = YEAR(CURDATE())
      LEFT JOIN vendas v ON u.id_unidade = v.unidade_id
        AND MONTH(v.criado_em) = MONTH(CURDATE())
        AND YEAR(v.criado_em) = YEAR(CURDATE())
      WHERE u.ativo = 1
      ${unidade_id ? 'AND u.id_unidade = ?' : ''}
      GROUP BY u.id_unidade, u.nome
      ORDER BY total_agendamentos DESC
      LIMIT 5
    `;
    const [unidadesAtivas] = await db.execute(queryUnidadesAtivas, filtroUnidadeParams);

    // Serviços mais procurados (com filtro de unidade)
    let queryServicosMaisVendidos = `
      SELECT 
        vs.servico_nome,
        COUNT(*) as total_vendido
      FROM venda_servicos vs
      INNER JOIN vendas v ON vs.venda_id = v.id
      WHERE MONTH(v.criado_em) = MONTH(CURDATE())
      AND YEAR(v.criado_em) = YEAR(CURDATE())
      ${unidade_id ? 'AND v.unidade_id = ?' : ''}
      GROUP BY vs.servico_nome
      ORDER BY total_vendido DESC
      LIMIT 5
    `;
    const [servicosMaisVendidos] = await db.execute(queryServicosMaisVendidos, filtroUnidadeParams);

    // Crescimento mensal (últimos 6 meses) (com filtro de unidade)
    let queryCrescimentoMensal = `
      SELECT 
        DATE_FORMAT(criado_em, '%Y-%m') as mes,
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor_total), 0) as receita
      FROM vendas
      WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      ${unidade_id ? 'AND unidade_id = ?' : ''}
      GROUP BY DATE_FORMAT(criado_em, '%Y-%m')
      ORDER BY mes ASC
    `;
    const [crescimentoMensal] = await db.execute(queryCrescimentoMensal, filtroUnidadeParams);

    console.log('📊 Estatísticas Carregadas:');
    console.log('Total Usuários:', totalUsuarios);
    console.log('Estabelecimentos:', estabelecimentos);
    console.log('Agendamentos Hoje:', agendamentosHoje[0].total);
    console.log('Vendas Mês:', vendasMes[0]);
    console.log('Vendas Hoje:', vendasHoje[0]);
    console.log('Unidades Ativas:', unidadesAtivas.length);
    console.log('Serviços Vendidos:', servicosMaisVendidos.length);
    console.log('Crescimento:', crescimentoMensal.length);
    
    res.json({
      success: true,
      estatisticas: {
        totalUsuarios,
        usuariosAtivos,
        estabelecimentos,
        novosCadastros,
        usuariosPorTipo,
        agendamentosHoje: agendamentosHoje[0].total,
        agendamentosPorStatus,
        vendasMes: vendasMes[0],
        vendasHoje: vendasHoje[0],
        unidadesAtivas,
        servicosMaisVendidos,
        crescimentoMensal
      }
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  alterarStatus,
  obterEstatisticas
};