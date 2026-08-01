import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Building2, Package, AlertTriangle, Bell, FileText,
  Settings, LogOut, Briefcase, Menu, X, User, ChevronRight, Sparkles, Search, Command
} from 'lucide-react'
import GlobalSearchModal from '../components/GlobalSearchModal'
import AiCopilotWidget from '../components/AiCopilotWidget'

// Nav items per role
const NAV_BY_ROLE = {
  employee: [
    { to: '/profile',       end: false, icon: User,            label: 'My Profile' },
    { to: '/tasks',         end: false, icon: CheckSquare,     label: 'My Tasks' },
    { to: '/assets',        end: false, icon: Package,         label: 'My Assets' },
    { to: '/notifications', end: false, icon: Bell,            label: 'Notifications' },
  ],
  manager: [
    { to: '/',              end: true,  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees',     end: false, icon: Users,           label: 'All Employees' },
    { to: '/projects',      end: false, icon: FolderKanban,    label: 'Projects' },
    { to: '/tasks',         end: false, icon: CheckSquare,     label: 'Tasks' },
    { to: '/risk-prediction', end: false, icon: AlertTriangle, label: 'Risk Engine' },
    { to: '/reports',       end: false, icon: FileText,        label: 'Reports' },
    { to: '/notifications', end: false, icon: Bell,            label: 'Notifications' },
  ],
  admin: [
    { to: '/',              end: true,  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees',     end: false, icon: Users,           label: 'Manage Employees' },
    { to: '/projects',      end: false, icon: FolderKanban,    label: 'Projects' },
    { to: '/tasks',         end: false, icon: CheckSquare,     label: 'Tasks' },
    { to: '/departments',   end: false, icon: Building2,       label: 'Departments' },
    { to: '/assets',        end: false, icon: Package,         label: 'Assets' },
    { to: '/risk-prediction', end: false, icon: AlertTriangle, label: 'Risk Engine' },
    { to: '/notifications', end: false, icon: Bell,            label: 'Notifications' },
    { to: '/reports',       end: false, icon: FileText,        label: 'Reports' },
    { to: '/settings',      end: false, icon: Settings,        label: 'Settings' },
  ],
}

const ROLE_BADGE = {
  employee: { color: '#0d9488', bg: 'rgba(13,148,136,0.15)', label: 'Employee' },
  manager:  { color: '#059669', bg: 'rgba(5,150,105,0.15)',  label: 'Manager' },
  admin:    { color: '#0f766e', bg: 'rgba(15,118,110,0.18)', label: 'Admin' },
}

export default function MainLayout({ user, onLogout }) {
  const [open, setOpen] = useState(true)
  const [alertCount, setAlertCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Cmd+K or Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const userRole = (user?.role || 'employee').toLowerCase()
  const NAV = NAV_BY_ROLE[userRole] || NAV_BY_ROLE.employee
  const badge = ROLE_BADGE[userRole] || ROLE_BADGE.employee

  // ── Live unread notification count ─────────────────────────────────────────
  // Reads from localStorage (shared with Notifications.jsx)
  // Re-runs whenever Notifications page fires 'es_notifications_updated' event
  const getUnreadCount = () => {
    try {
      const stored = localStorage.getItem('es_notifications')
      if (stored) {
        const notifs = JSON.parse(stored)
        return notifs.filter(n => !n.is_read).length
      }
    } catch {}
    return 0
  }

  useEffect(() => {
    // Initial count
    setAlertCount(getUnreadCount())

    // Update badge every time a notification is marked read
    const handleUpdate = () => setAlertCount(getUnreadCount())
    window.addEventListener('es_notifications_updated', handleUpdate)
    return () => window.removeEventListener('es_notifications_updated', handleUpdate)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: open ? 248 : 72, flexShrink: 0,
        background: 'linear-gradient(180deg, #0f2027 0%, #1a3040 100%)',
        color: '#fff',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        boxShadow: '4px 0 28px rgba(15,32,39,0.18)',
        zIndex: 20
      }}>
        {/* Logo */}
        <div style={{ height: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            borderRadius: 12, padding: 9, flexShrink: 0,
            boxShadow: '0 4px 12px rgba(13,148,136,0.40)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Briefcase size={18} color="#fff" />
          </div>
          {open && (
            <div style={{ overflow: 'hidden', animation: 'fadeIn 0.3s ease both' }}>
              <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', color: '#fff', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 6 }}>
                EnterpriseSync
                <Sparkles size={12} color="#5eead4" />
              </div>
              <div style={{ fontSize: 10, color: '#5eead4', whiteSpace: 'nowrap', fontWeight: 600, letterSpacing: '0.5px' }}>
                AI WORKFORCE PLATFORM
              </div>
            </div>
          )}
        </div>

        {/* Role badge pill */}
        {open && (
          <div style={{ margin: '14px 14px 6px', padding: '8px 14px', background: badge.bg, borderRadius: 12, border: `1px solid ${badge.color}30`, animation: 'fadeIn 0.3s ease both' }}>
            <div style={{ fontSize: 10, color: badge.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{badge.label} PORTAL</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.color, boxShadow: `0 0 8px ${badge.color}` }} />
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px' }}>
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={end} title={!open ? label : undefined}
              className={({ isActive }) => `nav-link-animated ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: open ? '10px 14px' : '12px 14px',
                borderRadius: 10, marginBottom: 4,
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap', overflow: 'hidden',
                background: isActive ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : 'transparent',
                color: isActive ? '#fff' : '#8fa3b0',
                boxShadow: isActive ? '0 4px 14px rgba(13,148,136,0.30)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                justifyContent: open ? 'flex-start' : 'center'
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = '#f8fafc'
                  e.currentTarget.style.transform = 'translateX(2px)'
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#94a3b8'
                  e.currentTarget.style.transform = 'none'
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0, transition: 'transform 0.2s' }} />
              {open && <span style={{ flex: 1 }}>{label}</span>}
              {open && location.pathname === to && <ChevronRight size={14} opacity={0.7} />}
            </NavLink>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          {open && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>
                  {user?.name?.[0] ?? 'U'}
                </div>
                <span className="es-pulse-dot" style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, border: '2px solid #0f172a' }} />
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 10, color: badge.color, textTransform: 'capitalize', fontWeight: 600 }}>
                  {badge.label} Account
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => { onLogout(); navigate('/login', { replace: true }) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', borderRadius: 10, background: 'transparent',
              border: 'none', color: '#94a3b8', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              justifyContent: open ? 'flex-start' : 'center'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Glassmorphism Header */}
        <header style={{
          height: 70,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', flexShrink: 0, zIndex: 10,
          boxShadow: '0 1px 3px rgba(15,23,42,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setOpen(p => !p)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="es-pulse-dot" />
                {userRole === 'employee' ? '👤 Employee Portal' :
                 userRole === 'manager'  ? '👔 Manager Portal — Executive Operations' :
                                           '🛡️ Admin Portal — Full System Control'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Quick Global Search Launcher Button */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '7px 14px', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)' }}
            >
              <Search size={15} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>Quick Search…</span>
              <kbd style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 6, padding: '2px 6px', fontSize: 11, fontWeight: 700,
                color: 'var(--text-secondary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                ⌘K
              </kbd>
            </button>
            {/* Notification Bell button */}
            <NavLink
              to="/notifications"
              style={{
                position: 'relative', color: 'var(--text-secondary)', display: 'flex',
                background: 'var(--surface-2)', padding: 10, borderRadius: 12,
                border: '1px solid var(--border)', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
            >
              <Bell size={20} color="var(--text-secondary)" />
              {alertCount > 0 && (
                <span className="notif-badge">
                  {alertCount}
                </span>
              )}
            </NavLink>

            {/* Profile badge header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '6px 14px 6px 8px', background: 'var(--surface-2)',
              borderRadius: 30, border: '1px solid var(--border)'
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#0d9488,#14b8a6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(13,148,136,0.28)'
              }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                  {user?.name?.[0] ?? 'U'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: badge.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {badge.label}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet with smooth page transition */}
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }} key={location.pathname}>
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Floating AI Copilot Assistant Widget */}
      <AiCopilotWidget user={user} />
    </div>
  )
}
