const db = require("../config/db.js");

// Listar agendamentos por unidade e data
exports.listarAgendamentos = async (req, res) => {
  try {
    const { unidade_id, data_inicio, data_fim } = req.query;

    let sql = `
      SELECT 
        a.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        c.email as cliente_email,
        f.nome as funcionario_nome,
        s.nome as servico_nome,
        s.duracao as servico_duracao,
        u.nome as unidade_nome
      FROM agendamentos a
      INNER JOIN usuarios c ON a.cliente_id = c.id
      INNER JOIN usuarios f ON a.funcionario_id = f.id
      INNER JOIN servicos s ON a.servico_id = s.id
      INNER JOIN unidades u ON a.unidade_id = u.id_unidade
      WHERE 1=1
    `;

    const params = [];

    if (unidade_id) {
      sql += ` AND a.unidade_id = ?`;
      params.push(unidade_id);
    }

    if (data_inicio && data_fim) {
      sql += ` AND a.data_agendamento BETWEEN ? AND ?`;
      params.push(data_inicio, data_fim);
    } else if (data_inicio) {
      sql += ` AND a.data_agendamento >= ?`;
      params.push(data_inicio);
    } else if (data_fim) {
      sql += ` AND a.data_agendamento <= ?`;
      params.push(data_fim);
    }

    sql += ` ORDER BY a.data_agendamento ASC, a.hora_inicio ASC`;

    const [agendamentos] = await db.execute(sql, params);
    res.json({ agendamentos });
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    res.status(500).json({ error: "Erro ao listar agendamentos" });
  }
};

