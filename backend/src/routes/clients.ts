import express from 'express';
const router = express.Router();

// 基本的客户路由
router.get('/', (req, res) => {
  res.json({ code: 200, message: '获取客户列表成功', data: [] });
});

export default router;