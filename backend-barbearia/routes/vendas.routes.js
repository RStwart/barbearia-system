const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/auth.controller");
const {
  obterEstatisticas,
  listarVendas,
  buscarVendaPorId,
  criarVenda,
  atualizarNotaFiscal,
  atualizarVenda,
  excluirVenda
} = require("../controllers/vendas.controller");

// Estatísticas
router.get("/estatisticas", verifyToken, obterEstatisticas);

// CRUD de Vendas
router.get("/listar", verifyToken, listarVendas);
router.get("/:id", verifyToken, buscarVendaPorId);
router.post("/criar", verifyToken, criarVenda);
router.patch("/:id/nota-fiscal", verifyToken, atualizarNotaFiscal);
router.put("/:id", verifyToken, atualizarVenda);
router.delete("/:id", verifyToken, excluirVenda);

module.exports = router;
