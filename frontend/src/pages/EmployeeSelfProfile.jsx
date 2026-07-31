import { useState } from 'react'
import {
  User, Mail, Phone, Building2, Briefcase, Calendar,
  Star, Activity, Award, Clock, CheckCircle2, AlertCircle, Circle
} from 'lucide-react'
import { MOCK_TASKS } from '../mockData'

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

export default function EmployeeSelfProfile() {
  const user = JSON.parse(localStorage.getItem('es_user') || '{}')
  const tasks = MOCK_TASKS[user.id] || MOCK_TASKS[1] || []

  const performance  = user.performance || 4.8
  const skills       = user.skills || ['React', 'Node.js', 'Python']
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const activeTasks    = tasks.filter(t => t.status !== 'completed').length

  const INFO_ROWS = [
    { icon: Mail,      label: 'Email Address',  value: user.email },
    { icon: Phone,     label: 'Phone Number',   value: user.phone || '+91 98765 43210' },
    { icon: Building2, label: 'Department',     value: user.department || 'Engineering' },
    { icon: Briefcase, label: 'Position',       value: user.position || 'Software Engineer' },
    {
      icon: Calendar,
      label: 'Joined Date',
      value: user.joinDate
        ? new Date(user.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'January 15, 2023',
    },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24, fontFamily:"'Inter','Segoe UI',sans-serif" }}>

      {/* ── Hero Profile Card ── */}
      <div style={{
        background:'linear-gradient(135deg, #1e3a8a 0%, #2563eb 70%, #3b82f6 100%)',
        borderRadius:20, padding:36, color:'#fff', position:'relative', overflow:'hidden'
      }}>
        {/* Decoration */}
        <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, background:'rgba(255,255,255,0.06)', borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, right:80, width:180, height:180, background:'rgba(255,255,255,0.04)', borderRadius:'50%', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', gap:24, position:'relative', flexWrap:'wrap' }}>
          {/* Avatar */}
          <div style={{
            width:84, height:84, borderRadius:'50%', flexShrink:0,
            background:'rgba(255,255,255,0.18)', border:'3px solid rgba(255,255,255,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:34, fontWeight:800, letterSpacing:-1
          }}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>

          {/* Name + Role */}
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
              <h1 style={{ fontSize:26, fontWeight:800, margin:0, letterSpacing:-0.5 }}>{user.name}</h1>
              <span style={{
                background:'rgba(255,255,255,0.2)', padding:'4px 14px',
                borderRadius:20, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1
              }}>{user.role}</span>
            </div>
            <p style={{ fontSize:14, color:'#93c5fd', margin:'0 0 10px' }}>
              {user.position || 'Software Engineer'} &nbsp;•&nbsp; {user.department || 'Engineering'}
            </p>
            {/* Stars */}
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={15}
                  fill={i <= Math.round(performance) ? '#fbbf24' : 'transparent'}
                  color={i <= Math.round(performance) ? '#fbbf24' : 'rgba(255,255,255,0.3)'}
                />
              ))}
              <span style={{ fontSize:13, color:'#93c5fd', marginLeft:6 }}>{performance}/5.0 Performance</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:28, flexShrink:0 }}>
            {[
              { label:'Tasks Done',   value: user.tasksCompleted || completedTasks + 39 },
              { label:'Active Tasks', value: activeTasks },
              { label:'Leave Days',   value: user.leaveBalance || 15 },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:30, fontWeight:800, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#93c5fd', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div style={{
            marginTop:20, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.15)',
            fontSize:13, color:'#bfdbfe', lineHeight:1.6, position:'relative'
          }}>
            💬 {user.bio}
          </div>
        )}
      </div>

      {/* ── Details Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20 }}>

        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Personal Info */}
          <div style={{
            background:'#fff', borderRadius:16, padding:24,
            border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
              <User size={16} color="#2563eb" /> Personal Information
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {INFO_ROWS.map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{
                    width:34, height:34, borderRadius:9, background:'#eff6ff',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                  }}>
                    <Icon size={15} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'#9ca3af', fontWeight:500, marginBottom:1 }}>{label}</div>
                    <div style={{ fontSize:13, color:'#111827', fontWeight:600, wordBreak:'break-all' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div style={{
            background:'#fff', borderRadius:16, padding:24,
            border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
              <Award size={16} color="#8b5cf6" /> Skills & Expertise
            </h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {skills.map(skill => (
                <span key={skill} style={{
                  background:'#faf5ff', border:'1px solid #e9d5ff',
                  color:'#7c3aed', padding:'5px 14px', borderRadius:20,
                  fontSize:12, fontWeight:600
                }}>{skill}</span>
              ))}
            </div>
          </div>

          {/* Salary (confidential) */}
          {user.salary && (
            <div style={{
              background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
              borderRadius:16, padding:20, border:'1px solid #bbf7d0'
            }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#15803d', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
                💰 Annual Compensation (Confidential)
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:'#14532d' }}>{user.salary}</div>
            </div>
          )}
        </div>

        {/* Right column – Tasks */}
        <div style={{
          background:'#fff', borderRadius:16, padding:24,
          border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
          display:'flex', flexDirection:'column'
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:0, display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={16} color="#10b981" /> My Current Tasks
            </h3>
            <div style={{ display:'flex', gap:10 }}>
              <span style={{ fontSize:12, color:'#10b981', fontWeight:700 }}>✓ {completedTasks} done</span>
              <span style={{ fontSize:12, color:'#6b7280' }}>/ {tasks.length} total</span>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {tasks.map(task => {
              const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
              const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low
              return (
                <div key={task.id} style={{
                  padding:'14px 16px', background:'#f9fafb',
                  borderRadius:12, border:'1px solid #e5e7eb',
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:12
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:sc.color, flexShrink:0 }} />
                    <div style={{ minWidth:0 }}>
                      <p style={{
                        fontSize:13, fontWeight:600, color:'#1e293b', margin:0,
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        opacity: task.status === 'completed' ? 0.55 : 1,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
                      }}>{task.title}</p>
                      <p style={{ fontSize:11, color:'#94a3b8', margin:'2px 0 0' }}>
                        📁 {task.project} &nbsp;•&nbsp; 📅 {new Date(task.due).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <span style={{ background:pc.bg, color:pc.color, fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:10, textTransform:'uppercase' }}>
                      {task.priority}
                    </span>
                    <span style={{ background:sc.bg, color:sc.color, fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:10, whiteSpace:'nowrap' }}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Task Progress Bar */}
          <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid #f3f4f6' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, color:'#6b7280', marginBottom:8 }}>
              <span>Overall Completion</span>
              <span>{Math.round((completedTasks / tasks.length) * 100)}%</span>
            </div>
            <div style={{ background:'#e5e7eb', borderRadius:99, height:8, overflow:'hidden' }}>
              <div style={{
                height:'100%', width:`${(completedTasks / tasks.length) * 100}%`,
                background:'linear-gradient(90deg,#2563eb,#10b981)',
                borderRadius:99, transition:'width 0.6s ease'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
