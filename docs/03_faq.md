# GeoNexus 数据中台 - 常见问题解答 (FAQ)

## 基础问题

### 什么是 GeoNexus 数据中台？

GeoNexus 数据中台是一个企业级空间数据服务平台，它能够将各种空间数据源（如 PostGIS 数据库）转换为标准的 GeoJSON 和 ArcGIS FeatureServer 格式，并提供三维可视化能力，同时集成了数字资产管理功能。

### 这个框架能解决什么问题？

- **数据孤岛问题**：统一访问不同来源的空间数据
- **安全性问题**：提供企业级的数据访问控制和审计
- **可视化问题**：支持二维和三维可视化，直观展示空间数据
- **集成问题**：将空间数据与媒体资产（图片、视频等）关联

### 系统的主要组件有哪些？

- **GeoNexus 要素引擎**：核心数据转换引擎
- **PostGIS Enterprise Provider**：连接 PostGIS 数据库的增强型适配器
- **三维可视化客户端**：基于 CesiumJS 的三维地球
- **二维可视化客户端**：基于 Leaflet 的二维地图
- **GeoNexus 资产服务**：管理和存储媒体资产
- **API 网关**：统一的访问入口和路由控制

## 安装与配置

### 如何安装 GeoNexus 数据中台？

1. 确保您的系统已安装 Docker 和 Docker Compose
2. 克隆项目仓库：`git clone https://github.com/mapcarto/geonexus-data-hub.git`
3. 进入项目目录：`cd geonexus-data-hub`
4. 复制环境配置文件：`cp .env.example .env`
5. 根据需要修改 `.env` 文件中的配置
6. 运行启动脚本：`./start.sh`

### 如何配置数据源？

1. 打开 `apps/feature-engine/config/default.json` 文件
2. 在 `provider-postgis-enterprise` 部分，修改以下配置：
   - `connection`：数据库连接字符串
   - `allowedTables`：允许访问的表白名单
   - `geometryField`：几何字段名称
3. 保存文件并重启服务：`docker-compose restart feature_engine`

### 如何添加新的数据表到白名单？

1. 打开 `apps/feature-engine/config/default.json` 文件
2. 在 `provider-postgis-enterprise.allowedTables` 数组中添加新的表名
3. 表名格式为 `schema.table`，例如 `public.buildings`
4. 保存文件并重启服务：`docker-compose restart feature_engine`

### 如何修改系统端口？

1. 打开 `docker-compose.yml` 文件
2. 修改相应服务的端口映射，例如：
   ```yaml
   gateway:
     ports:
       - "8080:80"  # 将外部端口从 80 改为 8080
   ```
3. 保存文件并重启服务：`docker-compose down && docker-compose up -d`

## 使用问题

### 如何访问三维可视化客户端？

打开浏览器，访问 `http://localhost/test-client/cesium.html`

### 如何访问二维可视化客户端？

打开浏览器，访问 `http://localhost/test-client/leaflet.html`

### 如何访问DPanel管理界面？

打开浏览器，访问 `http://localhost:9092`，使用默认用户名"admin"和您在.env文件中设置的DPANEL_PASSWORD密码登录。

### 如何查询特定的数据？

使用 ArcGIS FeatureServer 查询语法：

```
http://localhost/koop/provider-postgis-enterprise/public.business_features/FeatureServer/0/query?where=status='active'&outFields=*&f=geojson
```

参数说明：
- `where`：SQL WHERE 子句
- `outFields`：输出字段列表，`*` 表示所有字段
- `f`：输出格式，如 `geojson`、`json`

### 如何在三维地球上加载数据？

1. 打开三维可视化客户端
2. 从左侧面板的下拉菜单中选择数据源
3. 点击"加载数据"按钮
4. 数据将在三维地球上显示

### 如何查看要素的属性信息？

在三维地球或二维地图上，直接点击要素，系统将显示该要素的属性信息和关联媒体。

## 故障排除

### 三维地球显示空白

**可能原因**：
- CesiumJS 访问令牌无效
- 浏览器不支持 WebGL
- 网络连接问题

