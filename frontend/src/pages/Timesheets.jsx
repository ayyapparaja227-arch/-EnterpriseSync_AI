import { useState, useMemo } from 'react'
import { Clock, Download, Brain, TrendingUp, CheckCircle2, BarChart2, Calendar, RefreshCw, Zap, User } from 'lucide-react'

// ── AI Time Estimation Logic ─────────────────────────────────────────────────
// Estimates hours spent based on task complexity (priority × status × type)
function estimateHours(task) {
  const base = { critical: 8, high: 5, medium: 3, low: 1.5 }[task.priority] || 2
  const statusMult = { completed: 1.0, in_progress: 0.6, review: 0.8, todo: 0 }[task.status] || 0
  const jitter = ((task.id % 7) * 0.3) // pseudo-random variation per task
  return Math.round((base * statusMult + jitter) * 10) / 10
}

function getWeekDates() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

// Mock task data with time tracking
const MOCK_TASKS = [
  { id: 1,  title: 'Deploy to Production Server',    priority: 'critical', status: 'completed',   project: 'Mobile App Dev',        category: 'DevOps',    day: 0 },
  { id: 2,  title: 'Setup React Native Auth',        priority: 'high',     status: 'in_progress', project: 'Mobile App Dev',        category: 'Frontend',  day: 1 },
  { id: 3,  title: 'Review Unit Test Suite',         priority: 'medium',   status: 'completed',   project: 'Website Redesign',      category: 'QA',        day: 0 },
  { id: 4,  title: 'Update REST API Docs',           priority: 'low',      status: 'completed',   project: 'API Gateway',           category: 'Docs',      day: 1 },
  { id: 5,  title: 'Database Migration Script',      priority: 'high',     status: 'completed',   project: 'Database Migration',    category: 'Backend',   day: 2 },
  { id: 6,  title: 'UI Component Library',           priority: 'medium',   status: 'in_progress', project: 'Website Redesign',      category: 'Frontend',  day: 2 },
  { id: 7,  title: 'Security Audit Review',          priority: 'critical', status: 'completed',   project: 'Security Hardening',    category: 'Security',  day: 3 },
  { id: 8,  title: 'Performance Optimization',       priority: 'high',     status: 'completed',   project: 'API Gateway',           category: 'Backend',   day: 3 },
  { id: 9,  title: 'Code Review — Team PRs',         priority: 'medium',   status: 'completed',   project: 'Mobile App Dev',        category: 'Review',    day: 4 },
  { id: 10, title: 'Sprint Planning Documentation',  priority: 'low',      status: 'completed',   project: 'Website Redesign',      category: 'Planning',  day: 4 },
]

