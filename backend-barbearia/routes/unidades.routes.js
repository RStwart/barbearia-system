const express = require('express');
const router = express.Router();
const unidadesController = require('../controllers/unidades.controller');

// Rotas públicas (sem autenticação) - para clientes visualizarem
router.get('/', unidadesController.listarUnidadesAtivas); // Apenas unidades ativas para usuários comuns
router.get('/:id', unidadesController.buscarUnidadePorId);
router.get('/:id/servicos', unidadesController.listarServicosPorUnidade);
router.get('/:id/funcionarios', unidadesController.listarFuncionariosPorUnidade);

module.exports = router;
