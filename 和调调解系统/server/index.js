const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const caseRoutes = require('./routes/cases');
const archiveRoutes = require('./routes/archives');
const documentRoutes = require('./routes/documents');
const videoRoutes = require('./routes/video');
const pushRoutes = require('./routes/push');
const callcenterRoutes = require('./routes/callcenter');
const sysdesignRoutes = require('./routes/sysdesign');
const settingsRoutes = require('./routes/settings');
const userRoutes = require('./routes/users');
const workflowRoutes = require('./routes/workflow');
const scheduleRoutes = require('./routes/schedules');
const callProviderRoutes = require('./routes/callProviders');
const pushProviderRoutes = require('./routes/pushProviders');
const feedbackRoutes = require('./routes/feedbacks');
const reportRoutes = require('./routes/reports');
const fileRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..')));

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/notifications', pushRoutes);
app.use('/api/callcenter', callcenterRoutes);
app.use('/api/sysdesign', sysdesignRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/call-providers', callProviderRoutes);
app.use('/api/push-providers', pushProviderRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/files', fileRoutes);

app.get('/{*path}', (req, res) => {
  const pathVal = Array.isArray(req.params.path) ? req.params.path.join('/') : (req.params.path || '');
  const ext = path.extname(pathVal);
  const staticExts = ['.js', '.mjs', '.css', '.map', '.png', '.jpg', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  if (staticExts.includes(ext)) {
    return res.status(404).end();
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: '服务器内部错误', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

function start() {
  console.log('Initializing database...');
  initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ⚖  和调 · 调解机构管理平台`);
    console.log(`  Server running at http://0.0.0.0:${PORT}`);
    console.log(`  API base URL: http://localhost:${PORT}/api`);
    console.log(`  Database: SQLite (${path.join(__dirname, '..', 'data', 'mediation.db')})\n`);
  });
}

start();
