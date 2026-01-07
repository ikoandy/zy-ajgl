import express from 'express';

const router = express.Router();

// 获取客户列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, status, keyword } = req.query;
  
  res.json({
    code: 200,
    message: '获取客户列表成功',
    data: {
      list: [],
      total: 0
    }
  });
});

// 获取客户详情
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  
  res.status(404).json({
    code: 404,
    message: '客户不存在'
  });
});

// 获取跟进记录
router.get('/:id/follow-records', (req, res) => {
  const clientId = Number(req.params.id);
  
  res.json({
    code: 200,
    message: '获取跟进记录成功',
    data: {
      list: [],
      total: 0
    }
  });
});

// 创建跟进记录
router.post('/:id/follow-records', (req, res) => {
  const clientId = Number(req.params.id);
  const { content, nextTime } = req.body;
  
  const newFollowRecord = {
    id: 1,
    clientId,
    content: content ? String(content) : '',
    nextTime: nextTime ? String(nextTime) : null,
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
  
  res.json({
    code: 200,
    message: '创建跟进记录成功',
    data: newFollowRecord
  });
});

export default router;
