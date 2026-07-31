# Project Structure

## 📁 EnterpriseSync AI - Complete File Organization

This document provides a detailed overview of the entire project structure.

---

## 🌳 Directory Tree

```
EnterpriseSync-AI/
│
├── 📄 README.md                      # Main project documentation
├── 📄 QUICKSTART.md                  # Quick setup guide
├── 📄 PROJECT_STRUCTURE.md           # This file
├── 📄 LICENSE                        # MIT License
├── 📄 .gitignore                     # Git ignore rules
│
├── 📁 docs/                          # Documentation
│   ├── frontend-guide.md            # Frontend development guide
│   ├── backend-guide.md             # Backend development guide
│   ├── database-schema.md           # Database design document
│   ├── api-documentation.md         # REST API reference
│   ├── deployment-guide.md          # Production deployment guide
│   ├── security-guide.md            # Security best practices
│   └── user-manual.md               # End-user documentation
│
├── 📁 frontend/                      # React + Vite frontend
│   │
│   ├── 📁 public/                    # Static assets
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── images/
│   │
│   ├── 📁 src/                       # Source code
│   │   │
│   │   ├── 📁 components/            # Reusable components
│   │   │   │
│   │   │   ├── 📁 common/            # Generic UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── Tooltip.jsx
│   │   │   │
│   │   │   ├── 📁 charts/            # Chart components
│   │   │   │   ├── PieChart.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── GaugeChart.jsx
│   │   │   │   └── AreaChart.jsx
│   │   │   │
│   │   │   ├── 📁 dashboard/         # Dashboard widgets
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── ActivityFeed.jsx
│   │   │   │   ├── DeadlineList.jsx
│   │   │   │   ├── ProjectOverview.jsx
│   │   │   │   └── RiskGauge.jsx
│   │   │   │
│   │   │   ├── 📁 forms/             # Form components
│   │   │   │   ├── ProjectForm.jsx
│   │   │   │   ├── TaskForm.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   └── AssetForm.jsx
│   │   │   │
│   │   │   └── 📁 tables/            # Table components
│   │   │       ├── ProjectTable.jsx
│   │   │       ├── TaskTable.jsx
│   │   │       ├── UserTable.jsx
│   │   │       └── AssetTable.jsx
│   │   │
│   │   ├── 📁 pages/                 # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── EmployeeProfile.jsx
│   │   │   ├── Departments.jsx
│   │   │   ├── Assets.jsx
│   │   │   ├── RiskPrediction.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── 📁 layouts/               # Layout components
│   │   │   ├── MainLayout.jsx        # Main app layout
│   │   │   ├── AuthLayout.jsx        # Auth pages layout
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── BreadcrumbNav.jsx
│   │   │
│   │   ├── 📁 hooks/                 # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useNotification.js
│   │   │   ├── usePagination.js
│   │   │   ├── useSearch.js
│   │   │   └── useTheme.js
│   │   │
│   │   ├── 📁 services/              # API service layer
│   │   │   ├── api.js                # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   ├── taskService.js
│   │   │   ├── userService.js
│   │   │   ├── departmentService.js
│   │   │   ├── assetService.js
│   │   │   ├── riskService.js
│   │   │   ├── notificationService.js
│   │   │   └── dashboardService.js
│   │   │
│   │   ├── 📁 context/               # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   │
│   │   ├── 📁 utils/                 # Utility functions
│   │   │   ├── formatters.js         # Date, currency formatters
│   │   │   ├── validators.js         # Validation helpers
│   │   │   ├── constants.js          # App constants
│   │   │   ├── helpers.js            # General helpers
│   │   │   └── dateUtils.js
│   │   │
│   │   ├── 📄 App.jsx                # Root component
│   │   ├── 📄 main.jsx               # Entry point
│   │   └── 📄 index.css              # Global styles
│   │
│   ├── 📄 index.html                 # HTML template
│   ├── 📄 package.json               # Dependencies
│   ├── 📄 vite.config.js             # Vite configuration
│   ├── 📄 tailwind.config.js         # Tailwind configuration
│   ├── 📄 postcss.config.js          # PostCSS configuration
│   ├── 📄 .eslintrc.cjs              # ESLint rules
│   ├── 📄 .env.example               # Environment variables template
│   └── 📄 vercel.json                # Vercel deployment config
│
├── 📁 backend/                       # FastAPI backend
│   │
│   ├── 📁 app/                       # Application code
│   │   │
│   │   ├── 📁 api/                   # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Authentication routes
│   │   │   ├── users.py              # User CRUD routes
│   │   │   ├── roles.py              # Role routes
│   │   │   ├── departments.py        # Department routes
│   │   │   ├── projects.py           # Project routes
│   │   │   ├── tasks.py              # Task routes
│   │   │   ├── assets.py             # Asset routes
│   │   │   ├── notifications.py      # Notification routes
│   │   │   ├── dashboard.py          # Dashboard data routes
│   │   │   ├── risks.py              # Risk prediction routes
│   │   │   ├── reports.py            # Report generation routes
│   │   │   └── activity_logs.py      # Activity log routes
│   │   │
│   │   ├── 📁 models/                # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Base model class
│   │   │   ├── role.py
│   │   │   ├── department.py
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   ├── asset.py
│   │   │   ├── asset_allocation.py
│   │   │   ├── risk_prediction.py
│   │   │   ├── notification.py
│   │   │   └── activity_log.py
│   │   │
│   │   ├── 📁 schemas/               # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Login/Register schemas
│   │   │   ├── user.py               # User schemas
│   │   │   ├── role.py
│   │   │   ├── department.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   ├── asset.py
│   │   │   ├── notification.py
│   │   │   ├── risk.py
│   │   │   └── common.py             # Common schemas
│   │   │
│   │   ├── 📁 services/              # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── project_service.py
│   │   │   ├── task_service.py
│   │   │   ├── department_service.py
│   │   │   ├── asset_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── risk_service.py       # AI risk prediction
│   │   │   ├── dashboard_service.py
│   │   │   └── report_service.py
│   │   │
│   │   ├── 📁 database/              # Database configuration
│   │   │   ├── __init__.py
│   │   │   ├── connection.py         # Database connection
│   │   │   ├── session.py            # Session management
│   │   │   └── init_db.py            # Database initialization
│   │   │
│   │   ├── 📁 auth/                  # Authentication utilities
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py                # JWT token handling
│   │   │   ├── password.py           # Password hashing
│   │   │   ├── dependencies.py       # Auth dependencies
│   │   │   └── permissions.py        # Permission checks
│   │   │
│   │   ├── 📁 core/                  # Core configurations
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # App settings
│   │   │   ├── security.py           # Security settings
│   │   │   └── logging.py            # Logging configuration
│   │   │
│   │   └── 📁 utils/                 # Utility functions
│   │       ├── __init__.py
│   │       ├── validators.py
│   │       ├── helpers.py
│   │       ├── constants.py
│   │       ├── email.py              # Email utilities
│   │       └── exceptions.py         # Custom exceptions
│   │
│   ├── 📁 tests/                     # Test files
│   │   ├── __init__.py
│   │   ├── conftest.py               # Test configuration
│   │   ├── test_auth.py
│   │   ├── test_users.py
│   │   ├── test_projects.py
│   │   ├── test_tasks.py
│   │   └── test_risks.py
│   │
│   ├── 📁 alembic/                   # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── 📄 main.py                    # FastAPI app entry point
│   ├── 📄 requirements.txt           # Python dependencies
│   ├── 📄 .env.example               # Environment template
│   ├── 📄 alembic.ini                # Alembic configuration
│   ├── 📄 Procfile                   # Railway deployment
│   ├── 📄 railway.json               # Railway config
│   └── 📄 pytest.ini                 # Pytest configuration
│
├── 📁 scripts/                       # Utility scripts
│   ├── setup.sh                      # Project setup script
│   ├── seed_data.py                  # Database seeding
│   ├── create_admin.py               # Create admin user
│   └── backup_db.sh                  # Database backup
│
└── 📁 .github/                       # GitHub workflows
    └── workflows/
        ├── frontend-ci.yml           # Frontend CI/CD
        ├── backend-ci.yml            # Backend CI/CD
        └── deploy.yml                # Deployment workflow
```

