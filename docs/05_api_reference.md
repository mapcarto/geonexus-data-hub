# GeoNexus 数据中台 API 参考文档

本文档详细说明了GeoNexus数据中台提供的所有 API 端点，包括请求参数、响应格式和示例。

## 目录

1. [通用信息](#通用信息)
2. [健康检查 API](#健康检查-api)
3. [企业级 PostGIS Provider API](#企业级-postgis-provider-api)
4. [GeoNexus DTS Provider API](#geonexus-dts-provider-api)
5. [GeoNexus 资产服务 API](#geonexus-资产服务-api)

## 通用信息

### 基础 URL

所有 API 都基于以下基础 URL：

```
http://localhost/
```

### 认证

某些 API 端点可能需要认证。认证方式取决于具体的服务：

- **企业级 PostGIS Provider**：不需要认证，但有表白名单限制
- **GeoNexus DTS Provider**：需要 API 密钥，通过环境变量 `DTS_API_KEY` 配置
- **GeoNexus 资产服务**：需要用户名和密码认证

### 响应格式

除非特别说明，所有 API 响应都使用 JSON 格式。GeoJSON 是一种特殊的 JSON 格式，用于表示地理空间数据。

### 错误处理

API 错误使用标准的 HTTP 状态码，并在响应体中提供详细的错误信息：

```json
{
  "error": "错误描述",
  "status": 400,
  "details": "更多详细信息"
}
```

## 健康检查 API

### 获取系统健康状态

检查整个系统的健康状态。

**请求**

```
GET /health
```

**响应**

```json
{
  "status": "healthy",
  "services": {
    "api": "running",
    "database": "connected"
  },
  "timestamp": "2025-08-24T01:00:00.000Z"
}
```

## 企业级 PostGIS Provider API

企业级 PostGIS Provider 提供了对 PostgreSQL/PostGIS 数据库中空间数据的访问，并添加了企业级功能，如安全白名单和审计日志。

### 查询要素

查询指定表中的要素，支持空间和属性过滤。

**请求**

```
GET /provider-postgis-enterprise/{tableName}/FeatureServer/0/query
```

**路径参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| tableName | 要查询的表名，格式为 schema.table | public.buildings |

**查询参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| f | 响应格式 | geojson, json, html |
| where | 属性过滤条件 | status='active' |
| geometry | 空间过滤几何 | {"xmin":116.3,"ymin":39.8,"xmax":116.5,"ymax":40.0} |
| geometryType | 几何类型 | esriGeometryEnvelope |
| spatialRel | 空间关系 | esriSpatialRelIntersects |
| outFields | 返回的字段 | name,height,status |
| returnGeometry | 是否返回几何 | true, false |
| orderByFields | 排序字段 | name ASC, height DESC |
| resultOffset | 结果偏移量 | 10 |
| resultRecordCount | 结果记录数 | 100 |

**响应**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [116.4, 39.9]
      },
      "properties": {
        "id": "1",
        "name": "企业级测试点1",
        "status": "active",
        "asset_ids": ["asset1", "asset2"]
      }
    }
  ],
  "metadata": {
    "provider": "GeoNexus 要素引擎 PostGIS数据服务",
    "timestamp": "2025-08-24T01:00:00.000Z",
    "queryTime": "10ms",
    "securityLevel": "企业级",
    "count": 1
  }
}
```

**示例**

```
GET /provider-postgis-enterprise/public.buildings/FeatureServer/0/query?f=geojson&where=status='active'&outFields=*
```

### 获取表元数据

获取指定表的元数据信息。

**请求**

```
GET /provider-postgis-enterprise/{tableName}/FeatureServer/0
```

**路径参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| tableName | 表名，格式为 schema.table | public.buildings |

**响应**

```json
{
  "currentVersion": 10.51,
  "id": 0,
  "name": "public.buildings",
  "type": "Feature Layer",
  "geometryType": "esriGeometryPolygon",
  "fields": [
    {
      "name": "id",
      "type": "esriFieldTypeOID",
      "alias": "id"
    },
    {
      "name": "name",
      "type": "esriFieldTypeString",
      "alias": "name"
    }
  ]
}
```

## GeoNexus DTS Provider API

GeoNexus DTS Provider 提供了对数字孪生系统(DTS)数据的访问，支持场景数据查询和过滤。

### 查询场景要素

查询指定场景中的要素，支持空间和属性过滤。

**请求**

```
GET /provider-dts/{sceneId}/FeatureServer/0/query
```

**路径参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| sceneId | 场景ID | buildings, pois |

**查询参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| f | 响应格式 | geojson, json, html |
| where | 属性过滤条件 | status='active' |
| bbox | 空间范围过滤 | 116.3,39.8,116.5,40.0 |
| outFields | 返回的字段 | name,height,status |
| limit | 限制返回记录数 | 100 |
| offset | 用于分页的偏移量 | 10 |

**响应**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "bldg-001",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[116.4, 39.9], [116.41, 39.9], [116.41, 39.91], [116.4, 39.91], [116.4, 39.9]]]
      },
      "properties": {
        "name": "GeoNexus总部大厦",
        "height": 120,
        "floors": 30,
        "status": "active",
        "asset_ids": ["asset1", "asset2"]
      }
    }
  ],
  "metadata": {
    "provider": "GeoNexus 要素引擎 DTS数据服务",
    "timestamp": "2025-08-24T01:00:00.000Z",
    "queryTime": "15ms",
    "sceneId": "buildings",
    "count": 1,
    "source": "GeoNexus DTS API"
  }
}
```

**示例**

```
GET /provider-dts/buildings/FeatureServer/0/query?f=geojson&bbox=116.3,39.8,116.5,40.0&where=status='active'
```

### 获取场景元数据

获取指定场景的元数据信息。

**请求**

```
GET /provider-dts/{sceneId}/FeatureServer/0
```

**路径参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| sceneId | 场景ID | buildings, pois |

**响应**

```json
{
  "currentVersion": 10.51,
  "id": 0,
  "name": "buildings",
  "type": "Feature Layer",
  "geometryType": "esriGeometryPolygon",
  "fields": [
    {
      "name": "id",
      "type": "esriFieldTypeOID",
      "alias": "id"
    },
    {
      "name": "name",
      "type": "esriFieldTypeString",
      "alias": "name"
    },
    {
      "name": "height",
      "type": "esriFieldTypeDouble",
      "alias": "height"
    }
  ]
}
```

## GeoNexus 资产服务 API

GeoNexus 资产服务提供了对媒体资产的管理和访问。

### 获取资产列表

获取资产列表，支持过滤和分页。

**请求**

```
GET /dam/items
```

**查询参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| filter | 过滤条件 | {"type":{"_eq":"image"}} |
| limit | 限制返回记录数 | 100 |
| offset | 用于分页的偏移量 | 10 |
| sort | 排序字段 | -date_created |
| fields | 返回的字段 | id,title,type,file |

**响应**

```json
{
  "data": [
    {
      "id": "asset1",
      "title": "建筑照片",
      "type": "image",
      "file": {
        "id": "file1",
        "storage": "rustfs",
        "filename_disk": "1a2b3c4d.jpg",
        "filename_download": "building_photo.jpg",
        "type": "image/jpeg",
        "filesize": 1024000
      }
    }
  ],
  "meta": {
    "filter_count": 1,
    "total_count": 10
  }
}
```

### 获取单个资产

获取单个资产的详细信息。

**请求**

```
GET /dam/items/{id}
```

**路径参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| id | 资产ID | asset1 |

**响应**

```json
{
  "data": {
    "id": "asset1",
    "title": "建筑照片",
    "type": "image",
      "description": "GeoNexus总部大厦的外观照片",
    "date_created": "2025-08-01T12:00:00Z",
    "user_created": "admin",
    "file": {
      "id": "file1",
      "storage": "rustfs",
      "filename_disk": "1a2b3c4d.jpg",
      "filename_download": "building_photo.jpg",
      "type": "image/jpeg",
      "filesize": 1024000,
      "width": 1920,
      "height": 1080
    }
  }
}
```

### 获取资产文件

获取资产的实际文件内容。

**请求**

```
GET /dam/assets/{id}
```

**路径参数**

| 参数 | 描述 | 示例 |
|------|------|------|
| id | 资产文件ID | file1 |

**响应**

返回实际的文件内容，Content-Type 根据文件类型而定。

## 完整 API 端点列表

以下是所有可用 API 端点的完整列表：

### 系统 API

- `GET /health` - 获取系统健康状态

### 企业级 PostGIS Provider API

- `GET /provider-postgis-enterprise/{tableName}/FeatureServer/0/query` - 查询要素
- `GET /provider-postgis-enterprise/{tableName}/FeatureServer/0` - 获取表元数据
- `GET /provider-postgis-enterprise/{tableName}/FeatureServer` - 获取服务信息

### GeoNexus DTS Provider API

- `GET /provider-dts/{sceneId}/FeatureServer/0/query` - 查询场景要素
- `GET /provider-dts/{sceneId}/FeatureServer/0` - 获取场景元数据
- `GET /provider-dts/{sceneId}/FeatureServer` - 获取服务信息

### GeoNexus 资产服务 API

- `GET /dam/items` - 获取资产列表
- `GET /dam/items/{id}` - 获取单个资产
- `GET /dam/assets/{id}` - 获取资产文件
- `POST /dam/items` - 创建新资产
- `PATCH /dam/items/{id}` - 更新资产
- `DELETE /dam/items/{id}` - 删除资产

## 测试客户端

GeoNexus 数据中台提供了两个测试客户端，用于可视化和测试 API：

- **2D 地图测试客户端**：`http://localhost/test-client/leaflet.html`
- **3D 地球测试客户端**：`http://localhost/test-client/cesium.html`

这些客户端提供了用户友好的界面，用于测试和演示 API 功能。