**解决方案**：
1. 检查浏览器控制台是否有错误信息
2. 确保浏览器支持 WebGL（可以访问 [WebGL Report](https://webglreport.com/) 检查）
3. 尝试使用其他浏览器（推荐 Chrome 或 Firefox 的最新版本）
4. 检查网络连接是否正常

### 数据加载失败

**可能原因**：
- 数据表不在白名单中
- 数据库连接问题
- 数据表不存在或没有几何字段

**解决方案**：
1. 检查数据表是否已添加到白名单
2. 检查数据库连接是否正常
3. 确认数据表存在且包含有效的几何字段
4. 查看要素引擎日志：`docker logs feature_engine`

### 服务启动失败

**可能原因**：
- 端口冲突
- 配置文件错误
- 依赖服务未启动

**解决方案**：
1. 检查端口是否被其他应用占用：`netstat -tuln | grep 80`
2. 检查配置文件格式是否正确
3. 确保所有依赖服务（如数据库）已启动
4. 查看 Docker 日志：`docker-compose logs`
5. 使用DPanel管理界面查看容器状态和日志

### DPanel管理界面无法访问

**可能原因**：
- DPanel服务未启动
- 端口冲突
- 网络配置问题

**解决方案**：
1. 检查DPanel容器是否运行：`docker ps | grep admin_ui`
2. 确认端口9092是否被占用：`netstat -tuln | grep 9092`
3. 重启DPanel服务：`docker-compose restart admin_ui`
4. 检查网络配置是否正确

### 审计日志不记录

**可能原因**：
- 审计功能未启用
- 审计表不存在
- 数据库权限问题

**解决方案**：
1. 确认配置文件中 `enableAudit` 设置为 `true`
2. 检查审计表是否已创建：`public.data_access_logs`
3. 确认数据库用户有写入审计表的权限
4. 查看要素引擎日志：`docker logs feature_engine`

## 性能优化

### 如何提高数据加载速度？

1. 确保数据表有适当的索引，特别是几何字段的空间索引
2. 减少返回的字段数量，只请求必要的字段
3. 添加筛选条件，减少返回的记录数
4. 考虑使用数据分页，每次只加载部分数据

### 如何优化三维地球的性能？

1. 减少同时加载的数据量
2. 使用适当的数据简化级别
3. 关闭不必要的地球特效（如大气层、云层）
4. 降低地形细节级别

### 系统支持的最大数据量是多少？

系统理论上可以处理任意大小的数据集，但实际性能取决于：
1. 服务器硬件配置
2. 数据库优化程度
3. 客户端设备性能
4. 网络带宽

对于大型数据集，建议实施以下策略：
1. 数据分页
2. 空间索引
3. 数据简化
4. 多级缓存

## 对象存储服务 (RustFS)

### 什么是RustFS？

RustFS是一个高性能、轻量级的对象存储服务，基于Rust语言开发，提供S3兼容的API接口，用于存储和检索任意数量的数据。在GeoNexus数据中台中，RustFS主要用于存储和管理媒体资产，如图片、视频等。

### RustFS与MinIO有什么区别？

- **性能**：RustFS基于Rust语言开发，通常比基于Go的MinIO具有更高的性能和更低的资源占用
- **轻量级**：RustFS设计更加轻量，启动更快，占用资源更少
- **兼容性**：两者都提供S3兼容的API接口，但RustFS专注于核心功能，更适合轻量级部署

### 如何访问RustFS存储的文件？

RustFS提供S3兼容的API接口，您可以通过以下方式访问存储的文件：

1. 使用S3客户端工具，如AWS CLI、s3cmd等
2. 通过资产服务(Directus)的媒体管理界面
3. 使用S3兼容的SDK进行编程访问

### 如何配置RustFS？

RustFS的配置文件位于项目根目录的`rustfs-config.toml`，主要配置项包括：

```toml
[server]
host = "0.0.0.0"
port = 8000

[s3]
enabled = true
access_key = "rustfs"
secret_key = "rustfs_secret"

[storage]
root = "/data"
buckets = ["geonexus-assets"]
```

您可以根据需要修改这些配置项，然后重启object_storage服务使配置生效。

## 高级功能

### 如何扩展系统支持新的数据源？

1. 创建一个新的 Provider 包，继承自 Koop Provider 基类
2. 实现必要的方法，如 `getData`、`getInfo` 等
3. 在 `apps/feature-engine/src/plugins.js` 中注册新的 Provider
4. 重启要素引擎服务

### 如何自定义数据转换逻辑？

1. 在 Provider 的 `getData` 方法中，添加自定义的数据处理逻辑
2. 例如，可以添加字段计算、几何转换、数据过滤等操作
3. 返回处理后的 GeoJSON 数据

### 如何实现用户认证和授权？

1. 在 API 网关层添加认证中间件
2. 实现基于 JWT 的认证机制
3. 在 Provider 中添加用户权限检查
4. 根据用户角色动态调整白名单和数据过滤

### 如何监控系统性能？

1. 使用DPanel内置的监控功能查看系统资源使用情况
2. 在DPanel控制面板中查看容器的CPU、内存和网络使用情况
3. 使用DPanel的日志查看功能实时监控服务日志
4. 对于更高级的监控需求，可以：
   - 使用 Prometheus 收集系统指标
   - 使用 Grafana 创建监控仪表板
   - 监控关键指标：
     - API 响应时间
     - 数据库查询性能
     - 内存和 CPU 使用率
     - 错误率和异常

### 如何使用DPanel管理容器？

1. 登录DPanel管理界面：`http://localhost:9092`
2. 在控制面板中，您可以：
   - 查看所有容器的状态和资源使用情况
   - 启动、停止、重启容器
   - 查看容器日志
   - 进入容器终端执行命令
   - 监控容器的资源使用情况

## 联系与支持

如需技术支持或有任何问题，请参阅 [支持信息](SUPPORT.md) 或联系我们的技术支持团队。

---

*如果您的问题未在此 FAQ 中列出，请联系我们的技术支持团队。*

*最后更新：2025 年 8 月 25 日*
