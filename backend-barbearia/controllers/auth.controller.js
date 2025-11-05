const db = require("../config/db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Obter perfil do usuário
exports.getProfile = (req, res) => {
  const userId = req.user.id;

  const sql = `SELECT id, nome, email, telefone, tipo FROM usuarios WHERE id = ? AND ativo = TRUE`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar perfil:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ user: results[0] });
  });
};

exports.verifyToken = verifyToken;

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

// Rota secreta para login do administrador.
// Recebe { secret } no body. O segredo deve ser igual a process.env.ADMIN_SECRET.
// Se existir um usuário com tipo 'ADM' e ativo, retorna o JWT para ele.
// Se não existir, tenta criar um usuário administrador baseado em vars de ambiente
// (ADMIN_EMAIL e ADMIN_PASS) e retorna o token.
exports.adminSecretLogin = (req, res) => {
  const { secret } = req.body;

  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'Admin secret não configurado no servidor' });
  }

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Segredo inválido' });
  }

  // Procura usuário admin existente
  const sql = `SELECT * FROM usuarios WHERE tipo = 'ADM' AND ativo = TRUE LIMIT 1`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar admin:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const proceedWithUser = (user) => {
      const token = jwt.sign(
        { id: user.id, tipo: user.tipo },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({ message: 'Login admin realizado com sucesso', token, user: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo } });
    };

    if (results && results.length > 0) {
      // Já existe admin
      return proceedWithUser(results[0]);
    }

  // Se não existe admin, tentar criar a partir de variáveis de ambiente
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASS;
    const adminNome = process.env.ADMIN_NAME || 'Administrador';

    if (!adminEmail || !adminPass) {
      return res.status(500).json({ error: 'Credenciais de admin não configuradas no servidor' });
    }

    const hashed = bcrypt.hashSync(adminPass, 10);
  const insertSql = `INSERT INTO usuarios (nome, email, senha, telefone, tipo, ativo) VALUES (?, ?, ?, ?, 'ADM', TRUE)`;
    db.query(insertSql, [adminNome, adminEmail, hashed, null], (insertErr, insertRes) => {
      if (insertErr) {
        console.error('Erro ao criar admin:', insertErr);
        return res.status(500).json({ error: 'Erro interno ao criar admin' });
      }

      // Recupera o usuário criado
      const getSql = `SELECT * FROM usuarios WHERE id = ?`;
      db.query(getSql, [insertRes.insertId], (getErr, getRes) => {
        if (getErr || !getRes || getRes.length === 0) {
          console.error('Erro ao recuperar admin criado:', getErr);
          return res.status(500).json({ error: 'Erro interno ao recuperar admin' });
        }
        return proceedWithUser(getRes[0]);
      });
    });
  });
};
