const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Pega o token do header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Verifica se o token existe
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adiciona os dados do usuário na requisição
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    // Continua para a próxima função
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = authMiddleware;