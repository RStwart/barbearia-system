const db = require("../config/db.js");
const bcrypt = require("bcryptjs");

// Listar funcionários da unidade do gerente
exports.listarFuncionarios = async (req, res) => {
  try {
    const { unidade_id } = req.user; // Do token JWT
    const { tipo } = req.user;

    // Apenas GERENTE pode acessar
    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem gerenciar funcionários." 
      });
    }

    if (!unidade_id) {
      return res.status(400).json({ 
        error: "Gerente não está vinculado a nenhuma unidade." 
      });
    }

    const sql = `
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
      WHERE tipo = 'FUNCIONARIO' 
        AND unidade_id = ?
      ORDER BY nome ASC
    `;

    const [funcionarios] = await db.execute(sql, [unidade_id]);

    res.json({ 
      funcionarios,
      total: funcionarios.length 
    });
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    res.status(500).json({ error: "Erro ao listar funcionários" });
  }
};

// Buscar funcionário por ID
exports.buscarFuncionarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem visualizar funcionários." 
      });
    }

    const sql = `
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
      WHERE id = ? 
        AND tipo = 'FUNCIONARIO'
        AND unidade_id = ?
    `;

    const [funcionarios] = await db.execute(sql, [id, unidade_id]);

    if (funcionarios.length === 0) {
      return res.status(404).json({ 
        error: "Funcionário não encontrado ou não pertence a esta unidade." 
      });
    }

    res.json({ funcionario: funcionarios[0] });
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    res.status(500).json({ error: "Erro ao buscar funcionário" });
  }
};

// Criar novo funcionário
exports.criarFuncionario = async (req, res) => {
  try {
    const { nome, email, telefone, foto_perfil } = req.body;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem criar funcionários." 
      });
    }

    if (!unidade_id) {
      return res.status(400).json({ 
        error: "Gerente não está vinculado a nenhuma unidade." 
      });
    }

    if (!nome || !email) {
      return res.status(400).json({ 
        error: "Nome e email são obrigatórios." 
      });
    }

    // Verificar se email já existe
    const [existente] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      return res.status(400).json({ 
        error: "Este email já está cadastrado no sistema." 
      });
    }

    // Gerar senha padrão (pode ser o CPF ou email antes do @)
    const senhaTemporaria = 'Funcionario123'; // Senha padrão
    const senhaHash = await bcrypt.hash(senhaTemporaria, 12);

    const sql = `
      INSERT INTO usuarios (
        nome, 
        email, 
        senha, 
        telefone, 
        foto_perfil, 
        tipo, 
        unidade_id, 
        ativo, 
        primeiro_acesso
      ) VALUES (?, ?, ?, ?, ?, 'FUNCIONARIO', ?, TRUE, TRUE)
    `;

    const [result] = await db.execute(sql, [
      nome,
      email,
      senhaHash,
      telefone || null,
      foto_perfil || null,
      unidade_id
    ]);

    res.status(201).json({
      message: "Funcionário criado com sucesso",
      funcionario: {
        id: result.insertId,
        nome,
        email,
        telefone,
        foto_perfil,
        tipo: 'FUNCIONARIO',
        unidade_id,
        ativo: true,
        primeiro_acesso: true
      },
      info: "Senha padrão: Funcionario123 (deverá ser alterada no primeiro acesso)"
    });
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    res.status(500).json({ error: "Erro ao criar funcionário" });
  }
};

