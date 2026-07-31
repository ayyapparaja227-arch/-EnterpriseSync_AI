from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# Auth
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# Users & Roles
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role_id: int
    department_id: Optional[int] = None
    manager_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    role_id: Optional[int] = None
    manager_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    role_name: str
    department_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Projects
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: str = "medium"
    manager_id: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    completion_percentage: Optional[float] = None
    end_date: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    manager_id: int
    manager_name: Optional[str] = None
    status: str
    priority: str
    completion_percentage: float
    start_date: Optional[str]
    end_date: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Tasks
class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    assigned_to: Optional[int] = None
    due_date: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    project_id: int
    project_name: Optional[str] = None
    assigned_to: Optional[int]
    assignee_name: Optional[str] = None
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Assets
class AssetCreate(BaseModel):
    name: str
    type: str
    status: str = "available"
    assigned_to: Optional[int] = None

class AssetResponse(BaseModel):
    id: int
    name: str
    type: str
    status: str
    assigned_to: Optional[int]
    assigned_user_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Leave Requests
class LeaveCreate(BaseModel):
    start_date: str
    end_date: str
    reason: str

class LeaveStatusUpdate(BaseModel):
    status: str # approved, rejected

class LeaveResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    start_date: str
    end_date: str
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Attendance
class AttendanceCheckIn(BaseModel):
    status: str = "present"

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    date: str
    status: str
    check_in_time: Optional[str]
    check_out_time: Optional[str]

    class Config:
        from_attributes = True

# Performance
class PerformanceCreate(BaseModel):
    user_id: int
    rating: float
    review: str

# Workload re-balance request
class TaskReallocateRequest(BaseModel):
    from_user_id: int
    to_user_id: int
    task_count: int = 2
    project_id: Optional[int] = None
