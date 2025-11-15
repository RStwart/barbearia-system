const db = require("../config/db");

// ================ LISTAR UNIDADES ================
const listarUnidades = async (req, res) => {
  try {
    const query = `
      SELECT 
        id_unidade,
        nome,
        responsavel,
        cnpj,
        cpf,
        telefone,
        email,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        complemento,
        horario_funcionamento,
        horario_abertura,
        horario_fechamento,
        latitude,
        longitude,
        data_cadastro,
        ativo,
        status_pagamento,
        status_avaliacao
      FROM unidades 
      ORDER BY data_cadastro DESC
    `;
    
    const [unidades] = await db.execute(query);
    
    res.json({
      success: true,
      unidades,
      total: unidades.length
    });
  } catch (error) {
    console.error("Erro ao listar unidades:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ LISTAR UNIDADES ATIVAS (SIMPLIFICADO) ================
const listarUnidadesAtivas = async (req, res) => {
  try {
    const query = `
      SELECT 
        id_unidade,
        nome,
        ativo
      FROM unidades 
      WHERE ativo = 1
      ORDER BY nome ASC
    `;
    
    const [unidades] = await db.execute(query);
    
    res.json({
      success: true,
      unidades,
      total: unidades.length
    });
  } catch (error) {
    console.error("Erro ao listar unidades ativas:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ BUSCAR UNIDADE POR ID ================
const buscarUnidadePorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id_unidade as id,
        nome,
        responsavel,
        cnpj,
        cpf,
        telefone,
        email,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        complemento,
        horario_funcionamento,
        horario_abertura,
        horario_fechamento,
        latitude,
        longitude,
        data_cadastro,
        ativo,
        status_pagamento,
        status_avaliacao
      FROM unidades 
      WHERE id_unidade = ?
    `;
    
    const [unidades] = await db.execute(query, [id]);
    
    if (unidades.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Unidade não encontrada"
      });
    }
    
    res.json({
      success: true,
      unidade: unidades[0]
    });
  } catch (error) {
    console.error("Erro ao buscar unidade:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ CRIAR UNIDADE ================
const criarUnidade = async (req, res) => {
  try {
    const {
      nome,
      responsavel,
      cnpj,
      cpf,
      telefone,
      email,
      cep,
      endereco,
      numero,
      bairro,
      cidade,
      estado,
      complemento,
      horario_funcionamento,
      horario_abertura,
      horario_fechamento,
      latitude,
      longitude,
      ativo = true
    } = req.body;
    
    // Validações
    if (!nome) {
      return res.status(400).json({
        success: false,
        message: "Nome da unidade é obrigatório"
      });
    }
    
    // Verificar se já existe unidade com o mesmo nome
    const [existeNome] = await db.execute(
      "SELECT id_unidade FROM unidades WHERE nome = ?", 
      [nome]
    );
    
    if (existeNome.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma unidade com este nome"
      });
    }
    
    // Verificar CNPJ se fornecido
    if (cnpj) {
      const [existeCNPJ] = await db.execute(
        "SELECT id_unidade FROM unidades WHERE cnpj = ?", 
        [cnpj]
      );
      
      if (existeCNPJ.length > 0) {
        return res.status(400).json({
          success: false,
          message: "CNPJ já está em uso por outra unidade"
        });
      }
    }
    
    // Verificar CPF se fornecido
    if (cpf) {
      const [existeCPF] = await db.execute(
        "SELECT id_unidade FROM unidades WHERE cpf = ?", 
        [cpf]
      );
      
      if (existeCPF.length > 0) {
        return res.status(400).json({
          success: false,
          message: "CPF já está em uso por outra unidade"
        });
      }
    }
    
    const query = `
      INSERT INTO unidades (
        nome, responsavel, cnpj, cpf, telefone, email, cep, endereco, numero,
        bairro, cidade, estado, complemento, horario_funcionamento,
        horario_abertura, horario_fechamento, latitude, longitude, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      nome,
      responsavel || null,
      cnpj || null,
      cpf || null,
      telefone || null,
      email || null,
      cep || null,
      endereco || null,
      numero || null,
      bairro || null,
      cidade || null,
      estado || null,
      complemento || null,
      horario_funcionamento || null,
      horario_abertura || null,
      horario_fechamento || null,
      latitude || null,
      longitude || null,
      ativo
    ]);
    
    res.status(201).json({
      success: true,
      message: "Unidade criada com sucesso",
      unidade: {
        id_unidade: result.insertId,
        nome,
        responsavel,
        cnpj,
        cpf,
        telefone,
        email,
        ativo
      }
    });
  } catch (error) {
    console.error("Erro ao criar unidade:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ ATUALIZAR UNIDADE ================
const atualizarUnidade = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      responsavel,
      cnpj,
      cpf,
      telefone,
      email,
      cep,
      endereco,
      numero,
      bairro,
      cidade,
      estado,
      complemento,
      horario_funcionamento,
      horario_abertura,
      horario_fechamento,
      latitude,
      longitude,
      ativo
    } = req.body;
    
    // Verificar se unidade existe
    const [unidadeExiste] = await db.execute(
      "SELECT id_unidade FROM unidades WHERE id_unidade = ?", 
      [id]
    );
    
    if (unidadeExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Unidade não encontrada"
      });
    }
    
    // Verificar se nome já existe (exceto a própria unidade)
    if (nome) {
      const [existeNome] = await db.execute(
        "SELECT id_unidade FROM unidades WHERE nome = ? AND id_unidade != ?", 
        [nome, id]
      );
      
      if (existeNome.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Este nome já está em uso por outra unidade"
        });
      }
    }
    
    // Verificar CNPJ se fornecido
    if (cnpj) {
      const [existeCNPJ] = await db.execute(
        "SELECT id_unidade FROM unidades WHERE cnpj = ? AND id_unidade != ?", 
        [cnpj, id]
      );
      
      if (existeCNPJ.length > 0) {
        return res.status(400).json({
          success: false,
          message: "CNPJ já está em uso por outra unidade"
        });
      }
    }
    
    // Verificar CPF se fornecido
    if (cpf) {
      const [existeCPF] = await db.execute(
        "SELECT id_unidade FROM unidades WHERE cpf = ? AND id_unidade != ?", 
        [cpf, id]
      );
      
      if (existeCPF.length > 0) {
        return res.status(400).json({
          success: false,
          message: "CPF já está em uso por outra unidade"
        });
      }
    }
    
    const query = `
      UPDATE unidades SET 
        nome = ?, responsavel = ?, cnpj = ?, cpf = ?, telefone = ?, email = ?,
        cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?,
        complemento = ?, horario_funcionamento = ?, horario_abertura = ?,
        horario_fechamento = ?, latitude = ?, longitude = ?, ativo = ?
      WHERE id_unidade = ?
    `;
    
    await db.execute(query, [
      nome,
      responsavel || null,
      cnpj || null,
      cpf || null,
      telefone || null,
      email || null,
      cep || null,
      endereco || null,
      numero || null,
      bairro || null,
      cidade || null,
      estado || null,
      complemento || null,
      horario_funcionamento || null,
      horario_abertura || null,
      horario_fechamento || null,
      latitude || null,
      longitude || null,
      ativo,
      id
    ]);
    
    res.json({
      success: true,
      message: "Unidade atualizada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar unidade:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ EXCLUIR UNIDADE ================
const excluirUnidade = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se unidade existe
    const [unidadeExiste] = await db.execute(
      "SELECT id_unidade FROM unidades WHERE id_unidade = ?", 
      [id]
    );
    
    if (unidadeExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Unidade não encontrada"
      });
    }
    
    // Verificar se existem usuários vinculados a esta unidade
    const [usuariosVinculados] = await db.execute(
      "SELECT COUNT(*) as total FROM usuarios WHERE unidade_id = ?", 
      [id]
    );
    
    if (usuariosVinculados[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: "Não é possível excluir esta unidade pois existem usuários vinculados a ela"
      });
    }
    
    await db.execute("DELETE FROM unidades WHERE id_unidade = ?", [id]);
    
    res.json({
      success: true,
      message: "Unidade excluída com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir unidade:", error);
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
    
    // Verificar se unidade existe
    const [unidadeExiste] = await db.execute(
      "SELECT id_unidade FROM unidades WHERE id_unidade = ?", 
      [id]
    );
    
    if (unidadeExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Unidade não encontrada"
      });
    }
    
    await db.execute("UPDATE unidades SET ativo = ? WHERE id_unidade = ?", [ativo, id]);
    
    res.json({
      success: true,
      message: `Unidade ${ativo ? 'ativada' : 'desativada'} com sucesso`
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

// ================ ALTERAR STATUS DE PAGAMENTO ================
const alterarStatusPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pagamento } = req.body;
    
    // Validar status de pagamento
    const statusValidos = ['pago', 'atrasado', 'bloqueado'];
    if (!statusValidos.includes(status_pagamento)) {
      return res.status(400).json({
        success: false,
        message: "Status de pagamento inválido. Use: pago, atrasado ou bloqueado"
      });
    }
    
    // Verificar se unidade existe
    const [unidadeExiste] = await db.execute(
      "SELECT id_unidade FROM unidades WHERE id_unidade = ?", 
      [id]
    );
    
    if (unidadeExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Unidade não encontrada"
      });
    }
    
    await db.execute(
      "UPDATE unidades SET status_pagamento = ? WHERE id_unidade = ?", 
      [status_pagamento, id]
    );
    
    res.json({
      success: true,
      message: `Status de pagamento alterado para '${status_pagamento}' com sucesso`
    });
  } catch (error) {
    console.error("Erro ao alterar status de pagamento:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};

// ================ ALTERAR STATUS DE AVALIAÇÃO ================
const alterarStatusAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_avaliacao } = req.body;
    
    // Validar status de avaliação
    const statusValidos = ['aprovado', 'aguardando', 'negado'];
    if (!statusValidos.includes(status_avaliacao)) {
      return res.status(400).json({
        success: false,
        message: "Status de avaliação inválido. Use: aprovado, aguardando ou negado"
      });
    }
    
    // Verificar se unidade existe
    const [unidadeExiste] = await db.execute(
      "SELECT id_unidade FROM unidades WHERE id_unidade = ?", 
      [id]
    );
    
    if (unidadeExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Unidade não encontrada"
      });
    }
    
    await db.execute(
      "UPDATE unidades SET status_avaliacao = ? WHERE id_unidade = ?", 
      [status_avaliacao, id]
    );
    
    res.json({
      success: true,
      message: `Status de avaliação alterado para '${status_avaliacao}' com sucesso`
    });
  } catch (error) {
    console.error("Erro ao alterar status de avaliação:", error);
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
    // Total de unidades
    const [totalResult] = await db.execute("SELECT COUNT(*) as total FROM unidades");
    const totalUnidades = totalResult[0].total;
    
    // Unidades ativas
    const [ativasResult] = await db.execute("SELECT COUNT(*) as ativas FROM unidades WHERE ativo = 1");
    const unidadesAtivas = ativasResult[0].ativas;
    
    // Novas unidades (últimos 30 dias)
    const [novasResult] = await db.execute(
      "SELECT COUNT(*) as novas FROM unidades WHERE data_cadastro >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const novasUnidades = novasResult[0].novas;
    
    res.json({
      success: true,
      estatisticas: {
        totalUnidades,
        unidadesAtivas,
        novasUnidades
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

// ================ LISTAR SERVIÇOS POR UNIDADE ================
const listarServicosPorUnidade = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, nome, descricao, preco, duracao, ativo,
             created_at, updated_at
      FROM servicos
      WHERE unidade_id = ? AND ativo = 1
      ORDER BY nome ASC
    `;

    const [servicos] = await db.execute(query, [id]);

    res.json({
      success: true,
      servicos
    });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar serviços',
      error: error.message
    });
  }
};

// ================ LISTAR FUNCIONÁRIOS POR UNIDADE ================
const listarFuncionariosPorUnidade = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, nome, email, telefone, foto_perfil
      FROM usuarios
      WHERE unidade_id = ? AND tipo IN ('FUNCIONARIO', 'GERENTE') AND ativo = 1
      ORDER BY nome ASC
    `;

    const [funcionarios] = await db.execute(query, [id]);

    // Mapear foto_perfil para foto_url para compatibilidade com frontend
    const funcionariosFormatados = funcionarios.map(func => ({
      ...func,
      foto_url: func.foto_perfil
    }));

    res.json({
      success: true,
      funcionarios: funcionariosFormatados
    });
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar funcionários',
      error: error.message
    });
  }
};

module.exports = {
  listarUnidades,
  listarUnidadesAtivas,
  buscarUnidadePorId,
  criarUnidade,
  atualizarUnidade,
  excluirUnidade,
  alterarStatus,
  alterarStatusPagamento,
  alterarStatusAvaliacao,
  obterEstatisticas,
  listarServicosPorUnidade,
  listarFuncionariosPorUnidade
};