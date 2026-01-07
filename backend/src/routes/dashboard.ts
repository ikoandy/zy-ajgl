import express from 'express';

const router = express.Router();

// 获取统计数据
router.get('/stats', (req, res) => {
  res.json({
    code: 200,
    message: '获取统计数据成功',
    data: {
      caseCount: 0,
      todoCount: 0,
      clientCount: 0,
      messageCount: 0
    }
  });
});

// 获取最近日程
router.get('/schedules', (req, res) => {
  res.json({
    code: 200,
    message: '获取最近日程成功',
    data: []
  });
});

// 获取最近待办
router.get('/todos', (req, res) => {
  res.json({
    code: 200,
    message: '获取最近待办成功',
    data: []
  });
});

// 获取最近案件
router.get('/recent-cases', (req, res) => {
  res.json({
    code: 200,
    message: '获取最近案件成功',
    data: []
  });
});

// 获取最近消息
router.get('/messages', (req, res) => {
  res.json({
    code: 200,
    message: '获取最近消息成功',
    data: []
  });
});

// 获取系统监控数据
router.get('/monitor', (req, res) => {
  res.json({
    code: 200,
    message: '获取系统监控数据成功',
    data: {
      onlineUsers: 0,
      serverLoad: 0,
      dbConnections: 0
    }
  });
});

// 获取图表数据
router.get('/charts', (req, res) => {
  res.json({
    code: 200,
    message: '获取图表数据成功',
    data: {
      caseTrend: {
        xAxis: [],
        yAxis: []
      },
      incomeTrend: {
        xAxis: [],
        yAxis: []
      },
      caseType: {
        categories: [],
        values: []
      },
      clientRegion: {
        categories: [],
        values: []
      }
    }
  });
});

export default router;