const CATEGORY_COLORS = {
  DevOps:   { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  Frontend: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
  Backend:  { bg: '#f0fdfa', color: '#0d9488', border: '#99f6e4' },
  QA:       { bg: '#fdf4ff', color: '#9333ea', border: '#d8b4fe' },
  Docs:     { bg: '#f0f9ff', color: '#0369a1', border: '#7dd3fc' },
  Security: { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
  Review:   { bg: '#ecfdf5', color: '#059669', border: '#6ee7b7' },
  Planning: { bg: '#fefce8', color: '#a16207', border: '#fde047' },
}

const PRIORITY_BADGE = {
  critical: { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  high:     { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
  medium:   { bg: '#fefce8', color: '#a16207', border: '#fde047' },
  low:      { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
}

function exportToCSV(tasks, weekDates) {
  const rows = [
    ['Date', 'Task', 'Project', 'Category', 'Priority', 'Status', 'Hours (AI Estimated)'],
    ...tasks.map(t => [
      weekDates[t.day]?.toLocaleDateString('en-GB') || '',
      t.title, t.project, t.category, t.priority, t.status, estimateHours(t)
    ])
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'timesheet_week.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function Timesheets() {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [viewMode, setViewMode] = useState('weekly') // 'weekly' | 'daily' | 'breakdown'

  const weekDates = getWeekDates()
  const tasksWithHours = MOCK_TASKS.map(t => ({ ...t, hours: estimateHours(t) }))
  const totalHours = tasksWithHours.reduce((s, t) => s + t.hours, 0)
  const completedTasks = tasksWithHours.filter(t => t.status === 'completed')
  const completionRate = Math.round((completedTasks.length / tasksWithHours.length) * 100)
  const productivityScore = Math.min(100, Math.round((totalHours / 40) * 100))

  const hoursByDay = DAYS.map((_, i) => ({
    label: DAYS[i],
    date: weekDates[i],
    tasks: tasksWithHours.filter(t => t.day === i),
    hours: tasksWithHours.filter(t => t.day === i).reduce((s, t) => s + t.hours, 0)
  }))

  const hoursByCategory = Object.entries(
    tasksWithHours.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.hours
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setGenerated(true) }, 1800)
  }

  const maxDayHours = Math.max(...hoursByDay.map(d => d.hours), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={26} color="var(--primary)" /> AI Timesheets
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            Week of {weekDates[0]?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {weekDates[4]?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            &nbsp;•&nbsp; AI-generated from task activity
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="es-btn es-btn-primary"
            style={{ gap: 8 }}
          >
            {generating
              ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
              : <><Brain size={15} /> {generated ? 'Regenerate' : 'Generate AI Timesheet'}</>}
          </button>
          <button
            onClick={() => exportToCSV(tasksWithHours, weekDates)}
            className="es-btn es-btn-ghost"
            style={{ gap: 8, fontSize: 13 }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Generation Banner */}
      {!generated && !generating && (
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', border: '1.5px dashed var(--primary-border)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Brain size={24} color="var(--primary)" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>AI Timesheet Generation</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Click "Generate AI Timesheet" to auto-calculate hours from your completed and in-progress tasks this week. No manual entry needed.
            </div>
          </div>
        </div>
      )}

      {generating && (
        <div style={{ padding: '20px', background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <RefreshCw size={20} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)' }}>AI is analyzing your task activity…</div>
            <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2 }}>Calculating hours from task priority, status transitions, and complexity…</div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, sub: 'this week', icon: Clock, color: 'var(--primary)' },
          { label: 'Tasks Completed', value: `${completedTasks.length}/${tasksWithHours.length}`, sub: `${completionRate}% rate`, icon: CheckCircle2, color: 'var(--success)' },
          { label: 'Productivity Score', value: `${productivityScore}%`, sub: 'of 40h target', icon: Zap, color: productivityScore >= 80 ? 'var(--success)' : 'var(--warning)' },
          { label: 'Avg Per Day', value: `${(totalHours / 5).toFixed(1)}h`, sub: 'Mon–Fri', icon: BarChart2, color: '#0369a1' },
        ].map(s => (
          <div key={s.label} className="es-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <s.icon size={18} color={s.color} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</span>
            </div>
            <div className="es-stat-value" style={{ fontSize: 24 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['weekly', 'Weekly View'], ['daily', 'Daily Breakdown'], ['breakdown', 'By Category']].map(([v, l]) => (
          <button key={v} onClick={() => setViewMode(v)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: viewMode === v ? 'var(--primary)' : 'var(--surface-2)', color: viewMode === v ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <div className="es-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 20px' }}>Weekly Activity Chart</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 160 }}>
            {hoursByDay.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{d.hours.toFixed(1)}h</span>
                <div style={{ width: '100%', position: 'relative', height: 120, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(4, (d.hours / maxDayHours) * 120)}px`,
                    background: d.hours >= 7 ? 'linear-gradient(180deg, var(--primary-light), var(--primary))' : d.hours >= 4 ? 'linear-gradient(180deg, #34d399, #059669)' : 'linear-gradient(180deg, #93c5fd, #3b82f6)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'height 0.6s var(--ease-out)',
                  }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{d.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.date?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.tasks.length} tasks</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      {viewMode === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {hoursByDay.map((d, di) => (
            d.tasks.length > 0 && (
              <div key={di} className="es-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar size={16} color="var(--primary)" />
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                      {d.label} — {d.date?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', padding: '4px 12px', background: 'var(--primary-soft)', borderRadius: 20, border: '1px solid var(--primary-border)' }}>
                    {d.hours.toFixed(1)}h total
                  </span>
                </div>
                {d.tasks.map(t => {
                  const cat = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.Frontend
                  const pri = PRIORITY_BADGE[t.priority] || PRIORITY_BADGE.medium
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: cat.bg, border: `1px solid ${cat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle2 size={14} color={cat.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.project}</div>
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`, fontWeight: 700, flexShrink: 0 }}>{t.category}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: pri.bg, color: pri.color, border: `1px solid ${pri.border}`, fontWeight: 700, flexShrink: 0, textTransform: 'capitalize' }}>{t.priority}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
                        <Clock size={11} color="var(--primary)" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-dark)' }}>{t.hours}h</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ))}
        </div>
      )}

      {/* Category Breakdown */}
      {viewMode === 'breakdown' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="es-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={16} color="var(--primary)" /> Hours by Category
            </h2>
            {hoursByCategory.map(([cat, hrs]) => {
              const cfg = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Frontend
              return (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{hrs.toFixed(1)}h</span>
                  </div>
                  <div className="es-progress">
                    <div className="es-progress-fill" style={{ width: `${(hrs / totalHours) * 100}%`, background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})` }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{Math.round((hrs / totalHours) * 100)}% of week</div>
                </div>
              )
            })}
          </div>

          {/* AI Productivity Insights */}
          <div className="es-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={16} color="var(--primary)" /> AI Productivity Insights
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '🏆', text: `Top performance day: ${hoursByDay.reduce((a, b) => b.hours > a.hours ? b : a).label} (${Math.max(...hoursByDay.map(d => d.hours)).toFixed(1)}h)`, color: '#059669' },
                { icon: '⚡', text: `Most productive category: ${hoursByCategory[0]?.[0]} (${hoursByCategory[0]?.[1].toFixed(1)}h)`, color: 'var(--primary)' },
                { icon: '📈', text: `${completionRate}% task completion rate — ${completionRate >= 80 ? 'Excellent!' : completionRate >= 60 ? 'Good progress' : 'Needs attention'}`, color: completionRate >= 80 ? '#059669' : '#d97706' },
                { icon: '🎯', text: `${productivityScore >= 80 ? 'On track' : 'Slightly under'} target — ${(40 - totalHours).toFixed(1)}h ${totalHours < 40 ? 'remaining' : 'over'} this week`, color: productivityScore >= 80 ? '#059669' : '#d97706' },
                { icon: '🤖', text: 'Timesheet auto-filled — no manual entry required. Review and submit.', color: 'var(--primary)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
                  <p style={{ margin: 0, fontSize: 12, color: item.color, fontWeight: 600, lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
