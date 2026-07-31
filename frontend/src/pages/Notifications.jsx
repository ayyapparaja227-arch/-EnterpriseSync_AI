import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, CheckSquare, FolderKanban, Package, Clock, Check, CheckCheck } from 'lucide-react'

const INITIAL = [
  { id:1, message:"Task 'Design Homepage Mockup' deadline is tomorrow",  type:'deadline',   is_read:false, created_at:'2026-07-31T14:00:00Z' },
  { id:2, message:"New task assigned: Implement Authentication",          type:'assignment',  is_read:false, created_at:'2026-07-31T12:30:00Z' },
  { id:3, message:"Project 'Website Redesign' is at high risk",          type:'risk_alert',  is_read:false, created_at:'2026-07-31T11:00:00Z' },
  { id:4, message:"Asset 'MacBook Pro 16' has been assigned to you",     type:'asset',       is_read:true,  created_at:'2026-07-30T16:00:00Z' },
  { id:5, message:"Project 'Database Migration' completed successfully!", type:'completion',  is_read:true,  created_at:'2026-07-29T09:00:00Z' },
  { id:6, message:"Task 'Setup React Native' deadline approaching",      type:'deadline',   is_read:false, created_at:'2026-07-28T08:00:00Z' },
]

// Generate fresh deadline alerts based on today's date
function buildDeadlineAlerts() {
  const tasks = [
    { id:101, title:'Complete UI Design Review',     deadline: new Date(Date.now() - 2*86400000).toISOString().slice(0,10), status:'in_progress' },
    { id:102, title:'Update REST API Documentation', deadline: new Date().toISOString().slice(0,10),                        status:'todo' },
    { id:103, title:'Deploy to Production Server',   deadline: new Date(Date.now() + 86400000).toISOString().slice(0,10),  status:'todo' },
    { id:104, title:'Code Review — Team PRs',        deadline: new Date(Date.now() + 2*86400000).toISOString().slice(0,10),status:'in_progress' },
  ]
  const today = new Date(); today.setHours(0,0,0,0)
  const alerts = []
  tasks.forEach((t, i) => {
    if (t.status === 'completed') return
    const due = new Date(t.deadline); due.setHours(0,0,0,0)
    const diff = Math.round((due - today) / 86400000)
    let msg = ''
    if (diff < 0)   msg = `⚠️ OVERDUE by ${Math.abs(diff)} day${Math.abs(diff)>1?'s':''}: "${t.title}" — Please update status immediately`
    else if (diff === 0) msg = `🔴 Due TODAY: "${t.title}" — Deadline is today, take action now!`
    else if (diff === 1) msg = `🟡 Due Tomorrow: "${t.title}" — Complete or update before end of day`
    else if (diff <= 3)  msg = `🟠 Upcoming in ${diff} days: "${t.title}" — Plan accordingly`
    if (msg) alerts.push({ id: 200+i, message: msg, type: 'deadline', is_read: false, created_at: new Date(Date.now() - i*300000).toISOString() })
  })
  return alerts
}

const TYPE_CONFIG = {
  deadline:   { icon: Clock,         bg:'#fff7ed', iconColor:'#f97316', border:'#fed7aa' },
  assignment: { icon: CheckSquare,   bg:'#eff6ff', iconColor:'#2563eb', border:'#bfdbfe' },
  risk_alert: { icon: AlertTriangle, bg:'#fef2f2', iconColor:'#ef4444', border:'#fca5a5' },
  asset:      { icon: Package,       bg:'#f5f3ff', iconColor:'#7c3aed', border:'#ddd6fe' },
  completion: { icon: FolderKanban,  bg:'#f0fdf4', iconColor:'#16a34a', border:'#bbf7d0' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(() => [...buildDeadlineAlerts(), ...INITIAL])
  const [filter, setFilter] = useState('all')

  const unread = notifications.filter(n => !n.is_read).length

  const markRead = id => setNotifications(ns => ns.map(n => n.id===id ? {...n, is_read:true} : n))
  const markAll  = ()  => setNotifications(ns => ns.map(n => ({...n, is_read:true})))

  const filtered = notifications.filter(n => filter==='all' || (filter==='unread' && !n.is_read) || (filter==='read' && n.is_read))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>Notifications</h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>
            {unread > 0 ? <><strong style={{ color:'#2563eb' }}>{unread} unread</strong> notifications</> : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            style={{ display:'flex', alignItems:'center', gap:6, background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', borderRadius:10, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8 }}>
        {['all','unread','read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'8px 18px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize',
              background: filter===f ? '#2563eb' : '#f3f4f6',
              color: filter===f ? '#fff' : '#374151' }}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:60, background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', color:'#9ca3af' }}>
            <Bell size={40} style={{ margin:'0 auto 12px', opacity:.3, display:'block' }} />
            <p style={{ margin:0 }}>No notifications</p>
          </div>
        )}
        {filtered.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.assignment
          const Icon = cfg.icon
          return (
            <div key={n.id}
              style={{ background: n.is_read ? '#fff' : '#f8faff', borderRadius:14, border:`1px solid ${n.is_read ? '#f3f4f6' : cfg.border}`, padding:'16px 20px', display:'flex', gap:14, alignItems:'flex-start', transition:'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
              <div style={{ background:cfg.bg, borderRadius:10, padding:10, flexShrink:0 }}>
                <Icon size={18} color={cfg.iconColor} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, color: n.is_read ? '#6b7280' : '#111827', margin:'0 0 4px', fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#2563eb' }} />
                  <button onClick={() => markRead(n.id)}
                    style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'1px solid #e5e7eb', borderRadius:7, padding:'5px 10px', fontSize:12, color:'#374151', cursor:'pointer', fontFamily:'inherit' }}>
                    <Check size={12} /> Read
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