---

## 📊 File Count Summary

| Category                  | Count |
|---------------------------|-------|
| Frontend Components       | 25+   |
| Frontend Pages            | 14    |
| Backend API Endpoints     | 12    |
| Database Models           | 10    |
| Pydantic Schemas          | 10+   |
| Business Logic Services   | 9     |
| Custom Hooks              | 8     |
| API Services              | 9     |
| Test Files                | 5+    |
| Documentation Files       | 7     |

**Total Files:** 100+ files

---

## 🎯 Key Files Description

### Frontend

**Entry Points:**
- `main.jsx` - Application entry point
- `App.jsx` - Root component with routing
- `index.html` - HTML template

**Core Components:**
- `MainLayout.jsx` - Main application layout with sidebar
- `Sidebar.jsx` - Navigation sidebar
- `Header.jsx` - Top navigation bar

**Key Pages:**
- `Dashboard.jsx` - Main dashboard with charts
- `Projects.jsx` - Project management
- `Tasks.jsx` - Task management
- `RiskPrediction.jsx` - AI risk analysis

**Configuration:**
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS setup
- `package.json` - Dependencies and scripts

### Backend

**Entry Point:**
- `main.py` - FastAPI application initialization

**Core Files:**
- `app/database/connection.py` - Database connection
- `app/auth/jwt.py` - JWT authentication
- `app/services/risk_service.py` - AI risk prediction

