const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'mediation_platform_secret_key_2024';
const JWT_EXPIRES_IN = '24h';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      real_name: user.real_name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare(`
      SELECT u.id, u.username, u.real_name, u.role_id, u.avatar_color, u.status, r.name as role_name, r.display_name as role_display_name
      FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND u.status = 'active'
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: '用户不存在或已禁用' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '认证令牌已过期' });
    }
    return res.status(401).json({ error: '无效的认证令牌' });
  }
}

function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }
    if (allowedRoles.length === 0) {
      return next();
    }
    if (allowedRoles.includes(req.user.role_name)) {
      return next();
    }
    return res.status(403).json({ error: '权限不足' });
  };
}

module.exports = { generateToken, authMiddleware, roleMiddleware, JWT_SECRET };
