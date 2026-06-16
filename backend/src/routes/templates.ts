import express from 'express';

const router = express.Router();

// 模板数据，内存存储
let templates: Array<any> = [
  {
    id: 1,
    name: "默认起诉状模板",
    description: "系统默认的金融借款合同纠纷起诉状模板，包含标准格式和必填字段",
    upload_time: "2024-01-01 00:00",
    size: "45KB",
    is_default: true,
    content: ""
  }
];

// 获取模板列表
router.get('/', (req, res) => {
  return res.json({
    code: 200,
    message: 'success',
    data: templates
  });
});

// 获取模板详情
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const template = templates.find(item => item.id === id);

  if (template) {
    return res.json({
      code: 200,
      message: 'success',
      data: template
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: '模板不存在',
      data: null
    });
  }
});

// 上传新模板
router.post('/', (req, res) => {
  const { name, description, content } = req.body;

  if (!name) {
    return res.status(400).json({
      code: 400,
      message: '模板名称不能为空',
      data: null
    });
  }

  // 生成唯一ID
  const id = templates.length > 0 ? Math.max(...templates.map(item => item.id)) + 1 : 1;

  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

  const newTemplate = {
    id,
    name: String(name),
    description: description ? String(description) : '',
    upload_time: now,
    size: '0KB',
    is_default: false,
    content: content ? String(content) : ''
  };

  templates.push(newTemplate);

  return res.json({
    code: 200,
    message: 'success',
    data: newTemplate
  });
});

// 更新模板
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = templates.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: '模板不存在',
      data: null
    });
  }

  const { name, description, content } = req.body;

  templates[index] = {
    ...templates[index],
    name: name !== undefined ? String(name) : templates[index].name,
    description: description !== undefined ? String(description) : templates[index].description,
    content: content !== undefined ? String(content) : templates[index].content
  };

  return res.json({
    code: 200,
    message: 'success',
    data: templates[index]
  });
});

// 删除模板
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const initialLength = templates.length;

  templates = templates.filter(item => item.id !== id);

  if (templates.length < initialLength) {
    return res.json({
      code: 200,
      message: 'success'
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: '模板不存在',
      data: null
    });
  }
});

export default router;
