import express from 'express';

const router = express.Router();

// 获取消息列表
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '获取消息列表成功',
    data: {
      list: [],
      total: 0
    }
  });
});

// 标记消息为已读
router.put('/:id/read', (req, res) => {
  res.json({
    code: 200,
    message: '标记消息为已读成功',
    data: null
  });
});

// 标记所有消息为已读
router.put('/read-all', (req, res) => {
  res.json({
    code: 200,
    message: '标记所有消息为已读成功',
    data: null
  });
});

export default router;