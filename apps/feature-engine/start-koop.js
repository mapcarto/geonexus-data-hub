// 简单的Koop服务启动脚本
const Koop = require('@koopjs/koop-core');
const koop = new Koop();

// 注册输出插件
koop.register(require('@koopjs/output-geoservices'));

// 创建一个简单的路由，用于测试服务是否正常运行
koop.server.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'GeoNexus数据中台已启动',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const port = process.env.PORT || 7071;
koop.server.listen(port, () => {
  console.log(`GeoNexus数据中台已启动，监听端口: ${port}`);
});