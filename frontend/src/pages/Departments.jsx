import { useState, useEffect } from 'react'
import { Building2, MapPin, Users, Plus, X, User, Wallet, FileText } from 'lucide-react'
import api from '../api'
import { MOCK_DEPARTMENTS } from '../mockData'

const BG = ['#eff6ff:#2563eb','#f0fdf4:#059669','#fdf4ff:#9333ea','#fff7ed:#ea580c','#f0f9ff:#0284c7','#fdf2f8:#db2777']

export default function Departments() {
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ department_name:'', location:'' })

  useEffect(() => {
    api.get('/api/departments')
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return
        // Normalize field names: some backends return `name` instead of `department_name`
        const normalized = data.map(d => ({
          department_id:   d.department_id   ?? d.id,
          department_name: d.department_name ?? d.name ?? 'Unnamed',
          location:        d.location        ?? d.office ?? '—',
          employee_count:  d.employee_count  ?? d.headcount ?? 0,
        }))
        setDepartments(normalized)
      })
      .catch(() => { /* keep MOCK data on error */ })
  }, [])

  const create = e => {
    e.preventDefault()
    setDepartments(d => [...d, { department_id: d.length+1, ...form, employee_count:0 }])
    setShowForm(false); setForm({ department_name:'', location:'' })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>Departments</h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{departments.length} departments</p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ display:'flex', alignItems:'center', gap:8, background:'#2563eb', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          <Plus size={16} /> New Department
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
        {departments.map((dept, i) => {
          const [cardBg, iconColor] = (BG[i % BG.length]).split(':')
          return (
            <div key={dept.department_id ?? dept.id} className={`es-card hover-lift animate-fadeInUp delay-${(i%5)+1}`}
              style={{ padding:24 }}>
              <div style={{ display:'flex', gap:14, marginBottom:14 }}>
                <div style={{ background:cardBg, borderRadius:14, padding:14, flexShrink:0 }}>
                  <Building2 size={24} color={iconColor} />
                </div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 4px' }}>{dept.department_name}</h3>
                  {dept.description && <p style={{ fontSize:12, color:'#6b7280', margin:0, lineHeight:1.4 }}>{dept.description}</p>}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {dept.head && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151' }}>
                    <User size={13} color="#6b7280" />
                    <span style={{ fontWeight:500 }}>Head:</span> {dept.head}
                  </div>
                )}
                {dept.budget && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151' }}>
                    <Wallet size={13} color="#6b7280" />
                    <span style={{ fontWeight:500 }}>Budget:</span> {dept.budget}
                  </div>
                )}
                <div style={{ background:'#f9fafb', borderRadius:10, padding:'9px 13px', display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                  <Users size={14} color={iconColor} />
                  <span style={{ fontSize:13, color:'#374151', fontWeight:600 }}>{dept.employee_count} employees</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="es-modal-overlay">
          <div className="es-modal" style={{ maxWidth: 440, padding: 32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>New Department</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={20} /></button>
            </div>
            <form onSubmit={create} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Department Name','department_name'],['Location','location']].map(([lbl,key]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>{lbl}</label>
                  <input required value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
                    autoFocus={key === 'department_name'}
                    style={{ width:'100%', padding:'9px 13px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                    onFocus={e => e.target.style.borderColor='#2563eb'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                </div>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex:1, padding:'10px', background:'#f3f4f6', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button type="submit" style={{ flex:2, padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
