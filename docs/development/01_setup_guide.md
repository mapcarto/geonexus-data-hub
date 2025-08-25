# 开发环境搭建指南

本文档将指导您如何搭建飞渡数据服务框架的开发环境，包括安装依赖、配置环境和启动服务。

## 前提条件

在开始之前，请确保您的系统已安装以下软件：

- **Docker**: 20.10.0 或更高版本
- **Docker Compose**: 1.29.0 或更高版本
- **Git**: 2.30.0 或更高版本
- **Node.js**: 14.x 或更高版本 (用于本地开发)
- **npm**: 6.x 或更高版本

## 克隆代码库

首先，克隆项目代码库到本地：

```bash
git clone https://github.com/feidu/data-framework.git
cd feidu-data-framework
```

## 配置环境变量

复制环境变量示例文件，并根据需要进行修改：

```bash
cp .env.example .env
```

主要的环境变量包括：

- `SPATIAL_DB_USER`: PostGIS 数据库用户名
- `SPATIAL_DB_PASSWORD`: PostGIS 数据库密码
- `SPATIAL_DB_NAME`: PostGIS 数据库名称
- `ASSET_DB_USER`: 资产数据库用户名
- `ASSET_DB_PASSWORD`: 资产数据库密码
- `ASSET_DB_NAME`: 资产数据库名称
- `MINIO_ROOT_USER`: MinIO 根用户名
- `MINIO_ROOT_PASSWORD`: MinIO 根用户密码

## 启动开发环境

使用 Docker Compose 启动所有服务：

```bash
docker-compose up -d
```

这将启动以下服务：

- **feidu_gateway**: Nginx API 网关
- **feidu_koop_server**: Koop 要素服务
- **feidu_spatial_db**: PostGIS 空间数据库
- **feidu_asset_db**: PostgreSQL 资产数据库
- **feidu_dam_service**: 数字资产管理服务 (DAM)
- **feidu_minio**: MinIO 对象存储

## 验证服务状态

检查所有服务是否正常运行：

```bash
docker-compose ps
```

所有服务的状态应该是 "Up"。

## 访问测试客户端

打开浏览器，访问测试客户端：

```
http://localhost/test-client/
```

您应该能看到测试客户端的主页，包含 2D 和 3D 测试选项。

## 本地开发

### 安装依赖

如果您需要在本地开发 Provider 或其他组件，请安装依赖：

```bash
# 安装 Koop 服务器依赖
cd apps/feidu-server
npm install

# 安装企业级 PostGIS Provider 依赖
cd ../../packages/enterprise-postgis-provider
npm install
```

### 开发 Provider

开发新的 Provider 或修改现有 Provider 时，可以遵循以下步骤：

1. 在 `packages/` 目录下创建新的 Provider 目录
2. 实现 Provider 的核心功能
3. 在 `apps/feidu-server/src/plugins.js` 中注册 Provider
4. 重启 Koop 服务器以应用更改

### 热重载

为了方便开发，您可以使用 nodemon 实现热重载：

```bash
# 安装 nodemon
npm install -g nodemon

# 使用 nodemon 启动 Koop 服务器
cd apps/feidu-server
nodemon start-koop.js
```

## 运行测试

运行单元测试：

```bash
# 运行企业级 PostGIS Provider 的测试
cd packages/enterprise-postgis-provider
npm test
```

## 常见问题

### 端口冲突

如果遇到端口冲突，可以修改 `docker-compose.yml` 文件中的端口映射：

```yaml
feidu_gateway:
  ports:
    - "8080:80"  # 将外部端口从 80 改为 8080
```

### 数据库连接问题

如果遇到数据库连接问题，请检查：

1. 环境变量是否正确配置
2. 数据库容器是否正常运行
3. 数据库初始化脚本是否正确执行

可以使用以下命令连接到数据库进行检查：

```bash
docker exec -it feidu_spatial_db psql -U postgres -d spatial_db
```

### 日志查看

查看服务日志：

```bash
# 查看 Koop 服务器日志
docker logs feidu_koop_server

# 查看 Nginx 网关日志
docker logs feidu_gateway
```

## 下一步

成功搭建开发环境后，您可以：

- 阅读 [架构设计文档](../architecture/01_overall_architecture.md) 了解系统架构
- 查看 [企业级 PostGIS Provider 详解](../architecture/02_enterprise_postgis_provider.md) 了解核心组件
- 参考 [贡献指南](02_contribution_guide.md) 了解如何贡献代码

如果您遇到任何问题，请参阅 [常见问题解答](../03_faq.md) 或联系技术支持团队。