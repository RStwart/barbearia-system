const express = require('express');
const router = express.Router();
const agendamentosClienteController = require('../controllers/agendamentos-cliente.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Listar horários disponíveis para um funcionário em uma data específica
// GET /api/agendamentos-cliente/horarios-disponiveis?unidadeId=1&funcionarioId=4&data=2025-11-15&servicoId=1
router.get('/horarios-disponiveis', agendamentosClienteController.listarHorariosDisponiveis);

// Criar novo agendamento (protegido - requer autenticação)
// POST /api/agendamentos-cliente
router.post('/', verificarToken, agendamentosClienteController.criarAgendamento);

// Listar agendamentos do cliente logado (protegido - requer autenticação)
// GET /api/agendamentos-cliente
router.get('/', verificarToken, agendamentosClienteController.listarAgendamentosCliente);

// Cancelar agendamento (protegido - requer autenticação)
// DELETE /api/agendamentos-cliente/:id
router.delete('/:id', verificarToken, agendamentosClienteController.cancelarAgendamento);

// Avaliar agendamento (protegido - requer autenticação)
// PUT /api/agendamentos-cliente/:id/avaliar
router.put('/:id/avaliar', verificarToken, agendamentosClienteController.avaliarAgendamento);

module.exports = router;
