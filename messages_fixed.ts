import express from 'express';

const router = express.Router();

// 空消息数据
let messages: Array<any> = [];

// 获取消息列表
router.get("/", (req, res) => {
  const { page = 1, pageSize = 10, status, type } = req.query;
      
  let filteredMessages = [...messages];

  // 状态筛选
  if (status) {
    filteredMessages = filteredMessages.filter(item =>
      item.status === status
    );
  }

  // 类型筛选
  if (type) {
    filteredMessages = filteredMessages.filter(item =>
      item.type === type
    );
  }

  // 分页
  const start = ((Number(page) - 1) * Number(pageSize));
  const end = start + Number(pageSize);
  const paginatedMessages = filteredMessages.slice(start, end);
     
  res.json({
    code: 200,
    message: "获取消息列表成功",
    data: {
      list: paginatedMessages,
      total: filteredMessages.length
    }
  });
});

// 获取消息详情
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = messages.findIndex(item => item.id === id);

  if (index !== -1) {
    // 自动标记为已读
    messages[index] = {
      ...messages[index],
      status: "read"
    };

    res.json({
      code: 200,
      message: "获取消息详情成功",
      data: messages[index]
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "消息不存在"
    });
  }
});

// 标记消息为已读
router.put("/:id/read", (req, res) => {
  const id = Number(req.params.id);
  const index = messages.findIndex(item => item.id === id);

  if (index !== -1) {
    messages[index] = {
      ...messages[index],
      status: "read"
    };

    res.json({
      code: 200,
      message: "标记已读成功"
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "消息不存在"
    });
  }
});

// 全部标记为已读
router.put("/read-all", (req, res) => {
  messages = messages.map(message => ({
    ...message,
    status: "read"
  }));

  res.json({
    code: 200,
    message: "全部消息已标记为已读"
  });
});

// 删除消息
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const initialLength = messages.length;

  messages = messages.filter(item => item.id !== id);

  if (messages.length < initialLength) {
    res.json({
      code: 200,
      message: "删除消息成功"
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "消息不存在"
    });
  }
});

export default router;