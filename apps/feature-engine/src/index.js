const config = require('config')
const Koop = require('@koopjs/koop-core')
const plugins = require('./plugins')

// 初始化Koop应用
const koop = new Koop()

// 注册Koop插件
plugins.forEach((plugin) => {
  koop.register(plugin.instance, plugin.options)
})

// 启动服务器
const port = config.port || 7071
koop.server.listen(port, () => {
  console.log(`GeoNexus数据中台已启动，监听端口: ${port}`)
})