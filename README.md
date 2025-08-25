# GeoNexus 数据中台 (GeoNexus Data Hub)

**GeoNexus** - 您的地理空间数据中枢，连接世界，赋能决策。

GeoNexus 数据中台是一个强大的地理空间数据集成平台，作为企业级地理信息系统的核心枢纽，它无缝连接多种数据源，并通过标准化的 API 提供高性能、安全可靠的数据服务。GeoNexus 致力于打破数据孤岛，实现地理空间数据的统一管理和智能应用。

## 核心功能

- **多源数据连接**：连接 PostGIS、GeoNexus DTS 等多种数据源
- **标准化 API**：提供符合 Esri GeoServices 规范的 API
- **企业级安全**：表白名单、审计日志等企业级安全功能
- **数字资产管理**：集成的数字资产管理系统

## 快速开始

1. 克隆仓库：
   ```bash
   git clone https://github.com/mapcarto/geonexus-data-hub.git
   cd geonexus-data-hub
   ```

2. 配置环境变量：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，设置必要的环境变量
   ```

3. 启动服务：
   ```bash
   ./start.sh
   ```

4. 访问测试客户端：
   ```
   http://localhost:8080/test-client/
   ```

5. 访问管理界面：
   ```
   http://localhost:9092
   ```
   使用默认用户名"admin"和您在.env文件中设置的DPANEL_PASSWORD密码登录。

## 文档

- [快速入门](./docs/01_quick_start.md)
- [用户指南](./docs/02_user_guide.md)
- [API 参考](./docs/05_api_reference.md)
- [架构文档](./docs/architecture/01_overall_architecture.md)
- [常见问题](./docs/03_faq.md)

## API 端点

主要 API 端点：

- GeoNexus 要素引擎 PostGIS Provider: `/provider-postgis-enterprise/{tableName}/FeatureServer/0/query`
- GeoNexus 要素引擎 DTS Provider: `/provider-dts/{sceneId}/FeatureServer/0/query`
- 健康检查: `/health`

详细的 API 文档请参阅 [API 参考](./docs/05_api_reference.md)。

## 系统组件

### 测试客户端

- 2D 地图测试: `http://localhost:8080/test-client/leaflet.html`
- 3D 地球测试: `http://localhost:8080/test-client/cesium.html`

### 对象存储

GeoNexus 数据中台使用 RustFS 作为对象存储服务，用于存储和管理数字资产：

- 高性能：基于Rust语言开发，提供高效的文件存储和检索
- S3兼容：提供与Amazon S3兼容的API接口
- 轻量级：资源占用少，适合各种部署环境
- 安全可靠：内置访问控制和数据保护机制

### 管理界面

GeoNexus 数据中台集成了 DPanel 管理界面，提供以下功能：

- 服务状态监控：实时查看所有微服务的运行状态
- 容器管理：启动、停止、重启各个服务
- 日志查看：实时查看各服务的日志输出
- 系统资源监控：监控 CPU、内存使用情况
- 安全管理：用户权限控制和访问审计

访问地址：`http://localhost:9092`

## 许可证

Copyright © 2025 GeoNexus
