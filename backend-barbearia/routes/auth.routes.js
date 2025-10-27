const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");

// === Rotas de autenticação ===
router.post("/register", authController.register);
router.post("/login", authController.login);
// Rota secreta para login do administrador (usa ADMIN_SECRET no env)
router.post("/admin/secret-login", authController.adminSecretLogin);

module.exports = router;
