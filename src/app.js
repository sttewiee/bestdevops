const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 DevOps Lab Dashboard API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    services: {
      api: 'running',
      database: 'connected',
      cache: 'active',
      monitoring: 'enabled'
    },
    metrics: {
      requests: Math.floor(Math.random() * 1000),
      errors: Math.floor(Math.random() * 10),
      responseTime: Math.random() * 100
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/system', (req, res) => {
  const os = require('os');
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },
    uptime: os.uptime(),
    loadAverage: os.loadavg(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/devops-tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'Terraform',
        category: 'IaC',
        status: 'configured',
        description: 'Infrastructure as Code'
      },
      {
        name: 'Docker',
        category: 'Containerization',
        status: 'running',
        description: 'Container platform'
      },
      {
        name: 'Kubernetes',
        category: 'Orchestration',
        status: 'active',
        description: 'Container orchestration'
      },
      {
        name: 'Prometheus',
        category: 'Monitoring',
        status: 'collecting',
        description: 'Metrics collection'
      },
      {
        name: 'Grafana',
        category: 'Visualization',
        status: 'displaying',
        description: 'Metrics visualization'
      },
      {
        name: 'ELK Stack',
        category: 'Logging',
        status: 'indexing',
        description: 'Centralized logging'
      },
      {
        name: 'GitHub Actions',
        category: 'CI/CD',
        status: 'automated',
        description: 'Continuous Integration/Deployment'
      }
    ],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DevOps Lab Dashboard running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API status: http://localhost:${PORT}/api/status`);
  console.log(`🖥️  System info: http://localhost:${PORT}/api/system`);
  console.log(`🛠️  DevOps tools: http://localhost:${PORT}/api/devops-tools`);
});

module.exports = app;
