import { useState, useEffect } from 'react'
import { CheckSquare, Plus, Clock, User, Flag, X, Search, AlertTriangle, AlertCircle, Bell } from 'lucide-react'
import api from '../api'
import { MOCK_TASKS } from '../mockData'

// Get mock tasks for the current logged-in user
function getMyMockTasks() {
  try {
    const user = JSON.parse(localStorage.getItem('es_user') || '{}')
    const userTasks = MOCK_TASKS[user.id]
    if (userTasks) {
      return userTasks.map(t => ({
        task_id: t.id,
        title: t.title,
        description: t.project,
        priority: t.priority,
        status: t.status,
        assigned_name: user.name || 'Me',
        deadline: t.due,
      }))
    }
  } catch {}
  // Generic fallback
  return [
    { task_id:1, title:'Complete UI Design Review',    description:'EnterpriseSync v2', priority:'high',   status:'in_progress', assigned_name:'Me', deadline:'2026-08-05' },
    { task_id:2, title:'Update REST API Documentation',description:'Backend Infra',     priority:'medium', status:'todo',        assigned_name:'Me', deadline:'2026-08-10' },
    { task_id:3, title:'Fix Authentication Bug #342',  description:'Security Patch',    priority:'high',   status:'completed',   assigned_name:'Me', deadline:'2026-07-30' },
    { task_id:4, title:'Deploy to Production Server',  description:'DevOps',            priority:'high',   status:'todo',        assigned_name:'Me', deadline:'2026-08-15' },
    { task_id:5, title:'Code Review — Team PRs',       description:'Eng Excellence',    priority:'low',    status:'in_progress', assigned_name:'Me', deadline:'2026-08-03' },
  ]
}

const TABS   = ['all','todo','in_progress','completed']
const TLABEL = { todo:'To Do', in_progress:'In Progress', completed:'Completed', blocked:'Blocked' }
const TCOL   = { todo:'#f3f4f6:#374151', in_progress:'#dbeafe:#1d4ed8', completed:'#dcfce7:#15803d', blocked:'#fee2e2:#991b1b' }
const PLEFT  = { low:'#d1d5db', medium:'#3b82f6', high:'#f97316' }
const PICON  = { low:'#9ca3af', medium:'#3b82f6', high:'#f97316' }

