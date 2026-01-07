import express from 'express';

const router = express.Router();

// 获取文档列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, type, status } = req.query;
  
  res.json({
    code: 200,
    message: '获取文档列表成功',
    data: {
      list: [],
      total: 0
    }
  });
});

// 获取文档详情
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  
  res.status(404).json({
    code: 404,
    message: '文档不存在'
  });
});

// 上传文档
router.post('/', (req, res) => {
  // 实际应处理文件上传
  res.json({
    code: 200,
    message: '文档上传成功',
    data: {
      id: 1,
      fileName: 'uploaded-file.pdf',
      filePath: '/uploads/uploaded-file.pdf',
      type: 'other',
      size: 1024,
      status: 'uploaded',
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  });
});

// 更新文档
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { type, description, status } = req.body;
  
  res.json({
    code: 200,
    message: '更新文档成功',
    data: {
      id,
      type: type ? String(type) : 'other',
      description: description ? String(description) : '',
      status: status ? String(status) : 'uploaded'
    }
  });
});

// 删除文档
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  
  res.json({
    code: 200,
    message: '删除文档成功'
  });
});

export default router;
