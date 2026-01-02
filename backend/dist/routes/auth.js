"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/login', (req, res) => {
    res.json({ code: 200, message: '登录成功', data: { token: 'test-token' } });
});
router.post('/register', (req, res) => {
    res.json({ code: 200, message: '注册成功' });
});
exports.default = router;
//# sourceMappingURL=auth.js.map