const express = require("express");
const {
  listarFuncionarios,
  buscarFuncionarioPorId,
  criarFuncionario,
  atualizarFuncionario,
  excluirFuncionario,
  alternarStatus,
  resetarSenha
} = require("../controllers/funcionarios.controller");

const { verifyToken } = require("../controllers/auth.controller");

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Listar funcionários da unidade
router.get("/listar", listarFuncionarios);

// Buscar funcionário específico
router.get("/:id", buscarFuncionarioPorId);

// Criar novo funcionário
router.post("/criar", criarFuncionario);

// Atualizar funcionário
router.put("/:id", atualizarFuncionario);

// Excluir (desativar) funcionário
router.delete("/:id", excluirFuncionario);

// Alternar status ativo/inativo
router.patch("/:id/status", alternarStatus);

// Resetar senha do funcionário
router.post("/:id/resetar-senha", resetarSenha);

module.exports = router;
