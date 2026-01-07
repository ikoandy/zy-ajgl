import express from 'express';

const router = express.Router();

// 空日程数据
let schedules: Array<any> = [];

// 获取日程列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, title, type } = req.query;
  
  let filteredSchedules = [...schedules];
  
  // 标题搜索
  if (title) {
    filteredSchedules = filteredSchedules.filter(item => 
      item.title.includes(title as string)
    );
  }
  
  // 类型筛选
  if (type) {
    filteredSchedules = filteredSchedules.filter(item => 
      item.type === type
    );
  }
  
  // 分页
  const start = ((Number(page) - 1) * Number(pageSize));
  const end = start + Number(pageSize);
  const paginatedSchedules = filteredSchedules.slice(start, end);
  
  return res.json({
    code: 200,
    message: '获取日程列表成功',
    data: {
      list: paginatedSchedules,
      total: filteredSchedules.length
    }
  });
});

// 获取日程详情
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const schedule = schedules.find(item => item.id === id);
  
  if (schedule) {
    res.json({
      code: 200,
      message: '获取日程详情成功',
      data: schedule
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '日程不存在'
    });
  }
});

// 创建日程
router.post('/', (req, res) => {
  const { title, type, startTime, endTime, location, description, status } = req.body;
  
  if (!title || !type || !startTime || !endTime) {
    return res.status(400).json({
      code: 400,
      message: '标题、类型、开始时间和结束时间不能为空'
    });
  }
  
  const id = schedules.length > 0 ? Math.max(...schedules.map(item => item.id)) + 1 : 1;
  const newSchedule = {
    id,
    title: String(title),
    type: String(type),
    startTime: String(startTime),
    endTime: String(endTime),
    location: location ? String(location) : '',
    description: description ? String(description) : '',
    status: status ? String(status) : 'pending'
  };
  
  schedules.push(newSchedule);
  
  return res.json({
    code: 200,
    message: '创建日程成功',
    data: newSchedule
  });
});

// 更新日程
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = schedules.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: '日程不存在'
    });
  }
  
  const { title, type, startTime, endTime, location, description, status } = req.body;
  
  if (!title || !type || !startTime || !endTime) {
    return res.status(400).json({
      code: 400,
      message: '标题、类型、开始时间和结束时间不能为空'
    });
  }
  
  schedules[index] = {
    id,
    title: String(title),
    type: String(type),
    startTime: String(startTime),
    endTime: String(endTime),
    location: location ? String(location) : '',
    description: description ? String(description) : '',
    status: status ? String(status) : 'pending'
  };
  
  return res.json({
    code: 200,
    message: '更新日程成功',
    data: schedules[index]
  });
});

// 更新日程状态
router.put('/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const index = schedules.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: '日程不存在'
    });
  }
  
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      code: 400,
      message: '状态不能为空'
    });
  }
  
  schedules[index] = {
    ...schedules[index],
    status: String(status)
  };
  
  return res.json({
    code: 200,
    message: '更新日程状态成功',
    data: schedules[index]
  });
});

// 删除日程
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const initialLength = schedules.length;
  
  schedules = schedules.filter(item => item.id !== id);
  
  if (schedules.length < initialLength) {
    res.json({
      code: 200,
      message: '删除日程成功'
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '日程不存在'
    });
  }
});

export default router;