**API Routes:**
- `app/api/auth.py` - Authentication endpoints
- `app/api/projects.py` - Project CRUD
- `app/api/risks.py` - Risk prediction API

**Configuration:**
- `requirements.txt` - Python dependencies
- `.env` - Environment variables
- `alembic.ini` - Database migrations

---

## 🔧 Configuration Files

### Frontend Configuration

| File                   | Purpose                          |
|------------------------|----------------------------------|
| `vite.config.js`       | Vite build settings             |
| `tailwind.config.js`   | Tailwind CSS customization      |
| `postcss.config.js`    | PostCSS plugins                 |
| `.eslintrc.cjs`        | Code linting rules              |
| `vercel.json`          | Vercel deployment config        |
| `.env`                 | Environment variables           |

### Backend Configuration

| File                   | Purpose                          |
|------------------------|----------------------------------|
| `requirements.txt`     | Python package dependencies     |
| `alembic.ini`          | Database migration settings     |
| `.env`                 | Environment variables           |
| `Procfile`             | Railway deployment command      |
| `railway.json`         | Railway configuration           |
| `pytest.ini`           | Test configuration              |

---

## 📦 Dependencies

### Frontend Dependencies

**Core:**
- react: ^19.0.0
- react-dom: ^19.0.0
- react-router-dom: ^6.20.0

**UI:**
- tailwindcss: ^3.4.0
- lucide-react: ^0.300.0
- recharts: ^2.10.0

**Utilities:**
- axios: ^1.6.0
- react-hook-form: ^7.49.0

### Backend Dependencies

**Core:**
- fastapi: 0.110.0
- uvicorn: 0.27.0
- sqlalchemy: 2.0.25

**Database:**
- psycopg2-binary: 2.9.9
- alembic: 1.13.0

**Security:**
- python-jose: 3.3.0
- passlib: 1.7.4
- bcrypt: 4.1.0

---

## 🌐 API Routes

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/me`

### Projects
- GET `/api/projects`
- POST `/api/projects`
- GET `/api/projects/{id}`
- PUT `/api/projects/{id}`
- DELETE `/api/projects/{id}`

### Tasks
- GET `/api/tasks`
- POST `/api/tasks`
- GET `/api/tasks/{id}`
- PUT `/api/tasks/{id}`
- DELETE `/api/tasks/{id}`

### AI Risk Prediction
- GET `/api/risks/predict/{project_id}`
- GET `/api/risks/projects/{project_id}`

### Dashboard
- GET `/api/dashboard/stats`
- GET `/api/dashboard/charts`

---

## 🗄️ Database Tables

1. **roles** - User roles (Admin, Manager, Employee)
2. **departments** - Organizational departments
3. **users** - User accounts and profiles
4. **projects** - Project management
5. **tasks** - Task tracking
6. **assets** - Asset inventory
7. **asset_allocations** - Asset assignments
8. **risk_predictions** - AI risk assessments
9. **notifications** - User notifications
10. **activity_logs** - Audit trail

---

## 🎨 UI Components Hierarchy

```
App
└── MainLayout
    ├── Sidebar
    │   └── Navigation Links
    ├── Header
    │   ├── SearchBar
    │   ├── Notifications
    │   └── UserMenu
    └── Content Area
        └── Page Component
            ├── Dashboard
            │   ├── StatCards
            │   ├── Charts
            │   └── Tables
            ├── Projects
            │   ├── ProjectTable
            │   └── ProjectForm
            └── Tasks
                ├── TaskTable
                └── TaskForm
```

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- SQL injection protection
- XSS prevention
- CORS configuration
- Input validation

---

## 📈 Scalability Considerations

- Modular architecture
- Service layer separation
- Database indexing
- API pagination
- Component lazy loading
- Code splitting
- Caching strategies

---

## 🧪 Testing Structure

```
tests/
├── Unit Tests
│   ├── Model tests
│   ├── Service tests
│   └── Utility tests
├── Integration Tests
│   └── API endpoint tests
└── E2E Tests (Future)
    └── User flow tests
```

---

## 📝 Documentation Structure

```
docs/
├── frontend-guide.md      # Frontend development
├── backend-guide.md       # Backend development
├── database-schema.md     # Database design
├── api-documentation.md   # API reference
├── deployment-guide.md    # Deployment steps
├── security-guide.md      # Security practices
└── user-manual.md         # End-user guide
```

---

**Total Lines of Code:** ~15,000+ lines  
**Total Documentation:** 5,000+ lines  
**Architecture:** Modular, Scalable, Production-Ready

---

This structure supports:
- ✅ Easy navigation
- ✅ Clear separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Testing
- ✅ Documentation

**Last Updated:** July 31, 2026
