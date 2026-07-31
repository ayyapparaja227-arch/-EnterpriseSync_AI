# Database Schema Documentation

## 🗄️ EnterpriseSync AI - Database Architecture

---

## Overview

EnterpriseSync AI uses **PostgreSQL** as the primary database with **SQLAlchemy ORM** for database operations. The schema is designed for scalability, data integrity, and efficient querying.

---

## Entity Relationship Diagram

```
┌──────────────┐
│    Roles     │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐         ┌─────────────────┐
│    Users     ├────N:1──┤   Departments   │
└──┬───┬───┬───┘         └─────────────────┘
   │   │   │
   │   │   └─────────────────┐
   │   │                     │
   │   │ 1                   │ 1
   │   │                     │
   │   │ N                   │ N
   │   │              ┌──────┴──────────┐
   │   │              │   Notifications │
   │   │              └─────────────────┘
   │   │
   │   │ 1            ┌─────────────────┐
   │   └─────────N────┤  Activity_Logs  │
   │                  └─────────────────┘
   │
   │ 1 (Manager)
   │
   │ N
┌──┴──────────┐        ┌──────────────────┐
│  Projects   ├───1:N──┤ Risk_Predictions │
└──┬──────────┘        └──────────────────┘
   │ 1
   │
   │ N
┌──┴─────┐
│ Tasks  │
└──┬─────┘
   │ N
   │
   │ 1
┌──┴─────────────┐
│     Users      │
│  (Employee)    │
└────────────────┘

┌────────────┐         ┌────────────────────┐
│   Assets   ├───1:N───┤ Asset_Allocations  │
└────────────┘         └──────┬─────────────┘
                              │ N
                              │
                              │ 1
                        ┌─────┴──────┐
                        │   Users    │
                        └────────────┘
```

---

## Tables

### 1. Roles

Stores different user roles for access control.

| Column     | Type          | Constraints          | Description              |
|------------|---------------|----------------------|--------------------------|
| role_id    | INTEGER       | PRIMARY KEY          | Unique role identifier   |
| role_name  | VARCHAR(50)   | UNIQUE, NOT NULL     | Role name (Admin, etc.)  |

**Sample Data:**
```sql
INSERT INTO roles (role_id, role_name) VALUES
(1, 'admin'),
(2, 'manager'),
(3, 'employee');
```

**Indexes:**
- PRIMARY KEY on `role_id`
- UNIQUE INDEX on `role_name`

---

### 2. Departments

Organizational departments.

| Column          | Type          | Constraints          | Description                  |
|-----------------|---------------|----------------------|------------------------------|
| department_id   | INTEGER       | PRIMARY KEY          | Unique department identifier |
| department_name | VARCHAR(100)  | NOT NULL             | Department name              |
| location        | VARCHAR(200)  | NULL                 | Physical location            |

**Sample Data:**
```sql
INSERT INTO departments (department_id, department_name, location) VALUES
(1, 'Engineering', 'Building A, Floor 3'),
(2, 'Marketing', 'Building B, Floor 2'),
(3, 'Human Resources', 'Building A, Floor 1');
```

**Indexes:**
- PRIMARY KEY on `department_id`
- INDEX on `department_name`

---

### 3. Users

Employee and manager information with authentication.

| Column        | Type          | Constraints                      | Description                    |
|---------------|---------------|----------------------------------|--------------------------------|
| user_id       | INTEGER       | PRIMARY KEY                      | Unique user identifier         |
| name          | VARCHAR(100)  | NOT NULL                         | Full name                      |
| email         | VARCHAR(100)  | UNIQUE, NOT NULL                 | Email address (login)          |
| password      | VARCHAR(255)  | NOT NULL                         | Hashed password                |
| phone         | VARCHAR(20)   | NULL                             | Phone number                   |
| role_id       | INTEGER       | FOREIGN KEY → roles.role_id      | User role                      |
| department_id | INTEGER       | FOREIGN KEY → departments.dept_id| Department assignment          |
| status        | VARCHAR(20)   | DEFAULT 'active'                 | active, inactive, suspended    |
| created_at    | TIMESTAMP     | DEFAULT NOW()                    | Account creation timestamp     |

