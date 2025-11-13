const db = require("../config/db");

// ================ LISTAR HORÁRIOS DISPONÍVEIS ================
exports.listarHorariosDisponiveis = async (req, res) => {
  try {
    const { unidadeId, funcionarioId, data, servicoId } = req.query;

    if (!unidadeId || !funcionarioId || !data || !servicoId) {
      return res.status(400).json({
        success: false,
        message: "Parâmetros obrigatórios: unidadeId, funcionarioId, data, servicoId"
      });
    }

    // Buscar informações do serviço para saber a duração
    const [servicos] = await db.execute(
      'SELECT duracao FROM servicos WHERE id = ?',
      [servicoId]
    );

    if (servicos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Serviço não encontrado"
      });
    }

    const duracaoServico = servicos[0].duracao; // em minutos

    // Buscar agendamentos já existentes para este funcionário nesta data
    const [agendamentos] = await db.execute(
      `SELECT hora_inicio, hora_fim 
       FROM agendamentos 
       WHERE funcionario_id = ? 
         AND data_agendamento = ? 
         AND status NOT IN ('cancelado')
       ORDER BY hora_inicio`,
      [funcionarioId, data]
    );

    // Gerar todos os horários possíveis (9h às 18h, intervalos de 30 min)
    const horarios = [];
    const horaInicio = 9;
    const horaFim = 18;
    const intervalo = 30; // minutos

    for (let hora = horaInicio; hora < horaFim; hora++) {
      for (let minuto = 0; minuto < 60; minuto += intervalo) {
        const horarioAtual = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`;
        
        // Calcular horário de término baseado na duração do serviço
        const [h, m] = horarioAtual.split(':').map(Number);
        const totalMinutos = h * 60 + m + duracaoServico;
        const horaFimServico = Math.floor(totalMinutos / 60);
        const minutoFimServico = totalMinutos % 60;
        
        // Não oferecer horários que ultrapassem 18h
        if (horaFimServico > horaFim || (horaFimServico === horaFim && minutoFimServico > 0)) {
          continue;
        }

        const horarioFimServico = `${horaFimServico.toString().padStart(2, '0')}:${minutoFimServico.toString().padStart(2, '0')}:00`;

        // Verificar se há conflito com agendamentos existentes
        let disponivel = true;
        
        for (const agendamento of agendamentos) {
          const inicioExistente = agendamento.hora_inicio;
          const fimExistente = agendamento.hora_fim;

          // Verificar se há sobreposição de horários
          if (
            (horarioAtual >= inicioExistente && horarioAtual < fimExistente) ||
            (horarioFimServico > inicioExistente && horarioFimServico <= fimExistente) ||
            (horarioAtual <= inicioExistente && horarioFimServico >= fimExistente)
          ) {
            disponivel = false;
            break;
          }
        }

        horarios.push({
          hora: horarioAtual.substring(0, 5), // Formato HH:MM
          disponivel
        });
      }
    }

    res.json({
      success: true,
      horarios,
      duracaoServico
    });

  } catch (error) {
    console.error("Erro ao listar horários disponíveis:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar horários disponíveis",
      error: error.message
    });
  }
};

// ================ CRIAR AGENDAMENTO ================
exports.criarAgendamento = async (req, res) => {
  try {
    const {
      unidadeId,
      servicoId,
      funcionarioId,
      dataAgendamento,
      horarioInicio,
      metodoPagamento,
      observacoes
    } = req.body;

    // Validações
    if (!unidadeId || !servicoId || !funcionarioId || !dataAgendamento || !horarioInicio || !metodoPagamento) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios"
      });
    }

    // Buscar informações do serviço
    const [servicos] = await db.execute(
      'SELECT nome, preco, duracao FROM servicos WHERE id = ? AND ativo = 1',
      [servicoId]
    );

    if (servicos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Serviço não encontrado ou inativo"
      });
    }

    const servico = servicos[0];
    const duracaoMinutos = servico.duracao;
    const valorTotal = parseFloat(servico.preco);

    // Calcular horário de término
    const [hora, minuto] = horarioInicio.split(':').map(Number);
    const totalMinutos = hora * 60 + minuto + duracaoMinutos;
    const horaFim = Math.floor(totalMinutos / 60);
    const minutoFim = totalMinutos % 60;
    const horarioFim = `${horaFim.toString().padStart(2, '0')}:${minutoFim.toString().padStart(2, '0')}:00`;

    // Verificar disponibilidade do horário
    const [conflitos] = await db.execute(
      `SELECT id FROM agendamentos 
       WHERE funcionario_id = ? 
         AND data_agendamento = ? 
         AND status NOT IN ('cancelado')
         AND (
           (hora_inicio <= ? AND hora_fim > ?) OR
           (hora_inicio < ? AND hora_fim >= ?) OR
           (hora_inicio >= ? AND hora_fim <= ?)
         )`,
      [
        funcionarioId, 
        dataAgendamento, 
        horarioInicio, horarioInicio,
        horarioFim, horarioFim,
        horarioInicio, horarioFim
      ]
    );

    if (conflitos.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Este horário não está mais disponível para o profissional selecionado"
      });
    }

    // ID do cliente (em produção viria do token de autenticação)
    // Por enquanto vamos usar um cliente padrão
    const clienteId = 2; // TODO: Pegar do req.user após implementar autenticação

    // Criar agendamento
    const [result] = await db.execute(
      `INSERT INTO agendamentos 
       (unidade_id, cliente_id, funcionario_id, servico_id, data_agendamento, 
        hora_inicio, hora_fim, valor_total, status, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        unidadeId,
        clienteId,
        funcionarioId,
        servicoId,
        dataAgendamento,
        horarioInicio + ':00',
        horarioFim,
        valorTotal,
        'confirmado',
        observacoes || null
      ]
    );

    // Buscar agendamento criado com informações completas
    const [agendamentoCriado] = await db.execute(
      `SELECT 
        a.*,
        s.nome as servico_nome,
        f.nome as funcionario_nome,
        u.nome as unidade_nome
       FROM agendamentos a
       JOIN servicos s ON a.servico_id = s.id
       JOIN usuarios f ON a.funcionario_id = f.id
       JOIN unidades u ON a.unidade_id = u.id_unidade
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Agendamento criado com sucesso!",
      agendamento: agendamentoCriado[0]
    });

  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: "Este horário já está reservado"
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro ao criar agendamento",
      error: error.message
    });
  }
};

// ================ LISTAR AGENDAMENTOS DO CLIENTE ================
exports.listarAgendamentosCliente = async (req, res) => {
  try {
    // TODO: Pegar cliente_id do token de autenticação
    const clienteId = 2; // Temporário

    const [agendamentos] = await db.execute(
      `SELECT 
        a.*,
        s.nome as servico_nome,
        s.descricao as servico_descricao,
        f.nome as funcionario_nome,
        f.foto_perfil as funcionario_foto,
        u.nome as unidade_nome,
        u.endereco,
        u.cidade,
        u.telefone,
        a.avaliacao,
        a.comentario_avaliacao
       FROM agendamentos a
       JOIN servicos s ON a.servico_id = s.id
       JOIN usuarios f ON a.funcionario_id = f.id
       JOIN unidades u ON a.unidade_id = u.id_unidade
       WHERE a.cliente_id = ?
       ORDER BY a.data_agendamento DESC, a.hora_inicio DESC`,
      [clienteId]
    );

    res.json({
      success: true,
      agendamentos
    });

  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar agendamentos",
      error: error.message
    });
  }
};

// ================ CANCELAR AGENDAMENTO ================
exports.cancelarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = 2; // TODO: Pegar do token

    // Verificar se o agendamento existe e pertence ao cliente
    const [agendamentos] = await db.execute(
      'SELECT * FROM agendamentos WHERE id = ? AND cliente_id = ?',
      [id, clienteId]
    );

    if (agendamentos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Agendamento não encontrado"
      });
    }

    // Atualizar status para cancelado
    await db.execute(
      'UPDATE agendamentos SET status = ? WHERE id = ?',
      ['cancelado', id]
    );

    res.json({
      success: true,
      message: "Agendamento cancelado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao cancelar agendamento",
      error: error.message
    });
  }
};

// ================ AVALIAR AGENDAMENTO ================
exports.avaliarAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, comentario } = req.body;
    const clienteId = 2; // TODO: Pegar do token

    // Validar nota
    if (!nota || nota < 1 || nota > 5) {
      return res.status(400).json({
        success: false,
        message: "Nota deve ser entre 1 e 5"
      });
    }

    // Verificar se o agendamento existe, pertence ao cliente e está concluído
    const [agendamentos] = await db.execute(
      'SELECT * FROM agendamentos WHERE id = ? AND cliente_id = ? AND status = ?',
      [id, clienteId, 'concluido']
    );

    if (agendamentos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Agendamento não encontrado ou não pode ser avaliado"
      });
    }

    // Verificar se já foi avaliado
    if (agendamentos[0].avaliacao) {
      return res.status(400).json({
        success: false,
        message: "Este agendamento já foi avaliado"
      });
    }

    // Salvar avaliação
    await db.execute(
      'UPDATE agendamentos SET avaliacao = ?, comentario_avaliacao = ? WHERE id = ?',
      [nota, comentario || null, id]
    );

    res.json({
      success: true,
      message: "Avaliação registrada com sucesso"
    });

  } catch (error) {
    console.error("Erro ao avaliar agendamento:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao registrar avaliação",
      error: error.message
    });
  }
};
