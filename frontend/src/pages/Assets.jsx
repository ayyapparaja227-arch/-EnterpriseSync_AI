import { useState, useEffect } from 'react'
import { Package, Plus, User, Calendar, X, Search } from 'lucide-react'
import api from '../api'

const MOCK = [
  { asset_id:1, asset_name:'MacBook Pro 16"', asset_type:'Laptop',  serial_number:'MBP-001', purchase_date:'2023-06-15', status:'assigned',     current_holder:'Jane Employee' },
  { asset_id:2, asset_name:'Dell Monitor 27"',asset_type:'Monitor', serial_number:'DM-050',  purchase_date:'2023-07-20', status:'available',    current_holder:null },
  { asset_id:3, asset_name:'iPhone 15 Pro',   asset_type:'Phone',   serial_number:'IP15-003',purchase_date:'2024-01-10', status:'assigned',     current_holder:'John Manager' },
  { asset_id:4, asset_name:'HP LaserJet Pro', asset_type:'Printer', serial_number:'HP-077',  purchase_date:'2022-03-05', status:'maintenance',  current_holder:null },
  { asset_id:5, asset_name:'iPad Air 5',       asset_type:'Tablet',  serial_number:'IPA-022', purchase_date:'2023-11-20', status:'available',    current_holder:null },
  { asset_id:6, asset_name:'Sony WH-1000XM5', asset_type:'Headset', serial_number:'SN-111',  purchase_date:'2024-02-14', status:'assigned',     current_holder:'Admin User' },
]

const SBADGE = {
  available:   '#dcfce7:#15803d',
  assigned:    '#dbeafe:#1d4ed8',
  maintenance: '#fef9c3:#92400e',
  retired:     '#f3f4f6:#374151',
}
const TYPE_ICON = { Laptop:'💻', Monitor:'🖥️', Phone:'📱', Printer:'🖨️', Tablet:'📲', Headset:'🎧' }

function Badge({ text, map }) {
  const [bg, color] = (map[text]||'#f3f4f6:#374151').split(':')
  return <span style={{ background:bg, color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600, textTransform:'capitalize' }}>{text}</span>
}

export default function Assets() {
  const [assets, setAssets]   = useState(MOCK)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ asset_name:'', asset_type:'', serial_number:'', purchase_date:'' })

  useEffect(() => { api.get('/api/assets').then(setAssets).catch(() => {}) }, [])

  const filtered = assets
    .filter(a => filter==='all' || a.status===filter)
    .filter(a => a.asset_name.toLowerCase().includes(search.toLowerCase()) || a.asset_type.toLowerCase().includes(search.toLowerCase()))

  const counts = ['all','available','assigned','maintenance'].reduce((acc,s) => ({
    ...acc, [s]: s==='all' ? assets.length : assets.filter(a => a.status===s).length
  }), {})

  const create = e => {
    e.preventDefault()
    setAssets(a => [...a, { asset_id:a.length+1, ...form, status:'available', current_holder:null }])
    setShowForm(false); setForm({ asset_name:'', asset_type:'', serial_number:'', purchase_date:'' })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>Assets</h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{filtered.length} assets</p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ display:'flex', alignItems:'center', gap:8, background:'#2563eb', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[{label:'Total',value:assets.length,color:'#2563eb'},{label:'Available',value:counts.available,color:'#10b981'},{label:'Assigned',value:counts.assigned,color:'#6366f1'},{label:'Maintenance',value:counts.maintenance,color:'#f59e0b'}].map(c => (
          <div key={c.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #f3f4f6', padding:'18px 20px', textAlign:'center' }}>
            <p style={{ fontSize:28, fontWeight:800, color:c.color, margin:0 }}>{c.value}</p>
            <p style={{ fontSize:12, color:'#6b7280', margin:'4px 0 0', fontWeight:600 }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative' }}>
          <Search size={14} color="#9ca3af" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…"
            style={{ paddingLeft:30, paddingRight:12, paddingTop:9, paddingBottom:9, border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:13, outline:'none', fontFamily:'inherit', width:200 }} />
        </div>
        {['all','available','assigned','maintenance'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'8px 14px', borderRadius:8, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize',
              background: filter===s ? '#2563eb' : '#f3f4f6',
              color: filter===s ? '#fff' : '#374151' }}>
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {filtered.map(asset => (
          <div key={asset.asset_id}
            style={{ background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', padding:22, transition:'box-shadow 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ background:'#f0f9ff', borderRadius:10, padding:10, fontSize:20, flexShrink:0 }}>
                  {TYPE_ICON[asset.asset_type] || '📦'}
                </div>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'0 0 3px' }}>{asset.asset_name}</h3>
                  <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{asset.asset_type}</p>
                </div>
              </div>
              <Badge text={asset.status} map={SBADGE} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12, color:'#6b7280' }}>
              <span>SN: <strong style={{ color:'#374151' }}>{asset.serial_number}</strong></span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={12} /> Purchased: {asset.purchase_date}</span>
              {asset.current_holder && <span style={{ display:'flex', alignItems:'center', gap:4 }}><User size={12} /> Assigned to: <strong style={{ color:'#374151' }}>{asset.current_holder}</strong></span>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:32, width:'100%', maxWidth:440, boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>Add New Asset</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={20} /></button>
            </div>
            <form onSubmit={create} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Asset Name','text','asset_name'],['Type (Laptop/Monitor…)','text','asset_type'],['Serial Number','text','serial_number'],['Purchase Date','date','purchase_date']].map(([lbl,type,key]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>{lbl}</label>
                  <input type={type} required value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
                    style={{ width:'100%', padding:'9px 13px', border:'1.5px solid #e5e7eb', borderRadius:9, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                    onFocus={e => e.target.style.borderColor='#2563eb'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                </div>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex:1, padding:'10px', background:'#f3f4f6', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                <button type="submit" style={{ flex:2, padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:9, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Add Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
