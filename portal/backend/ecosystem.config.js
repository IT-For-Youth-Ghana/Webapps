/**
 * PM2 Configuration
 * Process management for production deployment
 */

module.exports = {
  apps: [
    {
      name: 'itfy-portal-api',
      script: 'src/server.js',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Production environment variables should be set via .env or environment
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Process management
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      // Health monitoring
      health_check: {
        enabled: true,
        url: 'http://localhost:5000/health',
        interval: 30000, // 30 seconds
        timeout: 5000,   // 5 seconds
        fails: 3,
      },
    },
    {
      name: 'itfy-portal-worker',
      script: 'src/queues/worker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Logging
      log_file: './logs/worker.log',
      out_file: './logs/worker-out.log',
      error_file: './logs/worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Process management
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 5,
      min_uptime: '10s',
    },
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/itfy-portal.git',
      path: '/var/www/itfy-portal',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};