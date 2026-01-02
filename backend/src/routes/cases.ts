import express from 'express';
const router = express.Router();

// 基本的案件路由
router.get('/', (req, res) => {
  res.json({ code: 200, message: '获取案件列表成功', data: [] });
});

export default router;