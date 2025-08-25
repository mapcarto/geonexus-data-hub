# 使用Alpine作为基础镜像（轻量级Linux发行版）
FROM alpine:3.14

# 安装Node.js和npm
RUN apk add --no-cache nodejs npm

# 设置工作目录
WORKDIR /usr/src/app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install

# 复制项目代码
COPY . .

# 暴露服务端口
EXPOSE 8080

# 启动服务的命令
CMD [ "npm", "start" ]
