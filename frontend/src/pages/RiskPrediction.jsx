import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Clock, Users, CheckSquare, RefreshCw } from 'lucide-react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import api from '../api'

const PROJECTS = [
  { project_id:1, name:'Website Redesign',   completion:65, end_date:'2026-09-30' },
  { project_id:2, name:'Mobile App Dev',      completion:35, end_date:'2026-12-31' },
  { project_id:3, name:'Database Migration',  completion:100,end_date:'2026-06-30' },
  { project_id:4, name:'AI Analytics Module', completion:20, end_date:'2026-11-30' },
]

const RISK_TREND = [
  {date:'Jul 25',score:38},{date:'Jul 26',score:42},{date:'Jul 27',score:45},
  {date:'Jul 28',score:43},{date:'Jul 29',score:40},{date:'Jul 30',score:42},{date:'Jul 31',score:44},
]

function GaugeChart({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981'
  const data = [{ name:'score', value: score, fill: color }]
  return (
    <div style={{ position:'relative', width:220, height:130 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="100%" barSize={16} data={data} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
        <div style={{ fontSize:32, fontWeight:800, color, lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:12, color:'#6b7280', marginTop:2, textTransform:'uppercase', fontWeight:600 }}>
          {score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MEDIUM' : 'LOW RISK'}
        </div>
      </div>
    </div>
  )
}

export default function RiskPrediction() {
  const [selectedId, setSelectedId] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const predict = async id => {
    setLoading(true); setResult(null)
    try { setResult(await api.get(`/api/risks/predict/${id}`)) }
    catch {
      const p = PROJECTS.find(x => x.project_id===id)
      const score = Math.round(100 - p.completion + (p.completion < 50 ? 20 : 0))
      setResult({
        project_name: p.name,
        risk_score: Math.min(score, 95),
        risk_level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
        predicted_delay_days: score >= 70 ? 12 : score >= 40 ? 5 : 0,
        recommendations: score >= 70
          ? ['🚨 Immediate action required','Consider increasing team size','Request deadline extension']
          : score >= 40
          ? ['⚠️ Moderate risk detected','Monitor daily progress','Reallocate resources if needed']
          : ['✅ Project is on track','Maintain current pace','Keep monitoring'],
      })
    }
    finally { setLoading(false) }
  }

  useEffect(() => { predict(selectedId) }, [selectedId])

  const riskColor = result ? (result.risk_level==='high' ? '#ef4444' : result.risk_level==='medium' ? '#f59e0b' : '#10b981') : '#6b7280'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      <div>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>AI Risk Prediction</h1>
        <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>ML-powered project risk assessment and recommendations</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20 }}>

        {/* Left — project selector */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#374151', margin:0 }}>Select Project</h3>
          {PROJECTS.map(p => (
            <div key={p.project_id} onClick={() => setSelectedId(p.project_id)}
              style={{ background:'#fff', borderRadius:14, border:`2px solid ${selectedId===p.project_id ? '#2563eb' : '#f3f4f6'}`, padding:'14px 18px', cursor:'pointer', transition:'border-color 0.2s' }}>
              <p style={{ fontWeight:700, color:'#111827', margin:'0 0 6px', fontSize:14 }}>{p.name}</p>
              <div style={{ height:6, background:'#f3f4f6', borderRadius:3, marginBottom:4 }}>
                <div style={{ height:'100%', width:`${p.completion}%`, background:'#2563eb', borderRadius:3 }} />
              </div>
              <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{p.completion}% complete · Due {p.end_date}</p>
            </div>
          ))}
        </div>

        {/* Right — results */}
        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'#fff', borderRadius:16, border:'1px solid #f3f4f6' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ width:40, height:40, border:'4px solid #dbeafe', borderTopColor:'#2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
              <p style={{ marginTop:12, color:'#6b7280', fontSize:14 }}>Analysing risk…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          </div>
        ) : result && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Score card */}
            <div style={{ background:'#fff', borderRadius:16, border:`2px solid ${riskColor}20`, padding:28, display:'flex', flexDirection:'column', alignItems:'center', gap:4, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#6b7280', margin:0 }}>AI RISK ANALYSIS</p>
              <p style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'4px 0 16px' }}>{result.project_name}</p>
              <GaugeChart score={result.risk_score} />
              <div style={{ display:'flex', gap:24, marginTop:12 }}>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:22, fontWeight:800, color:'#ef4444', margin:0 }}>{result.predicted_delay_days}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>Delay Days</p>
                </div>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:22, fontWeight:800, color:riskColor, margin:0, textTransform:'capitalize' }}>{result.risk_level}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>Risk Level</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 14px' }}>🤖 AI Recommendations</h4>
              {result.recommendations?.map((r,i) => (
                <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom: i < result.recommendations.length-1 ? '1px solid #f9fafb' : 'none' }}>
                  <span style={{ fontSize:14 }}>→</span>
                  <p style={{ fontSize:13, color:'#374151', margin:0 }}>{r}</p>
                </div>
              ))}
            </div>

            {/* Refresh */}
            <button onClick={() => predict(selectedId)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:'#f0f9ff', color:'#0284c7', border:'1px solid #bae6fd', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              <RefreshCw size={16} /> Regenerate Analysis
            </button>
          </div>
        )}
      </div>

      {/* Risk trend */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:'0 0 20px' }}>Risk Trend (7 Days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={RISK_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize:12 }} />
            <YAxis domain={[0,100]} tick={{ fontSize:12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2.5} dot={{ r:5, fill:'#ef4444' }} activeDot={{ r:7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
