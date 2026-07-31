# Frontend Development Guide

## 🎨 EnterpriseSync AI - Frontend Documentation

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Component Library](#component-library)
4. [State Management](#state-management)
5. [Routing](#routing)
6. [API Integration](#api-integration)
7. [Styling Guide](#styling-guide)
8. [Forms & Validation](#forms--validation)
9. [Authentication Flow](#authentication-flow)
10. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

The frontend is built using **React 19** with **Vite** as the build tool, following a component-based architecture with clear separation of concerns.

### Technology Stack
- **React 19** - UI library with latest features
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **React Hook Form** - Form management

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── Loader.jsx
│   │   │
│   │   ├── charts/          # Chart components
│   │   │   ├── PieChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   ├── LineChart.jsx
│   │   │   └── GaugeChart.jsx
│   │   │
│   │   └── dashboard/       # Dashboard-specific
│   │       ├── StatCard.jsx
│   │       ├── ActivityFeed.jsx
│   │       └── DeadlineList.jsx
│   │
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── Tasks.jsx
│   │   ├── Employees.jsx
│   │   ├── Departments.jsx
│   │   ├── Assets.jsx
│   │   ├── RiskPrediction.jsx
│   │   ├── Notifications.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   └── Profile.jsx
│   │
│   ├── layouts/             # Layout components
│   │   ├── MainLayout.jsx   # Main app layout with sidebar
│   │   ├── AuthLayout.jsx   # Login/Register layout
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   ├── useApi.js        # API calling hook
│   │   ├── useDebounce.js   # Debounce hook
│   │   ├── useLocalStorage.js
│   │   └── useNotification.js
│   │
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   ├── taskService.js
│   │   ├── userService.js
│   │   ├── assetService.js
│   │   └── riskService.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatters.js    # Date, currency formatters
│   │   ├── validators.js    # Validation helpers
│   │   ├── constants.js     # App constants
│   │   └── helpers.js       # General helpers
│   │
│   ├── context/             # React Context
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── .env.example             # Environment variables template
├── .eslintrc.cjs            # ESLint configuration
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

---

## 🧩 Component Library

### Common Components

#### Button Component
```jsx
// components/common/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        rounded-lg font-medium 
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
```

#### Card Component
```jsx
// components/common/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  action,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
```

#### Input Component
```jsx
// components/common/Input.jsx
import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
```

---

## 🔄 State Management

We use **React Context API** for global state management combined with local component state.

### Auth Context
```jsx
// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { user, token } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 🛣️ Routing

Using **React Router v6** for client-side routing with protected routes.

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
// ... other imports

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/risk-prediction" element={<RiskPrediction />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🌐 API Integration

### Axios Setup
```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Layer Example
```javascript
// services/projectService.js
import api from './api';

export const projectService = {
  getAllProjects: () => api.get('/api/projects'),
  
  getProjectById: (id) => api.get(`/api/projects/${id}`),
  
  createProject: (data) => api.post('/api/projects', data),
  
  updateProject: (id, data) => api.put(`/api/projects/${id}`, data),
  
  deleteProject: (id) => api.delete(`/api/projects/${id}`),
  
  getProjectTasks: (id) => api.get(`/api/projects/${id}/tasks`)
};
```

---

## 🎨 Styling Guide

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

### Design System

**Colors**
- Primary: `#2563EB` (Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Danger: `#EF4444` (Red)
- Background: `#F8FAFC`

**Typography**
- Font Family: Inter
- Headings: Font weight 600-700
- Body: Font weight 400

**Spacing**
- Use Tailwind's spacing scale (4px base)
- Cards: `p-6` (24px padding)
- Gaps: `gap-4` or `gap-6`

**Shadows**
- Cards: `shadow-md`
- Modals: `shadow-2xl`
- Hover: `hover:shadow-lg`

---

## 📝 Forms & Validation

Using **React Hook Form** for efficient form handling.

```jsx
import { useForm } from 'react-hook-form';

const ProjectForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Project Name"
        {...register('project_name', { 
          required: 'Project name is required',
          minLength: { value: 3, message: 'Min 3 characters' }
        })}
        error={errors.project_name?.message}
      />
      
      <Button type="submit">Create Project</Button>
    </form>
  );
};
```

---

## 🔐 Authentication Flow

1. User submits login form
2. Frontend calls `/api/auth/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Token added to all API requests via interceptor
6. Protected routes check for valid token
7. Logout clears token and redirects to login

---

## ✅ Best Practices

1. **Component Structure**: Keep components small and focused
2. **Code Splitting**: Use React.lazy for route-based splitting
3. **Error Boundaries**: Wrap components with error boundaries
4. **Accessibility**: Use semantic HTML and ARIA labels
5. **Performance**: Memoize expensive computations with useMemo
6. **Naming**: Use PascalCase for components, camelCase for functions
7. **File Organization**: Group related components together
8. **Props**: Use destructuring and default values
9. **State**: Keep state as local as possible
10. **Testing**: Write tests for critical components

---

## 📦 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Environment Variables
```env
VITE_API_URL=https://api.enterprisesync.ai
VITE_APP_NAME=EnterpriseSync AI
```

---

## 🔍 Debugging

- Use React DevTools for component inspection
- Use Network tab for API debugging
- Console log with descriptive messages
- Use error boundaries for error handling

---

**Happy Coding! 🚀**
