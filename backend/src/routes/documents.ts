import express from 'express';
const router = express.Router();

// 基本的文档路由
router.get('/', (req, res) => {
  res.json({ code: 200, message: '获取文档列表成功', data: [] });
});

export default router;