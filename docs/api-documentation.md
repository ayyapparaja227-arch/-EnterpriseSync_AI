# API Documentation

## 🔌 EnterpriseSync AI - REST API Reference

**Base URL:** `http://localhost:8000` (Development)  
**Production URL:** `https://api.enterprisesync.ai`

**API Version:** v1  
**Format:** JSON

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Departments](#departments)
4. [Projects](#projects)
5. [Tasks](#tasks)
6. [Assets](#assets)
7. [Risk Predictions](#risk-predictions)
8. [Notifications](#notifications)
9. [Dashboard](#dashboard)
10. [Activity Logs](#activity-logs)
11. [Error Handling](#error-handling)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@enterprisesync.ai",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": 1,
    "name": "Admin User",
    "email": "admin@enterprisesync.ai",
    "role": {
      "role_id": 1,
      "role_name": "admin"
    },
    "department": {
      "department_id": 1,
      "department_name": "Engineering"
    }
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

---

### POST /api/auth/register

Register a new user (Admin only).

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@enterprisesync.ai",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role_id": 3,
  "department_id": 1
}
```

**Response (201 Created):**
```json
{
  "user_id": 10,
  "name": "New User",
  "email": "newuser@enterprisesync.ai",
  "role_id": 3,
  "department_id": 1,
  "status": "active",
  "created_at": "2026-07-31T10:30:00Z"
}
```

---

### GET /api/auth/me

Get current authenticated user details.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "user_id": 1,
  "name": "Admin User",
  "email": "admin@enterprisesync.ai",
  "role": "admin",
  "department": "Engineering",
  "status": "active"
}
```

---

## 👥 Users

### GET /api/users

Get all users (Admin/Manager only).

**Query Parameters:**
- `role` (optional) - Filter by role (admin, manager, employee)
- `department_id` (optional) - Filter by department
- `status` (optional) - Filter by status (active, inactive)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50)

**Response (200 OK):**
```json
{
  "total": 50,
  "page": 1,
  "limit": 50,
  "users": [
    {
      "user_id": 1,
      "name": "Admin User",
      "email": "admin@enterprisesync.ai",
      "phone": "+1234567890",
      "role": {
        "role_id": 1,
        "role_name": "admin"
      },
      "department": {
        "department_id": 1,
        "department_name": "Engineering"
      },
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

### GET /api/users/{user_id}

Get user by ID.

**Response (200 OK):**
```json
{
  "user_id": 1,
  "name": "Admin User",
  "email": "admin@enterprisesync.ai",
  "phone": "+1234567890",
  "role": "admin",
  "department": "Engineering",
  "status": "active",
  "projects_count": 5,
  "tasks_count": 12
}
```

**Errors:**
- `404 Not Found` - User not found
- `403 Forbidden` - Insufficient permissions

---

### PUT /api/users/{user_id}

Update user information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+9876543210",
  "department_id": 2
}
```

**Response (200 OK):**
```json
{
  "user_id": 1,
  "name": "Updated Name",
  "email": "admin@enterprisesync.ai",
  "phone": "+9876543210",
  "department_id": 2,
  "status": "active"
}
```

---

### DELETE /api/users/{user_id}

Delete user (Admin only).

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 🏢 Departments

### GET /api/departments

Get all departments.

**Response (200 OK):**
```json
[
  {
    "department_id": 1,
    "department_name": "Engineering",
    "location": "Building A, Floor 3",
    "employee_count": 25
  }
]
```

---

### POST /api/departments

Create new department (Admin only).

**Request Body:**
```json
{
  "department_name": "Sales",
  "location": "Building C, Floor 1"
}
```

**Response (201 Created):**
```json
{
  "department_id": 4,
  "department_name": "Sales",
  "location": "Building C, Floor 1"
}
```

---

## 📊 Projects

### GET /api/projects

Get all projects (filtered by user role).

**Query Parameters:**
- `status` (optional) - Filter by status
- `priority` (optional) - Filter by priority
- `manager_id` (optional) - Filter by manager

**Response (200 OK):**
```json
[
  {
    "project_id": 1,
    "project_name": "Website Redesign",
    "description": "Complete redesign of company website",
    "manager": {
      "user_id": 2,
      "name": "John Manager"
    },
    "start_date": "2026-07-01",
    "end_date": "2026-09-30",
    "priority": "high",
    "completion_percentage": 65.5,
    "status": "active",
    "tasks_count": 15,
    "pending_tasks": 5
  }
]
```

---

### POST /api/projects

Create new project (Admin/Manager only).

**Request Body:**
```json
{
  "project_name": "Mobile App Development",
  "description": "Develop iOS and Android mobile app",
  "manager_id": 2,
  "start_date": "2026-08-01",
  "end_date": "2026-12-31",
  "priority": "high"
}
```

**Response (201 Created):**
```json
{
  "project_id": 10,
  "project_name": "Mobile App Development",
  "manager_id": 2,
  "start_date": "2026-08-01",
  "end_date": "2026-12-31",
  "priority": "high",
  "completion_percentage": 0,
  "status": "active"
}
```

---

### GET /api/projects/{project_id}

Get project details.

**Response (200 OK):**
```json
{
  "project_id": 1,
  "project_name": "Website Redesign",
  "description": "Complete redesign of company website",
  "manager": {
    "user_id": 2,
    "name": "John Manager",
    "email": "john@enterprisesync.ai"
  },
  "start_date": "2026-07-01",
  "end_date": "2026-09-30",
  "priority": "high",
  "completion_percentage": 65.5,
  "status": "active",
  "tasks": [
    {
      "task_id": 1,
      "title": "Design mockups",
      "status": "completed"
    }
  ],
  "team_members": [
    {
      "user_id": 3,
      "name": "Jane Employee"
    }
  ]
}
```

---

### PUT /api/projects/{project_id}

Update project.

**Request Body:**
```json
{
  "completion_percentage": 75.0,
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "project_id": 1,
  "completion_percentage": 75.0,
  "status": "active"
}
```

---

### DELETE /api/projects/{project_id}

Delete project (Admin only).

**Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

---

## ✅ Tasks

### GET /api/tasks

Get all tasks (filtered by user).

**Query Parameters:**
- `project_id` (optional) - Filter by project
- `assigned_to` (optional) - Filter by assigned user
- `status` (optional) - Filter by status
- `priority` (optional) - Filter by priority

**Response (200 OK):**
```json
[
  {
    "task_id": 1,
    "project": {
      "project_id": 1,
      "project_name": "Website Redesign"
    },
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockup for homepage",
    "assigned_to": {
      "user_id": 3,
      "name": "Jane Employee"
    },
    "priority": "high",
    "deadline": "2026-08-15",
    "status": "in_progress"
  }
]
```

---

### POST /api/tasks

Create new task.

**Request Body:**
```json
{
  "project_id": 1,
  "title": "Implement authentication",
  "description": "Add JWT-based authentication",
  "assigned_to": 3,
  "priority": "high",
  "deadline": "2026-08-20"
}
```

**Response (201 Created):**
```json
{
  "task_id": 25,
  "project_id": 1,
  "title": "Implement authentication",
  "assigned_to": 3,
  "priority": "high",
  "deadline": "2026-08-20",
  "status": "todo"
}
```

---

### PUT /api/tasks/{task_id}

Update task.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "task_id": 1,
  "status": "completed",
  "updated_at": "2026-07-31T15:30:00Z"
}
```

---

## 🔧 Assets

### GET /api/assets

Get all assets.

**Query Parameters:**
- `status` (optional) - Filter by status
- `asset_type` (optional) - Filter by type

**Response (200 OK):**
```json
[
  {
    "asset_id": 1,
    "asset_name": "MacBook Pro 16",
    "asset_type": "Laptop",
    "serial_number": "MBP16-2023-001",
    "purchase_date": "2023-06-15",
    "status": "assigned",
    "current_holder": {
      "user_id": 3,
      "name": "Jane Employee"
    }
  }
]
```

---

### POST /api/assets

Create new asset (Admin only).

**Request Body:**
```json
{
  "asset_name": "Dell Monitor 27",
  "asset_type": "Monitor",
  "serial_number": "DM27-2023-050",
  "purchase_date": "2023-07-20"
}
```

**Response (201 Created):**
```json
{
  "asset_id": 50,
  "asset_name": "Dell Monitor 27",
  "asset_type": "Monitor",
  "serial_number": "DM27-2023-050",
  "status": "available"
}
```

---

### POST /api/assets/allocate

Allocate asset to user.

**Request Body:**
```json
{
  "asset_id": 1,
  "user_id": 3,
  "assigned_date": "2026-07-31"
}
```

**Response (200 OK):**
```json
{
  "allocation_id": 10,
  "asset_id": 1,
  "user_id": 3,
  "assigned_date": "2026-07-31",
  "status": "active"
}
```

---

### POST /api/assets/return

Return allocated asset.

**Request Body:**
```json
{
  "allocation_id": 10,
  "returned_date": "2026-07-31"
}
```

**Response (200 OK):**
```json
{
  "allocation_id": 10,
  "status": "returned",
  "returned_date": "2026-07-31"
}
```

---

## 🤖 Risk Predictions

### GET /api/risks/predict/{project_id}

Generate AI risk prediction for project.

**Response (200 OK):**
```json
{
  "risk_id": 5,
  "project_id": 1,
  "risk_score": 72.5,
  "risk_level": "high",
  "predicted_delay_days": 8,
  "generated_at": "2026-07-31T16:00:00Z",
  "recommendations": [
    "🚨 Critical: Immediate action required",
    "Consider increasing team size",
    "Request deadline extension"
  ],
  "factors": {
    "pending_tasks": 12,
    "remaining_days": 30,
    "completion_percentage": 45.0
  }
}
```

---

### GET /api/risks/projects/{project_id}

Get all risk predictions for a project.

**Response (200 OK):**
```json
[
  {
    "risk_id": 1,
    "risk_score": 45.2,
    "risk_level": "medium",
    "generated_at": "2026-07-20T10:00:00Z"
  },
  {
    "risk_id": 5,
    "risk_score": 72.5,
    "risk_level": "high",
    "generated_at": "2026-07-31T16:00:00Z"
  }
]
```

---

## 🔔 Notifications

### GET /api/notifications

Get user notifications.

**Query Parameters:**
- `is_read` (optional) - Filter by read status (true/false)
- `type` (optional) - Filter by notification type

**Response (200 OK):**
```json
[
  {
    "notification_id": 1,
    "message": "Task 'Design homepage' deadline is tomorrow",
    "type": "deadline",
    "is_read": false,
    "created_at": "2026-07-31T14:00:00Z"
  }
]
```

---

### PUT /api/notifications/{notification_id}/read

Mark notification as read.

**Response (200 OK):**
```json
{
  "notification_id": 1,
  "is_read": true
}
```

---

### PUT /api/notifications/read-all

Mark all notifications as read.

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

## 📈 Dashboard

### GET /api/dashboard/stats

Get dashboard statistics.

**Response (200 OK):**
```json
{
  "total_projects": 25,
  "active_projects": 18,
  "completed_projects": 7,
  "delayed_projects": 3,
  "total_employees": 50,
  "active_employees": 48,
  "total_departments": 5,
  "total_assets": 120,
  "available_assets": 35,
  "todays_tasks": 15,
  "pending_tasks": 48,
  "completed_tasks": 152,
  "average_risk_score": 45.2,
  "high_risk_projects": 3
}
```

---

### GET /api/dashboard/charts

Get chart data for dashboard.

**Response (200 OK):**
```json
{
  "project_status": [
    { "name": "Active", "value": 18 },
    { "name": "Completed", "value": 7 },
    { "name": "On Hold", "value": 2 }
  ],
  "employee_workload": [
    { "name": "John Doe", "tasks": 8 },
    { "name": "Jane Smith", "tasks": 12 }
  ],
  "department_performance": [
    { "name": "Engineering", "completion": 75 },
    { "name": "Marketing", "completion": 82 }
  ],
  "risk_trend": [
    { "date": "2026-07-24", "score": 42 },
    { "date": "2026-07-31", "score": 45 }
  ]
}
```

---

## 📝 Activity Logs

### GET /api/activity-logs

Get activity logs (Admin only).

**Query Parameters:**
- `user_id` (optional) - Filter by user
- `start_date` (optional) - Filter from date
- `end_date` (optional) - Filter to date

**Response (200 OK):**
```json
[
  {
    "log_id": 1,
    "user": {
      "user_id": 1,
      "name": "Admin User"
    },
    "activity": "Created project 'Website Redesign'",
    "created_at": "2026-07-31T09:30:00Z"
  }
]
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "detail": "Error message description",
  "status_code": 400
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### Common Error Examples

**401 Unauthorized:**
```json
{
  "detail": "Invalid authentication credentials",
  "status_code": 401
}
```

**403 Forbidden:**
```json
{
  "detail": "Insufficient permissions to perform this action",
  "status_code": 403
}
```

**404 Not Found:**
```json
{
  "detail": "Project with ID 999 not found",
  "status_code": 404
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 🔄 Rate Limiting

- **Limit:** 100 requests per minute per user
- **Header:** `X-RateLimit-Remaining` shows remaining requests

---

## 📚 Interactive Documentation

Access interactive API documentation:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

**API Version:** 1.0.0  
**Last Updated:** July 31, 2026
