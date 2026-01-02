"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.json({ code: 200, message: '获取用户列表成功', data: [] });
});
router.get('/profile', (req, res) => {
    res.json({ code: 200, message: '获取用户信息成功', data: {} });
});
exports.default = router;
//# sourceMappingURL=users.js.map