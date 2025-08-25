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
   git clone https://github.com/feidu-tech/geonexus-data-hub.git
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
   http://localhost/test-client/
   ```

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

## 测试客户端

- 2D 地图测试: `http://localhost/test-client/leaflet.html`
- 3D 地球测试: `http://localhost/test-client/cesium.html`

## 许可证

Copyright © 2025 GeoNexus
