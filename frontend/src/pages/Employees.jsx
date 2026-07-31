import { useState, useEffect } from 'react'
import {
  Users, Search, Mail, Building2, UserPlus, Edit, Trash2,
  CheckCircle2, X, Eye, Shield, UserCheck, Phone, Calendar, Award, Star,
  Activity, Circle, CheckSquare, ChevronRight
} from 'lucide-react'
import api from '../api'
import { MOCK_EMPLOYEES, MOCK_TASKS } from '../mockData'

const ROLE_COLORS = {
  admin:    { bg:'#ede9fe', color:'#7c3aed', label:'Admin' },
  manager:  { bg:'#dbeafe', color:'#1d4ed8', label:'Manager' },
  employee: { bg:'#f3f4f6', color:'#374151', label:'Employee' },
  hr:       { bg:'#fef3c7', color:'#b45309', label:'HR' },
}

const STATUS_CONFIG = {
  todo:        { color: '#f59e0b', bg: '#fffbeb', label: 'To Do',       icon: Circle },
  in_progress: { color: '#2563eb', bg: '#eff6ff', label: 'In Progress', icon: Activity },
  completed:   { color: '#10b981', bg: '#ecfdf5', label: 'Done',        icon: CheckCircle2 },
}

const PRIORITY_CONFIG = {
  high:   { color: '#ef4444', bg: '#fef2f2' },
  medium: { color: '#f59e0b', bg: '#fffbeb' },
  low:    { color: '#10b981', bg: '#ecfdf5' },
}

