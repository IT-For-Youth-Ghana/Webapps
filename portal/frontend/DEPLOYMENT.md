# Frontend Deployment Guide

This guide covers deploying the ITFY Portal frontend to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Analytics](#monitoring--analytics)
- [Performance Optimization](#performance-optimization)
- [Security Checklist](#security-checklist)

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
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
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://portal.itforyouthghana.org
NEXT_PUBLIC_API_URL=https://api.itforyouthghana.org
NEXT_PUBLIC_MOODLE_URL=https://lms.itforyouthghana.org
NEXT_PUBLIC_GA_TRACKING_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 2. Build Configuration

The application is configured for production with:
- Static optimization
- Image optimization
- Code splitting
- Compression
- Security headers

## Local Development

### Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build Locally

```bash
# Build for production
npm run build

# Start production server
npm run start

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## Docker Deployment

### Local Docker Development

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Or use Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

### Production Docker Deployment

```bash
# Build production image
docker build -t itfy-portal-frontend:latest .

# Run with environment variables
docker run -d \
  --name itfy-portal-frontend \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  itfy-portal-frontend:latest
```

### Docker Compose Production

```bash
# Start production stack
npm run docker:prod:up

# View logs
npm run docker:prod:logs

# Stop production stack
npm run docker:prod:down
```

## Cloud Deployment

### Vercel (Recommended for Next.js)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_GA_TRACKING_ID
   ```

### AWS Amplify

1. **Install AWS CLI and configure:**
   ```bash
   aws configure
   ```

2. **Deploy to Amplify:**
   ```bash
   amplify init
   amplify add hosting
   amplify publish
   ```

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### AWS EC2 with Docker

1. **Launch EC2 instance:**
   ```bash
   # Ubuntu 20.04 LTS, t3.medium or larger
   ```

2. **Install Docker:**
   ```bash
   sudo apt update
   sudo apt install -y docker.io nginx
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Deploy with Docker Compose:**
   ```bash
   # Copy files to server
   scp -r . ubuntu@your-server:/opt/itfy-portal/frontend

   # On server
   cd /opt/itfy-portal/frontend
   docker-compose --profile production up -d
   ```

4. **Configure Nginx (reverse proxy):**
   ```nginx
   server {
       listen 80;
       server_name portal.itforyouthghana.org;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # API proxy to backend
       location /api/ {
           proxy_pass https://api.itforyouthghana.org;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. **SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d portal.itforyouthghana.org
   ```

## CI/CD Pipeline

### GitHub Actions

The CI/CD pipeline includes:

1. **Code Quality:**
   - TypeScript type checking
   - ESLint linting
   - Security audit

2. **Testing:**
   - Unit tests with coverage
   - Integration tests

3. **Build & Deploy:**
   - Docker image build
   - Container testing
   - Deployment to staging/production

4. **Security & Performance:**
   - Vulnerability scanning
   - Lighthouse performance testing

### Manual Deployment

```bash
# Run deployment script
./scripts/deploy.sh --environment=production

# Or for remote deployment
./scripts/deploy.sh --remote --push-image
```

### Rollback

```bash
# Rollback to previous version
./scripts/deploy.sh --rollback
```

## Monitoring & Analytics

### Health Checks

The application provides health check endpoints:

```bash
# Basic health check
curl https://portal.itforyouthghana.org/api/health

# Detailed health check
curl -X POST https://portal.itforyouthghana.org/api/health \
  -H "Content-Type: application/json" \
  -d '{"detailed": true}'
```

### Analytics Integration

**Google Analytics 4:**
- Page views and user interactions
- Performance metrics (Core Web Vitals)
- Custom events and conversions

**Sentry Error Reporting:**
- JavaScript errors and exceptions
- Performance monitoring
- Release tracking

**Hotjar:**
- User behavior analytics
- Heatmaps and session recordings

### Performance Monitoring

**Web Vitals Tracking:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

**Custom Metrics:**
- API response times
- Bundle size monitoring
- Memory usage tracking

## Performance Optimization

### Build Optimizations

- **Code Splitting:** Automatic route-based splitting
- **Image Optimization:** Next.js Image component with WebP/AVIF
- **Font Optimization:** Self-hosted fonts with preloading
- **CSS Optimization:** Tailwind CSS purging and minification

### Runtime Optimizations

- **Service Worker:** Caching strategies for offline support
- **Lazy Loading:** Components and images loaded on demand
- **Compression:** Gzip/Brotli compression enabled
- **CDN:** Static assets served from CDN

### Performance Budget

```javascript
// next.config.mjs
experimental: {
  webVitalsAttribution: ['CLS', 'LCP'],
},
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# View bundle analyzer report
open .next/analyze/client.html
```

## Security Checklist

### Pre-Deployment

- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_NODE_ENV=production`
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Environment variables secured
- [ ] Debug mode disabled
- [ ] Source maps disabled in production
- [ ] API keys and secrets properly configured

### Runtime Security

- [ ] Content Security Policy (CSP) enabled
- [ ] XSS protection active
- [ ] CSRF protection implemented
- [ ] Input validation and sanitization
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies regularly updated
- [ ] Security headers verified

### Monitoring Security

- [ ] Error reporting configured (Sentry)
- [ ] Security events logged
- [ ] Regular security audits
- [ ] SSL certificate monitoring
- [ ] Failed login attempt monitoring

## Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear Next.js cache
   rm -rf .next

   # Clear npm cache
   npm cache clean --force

   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Memory Issues:**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

3. **Docker Issues:**
   ```bash
   # Check container logs
   docker logs itfy-portal-frontend

   # Restart container
   docker restart itfy-portal-frontend
   ```

4. **Performance Issues:**
   ```bash
   # Enable performance profiling
   NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

   # Check bundle size
   npm run build:analyze
   ```

### Performance Tuning

1. **Image Optimization:**
   ```javascript
   // next.config.mjs
   images: {
     formats: ['image/webp', 'image/avif'],
     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
   }
   ```

2. **Bundle Splitting:**
   ```javascript
   // Dynamic imports for large components
   const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
     loading: () => <div>Loading...</div>,
   })
   ```

3. **Caching Strategy:**
   ```javascript
   // API routes with caching
   export const revalidate = 3600 // 1 hour
   ```

## Backup & Recovery

### Configuration Backup

```bash
# Backup environment configuration
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Backup Docker volumes
docker run --rm -v itfy-portal-frontend_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```

### Rollback Procedure

1. **Application Rollback:**
   ```bash
   ./scripts/deploy.sh --rollback
   ```

2. **Configuration Rollback:**
   ```bash
   cp .env.backup.latest .env
   npm run docker:prod:up
   ```

3. **Database Rollback:**
   - Restore from backup if configuration changes affected data

## Support

For deployment issues, check:

1. **Application Logs:**
   ```bash
   npm run docker:logs
   ```

2. **Health Endpoints:**
   ```bash
   curl https://portal.itforyouthghana.org/api/health
   ```

3. **Performance Metrics:**
   - Google Analytics dashboard
   - Sentry error tracking
   - Lighthouse performance reports

4. **System Resources:**
   ```bash
   docker stats itfy-portal-frontend
   ```