# EnterpriseSync AI

**One Platform. One Team. Smarter Enterprise.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)

## 🚀 Overview

EnterpriseSync AI is a centralized, AI-powered enterprise management system that enables organizations to manage Projects, Employees, Departments, Assets, Tasks, and leverage AI-driven Risk Prediction with comprehensive Analytics and Role-Based Access Control—all from one unified platform.

Built with modern enterprise standards similar to **Jira**, **Monday.com**, **Zoho Projects**, **ClickUp**, and **Microsoft Project**.

---

## ✨ Key Features

### 🎯 Core Modules
- **Project Management** - Create, track, and manage projects with real-time progress monitoring
- **Task Management** - Assign tasks, set priorities, track deadlines and status
- **Employee Management** - Manage workforce, departments, workload, and availability
- **Department Management** - Organize teams and track department performance
- **Asset Management** - Track, allocate, and maintain company assets
- **AI Risk Prediction** - Machine learning-powered risk assessment and recommendations
- **Analytics & Reports** - Comprehensive dashboards with interactive charts
- **Notifications** - Real-time alerts for deadlines, assignments, and risks
- **Activity Logs** - Complete audit trail of all system activities

### 🔐 Role-Based Access Control
- **Admin** - Full system access, user management, analytics
- **Manager** - Project creation, team assignment, progress tracking
- **Employee** - Task management, profile updates, notifications

### 🤖 AI Capabilities
- Risk score calculation based on project metrics
- Delay prediction using completion percentage and timeline
- Intelligent recommendations for resource allocation
- Automated risk alerts and warnings

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization
- **React Hook Form** - Form management

### Backend
- **Python 3.11+** - Modern Python
- **FastAPI** - High-performance async framework
- **SQLAlchemy** - Powerful ORM
- **Pydantic** - Data validation
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **PostgreSQL** - Robust relational database

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon PostgreSQL

---

## 📁 Project Structure

```
EnterpriseSync-AI/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # Layout components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── database/        # Database configuration
│   │   ├── auth/            # Authentication
│   │   └── utils/           # Utility functions
│   ├── main.py              # FastAPI application
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                    # Documentation
├── README.md
└── .gitignore
```

---

## 🗄️ Database Schema

### Core Tables

**Roles**
- `role_id` (PK)
- `role_name` (Admin, Manager, Employee)

**Departments**
- `department_id` (PK)
- `department_name`
- `location`

**Users**
- `user_id` (PK)
- `name`, `email`, `password`, `phone`
- `role_id` (FK → Roles)
- `department_id` (FK → Departments)
- `status`, `created_at`

**Projects**
- `project_id` (PK)
- `manager_id` (FK → Users)
- `project_name`, `description`
- `start_date`, `end_date`
- `priority`, `completion_percentage`, `status`

**Tasks**
- `task_id` (PK)
- `project_id` (FK → Projects)
- `assigned_to` (FK → Users)
- `title`, `description`
- `priority`, `deadline`, `status`

**Assets**
- `asset_id` (PK)
- `asset_name`, `asset_type`
- `serial_number`, `purchase_date`, `status`

**Asset_Allocations**
- `allocation_id` (PK)
- `asset_id` (FK → Assets)
- `user_id` (FK → Users)
- `assigned_date`, `returned_date`, `status`

**Risk_Predictions**
- `risk_id` (PK)
- `project_id` (FK → Projects)
- `risk_score`, `risk_level`
- `predicted_delay_days`, `generated_at`

**Notifications**
- `notification_id` (PK)
- `user_id` (FK → Users)
- `message`, `type`, `is_read`, `created_at`

**Activity_Logs**
- `log_id` (PK)
- `user_id` (FK → Users)
- `activity`, `created_at`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- PostgreSQL 14+

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Access at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE enterprisesync_ai;
```

2. Update `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost/enterprisesync_ai
SECRET_KEY=your-secret-key-here
```

3. Run migrations (auto-created on first run)

---

## 🎨 UI/UX Design

### Color Theme
- **Primary**: `#2563EB` (Blue)
- **Background**: `#F8FAFC` (Light Gray)
- **Sidebar**: Dark Blue
- **Cards**: White with rounded corners and shadows

### Design Principles
- Modern enterprise aesthetics
- Glassmorphism effects
- Smooth animations and hover effects
- Responsive design for all devices
- Professional typography
- Dark/Light theme support

---

## 📊 Dashboard Features

### Metrics Cards
- Total Projects
- Completed Projects
- Delayed Projects
- Active Employees
- Total Departments
- Asset Count
- Today's Tasks
- AI Risk Score

### Charts & Visualizations
- Project Status Pie Chart
- Employee Workload Bar Chart
- Department Performance
- Risk Trend Line Chart
- Recent Activities Timeline
- Upcoming Deadlines

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create asset
- `POST /api/assets/allocate` - Allocate asset
- `POST /api/assets/return` - Return asset

### AI Risk Prediction
- `GET /api/risks/predict/{project_id}` - Generate risk prediction
- `GET /api/risks/projects/{project_id}` - Get project risks

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data

---

## 🤖 AI Risk Prediction Engine

### Input Parameters
- Completion Percentage
- Remaining Days
- Pending Tasks Count
- Resources Allocated

### Output
- **Risk Score** (0-100)
- **Risk Level** (Low, Medium, High)
- **Predicted Delay** (in days)
- **Recommendations**:
  - Increase team size
  - Extend deadline
  - Reduce workload
  - Reallocate resources

### Risk Calculation
```
Risk Score = (Pending Tasks Weight × 0.4) + 
             (Time Pressure Weight × 0.4) + 
             (Completion Gap Weight × 0.2)

Risk Level:
- Low: Score < 40
- Medium: Score 40-70
- High: Score > 70
```

---

## 🔔 Notification Types

- **Deadline Alerts** - Task/Project deadlines approaching
- **Task Assigned** - New task assignment notifications
- **Project Completed** - Project completion updates
- **High Risk Warning** - AI-detected high-risk projects
- **Asset Assigned** - Asset allocation notifications
- **Status Changes** - Project/Task status updates

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation with Pydantic
- SQL injection protection
- CORS configuration
- Secure session management

---

## 📈 Performance Optimization

- Database indexing on foreign keys
- Query optimization with SQLAlchemy
- Frontend code splitting
- Lazy loading of components
- API response caching
- Debounced search inputs
- Paginated API responses

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway)
1. Connect GitHub repository
2. Add environment variables
3. Deploy from `main` branch

### Database (Neon PostgreSQL)
1. Create Neon project
2. Copy connection string
3. Update backend `.env`

---

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=EnterpriseSync AI
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🧪 Testing

### Frontend
```bash
npm run test
npm run test:coverage
```

### Backend
```bash
pytest
pytest --cov=app tests/
```

---

## 📚 Documentation

- [API Documentation](http://localhost:8000/docs) - Interactive Swagger UI
- [Database Schema](./docs/database-schema.md)
- [Frontend Guide](./docs/frontend-guide.md)
- [Backend Guide](./docs/backend-guide.md)
- [Deployment Guide](./docs/deployment-guide.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ by Enterprise Development Team

---

## 📞 Support

- Email: support@enterprisesync.ai
- Documentation: https://docs.enterprisesync.ai
- Issues: https://github.com/enterprisesync/issues

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI analytics
- [ ] Integration with Slack/Teams
- [ ] Calendar sync
- [ ] Time tracking module
- [ ] Invoice generation
- [ ] Advanced reporting

---

**Made with modern technology and enterprise-grade architecture** 🚀
