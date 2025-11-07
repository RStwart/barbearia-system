const express = require('express');
const router = express.Router();
const cadastroController = require('../controllers/cadastro.controller');

// Rota pública para cadastro de estabelecimento
router.post('/estabelecimento', cadastroController.cadastrarEstabelecimento);

module.exports = router;
