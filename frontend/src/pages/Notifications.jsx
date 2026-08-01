import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, CheckSquare, FolderKanban, Package, Clock, Check, CheckCheck } from 'lucide-react'

// ── Storage key shared with MainLayout badge ─────────────────────────────────
const STORAGE_KEY = 'es_notifications'

const INITIAL_NOTIFICATIONS = [
  { id:1, message:"Task 'Design Homepage Mockup' deadline is tomorrow",  type:'deadline',   is_read:false, created_at:'2026-07-31T14:00:00Z' },
  { id:2, message:"New task assigned: Implement Authentication",          type:'assignment',  is_read:false, created_at:'2026-07-31T12:30:00Z' },
  { id:3, message:"Project 'Website Redesign' is at high risk",          type:'risk_alert',  is_read:false, created_at:'2026-07-31T11:00:00Z' },
  { id:4, message:"Asset 'MacBook Pro 16' has been assigned to you",     type:'asset',       is_read:true,  created_at:'2026-07-30T16:00:00Z' },
  { id:5, message:"Project 'Database Migration' completed successfully!", type:'completion',  is_read:true,  created_at:'2026-07-29T09:00:00Z' },
  { id:6, message:"Task 'Setup React Native' deadline approaching",      type:'deadline',    is_read:false, created_at:'2026-07-28T08:00:00Z' },
]

// Generate fresh deadline alerts based on today's date
function buildDeadlineAlerts() {
  const tasks = [
    { id:101, title:'Complete UI Design Review',     deadline: new Date(Date.now() - 2*86400000).toISOString().slice(0,10), status:'in_progress' },
    { id:102, title:'Update REST API Documentation', deadline: new Date().toISOString().slice(0,10),                        status:'todo' },
    { id:103, title:'Deploy to Production Server',   deadline: new Date(Date.now() + 86400000).toISOString().slice(0,10),  status:'todo' },
  ]
  const today = new Date(); today.setHours(0,0,0,0)
  const alerts = []
  tasks.forEach((t, i) => {
    if (t.status === 'completed') return
    const due = new Date(t.deadline); due.setHours(0,0,0,0)
    const diff = Math.round((due - today) / 86400000)
    let msg = ''
    if (diff < 0)    msg = `⚠️ OVERDUE by ${Math.abs(diff)} day${Math.abs(diff)>1?'s':''}: "${t.title}" — Please update status immediately`
    else if (diff === 0) msg = `🔴 Due TODAY: "${t.title}" — Deadline is today, take action now!`
    else if (diff === 1) msg = `🟡 Due Tomorrow: "${t.title}" — Complete or update before end of day`
    if (msg) alerts.push({ id: 200+i, message: msg, type: 'deadline', is_read: false, created_at: new Date(Date.now() - i*300000).toISOString() })
  })
  return alerts
}

// ── Helpers to read/write from localStorage ───────────────────────────────────
function loadNotifications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  // First load — seed from initial data
  const fresh = [...buildDeadlineAlerts(), ...INITIAL_NOTIFICATIONS]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  return fresh
}

function saveNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    // Fire a custom event so MainLayout badge updates in real-time
    window.dispatchEvent(new Event('es_notifications_updated'))
  } catch {}
}

const TYPE_CONFIG = {
  deadline:   { icon: Clock,         bg:'#fff7ed', iconColor:'#f97316', border:'#fed7aa' },
  assignment: { icon: CheckSquare,   bg:'#f0fdfa', iconColor:'#0d9488', border:'#99f6e4' },
  risk_alert: { icon: AlertTriangle, bg:'#fef2f2', iconColor:'#ef4444', border:'#fca5a5' },
  asset:      { icon: Package,       bg:'#f0f9ff', iconColor:'#0369a1', border:'#bae6fd' },
  completion: { icon: FolderKanban,  bg:'#f0fdf4', iconColor:'#16a34a', border:'#bbf7d0' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(loadNotifications)
  const [filter, setFilter] = useState('all')

  const unread = notifications.filter(n => !n.is_read).length

  // Update state + localStorage + notify badge
  const update = (updated) => {
    setNotifications(updated)
    saveNotifications(updated)
  }

  const markRead = (id) => {
    update(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAll = () => {
    update(notifications.map(n => ({ ...n, is_read: true })))
  }

  const filtered = notifications.filter(n =>
    filter === 'all' ||
    (filter === 'unread' && !n.is_read) ||
    (filter === 'read' && n.is_read)
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', margin:0, display:'flex', alignItems:'center', gap:10 }}>
            <Bell size={22} color="var(--primary)" /> Notifications
          </h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
            {unread > 0
              ? <><strong style={{ color:'var(--primary)' }}>{unread} unread</strong> notification{unread > 1 ? 's' : ''}</>
              : '✅ All caught up! No unread notifications.'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            style={{ display:'flex', alignItems:'center', gap:6, background:'var(--primary-soft)', color:'var(--primary-dark)', border:'1px solid var(--primary-border)', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#ccfbf1'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-soft)'}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display:'flex', gap:8 }}>
        {['all', 'unread', 'read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding:'8px 18px', borderRadius:8, border:'none',
              fontSize:13, fontWeight:600, cursor:'pointer',
              fontFamily:'inherit', textTransform:'capitalize',
              background: filter===f ? 'var(--primary)' : 'var(--surface-2)',
              color: filter===f ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}>
            {f} {f === 'unread' && unread > 0 && `(${unread})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:60, background:'var(--surface)', borderRadius:16, border:'1px solid var(--border-light)', color:'var(--text-muted)' }}>
            <Bell size={40} style={{ margin:'0 auto 12px', opacity:.3, display:'block' }} />
            <p style={{ margin:0 }}>No notifications in this category</p>
          </div>
        )}
        {filtered.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.assignment
          const Icon = cfg.icon
          return (
            <div key={n.id}
              className="animate-fadeInUp"
              style={{
                background: n.is_read ? 'var(--surface)' : '#f0fdfa',
                borderRadius:14,
                border:`1px solid ${n.is_read ? 'var(--border-light)' : cfg.border}`,
                padding:'16px 20px',
                display:'flex', gap:14, alignItems:'flex-start',
                transition:'all 0.2s ease',
                opacity: n.is_read ? 0.75 : 1
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
            >
              <div style={{ background:cfg.bg, borderRadius:10, padding:10, flexShrink:0 }}>
                <Icon size={18} color={cfg.iconColor} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, color: n.is_read ? 'var(--text-muted)' : 'var(--text-primary)', margin:'0 0 4px', fontWeight: n.is_read ? 400 : 600 }}>
                  {n.message}
                </p>
                <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>
                  {timeAgo(n.created_at)}
                  {n.is_read && <span style={{ marginLeft:8, color:'var(--success)', fontWeight:600 }}>• Read</span>}
                </p>
              </div>
              {!n.is_read && (
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  {/* Unread blue dot */}
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0 }} />
                  <button
                    onClick={() => markRead(n.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:4,
                      background:'var(--primary-soft)', border:'1px solid var(--primary-border)',
                      borderRadius:7, padding:'5px 10px',
                      fontSize:12, color:'var(--primary-dark)',
                      cursor:'pointer', fontFamily:'inherit', fontWeight:600,
                      transition:'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ccfbf1'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-soft)'}
                  >
                    <Check size={12} /> Mark Read
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
