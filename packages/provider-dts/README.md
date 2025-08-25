# GeoNexus DTS数据提供者 (provider-dts)

这是一个 Koop Provider，用于连接数字孪生系统(DTS)数据源，并将其转换为标准的地理空间数据服务。

## 核心功能

- 通过标准化的后端 RESTful API 连接数字孪生系统
- 将DTS数据实时转换为标准GeoJSON格式
- 支持空间查询（bbox）和属性查询（where）
- 提供符合Esri GeoServices规范的数据服务

## 安装

```bash
npm install @koopjs/provider-postgis
npm install --save ../packages/provider-dts
```

## 配置

在 `config/default.json` 中添加以下配置：

```json
{
  "provider-dts": {
    "apiUrl": "https://api.geonexus.com/dts",
    "apiKey": "${DTS_API_KEY}",
    "defaultSceneId": "default",
    "timeout": 30000,
    "maxRecords": 5000,
    "logLevel": "info"
  }
}
```

### 配置选项

| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| apiUrl | String | GeoNexus DTS API的基础URL | https://api.geonexus.com/dts |
| apiKey | String | 用于认证的API密钥 | 从环境变量GEONEXUS_DTS_API_KEY获取 |
| defaultSceneId | String | 默认场景ID | default |
| timeout | Number | API请求超时时间（毫秒） | 30000 |
| maxRecords | Number | 最大返回记录数 | 5000 |
| logLevel | String | 日志级别 (debug, info, warn, error) | info |

## 使用方法

### 在 Koop 应用中注册

```javascript
// 在 plugins.js 中
const providers = [
  {
    instance: require('provider-dts'),
    options: {}
  }
];
```

### API 访问

```
http://localhost:8080/provider-dts/buildings/FeatureServer/0/query?bbox=116.3,39.8,116.5,40.0&where=status='active'
```

## API 参数

| 参数 | 类型 | 描述 | 示例 |
|------|------|------|------|
| bbox | String | 空间范围过滤，格式为 minX,minY,maxX,maxY | 116.3,39.8,116.5,40.0 |
| where | String | 属性条件过滤，格式为 SQL WHERE 子句 | status='active' |
| limit | Number | 限制返回记录数 | 100 |
| offset | Number | 用于分页的偏移量 | 10 |
| outFields | String | 要返回的字段列表，逗号分隔 | name,status,height |

## 后端 API 规约

该 Provider 需要连接到一个符合以下规约的后端 API：

### 核心查询端点

- **URL**: GET /scenes/{sceneId}/features
- **功能**: 根据空间和属性条件，查询指定场景中的要素

### 查询参数

- bbox (字符串): 空间范围过滤，格式为 minX,minY,maxX,maxY
- where (字符串): 属性条件过滤，格式为 SQL WHERE 子句
- limit (整数): 限制返回记录数
- offset (整数): 用于分页

### 成功响应

- **状态码**: 200 OK
- **内容格式**: application/json
- **响应体**:

```json
{
  "featureCount": 123,
  "features": [
    { "id": "...", "geometry": { ... }, "properties": { ... } },
    ...
  ]
}
```

### 认证

API 通过标准的 Authorization: Bearer <API_KEY> HTTP Header 进行认证。

## 开发

### 测试

```bash
npm test
```

### 模拟数据

在开发环境中，如果未配置API密钥，Provider会自动使用模拟数据。这对于开发和测试非常有用。

## 技术说明

本 Provider 采用"后端原生 API"的方案，而非"基于前端 JS SDK"的方案，这确保了：

1. **最低的延迟**：直接服务器对服务器通信，无中间层
2. **最高的性能**：无需在服务器端模拟浏览器环境
3. **最稳定的架构**：符合现代微服务集成的最佳实践

## 许可证

ISC