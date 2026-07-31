import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts'
import { FileText, Download, TrendingUp, Users, FolderKanban, CheckSquare } from 'lucide-react'

const MONTHLY = [
  {month:'Jan',projects:3,tasks:24,completed:18},{month:'Feb',projects:4,tasks:30,completed:22},
  {month:'Mar',projects:5,tasks:28,completed:20},{month:'Apr',projects:4,tasks:35,completed:28},
  {month:'May',projects:6,tasks:40,completed:32},{month:'Jun',projects:5,tasks:38,completed:30},
  {month:'Jul',projects:3,tasks:25,completed:15},
]
const PERF = [
  {week:'W1',efficiency:72},{week:'W2',efficiency:78},{week:'W3',efficiency:75},
  {week:'W4',efficiency:82},{week:'W5',efficiency:85},{week:'W6',efficiency:80},
]
const DEPT_PERF = [
  {name:'Engineering',score:82},{name:'Marketing',score:75},{name:'HR',score:90},{name:'Finance',score:68},{name:'Design',score:88},
]

export default function Reports() {
  const [toast, setToast] = useState('')

  const exportCSV = () => {
    const headers = ['Month', 'Projects', 'Tasks', 'Completed']
    const rows = MONTHLY.map(m => [m.month, m.projects, m.tasks, m.completed])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `EnterpriseSync_Executive_Report_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setToast('✅ Executive CSV Report exported successfully!')
    setTimeout(() => setToast(''), 4000)
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {toast && (
        <div className="es-toast es-toast-success animate-scaleIn" style={{ position: 'relative', bottom: 'auto', right: 'auto', maxWidth: '100%' }}>
          {toast}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>Reports & Analytics</h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>Comprehensive executive performance & AI delivery insights</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={printReport}
            style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface-2)', color:'var(--text-primary)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:600, cursor:'pointer' }}
          >
            <FileText size={16} /> Print PDF
          </button>
          <button
            onClick={exportCSV}
            style={{ display:'flex', alignItems:'center', gap:8, background:'var(--primary)', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:600, cursor:'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Download size={16} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {[
          { label:'Project Success Rate', value:'87%',  icon:FolderKanban, color:'#2563eb', sub:'↑ 5% vs last quarter' },
          { label:'Task Completion Rate', value:'76%',  icon:CheckSquare,  color:'#10b981', sub:'↑ 3% vs last quarter' },
          { label:'Team Productivity',    value:'82%',  icon:Users,        color:'#7c3aed', sub:'↑ 8% vs last quarter' },
          { label:'Avg Delivery Time',    value:'12d',  icon:TrendingUp,   color:'#f59e0b', sub:'↓ 2 days improvement' },
        ].map((k, idx) => (
          <div key={k.label} className={`es-card hover-lift animate-fadeInUp delay-${idx+1}`} style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <p style={{ fontSize:12, color:'#6b7280', margin:0, fontWeight:500 }}>{k.label}</p>
              <div style={{ background:`${k.color}15`, borderRadius:8, padding:6 }}>
                <k.icon size={16} color={k.color} />
              </div>
            </div>
            <p style={{ fontSize:28, fontWeight:800, color:'#111827', margin:'0 0 4px' }}>{k.value}</p>
            <p style={{ fontSize:11, color: k.sub.includes('↑')||k.sub.includes('↓ 2') ? '#10b981' : '#f59e0b', margin:0 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>

        <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:'0 0 20px' }}>Monthly Projects vs Tasks</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="projects" stroke="#2563eb" fill="url(#gP)" strokeWidth={2} />
              <Area type="monotone" dataKey="tasks"    stroke="#10b981" fill="url(#gT)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:'0 0 20px' }}>Department Scores</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DEPT_PERF} layout="vertical" barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" domain={[0,100]} tick={{ fontSize:12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:12 }} width={80} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="score" fill="#6366f1" radius={[0,8,8,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team efficiency */}
      <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#111827', margin:'0 0 20px' }}>Team Efficiency Trend (Weekly)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={PERF}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="week" tick={{ fontSize:12 }} />
            <YAxis domain={[50,100]} tick={{ fontSize:12 }} />
            <Tooltip formatter={v => `${v}%`} />
            <Line type="monotone" dataKey="efficiency" stroke="#2563eb" strokeWidth={3} dot={{ r:5, fill:'#2563eb' }} activeDot={{ r:7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
