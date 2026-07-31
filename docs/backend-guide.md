# Backend Development Guide

## ⚙️ EnterpriseSync AI - Backend Documentation

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Database Models](#database-models)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Business Logic](#business-logic)
7. [AI Risk Prediction](#ai-risk-prediction)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Testing](#testing)

---

## 🏗️ Architecture Overview

The backend follows a **layered architecture** with clear separation between API routes, business logic, and data access.

### Technology Stack
- **FastAPI** - Modern async web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation using Python type hints
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Uvicorn** - ASGI server

### Architecture Layers
```
┌─────────────────────────────────────┐
│      API Layer (FastAPI Routes)     │
├─────────────────────────────────────┤
│      Service Layer (Business Logic) │
├─────────────────────────────────────┤
│      Data Layer (SQLAlchemy Models) │
├─────────────────────────────────────┤
│      Database (PostgreSQL)          │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── users.py           # User CRUD endpoints
│   │   ├── projects.py        # Project endpoints
│   │   ├── tasks.py           # Task endpoints
│   │   ├── departments.py     # Department endpoints
│   │   ├── assets.py          # Asset endpoints
│   │   ├── notifications.py   # Notification endpoints
│   │   ├── dashboard.py       # Dashboard data endpoints
│   │   └── risks.py           # AI Risk prediction endpoints
│   │
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── role.py
│   │   ├── department.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── asset.py
│   │   ├── asset_allocation.py
│   │   ├── risk_prediction.py
│   │   ├── notification.py
│   │   └── activity_log.py
│   │
│   ├── schemas/               # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── department.py
│   │   ├── asset.py
│   │   ├── notification.py
│   │   └── risk.py
│   │
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── project_service.py
│   │   ├── task_service.py
│   │   ├── asset_service.py
│   │   ├── notification_service.py
│   │   └── risk_service.py
│   │
│   ├── database/              # Database configuration
│   │   ├── __init__.py
│   │   ├── connection.py     # Database connection
│   │   └── session.py        # Session management
│   │
│   ├── auth/                  # Authentication utilities
│   │   ├── __init__.py
│   │   ├── jwt.py            # JWT token handling
│   │   ├── password.py       # Password hashing
│   │   └── dependencies.py   # Auth dependencies
│   │
│   └── utils/                 # Utility functions
│       ├── __init__.py
│       ├── validators.py
│       ├── helpers.py
│       └── constants.py
│
├── tests/                     # Test files
│   ├── test_auth.py
│   ├── test_projects.py
│   └── test_tasks.py
│
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
├── .gitignore
└── README.md
```

---

## 🗄️ Database Models

### Role Model
```python
# app/models/role.py
from sqlalchemy import Column, Integer, String
from app.database.connection import Base

class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)
    
    # Relationship
    users = relationship("User", back_populates="role")
```

### User Model
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id"))
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="users")
    department = relationship("Department", back_populates="users")
    managed_projects = relationship("Project", back_populates="manager")
    tasks = relationship("Task", back_populates="assigned_user")
    notifications = relationship("Notification", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
```

### Project Model
```python
# app/models/project.py
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    project_name = Column(String(200), nullable=False)
    description = Column(String(1000))
    start_date = Column(Date)
    end_date = Column(Date)
    priority = Column(String(20), default="medium")
    completion_percentage = Column(Float, default=0.0)
    status = Column(String(20), default="active")

    # Relationships
    manager = relationship("User", back_populates="managed_projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="project")
```

### Task Model
```python
# app/models/task.py
from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String(200), nullable=False)
    description = Column(String(1000))
    priority = Column(String(20), default="medium")
    deadline = Column(Date)
    status = Column(String(20), default="todo")

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")
```

### Asset Model
```python
# app/models/asset.py
from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Asset(Base):
    __tablename__ = "assets"

    asset_id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String(200), nullable=False)
    asset_type = Column(String(100))
    serial_number = Column(String(100), unique=True)
    purchase_date = Column(Date)
    status = Column(String(20), default="available")

    # Relationships
    allocations = relationship("AssetAllocation", back_populates="asset")
```

### Risk Prediction Model
```python
# app/models/risk_prediction.py
from sqlalchemy import Column, Integer, ForeignKey, Float, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    risk_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    predicted_delay_days = Column(Integer, default=0)
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="risk_predictions")
```

---

## 🔌 API Endpoints

### Authentication Endpoints

```python
# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest
from app.services.auth_service import AuthService
from app.database.session import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token
    """
    service = AuthService(db)
    return service.login(request.email, request.password)

@router.post("/register", response_model=LoginResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register new user
    """
    service = AuthService(db)
    return service.register(request)

@router.get("/me")
async def get_current_user(current_user = Depends(get_current_active_user)):
    """
    Get current authenticated user
    """
    return current_user
