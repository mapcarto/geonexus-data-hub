#!/bin/bash

# GeoNexus 数据中台启动脚本

echo "===== GeoNexus 数据中台启动脚本 ====="
echo "正在启动所有服务..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未找到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未找到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

# 启动所有服务
docker-compose up -d

# 检查服务是否成功启动
echo "正在检查服务状态..."
sleep 5

# 检查容器状态
CONTAINERS=("geonexus_gateway" "geonexus_feature_engine" "geonexus_spatial_db" "geonexus_asset_db" "geonexus_asset_service" "geonexus_minio")
ALL_RUNNING=true

for CONTAINER in "${CONTAINERS[@]}"; do
    STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER 2>/dev/null)
    
    if [ "$STATUS" != "running" ]; then
        echo "警告: $CONTAINER 未正常运行，状态: $STATUS"
        ALL_RUNNING=false
    else
        echo "$CONTAINER: 运行中"
    fi
done

# 显示访问信息
if [ "$ALL_RUNNING" = true ]; then
    echo ""
    echo "===== 所有服务已成功启动 ====="
    echo ""
    echo "您可以通过以下地址访问服务:"
    echo "- 测试客户端: http://localhost:8080/test-client/"
    echo "- 2D 地图测试: http://localhost:8080/test-client/leaflet.html"
    echo "- 3D 地球测试: http://localhost:8080/test-client/cesium.html"
    echo "- API 健康检查: http://localhost:8080/health"
    echo ""
    echo "GeoNexus 要素引擎 PostGIS Provider 示例请求:"
    echo "http://localhost:8080/koop/provider-postgis-enterprise/public.business_features/FeatureServer/0/query?f=geojson"
    echo ""
    echo "GeoNexus 资产服务:"
    echo "http://localhost:6062"
    echo ""
    echo "如需停止所有服务，请运行: docker-compose down"
else
    echo ""
    echo "===== 警告: 部分服务未能正常启动 ====="
    echo "请检查 Docker 日志获取更多信息:"
    echo "docker-compose logs"
fi