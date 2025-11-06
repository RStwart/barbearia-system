const express = require("express");
const {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  alterarStatus,
  obterEstatisticas
} = require("../controllers/admin.controller");

const {
  listarUnidades,
  buscarUnidadePorId,
  criarUnidade,
  atualizarUnidade,
  excluirUnidade: excluirUnidade2,
  alterarStatus: alterarStatusUnidade,
  alterarStatusPagamento,
  alterarStatusAvaliacao,
  obterEstatisticas: obterEstatisticasUnidades
} = require("../controllers/unidades.controller");

const { verificarTokenAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// ================ ROTAS DE USUÁRIOS ================
router.get("/usuarios", verificarTokenAdmin, listarUsuarios);
router.get("/usuarios/:id", verificarTokenAdmin, buscarUsuarioPorId);
router.post("/usuarios", verificarTokenAdmin, criarUsuario);
router.put("/usuarios/:id", verificarTokenAdmin, atualizarUsuario);
router.delete("/usuarios/:id", verificarTokenAdmin, excluirUsuario);
router.patch("/usuarios/:id/status", verificarTokenAdmin, alterarStatus);

// ================ ROTAS DE ESTATÍSTICAS ================
router.get("/estatisticas", verificarTokenAdmin, obterEstatisticas);

// ================ ROTAS DE UNIDADES ================
router.get("/unidades", verificarTokenAdmin, listarUnidades);
router.get("/unidades/estatisticas", verificarTokenAdmin, obterEstatisticasUnidades);
router.get("/unidades/:id", verificarTokenAdmin, buscarUnidadePorId);
router.post("/unidades", verificarTokenAdmin, criarUnidade);
router.put("/unidades/:id", verificarTokenAdmin, atualizarUnidade);
router.delete("/unidades/:id", verificarTokenAdmin, excluirUnidade2);
router.patch("/unidades/:id/status", verificarTokenAdmin, alterarStatusUnidade);
router.patch("/unidades/:id/status-pagamento", verificarTokenAdmin, alterarStatusPagamento);
router.patch("/unidades/:id/status-avaliacao", verificarTokenAdmin, alterarStatusAvaliacao);

module.exports = router;