const db = require('../config/db');

// Cadastrar novo estabelecimento (público - sem autenticação)
async function cadastrarEstabelecimento(req, res) {
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
      longitude
    } = req.body;

    // Validação básica
    if (!nome || !telefone || !email || !endereco || !numero || !bairro || !cidade || !estado) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios não preenchidos. Verifique: nome, telefone, email, endereço completo.' 
      });
    }

    // Verifica se já existe estabelecimento com mesmo CNPJ ou CPF (se fornecido)
    if (cnpj) {
      const [existenteCNPJ] = await db.query(
        'SELECT id_unidade FROM unidades WHERE cnpj = ?',
        [cnpj]
      );
      if (existenteCNPJ.length > 0) {
        return res.status(400).json({ message: 'CNPJ já cadastrado no sistema.' });
      }
    }

    if (cpf) {
      const [existenteCPF] = await db.query(
        'SELECT id_unidade FROM unidades WHERE cpf = ?',
        [cpf]
      );
      if (existenteCPF.length > 0) {
        return res.status(400).json({ message: 'CPF já cadastrado no sistema.' });
      }
    }

    // Verifica se já existe estabelecimento com mesmo email
    const [existenteEmail] = await db.query(
      'SELECT id_unidade FROM unidades WHERE email = ?',
      [email]
    );
    if (existenteEmail.length > 0) {
      return res.status(400).json({ message: 'E-mail já cadastrado no sistema.' });
    }

    // Insere o novo estabelecimento com status padrão
    const query = `
      INSERT INTO unidades (
        nome, responsavel, cnpj, cpf, telefone, email,
        cep, endereco, numero, bairro, cidade, estado, complemento,
        horario_funcionamento, horario_abertura, horario_fechamento,
        latitude, longitude,
        ativo, status_pagamento, status_avaliacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'bloqueado', 'aguardando')
    `;

    const valores = [
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
      longitude || null
    ];

    const [resultado] = await db.query(query, valores);

    res.status(201).json({
      message: 'Cadastro realizado com sucesso! Aguarde análise da nossa equipe.',
      id_unidade: resultado.insertId,
      status: {
        ativo: 0,
        status_pagamento: 'bloqueado',
        status_avaliacao: 'aguardando'
      }
    });

  } catch (error) {
    console.error('Erro ao cadastrar estabelecimento:', error);
    res.status(500).json({ 
      message: 'Erro ao processar cadastro. Tente novamente mais tarde.',
      error: error.message 
    });
  }
}

module.exports = {
  cadastrarEstabelecimento
};
