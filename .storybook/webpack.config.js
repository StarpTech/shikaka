const path = require('path');
module.exports = async ({ config, mode }) => {
  config.resolve.alias['@test/components'] = path.resolve(__dirname, '../dist')
  return config;
};