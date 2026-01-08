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

// 导入文件类型映射工具
import { getFileTypeFromFilename, getFileExtension } from '../utils/fileTypeMapper';

// 导入其他路由的documents数组
import { documents } from './documents';

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
  
  // 获取文档名称，优先从req.body获取，没有则使用默认值
  const name = req.body.name || '新上传文档';
  
  // 获取上传的文件，注意upload.any()会将文件存储在req.files数组中
  const files = req.files as Array<any>;
  const file = files && files.length > 0 ? files[0] : req.file;
  const size = req.body.size || file?.size || 1024 * 1024; // 默认1MB
  const filePath = file?.path || "";
  const originalName = file?.originalname || name;
  
  // 使用文件类型映射工具获取文件类型
  const fileType = getFileTypeFromFilename(originalName);
  // 获取文件扩展名
  const fileExt = getFileExtension(originalName);
  
  // 生成全局唯一ID
  const globalDocId = documents.length > 0 ? Math.max(...documents.map(item => item.id)) + 1 : 1;
  
  // 创建新文档对象
  const newDocument = {
    id: globalDocId,
    caseId: id,
    name: String(name),
    originalName: originalName,
    type: fileType, // 根据文件名获取的文件类型
    extension: fileExt, // 文件扩展名
    size: Number(size), // 文件大小
    filePath: filePath, // 实际文件路径
    uploadTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    url: `/api/documents/${globalDocId}/file`, // 使用全局文档下载URL，确保一致性
    uploadedBy: 'admin' // 实际应为当前登录用户
  };
  
  // 将文档添加到案件的文档列表中
  cases[caseIndex].documents.push({
    ...newDocument
  });
  
  // 将文档添加到全局文档列表中，实现数据同步
  documents.push({
    ...newDocument
  });
  
  return res.json({
    code: 200,
    message: '文档上传成功',
    data: newDocument
  });
});

// 下载案件文档
router.get('/:id/documents/:docId/download', (req, res) => {
  const caseId = Number(req.params.id);
  const docId = Number(req.params.docId);
  
  // 首先从全局文档列表中查找，确保文件路径的一致性
  const document = documents.find(item => item.id === docId && item.caseId === caseId);
  
  if (document) {
    // 生成真实下载URL
    const encodedName = encodeURIComponent(document.name);
    const downloadUrl = `/api/cases/${caseId}/documents/${docId}/file?name=${encodedName}`;
    
    return res.json({
      code: 200,
      message: '下载文档成功',
      data: {
        downloadUrl: downloadUrl,
        fileName: document.name,
        fileType: document.type,
        fileSize: document.size
      }
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: '文档不存在'
    });
  }
});

// 实际下载案件文档文件
router.get('/:id/documents/:docId/file', (req, res) => {
  const caseId = Number(req.params.id);
  const docId = Number(req.params.docId);
  const fs = require('fs');
  const path = require('path');
  
  // 首先从全局文档列表中查找，确保文件路径的一致性
  const document = documents.find(item => item.id === docId && item.caseId === caseId);
  
  if (document) {
    // 检查文件是否存在
    if (document.filePath && fs.existsSync(document.filePath)) {
      // 设置正确的MIME类型
      const mime = require('mime-types');
      const contentType = mime.lookup(document.filePath) || 'application/octet-stream';
      
      // 获取原始文件名
      const filename = document.originalName || `${document.name}.${document.extension}`;
      
      // 返回真实文件
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', contentType);
      return res.sendFile(document.filePath);
    } else {
      // 如果文件不存在，返回错误信息
      res.status(404).json({
        code: 404,
        message: "文件不存在或已被删除"
      });
    }
  } else {
    return res.status(404).json({
      code: 404,
      message: '文档不存在'
    });
  }
});

// 删除案件文档
router.delete('/:id/documents/:docId', (req, res) => {
  const caseId = Number(req.params.id);
  const docId = Number(req.params.docId);
  const caseIndex = cases.findIndex(item => item.id === caseId);
  
  if (caseIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: '案件不存在'
    });
  }
  
  const initialLength = cases[caseIndex].documents.length;
  cases[caseIndex].documents = cases[caseIndex].documents.filter((item: any) => item.id !== docId);
  
  if (cases[caseIndex].documents.length < initialLength) {
    return res.json({
      code: 200,
      message: '删除文档成功'
    });
  } else {
    return res.status(404).json({
      code: 404,
      message: '文档不存在'
    });
  }
});

export { cases };
export default router;
