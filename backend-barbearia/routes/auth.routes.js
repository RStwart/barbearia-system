const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");

// === Rotas de autenticação ===
router.post("/register", authController.register);
router.post("/login", authController.login);
// Rota secreta para login do administrador (usa ADMIN_SECRET no env)
router.post("/admin/secret-login", authController.adminSecretLogin);
// Rota para obter perfil do usuário autenticado
router.get("/profile", authController.verifyToken, authController.getProfile);

module.exports = router;
