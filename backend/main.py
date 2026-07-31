"""
EnterpriseSync AI - FastAPI Backend Engine
Production-ready API with RBAC, SQLAlchemy ORM, and AI Decision Support Engine.
"""

from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

import models
import schemas
from database import engine, get_db, Base
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role
)
import ai_engine
from seed import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

# Auto-seed database if empty
def ensure_seeded():
    db = next(get_db())
    try:
        if db.query(models.User).count() == 0:
            print("🚀 Empty database detected. Running seed script...")
            seed_database()
    except Exception as e:
        print(f"Seed check note: {e}")
    finally:
        db.close()

ensure_seeded()

app = FastAPI(
    title="EnterpriseSync AI Platform API",
    description="Enterprise Employee Operations Platform with Role-Based Access Control and AI Decision Support Engine",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit Log Helper
def log_activity(db: Session, user_id: Optional[int], action: str, resource: str):
    log = models.ActivityLog(user_id=user_id, action=action, resource=resource)
    db.add(log)
    db.commit()

# ==================== ROOT / HEALTH ====================

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "app": "EnterpriseSync AI",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==================== AUTHENTICATION ====================

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
async def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    role_name = user.role.name.lower() if user.role else "employee"
    dept_name = user.department.name if user.department else None

    token = create_access_token(data={
        "user_id": user.id,
        "email": user.email,
        "role": role_name
    })

    log_activity(db, user.id, "USER_LOGIN", f"User {user.email} logged in")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": role_name,
            "department": dept_name,
            "department_id": user.department_id
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": f"{current_user.first_name} {current_user.last_name}",
        "email": current_user.email,
        "role": current_user.role.name if current_user.role else "employee",
        "department": current_user.department.name if current_user.department else None,
        "department_id": current_user.department_id
    }

# ==================== ROLE-BASED DASHBOARD APIS ====================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role.name.lower() if current_user.role else "employee"

    if role == "employee":
        my_tasks = db.query(models.Task).filter(models.Task.assigned_to == current_user.id).all()
        completed_tasks = [t for t in my_tasks if t.status == "completed"]
        my_assets = db.query(models.Asset).filter(models.Asset.assigned_to == current_user.id).all()
        my_leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.user_id == current_user.id).all()
        latest_perf = db.query(models.Performance).filter(models.Performance.user_id == current_user.id).order_by(models.Performance.id.desc()).first()

        return {
            "role": role,
            "total_assigned_tasks": len(my_tasks),
            "pending_tasks": len(my_tasks) - len(completed_tasks),
            "completed_tasks": len(completed_tasks),
            "assigned_assets_count": len(my_assets),
            "leave_balance_days": 18 - len([l for l in my_leaves if l.status == "approved"]),
            "performance_score": latest_perf.rating if latest_perf else 4.5,
            "attendance_status": "Present"
        }

    elif role == "hr":
        total_employees = db.query(models.User).count()
        total_departments = db.query(models.Department).count()
        pending_leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.status == "pending").count()
        allocated_assets = db.query(models.Asset).filter(models.Asset.status == "allocated").count()
        total_assets = db.query(models.Asset).count()
        burnout_insights = ai_engine.detect_employee_burnout_and_productivity(db)

        return {
            "role": role,
            "total_employees": total_employees,
            "total_departments": total_departments,
            "pending_leave_requests": pending_leaves,
            "allocated_assets": allocated_assets,
            "total_assets": total_assets,
            "asset_utilization_pct": round((allocated_assets / max(1, total_assets)) * 100, 1),
            "high_risk_burnout_count": len(burnout_insights),
            "recruitment_openings": 6
        }

    elif role == "manager":
        my_projects = db.query(models.Project).filter(models.Project.manager_id == current_user.id).all()
        active_projects = [p for p in my_projects if p.status == "active"]
        all_tasks = db.query(models.Task).all()
        completed_tasks = [t for t in all_tasks if t.status == "completed"]
        
        # Calculate AI Risk across manager's projects
        high_risk_count = 0
        for p in my_projects:
            r = ai_engine.calculate_project_risk_score(p, db)
            if r["risk_level"] in ["high", "critical"]:
                high_risk_count += 1

        rebalance_rec = ai_engine.analyze_workload_rebalancing(db)

        return {
            "role": role,
            "total_projects": len(my_projects),
            "active_projects": len(active_projects),
            "completed_projects": len(my_projects) - len(active_projects),
            "total_tasks": len(all_tasks),
            "pending_tasks": len(all_tasks) - len(completed_tasks),
            "high_risk_projects_count": high_risk_count,
            "workload_imbalance_alerts": len(rebalance_rec.get("recommendations", []))
        }

    else: # Admin
        total_users = db.query(models.User).count()
        total_projects = db.query(models.Project).count()
        total_tasks = db.query(models.Task).count()
        total_assets = db.query(models.Asset).count()
        total_depts = db.query(models.Department).count()
        total_logs = db.query(models.ActivityLog).count()
        scarcity = ai_engine.evaluate_asset_scarcity(db)

        return {
            "role": role,
            "total_users": total_users,
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "total_assets": total_assets,
            "total_departments": total_depts,
            "total_activity_logs": total_logs,
            "asset_utilization_rate": scarcity["utilization_rate"],
            "system_health": "100% Operational"
        }

