'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const clients_1 = __importDefault(require("./routes/clients"));
const cases_1 = __importDefault(require("./routes/cases"));
const financial_1 = __importDefault(require("./routes/financial"));
const documents_1 = __importDefault(require("./routes/documents"));
const schedules_1 = __importDefault(require("./routes/schedules"));
const todos_1 = __importDefault(require("./routes/todos"));
const messages_1 = __importDefault(require("./routes/messages"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const lawyers_1 = __importDefault(require("./routes/lawyers"));

dotenv_1.default.config();

const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());

const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '请求过于频繁，请稍后再试'
});
app.use(limiter);

app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://your-domain.com',
        'http://139.155.42.254'
    ],
    credentials: true
}));

// 创建上传目录
const uploadDir = path_1.default.join(__dirname, 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}

// 使用diskStorage将文件存储到磁盘
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名，避免冲突
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
    }
});

const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(upload.any());
app.use(logger_1.requestLogger);

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/clients', clients_1.default);
app.use('/api/cases', cases_1.default);
app.use('/api/financial', financial_1.default);
app.use('/api/documents', documents_1.default);
app.use('/api/schedules', schedules_1.default);
app.use('/api/todos', todos_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/lawyers', lawyers_1.default);

// 提供静态文件访问
app.use('/uploads', express_1.default.static(uploadDir));

app.use('*', (req, res) => {
    res.status(404).json({
        error: '接口不存在',
        path: req.originalUrl,
        method: req.method
    });
});

app.use(errorHandler_1.errorHandler);

const startServer = async () => {
    try {
        await (0, database_1.testConnection)().catch(error => {
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

process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 收到终止信号，正在关闭服务器...');
    process.exit(0);
});

startServer();
exports.default = app;