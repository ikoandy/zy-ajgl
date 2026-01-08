// 导入express
import express from 'express';
// 导入文件类型映射工具
import { getFileTypeFromFilename, getFileExtension } from '../utils/fileTypeMapper';

const router = express.Router();

// 空文档数据
let documents: Array<any> = [];

// 导出documents数组，让其他路由可以访问
export { documents };

// 获取文档列表
router.get("/", (req, res) => {
  const { page = 1, pageSize = 10, caseId, name, type } = req.query;
      
  let filteredDocuments = [...documents];

  // 案件筛选
  if (caseId) {
    filteredDocuments = filteredDocuments.filter(item =>
      item.caseId === Number(caseId)
    );
  }

  // 名称搜索
  if (name) {
    filteredDocuments = filteredDocuments.filter(item =>
      item.name.includes(name as string)
    );
  }

  // 类型筛选
  if (type) {
    filteredDocuments = filteredDocuments.filter(item =>
      item.type === type
    );
  }

  // 分页
  const start = ((Number(page) - 1) * Number(pageSize));
  const end = start + Number(pageSize);
  const paginatedDocuments = filteredDocuments.slice(start, end);
     
  res.json({
    code: 200,
    message: "获取文档列表成功",
    data: {
      list: paginatedDocuments,
      total: filteredDocuments.length
    }
  });
});

// 预览文档
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const document = documents.find(item => item.id === id);

  if (document) {
    res.json({
      code: 200,
      message: "获取文档详情成功",
      data: document
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "文档不存在"
    });
  }
});

// 下载文档
router.get("/:id/download", (req, res) => {
  const id = Number(req.params.id);
  const document = documents.find(item => item.id === id);

  if (document) {
    // 生成模拟下载URL，包含文档ID和名称
    const encodedName = encodeURIComponent(document.name);
    const downloadUrl = `/api/documents/${id}/file?name=${encodedName}`;
    
    res.json({
      code: 200,
      message: "下载文档成功",
      data: {
        downloadUrl: downloadUrl,
        fileName: document.name,
        fileType: document.type,
        fileSize: document.size
      }
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "文档不存在"
    });
  }
});

// 实际下载文件路由
router.get("/:id/file", (req, res) => {
  const id = Number(req.params.id);
  const document = documents.find(item => item.id === id);
  const fs = require('fs');
  const path = require('path');

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
    res.status(404).json({
      code: 404,
      message: "文档不存在"
    });
  }
});

// 上传文档 - 主路由
router.post("/", (req, res) => {
  // 生成唯一ID
  const id = documents.length > 0 ? Math.max(...documents.map(item => item.id)) + 1 : 1;
  const newDocument = {
    id,
    caseId: 1, // 默认案件ID
    name: "新上传文档", // 默认文档名称
    type: "pdf", // 默认类型
    size: 1024 * 1024, // 模拟文件大小
    uploadTime: new Date().toISOString().slice(0, 19).replace("T", " "),
    url: "#", // 模拟文件URL
    uploadedBy: "admin"
  };

  documents.push(newDocument);

  return res.json({
    code: 200,
    message: "文档上传成功",
    data: newDocument
  });
});

// 上传文档 - upload 路由（兼容前端请求）
router.post("/upload", (req, res) => {
  // 生成唯一ID
  const id = documents.length > 0 ? Math.max(...documents.map(item => item.id)) + 1 : 1;
  // 从请求中获取参数，没有则使用默认值
  const name = req.body.name || "新上传文档";
  const caseId = req.body.caseId ? Number(req.body.caseId) : 1;
  const description = req.body.description || "";
  
  // 获取上传的文件，注意upload.any()会将文件存储在req.files数组中
  const files = req.files as Array<any>;
  const file = files && files.length > 0 ? files[0] : req.file;
  const size = req.body.size || file?.size || 1024 * 1024; // 默认1MB
  const filePath = file?.path || "";
  const originalName = file?.originalname || name;
  
  // 使用文件类型映射工具获取文件类型和扩展名
  const fileType = getFileTypeFromFilename(originalName);
  const fileExt = getFileExtension(originalName);
  
  const newDocument = {
    id,
    caseId,
    name: String(name),
    originalName: originalName,
    type: fileType, // 使用新的文件类型映射工具获取类型
    extension: fileExt, // 文件扩展名
    size: Number(size), // 文件大小
    filePath: filePath, // 实际文件路径
    uploadTime: new Date().toISOString().slice(0, 19).replace("T", " "),
    url: `/api/documents/${id}/file`, // 真实文件下载URL
    uploadedBy: "admin", // 实际应为当前登录用户
    description
  };

  documents.push(newDocument);

  return res.json({
    code: 200,
    message: "文档上传成功",
    data: newDocument
  });
});

// 更新文档
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = documents.findIndex(item => item.id === id);
       
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: "文档不存在"
    });
  }

  const { name, type, url, description } = req.body;

  documents[index] = {
    ...documents[index],
    name: name ? String(name) : documents[index].name,
    type: type ? String(type) : documents[index].type,
    url: url ? String(url) : documents[index].url,
    description: description ? String(description) : documents[index].description || ""
  };

  return res.json({
    code: 200,
    message: "更新文档成功",
    data: documents[index]
  });
});

// 删除文档
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const initialLength = documents.length;

  documents = documents.filter(item => item.id !== id);

  if (documents.length < initialLength) {
    res.json({
      code: 200,
      message: "删除文档成功"
    });
  } else {
    res.status(404).json({
      code: 404,
      message: "文档不存在"
    });
  }
});

export default router;