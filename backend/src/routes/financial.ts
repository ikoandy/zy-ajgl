import express from 'express';

const router = express.Router();

// 获取财务记录列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, type, status } = req.query;
  
  res.json({
    code: 200,
    message: '获取财务记录列表成功',
    data: {
      list: [],
      total: 0
    }
  });
});

// 获取财务记录详情
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  
  res.status(404).json({
    code: 404,
    message: '财务记录不存在'
  });
});

// 创建财务记录
router.post('/', (req, res) => {
  const { type, amount, description, caseId } = req.body;
  
  if (!type || !amount || !caseId) {
    return res.status(400).json({
      code: 400,
      message: '类型、金额和案件ID不能为空'
    });
  }
  
  return res.json({
    code: 200,
    message: '创建财务记录成功',
    data: {
      id: 1,
      type: String(type),
      amount: Number(amount),
      description: description ? String(description) : '',
      caseId: Number(caseId),
      status: 'pending',
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  });
});

// 更新财务记录
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { type, amount, description, status } = req.body;
  
  res.json({
    code: 200,
    message: '更新财务记录成功',
    data: {
      id,
      type: type ? String(type) : 'income',
      amount: amount ? Number(amount) : 0,
      description: description ? String(description) : '',
      status: status ? String(status) : 'pending'
    }
  });
});

// 删除财务记录
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  
  res.json({
    code: 200,
    message: '删除财务记录成功'
  });
});

export default router;
