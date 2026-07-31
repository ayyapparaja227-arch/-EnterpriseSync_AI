# 🚀 EnterpriseSync AI - Setup Guide

## Quick Demo Setup (5 minutes)

This guide will help you run the basic demo version locally.

---

## 📋 Prerequisites

Make sure you have installed:
- **Python 3.11+** - [Download](https://www.python.org/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

Check your versions:
```bash
python --version  # Should be 3.11 or higher
node --version    # Should be 18 or higher
npm --version
```

---

## 🔧 Backend Setup

### Step 1: Navigate to backend folder

```bash
cd backend
```

### Step 2: Create virtual environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run the backend server

```bash
uvicorn main:app --reload
```

✅ **Backend is now running!**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🎨 Frontend Setup

**Open a NEW terminal window** (keep backend running)

### Step 1: Navigate to frontend folder

```bash
cd frontend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Create environment file

```bash
# Copy example env file
cp .env.example .env
```

The `.env` file should contain:
```
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=EnterpriseSync AI
```

### Step 4: Start development server

```bash
npm run dev
```

✅ **Frontend is now running!**
- App: http://localhost:5173

---

## 🎯 Login and Test

1. **Open Browser:** http://localhost:5173

2. **Login with demo credentials:**

   **Admin Account:**
   ```
   Email: admin@enterprisesync.ai
   Password: admin123
   ```

   **Manager Account:**
   ```
   Email: john@enterprisesync.ai
   Password: manager123
   ```

   **Employee Account:**
   ```
   Email: jane@enterprisesync.ai
   Password: employee123
   ```

3. **Explore Features:**
   - ✅ Dashboard with charts
   - ✅ Projects list
   - ✅ Tasks management
   - ✅ AI Risk Prediction (click on any project)

---

## 📁 Project Structure

```
EnterpriseSync_AI/
├── backend/              # FastAPI backend
│   ├── main.py          # Main application
│   ├── requirements.txt # Python dependencies
│   └── README.md
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── layouts/    # Layout components
│   │   ├── api.js      # API configuration
│   │   └── App.jsx     # Root component
│   ├── package.json    # NPM dependencies
│   └── README.md
│
└── docs/               # Documentation
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError`**
```bash
# Solution: Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Then reinstall
pip install -r requirements.txt
```

**Problem: Port 8000 already in use**
```bash
# Solution: Kill the process or use different port
uvicorn main:app --reload --port 8001
# Update frontend .env: VITE_API_URL=http://localhost:8001
```

### Frontend Issues

**Problem: `Cannot find module`**
```bash
# Solution: Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem: Port 5173 already in use**
```bash
# Solution: Use different port
npm run dev -- --port 3000
```

**Problem: API calls failing / CORS errors**
```bash
# Solution:
# 1. Make sure backend is running on port 8000
# 2. Check .env file has correct VITE_API_URL
# 3. Restart both servers
```

### Login Issues

**Problem: Cannot login**
```
# Use exact credentials (case sensitive):
Email: admin@enterprisesync.ai
Password: admin123
```

---

## 🎨 Features Demo

### 1. Dashboard
- View statistics cards
- See project status pie chart
- Employee workload bar chart
- Risk trend line chart

### 2. Projects
- Browse all projects
- See project details
- View completion progress
- **Click "AI Risk Analysis"** to see AI prediction

### 3. Tasks
- Filter by status (All, To Do, In Progress, Completed)
- View task details
- See assigned employees

---

## 🔑 Demo Data

The backend uses **mock data** stored in memory. Changes will reset when you restart the server.

**Users:**
- 3 demo users (Admin, Manager, Employee)

**Projects:**
- 3 sample projects

**Tasks:**
- 3 sample tasks

---

## 📊 Testing AI Risk Prediction

1. Go to **Projects** page
2. Click **"AI Risk Analysis"** button on any project
3. See AI-generated:
   - Risk Score (0-100)
   - Risk Level (Low/Medium/High)
   - Predicted Delay (in days)
   - Smart Recommendations

---

## 🚀 Next Steps

### Want to add a database?
See: [docs/database-schema.md](docs/database-schema.md)

### Want to deploy?
See: [docs/deployment-guide.md](docs/deployment-guide.md)

### Want to understand the code?
See:
- [docs/backend-guide.md](docs/backend-guide.md)
- [docs/frontend-guide.md](docs/frontend-guide.md)

### Want full implementation?
See: [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)

---

## 💡 Development Tips

### Backend Development
```bash
# Backend runs with auto-reload
# Any changes to main.py will auto-restart

# View API documentation
open http://localhost:8000/docs
```

### Frontend Development
```bash
# Vite provides hot module replacement
# Changes appear instantly in browser

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📞 Need Help?

1. Check [QUICKSTART.md](QUICKSTART.md)
2. Check [README.md](README.md)
3. Check troubleshooting section above
4. Review documentation in `docs/` folder

---

## ✅ Success Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can login with admin@enterprisesync.ai / admin123
- [ ] Can see dashboard with charts
- [ ] Can view projects
- [ ] Can click AI Risk Analysis
- [ ] Can view tasks

---

## 🎉 You're Ready!

Your EnterpriseSync AI demo is now running!

**Explore the features and have fun! 🚀**

---

**Current Status:** ✅ Basic Demo Complete  
**Next Level:** Add PostgreSQL database (see docs/database-schema.md)  
**Production:** Deploy to cloud (see docs/deployment-guide.md)
