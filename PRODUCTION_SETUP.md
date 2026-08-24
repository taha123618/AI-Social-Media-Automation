# AI Social Media Automation - Hostinger VPS Deployment Guide

This guide provides step-by-step instructions to deploy the AI Social Media Automation project on a Hostinger VPS. It covers system setup, configuration, and running both the production web app and scheduler workers using PM2.

## Prerequisites

Your Hostinger VPS should have:
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS (recommended)
- **RAM**: Minimum 2GB (4GB+ recommended for production)
- **Storage**: Minimum 20GB (50GB+ recommended)

---

## Step 1: Initial Server Setup

### 1.1 Connect to Your VPS
```bash
ssh root@your_vps_ip_address
# Enter your password when prompted
```

### 1.2 Update System Packages
```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git build-essential netcat-openbsd
```

---

## Step 2: Install Node.js and Bun

### 2.1 Install Node.js (v20 Stable)
```bash
curl -fsSL https://nodesource.com | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 Install Bun (System Package Engine)
```bash
curl -fsSL https://bun.sh | bash
source ~/.bashrc
```

---

## Step 3: Install and Optimize PostgreSQL 16 with pgvector

### 3.1 Install PostgreSQL 16
```bash
sudo apt-get install -y postgresql postgresql-contrib postgresql-16-pgvector
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Optimize Database Connections for Prisma Runtime
To prevent `Connection terminated unexpectedly` errors, you must adjust the default connection and buffer pools.

1. Open the configuration file:
   ```bash
   sudo nano /etc/postgresql/16/main/postgresql.conf
   ```
2. Press `Ctrl + W`, find these keys, and update them to:
   ```text
   max_connections = 100
   shared_buffers = 512MB
   ```
3. Save and close (`Ctrl + O`, `Enter`, `Ctrl + X`).
4. Restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql
   ```

### 3.3 Create Production Database
```bash
sudo -u postgres psql << EOF
CREATE USER social_automation WITH PASSWORD 'admin123';
CREATE DATABASE social_automation_db OWNER social_automation;
ALTER USER social_automation CREATEDB;
\c social_automation_db
CREATE EXTENSION IF NOT EXISTS vector;
EOF
```

---

## Step 4: Install Redis and FFmpeg

### 4.1 Install Redis Server
```bash
sudo apt-get install -y redis-server
sudo systemctl enable redis-server --now
```

### 4.2 Install FFmpeg (For video automation engines)
```bash
sudo apt-get install -y ffmpeg
```

---

## Step 5: Clone and Setup Application Directories

```bash
mkdir -p /var/www/html
cd /var/www/html
git clone https://github.com
cd ai_social_media_automation
```

---

## Step 6: Configure Production Environment Variables

### 6.1 Create your runtime configuration
```bash
nano .env
```

### 6.2 Paste the Verified Configuration Parameters
Ensure `localhost` is swapped out for the strict IPv4 loopback signature `127.0.0.1`. **Do not include serverless parameters like `pool_mode=transaction` for local PostgreSQL.**

```env
# ================================================
# Database Configuration (Hostinger VPS Local Loop)
# ================================================
POSTGRES_USER=social_automation
POSTGRES_PASSWORD=admin123
POSTGRES_DB=social_automation_db
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
DATABASE_URL="postgresql://social_automation:admin123@127.0.0.1:5432/social_automation_db?connection_limit=20&connect_timeout=30"

# Application Settings
APP_NAME="AI Social Media Automation"
APP_URL="https://dtp-staging.com"
NEXT_PUBLIC_APP_URL="https://dtp-staging.com"
DOMAIN=://dtp-staging.com
NODE_ENV="production"

# Redis Integration
REDIS_URL="redis://127.0.0.1:6379"

# Email Configuration (Nodemailer)
EMAIL_HOST=gmail
EMAIL_USER=saad@devteampro.com
EMAIL_PASSWORD=efkcvxwxghikaoyg
EMAIL_FROM="AI Social Media Automation <saad@devteampro.com>"

# Better Auth Configuration (32+ Character Secret)
BETTER_AUTH_SECRET="your-better-auth-secret-here-32-chars-minimum"
BETTER_AUTH_URL="https://dtp-staging.com"

# AI Provider Integrations
OPENROUTER_API_KEY="sk-or-v1-..."
OPENAI_API_KEY="sk-proj-..."
GEMINI_API_KEY="AIzaSy..."
```

---

## Step 7: Push Schema State and Compile Next.js

```bash
# Force sync structural schemas directly to the engine
bun run prisma:generate && bun prisma migrate deploy

bun run prisma:push

# Generate client binary interfaces
bun run prisma:generate

# Compile production optimizations
bun run build
```

---

## Step 8: Start Processes Separately with PM2

### 8.1 Install PM2 Globally
```bash
sudo npm install -g pm2
```

### 8.2 Clean memory cache and Boot Web App
```bash
# Delete old conflicting instances
pm2 delete all

# Start the main Next.js web application
pm2 start npm --name "ai_social_media_automation" -- start
```

### 8.3 Boot the Scheduler Worker Processes Directly
Run your `tsx` script scheduler engine as an independent process loop:
```bash
pm2 start npx --name "social-scheduler-worker" -- tsx scripts/start-scheduler.ts
```

### 8.4 Save PM2 State for Auto-Boot
```bash
pm2 save
pm2 startup
```

---

## Step 9: Configure Nginx as Reverse Proxy

### 9.1 Create Site Configuration Profile
```bash
sudo nano /etc/nginx/sites-available/social-automation
```

### 9.2 Add Dynamic Connection Handlers and Safe Proxy Buffers
This profile contains a custom connection map rule at the top. This dynamically terminates empty headers, preventing internal Node server component fetch loops from crashing with `invalid connection header` flags.

```nginx
# Map connection upgrades dynamically to prevent internal Next.js fetch crashes
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    server_name social-app.dtp-staging.com www.social-app.dtp-staging.com;

    # Dedicated Access and Error Logs
    access_log /var/log/nginx/social-automation-access.log;
    error_log /var/log/nginx/social-automation-error.log;

    # Gzip compression for faster loading
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/xml text/css application/javascript application/x-javascript application/json image/svg+xml;
    gzip_vary on;

    # Serve Next.js static build files directly via Nginx (Optimized)
    location /_next/static/ {
        alias /var/www/html/ai_social_media_automation/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Serve static assets from the public folder directly via Nginx
    location / {
        root /var/www/html/ai_social_media_automation/public;
        try_files $uri @nextjs;
    }

    # Reverse proxy to the running Next.js server with 300s timeouts
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # Safe connection mapping instead of hardcoded 'upgrade'
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Real client IP detection
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Extended timeout settings to prevent 504 Gateway Timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/social-app.dtp-staging.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/social-app.dtp-staging.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    listen 80;
    server_name social-app.dtp-staging.com www.social-app.dtp-staging.com;

    # Simplified and safer HTTP to HTTPS redirect
    return 301 https://$host$request_uri;
}

```

### 9.3 Enable Site and Reload Nginx
```bash
sudo ln -s /etc/nginx/sites-available/social-automation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 10: Post-Deployment Monitoring Actions

```bash
# View active background process metrics
pm2 status

# Track web requests and client interactions
pm2 logs ai_social_media_automation

# Trace cron loops and text task parsing engines
pm2 logs social-scheduler-worker

# Trace core server proxy failures
sudo tail -f /var/log/nginx/social-automation-error.log
```
