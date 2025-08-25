# GeoNexus 要素引擎 PostGIS Provider 架构设计

## 1. 概述

企业级 PostGIS Provider 是 GeoNexus Data Hub中的核心组件之一，它基于官方的 [@koopjs/provider-postgis](https://github.com/koopjs/provider-postgis) 进行扩展，添加了企业级功能，如安全白名单、审计日志和元数据增强。

## 2. 设计理念

我们的设计理念是"站在巨人的肩膀上"，充分利用社区成熟的解决方案，而不是重新发明轮子。通过继承和扩展官方 Provider，我们可以：

1. **减少维护成本**：官方 Provider 的核心功能由社区维护，我们只需关注企业级增强功能
2. **保持兼容性**：确保与 Koop 生态系统的完全兼容性
3. **快速迭代**：当官方 Provider 更新时，我们可以轻松集成新功能

## 3. 架构图

```
┌─────────────────────────────────┐
│    GeoNexus 要素引擎服务器      │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│    企业级 PostGIS Provider      │
│                                 │
│  ┌─────────────────────────┐    │
│  │  安全白名单             │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  审计日志               │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  元数据增强             │    │
│  └─────────────────────────┘    │
│                                 │
└───────────────┬─────────────────┘
                │ 继承
                ▼
┌─────────────────────────────────┐
│    官方 PostGIS Provider        │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│         PostGIS 数据库          │
└─────────────────────────────────┘
```

## 4. 核心组件

### 4.1 EnterprisePostgisProvider 类

这是 Provider 的主类，继承自官方的 PostgisProvider 类。它的主要职责是：

- 初始化 Provider
- 替换默认的 Model 为企业级 Model
- 设置 Provider 名称和类型

```javascript
class EnterprisePostgisProvider extends OfficialPostgisProvider {
  constructor(koop) {
    super(koop);
    this.Model = EnterprisePostgisModel;
    this.name = 'provider-postgis-enterprise';
    this.type = 'provider';
  }
}
```

### 4.2 EnterprisePostgisModel 类

这是 Provider 的核心模型类，继承自官方的 PostgisProvider.Model 类。它实现了以下企业级功能：

#### 4.2.1 安全白名单

通过 `isTableAllowed` 方法，检查请求的表是否在预先配置的白名单中。如果不在白名单中，则拒绝访问。

```javascript
isTableAllowed(tableName) {
  if (!this.allowedTables || this.allowedTables.length === 0) {
    console.warn('[安全警告] PostGIS表白名单为空，允许访问所有表！');
    return true;
  }
  
  return this.allowedTables.includes(tableName) || 
         this.allowedTables.some(allowed => {
           if (allowed.includes('.')) {
             return allowed === tableName;
           }
           const tableNamePart = tableName.includes('.') ? tableName.split('.')[1] : tableName;
           return allowed === tableNamePart;
         });
}
```

#### 4.2.2 审计日志

通过 `logAudit` 方法，记录所有数据访问，包括查询的表、参数和用户信息。

```javascript
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
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('记录审计日志失败:', error);
  }
}
```

#### 4.2.3 元数据增强

在 `getData` 方法中，为返回的 GeoJSON 添加额外的元数据，如提供者信息、时间戳和查询时间。

```javascript
async getData(req) {
  const startTime = Date.now();
  
  // ... 其他代码 ...
  
  const geojson = await super.getData(req);
  
  geojson.metadata = geojson.metadata || {};
  geojson.metadata.provider = 'GeoNexus 要素引擎 PostGIS数据服务';
  geojson.metadata.timestamp = new Date().toISOString();
  geojson.metadata.queryTime = `${Date.now() - startTime}ms`;
  geojson.metadata.securityLevel = '企业级';
  
  return geojson;
}
```

## 5. 配置管理

Provider 使用 [config](https://www.npmjs.com/package/config) 模块管理配置，支持多环境配置和环境变量覆盖。主要配置项包括：

- **allowedTables**: 允许查询的表白名单
- **enableAudit**: 是否启用审计日志
- **auditTable**: 审计日志表名
- **logLevel**: 日志级别

## 6. 错误处理

Provider 实现了全面的错误处理机制，包括：

- 表白名单验证失败时，返回 403 Forbidden 错误
- 审计日志记录失败时，记录错误但不影响主要功能
- 数据库查询错误时，记录详细错误信息并向上抛出

## 7. 性能考虑

- **连接池复用**：继承官方 Provider 的连接池管理，避免频繁创建和销毁连接
- **审计日志异步处理**：审计日志记录不阻塞主要数据流
- **查询时间监控**：记录每次查询的执行时间，便于性能分析

## 8. 安全考虑

- **表白名单**：防止未授权访问数据库表
- **审计日志**：记录所有数据访问，便于安全审计
- **参数化查询**：使用参数化查询防止 SQL 注入

## 9. 未来扩展

- **行级安全**：基于用户角色限制数据访问
- **数据脱敏**：对敏感数据进行脱敏处理
- **缓存机制**：添加查询缓存，提高性能
- **限流机制**：防止过度查询，保护数据库

## 10. 结论

GeoNexus 要素引擎的企业级 PostGIS Provider 通过继承和扩展官方 Provider，实现了企业级的安全性、可审计性和可观测性，同时保持了与 Koop 生态系统的完全兼容性。这种"站在巨人的肩膀上"的设计理念，使我们能够快速构建高质量的企业级数据服务组件。
