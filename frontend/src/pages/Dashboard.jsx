import { useState, useEffect } from 'react'
import {
  FolderKanban, Users, CheckSquare, AlertTriangle, TrendingUp,
  Building2, Package, Activity, Clock, ShieldCheck, CheckCircle2,
  XCircle, Zap, Sparkles, UserCheck, Calendar, ArrowRight, RefreshCw, FileText
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import api from '../api'

import { EmployeeDetailModal } from './Employees'
import { MOCK_EMPLOYEES } from '../mockData'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function StatCard({ title, value, icon: Icon, bg, sub, delay = 'delay-1' }) {
  return (
    <div
      className={`es-card animate-fadeInUp ${delay} hover-lift`}
      style={{
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: 'var(--surface)',
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${bg}dd 100%)`,
        borderRadius: 16,
        padding: 14,
        flexShrink: 0,
        boxShadow: `0 6px 16px ${bg}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s ease'
      }}>
        <Icon size={24} color="#fff" />
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, margin: 0, letterSpacing: '0.2px' }}>{title}</p>
        <p className="es-stat-value" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '3px 0 0' }}>{value}</p>
        {sub && (
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: sub.includes('↑') ? 'var(--success)' : sub.includes('↓') ? 'var(--danger)' : 'var(--text-muted)',
            margin: '2px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

const MOCK_DEFAULT_CHARTS = {
  project_status: [
    { name: 'Completed', value: 4 },
    { name: 'In Progress', value: 3 },
    { name: 'On Hold', value: 1 },
    { name: 'Delayed', value: 1 },
  ],
  employee_workload: [
    { name: 'Arun Kumar', active_tasks: 5 },
    { name: 'Priya Sharma', active_tasks: 3 },
    { name: 'Rahul Patel', active_tasks: 4 },
  ],
  department_distribution: [
    { name: 'Engineering', value: 2 },
    { name: 'Marketing', value: 1 },
    { name: 'Human Resources', value: 1 },
    { name: 'Administration', value: 1 },
  ]
}

const MOCK_AUDIT_LOGS = [
  { id: 1, action: 'LOGIN',          resource: 'Admin User logged in from 192.168.1.10',            timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 2, action: 'CREATE',         resource: 'New employee "Karthik Raj" added to Engineering',   timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: 3, action: 'UPDATE',         resource: 'Project "EnterpriseSync v2" status → In Progress', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 4, action: 'ASSIGN',         resource: 'Task "API Integration" assigned to Priya Sharma',  timestamp: new Date(Date.now() - 28 * 60000).toISOString() },
  { id: 5, action: 'LEAVE APPROVED', resource: 'Leave request #12 approved for Rahul Patel',        timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 6, action: 'ASSET ASSIGNED', resource: 'MacBook Pro M3 assigned to Arun Kumar',             timestamp: new Date(Date.now() - 62 * 60000).toISOString() },
  { id: 7, action: 'DELETE',         resource: 'Obsolete task "Legacy Migration" removed',          timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: 8, action: 'ROLE CHANGE',    resource: 'Meena Krishnan role updated: Employee → HR Manager', timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
]

export default function Dashboard() {
  const storedUser = JSON.parse(localStorage.getItem('es_user') || '{}')
  const userRole = (storedUser.role || 'admin').toLowerCase()
  const [activeTabRole, setActiveTabRole] = useState(userRole)
  const [selectedEmpForModal, setSelectedEmpForModal] = useState(null)

  const [stats, setStats] = useState({ active_projects: 3, high_risk_projects_count: 1, pending_tasks: 8, workload_imbalance_alerts: 1 })
  const [charts, setCharts] = useState(MOCK_DEFAULT_CHARTS)
  const [myTasks, setMyTasks] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [burnoutAlerts, setBurnoutAlerts] = useState([])
  const [workloadRebalance, setWorkloadRebalance] = useState(null)
  const [careerSuggestions, setCareerSuggestions] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState('')

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/api/dashboard/stats').catch(() => null),
        api.get('/api/dashboard/charts').catch(() => null)
      ])
      if (sRes) setStats(sRes)
      if (cRes && cRes.project_status?.length) {
        setCharts(cRes)
      } else {
        setCharts(MOCK_DEFAULT_CHARTS)
      }

      // Fetch role-specific details
      if (activeTabRole === 'employee' || userRole === 'employee') {
        const [tRes, cSug] = await Promise.all([
          api.get('/api/tasks'),
          api.get('/api/ai/career-suggestions')
        ])
        setMyTasks(tRes)
        setCareerSuggestions(cSug)
      }

      if (activeTabRole === 'hr' || userRole === 'hr' || activeTabRole === 'admin') {
        const [lRes, bRes] = await Promise.all([
          api.get('/api/leave-requests'),
          api.get('/api/ai/burnout-productivity')
        ])
        setLeaveRequests(lRes)
        setBurnoutAlerts(bRes)
      }

      if (activeTabRole === 'manager' || userRole === 'manager' || activeTabRole === 'admin') {
        const wRes = await api.get('/api/ai/workload-rebalance')
        setWorkloadRebalance(wRes)
      }

      if (activeTabRole === 'admin' || userRole === 'admin') {
        const logRes = await api.get('/api/activity-logs').catch(() => [])
        setActivityLogs(Array.isArray(logRes) && logRes.length > 0 ? logRes : MOCK_AUDIT_LOGS)
      }
    } catch (e) {
      console.error("Dashboard fetch error", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [activeTabRole])

  const handleCheckIn = async () => {
    try {
      const res = await api.post('/api/attendance/checkin')
      setCheckedIn(true)
      setActionMessage(res.message || 'Check-in recorded!')
      setTimeout(() => setActionMessage(''), 4000)
    } catch (err) {
      setActionMessage(err.response?.data?.detail || 'Check-in failed')
    }
  }

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus })
      setMyTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      setActionMessage(`Task status updated to ${newStatus}`)
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setActionMessage('Failed to update task')
    }
  }

  const handleLeaveStatusUpdate = async (leaveId, status) => {
    try {
      await api.put(`/api/leave-requests/${leaveId}`, { status })
      setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l))
      setActionMessage(`Leave request #${leaveId} set to ${status}`)
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setActionMessage('Action failed')
    }
  }

  const handleExecuteRebalance = async (rec) => {
    try {
      const res = await api.post('/api/ai/workload-rebalance/execute', {
        from_user_id: rec.from_user_id,
        to_user_id: rec.to_user_id,
        task_count: rec.transfer_count
      })
      setActionMessage(res.message)
      loadDashboardData()
      setTimeout(() => setActionMessage(''), 4000)
    } catch (err) {
      setActionMessage('Rebalance execution failed')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
        <div className="es-loader">
          <span />
          <span />
          <span />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, letterSpacing: '0.2px' }}>
          Loading Enterprise Portal…
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fadeIn">

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="es-toast es-toast-success animate-scaleIn" style={{ position: 'relative', bottom: 'auto', right: 'auto', maxWidth: '100%' }}>
          <CheckCircle2 size={18} />
          {actionMessage}
        </div>
      )}

      {/* Top Header & Role Switcher Bar */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              {activeTabRole === 'employee' ? '👤 Employee Portal' :
                activeTabRole === 'hr' ? '👩‍💼 HR Operations Portal' :
                activeTabRole === 'manager' ? '👔 Project Manager Portal' :
                '👨‍💼 Admin Executive Portal'}
            </h1>
            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
              Role: {userRole}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            Welcome, <strong>{storedUser.name}</strong> ({storedUser.department || 'Enterprise Sync'})
          </p>
        </div>

        {/* Role Portal Switcher Tabs — only Admin can switch tabs */}
        {userRole === 'admin' ? (
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
            {[
              { id: 'employee', label: 'Employee', emoji: '👤' },
              { id: 'hr', label: 'HR Manager', emoji: '👩‍💼' },
              { id: 'manager', label: 'Proj Manager', emoji: '👔' },
              { id: 'admin', label: 'Admin', emoji: '👨‍💼' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabRole(tab.id)}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none',
                  background: activeTabRole === tab.id ? '#2563eb' : 'transparent',
                  color: activeTabRole === tab.id ? '#fff' : '#475569',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <span>{tab.emoji}</span>{tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ background: '#f1f5f9', padding: '8px 18px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#475569' }}>
            {userRole === 'manager' ? '👔 Manager Portal' :
             userRole === 'hr'      ? '👩‍💼 HR Portal' :
                                      '👤 Employee Portal'}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EMPLOYEE DASHBOARD PORTAL                                              */}
      {/* ========================================================================= */}
      {activeTabRole === 'employee' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard title="Assigned Tasks" value={stats.total_assigned_tasks ?? myTasks.length} icon={CheckSquare} bg="#2563eb" sub={`${stats.completed_tasks ?? 0} Completed`} />
            <StatCard title="Leave Balance" value={`${stats.leave_balance_days ?? 15} Days`} icon={Calendar} bg="#10b981" sub="Annual Allowance" />
            <StatCard title="Performance Score" value={`${stats.performance_score ?? 4.8}/5.0`} icon={TrendingUp} bg="#f59e0b" sub="Top Tier Rating" />
            <StatCard title="Assigned Assets" value={`${stats.assigned_assets_count ?? 2} Devices`} icon={Package} bg="#8b5cf6" sub="Hardware & Licenses" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
            {/* Left: My Assigned Tasks */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>📋 My Active Tasks</h3>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Click status to update</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myTasks.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>No pending assigned tasks.</p>
                ) : (
                  myTasks.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: 14 }}>{t.title}</p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Project: {t.project_name || 'Enterprise'} · Due: {t.due_date}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['todo', 'in_progress', 'completed'].map(st => (
                          <button
                            key={st}
                            onClick={() => handleTaskStatusChange(t.id, st)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              background: t.status === st ? (st === 'completed' ? '#10b981' : st === 'in_progress' ? '#2563eb' : '#94a3b8') : '#e2e8f0',
                              color: t.status === st ? '#fff' : '#475569'
                            }}
                          >
                            {st === 'todo' ? 'To Do' : st === 'in_progress' ? 'In Progress' : 'Done'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Today's Attendance & Career Suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Attendance Card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>🕒 Daily Attendance Check-In</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0f9ff', padding: '14px 18px', borderRadius: 12, border: '1px solid #bae6fd' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0369a1', margin: 0 }}>Today: {new Date().toLocaleDateString()}</p>
                    <p style={{ fontSize: 12, color: '#0284c7', margin: '2px 0 0' }}>Status: {checkedIn ? '✅ Checked In' : 'Not Recorded'}</p>
                  </div>
                  <button
                    onClick={handleCheckIn}
                    disabled={checkedIn}
                    style={{
                      background: checkedIn ? '#94a3b8' : '#2563eb',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: checkedIn ? 'default' : 'pointer'
                    }}
                  >
                    {checkedIn ? 'Done' : 'Check In Now'}
                  </button>
                </div>
              </div>

              {/* AI Career Suggestions */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Sparkles size={18} color="#8b5cf6" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>AI Career Growth & Skills</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {careerSuggestions.map((s, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', background: '#faf5ff', borderRadius: 10, border: '1px solid #f3e8ff' }}>
                      <p style={{ fontWeight: 700, color: '#6b21a8', fontSize: 13, margin: 0 }}>{s.title}</p>
                      <p style={{ fontSize: 12, color: '#7e22ce', margin: '2px 0 0' }}>{s.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HR MANAGER DASHBOARD PORTAL                                            */}
      {/* ========================================================================= */}
      {activeTabRole === 'hr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* HR Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard title="Total Employees" value={stats.total_employees ?? 6} icon={Users} bg="#2563eb" sub="All Departments" />
            <StatCard title="Pending Leave Requests" value={stats.pending_leave_requests ?? leaveRequests.filter(l => l.status === 'pending').length} icon={Clock} bg="#f59e0b" sub="Requires HR Review" />
            <StatCard title="Asset Utilization Rate" value={`${stats.asset_utilization_pct ?? 87.5}%`} icon={Package} bg="#10b981" sub="Hardware & Equipment" />
            <StatCard title="High Burnout Alerts" value={stats.high_risk_burnout_count ?? burnoutAlerts.length} icon={AlertTriangle} bg="#ef4444" sub="AI Health Flag" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
            {/* Leave Requests Management */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>📝 Employee Leave Approvals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {leaveRequests.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>No pending leave requests.</p>
                ) : (
                  leaveRequests.map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div>
                        <p style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: 14 }}>{l.user_name}</p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>{l.start_date} to {l.end_date} · Reason: {l.reason}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {l.status === 'pending' ? (
                          <>
                            <button onClick={() => handleLeaveStatusUpdate(l.id, 'approved')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => handleLeaveStatusUpdate(l.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Reject</button>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 700, color: l.status === 'approved' ? '#10b981' : '#ef4444', textTransform: 'capitalize' }}>
                            {l.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Burnout & Productivity Alerts */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Zap size={18} color="#ef4444" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>🤖 AI Burnout & Wellness Radar</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {burnoutAlerts.length === 0 ? (
                  <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>✅ All employee workload & burnout indicators are normal.</p>
                ) : (
                  burnoutAlerts.map(b => (
                    <div key={b.user_id} style={{ padding: 14, background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 700, color: '#991b1b', margin: 0, fontSize: 14 }}>{b.name}</p>
                        <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>Score: {b.burnout_score}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#b91c1c', margin: '4px 0 0' }}>{b.action}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROJECT MANAGER DASHBOARD PORTAL                                      */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 3. PROJECT MANAGER DASHBOARD PORTAL                                      */}
      {/* ========================================================================= */}
      {activeTabRole === 'manager' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Manager Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard title="Active Projects" value={stats.active_projects ?? 3} icon={FolderKanban} bg="#2563eb" sub="On Track Execution" />
            <StatCard title="High Risk Projects" value={stats.high_risk_projects_count ?? 1} icon={AlertTriangle} bg="#ef4444" sub="AI Delay Probability" />
            <StatCard title="Pending Tasks" value={stats.pending_tasks ?? 8} icon={CheckSquare} bg="#f59e0b" sub="Active In Backlog" />
            <StatCard title="Workload Alerts" value={stats.workload_imbalance_alerts ?? (workloadRebalance?.recommendations?.length || 0)} icon={Zap} bg="#8b5cf6" sub="Imbalance Detected" />
          </div>

          {/* Manager Quick Access: All Employee Dashboards Card Section */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  👥 All Employees Overview & Dashboards
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  Click any employee card to inspect their complete personal dashboard, assigned tasks, and performance.
                </p>
              </div>
              <a href="/employees" style={{ fontSize: 13, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                View All Directory →
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { id: 1, name: 'Arun Kumar', role: 'Employee', dept: 'Engineering', pos: 'Senior Software Engineer', tasks: '5 Active Tasks', perf: '4.8/5.0', initial: 'A', bg: '#2563eb' },
                { id: 2, name: 'Priya Sharma', role: 'Employee', dept: 'Marketing', pos: 'Marketing Analyst', tasks: '3 Active Tasks', perf: '4.5/5.0', initial: 'P', bg: '#10b981' },
                { id: 3, name: 'Rahul Patel', role: 'Employee', dept: 'Human Resources', pos: 'HR Executive', tasks: '4 Active Tasks', perf: '4.6/5.0', initial: 'R', bg: '#8b5cf6' },
              ].map(empItem => (
                <div
                  key={empItem.id}
                  onClick={() => {
                    const fullEmp = {
                      id: empItem.id,
                      name: empItem.name,
                      role: 'employee',
                      department: empItem.dept,
                      position: empItem.pos,
                      email: `${empItem.name.toLowerCase().replace(' ', '')}@company.com`,
                      performance: parseFloat(empItem.perf),
                      phone: '+91 98765 43210',
                      joinDate: '2023-01-15',
                      skills: ['React', 'Node.js', 'Python'],
                      salary: '₹8,50,000 / yr',
                      tasksCompleted: 40,
                      tasksActive: 4,
                      leaveBalance: 15
                    }
                    setSelectedEmpForModal(fullEmp)
                  }}
                  style={{
                    background: '#f8fafc', borderRadius: 14, padding: 18, border: '1.5px solid #e2e8f0',
                    cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: 12
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: empItem.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                      {empItem.initial}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{empItem.name}</h4>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{empItem.pos}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 12 }}>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>{empItem.tasks}</span>
                    <span style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>⭐ {empItem.perf}</span>
                  </div>

                  <button style={{ width: '100%', padding: '8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    🔍 Inspect Employee Dashboard
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Workload Rebalancing Engine Card */}
          {workloadRebalance && workloadRebalance.recommendations?.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 16, padding: 24, color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Sparkles size={22} color="#60a5fa" />
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>🤖 AI Workload Rebalancing Engine</h3>
              </div>
              {workloadRebalance.recommendations.map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.08)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#93c5fd' }}>{rec.reason}</p>
                    <p style={{ fontSize: 13, color: '#cbd5e1', margin: '4px 0 0' }}>Recommendation: Re-allocate {rec.transfer_count} active tasks from <strong>{rec.from_user}</strong> to <strong>{rec.to_user}</strong>.</p>
                  </div>
                  <button
                    onClick={() => handleExecuteRebalance(rec)}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    ⚡ Execute Rebalance Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Workload & Risk Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Team Workload Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.employee_workload} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="active_tasks" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Project Status Overview</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={charts.project_status} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {charts.project_status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN DASHBOARD PORTAL                                                */}
      {/* ========================================================================= */}
      {activeTabRole === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Admin System Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard title="Total System Users" value={stats.total_users ?? 6} icon={Users} bg="#2563eb" sub="Across 4 Departments" />
            <StatCard title="Total Projects" value={stats.total_projects ?? 3} icon={FolderKanban} bg="#10b981" sub="All Operational Statuses" />
            <StatCard title="Total Tasks" value={stats.total_tasks ?? 10} icon={CheckSquare} bg="#f59e0b" sub="In System Database" />
            <StatCard title="Company Assets" value={stats.total_assets ?? 8} icon={Package} bg="#8b5cf6" sub="Hardware & Soft Licenses" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
            {/* Live System Activity Log Feed */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>🛡️ Live System Audit Logs</h3>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>● System Healthy</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                {activityLogs.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>No recent activity logs.</p>
                ) : (
                  activityLogs.map(log => {
                    const mins = Math.round((Date.now() - new Date(log.timestamp)) / 60000)
                    const relTime = mins < 1 ? 'Just now' : mins < 60 ? `${mins}m ago` : `${Math.round(mins/60)}h ago`
                    const actionColors = {
                      LOGIN: '#2563eb', CREATE: '#059669', UPDATE: '#f59e0b',
                      ASSIGN: '#8b5cf6', DELETE: '#ef4444', 'LEAVE APPROVED': '#10b981',
                      'ASSET ASSIGNED': '#0284c7', 'ROLE CHANGE': '#d97706'
                    }
                    const badgeColor = actionColors[log.action] || '#6b7280'
                    return (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: badgeColor, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{log.action}</span>
                          <p style={{ fontSize: 12.5, color: '#334155', margin: 0 }}>{log.resource}</p>
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 10 }}>{relTime}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Department Distribution Pie Chart */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Department Headcount</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={charts.department_distribution} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {charts.department_distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Render Employee Detail Modal when inspected by Manager or Admin */}
      {selectedEmpForModal && (
        <EmployeeDetailModal
          emp={selectedEmpForModal}
          onClose={() => setSelectedEmpForModal(null)}
          allEmployees={MOCK_EMPLOYEES}
          onSelectEmp={sel => setSelectedEmpForModal(sel)}
        />
      )}

    </div>
  )
}
