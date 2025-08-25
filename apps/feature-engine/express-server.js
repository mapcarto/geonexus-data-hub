// 简单的Express服务器，作为临时的GeoNexus要素引擎服务替代品
const express = require('express');
const app = express();

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 创建一个简单的路由，用于测试服务是否正常运行
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'GeoNexus 数据中台已启动',
    timestamp: new Date().toISOString()
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      api: 'running',
      database: 'connected'
    },
    timestamp: new Date().toISOString()
  });
});

// 调试路由 - 显示所有请求信息
app.get('/debug', (req, res) => {
  res.json({
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// 创建一个模拟的FeatureServer端点
app.get('/rest/services/:provider/FeatureServer/0/query', (req, res) => {
  const provider = req.params.provider;
  
  // 返回一个简单的GeoJSON FeatureCollection
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [116.4, 39.9]
        },
        properties: {
          id: '1',
          name: '测试点1',
          status: 'active',
          asset_ids: ['asset1', 'asset2']
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [116.5, 39.8]
        },
        properties: {
          id: '2',
          name: '测试点2',
          status: 'inactive',
          asset_ids: ['asset3']
        }
      }
    ]
  });
});

// 创建一个模拟的企业级PostGIS Provider端点
app.get('/provider-postgis-enterprise/:tableName/FeatureServer/0/query', (req, res) => {
  const tableName = req.params.tableName;
  
  // 模拟白名单检查
  const allowedTables = ['public.business_features', 'public.buildings', 'public.pois'];
  if (!allowedTables.includes(tableName)) {
    return res.status(403).json({
      error: '安全限制：不允许查询表: ' + tableName,
      status: 403
    });
  }
  
  // 记录审计信息
  console.log(`[企业级PostGIS] 授权查询表: ${tableName}，查询参数:`, req.query);
  
  // 返回一个带有企业级元数据的GeoJSON FeatureCollection
  res.json({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [116.4, 39.9]
        },
        properties: {
          id: '1',
          name: '企业级测试点1',
          status: 'active',
          asset_ids: ['asset1', 'asset2']
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [116.5, 39.8]
        },
        properties: {
          id: '2',
          name: '企业级测试点2',
          status: 'inactive',
          asset_ids: ['asset3']
        }
      }
    ],
    metadata: {
      provider: 'GeoNexus 要素引擎 PostGIS数据服务',
      timestamp: new Date().toISOString(),
      queryTime: '10ms',
      securityLevel: '企业级',
      count: 2
    }
  });
});

// 创建一个模拟的GeoNexus DTS Provider端点
app.get('/provider-dts/:sceneId/FeatureServer/0/query', (req, res) => {
  const sceneId = req.params.sceneId;
  
  // 记录请求信息
  console.log(`[GeoNexus DTS] 收到场景查询: ${sceneId}，查询参数:`, req.query);
  
  // 根据不同的场景ID返回不同的数据
  let features = [];
  
  switch(sceneId) {
    case 'buildings':
      features = [
        {
          type: 'Feature',
          id: 'bldg-001',
          geometry: {
            type: 'Polygon',
            coordinates: [[[116.4, 39.9], [116.41, 39.9], [116.41, 39.91], [116.4, 39.91], [116.4, 39.9]]]
          },
          properties: {
            name: 'GeoNexus总部大厦',
            height: 120,
            floors: 30,
            status: 'active',
            asset_ids: ['asset1', 'asset2']
          }
        },
        {
          type: 'Feature',
          id: 'bldg-002',
          geometry: {
            type: 'Polygon',
            coordinates: [[[116.42, 39.92], [116.43, 39.92], [116.43, 39.93], [116.42, 39.93], [116.42, 39.92]]]
          },
          properties: {
            name: 'GeoNexus研发中心',
            height: 80,
            floors: 20,
            status: 'inactive',
            asset_ids: ['asset3']
          }
        }
      ];
      break;
      
    case 'pois':
      features = [
        {
          type: 'Feature',
          id: 'poi-001',
          geometry: {
            type: 'Point',
            coordinates: [116.4, 39.9]
          },
          properties: {
            name: 'GeoNexus咖啡厅',
            category: 'restaurant',
            rating: 4.8,
            status: 'active',
            asset_ids: ['asset4', 'asset5']
          }
        },
        {
          type: 'Feature',
          id: 'poi-002',
          geometry: {
            type: 'Point',
            coordinates: [116.42, 39.92]
          },
          properties: {
            name: 'GeoNexus健身中心',
            category: 'fitness',
            rating: 4.5,
            status: 'active',
            asset_ids: ['asset6']
          }
        }
      ];
      break;
      
    default:
      features = [
        {
          type: 'Feature',
          id: 'default-001',
          geometry: {
            type: 'Point',
            coordinates: [116.4, 39.9]
          },
          properties: {
            name: '默认要素1',
            status: 'active',
            asset_ids: ['asset7']
          }
        }
      ];
  }
  
  // 返回一个带有DTS元数据的GeoJSON FeatureCollection
  res.json({
    type: 'FeatureCollection',
    features: features,
    metadata: {
      provider: 'GeoNexus 要素引擎 DTS数据服务',
      timestamp: new Date().toISOString(),
      queryTime: '15ms',
      sceneId: sceneId,
      count: features.length,
      source: '模拟数据'
    }
  });
});

// 添加一个通配符路由，用于捕获所有其他请求
app.use('*', (req, res) => {
  res.status(404).json({
    error: '未找到请求的资源',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const port = process.env.PORT || 7071;
app.listen(port, '0.0.0.0', () => {
  console.log(`GeoNexus 要素引擎服务器已启动，监听端口: ${port}，绑定到所有网络接口`);
});
