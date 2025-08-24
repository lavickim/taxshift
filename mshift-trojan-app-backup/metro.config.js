const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// 🎯 와처 문제 해결: 최소한의 감시만
config.watcher = {
  healthCheck: {
    enabled: false,
  },
};

module.exports = config;