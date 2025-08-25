/**
 * GeoNexus DTS Provider - Model
 * 
 * 该模型负责从数字孪生系统获取数据，并将其转换为标准的GeoJSON格式。
 * 它通过RESTful API与DTS后端交互，遵循服务器对服务器的通信模式。
 * 
 * @module provider-dts/model
 * @author GeoNexus数据中台团队
 */

// 导入必要的依赖
const fetch = require('node-fetch');
const config = require('config');

/**
 * GeoNexus DTS数据模型类
 * 实现了Koop Provider的Model接口
 */
class GeoNexusDTSModel {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    // 存储配置选项
    this.options = options;
    
    // 获取配置，如果不存在则使用默认值
    this.apiUrl = this.options.apiUrl || config.get('provider-dts.apiUrl') || 'https://api.geonexus.com/dts';
    this.apiKey = this.options.apiKey || config.get('provider-dts.apiKey') || process.env.GEONEXUS_DTS_API_KEY;
    this.defaultSceneId = this.options.defaultSceneId || config.get('provider-dts.defaultSceneId') || 'default';
    this.timeout = this.options.timeout || config.get('provider-dts.timeout') || 30000;
    this.maxRecords = this.options.maxRecords || config.get('provider-dts.maxRecords') || 5000;
    this.logLevel = this.options.logLevel || config.get('provider-dts.logLevel') || 'info';
    
    // 日志前缀，用于标识日志来源
    this.logPrefix = '[GeoNexusDTSProvider]';
    
