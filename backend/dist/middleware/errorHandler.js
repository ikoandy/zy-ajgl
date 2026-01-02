"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || '服务器内部错误';
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = '数据验证失败';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token无效';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token已过期';
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = '资源ID格式错误';
    }
    const errorResponse = {
        success: false,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        errorResponse.error = error;
    }
    console.error('❌ 错误信息:', {
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map