**Relationships:**
- `role_id` → `roles.role_id` (Many-to-One)
- `department_id` → `departments.department_id` (Many-to-One)

**Indexes:**
- PRIMARY KEY on `user_id`
- UNIQUE INDEX on `email`
- INDEX on `role_id`
- INDEX on `department_id`
- INDEX on `status`

**Constraints:**
```sql
CHECK (status IN ('active', 'inactive', 'suspended'))
```

---

### 4. Projects

Project management information.

| Column                 | Type          | Constraints                      | Description                    |
|------------------------|---------------|----------------------------------|--------------------------------|
| project_id             | INTEGER       | PRIMARY KEY                      | Unique project identifier      |
| manager_id             | INTEGER       | FOREIGN KEY → users.user_id      | Project manager                |
| project_name           | VARCHAR(200)  | NOT NULL                         | Project name                   |
| description            | TEXT          | NULL                             | Project description            |
| start_date             | DATE          | NULL                             | Project start date             |
| end_date               | DATE          | NULL                             | Project deadline               |
| priority               | VARCHAR(20)   | DEFAULT 'medium'                 | low, medium, high, critical    |
| completion_percentage  | FLOAT         | DEFAULT 0.0                      | Completion % (0-100)           |
| status                 | VARCHAR(20)   | DEFAULT 'active'                 | active, completed, on_hold     |

**Relationships:**
- `manager_id` → `users.user_id` (Many-to-One)

**Indexes:**
- PRIMARY KEY on `project_id`
- INDEX on `manager_id`
- INDEX on `status`
- INDEX on `end_date`

**Constraints:**
```sql
CHECK (priority IN ('low', 'medium', 'high', 'critical'))
CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled'))
CHECK (completion_percentage BETWEEN 0 AND 100)
CHECK (end_date >= start_date)
```

---

### 5. Tasks

Individual tasks within projects.

| Column      | Type          | Constraints                        | Description                    |
|-------------|---------------|------------------------------------|--------------------------------|
| task_id     | INTEGER       | PRIMARY KEY                        | Unique task identifier         |
| project_id  | INTEGER       | FOREIGN KEY → projects.project_id  | Parent project                 |
| assigned_to | INTEGER       | FOREIGN KEY → users.user_id        | Assigned employee              |
| title       | VARCHAR(200)  | NOT NULL                           | Task title                     |
| description | TEXT          | NULL                               | Task description               |
| priority    | VARCHAR(20)   | DEFAULT 'medium'                   | low, medium, high              |
| deadline    | DATE          | NULL                               | Task deadline                  |
| status      | VARCHAR(20)   | DEFAULT 'todo'                     | todo, in_progress, completed   |

**Relationships:**
- `project_id` → `projects.project_id` (Many-to-One, CASCADE DELETE)
- `assigned_to` → `users.user_id` (Many-to-One)

**Indexes:**
- PRIMARY KEY on `task_id`
- INDEX on `project_id`
- INDEX on `assigned_to`
- INDEX on `status`
- INDEX on `deadline`

**Constraints:**
```sql
CHECK (priority IN ('low', 'medium', 'high'))
CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked'))
```

---

### 6. Assets

Company assets and equipment.

| Column         | Type          | Constraints          | Description                    |
|----------------|---------------|----------------------|--------------------------------|
| asset_id       | INTEGER       | PRIMARY KEY          | Unique asset identifier        |
| asset_name     | VARCHAR(200)  | NOT NULL             | Asset name                     |
| asset_type     | VARCHAR(100)  | NULL                 | Type (laptop, monitor, etc.)   |
| serial_number  | VARCHAR(100)  | UNIQUE               | Serial/Asset number            |
| purchase_date  | DATE          | NULL                 | Purchase date                  |
| status         | VARCHAR(20)   | DEFAULT 'available'  | available, assigned, maintenance |

**Indexes:**
- PRIMARY KEY on `asset_id`
- UNIQUE INDEX on `serial_number`
- INDEX on `status`
- INDEX on `asset_type`

