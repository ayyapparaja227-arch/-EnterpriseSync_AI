import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Shield, Globe, Moon, Save } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    notif_deadline: true, notif_assignment: true, notif_risk: true, notif_completion: false,
    theme: 'light', language: 'English', timezone: 'UTC+5:30',
  })
  const [saved, setSaved] = useState(false)

  const toggle = key => setSettings(s => ({ ...s, [key]: !s[key] }))
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const Section = ({ icon: Icon, title, children }) => (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', padding:28, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, paddingBottom:16, borderBottom:'1px solid #f9fafb' }}>
        <div style={{ background:'#eff6ff', borderRadius:10, padding:8 }}><Icon size={18} color="#2563eb" /></div>
        <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', margin:0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )

  const Toggle = ({ label, sub, checked, onToggle }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f9fafb' }}>
      <div>
        <p style={{ fontSize:14, fontWeight:600, color:'#111827', margin:0 }}>{label}</p>
        {sub && <p style={{ fontSize:12, color:'#6b7280', margin:'2px 0 0' }}>{sub}</p>}
      </div>
      <button onClick={onToggle}
        style={{ width:48, height:26, borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', background: checked ? '#2563eb' : '#e5e7eb' }}>
        <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, transition:'left 0.2s', left: checked ? 24 : 4, boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:720 }}>

      <div>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#111827', margin:0 }}>Settings</h1>
        <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>Manage your preferences and configurations</p>
      </div>

      <Section icon={Bell} title="Notification Preferences">
        <Toggle label="Deadline Alerts"      sub="Get notified before task deadlines"      checked={settings.notif_deadline}   onToggle={() => toggle('notif_deadline')} />
        <Toggle label="Task Assignments"     sub="Get notified on new task assignments"    checked={settings.notif_assignment} onToggle={() => toggle('notif_assignment')} />
        <Toggle label="Risk Alerts"          sub="Get notified on high risk projects"      checked={settings.notif_risk}       onToggle={() => toggle('notif_risk')} />
        <Toggle label="Project Completion"   sub="Get notified when projects complete"     checked={settings.notif_completion} onToggle={() => toggle('notif_completion')} />
      </Section>

      <Section icon={Moon} title="Appearance">
        <div style={{ display:'flex', gap:12 }}>
          {['light','dark','system'].map(t => (
            <button key={t} onClick={() => setSettings(s => ({...s, theme:t}))}
              style={{ flex:1, padding:'12px', borderRadius:10, border:`2px solid ${settings.theme===t?'#2563eb':'#e5e7eb'}`, background: settings.theme===t ? '#eff6ff' : '#fff', color: settings.theme===t ? '#2563eb' : '#374151', cursor:'pointer', fontWeight:600, fontSize:13, textTransform:'capitalize', fontFamily:'inherit', transition:'all 0.15s' }}>
              {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={Globe} title="Regional Settings">
        {[['Language', 'language', ['English','Tamil','Hindi','French','German']],['Timezone','timezone',['UTC','UTC+5:30','UTC-5:00','UTC+8:00']]].map(([lbl,key,opts]) => (
          <div key={key} style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 }}>{lbl}</label>
            <select value={settings[key]} onChange={e => setSettings(s => ({...s,[key]:e.target.value}))}
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', background:'#fff', fontFamily:'inherit' }}>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </Section>

      <Section icon={Shield} title="Security">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[['Current Password','password'],['New Password','password'],['Confirm New Password','password']].map(([lbl,type]) => (
            <div key={lbl}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>{lbl}</label>
              <input type={type} placeholder="••••••••"
                style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                onFocus={e => e.target.style.borderColor='#2563eb'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
            </div>
          ))}
        </div>
      </Section>

      <button onClick={save}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', background: saved ? '#10b981' : '#2563eb', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', transition:'background 0.3s', fontFamily:'inherit' }}>
        <Save size={18} /> {saved ? '✓ Settings Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
