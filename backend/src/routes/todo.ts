import express from 'express';

const router = express.Router();

// 获取待办列表
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '获取待办列表成功',
    data: {
      list: [],
      total: 0
    }
  });
});

// 获取单个待办详情
router.get('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '获取待办详情成功',
    data: null
  });
});

// 新增待办
router.post('/', (req, res) => {
  res.json({
    code: 200,
    message: '新增待办成功',
    data: null
  });
});

// 更新待办
router.put('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '更新待办成功',
    data: null
  });
});

// 更新待办状态
router.put('/:id/status', (req, res) => {
  res.json({
    code: 200,
    message: '更新待办状态成功',
    data: null
  });
});

// 删除待办
router.delete('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '删除待办成功',
    data: null
  });
});

export default router;