**Constraints:**
```sql
CHECK (status IN ('available', 'assigned', 'maintenance', 'retired'))
```

---

### 7. Asset_Allocations

Tracks asset assignments to users.

| Column         | Type          | Constraints                      | Description                    |
|----------------|---------------|----------------------------------|--------------------------------|
| allocation_id  | INTEGER       | PRIMARY KEY                      | Unique allocation identifier   |
| asset_id       | INTEGER       | FOREIGN KEY → assets.asset_id    | Allocated asset                |
| user_id        | INTEGER       | FOREIGN KEY → users.user_id      | User receiving asset           |
| assigned_date  | DATE          | NOT NULL                         | Date of assignment             |
| returned_date  | DATE          | NULL                             | Date of return                 |
| status         | VARCHAR(20)   | DEFAULT 'active'                 | active, returned               |

**Relationships:**
- `asset_id` → `assets.asset_id` (Many-to-One)
- `user_id` → `users.user_id` (Many-to-One)

**Indexes:**
- PRIMARY KEY on `allocation_id`
- INDEX on `asset_id`
- INDEX on `user_id`
- INDEX on `status`

**Constraints:**
```sql
CHECK (status IN ('active', 'returned'))
CHECK (returned_date IS NULL OR returned_date >= assigned_date)
```

---

### 8. Risk_Predictions

AI-generated project risk assessments.

| Column               | Type          | Constraints                        | Description                    |
|----------------------|---------------|------------------------------------|--------------------------------|
| risk_id              | INTEGER       | PRIMARY KEY                        | Unique risk identifier         |
| project_id           | INTEGER       | FOREIGN KEY → projects.project_id  | Associated project             |
| risk_score           | FLOAT         | NOT NULL                           | Risk score (0-100)             |
| risk_level           | VARCHAR(20)   | NOT NULL                           | low, medium, high              |
| predicted_delay_days | INTEGER       | DEFAULT 0                          | Predicted delay in days        |
| generated_at         | TIMESTAMP     | DEFAULT NOW()                      | Prediction timestamp           |

**Relationships:**
- `project_id` → `projects.project_id` (Many-to-One)

**Indexes:**
- PRIMARY KEY on `risk_id`
- INDEX on `project_id`
- INDEX on `risk_level`
- INDEX on `generated_at`

**Constraints:**
```sql
CHECK (risk_score BETWEEN 0 AND 100)
CHECK (risk_level IN ('low', 'medium', 'high'))
CHECK (predicted_delay_days >= 0)
```

---

### 9. Notifications

User notifications and alerts.

| Column           | Type          | Constraints                   | Description                    |
|------------------|---------------|-------------------------------|--------------------------------|
| notification_id  | INTEGER       | PRIMARY KEY                   | Unique notification identifier |
| user_id          | INTEGER       | FOREIGN KEY → users.user_id   | Recipient user                 |
| message          | TEXT          | NOT NULL                      | Notification message           |
| type             | VARCHAR(50)   | NOT NULL                      | deadline, assignment, etc.     |
| is_read          | BOOLEAN       | DEFAULT FALSE                 | Read status                    |
| created_at       | TIMESTAMP     | DEFAULT NOW()                 | Creation timestamp             |

**Relationships:**
- `user_id` → `users.user_id` (Many-to-One)

**Indexes:**
- PRIMARY KEY on `notification_id`
- INDEX on `user_id`
- INDEX on `is_read`
- INDEX on `created_at`

**Constraints:**
```sql
CHECK (type IN ('deadline', 'assignment', 'completion', 'risk_alert', 'asset'))
```

---

### 10. Activity_Logs

Audit trail of user actions.

| Column     | Type          | Constraints                   | Description                    |
|------------|---------------|-------------------------------|--------------------------------|
| log_id     | INTEGER       | PRIMARY KEY                   | Unique log identifier          |
| user_id    | INTEGER       | FOREIGN KEY → users.user_id   | User who performed action      |
| activity   | TEXT          | NOT NULL                      | Activity description           |
| created_at | TIMESTAMP     | DEFAULT NOW()                 | Activity timestamp             |

