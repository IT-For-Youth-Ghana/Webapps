# Backend Deployment Guide

This guide covers deploying the ITFY Portal backend to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [PM2 Deployment](#pm2-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Security Checklist](#security-checklist)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ or MySQL 8+
- Redis (optional, recommended for production)
- SSL certificate for HTTPS
- Domain name with DNS configuration

## Environment Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure for production:

```bash
cp .env.example .env
```

**Critical Production Settings:**

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret-32-chars-min>
DB_PASSWORD=<secure-database-password>
REDIS_ENABLED=true
FRONTEND_URL=https://yourdomain.com
PAYSTACK_CALLBACK_URL=https://yourdomain.com/dashboard/payments/verify
LOG_LEVEL=warn
BCRYPT_ROUNDS=12
```

### 2. Database Setup

Create production database:

```sql
CREATE DATABASE itfy_portal;
CREATE USER itfy_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE itfy_portal TO itfy_user;
```

### 3. SSL Certificate

Obtain SSL certificate (Let's Encrypt recommended):

```bash
# Using certbot
sudo certbot certonly --standalone -d yourdomain.com
```

## Docker Deployment

### Local Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production Docker Deployment

```bash
# Build production image
docker build -t itfy-portal-backend:latest .

# Run with environment variables
docker run -d \
  --name itfy-portal-api \
  --env-file .env \
  -p 5000:5000 \
  --restart unless-stopped \
  itfy-portal-backend:latest
```

## PM2 Deployment

### Installation

```bash
npm install -g pm2
```

### Process Management

```bash
# Start application
npm run pm2:start

# View status
pm2 status

# View logs
npm run pm2:logs

# Monitor resources
npm run pm2:monit

# Restart application
npm run pm2:restart

# Stop application
npm run pm2:stop
```

### PM2 Configuration

The `ecosystem.config.js` file contains production-ready configuration with:
- Cluster mode for multi-core utilization
- Automatic restarts on crashes
- Memory limits and health checks
- Log rotation

## Cloud Deployment

### AWS EC2

1. **Launch EC2 instance:**
   ```bash
   # Ubuntu 20.04 LTS, t3.medium or larger
   ```

2. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql redis-server nginx
   ```

3. **Configure Nginx (reverse proxy):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       location /api-docs {
           proxy_pass http://localhost:5000/api-docs;
       }
   }
   ```

4. **SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Heroku

1. **Create Heroku app:**
   ```bash
   heroku create itfy-portal-backend
   ```

2. **Add buildpacks:**
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-apt
   ```

3. **Configure environment:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... other environment variables
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

## Monitoring & Maintenance

### Health Checks

The application provides several health endpoints:

```bash
# Basic health check
curl https://yourdomain.com/health

# Detailed health with integrations
curl https://yourdomain.com/health/detailed

# Integration status only
curl https://yourdomain.com/health/integrations
```

### Log Management

```bash
# View recent logs
npm run pm2:logs

# Log rotation (configure in ecosystem.config.js)
# Logs are automatically rotated daily
```

### Database Maintenance

```bash
# Backup database
pg_dump itfy_portal > backup_$(date +%Y%m%d_%H%M%S).sql

# Monitor connections
SELECT count(*) FROM pg_stat_activity;
```

### Performance Monitoring

```bash
# PM2 monitoring
npm run pm2:monit

# Application metrics (implement custom endpoint)
curl https://yourdomain.com/metrics
```

## Security Checklist

### Pre-Deployment

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Secure database credentials
- [ ] HTTPS enabled with valid SSL certificate
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers configured (Helmet)
- [ ] Input validation enabled
- [ ] SQL injection protection (Sequelize ORM)
- [ ] XSS protection enabled

### Runtime Security

- [ ] Regular security updates for dependencies
- [ ] Monitor for security vulnerabilities (`npm audit`)
- [ ] Log security events
- [ ] Implement proper error handling (no sensitive data in errors)
- [ ] Use environment variables for secrets
- [ ] Implement proper session management
- [ ] Regular backup procedures
- [ ] Monitor failed login attempts

### Network Security

- [ ] Firewall configured (UFW, iptables)
- [ ] SSH access restricted (key-based only)
- [ ] Database accessible only from application
- [ ] Redis accessible only from application
- [ ] API endpoints protected with authentication
- [ ] Sensitive routes require proper authorization

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Database connection failed:**
   - Check database credentials
   - Verify database server is running
   - Check network connectivity

3. **Redis connection failed:**
   - Verify Redis is running
   - Check Redis configuration
   - Test connectivity: `redis-cli ping`

4. **Memory issues:**
   ```bash
   npm run pm2:monit
   # Increase server memory if needed
   ```

5. **SSL certificate issues:**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

### Performance Tuning

1. **Database optimization:**
   - Add proper indexes
   - Monitor slow queries
   - Configure connection pooling

2. **Caching strategy:**
   - Enable Redis caching
   - Cache frequently accessed data
   - Implement cache invalidation

3. **Load balancing:**
   - Use PM2 cluster mode
   - Implement reverse proxy (Nginx)
   - Consider horizontal scaling

## Backup & Recovery

### Automated Backups

```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/var/backups/itfy-portal"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump itfy_portal > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Recovery Procedure

1. Stop the application
2. Restore database from backup
3. Clear Redis cache if needed
4. Restart application
5. Verify functionality

## Support

For deployment issues, check:
1. Application logs: `npm run pm2:logs`
2. System logs: `journalctl -u itfy-portal`
3. Health endpoints: `/health/detailed`
4. PM2 status: `pm2 status`