const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block backend directory to prevent accidental imports
config.resolver.blockList = [
  /.*\/backend-api\/.*/,
  /.*\/\.\.\/node_modules\/.*/,
];

module.exports = config;