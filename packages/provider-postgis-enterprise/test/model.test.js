const chai = require('chai');
const expect = chai.expect;
const EnterprisePostgisProvider = require('../index');

describe('企业级 PostGIS Provider', function() {
  let provider;
  let model;
  
  // 模拟 Koop 实例
  const mockKoop = {
    log: {
      info: console.log,
      debug: console.log,
      error: console.error
    }
  };
  
  beforeEach(function() {
    // 创建 provider 实例
    provider = new EnterprisePostgisProvider(mockKoop);
    model = new provider.Model();
    
    // 模拟配置
    model.enterpriseConfig = {
      allowedTables: ['public.test_table', 'public.buildings'],
      enableAudit: true,
      auditTable: 'public.data_access_logs',
      logLevel: 'info'
    };
    
    // 设置白名单
    model.allowedTables = ['public.test_table', 'public.buildings'];
    
    // 模拟 pool.connect
    model.pool = {
      connect: () => {
        return Promise.resolve({
          query: () => Promise.resolve({ rows: [] }),
          release: () => {}
        });
      }
    };
  });
  
  describe('isTableAllowed', function() {
    it('应该允许白名单中的表', function() {
      expect(model.isTableAllowed('public.test_table')).to.be.true;
      expect(model.isTableAllowed('public.buildings')).to.be.true;
    });
    
    it('应该拒绝不在白名单中的表', function() {
      expect(model.isTableAllowed('public.unauthorized_table')).to.be.false;
      expect(model.isTableAllowed('secret.data')).to.be.false;
    });
    
    it('应该支持不同格式的表名', function() {
      // 假设白名单中有 'buildings'
      model.allowedTables = ['buildings', 'public.test_table'];
      
      // 应该匹配简单表名
      expect(model.isTableAllowed('buildings')).to.be.true;
      
      // 应该匹配带schema的表名
      expect(model.isTableAllowed('public.buildings')).to.be.true;
    });
    
    it('当白名单为空时应发出警告并允许所有表', function() {
      // 保存原始的console.warn
      const originalWarn = console.warn;
      let warningCalled = false;
      
      // 模拟console.warn
      console.warn = () => {
        warningCalled = true;
      };
      
      try {
        // 设置空白名单
        model.allowedTables = [];
        
        // 应该允许任何表
        expect(model.isTableAllowed('any.table')).to.be.true;
        expect(warningCalled).to.be.true;
      } finally {
        // 恢复原始的console.warn
        console.warn = originalWarn;
      }
    });
  });
  
  describe('logAudit', function() {
    it('应该能记录审计日志', async function() {
      let queryExecuted = false;
      
      // 模拟数据库连接
      model.pool = {
        connect: () => {
          return Promise.resolve({
            query: (sql, params) => {
              queryExecuted = true;
              expect(sql).to.include('INSERT INTO');
              expect(sql).to.include('public.data_access_logs');
              expect(params.length).to.equal(4);
              expect(params[0]).to.equal('public.test_table');
              return Promise.resolve();
            },
            release: () => {}
          });
        }
      };
      
      await model.logAudit('public.test_table', { where: '1=1' }, { id: 'test_user', ip: '127.0.0.1' });
      expect(queryExecuted).to.be.true;
    });
    
    it('当审计日志禁用时不应记录', async function() {
      let queryExecuted = false;
      
      // 禁用审计日志
      model.enableAudit = false;
      
      // 模拟数据库连接
      model.pool = {
        connect: () => {
          return Promise.resolve({
            query: () => {
              queryExecuted = true;
              return Promise.resolve();
            },
            release: () => {}
          });
        }
      };
      
      await model.logAudit('public.test_table', { where: '1=1' });
      expect(queryExecuted).to.be.false;
    });
  });
  
  describe('getData', function() {
    it('应该拒绝访问不在白名单中的表', async function() {
      // 创建请求对象
      const req = {
        params: {
          id: 'public.unauthorized_table'
        },
        query: {}
      };
      
      try {
        await model.getData(req);
        // 如果没有抛出错误，测试应该失败
        expect.fail('应该抛出错误');
      } catch (error) {
        expect(error.message).to.include('安全限制');
        expect(error.statusCode).to.equal(403);
      }
    });
    
    it('应该增强返回的GeoJSON元数据', async function() {
      // 创建请求对象
      const req = {
        params: {
          id: 'public.test_table'
        },
        query: {}
      };
      
      // 模拟父类的getData方法
      model.constructor.prototype.getData = async () => {
        return {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} }
          ]
        };
      };
      
      const result = await model.getData(req);
      
      expect(result.type).to.equal('FeatureCollection');
      expect(result.metadata).to.exist;
      expect(result.metadata.provider).to.equal('GeoNexus 要素引擎 PostGIS数据服务');
      expect(result.metadata.timestamp).to.exist;
      expect(result.metadata.queryTime).to.exist;
      expect(result.metadata.securityLevel).to.equal('企业级');
    });
  });
});