const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');
// const k8s = require('@kubernetes/client-node'); // Commented out - ES Module issue
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Kubernetes client - will be initialized dynamically
let k8sApi = null;
let k8sAppsApi = null;

// Initialize Kubernetes client
async function initK8s() {
  try {
    const k8s = await import('@kubernetes/client-node');
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    console.log('✅ Kubernetes client initialized successfully');
  } catch (error) {
    console.log('⚠️ Kubernetes client not available:', error.message);
  }
}

// Initialize K8s client on startup
initK8s();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>🚀 DevOps Lab Dashboard</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2c3e50; margin: 0; }
            .header p { color: #7f8c8d; margin: 10px 0; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .card h3 { margin: 0 0 15px 0; color: #2c3e50; }
            .status-ok { color: #27ae60; font-weight: bold; }
            .status-warning { color: #f39c12; font-weight: bold; }
            .status-error { color: #e74c3c; font-weight: bold; }
            .endpoint { background: #ecf0f1; padding: 10px; margin: 5px 0; border-radius: 4px; }
            .endpoint a { text-decoration: none; color: #3498db; }
            .endpoint a:hover { text-decoration: underline; }
            .refresh { text-align: center; margin: 20px 0; }
            .refresh button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
            .refresh button:hover { background: #2980b9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 DevOps Lab Infrastructure Dashboard</h1>
                <p>Мониторинг статуса всех компонентов инфраструктуры</p>
                <p><strong>Pod:</strong> ${os.hostname()} | <strong>Node:</strong> ${process.env.KUBERNETES_NODE_NAME || 'Unknown'}</p>
            </div>
            
            <div class="refresh">
                <button onclick="location.reload()">🔄 Обновить данные</button>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📊 API Endpoints</h3>
                    <div class="endpoint"><a href="/api/cluster">GET /api/cluster</a> - Статус кластера</div>
                    <div class="endpoint"><a href="/api/nodes">GET /api/nodes</a> - Информация о узлах</div>
                    <div class="endpoint"><a href="/api/pods">GET /api/pods</a> - Статус подов</div>
                    <div class="endpoint"><a href="/api/services">GET /api/services</a> - Сервисы</div>
                    <div class="endpoint"><a href="/api/infrastructure">GET /api/infrastructure</a> - Вся инфраструктура</div>
                    <div class="endpoint"><a href="/health">GET /health</a> - Health check</div>
                </div>
                
                <div class="card">
                    <h3>🖥️ Текущий Pod</h3>
                    <p><strong>Hostname:</strong> ${os.hostname()}</p>
                    <p><strong>Platform:</strong> ${os.platform()} ${os.arch()}</p>
                    <p><strong>CPUs:</strong> ${os.cpus().length}</p>
                    <p><strong>Memory:</strong> ${Math.round(os.totalmem() / 1024 / 1024)} MB</p>
                    <p><strong>Uptime:</strong> ${Math.round(os.uptime())} seconds</p>
                </div>
                
                <div class="card">
                    <h3>🔧 Quick Actions</h3>
                    <div class="endpoint"><a href="/api/infrastructure" target="_blank">📋 Full Infrastructure Status</a></div>
                    <div class="endpoint"><a href="/api/cluster" target="_blank">☸️ Kubernetes Cluster Info</a></div>
                    <div class="endpoint"><a href="/api/pods?namespace=devops-lab" target="_blank">🐳 DevOps Lab Pods</a></div>
                </div>
            </div>
        </div>
        
        <script>
            // Auto-refresh every 30 seconds
            setTimeout(() => location.reload(), 30000);
        </script>
    </body>
    </html>
  `);
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

// Kubernetes API endpoints
app.get('/api/cluster', async (req, res) => {
  try {
    if (!k8sApi) {
      return res.status(503).json({
        error: 'Kubernetes client not available',
        message: 'Kubernetes client is still initializing or not available'
      });
    }

    const [nodesResponse, versionResponse] = await Promise.all([
      k8sApi.listNode(),
      k8sApi.getAPIResources()
    ]);

    res.json({
      nodes: nodesResponse.body.items.length,
      nodeNames: nodesResponse.body.items.map(node => node.metadata.name),
      kubernetesVersion: versionResponse.body.groupVersion || 'Unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch cluster info',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/nodes', async (req, res) => {
  try {
    if (!k8sApi) {
      return res.status(503).json({
        error: 'Kubernetes client not available',
        message: 'Kubernetes client is still initializing or not available'
      });
    }

    const response = await k8sApi.listNode();
    const nodes = response.body.items.map(node => ({
      name: node.metadata.name,
      status: node.status.conditions.find(c => c.type === 'Ready')?.status || 'Unknown',
      roles: Object.keys(node.metadata.labels || {}).filter(label => label.includes('node-role')),
      kubeletVersion: node.status.nodeInfo?.kubeletVersion || 'Unknown',
      os: node.status.nodeInfo?.operatingSystem || 'Unknown',
      architecture: node.status.nodeInfo?.architecture || 'Unknown',
      capacity: node.status.capacity || {},
      allocatable: node.status.allocatable || {}
    }));

    res.json({
      nodes,
      count: nodes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch nodes info',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/pods', async (req, res) => {
  try {
    if (!k8sApi) {
      return res.status(503).json({
        error: 'Kubernetes client not available',
        message: 'Kubernetes client is still initializing or not available'
      });
    }

    const namespace = req.query.namespace || 'all';
    let response;
    
    if (namespace === 'all') {
      response = await k8sApi.listPodForAllNamespaces();
    } else {
      response = await k8sApi.listNamespacedPod(namespace);
    }

    const pods = response.body.items.map(pod => ({
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      status: pod.status.phase,
      ready: pod.status.containerStatuses?.filter(c => c.ready).length || 0,
      total: pod.status.containerStatuses?.length || 0,
      node: pod.spec.nodeName,
      ip: pod.status.podIP,
      restartCount: pod.status.containerStatuses?.[0]?.restartCount || 0,
      age: new Date(pod.metadata.creationTimestamp).toISOString()
    }));

    res.json({
      pods,
      count: pods.length,
      namespace: namespace === 'all' ? 'all' : namespace,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch pods info',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    if (!k8sApi) {
      return res.status(503).json({
        error: 'Kubernetes client not available',
        message: 'Kubernetes client is still initializing or not available'
      });
    }

    const namespace = req.query.namespace || 'all';
    let response;
    
    if (namespace === 'all') {
      response = await k8sApi.listServiceForAllNamespaces();
    } else {
      response = await k8sApi.listNamespacedService(namespace);
    }

    const services = response.body.items.map(service => ({
      name: service.metadata.name,
      namespace: service.metadata.namespace,
      type: service.spec.type,
      clusterIP: service.spec.clusterIP,
      ports: service.spec.ports?.map(p => ({
        port: p.port,
        targetPort: p.targetPort,
        protocol: p.protocol
      })) || [],
      selector: service.spec.selector || {},
      age: new Date(service.metadata.creationTimestamp).toISOString()
    }));

    res.json({
      services,
      count: services.length,
      namespace: namespace === 'all' ? 'all' : namespace,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch services info',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/infrastructure', async (req, res) => {
  try {
    const localInfo = {
      hostname: os.hostname(),
      platform: `${os.platform()} ${os.arch()}`,
      cpus: os.cpus().length,
      memory: Math.round(os.totalmem() / 1024 / 1024),
      uptime: Math.round(os.uptime()),
      nodeName: process.env.KUBERNETES_NODE_NAME || 'Unknown'
    };

    let k8sInfo = null;
    if (k8sApi && k8sAppsApi) {
      try {
        const [nodesResponse, podsResponse, servicesResponse] = await Promise.all([
          k8sApi.listNode(),
          k8sApi.listPodForAllNamespaces(),
          k8sApi.listServiceForAllNamespaces()
        ]);

        k8sInfo = {
          nodes: nodesResponse.body.items.length,
          pods: podsResponse.body.items.length,
          services: servicesResponse.body.items.length,
          nodeNames: nodesResponse.body.items.map(node => node.metadata.name)
        };
      } catch (k8sError) {
        console.log('Kubernetes info fetch failed:', k8sError.message);
      }
    }

    res.json({
      local: localInfo,
      kubernetes: k8sInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch infrastructure info',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api/`);
  console.log(`🖥️  Dashboard: http://localhost:${PORT}/`);
});

module.exports = app;
