const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');
const k8s = require('@kubernetes/client-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Kubernetes client
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);

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
    const nodesResponse = await k8sApi.listNode();
    const nodes = nodesResponse.body.items.map(node => ({
      name: node.metadata.name,
      status: node.status.conditions.find(c => c.type === 'Ready')?.status || 'Unknown',
      version: node.status.nodeInfo.kubeletVersion,
      os: node.status.nodeInfo.osImage,
      architecture: node.status.nodeInfo.architecture,
      addresses: node.status.addresses,
      allocatable: node.status.allocatable,
      capacity: node.status.capacity
    }));
    
    res.json({
      cluster: {
        totalNodes: nodes.length,
        readyNodes: nodes.filter(n => n.status === 'True').length,
        version: nodes[0]?.version || 'Unknown'
      },
      nodes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cluster info', message: error.message });
  }
});

app.get('/api/nodes', async (req, res) => {
  try {
    const response = await k8sApi.listNode();
    const nodes = response.body.items.map(node => ({
      name: node.metadata.name,
      status: node.status.conditions.find(c => c.type === 'Ready')?.status || 'Unknown',
      version: node.status.nodeInfo.kubeletVersion,
      os: node.status.nodeInfo.osImage,
      roles: Object.keys(node.metadata.labels).filter(label => label.includes('node-role')),
      addresses: node.status.addresses,
      resources: {
        allocatable: node.status.allocatable,
        capacity: node.status.capacity
      },
      conditions: node.status.conditions
    }));
    
    res.json({ nodes, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nodes', message: error.message });
  }
});

app.get('/api/pods', async (req, res) => {
  try {
    const namespace = req.query.namespace || '';
    const response = namespace 
      ? await k8sApi.listNamespacedPod(namespace)
      : await k8sApi.listPodForAllNamespaces();
    
    const pods = response.body.items.map(pod => ({
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      status: pod.status.phase,
      node: pod.spec.nodeName,
      ip: pod.status.podIP,
      ready: pod.status.containerStatuses?.every(c => c.ready) || false,
      restarts: pod.status.containerStatuses?.reduce((sum, c) => sum + c.restartCount, 0) || 0,
      age: Math.floor((Date.now() - new Date(pod.metadata.creationTimestamp).getTime()) / 1000),
      labels: pod.metadata.labels,
      containers: pod.spec.containers.map(c => ({
        name: c.name,
        image: c.image,
        ports: c.ports || []
      }))
    }));
    
    res.json({ 
      namespace: namespace || 'all',
      totalPods: pods.length,
      runningPods: pods.filter(p => p.status === 'Running').length,
      pods, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pods', message: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const namespace = req.query.namespace || '';
    const response = namespace 
      ? await k8sApi.listNamespacedService(namespace)
      : await k8sApi.listServiceForAllNamespaces();
    
    const services = response.body.items.map(svc => ({
      name: svc.metadata.name,
      namespace: svc.metadata.namespace,
      type: svc.spec.type,
      clusterIP: svc.spec.clusterIP,
      ports: svc.spec.ports,
      selector: svc.spec.selector,
      externalIPs: svc.spec.externalIPs || [],
      loadBalancer: svc.status.loadBalancer || {}
    }));
    
    res.json({ 
      namespace: namespace || 'all',
      services, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services', message: error.message });
  }
});

app.get('/api/infrastructure', async (req, res) => {
  try {
    // Get all infrastructure info in one call
    const [nodesResponse, podsResponse, servicesResponse] = await Promise.all([
      k8sApi.listNode(),
      k8sApi.listPodForAllNamespaces(),
      k8sApi.listServiceForAllNamespaces()
    ]);
    
    const infrastructure = {
      cluster: {
        totalNodes: nodesResponse.body.items.length,
        readyNodes: nodesResponse.body.items.filter(n => 
          n.status.conditions.find(c => c.type === 'Ready')?.status === 'True'
        ).length,
        version: nodesResponse.body.items[0]?.status.nodeInfo.kubeletVersion || 'Unknown'
      },
      pods: {
        total: podsResponse.body.items.length,
        running: podsResponse.body.items.filter(p => p.status.phase === 'Running').length,
        pending: podsResponse.body.items.filter(p => p.status.phase === 'Pending').length,
        failed: podsResponse.body.items.filter(p => p.status.phase === 'Failed').length
      },
      services: {
        total: servicesResponse.body.items.length,
        clusterIP: servicesResponse.body.items.filter(s => s.spec.type === 'ClusterIP').length,
        nodePort: servicesResponse.body.items.filter(s => s.spec.type === 'NodePort').length,
        loadBalancer: servicesResponse.body.items.filter(s => s.spec.type === 'LoadBalancer').length
      },
      devopsTools: [
        { name: 'Terraform', status: 'configured', category: 'IaC' },
        { name: 'Kubernetes', status: 'active', category: 'Orchestration' },
        { name: 'Docker', status: 'running', category: 'Containerization' },
        { name: 'GitHub Actions', status: 'automated', category: 'CI/CD' },
        { name: 'nginx', status: 'running', category: 'Web Server' }
      ],
      currentPod: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          total: Math.round(os.totalmem() / 1024 / 1024),
          free: Math.round(os.freemem() / 1024 / 1024),
          used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024)
        },
        uptime: Math.round(os.uptime()),
        loadAverage: os.loadavg()
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(infrastructure);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch infrastructure', message: error.message });
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
  console.log(`🔧 API status: http://localhost:${PORT}/api/status`);
  console.log(`🖥️  System info: http://localhost:${PORT}/api/system`);
  console.log(`🛠️  DevOps tools: http://localhost:${PORT}/api/devops-tools`);
});

module.exports = app;
