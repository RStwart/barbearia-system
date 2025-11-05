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

module.exports = router;