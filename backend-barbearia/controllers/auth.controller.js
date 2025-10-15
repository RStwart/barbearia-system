const db = require("../config/db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro de usuário
exports.register = (req, res) => {
  const { nome, email, senha, telefone, tipo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
  }

  const hashedPassword = bcrypt.hashSync(senha, 10);

  const sql = `INSERT INTO usuarios (nome, email, senha, telefone, tipo)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [nome, email, hashedPassword, telefone || null, tipo || "CLIENTE"], (err, result) => {
    if (err) {
      console.error("Erro ao registrar usuário:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  });
};

// Login
exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Informe e-mail e senha" });
  }

  const sql = `SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuário:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado ou inativo" });
    }

    const user = results[0];
    const senhaValida = bcrypt.compareSync(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });
  });
};
