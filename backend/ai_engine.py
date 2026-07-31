"""
EnterpriseSync AI - Algorithmic Decision Support Engine
Performs multi-variable scoring across workload, progress, attendance, performance, and assets.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
import models
from datetime import datetime, timedelta

def calculate_project_risk_score(project: models.Project, db: Session) -> Dict[str, Any]:
    """
    Algorithmic Project Risk Scoring
    Variables:
    - completion_percentage (0 - 100)
    - open critical/high tasks ratio
    - deadline proximity (days remaining vs remaining completion %)
    - developer load on project
    """
    tasks = db.query(models.Task).filter(models.Task.project_id == project.id).all()
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.status == "completed"])
    incomplete_tasks = total_tasks - completed_tasks
    critical_tasks = len([t for t in tasks if t.priority in ["high", "critical"] and t.status != "completed"])

    # Calculate deadline remaining days
    days_left = 30 # default
    if project.end_date:
        try:
            end_dt = datetime.strptime(project.end_date, "%Y-%m-%d")
            days_left = max(1, (end_dt - datetime.now()).days)
        except Exception:
            days_left = 15

    # Multi-factor formula
    # Factor 1: Progress Lag (0 - 40 points)
    expected_progress = max(5.0, 100.0 - (days_left * 2.0))
    progress_gap = max(0.0, expected_progress - project.completion_percentage)
    progress_score = min(40.0, progress_gap * 0.8)

    # Factor 2: Task Pressure (0 - 35 points)
    task_pressure = (incomplete_tasks * 2.5) + (critical_tasks * 4.0)
    task_score = min(35.0, task_pressure)

    # Factor 3: Priority Weight (0 - 25 points)
    p_weights = {"low": 5.0, "medium": 10.0, "high": 18.0, "critical": 25.0}
    priority_score = p_weights.get(project.priority.lower(), 10.0)

    total_risk_score = min(99.0, max(10.0, progress_score + task_score + priority_score))

    # Categorize Risk Level
    if total_risk_score >= 70.0:
        level = "critical"
        rec = f"🚨 Immediate Intervention Required: Reallocate {critical_tasks} critical tasks or extend deadline by {int(total_risk_score / 10)} days."
    elif total_risk_score >= 50.0:
        level = "high"
        rec = f"⚠️ High Delay Probability: Workload bottleneck detected. Recommend redistributing active tasks."
    elif total_risk_score >= 35.0:
        level = "medium"
        rec = "⚡ Moderate Risk: Monitor completion velocity weekly."
    else:
        level = "low"
        rec = "✅ Project on Schedule: Maintain current milestone execution velocity."

    predicted_delay = int(max(0, (total_risk_score - 30.0) / 4.0))

    return {
        "project_id": project.id,
        "project_name": project.name,
        "risk_score": round(total_risk_score, 1),
        "risk_level": level,
        "predicted_delay_days": predicted_delay,
        "completion_percentage": project.completion_percentage,
        "total_tasks": total_tasks,
        "incomplete_tasks": incomplete_tasks,
        "critical_tasks": critical_tasks,
        "recommendation": rec,
        "factors": {
            "progress_score": round(progress_score, 1),
            "task_score": round(task_score, 1),
            "priority_score": round(priority_score, 1)
        }
    }

def analyze_workload_rebalancing(db: Session, project_id: int = None) -> Dict[str, Any]:
    """
    Algorithmic Workload Rebalancing Engine
    Calculates active task load per user across project or department and finds optimal task redistribution transfers.
    """
    query = db.query(models.User).filter(models.User.role_id != 1) # Non-admin users
    users = query.all()

    workloads = []
    for user in users:
        active_tasks = db.query(models.Task).filter(
            models.Task.assigned_to == user.id,
            models.Task.status.in_(["todo", "in_progress"])
        ).all()

        workloads.append({
            "user_id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "active_tasks_count": len(active_tasks),
            "task_ids": [t.id for t in active_tasks]
        })

    # Sort users by active workload descending
    workloads.sort(key=lambda x: x["active_tasks_count"], reverse=True)

    recommendations = []
    if len(workloads) >= 2:
        overloaded = workloads[0]
        underloaded = workloads[-1]
        diff = overloaded["active_tasks_count"] - underloaded["active_tasks_count"]

        if diff >= 3:
            suggested_transfer_count = diff // 2
            recommendations.append({
                "from_user": overloaded["name"],
                "from_user_id": overloaded["user_id"],
                "to_user": underloaded["name"],
                "to_user_id": underloaded["user_id"],
                "transfer_count": suggested_transfer_count,
                "reason": f"Workload imbalance: {overloaded['name']} has {overloaded['active_tasks_count']} active tasks while {underloaded['name']} has only {underloaded['active_tasks_count']}."
            })

    return {
        "user_workloads": workloads,
        "recommendations": recommendations
    }

def detect_employee_burnout_and_productivity(db: Session) -> List[Dict[str, Any]]:
    """
    Detects employees with high task load + absences or low performance rating.
    """
    employees = db.query(models.User).all()
    insights = []

    for emp in employees:
        active_tasks = db.query(models.Task).filter(
            models.Task.assigned_to == emp.id,
            models.Task.status.in_(["todo", "in_progress"])
        ).count()

        absences = db.query(models.Attendance).filter(
            models.Attendance.user_id == emp.id,
            models.Attendance.status == "absent"
        ).count()

        latest_perf = db.query(models.Performance).filter(
            models.Performance.user_id == emp.id
        ).order_by(models.Performance.id.desc()).first()

        rating = latest_perf.rating if latest_perf else 3.5

        # Burnout score (0 - 100)
        burnout_score = (active_tasks * 6.0) + (absences * 12.0) + ((5.0 - rating) * 10.0)
        burnout_score = min(100.0, max(5.0, burnout_score))

        if burnout_score > 60.0:
            insights.append({
                "user_id": emp.id,
                "name": f"{emp.first_name} {emp.last_name}",
                "email": emp.email,
                "burnout_score": round(burnout_score, 1),
                "active_tasks": active_tasks,
                "absences": absences,
                "rating": rating,
                "status": "High Risk of Burnout / Overload",
                "action": "Recommend temporary task freeze and manager 1-on-1 check-in."
            })
        elif rating < 3.0:
            insights.append({
                "user_id": emp.id,
                "name": f"{emp.first_name} {emp.last_name}",
                "email": emp.email,
                "burnout_score": round(burnout_score, 1),
                "active_tasks": active_tasks,
                "absences": absences,
                "rating": rating,
                "status": "Low Productivity Alert",
                "action": "Suggest technical mentorship and task scope refinement."
            })

    return insights

def evaluate_asset_scarcity(db: Session) -> Dict[str, Any]:
    """
    Analyzes asset utilization rates and flags equipment shortages.
    """
    total_assets = db.query(models.Asset).count()
    allocated = db.query(models.Asset).filter(models.Asset.status == "allocated").count()
    available = db.query(models.Asset).filter(models.Asset.status == "available").count()
    maintenance = db.query(models.Asset).filter(models.Asset.status == "under_maintenance").count()

    utilization_rate = round((allocated / total_assets * 100.0), 1) if total_assets > 0 else 0.0

    alerts = []
    if utilization_rate > 85.0:
        alerts.append("⚠️ Asset Scarcity Warning: Over 85% of company hardware/licenses are currently allocated. Procure 5 additional laptops.")
    if maintenance > 2:
        alerts.append(f"🔧 Maintenance Bottleneck: {maintenance} assets currently under repair.")

    return {
        "total_assets": total_assets,
        "allocated": allocated,
        "available": available,
        "maintenance": maintenance,
        "utilization_rate": utilization_rate,
        "alerts": alerts
    }

def generate_career_recommendations(user: models.User, db: Session) -> List[Dict[str, Any]]:
    """
    Algorithmic career development recommendations based on performance reviews, task history, and department goals.
    """
    latest_perf = db.query(models.Performance).filter(
        models.Performance.user_id == user.id
    ).order_by(models.Performance.id.desc()).first()

    completed_tasks_count = db.query(models.Task).filter(
        models.Task.assigned_to == user.id,
        models.Task.status == "completed"
    ).count()

    suggestions = []

    if completed_tasks_count >= 5:
        suggestions.append({
            "title": "Lead Technical Initiative",
            "type": "Leadership",
            "reason": f"Completed {completed_tasks_count} tasks with consistent delivery quality.",
            "action": "Eligible to mentor junior developers or lead upcoming sprint sub-projects."
        })

    dept_name = user.department.name if user.department else "General"
    if dept_name == "Engineering":
        suggestions.append({
            "title": "Advanced Cloud & Microservices Certification",
            "type": "Skill Gap",
            "reason": "High demand for cloud architecture skills in active high-risk projects.",
            "action": "Recommended course: AWS Solutions Architect / FastAPI Microservices."
        })
    elif dept_name == "Marketing":
        suggestions.append({
            "title": "AI Analytics & Performance Marketing",
            "type": "Skill Gap",
            "reason": "Company expansion into data-driven campaign management.",
            "action": "Recommended workshop: Data-Driven Growth Analytics."
        })

    if latest_perf and latest_perf.rating >= 4.5:
        suggestions.append({
            "title": "Senior Promotion Assessment",
            "type": "Career Growth",
            "reason": f"Top performance rating score ({latest_perf.rating}/5.0).",
            "action": "Eligible for annual salary band review and Senior title consideration."
        })

    return suggestions