```

### Project Endpoints

```python
# app/api/projects.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import ProjectService
from app.database.session import get_db
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("/", response_model=List[ProjectResponse])
async def get_all_projects(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all projects (filtered by role)
    """
    service = ProjectService(db)
    return service.get_all_projects(current_user)

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create new project (Admin/Manager only)
    """
    service = ProjectService(db)
    return service.create_project(project, current_user)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get project by ID
    """
    service = ProjectService(db)
    return service.get_project_by_id(project_id, current_user)

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update project
    """
    service = ProjectService(db)
    return service.update_project(project_id, project, current_user)

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete project (Admin only)
    """
    service = ProjectService(db)
    return service.delete_project(project_id, current_user)
```

---

## 🔐 Authentication & Authorization

### JWT Token Generation

```python
# app/auth/jwt.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.utils.constants import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(data: dict):
    """
    Create JWT access token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """
    Verify and decode JWT token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

### Password Hashing

```python
# app/auth/password.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash password using bcrypt
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash
    """
    return pwd_context.verify(plain_password, hashed_password)
```

### Auth Dependencies

```python
# app/auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.auth.jwt import verify_token
from app.database.session import get_db
from app.models.user import User

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user from JWT token
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def require_role(allowed_roles: list):
    """
    Dependency to check user role
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker
```

---

## 💼 Business Logic

### Project Service

```python
# app/services/project_service.py
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from fastapi import HTTPException, status

class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_projects(self, current_user):
        """
        Get all projects based on user role
        """
        if current_user.role.role_name == "admin":
            return self.db.query(Project).all()
        elif current_user.role.role_name == "manager":
            return self.db.query(Project).filter(
                Project.manager_id == current_user.user_id
            ).all()
        else:
            # Get projects where user has tasks
            return self.db.query(Project).join(Task).filter(
                Task.assigned_to == current_user.user_id
            ).distinct().all()

    def create_project(self, project: ProjectCreate, current_user):
        """
        Create new project
        """
        if current_user.role.role_name not in ["admin", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins and managers can create projects"
            )

        db_project = Project(**project.dict())
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project

    def update_project(self, project_id: int, project: ProjectUpdate, current_user):
        """
        Update project
        """
        db_project = self.db.query(Project).filter(
            Project.project_id == project_id
        ).first()

        if not db_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check permissions
        if current_user.role.role_name not in ["admin"] and \
           db_project.manager_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own projects"
            )

        for key, value in project.dict(exclude_unset=True).items():
            setattr(db_project, key, value)

        self.db.commit()
        self.db.refresh(db_project)
        return db_project
```

---

## 🤖 AI Risk Prediction

### Risk Prediction Algorithm

```python
# app/services/risk_service.py
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.task import Task
from app.models.risk_prediction import RiskPrediction
from datetime import datetime, date

class RiskService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_risk_score(self, project_id: int):
        """
        Calculate AI-based risk score for a project
        """
        project = self.db.query(Project).filter(
            Project.project_id == project_id
        ).first()

        if not project:
            raise ValueError("Project not found")

        # Get project metrics
        total_tasks = self.db.query(Task).filter(
            Task.project_id == project_id
        ).count()

        pending_tasks = self.db.query(Task).filter(
            Task.project_id == project_id,
            Task.status.in_(["todo", "in_progress"])
        ).count()

        completion_percentage = project.completion_percentage or 0

        # Calculate remaining days
        if project.end_date:
            remaining_days = (project.end_date - date.today()).days
        else:
            remaining_days = 30  # Default

        # Risk calculation formula
        # Factors: pending tasks, time pressure, completion gap
        
        # Pending tasks weight (0-100)
        task_risk = (pending_tasks / max(total_tasks, 1)) * 100

        # Time pressure weight (0-100)
        time_risk = max(0, 100 - (remaining_days * 2))

        # Completion gap weight (0-100)
        expected_completion = 100 - (remaining_days * 2)
        completion_gap = max(0, expected_completion - completion_percentage)

        # Weighted risk score
        risk_score = (
            task_risk * 0.4 +
            time_risk * 0.4 +
            completion_gap * 0.2
        )

        # Determine risk level
        if risk_score < 40:
            risk_level = "low"
            predicted_delay = 0
        elif risk_score < 70:
            risk_level = "medium"
            predicted_delay = int((risk_score - 40) / 3)
        else:
            risk_level = "high"
            predicted_delay = int((risk_score - 70) / 2) + 10

        # Save prediction
        prediction = RiskPrediction(
            project_id=project_id,
            risk_score=round(risk_score, 2),
            risk_level=risk_level,
            predicted_delay_days=predicted_delay
        )

        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)

        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "predicted_delay_days": predicted_delay,
            "recommendations": self.get_recommendations(risk_level, pending_tasks, remaining_days)
        }

    def get_recommendations(self, risk_level: str, pending_tasks: int, remaining_days: int):
        """
        Generate AI recommendations based on risk level
        """
        recommendations = []

        if risk_level == "high":
            recommendations.append("🚨 Critical: Immediate action required")
            if pending_tasks > 10:
                recommendations.append("Consider increasing team size")
            if remaining_days < 7:
                recommendations.append("Request deadline extension")
            recommendations.append("Prioritize critical tasks only")
        
        elif risk_level == "medium":
            recommendations.append("⚠️ Moderate risk detected")
            recommendations.append("Monitor progress closely")
            recommendations.append("Consider reallocating resources")
        
        else:
            recommendations.append("✅ Project on track")
            recommendations.append("Maintain current pace")

        return recommendations
```

---

## 🛡️ Error Handling

```python
# app/utils/exceptions.py
from fastapi import HTTPException, status

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
```

---

## ✅ Best Practices

1. **Use Pydantic schemas** for request/response validation
2. **Implement service layer** for business logic
3. **Use dependency injection** for database sessions
4. **Handle errors properly** with appropriate HTTP status codes
5. **Use type hints** throughout the codebase
6. **Log important operations** for debugging
7. **Use database transactions** for data integrity
8. **Validate user permissions** in service layer
9. **Use environment variables** for configuration
10. **Write comprehensive API documentation**

---

## 🧪 Testing

```python
# tests/test_projects.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_project():
    response = client.post(
        "/api/projects/",
        json={
            "project_name": "Test Project",
            "description": "Test Description",
            "priority": "high"
        },
        headers={"Authorization": "Bearer test_token"}
    )
    assert response.status_code == 200
    assert response.json()["project_name"] == "Test Project"
```

---

**Happy Coding! 🚀**
