'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {  default: mod };
};
Object.defineProperty(exports, __esModule, { value: true });
const express_1 = __importDefault(require(express));
const router = express_1.default.Router();
const path = require('path');
const fs = require('fs');

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
        const file = req.files?.[0];
        if (!file) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的头像文件'
            });
        }

        // 构建文件URL
        const fileUrl = `http://139.155.42.254/uploads/${file.filename}`;

        // 返回上传结果
        res.json({
            code: 200,
            message: '头像上传成功',
            data: {
                url: fileUrl,
                filename: file.filename,
                path: file.path,
                size: file.size
            }
        });
    } catch (error) {
        console.error('头像上传失败:', error);
        res.status(500).json({
            code: 500,
            message: '头像上传失败',
            error: error.message
        });
    }
});

// 提供静态文件访问
router.use('/uploads', express_1.default.static(path.join(__dirname, '../../uploads')));
exports.default = router;
//# sourceMappingURL=users.js.map