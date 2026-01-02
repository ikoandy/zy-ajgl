import express from 'express';
const router = express.Router();

// 基本的财务路由
router.get('/', (req, res) => {
  res.json({ code: 200, message: '获取财务列表成功', data: [] });
});

export default router;