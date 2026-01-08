import express from 'express';

// 导入真实数据
import { cases } from './cases';
import { todos } from './todos';
import { clients } from './clients';
import { messages } from './messages';
import { schedules } from './schedules';

const router = express.Router();

// 获取统计数据
router.get("/stats", (req, res) => {
  res.json({
    code: 200,
    message: "获取统计数据成功",
    data: {
      caseCount: cases.length,
      todoCount: todos.length,
      clientCount: clients.length,
      messageCount: messages.length
    }
  });
});

// 获取最近日程
router.get("/schedules", (req, res) => {
  // 返回最近5条日程
  const recentSchedules = [...schedules]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);
  
  res.json({
    code: 200,
    message: "获取最近日程成功",
    data: recentSchedules
  });
});

// 获取最近待办
router.get("/todos", (req, res) => {
  // 返回最近5条待办
  const recentTodos = [...todos]
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    .slice(0, 5);
  
  res.json({
    code: 200,
    message: "获取最近待办成功",
    data: recentTodos
  });
});

// 获取最近案件
router.get("/recent-cases", (req, res) => {
  // 返回最近5条案件
  const recentCases = [...cases]
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    .slice(0, 5);
  
  res.json({
    code: 200,
    message: "获取最近案件成功",
    data: recentCases
  });
});

// 获取最近消息
router.get("/messages", (req, res) => {
  // 返回最近5条消息
  const recentMessages = [...messages]
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    .slice(0, 5);
  
  res.json({
    code: 200,
    message: "获取最近消息成功",
    data: recentMessages
  });
});

// 获取系统监控数据
router.get("/monitor", (req, res) => {
  res.json({
    code: 200,
    message: "获取系统监控数据成功",
    data: {
      onlineUsers: 0,
      serverLoad: 0,
      dbConnections: 0
    }
  });
});

// 获取图表数据
router.get("/charts", (req, res) => {
  // 生成案件类型统计
  const caseTypeMap = new Map();
  cases.forEach(caseItem => {
    const type = caseItem.type || '其他';
    caseTypeMap.set(type, (caseTypeMap.get(type) || 0) + 1);
  });
  
  const caseTypeCategories = Array.from(caseTypeMap.keys());
  const caseTypeValues = Array.from(caseTypeMap.values());
  
  // 生成案件趋势数据（最近7天）
  const caseTrend: { xAxis: string[], yAxis: number[] } = {
    xAxis: [],
    yAxis: []
  };
  
  // 生成最近7天的日期
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0] || '';
      caseTrend.xAxis.push(dateStr);
      
      // 统计当天案件数量
      const count = cases.filter(caseItem => 
        caseItem.createTime && caseItem.createTime.startsWith(dateStr)
      ).length;
      caseTrend.yAxis.push(count);
    }
  
  res.json({
    code: 200,
    message: "获取图表数据成功",
    data: {
      caseTrend: caseTrend,
      incomeTrend: {
        xAxis: [],
        yAxis: []
      },
      caseType: {
        categories: caseTypeCategories,
        values: caseTypeValues
      },
      clientRegion: {
        categories: [],
        values: []
      }
    }
  });
});

export default router;