    if (this.logLevel !== 'error') {
      console.log(`${this.logPrefix} 初始化完成，API URL: ${this.apiUrl}`);
    }
  }

  /**
   * 获取数据方法，Koop核心会调用此方法
   * @param {Object} req - Express请求对象
   * @returns {Promise<Object>} 返回GeoJSON格式的数据
   */
  async getData(req) {
    const startTime = Date.now();
    
    try {
      // 1. 参数解析
      if (this.logLevel === 'debug' || this.logLevel === 'info') {
        console.log(`${this.logPrefix} 收到数据请求，解析参数...`);
      }
      
      // 从请求中提取场景ID，如果不存在则使用默认值
      const sceneId = req.params.id || this.defaultSceneId;
      
      // 从查询参数中提取其他参数
      const bbox = req.query.bbox;
      const where = req.query.where;
      const limit = parseInt(req.query.limit || req.query.resultRecordCount || this.maxRecords);
      const offset = parseInt(req.query.resultOffset || req.query.offset || 0);
      const outFields = req.query.outFields;
      
      if (this.logLevel === 'debug') {
        console.log(`${this.logPrefix} 请求参数: sceneId=${sceneId}, bbox=${bbox}, where=${where}, limit=${limit}, offset=${offset}`);
      }
      
      // 2. API请求构建
      let apiUrl = `${this.apiUrl}/scenes/${sceneId}/features`;
      const queryParams = new URLSearchParams();
      
      // 添加空间查询参数
      if (bbox) {
        const bboxParts = bbox.split(',').map(Number);
        if (bboxParts.length === 4) {
          queryParams.append('bbox', bbox);
        } else {
          console.warn(`${this.logPrefix} 无效的bbox参数: ${bbox}`);
        }
      }
      
      // 添加属性查询参数
      if (where) {
        queryParams.append('where', where);
      }
      
      // 添加分页参数
      if (limit && !isNaN(limit)) {
        queryParams.append('limit', Math.min(limit, this.maxRecords));
      }
      
      if (offset && !isNaN(offset)) {
        queryParams.append('offset', offset);
      }
      
      // 添加字段过滤
      if (outFields && outFields !== '*') {
        queryParams.append('outFields', outFields);
      }
      
      // 构建最终URL
      const finalUrl = `${apiUrl}?${queryParams.toString()}`;
      
      if (this.logLevel === 'debug') {
        console.log(`${this.logPrefix} 构建API请求URL: ${finalUrl}`);
      }
      
      // 3. 发送请求
      if (this.logLevel === 'debug' || this.logLevel === 'info') {
        console.log(`${this.logPrefix} 发送请求到GeoNexus DTS API...`);
      }
      
      // 在开发环境中，如果没有配置API密钥，使用模拟数据
      if (!this.apiKey && process.env.NODE_ENV !== 'production') {
        console.warn(`${this.logPrefix} 未配置API密钥，使用模拟数据`);
        const mockData = this.getMockData(sceneId);
        const geojson = this.transformToGeoJSON(mockData);
        
        // 添加元数据
        this.enhanceMetadata(geojson, {
          sceneId,
          queryTime: Date.now() - startTime,
          source: '模拟数据'
        });
        
        return geojson;
      }
      
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'GeoNexusDTSProvider/1.0'
        },
        timeout: this.timeout
      });
      
      // 4. 响应处理
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`DTS API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
        error.statusCode = response.status;
        throw error;
      }
      
      const dtsData = await response.json();
      
      if (this.logLevel === 'debug' || this.logLevel === 'info') {
        console.log(`${this.logPrefix} 成功获取DTS数据，要素数量: ${dtsData.features ? dtsData.features.length : 0}`);
      }
      
      // 5. 数据转换
      const geojson = this.transformToGeoJSON(dtsData);
      
      // 6. 元数据增强
      this.enhanceMetadata(geojson, {
        sceneId,
        queryTime: Date.now() - startTime,
        source: 'GeoNexus DTS API'
      });
      
      if (this.logLevel === 'debug') {
        console.log(`${this.logPrefix} 数据处理完成，转换后的要素数量: ${geojson.features.length}，耗时: ${Date.now() - startTime}ms`);
      }
      
      return geojson;
    } catch (error) {
      console.error(`${this.logPrefix} 获取数据失败:`, error);
      throw error; // 重新抛出错误，让Koop核心处理
    }
  }

  /**
   * 增强GeoJSON元数据
   * @param {Object} geojson - GeoJSON对象
   * @param {Object} info - 附加信息
   */
  enhanceMetadata(geojson, info = {}) {
    geojson.metadata = geojson.metadata || {};
    geojson.metadata.provider = 'GeoNexus 要素引擎 DTS数据服务';
    geojson.metadata.timestamp = new Date().toISOString();
    geojson.metadata.queryTime = `${info.queryTime}ms`;
    geojson.metadata.sceneId = info.sceneId;
    geojson.metadata.count = geojson.features.length;
    geojson.metadata.source = info.source;
    
    return geojson;
  }

  /**
   * 将GeoNexus DTS数据转换为标准的GeoJSON格式
   * @param {Object} dtsData - GeoNexus DTS API返回的数据
   * @returns {Object} GeoJSON FeatureCollection
   */
  transformToGeoJSON(dtsData) {
    try {
      // 健壮性检查：确保dtsData和dtsData.features存在
      if (!dtsData || !dtsData.features || !Array.isArray(dtsData.features)) {
        if (this.logLevel === 'debug' || this.logLevel === 'warn') {
          console.warn(`${this.logPrefix} 转换警告: 输入数据为空或格式不正确，返回空FeatureCollection`);
        }
        return {
          type: 'FeatureCollection',
          features: [],
          metadata: {
            provider: 'GeoNexus 要素引擎 DTS数据服务',
            timestamp: new Date().toISOString(),
            warning: '输入数据为空或格式不正确'
          }
        };
      }
      
      // 转换每个要素
      const features = dtsData.features.map(dtsFeature => {
        // 确保几何数据存在且格式正确
        if (!dtsFeature.geometry || !dtsFeature.geometry.type || !dtsFeature.geometry.coordinates) {
          if (this.logLevel === 'debug' || this.logLevel === 'warn') {
            console.warn(`${this.logPrefix} 转换警告: 要素缺少有效的几何数据，ID: ${dtsFeature.id || '未知'}`);
          }
          // 为缺少几何数据的要素创建一个默认点
          dtsFeature.geometry = {
            type: 'Point',
            coordinates: [0, 0]
          };
        }
        
        // 构建标准的GeoJSON Feature
        return {
          type: 'Feature',
          id: dtsFeature.id,
          geometry: dtsFeature.geometry,
          properties: dtsFeature.properties || {}
        };
      });
      
      // 构建并返回GeoJSON FeatureCollection
      return {
        type: 'FeatureCollection',
        features: features,
        metadata: dtsData.metadata || {}
      };
    } catch (error) {
      console.error(`${this.logPrefix} 数据转换失败:`, error);
      // 返回一个空的FeatureCollection，而不是抛出错误
      return {
        type: 'FeatureCollection',
        features: [],
        metadata: {
          provider: 'GeoNexus 要素引擎 DTS数据服务',
          timestamp: new Date().toISOString(),
          error: `数据转换失败: ${error.message}`
        }
      };
    }
  }
  
  /**
   * 模拟数据方法，用于开发和测试
   * 在实际生产环境中，此方法将被移除，使用真实的API调用
   * @param {string} sceneId - 场景ID
   * @returns {Object} 模拟的DTS数据
   */
  getMockData(sceneId) {
    if (this.logLevel === 'debug' || this.logLevel === 'info') {
      console.log(`${this.logPrefix} 使用模拟数据，场景ID: ${sceneId}`);
    }
    
    // 根据不同的场景ID返回不同的模拟数据
    switch(sceneId) {
      case 'buildings':
        return {
          featureCount: 2,
          features: [
            {
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
          ]
        };
        
      case 'pois':
        return {
          featureCount: 2,
          features: [
            {
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
          ]
        };
        
      default:
        return {
          featureCount: 1,
          features: [
            {
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
          ]
        };
    }
  }
}

module.exports = GeoNexusDTSModel;
