# GeoNexus 数据中台 - 快速入门指南

## 欢迎！

欢迎使用GeoNexus数据中台！本指南将帮助您在几分钟内启动并体验这个强大的数据中台。当您完成本指南的步骤后，您将成功地在本地启动一个完整的数据服务生态系统，并通过我们的三维测试客户端，亲眼见证从数据库到三维地球的数据流动。

## 前提条件

在开始之前，请确保您的系统已安装以下软件：

- **Docker** (20.10.0+) 和 **Docker Compose** (2.0.0+) - 用于容器化部署整个框架
- **Git** (2.30.0+) - 用于克隆项目代码
- 至少 4GB 可用内存和 10GB 磁盘空间
- 现代网络浏览器（Chrome、Firefox、Edge 等最新版本）

## 启动步骤

### 1. 克隆代码仓库

```bash
git clone https://github.com/geonexus/geonexus-data-hub.git
cd geonexus-data-hub
```
（这一步将获取框架的所有源代码和配置文件，为后续启动做准备）

### 2. 配置环境变量

```bash
cp .env.example .env
```
（这一步创建了环境配置文件，您可以根据需要修改其中的参数，如数据库密码、端口映射等）

### 3. 启动所有服务

```bash
docker-compose up -d
```
（此命令将根据我们的蓝图，自动为您创建并启动包括数据库、服务和网关在内的所有容器，整个过程约需 1-2 分钟）

## ✅ 验证您的成果

启动完成后，您可以通过以下方式验证系统是否正常运行：

1. **检查网关状态**：
   访问 http://localhost/health
   预期结果：页面显示 "API Gateway is running"，表明网关服务正常运行。

2. **验证 GeoNexus 要素引擎**：
   访问 http://localhost/koop/provider-postgis-enterprise/public.business_features/FeatureServer/0/query?f=geojson
   预期结果：返回一段 GeoJSON 格式的数据，包含示例业务点位信息，这证明企业级 PostGIS Provider 已正常工作。

3. **体验三维测试客户端**：
   访问 http://localhost/test-client/
   预期结果：显示测试客户端首页，您可以选择"打开 3D 测试"进入三维地球界面。

4. **检查安全白名单功能**：
   访问 http://localhost/koop/provider-postgis-enterprise/public.unauthorized_table/FeatureServer/0/query?f=geojson
   预期结果：返回 403 错误，表明安全白名单功能正常工作，未授权的表无法访问。

## 常见任务示例

### 任务一：作为数据分析师，我想在三维地球上查看所有"活跃"状态的业务点位

1. 打开三维测试客户端：http://localhost/test-client/cesium.html
2. 在左侧控制面板中，从下拉菜单选择"GeoNexus 要素引擎 - 业务要素"
3. 在查询条件框中输入：`status='active'`
4. 点击"加载数据"按钮
5. 观察结果：三维地球上将显示所有状态为"活跃"的业务点位

### 任务二：作为系统管理员，我想查看数据访问审计日志，了解谁访问了哪些数据

```bash
docker exec -it geonexus_spatial_db psql -U postgres -d spatial_db -c "SELECT * FROM public.data_access_logs ORDER BY access_time DESC LIMIT 10;"
```
（此命令连接到空间数据库，并查询最近 10 条数据访问记录，包括访问的表名、查询参数、用户信息和访问时间）

### 任务三：作为开发者，我想了解 API 的详细参数和返回格式

1. 访问 GeoNexus 要素引擎的元数据端点：http://localhost/koop/provider-postgis-enterprise/public.business_features/FeatureServer/info
2. 查看返回的 JSON 数据，了解服务支持的参数和功能
3. 尝试使用不同的查询参数，如 `outFields=name,status&returnGeometry=true`

## 停止服务

当您完成测试后，可以使用以下命令停止所有服务：

```bash
docker-compose down
```
（此命令将停止并移除所有容器，但会保留数据卷，确保您的数据不会丢失）

## 下一步

恭喜！您已经成功启动并体验了GeoNexus数据中台的核心功能。接下来，您可以：

- 阅读 [用户指南](02_user_guide.md) 了解更多功能和使用方法
- 探索 [架构设计](architecture/01_overall_architecture.md) 深入理解系统原理
- 查看 [企业级 PostGIS Provider 详解](architecture/02_enterprise_postgis_provider.md) 了解安全增强功能
- 参考 [开发环境搭建指南](development/01_setup_guide.md) 准备进行二次开发

如果您在使用过程中遇到任何问题，请参阅 [常见问题 (FAQ)](03_faq.md) 或 [联系我们的支持团队](04_support.md)。

祝您使用愉快！