import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
import { testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// 路由导入
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import clientRoutes from './routes/clients';
import caseRoutes from './routes/cases';
import financialRoutes from './routes/financial';
import documentRoutes from './routes/documents';
import scheduleRoutes from './routes/schedules';
import todoRoutes from './routes/todos';
import messageRoutes from './routes/messages';
import dashboardRoutes from './routes/dashboard';
import lawyerRoutes from './routes/lawyers';
import templateRoutes from './routes/templates';
import settingsRoutes from './routes/settings';
import calculatorRoutes from './routes/calculator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 添加trust proxy设置，解决express-rate-limit的X-Forwarded-For错误
app.set('trust proxy', true);

// 安全中间件
app.use(helmet());
app.use(compression());

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100次请求
  message: '请求过于频繁，请稍后再试'
});
app.use(limiter);

// CORS配置
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-domain.com'
  ],
  credentials: true
}));

// 配置multer中间件处理文件上传
const path = require('path');
const fs = require('fs');

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 使用diskStorage将文件存储到磁盘
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名，避免冲突
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB文件大小限制
});

// 中间件
app.use(express.json({ limit: '50mb' })); // 增加JSON请求大小限制
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // 增加表单请求大小限制
app.use(upload.any()); // 处理所有文件上传
app.use(requestLogger);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/calculator', calculatorRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.originalUrl,
    method: req.method
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 尝试测试数据库连接，但连接失败时不影响服务器启动
    await testConnection().catch(error => {
      console.warn('⚠️  数据库连接失败，但服务器将继续启动:', error.message);
    });

    app.listen(PORT, () => {
      console.log(`🚀 服务器启动成功`);
      console.log(`📍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 端口: ${PORT}`);
      console.log(`🕒 时间: ${new Date().toLocaleString()}`);
      console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在关闭服务器...');
  process.exit(0);
});

startServer();

export default app;