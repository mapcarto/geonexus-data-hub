#!/bin/bash

# 等待Directus服务启动
echo "等待Directus服务启动..."
sleep 15

# 使用管理员凭据登录获取token（使用外部端口6062）
echo "获取管理员访问token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:6062/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "mapcarto@gmail.com", "password": "zxcv1234"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo "设置Directus默认语言为中文..."
    curl -X PATCH http://localhost:6062/settings \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d '{"default_locale": "zh-CN"}' > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "✅ 默认语言已成功设置为中文"
    else
        echo "⚠️  设置默认语言失败，可能需要手动设置"
    fi
else
    echo "❌ 无法获取管理员token，响应: $LOGIN_RESPONSE"
fi
