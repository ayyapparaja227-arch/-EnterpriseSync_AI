import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Plus, AlertTriangle, Calendar, User, X, Search,
  CheckCircle2, Clock, ShieldAlert, Sparkles, TrendingUp, ArrowRight,
  Users, Mail, Phone, Briefcase, Star, ExternalLink, ChevronRight, CheckSquare
} from 'lucide-react'
import api from '../api'
import { MOCK_PROJECTS, MOCK_EMPLOYEES, MOCK_TASKS } from '../mockData'

const MOCK_RISKS = {
  1: {
    project_name: 'Website Redesign',
    risk_score: 78,
    risk_level: 'high',
    predicted_delay_days: 12,
    factors: [
      'Frontend developer workload bottleneck (Arun Kumar assigned 5 active tasks)',
      'Pending design review sign-off delayed by 4 days',
      'Time pressure index high due to Q3 marketing deadline'
    ],
    impacted_employees: [
      { name: 'Arun Kumar', role: 'Senior Software Engineer', workload: '92% (High Risk)' }
    ],
    recommendations: [
      '⚡ Re-allocate 2 UI design tasks from Arun Kumar to Priya Sharma',
      '📅 Request a 5-day deadline extension from Project Manager',
      '🤝 Schedule an emergency sprint review to streamline pending approvals'
    ]
  },
  2: {
    project_name: 'Mobile App Dev',
    risk_score: 88,
    risk_level: 'critical',
    predicted_delay_days: 24,
    factors: [
      'Critical completion gap: Only 35% complete with 40% timeline remaining',
      'Dependency block: iOS REST API endpoints integration pending',
      'Resource deficit: 2 developer roles currently unassigned'
    ],
    impacted_employees: [
      { name: 'Arun Kumar', role: 'Lead Developer', workload: '96% (Critical Overload)' },
      { name: 'Rahul Patel', role: 'QA Lead', workload: '85% (Medium Risk)' }
    ],
    recommendations: [
      '⚡ Immediately assign additional backend developer to REST API module',
      '🎯 Shift non-critical features (Phase 2) to next release cycle',
      '🚨 Alert executive team regarding predicted 24-day timeline delay'
    ]
  },
  3: {
    project_name: 'Database Migration',
    risk_score: 15,
    risk_level: 'low',
    predicted_delay_days: 0,
    factors: [
      'Project is 100% complete with no active risk factors',
      'Post-migration performance verification passed clean'
    ],
    impacted_employees: [],
    recommendations: [
      '✅ Project successfully delivered with zero delay',
      '📄 Archive project repository and update knowledge base'
    ]
  },
  4: {
    project_name: 'AI Analytics Module',
    risk_score: 82,
    risk_level: 'high',
    predicted_delay_days: 18,
    factors: [
      'Low progress velocity: Only 20% complete',
      'High algorithm complexity in machine learning risk prediction model',
      'Lack of dedicated data engineer assigned to dataset pipeline'
    ],
    impacted_employees: [
      { name: 'Admin User', role: 'AI Architect', workload: '88% (High Risk)' }
    ],
    recommendations: [
      '⚡ Pair program on core ML pipeline to overcome technical bottlenecks',
      '📅 Re-estimate remaining sprint tasks with granular milestones',
      '💡 Utilize pre-trained models to accelerate initial dashboard deployment'
    ]
  }
}

const PBADGE = { low:'#e5e7eb:#374151', medium:'#dbeafe:#1d4ed8', high:'#ffedd5:#c2410c', critical:'#fee2e2:#991b1b' }
const SBADGE = { active:'#dcfce7:#15803d', completed:'#dbeafe:#1d4ed8', on_hold:'#fef9c3:#92400e', cancelled:'#f3f4f6:#374151' }
const pbar   = p => p >= 80 ? '#10b981' : p >= 40 ? '#0d9488' : '#f59e0b'