function TBadge({ status }) {
  const [bg, color] = (TCOL[status] || TCOL.todo).split(':')
  return <span style={{ background:bg, color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{TLABEL[status] || status}</span>
}

export default function Tasks() {
  const [tasks, setTasks]   = useState(getMyMockTasks)
  const [tab, setTab]       = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]     = useState({ title:'', description:'', priority:'medium', deadline:'' })
  const [toast, setToast]   = useState('')

  useEffect(() => {
    api.get('/api/tasks')
      .then(data => { if (Array.isArray(data) && data.length > 0) setTasks(data) })
      .catch(() => { /* keep mock tasks */ })
  }, [])

  const counts = TABS.reduce((a,t) => ({ ...a, [t]: t==='all' ? tasks.length : tasks.filter(x => x.status===t).length }), {})

  const filtered = tasks
    .filter(t => tab==='all' || t.status===tab)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))

  const createTask = async e => {
    e.preventDefault()
    const storedUser = JSON.parse(localStorage.getItem('es_user') || '{}')
    const newTask = {
      task_id:       Date.now(),
      title:         form.title,
      description:   form.description || '',
      priority:      form.priority,
      status:        'todo',
      assigned_name: storedUser.name || 'Me',
      deadline:      form.deadline,
    }
    try {
      const nt = await api.post('/api/tasks', { ...form, project_id:1 })
      const merged = { ...newTask, ...nt }
      setTasks(t => [merged, ...t])
    } catch {
      // Backend offline fallback — add task locally
      setTasks(t => [newTask, ...t])
    }
    setShowForm(false)
    setForm({ title:'', description:'', priority:'medium', deadline:'' })
    setToast(`✅ Task "${newTask.title}" created successfully!`)
    setTimeout(() => setToast(''), 4000)
  }

  const updateStatus = id => {
    const cycle = { todo:'in_progress', in_progress:'completed', completed:'todo' }
    setTasks(ts => ts.map(t => t.task_id===id ? { ...t, status: cycle[t.status]||'todo' } : t))
  }

  // ── Deadline Alert Engine ──
  function getDeadlineStatus(deadline, status) {
    if (!deadline || status === 'completed') return null
    const today = new Date(); today.setHours(0,0,0,0)
    const due   = new Date(deadline); due.setHours(0,0,0,0)
    const diffDays = Math.round((due - today) / 86400000)
    if (diffDays < 0)  return { label: `Overdue by ${Math.abs(diffDays)}d`, color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', urgency: 3 }
    if (diffDays === 0) return { label: 'Due Today!',   color: '#dc2626', bg: '#fff1f2', border: '#fca5a5', urgency: 2 }
    if (diffDays === 1) return { label: 'Due Tomorrow', color: '#f97316', bg: '#fff7ed', border: '#fed7aa', urgency: 1 }
    if (diffDays <= 3)  return { label: `Due in ${diffDays}d`, color: '#d97706', bg: '#fffbeb', border: '#fde68a', urgency: 0 }
    return null
  }

  const deadlineAlerts = tasks
    .map(t => ({ ...t, _dl: getDeadlineStatus(t.deadline, t.status) }))
    .filter(t => t._dl)
    .sort((a, b) => b._dl.urgency - a._dl.urgency)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Toast Success Banner */}
      {toast && (
        <div className="es-toast es-toast-success animate-scaleIn" style={{ position: 'relative', bottom: 'auto', right: 'auto', maxWidth: '100%' }}>
          {toast}
        </div>
      )}

      {/* ── Deadline Alert Banner ── */}
      {deadlineAlerts.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', borderRadius:16, padding:'18px 22px', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ background:'#ef4444', borderRadius:8, padding:'6px 8px', display:'flex', alignItems:'center' }}>
              <Bell size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#fff' }}>⚠️ Deadline Alerts</h3>
              <p style={{ margin:0, fontSize:12, color:'#94a3b8' }}>{deadlineAlerts.length} task{deadlineAlerts.length > 1 ? 's' : ''} need your attention</p>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {deadlineAlerts.map(t => (
              <div key={t.task_id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.07)', border:`1px solid rgba(255,255,255,0.1)`, borderRadius:10, padding:'10px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {t._dl.urgency >= 2
                    ? <AlertTriangle size={15} color="#ef4444" />
                    : <AlertCircle  size={15} color="#f97316" />
                  }
                  <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{t.title}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, background: t._dl.urgency >= 2 ? '#ef4444' : t._dl.urgency === 1 ? '#f97316' : '#d97706', color:'#fff', padding:'3px 10px', borderRadius:20 }}>
                    {t._dl.label}
                  </span>
                  <span style={{ fontSize:11, color:'#64748b' }}>{t.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>Tasks</h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{filtered.length} tasks</p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ display:'flex', alignItems:'center', gap:8, background:'#2563eb', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', borderRadius:14, border:'1px solid #f3f4f6', padding:12, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'8px 14px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                background: tab===t ? '#2563eb' : '#f3f4f6',
                color: tab===t ? '#fff' : '#374151' }}>
              {t==='all' ? 'All' : TLABEL[t]} <span style={{ marginLeft:4, fontSize:11, opacity:0.8 }}>({counts[t]})</span>
            </button>
          ))}
        </div>
        <div style={{ position:'relative' }}>
          <Search size={14} color="#9ca3af" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
            style={{ paddingLeft:30, paddingRight:12, paddingTop:8, paddingBottom:8, border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:13, outline:'none', fontFamily:'inherit', width:200 }} />
        </div>
      </div>

      {/* Task list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:60, background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', color:'#9ca3af' }}>
            <CheckSquare size={40} style={{ margin:'0 auto 12px', opacity:0.3 }} />
            <p style={{ fontSize:15, margin:0 }}>No tasks found</p>
          </div>
        )}
        {filtered.map(task => {
          const dl = getDeadlineStatus(task.deadline, task.status)
          return (
          <div key={task.task_id}
            style={{ background:'#fff', borderRadius:14, border:`1px solid ${dl ? dl.border : '#f3f4f6'}`, borderLeft:`4px solid ${dl ? dl.color : (PLEFT[task.priority]||'#d1d5db')}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, boxShadow: dl?.urgency >= 2 ? `0 0 0 2px ${dl.color}22` : '0 1px 3px rgba(0,0,0,0.04)' }}>
            {/* Checkbox */}
            <button onClick={() => updateStatus(task.task_id)}
              style={{ width:22, height:22, borderRadius:6, border:`2px solid ${task.status==='completed'?'#10b981':'#d1d5db'}`, background:task.status==='completed'?'#10b981':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              {task.status==='completed' && <span style={{ color:'#fff', fontSize:13, lineHeight:1 }}>✓</span>}
            </button>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ fontSize:15, fontWeight:600, color: task.status==='completed'?'#9ca3af':'#111827', textDecoration: task.status==='completed'?'line-through':'none' }}>
                  {task.title}
                </span>
                <TBadge status={task.status} />
                {dl && (
                  <span style={{ fontSize:10, fontWeight:700, background: dl.color, color:'#fff', padding:'2px 8px', borderRadius:10 }}>
                    {dl.label}
                  </span>
                )}
              </div>
              {task.description && <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 6px' }}>{task.description}</p>}
              <div style={{ display:'flex', gap:16, fontSize:12, color:'#9ca3af', flexWrap:'wrap' }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}><User size={12} />{task.assigned_name||'Unassigned'}</span>
                {task.deadline && <span style={{ display:'flex', alignItems:'center', gap:4, color: dl ? dl.color : '#9ca3af', fontWeight: dl ? 700 : 400 }}><Clock size={12} />{task.deadline}</span>}
                <span style={{ display:'flex', alignItems:'center', gap:4, color:PICON[task.priority], textTransform:'capitalize' }}><Flag size={12} />{task.priority}</span>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="es-modal-overlay">
          <div className="es-modal" style={{ maxWidth: 460, padding: 32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>Create New Task</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={20} /></button>
            </div>
            <form onSubmit={createTask} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Title','text','title'],['Description','text','description'],['Deadline','date','deadline']].map(([lbl,type,key]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>{lbl}</label>
                  <input type={type} value={form[key]} required={key!=='description'} onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
                    autoFocus={key === 'title'}
                    style={{ width:'100%', padding:'9px 13px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                    onFocus={e => e.target.style.borderColor='#2563eb'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({...f,priority:e.target.value}))}
                  style={{ width:'100%', padding:'9px 13px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#fff' }}>
                  {['low','medium','high'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex:1, padding:'10px', background:'#f3f4f6', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>Cancel</button>
                <button type="submit" style={{ flex:2, padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
