# Campus Life - Deployment Guide

## 🚀 Deployment Strategies

### Option 1: Heroku (Easiest)

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Steps

**1. Create Heroku app**
```bash
heroku create campus-life-game
```

**2. Set environment variables**
```bash
heroku config:set JWT_SECRET=your-secret-key-here
heroku config:set NODE_ENV=production
```

**3. Deploy backend**
```bash
cd backend
git push heroku main
```

**4. Deploy frontend (to Vercel - see Option 2)**

#### Backend Procfile
Create `backend/Procfile`:
```
web: node server.js
```

---

### Option 2: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

**1. Create project**
```bash
npm run build
```

**2. Deploy static files**
- Push to GitHub
- Connect GitHub to Vercel
- Deploy `/dist` folder as static site

**3. Update API_URL in production**
Edit `script.js` before build:
```javascript
const API_URL = 'https://campus-life-api.railway.app'
```

#### Backend on Railway

**1. Push to GitHub**
```bash
git push origin main
```

**2. In Railway.app**
- Create new project
- Connect GitHub repo
- Select Node.js
- Set environment variables:
  - `JWT_SECRET=...`
  - `NODE_ENV=production`

**3. Deploy**
- Railway auto-deploys from main branch
- Get public URL: `https://campus-life-api-xxx.railway.app`

---

### Option 3: Self-Hosted (VPS)

#### Setup Server

**1. SSH to VPS**
```bash
ssh root@your-vps-ip
```

**2. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**3. Install PM2 (process manager)**
```bash
sudo npm install -g pm2
```

**4. Clone repository**
```bash
git clone https://github.com/yourrepo/campus-life
cd campus-life
```

**5. Install dependencies**
```bash
npm install
cd backend && npm install
```

**6. Build frontend**
```bash
npm run build
```

**7. Start backend with PM2**
```bash
cd backend
pm2 start server.js --name "campus-life-api"
pm2 save
pm2 startup
```

**8. Setup Nginx (reverse proxy)**
```nginx
# /etc/nginx/sites-enabled/default
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/campus-life/dist;
        try_files $uri /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**9. Setup HTTPS with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 4: Docker (All-in-one)

#### Create Dockerfile

**backend/Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

**Dockerfile (frontend)**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=your-secret
      - NODE_ENV=production
    volumes:
      - ./backend/database.db:/app/database.db

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - backend
```

#### Run with Docker Compose
```bash
docker-compose up -d
```

---

## 📦 Database Migration (SQLite → PostgreSQL)

For production scalability:

**1. Install PostgreSQL**
```bash
sudo apt install postgresql postgresql-contrib
```

**2. Update backend connection**
Edit `backend/db.js`:
```javascript
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
```

**3. Migrate data**
```bash
npm install pg
# Create migration script to transfer data from SQLite to PostgreSQL
```

**4. Set DATABASE_URL environment variable**
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/campus_life"
```

---

## 🔐 Production Security Checklist

- [ ] HTTPS/TLS enabled
- [ ] JWT_SECRET set to strong random value
- [ ] CORS restricted (not `*`)
- [ ] Rate limiting enabled
- [ ] SQL injection protection verified
- [ ] XSS headers set
- [ ] CSRF tokens implemented
- [ ] Database backups configured
- [ ] Secrets management (not in code)
- [ ] Monitoring/logging set up
- [ ] Health checks configured
- [ ] Error messages don't leak info

### Security Headers (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' cdn.tailwindcss.com" always;
```

---

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Monitor endpoint
curl https://your-domain.com/api/health
```

### Database Backups
```bash
# SQLite
cp backend/database.db backend/database.backup.db

# PostgreSQL
pg_dump campus_life > backup.sql
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs campus-life-api

# Nginx access
tail -f /var/log/nginx/access.log
```

### Performance Monitoring
- Use Datadog, New Relic, or similar
- Monitor response times, error rates
- Set up alerts for failures

---

## 🚨 Common Deployment Issues

### Issue: API CORS errors
**Solution**: Check API_URL in frontend matches backend domain

### Issue: Database locked
**Solution**: Use PostgreSQL instead of SQLite for production

### Issue: Out of memory
**Solution**: Increase VPS RAM or use database pagination

### Issue: 502 Bad Gateway
**Solution**: Backend crashed - check PM2 logs with `pm2 logs`

---

## 📈 Scaling Strategy

### Phase 1: MVP (Current)
- Single server
- SQLite database
- Handles ~100 users

### Phase 2: Growth
- Separate frontend/backend servers
- PostgreSQL database
- Redis caching
- CDN for frontend

### Phase 3: Scale
- Load balancer
- Multiple backend instances
- Read replicas for database
- Microservices for specific features

---

## 🎯 Performance Optimization

### Frontend
```bash
# Build with compression
npm run build

# Enable gzip in Nginx
gzip on;
gzip_types text/plain text/css application/json;
```

### Backend
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Add database indexing
db.run('CREATE INDEX idx_user_id ON daily_missions(user_id)');
```

---

## 📱 Mobile Optimization

Already responsive! No additional steps needed.

But for app store:
- Build APK with React Native Web / Expo
- Or use web wrapper (Capacitor)
- Consider service workers for offline mode

---

## 🔄 CI/CD Pipeline Example (GitHub Actions)

**.github/workflows/deploy.yml**
```yaml
name: Deploy Campus Life

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Railway
        run: |
          npm run build
          # Railway automatic deploy
```

---

## 📞 Deployment Support

| Provider | Cost | Difficulty | Scale |
|----------|------|-----------|-------|
| Heroku | $7+/month | Easy | 1k users |
| Vercel + Railway | $5-20/month | Easy | 10k users |
| AWS/GCP | $10-50/month | Hard | 100k+ users |
| Self-hosted VPS | $5-20/month | Medium | 10k users |

---

## ✅ Pre-Production Checklist

- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] Database initializes
- [ ] All API endpoints tested
- [ ] Auth flow verified
- [ ] CORS configured
- [ ] Environment variables set
- [ ] SSL certificate ready
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Load tested
- [ ] Security reviewed

---

## 🚀 Deployment Commands (Quick Copy-Paste)

### For Heroku
```bash
git add .
git commit -m "Deploy"
git push heroku main
```

### For Railway
```bash
# Just push to GitHub, Railway auto-deploys
git push origin main
```

### For Self-Hosted
```bash
cd backend
pm2 restart campus-life-api
pm2 save
```

---

**You're ready to deploy! Choose your platform and go live. 🚀**