import express from 'express';
const router = express.Router();

// 基本的认证路由
router.post('/login', (req, res) => {
  res.json({ code: 200, message: '登录成功', data: { token: 'test-token' } });
});

router.post('/register', (req, res) => {
  res.json({ code: 200, message: '注册成功' });
});

export default router;