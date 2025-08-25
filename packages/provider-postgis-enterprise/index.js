// 引入官方的 PostGIS Provider
const OfficialPostgisProvider = require('@koopjs/provider-postgis');
const config = require('config');

/**
 * 企业级 PostGIS 数据提供者模型
 * 继承并扩展官方 PostGIS 模型，添加企业级功能
 */
class EnterprisePostgisModel extends OfficialPostgisProvider.Model {
  /**
   * 构造函数
   * @param {object} options - 配置选项
   */
  constructor(options = {}) {
    super(options);
    
    // 加载企业级配置
    try {
      this.enterpriseConfig = config.get('enterprise-postgis') || {};
    } catch (e) {
      this.enterpriseConfig = {};
      console.warn('未找到企业级PostGIS配置，使用默认值');
    }
    
    // 设置允许的表白名单
    this.allowedTables = this.enterpriseConfig.allowedTables || [];
    if (this.allowedTables.length > 0) {
      console.log('企业级PostGIS Provider已启用，允许查询的表:', this.allowedTables);
    }
    
    // 启用审计日志
    this.enableAudit = this.enterpriseConfig.enableAudit || false;
    this.auditTable = this.enterpriseConfig.auditTable || 'public.data_access_logs';
    
    // 设置日志级别
    this.logLevel = this.enterpriseConfig.logLevel || 'info';
  }

  /**
   * 记录审计日志
   * @param {string} tableName - 查询的表名
   * @param {object} query - 查询参数
   * @param {object} user - 用户信息
   * @returns {Promise<void>}
   */
  async logAudit(tableName, query, user = {}) {
    if (!this.enableAudit) return;
    
    try {
      const client = await this.pool.connect();
      try {
        const sql = `
          INSERT INTO ${this.auditTable} 
          (table_name, query_params, user_id, user_ip, access_time)
          VALUES ($1, $2, $3, $4, NOW())
        `;
        
        await client.query(sql, [
          tableName,
          JSON.stringify(query),
          user.id || 'anonymous',
          user.ip || '0.0.0.0'
        ]);
        
        if (this.logLevel === 'debug') {
          console.log(`[审计] 记录了对表 ${tableName} 的访问`);
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('记录审计日志失败:', error);
      // 审计日志失败不应影响主要功能
    }
  }

  /**
   * 获取数据方法，重写基类方法以添加企业级功能
   * @param {object} req - Express请求对象
   */
  async getData(req) {
    const startTime = Date.now();
    
    // 解析请求参数
    const tableName = req.params.id; // 从URL路径中获取表名
    const query = req.query || {}; // URL查询参数
    
    // 增强的日志
    if (this.logLevel === 'debug' || this.logLevel === 'info') {
      console.log(`[企业级PostGIS] 正在查询表: ${tableName}，查询参数:`, query);
    }
    
    // 验证表名是否在白名单中
    if (!this.isTableAllowed(tableName)) {
      const error = new Error(`安全限制：不允许查询表: ${tableName}`);
      error.statusCode = 403; // Forbidden
      throw error;
    }
    
    // 记录审计日志
    const userInfo = {
      id: req.user?.id || 'anonymous',
      ip: req.ip || req.connection?.remoteAddress || '0.0.0.0'
    };
    await this.logAudit(tableName, query, userInfo);
    
    try {
      // 调用父类方法获取数据
      const geojson = await super.getData(req);
      
      // 增强元数据
      geojson.metadata = geojson.metadata || {};
      geojson.metadata.provider = '飞渡企业级PostGIS数据服务';
      geojson.metadata.timestamp = new Date().toISOString();
      geojson.metadata.queryTime = `${Date.now() - startTime}ms`;
      geojson.metadata.securityLevel = '企业级';
      
      // 详细日志
      if (this.logLevel === 'debug') {
        console.log(`[企业级PostGIS] 查询完成，返回 ${geojson.features.length} 条记录，耗时 ${Date.now() - startTime}ms`);
      }
      
      return geojson;
    } catch (error) {
      console.error('[企业级PostGIS] 处理请求时发生错误:', error);
      throw error;
    }
  }
  
  /**
   * 检查表名是否在允许的白名单中
   * @param {string} tableName - 表名
   * @returns {boolean} 是否允许
   */
  isTableAllowed(tableName) {
    // 如果白名单为空，则允许所有表（不推荐用于生产环境）
    if (!this.allowedTables || this.allowedTables.length === 0) {
      console.warn('[安全警告] PostGIS表白名单为空，允许访问所有表！');
      return true;
    }
    
    // 支持完整的schema.table格式和简单的table格式
    return this.allowedTables.includes(tableName) || 
           this.allowedTables.some(allowed => {
             // 如果白名单项包含schema，则完全匹配
             if (allowed.includes('.')) {
               return allowed === tableName;
             }
             // 如果白名单项不包含schema，则只匹配表名部分
             const tableNamePart = tableName.includes('.') ? tableName.split('.')[1] : tableName;
             return allowed === tableNamePart;
           });
  }
}

/**
 * 企业级 PostGIS Provider
 * 继承并扩展官方 PostGIS Provider
 */
class EnterprisePostgisProvider extends OfficialPostgisProvider {
  constructor(koop) {
    super(koop);
    // 用企业级Model替换基础Model
    this.Model = EnterprisePostgisModel;
    // 设置provider名称
    this.name = 'enterprise-postgis';
    // 设置provider类型
    this.type = 'provider';
    
    console.log('飞渡企业级PostGIS Provider已初始化');
  }
}

module.exports = EnterprisePostgisProvider;