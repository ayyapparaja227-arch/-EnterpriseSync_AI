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
import Integrations from './pages/Integrations'
import Timesheets from './pages/Timesheets'
import { useIdleTimer, SessionTimeoutModal } from './hooks/useIdleTimer'

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

      // Apply saved theme on initial app launch
      const savedTheme = localStorage.getItem('es_theme') || 'light'
      const isDark = savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.body.classList.add('dark-mode')
      } else {
        document.documentElement.removeAttribute('data-theme')
        document.body.classList.remove('dark-mode')
      }
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

  const logout = (reason) => {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    setUser(null)
    if (reason === 'timeout') {
      // Pass a flag so login page can show "Session expired" message
      navigate('/login?reason=timeout', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }

  // ── Session Idle Timer (15 min idle → 2 min warning → auto logout) ──────────
  const { showWarning, countdown, stayLoggedIn } = useIdleTimer({
    onLogout: logout,
    idleMinutes: 15,
    warningMinutes: 2,
    active: !!user   // Only runs when a user is logged in
  })

  if (!ready) return null

  return (
    <>
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
          <Route path="timesheets"      element={<Timesheets />} />
          <Route path="risk-prediction" element={<RiskPrediction />} />
          <Route path="notifications"   element={<Notifications />} />
          <Route path="reports"         element={<Reports />} />
          <Route path="integrations"    element={
            <RoleGuard user={user} allowedRoles={['admin']}>
              <Integrations />
            </RoleGuard>
          } />
        </Route>

        <Route path="*" element={<Navigate to={user ? (user.role === 'employee' ? '/profile' : '/') : '/login'} replace />} />
      </Routes>

      {/* ── Session Timeout Warning Modal ── */}
      <SessionTimeoutModal
        show={showWarning}
        countdown={countdown}
        onStay={stayLoggedIn}
        onLogout={() => logout('timeout')}
      />
    </>
  )
}


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
