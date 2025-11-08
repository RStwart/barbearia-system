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
  try {
    const { id } = req.params;
    
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
    
    await db.execute("DELETE FROM usuarios WHERE id = ?", [id]);
    
    res.json({
      success: true,
      message: "Usuário excluído com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
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
    
    res.json({
      success: true,
      estatisticas: {
        totalUsuarios,
        usuariosAtivos,
        estabelecimentos,
        novosCadastros
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