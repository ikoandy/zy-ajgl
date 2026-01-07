import express from 'express';

const router = express.Router();

// 全局案件数组，用于存储案件数据
// 确保初始化时空数组，不包含任何模拟数据
let cases: Array<any> = [];

// 获取案件列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, status, type } = req.query;
  
  return res.json({
    code: 200,
    message: '获取案件列表成功',
    data: {
      list: cases,
      total: cases.length
    }
  });
});

// 获取案件详情
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const caseItem = cases.find(item => item.id === id);
  
  if (caseItem) {
    return res.json({
      code: 200,
      message: '获取案件详情成功',
      data: caseItem
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: '案件不存在'
    });
  }
});

// 创建案件
router.post('/', (req, res) => {
  const { caseNumber, title, client, type, lawyer, status, description, filingDate, expectedEndDate, judge, court, amount } = req.body;
  
  if (!title || !type || !client) {
    return res.status(400).json({
      code: 400,
      message: '标题、类型和客户名称不能为空'
    });
  }
  
  // 生成唯一ID
  const id = cases.length > 0 ? Math.max(...cases.map(item => item.id)) + 1 : 1;
  
  // 添加时间戳
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  const newCase = {
    id,
    caseNumber: caseNumber ? String(caseNumber) : '',
    title: String(title),
    client: String(client),
    type: String(type),
    lawyer: lawyer ? String(lawyer) : '',
    status: status ? String(status) : '已立案',
    description: description ? String(description) : '',
    filingDate: filingDate ? String(filingDate) : '',
    expectedEndDate: expectedEndDate ? String(expectedEndDate) : '',
    judge: judge ? String(judge) : '',
    court: court ? String(court) : '',
    amount: amount ? Number(amount) : 0,
    createTime: now,
    updateTime: now,
    timeline: [],
    documents: []
  };
  
  // 添加到案件数组
  cases.push(newCase);
  
  return res.json({
    code: 200,
    message: '创建案件成功',
    data: newCase
  });
});

// 更新案件
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const caseIndex = cases.findIndex(item => item.id === id);
  
  if (caseIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '案件不存在'
    });
  }
  
  const { caseNumber, title, client, type, lawyer, status, description, filingDate, expectedEndDate, judge, court, amount } = req.body;
  
  if (!title || !type || !client) {
    return res.status(400).json({
      code: 400,
      message: '标题、类型和客户名称不能为空'
    });
  }
  
  // 更新时间戳
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // 更新案件信息
  cases[caseIndex] = {
    ...cases[caseIndex],
    caseNumber: caseNumber ? String(caseNumber) : cases[caseIndex].caseNumber,
    title: String(title),
    client: String(client),
    type: String(type),
    lawyer: lawyer ? String(lawyer) : cases[caseIndex].lawyer,
    status: status ? String(status) : cases[caseIndex].status,
    description: description ? String(description) : cases[caseIndex].description,
    filingDate: filingDate ? String(filingDate) : cases[caseIndex].filingDate,
    expectedEndDate: expectedEndDate ? String(expectedEndDate) : cases[caseIndex].expectedEndDate,
    judge: judge ? String(judge) : cases[caseIndex].judge,
    court: court ? String(court) : cases[caseIndex].court,
    amount: amount ? Number(amount) : cases[caseIndex].amount,
    updateTime: now
  };
  
  return res.json({
    code: 200,
    message: '更新案件成功',
    data: cases[caseIndex]
  });
});

// 更新案件状态
router.put('/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const caseIndex = cases.findIndex(item => item.id === id);
  
  if (caseIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '案件不存在'
    });
  }
  
  const { status, progress } = req.body;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  cases[caseIndex] = {
    ...cases[caseIndex],
    status: status ? String(status) : cases[caseIndex].status,
    progress: progress ? Number(progress) : cases[caseIndex].progress || 0,
    updateTime: now
  };
  
  return res.json({
    code: 200,
    message: '更新案件状态成功',
    data: cases[caseIndex]
  });
});

// 删除案件
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const initialLength = cases.length;
  
  cases = cases.filter(item => item.id !== id);
  
  if (cases.length < initialLength) {
    return res.json({
      code: 200,
      message: '删除案件成功'
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: '案件不存在'
    });
  }
});

// 添加案件进度
router.post('/:id/timeline', (req, res) => {
  const id = Number(req.params.id);
  const caseIndex = cases.findIndex(item => item.id === id);
  
  if (caseIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '案件不存在'
    });
  }
  
  const { title, content, time } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({
      code: 400,
      message: '标题和内容不能为空'
    });
  }
  
  // 生成唯一ID
  const timelineId = cases[caseIndex].timeline.length > 0 ? Math.max(...cases[caseIndex].timeline.map((item: any) => item.id)) + 1 : 1;
  
  const newTimeline = {
    id: timelineId,
    title: String(title),
    content: String(content),
    time: time ? String(time) : new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
  
  cases[caseIndex].timeline.push(newTimeline);
  
  return res.json({
    code: 200,
    message: '添加进度成功',
    data: newTimeline
  });
});

// 上传案件文档
router.post('/:id/documents', (req, res) => {
  const id = Number(req.params.id);
  const caseIndex = cases.findIndex(item => item.id === id);
  
  if (caseIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '案件不存在'
    });
  }
  
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({
      code: 400,
      message: '文档名称不能为空'
    });
  }
  
  // 生成唯一ID
  const documentId = cases[caseIndex].documents.length > 0 ? Math.max(...cases[caseIndex].documents.map((item: any) => item.id)) + 1 : 1;
  
  // 模拟文件上传，实际应处理文件流
  const newDocument = {
    id: documentId,
    name: String(name),
    type: 'pdf', // 实际应从文件中获取
    size: 1024 * 1024, // 模拟文件大小
    uploadTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    url: '#', // 模拟文件URL
    uploadedBy: 'admin' // 实际应为当前登录用户
  };
  
  cases[caseIndex].documents.push(newDocument);
  
  return res.json({
    code: 200,
    message: '文档上传成功',
    data: newDocument
  });
});

export default router;
