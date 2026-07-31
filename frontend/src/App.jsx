import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Employees from './pages/Employees'
import EmployeeSelfProfile from './pages/EmployeeSelfProfile'
import Departments from './pages/Departments'
import Assets from './pages/Assets'
import RiskPrediction from './pages/RiskPrediction'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

// Role-based default home redirect
function RoleHome({ user }) {
  const role = (user?.role || 'employee').toLowerCase()
  if (role === 'employee') return <Navigate to="/profile" replace />
  return <Dashboard />
}

// Guard: redirect if user doesn't have access
function RoleGuard({ user, allowedRoles, children }) {
  const role = (user?.role || 'employee').toLowerCase()
  if (!allowedRoles.includes(role)) {
    if (role === 'employee') return <Navigate to="/profile" replace />
    return <Navigate to="/" replace />
  }
  return children
}

// Inner wrapper that has access to useNavigate (must be inside BrowserRouter)
function AppRoutes() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const t = localStorage.getItem('es_token')
      const u = localStorage.getItem('es_user')
      if (t && u) setUser(JSON.parse(u))
    } catch (_) {}
    setReady(true)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('es_token', token)
    localStorage.setItem('es_user', JSON.stringify(userData))
    setUser(userData)
    // Explicit navigate — don't rely solely on route-based redirect
    const role = (userData?.role || 'employee').toLowerCase()
    if (role === 'employee') {
      navigate('/profile', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  const logout = () => {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    setUser(null)
    navigate('/login', { replace: true })
  }

  if (!ready) return null

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'employee' ? '/profile' : '/'} replace /> : <Login onLogin={login} />} />

      {/* Protected */}
      <Route path="/" element={user ? <MainLayout user={user} onLogout={logout} /> : <Navigate to="/login" replace />}>

        {/* Default home — role-based redirect */}
        <Route index element={<RoleHome user={user} />} />

        {/* Employee profile */}
        <Route path="profile" element={<EmployeeSelfProfile />} />

        {/* Employees list — manager + admin only */}
        <Route path="employees" element={
          <RoleGuard user={user} allowedRoles={['admin', 'manager', 'hr']}>
            <Employees />
          </RoleGuard>
        } />

        {/* Admin / HR only */}
        <Route path="departments" element={
          <RoleGuard user={user} allowedRoles={['admin', 'hr']}>
            <Departments />
          </RoleGuard>
        } />
        <Route path="settings" element={
          <RoleGuard user={user} allowedRoles={['admin']}>
            <Settings />
          </RoleGuard>
        } />

        {/* Shared routes */}
        <Route path="projects"        element={<Projects />} />
        <Route path="tasks"           element={<Tasks />} />
        <Route path="assets"          element={<Assets />} />
        <Route path="risk-prediction" element={<RiskPrediction />} />
        <Route path="notifications"   element={<Notifications />} />
        <Route path="reports"         element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'employee' ? '/profile' : '/') : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