// Buscar agendamento por ID
exports.buscarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        a.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        c.email as cliente_email,
        f.nome as funcionario_nome,
        s.nome as servico_nome,
        s.duracao as servico_duracao,
        s.preco as servico_preco,
        u.nome as unidade_nome
      FROM agendamentos a
      INNER JOIN usuarios c ON a.cliente_id = c.id
      INNER JOIN usuarios f ON a.funcionario_id = f.id
      INNER JOIN servicos s ON a.servico_id = s.id
      INNER JOIN unidades u ON a.unidade_id = u.id_unidade
      WHERE a.id = ?
    `;

    const [agendamentos] = await db.execute(sql, [id]);

    if (agendamentos.length === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json({ agendamento: agendamentos[0] });
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    res.status(500).json({ error: "Erro ao buscar agendamento" });
  }
};

// Criar novo agendamento
exports.criarAgendamento = async (req, res) => {
  try {
    const {
      unidade_id,
      cliente_id,
      funcionario_id,
      servico_id,
      data_agendamento,
      hora_inicio,
      hora_fim,
      observacoes,
      valor_total,
      status = 'pendente'
    } = req.body;

    // Validações
    if (!unidade_id || !cliente_id || !funcionario_id || !servico_id || !data_agendamento || !hora_inicio || !hora_fim || !valor_total) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }

    // Verificar conflito de horário para o funcionário
    const sqlConflito = `
      SELECT COUNT(*) as total 
      FROM agendamentos 
      WHERE funcionario_id = ? 
        AND data_agendamento = ? 
        AND status NOT IN ('cancelado', 'concluido')
        AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_fim <= ?)
        )
    `;

    const [conflitos] = await db.execute(sqlConflito, [
      funcionario_id, 
      data_agendamento,
      hora_fim, hora_inicio,
      hora_fim, hora_inicio,
      hora_inicio, hora_fim
    ]);

    if (conflitos[0].total > 0) {
      return res.status(400).json({ error: "Horário indisponível para este funcionário" });
    }

    const sql = `
      INSERT INTO agendamentos (
        unidade_id, cliente_id, funcionario_id, servico_id,
        data_agendamento, hora_inicio, hora_fim, status,
        observacoes, valor_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      unidade_id, cliente_id, funcionario_id, servico_id,
      data_agendamento, hora_inicio, hora_fim, status,
      observacoes || null, valor_total
    ]);

    res.status(201).json({ 
      message: "Agendamento criado com sucesso!",
      id: result.insertId
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};

// Atualizar agendamento
exports.atualizarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      funcionario_id,
      servico_id,
      data_agendamento,
      hora_inicio,
      hora_fim,
      status,
      observacoes,
      valor_total
    } = req.body;

    // Verificar se agendamento existe
    const [agendamentoExiste] = await db.execute(
      'SELECT * FROM agendamentos WHERE id = ?',
      [id]
    );

    if (agendamentoExiste.length === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    // Verificar conflito de horário se estiver alterando data/hora/funcionário
    if (funcionario_id && data_agendamento && hora_inicio && hora_fim) {
      const sqlConflito = `
        SELECT COUNT(*) as total 
        FROM agendamentos 
        WHERE funcionario_id = ? 
          AND data_agendamento = ? 
          AND status NOT IN ('cancelado', 'concluido')
          AND id != ?
          AND (
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio < ? AND hora_fim > ?) OR
            (hora_inicio >= ? AND hora_fim <= ?)
          )
      `;

      const [conflitos] = await db.execute(sqlConflito, [
        funcionario_id, 
        data_agendamento,
        id,
        hora_fim, hora_inicio,
        hora_fim, hora_inicio,
        hora_inicio, hora_fim
      ]);

      if (conflitos[0].total > 0) {
        return res.status(400).json({ error: "Horário indisponível para este funcionário" });
      }
    }

    let sql = 'UPDATE agendamentos SET ';
    const updates = [];
    const params = [];

    if (funcionario_id !== undefined) {
      updates.push('funcionario_id = ?');
      params.push(funcionario_id);
    }
    if (servico_id !== undefined) {
      updates.push('servico_id = ?');
      params.push(servico_id);
    }
    if (data_agendamento !== undefined) {
      updates.push('data_agendamento = ?');
      params.push(data_agendamento);
    }
    if (hora_inicio !== undefined) {
      updates.push('hora_inicio = ?');
      params.push(hora_inicio);
    }
    if (hora_fim !== undefined) {
      updates.push('hora_fim = ?');
      params.push(hora_fim);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (observacoes !== undefined) {
      updates.push('observacoes = ?');
      params.push(observacoes);
    }
    if (valor_total !== undefined) {
      updates.push('valor_total = ?');
      params.push(valor_total);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await db.execute(sql, params);

    res.json({ message: "Agendamento atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    res.status(500).json({ error: "Erro ao atualizar agendamento" });
  }
};

// Cancelar agendamento
exports.cancelarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "UPDATE agendamentos SET status = 'cancelado' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json({ message: "Agendamento cancelado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    res.status(500).json({ error: "Erro ao cancelar agendamento" });
  }
};

// Deletar agendamento
exports.deletarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM agendamentos WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json({ message: "Agendamento excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    res.status(500).json({ error: "Erro ao deletar agendamento" });
  }
};

// Listar serviços por unidade
exports.listarServicos = async (req, res) => {
  try {
    const { unidade_id } = req.query;

    let sql = 'SELECT * FROM servicos WHERE ativo = TRUE';
    const params = [];

    if (unidade_id) {
      sql += ' AND unidade_id = ?';
      params.push(unidade_id);
    }

    sql += ' ORDER BY nome ASC';

    const [servicos] = await db.execute(sql, params);
    res.json({ servicos });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(500).json({ error: "Erro ao listar serviços" });
  }
};

// Listar funcionários por unidade
exports.listarFuncionarios = async (req, res) => {
  try {
    const { unidade_id } = req.query;

    let sql = `
      SELECT id, nome, email, telefone 
      FROM usuarios 
      WHERE tipo IN ('FUNCIONARIO', 'GERENTE') 
        AND ativo = TRUE
    `;
    const params = [];

    if (unidade_id) {
      sql += ' AND unidade_id = ?';
      params.push(unidade_id);
    }

    sql += ' ORDER BY nome ASC';

    const [funcionarios] = await db.execute(sql, params);
    res.json({ funcionarios });
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    res.status(500).json({ error: "Erro ao listar funcionários" });
  }
};
