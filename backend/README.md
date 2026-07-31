# EnterpriseSync AI - Backend

FastAPI backend with mock data for demo purposes.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

## Access

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Test Login Credentials

```
Admin:
Email: admin@enterprisesync.ai
Password: admin123

Manager:
Email: john@enterprisesync.ai
Password: manager123

Employee:
Email: jane@enterprisesync.ai
Password: employee123
```

## API Endpoints

- POST /api/auth/login - User login
- GET /api/dashboard/stats - Dashboard statistics
- GET /api/dashboard/charts - Chart data
- GET /api/projects - All projects
- GET /api/tasks - All tasks
- GET /api/users - All users
- GET /api/departments - All departments
- GET /api/risks/predict/{project_id} - Risk prediction
- GET /api/notifications - User notifications
