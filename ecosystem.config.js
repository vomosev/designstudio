module.exports = {
  apps: [
    {
      name: 'designstudio',
      script: 'server/index.js',
      cwd: '/home/arx-app/backends/designstudio',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      watch: false,
      max_memory_restart: '400M',
      out_file: 'logs/api.log',
      error_file: 'logs/api-error.log',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 4112
      }
    }
  ]
};