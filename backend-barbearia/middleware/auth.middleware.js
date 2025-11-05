const jwt = require('jsonwebtoken');

// Middleware básico de autenticação JWT
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Token de acesso não fornecido' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Token inválido ou expirado' 
    });
  }
};

// Middleware para verificar se é administrador
const verificarAdmin = (req, res, next) => {
  if (!req.user || req.user.tipo !== 'ADM') {
    return res.status(403).json({ 
      success: false,
      message: 'Acesso negado: apenas administradores podem realizar esta ação' 
    });
  }
  next();
};

// Middleware combinado: token + admin
const verificarTokenAdmin = [verificarToken, verificarAdmin];

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarTokenAdmin
};