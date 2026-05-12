const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');
const { seed } = require('./seed');

const authRoutes = require('./routes/auth');
const caseRoutes = require('./routes/cases');
const archiveRoutes = require('./routes/archives');
const documentRoutes = require('./routes/documents');
const videoRoutes = require('./routes/video');
const pushRoutes = require('./routes/push');
const callcenterRoutes = require('./routes/callcenter');
const sysdesignRoutes = require('./routes/sysdesign');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: '服务器内部错误', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

function start() {
  console.log('Initializing database...');
  initDatabase();
  seed();

  app.listen(PORT, () => {
    console.log(`\n  ⚖  和调 · 调解机构管理平台`);
    console.log(`  Server running at http://localhost:${PORT}`);
    console.log(`  API base URL: http://localhost:${PORT}/api`);
    console.log(`  Database: SQLite (${path.join(__dirname, '..', 'data', 'mediation.db')})\n`);
  });
}

start();
