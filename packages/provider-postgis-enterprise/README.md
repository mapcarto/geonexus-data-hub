# GeoNexus 企业级 PostGIS Provider

这个 Provider 是对官方 [@koopjs/provider-postgis](https://github.com/koopjs/provider-postgis) 的企业级增强封装，添加了安全白名单、审计日志和元数据增强等企业级功能。

## 特性

- **安全白名单**：限制只能查询预先配置的表，防止未授权访问
- **审计日志**：记录所有数据访问，包括查询的表、参数和用户信息
- **元数据增强**：为返回的 GeoJSON 添加额外的元数据，如提供者信息、时间戳和查询时间
- **完全兼容**：保持与官方 Provider 的完全兼容性，无缝替换

## 安装

```bash
npm install @koopjs/provider-postgis
npm install --save ../packages/provider-postgis-enterprise
```

## 配置

在 `config/default.json` 中添加以下配置：

```json
{
  "provider-postgis-enterprise": {
    "allowedTables": [
      "public.business_features",
      "public.buildings",
      "public.pois"
    ],
    "defaultTable": "public.business_features",
    "geometryField": "geom",
    "idField": "id",
    "maxRecords": 10000,
    "logLevel": "info",
    "enableAudit": true,
    "auditTable": "public.data_access_logs"
  }
}
```

### 配置选项

| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| allowedTables | Array | 允许查询的表白名单 | [] |
| defaultTable | String | 默认表名 | "public.features" |
| geometryField | String | 几何字段名 | "geom" |
| idField | String | ID字段名 | "id" |
| maxRecords | Number | 最大返回记录数 | 10000 |
| logLevel | String | 日志级别 (debug, info, warn, error) | "info" |
| enableAudit | Boolean | 是否启用审计日志 | false |
| auditTable | String | 审计日志表名 | "public.data_access_logs" |

## 审计日志表结构

如果启用了审计日志功能，需要创建以下表结构：

```sql
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  query_params JSONB,
  user_id TEXT,
  user_ip TEXT,
  access_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ON public.data_access_logs (table_name);
CREATE INDEX ON public.data_access_logs (user_id);
CREATE INDEX ON public.data_access_logs (access_time);
```

## 使用方法

### 在 Koop 应用中注册

```javascript
// 在 plugins.js 中
const providers = [
  {
    instance: require('provider-postgis-enterprise'),
    options: {}
  }
];
```

### API 访问

```
http://localhost:8080/provider-postgis-enterprise/public.buildings/FeatureServer/0/query
```

## 安全性说明

本 Provider 通过白名单机制限制可查询的表，防止未授权访问。如果请求的表不在白名单中，将返回 403 Forbidden 错误。

## 与官方 Provider 的区别

| 功能 | 官方 Provider | 企业级 Provider |
|------|--------------|----------------|
| 基本查询 | ✅ | ✅ |
| 表白名单 | ❌ | ✅ |
| 审计日志 | ❌ | ✅ |
| 元数据增强 | ❌ | ✅ |
| 详细日志 | ❌ | ✅ |

## 开发

### 测试

```bash
npm test
```

### 贡献

欢迎提交 Pull Request 和 Issue。

## 许可证

ISC