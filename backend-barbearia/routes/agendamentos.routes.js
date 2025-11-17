const express = require("express");
const router = express.Router();
const agendamentosController = require("../controllers/agendamentos.controller");
const { verifyToken } = require("../controllers/auth.controller");

// Rotas auxiliares (DEVEM VIR ANTES das rotas com parâmetros dinâmicos)
router.get("/servicos/listar", verifyToken, agendamentosController.listarServicos);
router.get("/funcionarios/listar", verifyToken, agendamentosController.listarFuncionarios);
router.get("/clientes/buscar", verifyToken, agendamentosController.buscarClientes);

// Rotas de agendamentos (protegidas)
router.get("/", verifyToken, agendamentosController.listarAgendamentos);
router.get("/:id", verifyToken, agendamentosController.buscarAgendamento);
router.post("/", verifyToken, agendamentosController.criarAgendamento);
router.put("/:id", verifyToken, agendamentosController.atualizarAgendamento);
router.delete("/:id", verifyToken, agendamentosController.deletarAgendamento);
router.patch("/:id/cancelar", verifyToken, agendamentosController.cancelarAgendamento);

module.exports = router;
