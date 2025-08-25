const Koop = require('@koopjs/koop-core');
const koop = new Koop();

// 注册输出插件
koop.register(require('@koopjs/output-geoservices'));

// 启动服务器
const port = process.env.PORT || 8080;
koop.server.listen(port, () => {
  console.log(`GeoNexus数据中台已启动，监听端口: ${port}`);
});