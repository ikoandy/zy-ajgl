import express from 'express';

const router = express.Router();

// 空待办事项数据
let todos: Array<any> = [];

// 获取待办事项列表
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, title, status, priority } = req.query;
  
  let filteredTodos = [...todos];
  
  // 标题搜索
  if (title) {
    filteredTodos = filteredTodos.filter(item => 
      item.title.includes(title as string)
    );
  }
  
  // 状态筛选
  if (status) {
    filteredTodos = filteredTodos.filter(item => 
      item.status === status
    );
  }
  
  // 优先级筛选
  if (priority) {
    filteredTodos = filteredTodos.filter(item => 
      item.priority === priority
    );
  }
  
  // 分页
  const start = ((Number(page) - 1) * Number(pageSize));
  const end = start + Number(pageSize);
  const paginatedTodos = filteredTodos.slice(start, end);
  
  return res.json({
    code: 200,
    message: '获取待办事项列表成功',
    data: {
      list: paginatedTodos,
      total: filteredTodos.length
    }
  });
});

// 获取待办事项详情
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find(item => item.id === id);
  
  if (todo) {
    res.json({
      code: 200,
      message: '获取待办事项详情成功',
      data: todo
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '待办事项不存在'
    });
  }
});

// 创建待办事项
router.post('/', (req, res) => {
  const { title, description, priority, dueDate, status } = req.body;
  
  if (!title) {
    return res.status(400).json({
      code: 400,
      message: '标题不能为空'
    });
  }
  
  const id = todos.length > 0 ? Math.max(...todos.map(item => item.id)) + 1 : 1;
  const newTodo = {
    id,
    title: String(title),
    description: description ? String(description) : '',
    priority: priority ? String(priority) : 'normal',
    dueDate: dueDate ? String(dueDate) : '',
    status: status ? String(status) : 'pending'
  };
  
  todos.push(newTodo);
  
  return res.json({
    code: 200,
    message: '创建待办事项成功',
    data: newTodo
  });
});

// 更新待办事项
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: '待办事项不存在'
    });
  }
  
  const { title, description, priority, dueDate, status } = req.body;
  
  if (!title) {
    return res.status(400).json({
      code: 400,
      message: '标题不能为空'
    });
  }
  
  todos[index] = {
    id,
    title: String(title),
    description: description ? String(description) : '',
    priority: priority ? String(priority) : 'normal',
    dueDate: dueDate ? String(dueDate) : '',
    status: status ? String(status) : 'pending'
  };
  
  return res.json({
    code: 200,
    message: '更新待办事项成功',
    data: todos[index]
  });
});

// 更新待办事项状态
router.put('/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: '待办事项不存在'
    });
  }
  
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({
      code: 400,
      message: '状态不能为空'
    });
  }
  
  todos[index] = {
    ...todos[index],
    status: String(status)
  };
  
  return res.json({
    code: 200,
    message: '更新待办事项状态成功',
    data: todos[index]
  });
});

// 删除待办事项
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const initialLength = todos.length;
  
  todos = todos.filter(item => item.id !== id);
  
  if (todos.length < initialLength) {
    res.json({
      code: 200,
      message: '删除待办事项成功'
    });
  } else {
    res.status(404).json({
      code: 404,
      message: '待办事项不存在'
    });
  }
});

export default router;