@app.get("/api/dashboard/charts")
async def get_dashboard_charts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Dynamic workload stacked bar chart data
    workload_data = ai_engine.analyze_workload_rebalancing(db)["user_workloads"]
    
    # Department headcount
    depts = db.query(models.Department).all()
    dept_distribution = []
    for d in depts:
        count = db.query(models.User).filter(models.User.department_id == d.id).count()
        dept_distribution.append({"name": d.name, "value": count})

    # Project status breakdown
    projects = db.query(models.Project).all()
    active_p = len([p for p in projects if p.status == "active"])
    completed_p = len([p for p in projects if p.status == "completed"])
    on_hold_p = len([p for p in projects if p.status == "on_hold"])

    return {
        "employee_workload": [
            {"name": w["name"].split()[0], "active_tasks": w["active_tasks_count"]}
            for w in workload_data
        ],
        "department_distribution": dept_distribution,
        "project_status": [
            {"name": "Active", "value": active_p},
            {"name": "Completed", "value": completed_p},
            {"name": "On Hold", "value": on_hold_p}
        ],
        "risk_trend": [
            {"date": "2026-07-25", "risk_score": 42},
            {"date": "2026-07-26", "risk_score": 45},
            {"date": "2026-07-27", "risk_score": 50},
            {"date": "2026-07-28", "risk_score": 62},
            {"date": "2026-07-29", "risk_score": 58},
            {"date": "2026-07-30", "risk_score": 54},
            {"date": "2026-07-31", "risk_score": 49}
        ]
    }

# ==================== USERS & EMPLOYEES CRUD ====================

