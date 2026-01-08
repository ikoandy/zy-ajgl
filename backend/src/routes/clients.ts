import express from 'express';

const router = express.Router();

// 空客户数据
let clients: Array<any> = [];

// 获取客户列表
router.get("/", (req, res) => {
  const { page = 1, pageSize = 10, name, phone, status } = req.query;
      
  let filteredClients = [...clients];

  // 名称搜索
  if (name) {
    filteredClients = filteredClients.filter(item =>
      item.name.includes(name as string)
    );
  }

  // 电话搜索
  if (phone) {
    filteredClients = filteredClients.filter(item =>
      item.phone.includes(phone as string)
    );
  }

  // 状态筛选
  if (status) {
    filteredClients = filteredClients.filter(item =>
      item.status === status
    );
  }

  // 分页
  const start = ((Number(page) - 1) * Number(pageSize));
  const end = start + Number(pageSize);
  const paginatedClients = filteredClients.slice(start, end);
     
  res.json({
    code: 200,
    message: "获取客户列表成功",
    data: {
      list: paginatedClients,
      total: filteredClients.length
    }
  });
});

// 获取客户详情
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const client = clients.find(item => item.id === id);

  if (client) {
    res.json({
      code: 200,
      message: "获取客户详情成功",
      data: client
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "客户不存在"
    });
  }
});

// 创建客户
router.post("/", (req, res) => {
  const { name, phone, email, company, address, contactPerson, status, description } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      code: 400,
      message: "客户名称和电话不能为空"
    });
  }

  // 生成唯一ID
  const id = clients.length > 0 ? Math.max(...clients.map(item => item.id)) + 1 : 1;
  const newClient = {
    id,
    name: String(name),
    phone: String(phone),
    email: email ? String(email) : "",
    company: company ? String(company) : "",
    address: address ? String(address) : "",
    contactPerson: contactPerson ? String(contactPerson) : "",
    status: status ? String(status) : "active",
    description: description ? String(description) : "",
    createTime: new Date().toISOString().slice(0, 19).replace("T", " "),
    updateTime: new Date().toISOString().slice(0, 19).replace("T", " ")
  };

  clients.push(newClient);

  return res.json({
    code: 200,
    message: "创建客户成功",
    data: newClient
  });
});

// 更新客户
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = clients.findIndex(item => item.id === id);
       
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: "客户不存在"
    });
  }

  const { name, phone, email, company, address, contactPerson, status, description } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      code: 400,
      message: "客户名称和电话不能为空"
    });
  }

  clients[index] = {
    ...clients[index],
    name: String(name),
    phone: String(phone),
    email: email ? String(email) : clients[index].email,
    company: company ? String(company) : clients[index].company,
    address: address ? String(address) : clients[index].address,
    contactPerson: contactPerson ? String(contactPerson) : clients[index].contactPerson,
    status: status ? String(status) : clients[index].status,
    description: description ? String(description) : clients[index].description,
    updateTime: new Date().toISOString().slice(0, 19).replace("T", " ")
  };

  return res.json({
    code: 200,
    message: "更新客户成功",
    data: clients[index]
  });
});

// 删除客户
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const initialLength = clients.length;

  clients = clients.filter(item => item.id !== id);

  if (clients.length < initialLength) {
    res.json({
      code: 200,
      message: "删除客户成功"
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "客户不存在"
    });
  }
});

export { clients };
export default router;