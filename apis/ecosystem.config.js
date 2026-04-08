const path = require('path')

module.exports = {
  apps: [
    {
      name: 'sm-api',
      cwd: __dirname,
      script: path.join(__dirname, 'src/server.js'),
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
