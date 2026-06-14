const jwt  = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido.' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Usuario no encontrado.' });
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};