// ── Full Employee Dashboard Modal for Manager & Admin ──────────────────────
export function EmployeeDetailModal({ emp, onClose, allEmployees = [], onSelectEmp }) {
  if (!emp) return null

  const tasks = MOCK_TASKS[emp.id] || MOCK_TASKS[1] || []
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        padding: 20, backdropFilter: 'blur(4px)'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 860,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 100px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', position: 'relative'
      }}>
        {/* Top Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 70%, #3b82f6 100%)',
          padding: '28px 32px', color: '#fff', position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', color: '#fff'
            }}
          >
            <X size={20} />
          </button>

          {/* Quick Employee Switcher if list provided */}
          {allEmployees.length > 1 && onSelectEmp && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Switch Employee View:
              </label>
              <select
                value={emp.id}
                onChange={e => {
                  const selected = allEmployees.find(u => (u.id || u.user_id) === Number(e.target.value))
                  if (selected) onSelectEmp(selected)
                }}
                style={{
                  display: 'block', marginTop: 4, padding: '6px 12px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer'
                }}
              >
                {allEmployees.map(eItem => (
                  <option key={eItem.id || eItem.user_id} value={eItem.id || eItem.user_id} style={{ color: '#1e293b' }}>
                    {eItem.name} — ({eItem.department || eItem.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 30, fontWeight: 800, flexShrink: 0
            }}>
              {emp.name?.[0]?.toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{emp.name}</h2>
                <span style={{
                  background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                }}>
                  {emp.role}
                </span>
              </div>
              <p style={{ margin: '4px 0 8px', color: '#93c5fd', fontSize: 13 }}>
                {emp.position || 'Software Professional'} • {emp.department}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14}
                    fill={i <= Math.round(emp.performance || 4.5) ? '#fbbf24' : 'transparent'}
                    color={i <= Math.round(emp.performance || 4.5) ? '#fbbf24' : 'rgba(255,255,255,0.3)'}
                  />
                ))}
                <span style={{ color: '#93c5fd', fontSize: 12, marginLeft: 6, fontWeight: 600 }}>
                  {emp.performance || 4.5}/5.0 Performance Rating
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{emp.tasksCompleted || 42}</div>
                <div style={{ fontSize: 11, color: '#93c5fd' }}>Done</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{emp.tasksActive || tasks.length}</div>
                <div style={{ fontSize: 11, color: '#93c5fd' }}>Active</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{emp.leaveBalance || 15}d</div>
                <div style={{ fontSize: 11, color: '#93c5fd' }}>Leaves</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Content */}
        <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24 }}>
          {/* Left Column: Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={16} color="#2563eb" /> Personal Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: Mail, label: 'Email', value: emp.email },
                  { icon: Phone, label: 'Phone', value: emp.phone || '+91 98765 43210' },
                  { icon: Building2, label: 'Department', value: emp.department },
                  { icon: UserCheck, label: 'Position', value: emp.position || 'Software Engineer' },
                  { icon: Calendar, label: 'Joined Date', value: emp.joinDate || '2023-01-15' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} color="#2563eb" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={16} color="#7c3aed" /> Skills & Competencies
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(emp.skills || ['React', 'Node.js', 'Python']).map(s => (
                  <span key={s} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#7c3aed', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Compensation */}
            {emp.salary && (
              <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 16, padding: 18, border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                  💼 Compensation Details
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#14532d', marginTop: 4 }}>{emp.salary}</div>
              </div>
            )}
          </div>

          {/* Right Column: Tasks Dashboard */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#10b981" /> Assigned Tasks & Workload
              </h3>
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                {completedTasks}/{tasks.length} Completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map(t => {
                const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.todo
                const pc = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.low
                return (
                  <div key={t.id || t.title} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>{t.title}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>📁 {t.project} • 📅 {t.due}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span style={{ background: pc.bg, color: pc.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>
                        {t.priority}
                      </span>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                        {sc.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 28px 24px', textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', background: '#2563eb', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff' }}>
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper input component placed outside render scope so React never unmounts it on state change
const EmployeeFormField = ({ label, value, onChange, type='text', required=true, autoFocus=false }) => (
  <div>
    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 }}>{label}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={e => onChange(e.target.value)}
      autoFocus={autoFocus}
      style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
    />
  </div>
)

// Helper modal wrapper placed outside render scope so inputs preserve focus
const EmployeeModalWrapper = ({ title, onClose, onSubmit, btnLabel, btnColor='#2563eb', formData, setFormData, editingUser }) => (
  <div className="es-modal-overlay">
    <div className="es-modal" style={{ maxWidth: 500, padding: 28 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:'#111827', margin:0 }}>{title}</h2>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color="#6b7280" /></button>
      </div>
      <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <EmployeeFormField label="First Name" value={formData.first_name} onChange={v => setFormData(f=>({...f,first_name:v}))} autoFocus />
          <EmployeeFormField label="Last Name"  value={formData.last_name}  onChange={v => setFormData(f=>({...f,last_name:v}))} />
        </div>
        <EmployeeFormField label="Email Address" value={formData.email} onChange={v => setFormData(f=>({...f,email:v}))} type="email" />
        {!editingUser && <EmployeeFormField label="Password" value={formData.password} onChange={v => setFormData(f=>({...f,password:v}))} type="password" />}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 }}>Role</label>
            <select value={formData.role_id} onChange={e => setFormData(f=>({...f,role_id:parseInt(e.target.value)}))}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, background:'#fff', fontFamily:'inherit' }}>
              <option value={4}>Employee</option>
              <option value={3}>Manager</option>
              <option value={2}>HR Manager</option>
              <option value={1}>Admin</option>
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 }}>Department</label>
            <select value={formData.department_id} onChange={e => setFormData(f=>({...f,department_id:parseInt(e.target.value)}))}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #d1d5db', fontSize:13, background:'#fff', fontFamily:'inherit' }}>
              <option value={1}>Engineering</option>
              <option value={2}>Marketing</option>
              <option value={3}>Human Resources</option>
              <option value={4}>Administration</option>
            </select>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:10 }}>
          <button type="button" onClick={onClose} style={{ padding:'9px 18px', borderRadius:8, border:'1px solid #d1d5db', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          <button type="submit" style={{ padding:'9px 20px', borderRadius:8, border:'none', background:btnColor, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{btnLabel}</button>
        </div>
      </form>
    </div>
  </div>
)

export default function Employees() {
  const currentUser = JSON.parse(localStorage.getItem('es_user') || '{}')
  const userRole = (currentUser.role || 'employee').toLowerCase()
  const isAdmin   = userRole === 'admin'
  const isManager = userRole === 'manager'

  const [employees, setEmployees] = useState([])
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading]     = useState(true)
  const [actionMessage, setActionMessage] = useState('')
  const [viewingEmp, setViewingEmp] = useState(null)

  // Admin CRUD modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser]         = useState(null)
  const [formData, setFormData] = useState({ first_name:'', last_name:'', email:'', password:'Password123!', role_id:4, department_id:1, phone:'', position:'' })

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const data = await api.get('/api/users')
      if (Array.isArray(data) && data.length > 0) {
        setEmployees(data)
      } else {
        setEmployees(MOCK_EMPLOYEES.map(({ password:_, ...u }) => u))
      }
    } catch {
      setEmployees(MOCK_EMPLOYEES.map(({ password:_, ...u }) => u))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEmployees() }, [])

  const showMsg = (msg) => { setActionMessage(msg); setTimeout(() => setActionMessage(''), 4000) }

  const ROLE_MAP = { 1: 'admin', 2: 'hr', 3: 'manager', 4: 'employee' }
  const DEPT_MAP = { 1: 'Engineering', 2: 'Marketing', 3: 'Human Resources', 4: 'Administration' }

  const handleCreate = async (e) => {
    e.preventDefault()
    const name = `${formData.first_name} ${formData.last_name}`.trim()
    const newEmp = {
      id: Date.now(),
      name: name || 'New Employee',
      email: formData.email,
      role: ROLE_MAP[formData.role_id] || 'employee',
      department: DEPT_MAP[formData.department_id] || 'Engineering',
      position: formData.position || 'Software Professional',
      phone: formData.phone || '+91 98765 43210',
      performance: 4.8,
      joinDate: new Date().toISOString().slice(0,10),
      skills: ['React', 'JavaScript', 'Node.js'],
      tasksCompleted: 0,
      tasksActive: 0,
      leaveBalance: 15
    }

    try {
      const res = await api.post('/api/users', formData)
      const created = (res && res.name) ? res : newEmp
      setEmployees(prev => [created, ...prev])
    } catch {
      // Backend offline fallback — add employee locally
      setEmployees(prev => [newEmp, ...prev])
    }

    showMsg(`✅ Created employee: ${name}`)
    setShowCreateModal(false)
    setFormData({ first_name:'', last_name:'', email:'', password:'Password123!', role_id:4, department_id:1, phone:'', position:'' })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const updatedName = `${formData.first_name} ${formData.last_name}`.trim()
    const updatedData = {
      name: updatedName || editingUser.name,
      email: formData.email || editingUser.email,
      role: ROLE_MAP[formData.role_id] || editingUser.role,
      department: DEPT_MAP[formData.department_id] || editingUser.department,
    }

    try {
      await api.put(`/api/users/${editingUser.id}`, { first_name:formData.first_name, last_name:formData.last_name, email:formData.email, role_id:formData.role_id, department_id:formData.department_id })
    } catch {
      // Backend offline fallback
    }

    setEmployees(prev => prev.map(u => (u.id === editingUser.id || u.user_id === editingUser.id) ? { ...u, ...updatedData } : u))
    showMsg(`✅ Updated details for ${updatedName}`)
    setEditingUser(null)
  }

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}? This action cannot be undone.`)) return
    try {
      await api.delete(`/api/users/${emp.id}`)
    } catch {
      // Backend offline fallback
    }

    setEmployees(prev => prev.filter(u => (u.id !== emp.id && u.user_id !== emp.id)))
    showMsg(`🗑️ Deleted employee: ${emp.name}`)
  }

  const openEdit = (emp) => {
    setEditingUser(emp)
    const [first, ...rest] = (emp.name || '').split(' ')
    setFormData({
      first_name: emp.first_name || first || '',
      last_name:  emp.last_name  || rest.join(' ') || '',
      email:      emp.email || '',
      password:   '',
      role_id:    emp.role_id || 4,
      department_id: emp.department_id || 1,
      phone:      emp.phone || '',
      position:   emp.position || '',
    })
  }

  const filtered = employees
    .filter(e => isManager ? (e.role === 'employee' || e.role === 'hr') : true)
    .filter(e => roleFilter === 'all' || e.role === roleFilter)
    .filter(e => (e.name||'').toLowerCase().includes(search.toLowerCase()) || (e.email||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, fontFamily:"'Inter','Segoe UI',sans-serif" }}>

      {/* Success Banner */}
      {actionMessage && (
        <div style={{ background:'#ecfdf5', border:'1px solid #a7f3d0', color:'#047857', padding:'12px 18px', borderRadius:12, fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:10 }}>
          <CheckCircle2 size={18} /> {actionMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#111827', margin:0 }}>
            {isAdmin   ? '🛡️ Admin — Employee Management' :
             isManager ? '👔 Manager — All Employee Portal & Dashboards' :
                         '👤 Employee Directory'}
          </h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>
            {isAdmin   ? 'Full CRUD access — create, edit, delete employees & manage roles' :
             isManager ? 'Manager Portal — inspect any employee dashboard, tasks, performance & details' :
                         'Company employee directory'}
          </p>
          {/* Access badge */}
          <span style={{
            display:'inline-flex', alignItems:'center', gap:6, marginTop:8,
            padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700,
            background: isAdmin ? '#faf5ff' : isManager ? '#ecfdf5' : '#eff6ff',
            color: isAdmin ? '#7c3aed' : isManager ? '#059669' : '#2563eb',
            border: isAdmin ? '1px solid #e9d5ff' : isManager ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
          }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background: isAdmin ? '#7c3aed' : isManager ? '#059669' : '#2563eb' }} />
            {isAdmin ? 'Admin Access — Full CRUD' : isManager ? 'Manager Access — Full Employee Dashboard Inspection' : 'Employee Access'}
          </span>
        </div>

        {isAdmin && (
          <button
            onClick={() => { setFormData({ first_name:'', last_name:'', email:'', password:'Password123!', role_id:4, department_id:1, phone:'', position:'' }); setShowCreateModal(true) }}
            style={{ background:'#2563eb', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 12px rgba(37,99,235,0.25)', fontFamily:'inherit' }}>
            <UserPlus size={17} /> Add New Employee
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative' }}>
          <Search size={14} color="#9ca3af" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ paddingLeft:30, paddingRight:12, paddingTop:9, paddingBottom:9, border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:13, outline:'none', fontFamily:'inherit', width:250 }}
          />
        </div>
        {(isManager ? ['all','hr','employee'] : ['all','admin','manager','hr','employee']).map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ padding:'8px 16px', borderRadius:8, border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize', background: roleFilter===r ? '#2563eb' : '#f3f4f6', color: roleFilter===r ? '#fff' : '#374151', transition:'all 0.15s' }}>
            {r}
          </button>
        ))}
        <span style={{ marginLeft:'auto', fontSize:12, color:'#6b7280' }}>{filtered.length} of {employees.length} employees</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding:60, textAlign:'center', color:'#6b7280', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, border:'3px solid #dbeafe', borderTopColor:'#2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading employee directory…
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'2px solid #f3f4f6' }}>
                {['Employee','Email','Department','Role','Status', 'Employee Dashboard View'].map(h => (
                  <th key={h} style={{ padding:'13px 16px', textAlign: h.includes('Dashboard') ? 'right' : 'left', fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const rc = ROLE_COLORS[emp.role] || ROLE_COLORS.employee
                return (
                  <tr key={emp.id || emp.user_id} style={{ borderBottom:'1px solid #f9fafb', cursor: 'pointer' }}
                    onClick={() => setViewingEmp(emp)}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                    {/* Name */}
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#3b82f6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, flexShrink:0 }}>
                          {emp.name?.[0]?.toUpperCase()||'U'}
                        </div>
                        <div>
                          <p style={{ fontWeight:700, color:'#111827', margin:0, fontSize:14 }}>{emp.name}</p>
                          <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>ID #{emp.id || emp.user_id} · {emp.position||'Employee'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding:'13px 16px' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#4b5563' }}>
                        <Mail size={13} color="#9ca3af" />{emp.email}
                      </span>
                    </td>

                    {/* Department */}
                    <td style={{ padding:'13px 16px' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#374151', fontWeight:500 }}>
                        <Building2 size={13} color="#9ca3af" />{emp.department || '—'}
                      </span>
                    </td>

                    {/* Role badge */}
                    <td style={{ padding:'13px 16px' }}>
                      <span style={{ background:rc.bg, color:rc.color, borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase' }}>
                        {rc.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding:'13px 16px' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:'#059669' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981' }} />
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding:'13px 16px', textAlign:'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                        {/* View Dashboard button */}
                        <button onClick={() => setViewingEmp(emp)}
                          style={{ background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}>
                          <Eye size={14} /> Open Dashboard <ChevronRight size={14} />
                        </button>

                        {/* Edit + Delete — Admin only */}
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(emp)}
                              style={{ background:'#f1f5f9', color:'#334155', border:'1px solid #cbd5e1', padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
                              <Edit size={13} /> Edit
                            </button>
                            <button onClick={() => handleDelete(emp)}
                              style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:56, color:'#9ca3af' }}>
              <Users size={36} style={{ margin:'0 auto 12px', opacity:0.3 }} />
              <p style={{ margin:0, fontWeight:500 }}>No employees match your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Full Employee Dashboard Modal */}
      {viewingEmp && (
        <EmployeeDetailModal
          emp={viewingEmp}
          onClose={() => setViewingEmp(null)}
          allEmployees={employees}
          onSelectEmp={sel => setViewingEmp(sel)}
        />
      )}

      {/* Create Modal (Admin) */}
      {isAdmin && showCreateModal && (
        <EmployeeModalWrapper
          title="➕ Add New Employee"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          btnLabel="Create Account"
          formData={formData}
          setFormData={setFormData}
          editingUser={null}
        />
      )}

      {/* Edit Modal (Admin) */}
      {isAdmin && editingUser && (
        <EmployeeModalWrapper
          title="✏️ Edit Employee Details"
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
          btnLabel="Save Changes"
          btnColor="#059669"
          formData={formData}
          setFormData={setFormData}
          editingUser={editingUser}
        />
      )}
    </div>
  )
}
