# 🚀 Deployment Guide

This guide covers deploying the Geolocation Tracking App in various environments.

## 📋 Prerequisites

### System Requirements

**Backend:**
- Node.js 18+ or Docker
- PostgreSQL 13+
- RAM: 512MB minimum, 2GB recommended
- Storage: 1GB minimum, 10GB recommended
- Network: Ports 3000 (API), 5432 (PostgreSQL)

**Frontend (Mobile App):**
- Android 7.0+ (API level 24+) or iOS 12+
- Storage: 50MB minimum
- Permissions: Location, Network

## 🐳 Docker Deployment (Recommended)

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: geolocation-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-geolocation_app}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - geolocation-network
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: geolocation-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-geolocation_app}
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN:-*}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - geolocation-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: geolocation-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - geolocation-network

volumes:
  postgres_data:
    driver: local

networks:
  geolocation-network:
    driver: bridge
```

### Production Dockerfile

Create `backend/Dockerfile.prod`:

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/ ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Environment Configuration

Create `.env.production`:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=geolocation_app
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_256_bit_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=https://yourdomain.com

# Security
BCRYPT_ROUNDS=12
HELMET_ENABLED=true

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn_here
```

### Deploy with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/geolocation-app.git
cd geolocation-app

# 2. Create environment file
cp .env.example .env.production
# Edit .env.production with your values

# 3. Build and start services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. Check logs
docker-compose -f docker-compose.prod.yml logs -f

# 5. Verify deployment
curl http://localhost:3000/health
```

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Push images to ECR:**

```bash
# Create ECR repositories
aws ecr create-repository --repository-name geolocation-backend

# Build and push backend
docker build -t geolocation-backend ./backend
docker tag geolocation-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/geolocation-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/geolocation-backend:latest
```

2. **Create ECS Task Definition:**

```json
{
  "family": "geolocation-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/geolocation-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {"name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:geolocation-db-password"},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:geolocation-jwt-secret"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/geolocation-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Create RDS PostgreSQL instance:**

```bash
aws rds create-db-instance \
  --db-instance-identifier geolocation-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YourSecurePassword \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx
```

### Google Cloud Platform (GCP)

#### Using Cloud Run

1. **Build and deploy:**

```bash
# Build with Cloud Build
gcloud builds submit --tag gcr.io/PROJECT_ID/geolocation-backend ./backend

# Deploy to Cloud Run
gcloud run deploy geolocation-backend \
  --image gcr.io/PROJECT_ID/geolocation-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DB_HOST=CLOUD_SQL_CONNECTION_NAME
```

2. **Create Cloud SQL PostgreSQL:**

```bash
gcloud sql instances create geolocation-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create geolocation_app --instance=geolocation-db
```

### DigitalOcean

#### Using App Platform

Create `app.yaml`:

```yaml
name: geolocation-app
services:
- name: backend
  source_dir: backend
  dockerfile_path: backend/Dockerfile.prod
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  env:
  - key: NODE_ENV
    value: production
  - key: DB_HOST
    value: ${db.HOSTNAME}
  - key: DB_PASSWORD
    value: ${db.PASSWORD}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

databases:
- name: db
  engine: PG
  version: "13"
  size: basic-xs
  num_nodes: 1
```

Deploy:

```bash
doctl apps create --spec app.yaml
```

## 🔧 Manual Server Deployment

### Ubuntu/Debian Server Setup

1. **Install dependencies:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional reverse proxy)
sudo apt install nginx -y
```

2. **Setup PostgreSQL:**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE geolocation_app;
CREATE USER geolocation_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE geolocation_app TO geolocation_user;
\q
```

3. **Deploy application:**

```bash
# Clone repository
git clone https://github.com/yourusername/geolocation-app.git
cd geolocation-app/backend

# Install dependencies
npm ci --only=production

# Create environment file
cp .env.example .env.production
# Edit with your configuration

# Run database migrations (if any)
npm run migrate

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

4. **Configure Nginx (optional):**

```nginx
# /etc/nginx/sites-available/geolocation-app
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/geolocation-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📱 Mobile App Deployment

### Android APK Build

```bash
cd frontend

# Build for production
flutter build apk --release

# Build for specific architecture
flutter build apk --target-platform android-arm64 --release

# Install on device
flutter install
```

### iOS Build

```bash
# Build for iOS
flutter build ios --release

# Open in Xcode for signing and deployment
open ios/Runner.xcworkspace
```

### App Store/Play Store Deployment

1. **Android (Google Play Console):**
   - Create signed APK/AAB
   - Upload to Google Play Console
   - Configure store listing
   - Submit for review

2. **iOS (App Store Connect):**
   - Archive in Xcode
   - Upload to App Store Connect
   - Configure store listing
   - Submit for review

## 🔒 Security Considerations

### SSL/TLS Configuration

1. **Let's Encrypt with Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

2. **Update Nginx config for HTTPS:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Your location blocks here...
}
```

### Environment Security

```bash
# Secure environment files
chmod 600 .env.production

# Use secrets management
# AWS: AWS Secrets Manager
# GCP: Secret Manager
# Azure: Key Vault
# Docker: Docker secrets
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **PM2 Monitoring:**

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart all
```

2. **Health Check Endpoint:**

Add to your app:

```javascript
// backend/healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
```

### Log Management

1. **Structured Logging:**

```javascript
// Use winston for structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

2. **Log Rotation:**

```bash
# Install logrotate
sudo apt install logrotate

# Configure log rotation
sudo tee /etc/logrotate.d/geolocation-app << EOF
/path/to/app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/app
            git pull origin main
            npm ci --only=production
            pm2 restart all
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Test connection
psql -h localhost -U geolocation_user -d geolocation_app
```

2. **Port Already in Use:**

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 PID
```

3. **Memory Issues:**

```bash
# Monitor memory usage
free -h
ps aux --sort=-%mem | head

# Check application memory
pm2 show backend
```

4. **SSL Certificate Issues:**

```bash
# Test SSL
openssl s_client -connect yourdomain.com:443

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_locations_device_timestamp ON locations(device_id, timestamp DESC);
CREATE INDEX idx_locations_timestamp ON locations(timestamp DESC);
CREATE INDEX idx_devices_user_active ON devices(user_id, is_active);
```

### Application Optimization

```javascript
// Use connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Implement caching
const redis = require('redis');
const client = redis.createClient();
```

### Load Balancing

```nginx
# Nginx load balancing
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

---

## 📞 Support

For deployment issues or questions:

**👨‍💻 Developer & Maintainer:**
- **Juan Carlos Andrade Unigarro**
- 📧 **Primary Email**: jandradeu@unal.edu.co
- 📧 **Alternative Email**: andradeunigarrojuancarlos@gmail.com
- 🏫 **Institution**: Universidad Nacional de Colombia
- 📚 **Course**: Redes 2025

**📋 Project Resources:**
- 🐛 **Bug Reports**: Create GitHub Issues
- 📖 **Documentation**: Check `/docs` folder
- 💬 **Questions**: Contact via email above

---

**Last Updated**: January 2024  
**Version**: 1.0.0
