/**
 * GeoNexus DTS Provider - 模型测试
 * 
 * 这个测试文件验证GeoNexusDTSModel的功能是否符合预期
 */

const assert = require('assert');
const GeoNexusDTSModel = require('../src/model');

describe('GeoNexusDTSModel', function() {
  let model;
  
  before(function() {
    // 创建模型实例，使用测试配置
    model = new GeoNexusDTSModel({
      apiUrl: 'https://test-api.geonexus.com/dts',
      apiKey: 'test-api-key',
      defaultSceneId: 'test-scene',
      timeout: 5000,
      logLevel: 'error' // 测试时不输出日志
    });
  });
  
  describe('#constructor()', function() {
    it('应该使用提供的配置初始化', function() {
      const testModel = new GeoNexusDTSModel({
        apiUrl: 'https://custom-api.geonexus.com/dts',
        apiKey: 'custom-api-key'
      });
      
      assert.strictEqual(testModel.apiUrl, 'https://custom-api.geonexus.com/dts');
      assert.strictEqual(testModel.apiKey, 'custom-api-key');
      assert.strictEqual(testModel.defaultSceneId, 'default'); // 默认值
    });
  });
  
  describe('#transformToGeoJSON()', function() {
    it('应该将DTS数据转换为有效的GeoJSON', function() {
      const dtsData = {
        featureCount: 1,
        features: [
          {
            id: 'test-001',
            geometry: {
              type: 'Point',
              coordinates: [116.4, 39.9]
            },
            properties: {
              name: '测试点位',
              status: 'active',
              asset_ids: ['asset1', 'asset2']
            }
          }
        ]
      };
      
      const geojson = model.transformToGeoJSON(dtsData);
      
      // 验证结果是否为有效的GeoJSON FeatureCollection
      assert.strictEqual(geojson.type, 'FeatureCollection');
      assert.ok(Array.isArray(geojson.features));
      assert.strictEqual(geojson.features.length, 1);
      
      // 验证第一个要素
      const feature = geojson.features[0];
      assert.strictEqual(feature.type, 'Feature');
      assert.strictEqual(feature.id, 'test-001');
      assert.deepStrictEqual(feature.geometry, {
        type: 'Point',
        coordinates: [116.4, 39.9]
      });
      assert.strictEqual(feature.properties.name, '测试点位');
      assert.strictEqual(feature.properties.status, 'active');
      assert.deepStrictEqual(feature.properties.asset_ids, ['asset1', 'asset2']);
    });
    
    it('应该处理空或无效的输入数据', function() {
      // 测试空输入
      const emptyGeojson = model.transformToGeoJSON(null);
      assert.strictEqual(emptyGeojson.type, 'FeatureCollection');
      assert.strictEqual(emptyGeojson.features.length, 0);
      
      // 测试缺少features数组的输入
      const invalidGeojson = model.transformToGeoJSON({metadata: {}});
      assert.strictEqual(invalidGeojson.type, 'FeatureCollection');
      assert.strictEqual(invalidGeojson.features.length, 0);
    });
    
    it('应该处理缺少几何数据的要素', function() {
      const dtsData = {
        featureCount: 1,
        features: [
          {
            id: 'test-002',
            properties: {
              name: '缺少几何数据的要素',
              status: 'inactive'
            }
            // 故意缺少geometry字段
          }
        ]
      };
      
      const geojson = model.transformToGeoJSON(dtsData);
      
      // 验证结果
      assert.strictEqual(geojson.features.length, 1);
      const feature = geojson.features[0];
      
      // 验证是否创建了默认几何
      assert.ok(feature.geometry);
      assert.strictEqual(feature.geometry.type, 'Point');
      assert.deepStrictEqual(feature.geometry.coordinates, [0, 0]);
    });
  });
  
  describe('#enhanceMetadata()', function() {
    it('应该正确增强GeoJSON元数据', function() {
      const geojson = {
        type: 'FeatureCollection',
        features: []
      };
      
      const info = {
        sceneId: 'test-scene',
        queryTime: 123,
        source: '测试源'
      };
      
      model.enhanceMetadata(geojson, info);
      
      assert.ok(geojson.metadata);
      assert.strictEqual(geojson.metadata.provider, 'GeoNexus 要素引擎 DTS数据服务');
      assert.strictEqual(geojson.metadata.sceneId, 'test-scene');
      assert.strictEqual(geojson.metadata.queryTime, '123ms');
      assert.strictEqual(geojson.metadata.source, '测试源');
      assert.strictEqual(geojson.metadata.count, 0);
    });
  });
  
  describe('#getMockData()', function() {
    it('应该根据不同的场景ID返回不同的模拟数据', function() {
      // 测试buildings场景
      const buildingsData = model.getMockData('buildings');
      assert.ok(buildingsData.features);
      assert.ok(buildingsData.features.length > 0);
      assert.strictEqual(buildingsData.features[0].properties.name, 'GeoNexus总部大厦');
      
      // 测试pois场景
      const poisData = model.getMockData('pois');
      assert.ok(poisData.features);
      assert.ok(poisData.features.length > 0);
      assert.strictEqual(poisData.features[0].properties.name, 'GeoNexus咖啡厅');
      
      // 测试默认场景
      const defaultData = model.getMockData('unknown');
      assert.ok(defaultData.features);
      assert.ok(defaultData.features.length > 0);
      assert.strictEqual(defaultData.features[0].properties.name, '默认要素1');
    });
  });
  
  describe('#getData()', function() {
    it('应该处理请求参数并构建正确的API URL', async function() {
      // 模拟请求对象
      const req = {
        params: {
          id: 'test-scene'
        },
        query: {
          bbox: '116.3,39.8,116.5,40.0',
          where: "status='active'",
          limit: '100',
          resultOffset: '10',
          outFields: 'name,status'
        }
      };
      
      // 保存原始的fetch函数
      const originalFetch = global.fetch;
      
      try {
        // 模拟fetch函数
        let requestUrl = '';
        global.fetch = (url, options) => {
          requestUrl = url;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(model.getMockData('test-scene'))
          });
        };
        
        // 调用getData方法
        await model.getData(req);
        
        // 验证构建的URL是否正确
        assert.ok(requestUrl.includes('test-scene/features'));
        assert.ok(requestUrl.includes('bbox=116.3,39.8,116.5,40.0'));
        assert.ok(requestUrl.includes("where=status='active'"));
        assert.ok(requestUrl.includes('limit=100'));
        assert.ok(requestUrl.includes('offset=10'));
        assert.ok(requestUrl.includes('outFields=name,status'));
        
      } finally {
        // 恢复原始的fetch函数
        global.fetch = originalFetch;
      }
    });
    
    it('应该在没有API密钥时使用模拟数据', async function() {
      // 创建一个没有API密钥的模型
      const noKeyModel = new GeoNexusDTSModel({
        apiUrl: 'https://test-api.geonexus.com/dts',
        apiKey: '',
        logLevel: 'error'
      });
      
      // 模拟请求对象
      const req = {
        params: {
          id: 'buildings'
        },
        query: {}
      };
      
      // 保存原始的环境变量
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      try {
        // 调用getData方法
        const result = await noKeyModel.getData(req);
        
        // 验证结果是否来自模拟数据
        assert.strictEqual(result.metadata.source, '模拟数据');
        assert.strictEqual(result.features.length, 2);
        assert.strictEqual(result.features[0].properties.name, 'GeoNexus总部大厦');
        
      } finally {
        // 恢复原始的环境变量
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});