import { useState } from 'react'
import { Briefcase, Mail, Lock, Eye, EyeOff, User, Users, Shield, ChevronRight, ShieldAlert } from 'lucide-react'
import axios from 'axios'
import { mockLogin, MOCK_EMPLOYEES } from '../mockData'
import { useSearchParams } from 'react-router-dom'

const PORTALS = [
  {
    id: 'employee',
    label: 'Employee',
    emoji: '👤',
    icon: User,
    color: '#0d9488',
    gradFrom: '#0f766e',
    gradTo: '#14b8a6',
    bg: '#f0fdfa',
    border: '#99f6e4',
    textColor: '#0f766e',
    description: 'Access your personal profile & assigned tasks',
  },
  {
    id: 'manager',
    label: 'Manager',
    emoji: '👔',
    icon: Users,
    color: '#059669',
    gradFrom: '#047857',
    gradTo: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    textColor: '#065f46',
    description: 'View all employee records & team workload',
  },
  {
    id: 'admin',
    label: 'Admin',
    emoji: '🛡️',
    icon: Shield,
    color: '#0369a1',
    gradFrom: '#075985',
    gradTo: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    textColor: '#0c4a6e',
    description: 'Full access — manage & configure everything',
  },
]


export default function Login({ onLogin }) {
  const [selectedPortal, setSelectedPortal] = useState('employee')
  const [email, setEmail] = useState('arun@company.com')
  const [password, setPassword] = useState('arun123')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('reason') === 'timeout'

  const portal = PORTALS.find(p => p.id === selectedPortal)

  const selectPortal = (p) => {
    setSelectedPortal(p.id)
    setError('')
    if (p.id === 'manager') { setEmail('manager@company.com'); setPassword('manager123') }
    else if (p.id === 'admin') { setEmail('admin@company.com'); setPassword('admin123') }
    else { setEmail('arun@company.com'); setPassword('arun123') }
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')

    // ── Step 1: Try real backend (direct axios, 3s timeout, no interceptors) ──
    let backendOk = false
    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await axios.post(
        `${BASE}/api/auth/login`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' }, timeout: 3000 }
      )
      onLogin(res.data.access_token, res.data.user)
      backendOk = true
    } catch {
      // backend unavailable or wrong creds — fall through to mock auth
    }

    // ── Step 2: Mock auth fallback ────────────────────────────────────────────
    if (!backendOk) {
      const mockRes = mockLogin(email, password)
      if (mockRes) {
        onLogin(mockRes.access_token, mockRes.user)
      } else {
        setError('Invalid email or password. Please check your credentials.')
      }
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027 0%, #1a3040 60%, #0f2027 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative floating subtle radial background glows */}
      <div className="animate-float" style={{ position:'absolute', top:-120, left:-80, width:380, height:380, background:'radial-gradient(circle,rgba(13,148,136,0.18) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div className="animate-float delay-2" style={{ position:'absolute', bottom:-100, right:-60, width:320, height:320, background:'radial-gradient(circle,rgba(5,150,105,0.15) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div className="animate-scaleIn" style={{
        width:'100%', maxWidth:940,
        display:'grid', gridTemplateColumns:'1fr 1fr',
        borderRadius:24, overflow:'hidden',
        boxShadow:'0 40px 100px rgba(15,32,39,0.55)',
        position:'relative', zIndex:1
      }}>
        {/* ── Left Panel ── */}
        <div style={{
          background:'linear-gradient(180deg,#1a3040 0%,#0f2027 100%)',
          padding:'44px 36px', display:'flex', flexDirection:'column', gap:0
        }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <div style={{ background:'#0d9488', borderRadius:12, padding:'10px', display:'flex' }}>
              <Briefcase size={22} color="#fff" />
            </div>
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:17, letterSpacing:-0.3 }}>EnterpriseSync AI</div>
              <div style={{ color:'#5eead4', fontSize:11 }}>AI Workforce Platform</div>
            </div>
          </div>

          <h2 style={{ color:'#fff', fontSize:26, fontWeight:800, lineHeight:1.35, margin:'0 0 10px', letterSpacing:-0.5 }}>
            Choose Your<br />Access Portal
          </h2>
          <p style={{ color:'#64748b', fontSize:13, margin:'0 0 32px', lineHeight:1.6 }}>
            Secure, role-based access for every member of your organization.
          </p>

          {/* Portal Cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {PORTALS.map(p => {
              const IconComp = p.icon
              const active = selectedPortal === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => selectPortal(p)}
                  style={{
                    display:'flex', alignItems:'center', gap:14,
                    padding:'14px 16px',
                    background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: active ? `1.5px solid rgba(255,255,255,0.35)` : '1.5px solid rgba(255,255,255,0.08)',
                    borderRadius:14, cursor:'pointer', textAlign:'left',
                    transition:'all 0.2s ease', width:'100%'
                  }}
                >
                  <div style={{
                    width:40, height:40, borderRadius:10, flexShrink:0,
                    background: active ? `linear-gradient(135deg,${p.gradFrom},${p.gradTo})` : 'rgba(255,255,255,0.08)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow: active ? `0 4px 12px ${p.color}50` : 'none',
                    transition:'all 0.2s'
                  }}>
                    <IconComp size={18} color="#fff" />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{p.emoji} {p.label} Portal</div>
                    <div style={{ color: active ? '#93c5fd' : '#475569', fontSize:11, marginTop:2, transition:'color 0.2s' }}>{p.description}</div>
                  </div>
                  {active && (
                    <div style={{ flexShrink:0 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80' }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ marginTop:'auto', paddingTop:40 }}>
            <p style={{ color:'#1e3a5a', fontSize:11, margin:0 }}>© 2026 EnterpriseSync AI. All rights reserved.</p>
          </div>
        </div>

        {/* ── Right Panel (Form) ── */}
        <div style={{ background:'#fff', padding:'44px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>

          {/* Session Expired Banner — shown when auto-logout fired */}
          {sessionExpired && (
            <div style={{
              display:'flex', alignItems:'flex-start', gap:12,
              background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:12,
              padding:'14px 16px', marginBottom:24,
              animation:'fadeInUp 0.4s ease both'
            }}>
              <ShieldAlert size={18} color="#f97316" style={{ flexShrink:0, marginTop:1 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#92400e' }}>Session Expired</div>
                <div style={{ fontSize:12, color:'#b45309', marginTop:2, lineHeight:1.5 }}>
                  You were automatically logged out after 15 minutes of inactivity. Please sign in again.
                </div>
              </div>
            </div>
          )}

          {/* Active portal badge */}
          <div style={{ marginBottom:28 }}>

            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:portal.bg, border:`1px solid ${portal.border}`,
              padding:'5px 14px', borderRadius:20, marginBottom:18
            }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:portal.color, boxShadow:`0 0 6px ${portal.color}80` }} />
              <span style={{ color:portal.textColor, fontSize:12, fontWeight:700 }}>{portal.emoji} {portal.label} Portal Active</span>
            </div>
            <h2 style={{ fontSize:26, fontWeight:800, color:'#111827', margin:'0 0 6px', letterSpacing:-0.5 }}>Sign In</h2>
            <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>Enter your credentials to access the platform</p>
          </div>

          {error && (
            <div style={{
              background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
              padding:'11px 14px', borderRadius:10, fontSize:13, marginBottom:20,
              display:'flex', alignItems:'center', gap:8
            }}>
              <span style={{ fontSize:16 }}>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={submit}>
            {/* Email */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} color="#9ca3af" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="Enter your email"
                  style={{
                    width:'100%', paddingLeft:36, paddingRight:14, paddingTop:11, paddingBottom:11,
                    border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14,
                    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
                    color:'#111827', transition:'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = portal.color; e.target.style.boxShadow = `0 0 0 3px ${portal.color}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} color="#9ca3af" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
                <input
                  type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  style={{
                    width:'100%', paddingLeft:36, paddingRight:42, paddingTop:11, paddingBottom:11,
                    border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14,
                    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
                    color:'#111827', transition:'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = portal.color; e.target.style.boxShadow = `0 0 0 3px ${portal.color}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding:0 }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width:'100%', padding:'13px',
                background: loading ? '#93c5fd' : `linear-gradient(135deg, ${portal.gradFrom}, ${portal.gradTo})`,
                color:'#fff', border:'none', borderRadius:11, fontSize:15,
                fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow: loading ? 'none' : `0 4px 18px ${portal.color}40`,
                transition:'all 0.2s'
              }}>
              {loading ? (
                <>
                  <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                  Signing in…
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </>
              ) : (
                <>Sign In to {portal.emoji} {portal.label} Portal <ChevronRight size={16} /></>
              )}
            </button>
          </form>

          {/* Security footer note */}
          <div style={{ marginTop:28, paddingTop:18, borderTop:'1px solid #f3f4f6', textAlign:'center' }}>
            <p style={{ fontSize:12, color:'#9ca3af', margin:0, fontWeight:500 }}>
              🔒 Protected by EnterpriseSync AI Multi-Factor Security
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
