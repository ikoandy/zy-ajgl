import express from 'express';

const router = express.Router();

// 获取日程列表
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '获取日程列表成功',
    data: {
      list: [],
      total: 0
    }
  });
});

// 获取单个日程详情
router.get('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '获取日程详情成功',
    data: null
  });
});

// 新增日程
router.post('/', (req, res) => {
  res.json({
    code: 200,
    message: '新增日程成功',
    data: null
  });
});

// 更新日程
router.put('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '更新日程成功',
    data: null
  });
});

// 删除日程
router.delete('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '删除日程成功',
    data: null
  });
});

export default router;