**Relationships:**
- `user_id` → `users.user_id` (Many-to-One)

**Indexes:**
- PRIMARY KEY on `log_id`
- INDEX on `user_id`
- INDEX on `created_at`

---

## Relationships Summary

### One-to-Many Relationships

1. **Roles → Users** (1:N)
   - One role can have many users

2. **Departments → Users** (1:N)
   - One department can have many users

3. **Users (Manager) → Projects** (1:N)
   - One manager can manage many projects

4. **Projects → Tasks** (1:N)
   - One project can have many tasks

5. **Users (Employee) → Tasks** (1:N)
   - One user can have many assigned tasks

6. **Assets → Asset_Allocations** (1:N)
   - One asset can have multiple allocation records

7. **Users → Asset_Allocations** (1:N)
   - One user can have multiple asset allocations

8. **Projects → Risk_Predictions** (1:N)
   - One project can have multiple risk predictions

9. **Users → Notifications** (1:N)
   - One user can have many notifications

10. **Users → Activity_Logs** (1:N)
    - One user can have many activity logs

---

## Database Setup Scripts

### Create Database

```sql
CREATE DATABASE enterprisesync_ai;
```

### Create Tables (PostgreSQL)

```sql
-- Create Roles table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Create Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    location VARCHAR(200)
);

-- Create Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER NOT NULL REFERENCES roles(role_id),
    department_id INTEGER REFERENCES departments(department_id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Create Projects table
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    manager_id INTEGER NOT NULL REFERENCES users(user_id),
    project_name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    priority VARCHAR(20) DEFAULT 'medium',
    completion_percentage FLOAT DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'active',
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    CHECK (completion_percentage BETWEEN 0 AND 100)
);

-- Create Tasks table
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    deadline DATE,
    status VARCHAR(20) DEFAULT 'todo',
    CHECK (priority IN ('low', 'medium', 'high')),
    CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked'))
);

-- Create Assets table
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    asset_name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    purchase_date DATE,
    status VARCHAR(20) DEFAULT 'available',
    CHECK (status IN ('available', 'assigned', 'maintenance', 'retired'))
);

-- Create Asset_Allocations table
CREATE TABLE asset_allocations (
    allocation_id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(asset_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    assigned_date DATE NOT NULL,
    returned_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    CHECK (status IN ('active', 'returned'))
);

-- Create Risk_Predictions table
CREATE TABLE risk_predictions (
    risk_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id),
    risk_score FLOAT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    predicted_delay_days INTEGER DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (risk_score BETWEEN 0 AND 100),
    CHECK (risk_level IN ('low', 'medium', 'high'))
);

-- Create Notifications table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (type IN ('deadline', 'assignment', 'completion', 'risk_alert', 'asset'))
);

-- Create Activity_Logs table
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    activity TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
```

---

## Sample Data

```sql
-- Insert Roles
INSERT INTO roles (role_name) VALUES ('admin'), ('manager'), ('employee');

-- Insert Departments
INSERT INTO departments (department_name, location) VALUES
('Engineering', 'Building A, Floor 3'),
('Marketing', 'Building B, Floor 2'),
('Human Resources', 'Building A, Floor 1');

-- Insert Users (password is 'password123' hashed with bcrypt)
INSERT INTO users (name, email, password, role_id, department_id) VALUES
('Admin User', 'admin@enterprisesync.ai', '$2b$12$hashed_password', 1, 1),
('John Manager', 'john@enterprisesync.ai', '$2b$12$hashed_password', 2, 1),
('Jane Employee', 'jane@enterprisesync.ai', '$2b$12$hashed_password', 3, 1);
```

---

## Performance Optimization

1. **Indexes** on frequently queried columns
2. **Foreign Key constraints** for data integrity
3. **Check constraints** for data validation
4. **Cascade deletes** where appropriate
5. **Timestamp indexes** for time-based queries

---

## Backup Strategy

```bash
# Daily backup
pg_dump enterprisesync_ai > backup_$(date +%Y%m%d).sql

# Restore
psql enterprisesync_ai < backup_20260731.sql
```

---

**Database Version: PostgreSQL 14+**
