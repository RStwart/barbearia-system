const express = require('express');
const router = express.Router();
const agendamentosClienteController = require('../controllers/agendamentos-cliente.controller');

// Listar horários disponíveis para um funcionário em uma data específica
// GET /api/agendamentos-cliente/horarios-disponiveis?unidadeId=1&funcionarioId=4&data=2025-11-15&servicoId=1
router.get('/horarios-disponiveis', agendamentosClienteController.listarHorariosDisponiveis);

// Criar novo agendamento
// POST /api/agendamentos-cliente
router.post('/', agendamentosClienteController.criarAgendamento);

// Listar agendamentos do cliente logado
// GET /api/agendamentos-cliente
router.get('/', agendamentosClienteController.listarAgendamentosCliente);

// Cancelar agendamento
// DELETE /api/agendamentos-cliente/:id
router.delete('/:id', agendamentosClienteController.cancelarAgendamento);

// Avaliar agendamento
// PUT /api/agendamentos-cliente/:id/avaliar
router.put('/:id/avaliar', agendamentosClienteController.avaliarAgendamento);

module.exports = router;
