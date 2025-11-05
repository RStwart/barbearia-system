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
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `SELECT id, nome, email, telefone, tipo FROM usuarios WHERE id = ? AND ativo = TRUE`;

    const [results] = await db.execute(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ user: results[0] });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.verifyToken = verifyToken;

// Registro de usuário
exports.register = async (req, res) => {
  try {
    const { nome, email, senha, telefone, tipo } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }

    const hashedPassword = await bcrypt.hash(senha, 12);

    const sql = `INSERT INTO usuarios (nome, email, senha, telefone, tipo)
                 VALUES (?, ?, ?, ?, ?)`;

    await db.execute(sql, [nome, email, hashedPassword, telefone || null, tipo || "CLIENTE"]);
    
    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Informe e-mail e senha" });
    }

    const sql = `SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE`;

    const [results] = await db.execute(sql, [email]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado ou inativo" });
    }

    const user = results[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);

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
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Rota secreta para login do administrador.
exports.adminSecretLogin = async (req, res) => {
  try {
    const { secret } = req.body;

    if (!process.env.ADMIN_SECRET) {
      return res.status(500).json({ error: 'Admin secret não configurado no servidor' });
    }

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Segredo inválido' });
    }

    // Procura usuário admin existente
    const sql = `SELECT * FROM usuarios WHERE tipo = 'ADM' AND ativo = TRUE LIMIT 1`;
    const [results] = await db.execute(sql);

    const proceedWithUser = (user) => {
      const token = jwt.sign(
        { id: user.id, tipo: user.tipo },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({ 
        message: 'Login admin realizado com sucesso', 
        token, 
        user: { 
          id: user.id, 
          nome: user.nome, 
          email: user.email, 
          tipo: user.tipo 
        } 
      });
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

    const hashed = await bcrypt.hash(adminPass, 12);
    const insertSql = `INSERT INTO usuarios (nome, email, senha, telefone, tipo, ativo) VALUES (?, ?, ?, ?, 'ADM', TRUE)`;
    
    const [insertRes] = await db.execute(insertSql, [adminNome, adminEmail, hashed, null]);

    // Recupera o usuário criado
    const getSql = `SELECT * FROM usuarios WHERE id = ?`;
    const [getRes] = await db.execute(getSql, [insertRes.insertId]);
    
    if (!getRes || getRes.length === 0) {
      throw new Error('Erro ao recuperar admin criado');
    }
    
    return proceedWithUser(getRes[0]);
  } catch (error) {
    console.error('Erro no login admin:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
