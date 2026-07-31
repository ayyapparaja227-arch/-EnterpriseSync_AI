from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True) # employee, hr, manager, admin
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="role")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=True)

    users = relationship("User", foreign_keys="[User.department_id]", back_populates="department")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    department = relationship("Department", foreign_keys=[department_id], back_populates="users")
    manager = relationship("User", remote_side=[id])
    
    assigned_tasks = relationship("Task", back_populates="assignee")
    managed_projects = relationship("Project", back_populates="manager")
    assets = relationship("Asset", back_populates="assigned_user")
    attendance_records = relationship("Attendance", back_populates="user")
    leave_requests = relationship("LeaveRequest", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")
    performances = relationship("Performance", foreign_keys="[Performance.user_id]", back_populates="user")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(30), default="active") # active, completed, on_hold
    priority = Column(String(20), default="medium") # low, medium, high, critical
    completion_percentage = Column(Float, default=0.0)
    start_date = Column(String(30), nullable=True)
    end_date = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    manager = relationship("User", back_populates="managed_projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), default="todo") # todo, in_progress, completed, blocked
    priority = Column(String(20), default="medium") # low, medium, high, critical
    due_date = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False) # Laptop, Monitor, Phone, Server, Software License
    status = Column(String(30), default="available") # allocated, available, under_maintenance
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assigned_user = relationship("User", back_populates="assets")
    allocations = relationship("AssetAllocation", back_populates="asset")

class AssetAllocation(Base):
    __tablename__ = "asset_allocations"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allocation_date = Column(String(30), nullable=False)
    return_date = Column(String(30), nullable=True)

    asset = relationship("Asset", back_populates="allocations")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(30), nullable=False)
    status = Column(String(30), default="present") # present, absent, late, half_day
    check_in_time = Column(String(30), nullable=True)
    check_out_time = Column(String(30), nullable=True)

    user = relationship("User", back_populates="attendance_records")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(String(30), nullable=False)
    end_date = Column(String(30), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="pending") # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="leave_requests")

class Performance(Base):
    __tablename__ = "performance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False) # 1.0 - 5.0
    review = Column(Text, nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    review_date = Column(String(30), nullable=False)

    user = relationship("User", foreign_keys=[user_id], back_populates="performances")
    reviewer = relationship("User", foreign_keys=[reviewer_id])

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    risk_level = Column(String(30), nullable=False) # low, medium, high, critical
    risk_factors = Column(JSON, nullable=True)
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="risk_predictions")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info") # info, deadline, risk_alert, assignment
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(100), nullable=False) # hr_performance, project_risk, asset_utilization, executive_summary
    data = Column(JSON, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
