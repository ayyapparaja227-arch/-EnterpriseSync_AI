import { useState, useEffect } from 'react'
import {
  FolderKanban, Plus, AlertTriangle, Calendar, User, X, Search,
  CheckCircle2, Clock, ShieldAlert, Sparkles, TrendingUp, ArrowRight
} from 'lucide-react'
import api from '../api'
import { MOCK_PROJECTS } from '../mockData'

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
const pbar   = p => p >= 80 ? '#10b981' : p >= 40 ? '#2563eb' : '#f59e0b'

function Badge({ text, map }) {
  const [bg, color] = (map[text] || '#f3f4f6:#374151').split(':')
  return <span style={{ background:bg, color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600, textTransform:'capitalize' }}>{text}</span>
}

export default function Projects() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [search, setSearch]     = useState('')
  const [riskModalData, setRiskModalData] = useState(null)
  const [riskLoad, setRiskLoad] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ project_name:'', description:'', priority:'medium', end_date:'' })
  const [toast, setToast]       = useState('')

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
    }
    try {
      const np = await api.post('/api/projects', form)
      // API success — use server response (may have real ID)
      const merged = { ...newProject, ...np }
      setProjects(p => [...p, merged])
    } catch {
      // API offline — add locally so the UI still works
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
          <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>Projects</h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{filtered.length} of {projects.length} active enterprise projects</p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ display:'flex', alignItems:'center', gap:8, background:'#2563eb', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Search */}
      <div style={{ position:'relative', maxWidth:360 }}>
        <Search size={16} color="#9ca3af" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
          style={{ width:'100%', paddingLeft:38, paddingRight:16, paddingTop:10, paddingBottom:10, border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
      </div>

      {/* Projects Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {filtered.map((p, idx) => (
          <div key={p.project_id} className={`es-card hover-lift animate-fadeInUp delay-${(idx%5)+1}`}
            style={{ padding:24, display:'flex', flexDirection:'column', gap:14 }}>

            {/* Top */}
            <div style={{ display:'flex', gap:12 }}>
              <div style={{ background:'#eff6ff', borderRadius:10, padding:10, flexShrink:0 }}>
                <FolderKanban size={20} color="#2563eb" />
              </div>
              <div style={{ minWidth:0 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.project_name}</h3>
                <p style={{ fontSize:12, color:'#6b7280', margin:'3px 0 0', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.description}</p>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display:'flex', gap:6 }}>
              <Badge text={p.priority} map={PBADGE} />
              <Badge text={p.status}   map={SBADGE} />
            </div>

            {/* Progress */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                <span style={{ color:'#6b7280' }}>Progress</span>
                <span style={{ fontWeight:700, color:'#111827' }}>{p.completion_percentage}%</span>
              </div>
              <div style={{ height:8, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${p.completion_percentage}%`, background:pbar(p.completion_percentage), borderRadius:4, transition:'width 0.4s' }} />
              </div>
            </div>

            {/* Meta */}
            <div style={{ display:'flex', gap:14, fontSize:12, color:'#6b7280' }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><User size={12} />{p.manager_name}</span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={12} />{p.end_date}</span>
            </div>

            {/* Risk Analysis Action Button */}
            <button onClick={() => analyseRisk(p)} disabled={riskLoad}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'10px', borderRadius:10, background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background='#ffedd5'; e.currentTarget.style.borderColor='#f97316' }}
              onMouseLeave={e => { e.currentTarget.style.background='#fff7ed'; e.currentTarget.style.borderColor='#fed7aa' }}
            >
              <AlertTriangle size={16} /> AI Risk Analysis & Inspection
            </button>
          </div>
        ))}
      </div>

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