function Badge({ text, map }) {
  const [bg, color] = (map[text] || '#f3f4f6:#374151').split(':')
  return <span style={{ background:bg, color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600, textTransform:'capitalize' }}>{text}</span>
}

export default function Projects() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [search, setSearch]     = useState('')
  const [riskModalData, setRiskModalData] = useState(null)
  const [teamModalData, setTeamModalData] = useState(null)
  const [riskLoad, setRiskLoad] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ project_name:'', description:'', priority:'medium', end_date:'' })
  const [toast, setToast]       = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/projects').then(res => {
      if (Array.isArray(res) && res.length > 0) setProjects(res)
    }).catch(() => {})
  }, [])

  const filtered = projects.filter(p =>
    p.project_name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const analyseRisk = async project => {
    setRiskLoad(true)
    const id = project.project_id
    try {
      const data = await api.get(`/api/risks/predict/${id}`)
      if (data && data.risk_level) {
        setRiskModalData(data)
      } else {
        setRiskModalData(MOCK_RISKS[id] || MOCK_RISKS[1])
      }
    } catch {
      setRiskModalData(MOCK_RISKS[id] || MOCK_RISKS[1])
    } finally {
      setRiskLoad(false)
    }
  }

  // Find all employees assigned to a specific project
  const viewProjectTeam = (project) => {
    const teamNames = project.team || []
    // Match against MOCK_EMPLOYEES or default fallback
    const matchedEmployees = MOCK_EMPLOYEES.filter(emp =>
      teamNames.some(name => emp.name.toLowerCase().includes(name.toLowerCase()))
    )

    // If no match found, supply default 2 employees
    const finalTeam = matchedEmployees.length > 0 ? matchedEmployees : [
      MOCK_EMPLOYEES[0], // Arun Kumar
      MOCK_EMPLOYEES[1]  // Priya Sharma
    ]

    setTeamModalData({
      project,
      members: finalTeam
    })
  }

  const createProject = async e => {
    e.preventDefault()
    const storedUser = JSON.parse(localStorage.getItem('es_user') || '{}')
    const newProject = {
      project_id:            Date.now(),
      project_name:          form.project_name,
      description:           form.description || 'No description provided',
      priority:              form.priority,
      end_date:              form.end_date,
      start_date:            new Date().toISOString().slice(0,10),
      status:                'active',
      completion_percentage: 0,
      manager_name:          storedUser.name || 'Manager',
      team:                  ['Arun Kumar', 'Priya Sharma']
    }
    try {
      const np = await api.post('/api/projects', form)
      const merged = { ...newProject, ...np }
      setProjects(p => [...p, merged])
    } catch {
      setProjects(p => [...p, newProject])
    }
    setShowForm(false)
    setForm({ project_name:'', description:'', priority:'medium', end_date:'' })
    setToast(`✅ Project "${newProject.project_name}" created successfully!`)
    setTimeout(() => setToast(''), 4000)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, fontFamily:"'Inter','Segoe UI',sans-serif" }}>

      {/* Toast Success Banner */}
      {toast && (
        <div style={{ background:'#ecfdf5', border:'1px solid #a7f3d0', color:'#047857', padding:'12px 18px', borderRadius:12, fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:10 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', margin:0 }}>Projects</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:4 }}>
            {filtered.length} of {projects.length} active enterprise projects • Click any project to inspect assigned team members
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="es-btn es-btn-primary"
          style={{ gap:8 }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Search */}
      <div style={{ position:'relative', maxWidth:360 }}>
        <Search size={16} color="var(--text-muted)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
          className="es-input"
          style={{ paddingLeft:38 }} />
      </div>

      {/* Projects Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 }}>
        {filtered.map((p, idx) => {
          const teamList = p.team || ['Arun Kumar', 'Priya Sharma']
          return (
            <div key={p.project_id} className={`es-card hover-lift animate-fadeInUp delay-${(idx%5)+1}`}
              style={{ padding:24, display:'flex', flexDirection:'column', gap:14, cursor:'pointer' }}
              onClick={() => viewProjectTeam(p)}
            >
              {/* Top Title & Icon */}
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ background:'var(--primary-soft)', border:'1px solid var(--primary-border)', borderRadius:12, padding:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <FolderKanban size={22} color="var(--primary)" />
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text-primary)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.project_name}
                    </h3>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'4px 0 0', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:1.4 }}>
                    {p.description}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div style={{ display:'flex', gap:6 }}>
                <Badge text={p.priority} map={PBADGE} />
                <Badge text={p.status}   map={SBADGE} />
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                  <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>Completion</span>
                  <span style={{ fontWeight:800, color:'var(--text-primary)' }}>{p.completion_percentage}%</span>
                </div>
                <div className="es-progress">
                  <div className="es-progress-fill" style={{ width:`${p.completion_percentage}%`, background:pbar(p.completion_percentage) }} />
                </div>
              </div>

              {/* Meta & Manager */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, color:'var(--text-secondary)', paddingTop:6, borderTop:'1px solid var(--border-light)' }}>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontWeight:600 }}>
                  <User size={13} color="var(--primary)" /> {p.manager_name}
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <Calendar size={13} /> {p.end_date}
                </span>
              </div>

              {/* 👥 Assigned Team Preview Pill (Clickable) */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', background:'var(--surface-2)', border:'1px solid var(--border)',
                borderRadius:12, transition:'all 0.15s ease'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Users size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>
                      Assigned Team ({teamList.length} Members)
                    </div>
                    <div style={{ fontSize:10, color:'var(--text-muted)' }}>
                      {teamList.slice(0, 2).join(', ')}{teamList.length > 2 ? ` +${teamList.length - 2} more` : ''}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--primary)" />
              </div>

              {/* Actions Footer Buttons */}
              <div style={{ display:'flex', gap:8, marginTop:4 }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => viewProjectTeam(p)}
                  style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    padding:'8px 12px', borderRadius:10,
                    background:'var(--primary-soft)', color:'var(--primary-dark)',
                    border:'1px solid var(--primary-border)',
                    fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    transition:'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='#ccfbf1'}
                  onMouseLeave={e => e.currentTarget.style.background='var(--primary-soft)'}
                >
                  <Users size={14} /> View Team
                </button>

                <button
                  onClick={() => analyseRisk(p)}
                  disabled={riskLoad}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    padding:'8px 12px', borderRadius:10,
                    background:'#fff7ed', color:'#c2410c',
                    border:'1px solid #fed7aa',
                    fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    transition:'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='#ffedd5'; e.currentTarget.style.borderColor='#f97316' }}
                  onMouseLeave={e => { e.currentTarget.style.background='#fff7ed'; e.currentTarget.style.borderColor='#fed7aa' }}
                >
                  <AlertTriangle size={14} /> Risk Analysis
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 👥 ASSIGNED PROJECT TEAM MEMBERS MODAL ────────────────────────── */}
      {teamModalData && (
        <div className="es-modal-overlay" onClick={e => e.target === e.currentTarget && setTeamModalData(null)}>
          <div className="es-modal" style={{ maxWidth: 760, overflow:'hidden' }}>

            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f2027 0%, #1a3040 100%)',
              padding:'24px 30px', color:'#fff', position:'relative'
            }}>
              <button
                onClick={() => setTeamModalData(null)}
                style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.12)', border:'none', borderRadius:10, padding:8, cursor:'pointer', display:'flex', color:'#fff' }}
              >
                <X size={18} />
              </button>

              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <FolderKanban size={20} color="#5eead4" />
                <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:1, color:'#5eead4' }}>
                  Assigned Project Team Roster
                </span>
              </div>
              <h2 style={{ fontSize:22, fontWeight:800, margin:0, color:'#fff' }}>
                {teamModalData.project.project_name}
              </h2>
              <p style={{ margin:'4px 0 0', fontSize:13, color:'#94a3b8' }}>
                Lead Manager: <strong style={{ color:'#fff' }}>{teamModalData.project.manager_name}</strong> • Total Team: <strong style={{ color:'#5eead4' }}>{teamModalData.members.length} Employees</strong>
              </p>

              {/* Progress Summary Header Bar */}
              <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:16, background:'rgba(255,255,255,0.08)', padding:'12px 18px', borderRadius:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4, color:'#e2e8f0' }}>
                    <span>Project Progress</span>
                    <span style={{ fontWeight:800, color:'#5eead4' }}>{teamModalData.project.completion_percentage}%</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.15)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${teamModalData.project.completion_percentage}%`, background:'#0d9488', borderRadius:4 }} />
                  </div>
                </div>
                <div style={{ borderLeft:'1px solid rgba(255,255,255,0.15)', paddingLeft:16 }}>
                  <div style={{ fontSize:10, color:'#94a3b8', textTransform:'uppercase' }}>Target Deadline</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{teamModalData.project.end_date}</div>
                </div>
              </div>
            </div>

            {/* Modal Body: Employee Team Cards List */}
            <div style={{ padding:'24px 30px', display:'flex', flexDirection:'column', gap:16, maxHeight:'65vh', overflowY:'auto', background:'#f8fafc' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:8 }}>
                <Users size={16} color="var(--primary)" />
                Employees Working on this Project ({teamModalData.members.length}):
              </div>

              {teamModalData.members.map(emp => {
                // Find active tasks for this employee
                const assignedTasks = MOCK_TASKS.filter(t =>
                  t.assignee?.toLowerCase().includes(emp.name.toLowerCase()) ||
                  t.assigned_to === emp.id
                )

                // Workload calculation
                const workloadPct = Math.min(98, (emp.tasksActive || 4) * 18)
                const workloadColor = workloadPct >= 85 ? '#dc2626' : workloadPct >= 65 ? '#d97706' : '#059669'

                return (
                  <div key={emp.id} className="es-card" style={{ padding:20, background:'#fff', border:'1px solid var(--border)', borderRadius:16, display:'flex', flexDirection:'column', gap:14 }}>

                    {/* Employee Top Header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                      <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                        {/* Avatar with Status Dot */}
                        <div style={{ position:'relative' }}>
                          <div style={{
                            width:46, height:46, borderRadius:'50%',
                            background:'linear-gradient(135deg, #0d9488, #0f766e)',
                            color:'#fff', fontWeight:800, fontSize:17,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow:'0 4px 12px rgba(13,148,136,0.25)'
                          }}>
                            {emp.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span style={{
                            position:'absolute', bottom:0, right:0,
                            width:12, height:12, borderRadius:'50%',
                            background: emp.status === 'active' ? '#059669' : '#f59e0b',
                            border:'2px solid #fff'
                          }} title={emp.status} />
                        </div>

                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <h4 style={{ fontSize:16, fontWeight:800, color:'var(--text-primary)', margin:0 }}>
                              {emp.name}
                            </h4>
                            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:12, background:'var(--primary-soft)', color:'var(--primary-dark)', fontWeight:700, border:'1px solid var(--primary-border)' }}>
                              {emp.department}
                            </span>
                          </div>
                          <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2, fontWeight:500 }}>
                            {emp.position}
                          </div>
                        </div>
                      </div>

                      {/* Performance Rating Pill */}
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:4, background:'#fffbeb', border:'1px solid #fde68a', padding:'5px 12px', borderRadius:20 }}>
                          <Star size={14} color="#d97706" fill="#d97706" />
                          <span style={{ fontSize:13, fontWeight:800, color:'#b45309' }}>
                            {emp.performance || '4.8'} / 5.0
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details Row (Email, Phone, Workload Bar) */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12, background:'var(--surface-2)', padding:'12px 16px', borderRadius:12, border:'1px solid var(--border-light)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-secondary)' }}>
                        <Mail size={14} color="var(--primary)" />
                        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.email}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-secondary)' }}>
                        <Phone size={14} color="var(--primary)" />
                        <span>{emp.phone || '+91 98765 43210'}</span>
                      </div>
                      <div style={{ gridColumn:'1 / -1' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700, marginBottom:4 }}>
                          <span style={{ color:'var(--text-secondary)' }}>Workload Capacity Load</span>
                          <span style={{ color: workloadColor }}>{workloadPct}% ({workloadPct >= 85 ? 'High Risk' : workloadPct >= 65 ? 'Optimal' : 'Light'})</span>
                        </div>
                        <div className="es-progress" style={{ height:6 }}>
                          <div className="es-progress-fill" style={{ width:`${workloadPct}%`, background: workloadColor }} />
                        </div>
                      </div>
                    </div>

                    {/* Assigned Project Tasks */}
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                        <CheckSquare size={14} color="var(--primary)" />
                        Active Tasks in this Project ({assignedTasks.length}):
                      </div>
                      {assignedTasks.length > 0 ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {assignedTasks.map(t => (
                            <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'#fff', border:'1px solid var(--border-light)', borderRadius:8, fontSize:12 }}>
                              <span style={{ fontWeight:600, color:'var(--text-primary)' }}>• {t.title}</span>
                              <div style={{ display:'flex', gap:6 }}>
                                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'#eff6ff', color:'#1e40af', fontWeight:700, textTransform:'capitalize' }}>
                                  {t.status}
                                </span>
                                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background: t.priority === 'high' ? '#fff1f2' : '#f0fdf4', color: t.priority === 'high' ? '#991b1b' : '#166534', fontWeight:700, textTransform:'capitalize' }}>
                                  {t.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize:12, color:'var(--text-muted)', italic:true }}>
                          Assigned to project architecture & code reviews (No open standalone sprint tickets).
                        </div>
                      )}
                    </div>

                    {/* Quick Action Button */}
                    <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:6, borderTop:'1px solid var(--border-light)' }}>
                      <button
                        onClick={() => { setTeamModalData(null); navigate('/employees') }}
                        style={{
                          display:'inline-flex', alignItems:'center', gap:6,
                          padding:'6px 14px', borderRadius:8,
                          background:'var(--surface-2)', border:'1px solid var(--border)',
                          color:'var(--text-secondary)', fontSize:12, fontWeight:700,
                          cursor:'pointer', transition:'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                      >
                        View Full Employee Profile <ExternalLink size={13} />
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ padding:'16px 30px 20px', background:'#fff', borderTop:'1px solid var(--border)', textAlign:'right' }}>
              <button
                onClick={() => setTeamModalData(null)}
                className="es-btn es-btn-primary"
                style={{ padding:'9px 22px', fontSize:13 }}
              >
                Close Team Roster
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Risk Breakdown Detailed Modal */}
      {riskModalData && (
        <div className="es-modal-overlay" onClick={e => e.target === e.currentTarget && setRiskModalData(null)}>
          <div className="es-modal" style={{ maxWidth: 680 }}>

            {/* Modal Header */}
            <div style={{
              background: riskModalData.risk_level === 'critical' ? 'linear-gradient(135deg, #7f1d1d, #dc2626)' :
                          riskModalData.risk_level === 'high' ? 'linear-gradient(135deg, #9a3412, #ea580c)' :
                          'linear-gradient(135deg, #065f46, #059669)',
              padding:'26px 30px', color:'#fff', position:'relative'
            }}>
              <button onClick={() => setRiskModalData(null)}
                style={{ position:'absolute', top:18, right:18, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:8, cursor:'pointer', display:'flex', color:'#fff' }}>
                <X size={18} />
              </button>

              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <Sparkles size={20} color="#fde047" />
                <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:1, opacity:0.9 }}>
                  AI Risk Engine Prediction Result
                </span>
              </div>
              <h2 style={{ fontSize:24, fontWeight:800, margin:0 }}>{riskModalData.project_name}</h2>

              {/* Metrics Pills */}
              <div style={{ display:'flex', gap:14, marginTop:18, flexWrap:'wrap' }}>
                <div style={{ background:'rgba(255,255,255,0.18)', padding:'8px 16px', borderRadius:12, backdropFilter:'blur(4px)' }}>
                  <div style={{ fontSize:10, opacity:0.8, fontWeight:600 }}>RISK SCORE</div>
                  <div style={{ fontSize:22, fontWeight:800 }}>{riskModalData.risk_score} / 100</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.18)', padding:'8px 16px', borderRadius:12, backdropFilter:'blur(4px)' }}>
                  <div style={{ fontSize:10, opacity:0.8, fontWeight:600 }}>RISK LEVEL</div>
                  <div style={{ fontSize:18, fontWeight:800, textTransform:'uppercase' }}>{riskModalData.risk_level}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.18)', padding:'8px 16px', borderRadius:12, backdropFilter:'blur(4px)' }}>
                  <div style={{ fontSize:10, opacity:0.8, fontWeight:600 }}>PREDICTED DELAY</div>
                  <div style={{ fontSize:18, fontWeight:800 }}>{riskModalData.predicted_delay_days} Days</div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding:'26px 30px', display:'flex', flexDirection:'column', gap:20, maxHeight:'70vh', overflowY:'auto' }}>

              {/* Risk Factors */}
              <div>
                <h4 style={{ fontSize:14, fontWeight:800, color:'#1e293b', margin:'0 0 10px', display:'flex', alignItems:'center', gap:8 }}>
                  <ShieldAlert size={16} color="#ef4444" /> Identified Risk Bottlenecks & Factors
                </h4>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {riskModalData.factors?.map((f, idx) => (
                    <div key={idx} style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, fontSize:13, color:'#991b1b', fontWeight:500 }}>
                      ⚠️ {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Impacted Employees */}
              {riskModalData.impacted_employees?.length > 0 && (
                <div>
                  <h4 style={{ fontSize:14, fontWeight:800, color:'#1e293b', margin:'0 0 10px', display:'flex', alignItems:'center', gap:8 }}>
                    <User size={16} color="#2563eb" /> Employees at High Workload / Risk
                  </h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {riskModalData.impacted_employees.map((emp, idx) => (
                      <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:'#1e40af' }}>{emp.name}</div>
                          <div style={{ fontSize:11, color:'#3b82f6' }}>{emp.role}</div>
                        </div>
                        <span style={{ background:'#ef4444', color:'#fff', fontSize:11, fontWeight:800, padding:'3px 10px', borderRadius:20 }}>
                          Workload: {emp.workload}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div>
                <h4 style={{ fontSize:14, fontWeight:800, color:'#1e293b', margin:'0 0 10px', display:'flex', alignItems:'center', gap:8 }}>
                  <Sparkles size={16} color="#059669" /> Recommended AI Mitigation Actions
                </h4>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {riskModalData.recommendations?.map((rec, idx) => (
                    <div key={idx} style={{ padding:'11px 15px', background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:10, fontSize:13, color:'#065f46', fontWeight:600 }}>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding:'16px 30px 24px', borderTop:'1px solid #f1f5f9', textAlign:'right' }}>
              <button onClick={() => setRiskModalData(null)}
                style={{ padding:'10px 24px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Done Inspecting
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Create project modal */}
      {showForm && (
        <div className="es-modal-overlay">
          <div className="es-modal" style={{ maxWidth: 480, padding: 32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>Create New Project</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={20} /></button>
            </div>
            <form onSubmit={createProject} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[['Project Name','text','project_name'],['Description','text','description'],['End Date','date','end_date']].map(([label,type,key]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))} required={key!=='description'}
                    autoFocus={key === 'project_name'}
                    style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                    onFocus={e => e.target.style.borderColor='#2563eb'}
                    onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({...f,priority:e.target.value}))}
                  style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#fff' }}>
                  {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex:1, padding:'11px', background:'#f3f4f6', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button type="submit"
                  style={{ flex:2, padding:'11px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
