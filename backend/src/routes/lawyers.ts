import express from 'express';
const router = express.Router();

// 获取律师列表
router.get('/lawyers', (req, res) => {
  res.json({ code: 200, message: '获取律师列表成功', data: [] });
});

// 获取客户列表
router.get('/clients', (req, res) => {
  res.json({ code: 200, message: '获取客户列表成功', data: [] });
});

export default router;