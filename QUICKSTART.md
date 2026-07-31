# Quick Start Guide

## ⚡ Get EnterpriseSync AI Running in 5 Minutes

---

## 📋 Prerequisites

Make sure you have these installed:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://www.python.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/enterprisesync-ai.git
cd enterprisesync-ai
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb enterprisesync_ai

# Or using psql
psql postgres
CREATE DATABASE enterprisesync_ai;
\q
```

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://localhost/enterprisesync_ai
SECRET_KEY=dev-secret-key-change-in-production-12345678
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF

# Start backend server
uvicorn main:app --reload
```

Backend will run at: **http://localhost:8000**

API Docs: **http://localhost:8000/docs**

### 4. Setup Frontend

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=EnterpriseSync AI
EOF

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## 🎯 First Login

### Default Admin Credentials

The database will be auto-seeded with a default admin user:

```
Email: admin@enterprisesync.ai
Password: admin123
```

**⚠️ Important:** Change this password after first login!

---

## 🧪 Test the Application

### 1. Open Browser

Visit: **http://localhost:5173**

### 2. Login

Use the default admin credentials above.

### 3. Explore Features

- **Dashboard** - View overview and statistics
- **Projects** - Create and manage projects
- **Tasks** - Assign and track tasks
- **Employees** - Manage team members
- **AI Risk** - Generate risk predictions

---

## 📂 Project Structure

```
enterprisesync-ai/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/           # FastAPI backend
│   ├── app/
│   ├── main.py
│   └── requirements.txt
│
├── docs/              # Documentation
└── README.md
```

---

## 🛠️ Development Commands

### Backend

```bash
# Start server
uvicorn main:app --reload

# Run tests
pytest

# Create database migration
alembic revision -m "description"

# Apply migrations
alembic upgrade head
```

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError`
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Error:** `Database connection failed`
```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -l | grep enterprisesync_ai

# Check .env DATABASE_URL is correct
```

### Frontend won't start

**Error:** `Cannot find module`
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Port 5173 already in use`
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Cannot login

**Problem:** Invalid credentials
- Use default: `admin@enterprisesync.ai` / `admin123`
- Check backend logs for errors
- Verify database has users table

**Problem:** CORS errors
- Ensure backend is running on port 8000
- Check frontend .env has correct VITE_API_URL
- Restart both servers

---

## 📚 Next Steps

1. **Read the docs:**
   - [Frontend Guide](docs/frontend-guide.md)
   - [Backend Guide](docs/backend-guide.md)
   - [API Documentation](docs/api-documentation.md)

2. **Customize:**
   - Update branding and colors
   - Add custom features
   - Configure email notifications

3. **Deploy:**
   - Follow [Deployment Guide](docs/deployment-guide.md)
   - Setup production database
   - Configure domain and SSL

---

## 💡 Tips

- Use **Chrome DevTools** for debugging
- Check **Network tab** for API call issues
- View **backend logs** for server errors
- Enable **React DevTools** for component inspection

---

## 🆘 Need Help?

- **Documentation:** [docs/](docs/)
- **API Docs:** http://localhost:8000/docs
- **Issues:** GitHub Issues
- **Email:** support@enterprisesync.ai

---

**Happy Coding! 🚀**

Now you're ready to build amazing enterprise features!