@app.get("/api/users")
async def get_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role.name.lower() if current_user.role else "employee"
    if role == "employee":
        users = [current_user]
    elif role == "manager":
        users = db.query(models.User).filter(
            (models.User.department_id == current_user.department_id) |
            (models.User.manager_id == current_user.id) |
            (models.User.id == current_user.id)
        ).all()
    else:
        users = db.query(models.User).all()

    result = []
    for u in users:
        result.append({
            "id": u.id,
            "user_id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "name": f"{u.first_name} {u.last_name}",
            "role_id": u.role_id,
            "role": u.role.name if u.role else "employee",
            "department_id": u.department_id,
            "department": u.department.name if u.department else "Unassigned",
            "manager_id": u.manager_id,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return result

@app.post("/api/users", dependencies=[Depends(require_role(["hr", "admin"]))])
async def create_user(
    payload: schemas.UserCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already registered")

    new_user = models.User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        role_id=payload.role_id,
        department_id=payload.department_id,
        manager_id=payload.manager_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_activity(db, current_user.id, "CREATE_USER", f"Created user {new_user.email}")
    return {"message": "User created successfully", "user_id": new_user.id}

@app.put("/api/users/{user_id}", dependencies=[Depends(require_role(["hr", "admin"]))])
async def update_user(
    user_id: int,
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.first_name: user.first_name = payload.first_name
    if payload.last_name: user.last_name = payload.last_name
    if payload.email: user.email = payload.email
    if payload.department_id is not None: user.department_id = payload.department_id
    if payload.role_id is not None: user.role_id = payload.role_id
    if payload.manager_id is not None: user.manager_id = payload.manager_id

    db.commit()
    log_activity(db, current_user.id, "UPDATE_USER", f"Updated user #{user_id}")
    return {"message": "User updated successfully"}

@app.delete("/api/users/{user_id}", dependencies=[Depends(require_role(["admin", "hr"]))])
async def delete_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin/HR account")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    log_activity(db, current_user.id, "DELETE_USER", f"Deleted user #{user_id}")
    return {"message": "User deleted successfully"}

# ==================== PROJECTS CRUD ====================

@app.get("/api/projects")
async def get_projects(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(models.Project).all()
    result = []
    for p in projects:
        risk_info = ai_engine.calculate_project_risk_score(p, db)
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "manager_id": p.manager_id,
            "manager_name": f"{p.manager.first_name} {p.manager.last_name}" if p.manager else "Unassigned",
            "status": p.status,
            "priority": p.priority,
            "completion_percentage": p.completion_percentage,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "risk_score": risk_info["risk_score"],
            "risk_level": risk_info["risk_level"],
            "risk_recommendation": risk_info["recommendation"],
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return result

@app.post("/api/projects", dependencies=[Depends(require_role(["manager", "admin"]))])
async def create_project(
    payload: schemas.ProjectCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mgr_id = payload.manager_id if payload.manager_id else current_user.id
    proj = models.Project(
        name=payload.name,
        description=payload.description,
        priority=payload.priority,
        manager_id=mgr_id,
        start_date=payload.start_date or datetime.now().strftime("%Y-%m-%d"),
        end_date=payload.end_date,
        status="active",
        completion_percentage=0.0
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)

    log_activity(db, current_user.id, "CREATE_PROJECT", f"Created project {proj.name}")
    return {"message": "Project created", "project_id": proj.id}

@app.put("/api/projects/{project_id}", dependencies=[Depends(require_role(["manager", "admin"]))])
async def update_project(
    project_id: int,
    payload: schemas.ProjectUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proj = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name: proj.name = payload.name
    if payload.description: proj.description = payload.description
    if payload.priority: proj.priority = payload.priority
    if payload.status: proj.status = payload.status
    if payload.completion_percentage is not None: proj.completion_percentage = payload.completion_percentage
    if payload.end_date: proj.end_date = payload.end_date

    db.commit()
    log_activity(db, current_user.id, "UPDATE_PROJECT", f"Updated project #{project_id}")
    return {"message": "Project updated successfully"}

# ==================== TASKS CRUD ====================

@app.get("/api/tasks")
async def get_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role.name.lower() if current_user.role else "employee"
    
    # Employees see only their tasks if role is employee
    if role == "employee":
        tasks = db.query(models.Task).filter(models.Task.assigned_to == current_user.id).all()
    else:
        tasks = db.query(models.Task).all()

    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "project_id": t.project_id,
            "project_name": t.project.name if t.project else "General",
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "assigned_to": t.assigned_to,
            "assignee_name": f"{t.assignee.first_name} {t.assignee.last_name}" if t.assignee else "Unassigned",
            "due_date": t.due_date,
            "created_at": t.created_at.isoformat() if t.created_at else None
        })
    return result

@app.post("/api/tasks", dependencies=[Depends(require_role(["manager", "admin"]))])
async def create_task(
    payload: schemas.TaskCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = models.Task(
        project_id=payload.project_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        assigned_to=payload.assigned_to,
        due_date=payload.due_date,
        status="todo"
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    if payload.assigned_to:
        notif = models.Notification(
            user_id=payload.assigned_to,
            message=f"New Task Assigned: '{payload.title}'",
            type="assignment"
        )
        db.add(notif)
        db.commit()

    log_activity(db, current_user.id, "CREATE_TASK", f"Created task {task.title}")
    return {"message": "Task created successfully", "task_id": task.id}

@app.put("/api/tasks/{task_id}")
async def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    role = current_user.role.name.lower() if current_user.role else "employee"

    # Employees can update status of their own assigned tasks
    if role == "employee":
        if task.assigned_to != current_user.id:
            raise HTTPException(status_code=403, detail="Employees can only update their own assigned tasks")
        if payload.status:
            task.status = payload.status
    else: # Managers and Admins can update all fields
        if payload.title: task.title = payload.title
        if payload.description: task.description = payload.description
        if payload.priority: task.priority = payload.priority
        if payload.status: task.status = payload.status
        if payload.assigned_to is not None: task.assigned_to = payload.assigned_to
        if payload.due_date: task.due_date = payload.due_date

    db.commit()
    log_activity(db, current_user.id, "UPDATE_TASK", f"Updated task #{task_id} to status '{task.status}'")
    return {"message": "Task updated successfully"}

# ==================== ASSETS CRUD ====================

@app.get("/api/assets")
async def get_assets(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role.name.lower() if current_user.role else "employee"
    if role == "employee":
        assets = db.query(models.Asset).filter(models.Asset.assigned_to == current_user.id).all()
    else:
        assets = db.query(models.Asset).all()

    result = []
    for a in assets:
        result.append({
            "id": a.id,
            "name": a.name,
            "type": a.type,
            "status": a.status,
            "assigned_to": a.assigned_to,
            "assigned_user_name": f"{a.assigned_user.first_name} {a.assigned_user.last_name}" if a.assigned_user else "Unassigned",
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
    return result

@app.post("/api/assets", dependencies=[Depends(require_role(["hr", "admin"]))])
async def create_asset(
    payload: schemas.AssetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    asset = models.Asset(
        name=payload.name,
        type=payload.type,
        status=payload.status,
        assigned_to=payload.assigned_to
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    log_activity(db, current_user.id, "CREATE_ASSET", f"Created asset {asset.name}")
    return {"message": "Asset created", "asset_id": asset.id}

# ==================== DEPARTMENTS CRUD ====================

@app.get("/api/departments")
async def get_departments(db: Session = Depends(get_db)):
    depts = db.query(models.Department).all()
    result = []
    for d in depts:
        count = db.query(models.User).filter(models.User.department_id == d.id).count()
        mgr_user = db.query(models.User).filter(models.User.id == d.manager_id).first() if d.manager_id else None
        result.append({
            "id": d.id,
            "name": d.name,
            "manager_id": d.manager_id,
            "manager_name": f"{mgr_user.first_name} {mgr_user.last_name}" if mgr_user else "Unassigned",
            "employee_count": count
        })
    return result

# ==================== ATTENDANCE & LEAVE ====================

@app.get("/api/attendance")
async def get_attendance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role.name.lower() if current_user.role else "employee"
    if role == "employee":
        records = db.query(models.Attendance).filter(models.Attendance.user_id == current_user.id).all()
    else:
        records = db.query(models.Attendance).all()

    result = []
    for r in records:
        result.append({
            "id": r.id,
            "user_id": r.user_id,
            "user_name": f"{r.user.first_name} {r.user.last_name}" if r.user else "Unknown",
            "date": r.date,
            "status": r.status,
            "check_in_time": r.check_in_time,
            "check_out_time": r.check_out_time
        })
    return result

@app.post("/api/attendance/checkin")
async def check_in_today(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today_str = datetime.now().strftime("%Y-%m-%d")
    existing = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.date == today_str
    ).first()

    if existing:
        return {"message": "Already checked in today", "attendance": existing.status}

    rec = models.Attendance(
        user_id=current_user.id,
        date=today_str,
        status="present",
        check_in_time=datetime.now().strftime("%I:%M %p")
    )
    db.add(rec)
    db.commit()

    log_activity(db, current_user.id, "ATTENDANCE_CHECKIN", "Employee checked in today")
    return {"message": "Check-in successful", "check_in_time": rec.check_in_time}

@app.get("/api/leave-requests")
async def get_leave_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = current_user.role.name.lower() if current_user.role else "employee"
    if role == "employee":
        leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.user_id == current_user.id).all()
    else:
        leaves = db.query(models.LeaveRequest).all()

    result = []
    for l in leaves:
        result.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_name": f"{l.user.first_name} {l.user.last_name}" if l.user else "Unknown",
            "start_date": l.start_date,
            "end_date": l.end_date,
            "reason": l.reason,
            "status": l.status,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return result

@app.post("/api/leave-requests")
async def create_leave_request(
    payload: schemas.LeaveCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    leave = models.LeaveRequest(
        user_id=current_user.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status="pending"
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)

    log_activity(db, current_user.id, "CREATE_LEAVE_REQUEST", f"Submitted leave for {payload.start_date}")
    return {"message": "Leave request submitted", "leave_id": leave.id}

@app.put("/api/leave-requests/{leave_id}", dependencies=[Depends(require_role(["hr", "admin"]))])
async def update_leave_status(
    leave_id: int,
    payload: schemas.LeaveStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    leave = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = payload.status
    db.commit()

    # Send notification to applicant
    notif = models.Notification(
        user_id=leave.user_id,
        message=f"Your leave request ({leave.start_date} to {leave.end_date}) has been {payload.status}.",
        type="info"
    )
    db.add(notif)
    db.commit()

    log_activity(db, current_user.id, "UPDATE_LEAVE_STATUS", f"Set leave #{leave_id} status to '{payload.status}'")
    return {"message": f"Leave request {payload.status}"}

# ==================== ALGORITHMIC AI DECISION ENGINE ====================

@app.get("/api/ai/risk-predictions")
async def get_ai_risk_predictions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(models.Project).all()
    predictions = []
    for p in projects:
        pred = ai_engine.calculate_project_risk_score(p, db)
        predictions.append(pred)

    # Sort projects by risk score descending
    predictions.sort(key=lambda x: x["risk_score"], reverse=True)
    return predictions

@app.get("/api/ai/workload-rebalance")
async def get_ai_workload_rebalance(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ai_engine.analyze_workload_rebalancing(db)

@app.post("/api/ai/workload-rebalance/execute", dependencies=[Depends(require_role(["manager", "admin"]))])
async def execute_workload_rebalance(
    payload: schemas.TaskReallocateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes algorithmic workload re-balancing: moves N active tasks from overloaded user to target user.
    """
    tasks_to_move = db.query(models.Task).filter(
        models.Task.assigned_to == payload.from_user_id,
        models.Task.status.in_(["todo", "in_progress"])
    ).limit(payload.task_count).all()

    if not tasks_to_move:
        raise HTTPException(status_code=400, detail="No active tasks available to reallocate from specified user.")

    transferred_titles = []
    for task in tasks_to_move:
        task.assigned_to = payload.to_user_id
        transferred_titles.append(task.title)

    db.commit()

    # Notify recipient
    to_user = db.query(models.User).filter(models.User.id == payload.to_user_id).first()
    if to_user:
        notif = models.Notification(
            user_id=payload.to_user_id,
            message=f"AI Workload Rebalancer assigned {len(tasks_to_move)} tasks to you to optimize project delivery.",
            type="assignment"
        )
        db.add(notif)
        db.commit()

    log_activity(db, current_user.id, "AI_WORKLOAD_REBALANCE", f"Reallocated {len(tasks_to_move)} tasks from User #{payload.from_user_id} to User #{payload.to_user_id}")
    return {
        "message": f"Successfully reallocated {len(tasks_to_move)} tasks to {to_user.first_name if to_user else 'target user'}.",
        "transferred_tasks": transferred_titles
    }

@app.get("/api/ai/burnout-productivity")
async def get_ai_burnout_productivity(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ai_engine.detect_employee_burnout_and_productivity(db)

@app.get("/api/ai/asset-scarcity")
async def get_ai_asset_scarcity(db: Session = Depends(get_db)):
    return ai_engine.evaluate_asset_scarcity(db)

@app.get("/api/ai/career-suggestions")
async def get_ai_career_suggestions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ai_engine.generate_career_recommendations(current_user, db)

@app.post("/api/ai/chat")
async def ai_copilot_chat(
    payload: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enterprise AI Copilot Chat Endpoint
    Enforces RBAC per user role, accesses PostgreSQL telemetry, and provides action recommendations.
    """
    return ai_engine.process_ai_copilot_chat(
        user=current_user,
        prompt=payload.prompt,
        history=payload.history or [],
        db=db,
        current_page=payload.current_page
    )


# ==================== NOTIFICATIONS & AUDIT LOGS & REPORTS ====================

@app.get("/api/notifications")
async def get_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.id.desc()).all()
    result = []
    for n in notifs:
        result.append({
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "read": n.read,
            "created_at": n.created_at.isoformat() if n.created_at else None
        })
    return result

@app.put("/api/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user.id
    ).first()

    if notif:
        notif.read = True
        db.commit()

    return {"message": "Notification marked read"}

@app.get("/api/activity-logs", dependencies=[Depends(require_role(["admin"]))])
async def get_activity_logs(db: Session = Depends(get_db)):
    logs = db.query(models.ActivityLog).order_by(models.ActivityLog.id.desc()).limit(50).all()
    result = []
    for l in logs:
        result.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user.email if l.user else "System",
            "action": l.action,
            "resource": l.resource,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return result

@app.get("/api/reports")
async def get_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Executive Summary Report Generator
    scarcity = ai_engine.evaluate_asset_scarcity(db)
    burnout = ai_engine.detect_employee_burnout_and_productivity(db)
    rebalance = ai_engine.analyze_workload_rebalancing(db)

    report_data = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "generated_by": f"{current_user.first_name} {current_user.last_name}",
        "executive_summary": "Enterprise Operations & Risk Intelligence Audit",
        "asset_scarcity_alerts": scarcity["alerts"],
        "burnout_risk_count": len(burnout),
        "workload_transfer_recommendations": rebalance.get("recommendations", [])
    }

    return [
        {
            "id": 1,
            "report_type": "Executive Operations & AI Audit Report",
            "created_by": f"{current_user.first_name} {current_user.last_name}",
            "generated_at": datetime.now().strftime("%Y-%m-%d"),
            "data": report_data
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
