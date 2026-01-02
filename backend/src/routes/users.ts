import express from 'express';
const router = express.Router();

// 基本的用户路由
router.get('/', (req, res) => {
  res.json({ code: 200, message: '获取用户列表成功', data: [] });
});

router.get('/profile', (req, res) => {
  res.json({ code: 200, message: '获取用户信息成功', data: {} });
});

export default router;