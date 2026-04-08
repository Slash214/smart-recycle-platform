module.exports = {
  apps: [
    {
      name: 'apis',       // 应用名称
      script: 'bin/www',   // 启动脚本
      instances: 'max',     // 启动实例数量，使用 'max' 表示根据CPU核心数启动相应数量的实例
      exec_mode: 'cluster', // 使用 cluster 模式
      watch: true,  
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ]
};