// Atualizar funcionário
exports.atualizarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, foto_perfil, ativo } = req.body;
    const { unidade_id, tipo } = req.user;

    console.log('=== ATUALIZAR FUNCIONÁRIO ===');
    console.log('ID:', id);
    console.log('Dados recebidos:', { nome, email, telefone, foto_perfil, ativo });
    console.log('Unidade ID do gerente:', unidade_id);

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem atualizar funcionários." 
      });
    }

    // Verificar se o funcionário pertence à unidade do gerente
    const [funcionario] = await db.execute(
      'SELECT id FROM usuarios WHERE id = ? AND tipo = \'FUNCIONARIO\' AND unidade_id = ?',
      [id, unidade_id]
    );

    console.log('Funcionário encontrado:', funcionario);

    if (funcionario.length === 0) {
      return res.status(404).json({ 
        error: "Funcionário não encontrado ou não pertence a esta unidade." 
      });
    }

    // Verificar se email já existe (exceto o próprio funcionário)
    if (email) {
      const [existente] = await db.execute(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existente.length > 0) {
        return res.status(400).json({ 
          error: "Este email já está cadastrado no sistema." 
        });
      }
    }

    const campos = [];
    const valores = [];

    if (nome !== undefined && nome !== null) {
      campos.push('nome = ?');
      valores.push(nome);
    }

    if (email !== undefined && email !== null) {
      campos.push('email = ?');
      valores.push(email);
    }

    if (telefone !== undefined) {
      campos.push('telefone = ?');
      valores.push(telefone || null);
    }

    if (foto_perfil !== undefined) {
      campos.push('foto_perfil = ?');
      valores.push(foto_perfil || null);
    }

    if (ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(ativo ? 1 : 0);
    }

    if (campos.length === 0) {
      return res.status(400).json({ 
        error: "Nenhum campo para atualizar foi fornecido." 
      });
    }

    valores.push(id);

    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;

    console.log('SQL:', sql);
    console.log('Valores:', valores);

    const [result] = await db.execute(sql, valores);

    console.log('Resultado da atualização:', result);

    res.json({ message: "Funcionário atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    res.status(500).json({ error: "Erro ao atualizar funcionário" });
  }
};

// Excluir (desativar) funcionário
exports.excluirFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    console.log('=== EXCLUIR FUNCIONÁRIO ===');
    console.log('ID:', id);
    console.log('Unidade ID do gerente:', unidade_id);

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem excluir funcionários." 
      });
    }

    // Verificar se o funcionário pertence à unidade do gerente
    const [funcionario] = await db.execute(
      'SELECT id FROM usuarios WHERE id = ? AND tipo = \'FUNCIONARIO\' AND unidade_id = ?',
      [id, unidade_id]
    );

    console.log('Funcionário encontrado:', funcionario);

    if (funcionario.length === 0) {
      return res.status(404).json({ 
        error: "Funcionário não encontrado ou não pertence a esta unidade." 
      });
    }

    // Desativar ao invés de deletar
    const [result] = await db.execute(
      'UPDATE usuarios SET ativo = 0 WHERE id = ?',
      [id]
    );

    console.log('Resultado da exclusão:', result);

    res.json({ message: "Funcionário desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    res.status(500).json({ error: "Erro ao excluir funcionário" });
  }
};

// Alternar status ativo/inativo
exports.alternarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem alterar status de funcionários." 
      });
    }

    // Verificar se o funcionário pertence à unidade do gerente
    const [funcionario] = await db.execute(
      'SELECT ativo FROM usuarios WHERE id = ? AND tipo = \'FUNCIONARIO\' AND unidade_id = ?',
      [id, unidade_id]
    );

    if (funcionario.length === 0) {
      return res.status(404).json({ 
        error: "Funcionário não encontrado ou não pertence a esta unidade." 
      });
    }

    const novoStatus = !funcionario[0].ativo;

    await db.execute(
      'UPDATE usuarios SET ativo = ? WHERE id = ?',
      [novoStatus, id]
    );

    res.json({ 
      message: `Funcionário ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
      ativo: novoStatus
    });
  } catch (error) {
    console.error("Erro ao alternar status:", error);
    res.status(500).json({ error: "Erro ao alternar status do funcionário" });
  }
};

// Resetar senha do funcionário
exports.resetarSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { unidade_id, tipo } = req.user;

    if (tipo !== 'GERENTE') {
      return res.status(403).json({ 
        error: "Acesso negado. Apenas gerentes podem resetar senhas." 
      });
    }

    // Verificar se o funcionário pertence à unidade do gerente
    const [funcionario] = await db.execute(
      'SELECT id FROM usuarios WHERE id = ? AND tipo = "FUNCIONARIO" AND unidade_id = ?',
      [id, unidade_id]
    );

    if (funcionario.length === 0) {
      return res.status(404).json({ 
        error: "Funcionário não encontrado ou não pertence a esta unidade." 
      });
    }

    // Resetar para senha padrão e marcar como primeiro acesso
    const senhaTemporaria = 'Funcionario123';
    const senhaHash = await bcrypt.hash(senhaTemporaria, 12);

    await db.execute(
      'UPDATE usuarios SET senha = ?, primeiro_acesso = TRUE WHERE id = ?',
      [senhaHash, id]
    );

    res.json({ 
      message: "Senha resetada com sucesso",
      info: "Nova senha: Funcionario123 (deverá ser alterada no próximo acesso)"
    });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    res.status(500).json({ error: "Erro ao resetar senha do funcionário" });
  }
};
