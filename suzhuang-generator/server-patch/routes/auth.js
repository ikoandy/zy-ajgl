const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT密钥
const JWT_SECRET = 'suzhuang-generator-secret-key';

// 用户数据，内存存储
let users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    email: ''
  }
];

// 用户登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空',
      data: null
    });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        username: user.username
      }
    });
  } else {
    return res.status(401).json({
      code: 401,
      message: '用户名或密码错误',
      data: null
    });
  }
});

// 用户注册
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空',
      data: null
    });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({
      code: 400,
      message: '用户名已存在',
      data: null
    });
  }

  const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = {
    id,
    username: String(username),
    password: String(password),
    email: email ? String(email) : ''
  };

  users.push(newUser);

  return res.json({
    code: 200,
    message: '注册成功',
    data: {
      id: newUser.id,
      username: newUser.username
    }
  });
});

// 验证token
router.get('/check', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未提供有效的认证信息',
      data: null
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      code: 200,
      message: 'Token有效',
      data: {
        username: decoded.username
      }
    });
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'Token无效或已过期',
      data: null
    });
  }
});

module.exports = router;
