# Deployment Guide

## 🚀 EnterpriseSync AI - Production Deployment

This guide covers deploying the EnterpriseSync AI platform to production using modern cloud services.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Database Deployment (Neon)](#database-deployment-neon)
4. [Backend Deployment (Railway)](#backend-deployment-railway)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
│   React + Vite  │
└────────┬────────┘
         │ HTTPS
         ↓
┌────────────────┐
│   Backend      │
│   (Railway)    │
│   FastAPI      │
└────────┬───────┘
         │ PostgreSQL
         ↓
┌────────────────┐
│   Database     │
│   (Neon)       │
│   PostgreSQL   │
└────────────────┘
```

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [x] GitHub account (for code repository)
- [x] Vercel account (for frontend)
- [x] Railway account (for backend)
- [x] Neon account (for database)
- [x] Git installed locally
- [x] Node.js 18+ and Python 3.11+
- [x] Completed local development and testing

---

## 🗄️ Database Deployment (Neon)

### Step 1: Create Neon Account

1. Visit [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Verify email

### Step 2: Create Database

1. Click **"New Project"**
2. Configure:
   - **Project Name:** enterprisesync-ai
   - **Database Name:** enterprisesync_ai
   - **Region:** Choose closest to your users
   - **Plan:** Free tier (can upgrade later)

3. Click **"Create Project"**

### Step 3: Get Connection String

After creation, you'll see a connection string like:

```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/enterprisesync_ai?sslmode=require
```

**Save this connection string** - you'll need it for backend deployment.

### Step 4: Initialize Database Schema

#### Option A: Using psql

```bash
# Install psql if not available
brew install postgresql  # macOS
sudo apt-get install postgresql-client  # Linux

# Connect to Neon database
psql "postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/enterprisesync_ai?sslmode=require"

# Run schema creation
\i backend/schema.sql
```

#### Option B: Using Database Migration (Recommended)

The backend will automatically create tables on first run using SQLAlchemy's `create_all()`.

### Step 5: Verify Database

```sql
-- List all tables
\dt

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## ⚙️ Backend Deployment (Railway)

### Step 1: Prepare Backend

1. Ensure `requirements.txt` is complete:

```txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pydantic==2.6.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
```

2. Create `Procfile` in backend directory:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

3. Create `railway.json` (optional):

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/enterprisesync-ai.git
git push -u origin main
```

### Step 3: Deploy to Railway

1. Visit [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository
6. Click **"Deploy Now"**

### Step 4: Configure Environment Variables

In Railway dashboard, go to **Variables** and add:

```env
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/enterprisesync_ai?sslmode=require
SECRET_KEY=your-super-secret-key-min-32-characters-long-12345678
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

**Generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 5: Configure Root Directory

If your backend is in a subdirectory:

1. Go to **Settings** → **Service Settings**
2. Set **Root Directory:** `backend`
3. Set **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 6: Get Railway URL

After deployment, Railway assigns a URL like:
```
https://enterprisesync-ai-production.up.railway.app
```

**Save this URL** - you'll need it for frontend.

### Step 7: Test Backend

```bash
# Test health endpoint
curl https://your-railway-url.up.railway.app/

# Test API docs
curl https://your-railway-url.up.railway.app/docs
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

2. Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: enterprisesync-ai
# - Directory: ./
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** frontend (if in subdirectory)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Click **"Deploy"**

### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```env
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_APP_NAME=EnterpriseSync AI
```

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments**
2. Click **"..."** on latest deployment
3. Select **"Redeploy"**

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain: `app.enterprisesync.ai`
3. Follow DNS configuration instructions

### Step 6: Test Frontend

Visit your Vercel URL:
```
https://enterprisesync-ai.vercel.app
```

---

## 🔧 Environment Variables

### Backend (.env - Railway)

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://custom-domain.com

# Optional
DEBUG=false
LOG_LEVEL=info
```

### Frontend (.env - Vercel)

```env
# API
VITE_API_URL=https://your-backend.railway.app

# App
VITE_APP_NAME=EnterpriseSync AI
VITE_APP_VERSION=1.0.0
```

---

## ✅ Post-Deployment

### 1. Create Admin User

Use Railway's terminal or run locally:

```python
# create_admin.py
from app.models.user import User
from app.models.role import Role
from app.database.connection import engine, SessionLocal
from app.auth.password import hash_password

# Create session
db = SessionLocal()

# Create admin user
admin = User(
    name="Admin User",
    email="admin@enterprisesync.ai",
    password=hash_password("change-this-password"),
    role_id=1,  # Admin role
    status="active"
)

db.add(admin)
db.commit()
print("Admin user created!")
```

Run in Railway terminal:
```bash
python create_admin.py
```

### 2. Test Complete Flow

1. **Visit Frontend:** https://your-app.vercel.app
2. **Login:** Use admin credentials
3. **Create Project:** Test project creation
4. **Create Task:** Test task assignment
5. **Check Dashboard:** Verify stats display
6. **Test AI Risk:** Generate risk prediction

### 3. Configure CORS

Update backend to allow frontend domain:

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "https://enterprisesync-ai.vercel.app",
    "https://your-custom-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Enable HTTPS

Both Railway and Vercel provide automatic HTTPS.

Verify:
```bash
curl -I https://your-backend.railway.app
# Look for: strict-transport-security header
```

---

## 📊 Monitoring & Maintenance

### Railway Monitoring

1. **Logs:** View real-time logs in Railway dashboard
2. **Metrics:** Check CPU, Memory, Network usage
3. **Alerts:** Configure alerts for downtime

### Vercel Monitoring

1. **Analytics:** Enable Vercel Analytics
2. **Speed Insights:** Monitor performance
3. **Logs:** View build and function logs

### Database Monitoring

1. **Neon Dashboard:** Monitor database size, connections
2. **Queries:** Analyze slow queries
3. **Backups:** Enable automatic backups

### Health Check Endpoints

Add to backend:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow()
    }
```

Monitor:
```bash
curl https://your-backend.railway.app/health
```

---

## 🔍 Troubleshooting

### Backend Issues

**Problem:** 502 Bad Gateway
- **Solution:** Check Railway logs, ensure PORT is correct
- **Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Problem:** Database connection failed
- **Solution:** Verify DATABASE_URL, check Neon status
- **Test:** `psql $DATABASE_URL`

**Problem:** CORS errors
- **Solution:** Update ALLOWED_ORIGINS in environment variables

### Frontend Issues

**Problem:** API calls failing
- **Solution:** Verify VITE_API_URL is correct
- **Check:** Browser network tab

**Problem:** Environment variables not working
- **Solution:** Ensure variables start with `VITE_`
- **Redeploy:** After adding new variables

**Problem:** Build failures
- **Solution:** Check Node version, clear cache
- **Command:** `vercel --force`

### Database Issues

**Problem:** Slow queries
- **Solution:** Add indexes, optimize queries
- **Check:** `EXPLAIN ANALYZE` in psql

**Problem:** Connection limit reached
- **Solution:** Upgrade Neon plan or optimize connections

---

## 🔄 Update Deployment

### Backend Updates

```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-deploys from main branch
```

### Frontend Updates

```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys from main branch
```

### Database Migrations

```bash
# Create migration
alembic revision -m "Add new column"

# Apply migration
alembic upgrade head
```

---

## 📦 Backup Strategy

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260731.sql
```

### Automated Backups

Neon provides automatic daily backups (check your plan).

---

## 🎯 Production Checklist

- [ ] Database deployed on Neon
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] Admin user created
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Health checks working
- [ ] Error tracking configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Custom domain configured (optional)
- [ ] Performance tested
- [ ] Security review completed

---

## 📞 Support Resources

- **Railway:** https://railway.app/help
- **Vercel:** https://vercel.com/support
- **Neon:** https://neon.tech/docs

---

**Deployment Date:** July 31, 2026  
**Last Updated:** July 31, 2026

🚀 **Congratulations! Your EnterpriseSync AI platform is now live!**
