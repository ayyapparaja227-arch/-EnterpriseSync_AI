"""
EnterpriseSync AI - Database Seeder Script
Populates database with realistic enterprise data across all 4 roles.
"""

from database import engine, SessionLocal, Base
import models
from auth import hash_password
from datetime import datetime, timedelta

def seed_database():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("🌱 Seeding roles...")
        role_admin = models.Role(name="admin", description="Full system administrator access")
        role_hr = models.Role(name="hr", description="HR Operations and Employee Management")
        role_manager = models.Role(name="manager", description="Project Manager and Team Lead")
        role_employee = models.Role(name="employee", description="Standard Staff Member")

        db.add_all([role_admin, role_hr, role_manager, role_employee])
        db.commit()

        print("🌱 Seeding departments...")
        dept_eng = models.Department(name="Engineering")
        dept_mkt = models.Department(name="Marketing")
        dept_hr = models.Department(name="Human Resources")
        dept_prod = models.Department(name="Product Management")

        db.add_all([dept_eng, dept_mkt, dept_hr, dept_prod])
        db.commit()

        print("🌱 Seeding users...")
        user_admin = models.User(
            email="admin@enterprisesync.ai",
            password_hash=hash_password("admin123"),
            first_name="Alexander",
            last_name="Vance",
            role_id=role_admin.id,
            department_id=dept_eng.id
        )

        user_hr = models.User(
            email="hr@enterprisesync.ai",
            password_hash=hash_password("hr123"),
            first_name="Sarah",
            last_name="Jenkins",
            role_id=role_hr.id,
            department_id=dept_hr.id
        )

        user_pm = models.User(
            email="pm@enterprisesync.ai",
            password_hash=hash_password("pm123"),
            first_name="Marcus",
            last_name="Brody",
            role_id=role_manager.id,
            department_id=dept_prod.id
        )

        user_emp1 = models.User(
            email="employee@enterprisesync.ai",
            password_hash=hash_password("employee123"),
            first_name="David",
            last_name="Miller",
            role_id=role_employee.id,
            department_id=dept_eng.id
        )

        user_emp2 = models.User(
            email="jane@enterprisesync.ai",
            password_hash=hash_password("jane123"),
            first_name="Jane",
            last_name="Smith",
            role_id=role_employee.id,
            department_id=dept_eng.id
        )

        user_emp3 = models.User(
            email="bob@enterprisesync.ai",
            password_hash=hash_password("bob123"),
            first_name="Robert",
            last_name="Chen",
            role_id=role_employee.id,
            department_id=dept_mkt.id
        )

        db.add_all([user_admin, user_hr, user_pm, user_emp1, user_emp2, user_emp3])
        db.commit()

        # Update dept managers
        dept_eng.manager_id = user_pm.id
        dept_hr.manager_id = user_hr.id
        dept_mkt.manager_id = user_pm.id
        dept_prod.manager_id = user_admin.id
        db.commit()

        print("🌱 Seeding projects...")
        proj1 = models.Project(
            name="Enterprise AI Portal Redesign",
            description="Overhaul corporate portal with AI analytics, RBAC, and executive dashboards.",
            manager_id=user_pm.id,
            status="active",
            priority="critical",
            completion_percentage=42.5,
            start_date="2026-07-01",
            end_date="2026-08-31"
        )
        proj2 = models.Project(
            name="Cloud Infrastructure Migration",
            description="Migrate legacy servers to AWS containerized Kubernetes cluster.",
            manager_id=user_pm.id,
            status="active",
            priority="high",
            completion_percentage=78.0,
            start_date="2026-05-15",
            end_date="2026-09-15"
        )
        proj3 = models.Project(
            name="Mobile Employee Companion App",
            description="iOS and Android App for real-time check-in and leave management.",
            manager_id=user_pm.id,
            status="active",
            priority="medium",
            completion_percentage=25.0,
            start_date="2026-06-20",
            end_date="2026-11-30"
        )
        db.add_all([proj1, proj2, proj3])
        db.commit()

        print("🌱 Seeding tasks...")
        # Give David Miller (emp1) heavy workload (14+ tasks) to demonstrate workload balancing!
        t1 = models.Task(project_id=proj1.id, assigned_to=user_emp1.id, title="Implement OAuth2 & JWT Middleware", description="Role based access control logic", status="in_progress", priority="high", due_date="2026-08-05")
        t2 = models.Task(project_id=proj1.id, assigned_to=user_emp1.id, title="Build AI Decision Support Engine", description="Dynamic scoring functions for risk", status="in_progress", priority="critical", due_date="2026-08-08")
        t3 = models.Task(project_id=proj1.id, assigned_to=user_emp1.id, title="Optimize Database Indexes", description="Index optimization for PostgreSQL", status="todo", priority="medium", due_date="2026-08-12")
        t4 = models.Task(project_id=proj1.id, assigned_to=user_emp1.id, title="Audit Security Vulnerabilities", description="SAST / DAST code scan", status="todo", priority="high", due_date="2026-08-15")
        t5 = models.Task(project_id=proj1.id, assigned_to=user_emp1.id, title="Create GraphQL Fallback Schema", description="Backup query API endpoint", status="todo", priority="medium", due_date="2026-08-18")
        t6 = models.Task(project_id=proj1.id, assigned_to=user_emp1.id, title="Unit Test Authentication Flow", description="100% test coverage for auth.py", status="todo", priority="medium", due_date="2026-08-20")
        
        # Jane has light workload (2 tasks)
        t7 = models.Task(project_id=proj1.id, assigned_to=user_emp2.id, title="Design High-Fidelity UI Wireframes", description="Figma modern corporate dark theme", status="completed", priority="medium", due_date="2026-07-28")
        t8 = models.Task(project_id=proj1.id, assigned_to=user_emp2.id, title="Frontend Component Library", description="Buttons, Modals, Cards, Charts", status="in_progress", priority="high", due_date="2026-08-10")

        # Bob Chen (emp3) tasks
        t9 = models.Task(project_id=proj2.id, assigned_to=user_emp3.id, title="Kubernetes Helm Deployment Config", description="Production manifests", status="completed", priority="critical", due_date="2026-07-20")
        t10 = models.Task(project_id=proj3.id, assigned_to=user_emp3.id, title="Setup React Native Navigation", description="Drawer + tab router", status="in_progress", priority="medium", due_date="2026-08-25")

        db.add_all([t1, t2, t3, t4, t5, t6, t7, t8, t9, t10])
        db.commit()

        print("🌱 Seeding assets...")
        a1 = models.Asset(name="MacBook Pro M3 Max 16\"", type="Laptop", status="allocated", assigned_to=user_emp1.id)
        a2 = models.Asset(name="Dell UltraSharp 27\" 4K Monitor", type="Monitor", status="allocated", assigned_to=user_emp1.id)
        a3 = models.Asset(name="MacBook Air M2 15\"", type="Laptop", status="allocated", assigned_to=user_emp2.id)
        a4 = models.Asset(name="LG Ergo 32\" Monitor", type="Monitor", status="allocated", assigned_to=user_emp2.id)
        a5 = models.Asset(name="Lenovo ThinkPad P16", type="Laptop", status="allocated", assigned_to=user_emp3.id)
        a6 = models.Asset(name="iPhone 15 Pro Test Device", type="Phone", status="available", assigned_to=None)
        a7 = models.Asset(name="Figma Enterprise Seat", type="Software License", status="allocated", assigned_to=user_emp2.id)
        a8 = models.Asset(name="AWS Dev Server Node", type="Server", status="under_maintenance", assigned_to=None)
        
        db.add_all([a1, a2, a3, a4, a5, a6, a7, a8])
        db.commit()

        print("🌱 Seeding attendance...")
        today_str = datetime.now().strftime("%Y-%m-%d")
        yesterday_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        db.add_all([
            models.Attendance(user_id=user_emp1.id, date=today_str, status="present", check_in_time="09:02 AM", check_out_time=None),
            models.Attendance(user_id=user_emp2.id, date=today_str, status="present", check_in_time="08:55 AM", check_out_time=None),
            models.Attendance(user_id=user_emp3.id, date=today_str, status="present", check_in_time="09:15 AM", check_out_time=None),
            models.Attendance(user_id=user_emp1.id, date=yesterday_str, status="present", check_in_time="09:00 AM", check_out_time="06:00 PM"),
            models.Attendance(user_id=user_emp2.id, date=yesterday_str, status="absent", check_in_time=None, check_out_time=None),
        ])
        db.commit()

        print("🌱 Seeding leave requests...")
        l1 = models.LeaveRequest(user_id=user_emp1.id, start_date="2026-08-25", end_date="2026-08-28", reason="Annual family vacation", status="pending")
        l2 = models.LeaveRequest(user_id=user_emp2.id, start_date="2026-08-14", end_date="2026-08-15", reason="Medical checkup", status="approved")
        l3 = models.LeaveRequest(user_id=user_emp3.id, start_date="2026-09-01", end_date="2026-09-03", reason="Personal time off", status="pending")
        db.add_all([l1, l2, l3])
        db.commit()

        print("🌱 Seeding performance reviews...")
        p1 = models.Performance(user_id=user_emp1.id, rating=4.8, review="Exceptional backend performance and security domain expertise.", reviewer_id=user_pm.id, review_date="2026-06-30")
        p2 = models.Performance(user_id=user_emp2.id, rating=4.2, review="Great UI design skills and team collaboration.", reviewer_id=user_pm.id, review_date="2026-06-30")
        p3 = models.Performance(user_id=user_emp3.id, rating=3.8, review="Solid DevOps execution, working on improving velocity.", reviewer_id=user_pm.id, review_date="2026-06-30")
        db.add_all([p1, p2, p3])
        db.commit()

        print("🌱 Seeding notifications...")
        n1 = models.Notification(user_id=user_emp1.id, message="AI Risk Engine flagged project Enterprise AI Portal as Critical Priority", type="risk_alert", read=False)
        n2 = models.Notification(user_id=user_emp1.id, message="Task 'Implement OAuth2 & JWT Middleware' due in 5 days", type="deadline", read=False)
        n3 = models.Notification(user_id=user_hr.id, message="New leave request pending approval from David Miller", type="info", read=False)
        n4 = models.Notification(user_id=user_pm.id, message="Workload imbalance detected between David Miller and Jane Smith", type="risk_alert", read=False)
        db.add_all([n1, n2, n3, n4])
        db.commit()

        print("🌱 Seeding activity logs...")
        db.add_all([
            models.ActivityLog(user_id=user_admin.id, action="CREATE_USER", resource="User: Jane Smith"),
            models.ActivityLog(user_id=user_pm.id, action="UPDATE_PROJECT", resource="Project: Enterprise AI Portal Redesign"),
            models.ActivityLog(user_id=user_hr.id, action="APPROVE_LEAVE", resource="LeaveRequest #2"),
            models.ActivityLog(user_id=user_emp1.id, action="UPDATE_TASK", resource="Task: Implement OAuth2 & JWT Middleware")
        ])
        db.commit()

        print("✅ Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
