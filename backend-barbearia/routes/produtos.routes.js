const express = require("express");
const {
  // Categorias
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
  
  // Produtos
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  alternarStatusProduto
} = require("../controllers/produtos.controller");

const { verifyToken } = require("../controllers/auth.controller");

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(verifyToken);

// ==================== ROTAS DE CATEGORIAS ====================
router.get("/categorias/listar", listarCategorias);
router.post("/categorias/criar", criarCategoria);
router.put("/categorias/:id", atualizarCategoria);
router.delete("/categorias/:id", excluirCategoria);

// ==================== ROTAS DE PRODUTOS ====================
router.get("/listar", listarProdutos);
router.get("/:id", buscarProdutoPorId);
router.post("/criar", criarProduto);
router.put("/:id", atualizarProduto);
router.delete("/:id", excluirProduto);
router.patch("/:id/status", alternarStatusProduto);

module.exports = router;
