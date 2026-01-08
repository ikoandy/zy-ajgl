import express from 'express';
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 基本的用户路由
router.get('/', (req, res) => {
  res.json({ code: 200, message: '获取用户列表成功', data: [] });   
});

router.get('/profile', (req, res) => {
  res.json({ code: 200, message: '获取用户信息成功', data: {} });   
});

// 上传头像
router.post('/avatar/upload', (req, res) => {
  try {
    // 获取上传的文件
    let file: Express.Multer.File | undefined;
    
    if (Array.isArray(req.files)) {
      // 当使用upload.array()或upload.any()时，req.files是数组
      file = req.files[0];
    } else if (req.files && typeof req.files === 'object') {
      // 当使用upload.fields()时，req.files是对象
      const fileArray = Object.values(req.files)[0];
      file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
    } else if (req.file) {
      // 当使用upload.single()时，req.file是单个文件对象
      file = req.file;
    }
    
    if (!file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的头像文件'
      });
    }

    // 构建文件URL
    const fileUrl = `http://139.155.42.254/uploads/${file.filename}`;

    // 返回上传结果
    return res.json({
      code: 200,
      message: '头像上传成功',
      data: {
        url: fileUrl,
        filename: file.filename,
        size: file.size
      }
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    return res.status(500).json({
      code: 500,
      message: '头像上传失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 提供静态文件访问
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

export default router;