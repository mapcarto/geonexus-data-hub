// GeoNexus数据中台 - 插件注册

// 导入 Provider
const geonexusDTSProvider = require('provider-dts');
const enterprisePostgisProvider = require('provider-postgis-enterprise');

// 导出 Provider 列表
const providers = [
  {
    instance: geonexusDTSProvider,
    options: {}
  },
  {
    // 企业级 PostGIS Provider
    instance: enterprisePostgisProvider,
    options: {}
  }
];

// 导出 Output 列表
const outputs = [];

// 导出 Auth 列表
const auths = [];

// 导出所有插件
module.exports = {
  providers,
  outputs,
  auths
};