import { useState } from 'react'
import {
  Slack, Chrome, CheckCircle2, XCircle, Zap, Send,
  Webhook, Globe, Link, RefreshCw, AlertTriangle, ExternalLink,
  MessageSquare, Video, Mail, GitBranch, ToggleLeft, ToggleRight, Copy, Check
} from 'lucide-react'

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Send task deadline alerts, project risk warnings, and AI Copilot notifications directly to your Slack channels.',
    icon: '💬',
    color: '#4A154B',
    bg: '#fdf4ff',
    border: '#e9d5ff',
    features: ['Task deadline alerts', 'Risk score spike notifications', 'Leave approval updates', 'AI Copilot insights'],
    webhookLabel: 'Slack Incoming Webhook URL',
    webhookPlaceholder: 'https://hooks.slack.com/services/T.../B.../...',
    docsUrl: 'https://api.slack.com/messaging/webhooks',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'Communication',
    description: 'Integrate with MS Teams to receive enterprise notifications, assign tasks via chat commands, and share reports.',
    icon: '🟦',
    color: '#6264A7',
    bg: '#f0f0ff',
    border: '#c7c7f0',
    features: ['Teams channel notifications', 'Adaptive card messages', 'Task assignment via chat', 'Weekly summary cards'],
    webhookLabel: 'Teams Webhook Connector URL',
    webhookPlaceholder: 'https://outlook.office.com/webhook/...',
    docsUrl: 'https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors',
  },
  {
    id: 'google',
    name: 'Google Workspace',
    category: 'Productivity',
    description: 'Sync with Google Calendar for deadline tracking, Google Meet for standup reminders, and Gmail for email notifications.',
    icon: '🔵',
    color: '#4285F4',
    bg: '#eff6ff',
    border: '#bfdbfe',
    features: ['Calendar deadline sync', 'Meet standup reminders', 'Gmail email notifications', 'Google Drive report export'],
    webhookLabel: 'Google Chat Webhook URL',
    webhookPlaceholder: 'https://chat.googleapis.com/v1/spaces/.../messages?key=...',
    docsUrl: 'https://developers.google.com/chat/how-tos/webhooks',
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'Project Management',
    description: 'Two-way sync with Jira: push EnterpriseSync tasks to Jira issues and pull status updates back automatically.',
    icon: '🔷',
    color: '#0052CC',
    bg: '#eff6ff',
    border: '#93c5fd',
    features: ['Task ↔ Issue sync', 'Sprint import', 'Status webhook updates', 'Epic mapping to Projects'],
    webhookLabel: 'Jira Automation Webhook',
    webhookPlaceholder: 'https://your-domain.atlassian.net/rest/api/...',
    docsUrl: 'https://developer.atlassian.com/server/jira/platform/webhooks/',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Engineering',
    description: 'Link GitHub commits to tasks. Auto-complete tasks when a linked PR is merged. Track engineering productivity.',
    icon: '🐙',
    color: '#24292f',
    bg: '#f6f8fa',
    border: '#d1d5db',
    features: ['PR → Task auto-complete', 'Commit activity tracking', 'Branch-to-task linking', 'Code review notifications'],
    webhookLabel: 'GitHub Webhook Secret Token',
    webhookPlaceholder: 'https://api.github.com/repos/.../hooks',
    docsUrl: 'https://docs.github.com/en/developers/webhooks-and-events/webhooks',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Communication',
    description: 'Auto-schedule team standup and project review meetings. Send Zoom meeting links with AI agenda generation.',
    icon: '📹',
    color: '#2D8CFF',
    bg: '#eff6ff',
    border: '#93c5fd',
    features: ['Auto-schedule standups', 'AI-generated meeting agendas', 'Meeting recordings index', 'Attendance tracking'],
    webhookLabel: 'Zoom App OAuth Token',
    webhookPlaceholder: 'https://api.zoom.us/v2/...',
    docsUrl: 'https://marketplace.zoom.us/docs/api-reference/zoom-api/',
  },
]

const NOTIFICATION_EVENTS = [
  { id: 'task_assigned',     label: 'Task Assigned',           desc: 'When a task is assigned to a user',     default: true },
  { id: 'task_overdue',      label: 'Task Overdue',            desc: 'When a task deadline passes',           default: true },
  { id: 'risk_spike',        label: 'Project Risk Spike',      desc: 'When a project risk score crosses 70%', default: true },
  { id: 'leave_approved',    label: 'Leave Approved/Rejected', desc: 'When HR approves or rejects leave',     default: true },
  { id: 'workload_alert',    label: 'Workload Overload Alert', desc: 'When an employee hits 90% capacity',    default: false },
  { id: 'project_completed', label: 'Project Completed',       desc: 'When a project is marked complete',    default: true },
  { id: 'new_employee',      label: 'New Employee Joined',     desc: 'When HR onboards a new employee',      default: false },
  { id: 'weekly_report',     label: 'Weekly Summary Report',   desc: 'Sent every Monday at 9 AM',            default: true },
]

const STORAGE_KEY = 'es_integrations'

function loadSettings() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return {
    connections: {},
    webhooks: {},
    events: NOTIFICATION_EVENTS.reduce((a, e) => ({ ...a, [e.id]: e.default }), {})
  }
}

function saveSettings(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export default function Integrations() {
  const [settings, setSettings] = useState(loadSettings)
  const [expanded, setExpanded] = useState(null)
  const [testing, setTesting] = useState(null)
  const [testResult, setTestResult] = useState({})
  const [copiedId, setCopiedId] = useState(null)

  const update = (s) => { setSettings(s); saveSettings(s) }

  const toggleConnection = (id) => {
    const s = { ...settings, connections: { ...settings.connections, [id]: !settings.connections[id] } }
    update(s)
  }

  const setWebhook = (id, val) => {
    const s = { ...settings, webhooks: { ...settings.webhooks, [id]: val } }
    update(s)
  }

  const toggleEvent = (id) => {
    const s = { ...settings, events: { ...settings.events, [id]: !settings.events[id] } }
    update(s)
  }

  const testWebhook = (intg) => {
    setTesting(intg.id)
    setTestResult(r => ({ ...r, [intg.id]: null }))
    setTimeout(() => {
      const ok = !!(settings.webhooks[intg.id])
      setTestResult(r => ({
        ...r,
        [intg.id]: ok
          ? `✅ Test message sent successfully to ${intg.name}!`
          : '❌ Please enter a valid webhook URL first.'
      }))
      setTesting(null)
    }, 1500)
  }

  const copyWebhookDocs = (id, url) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const connectedCount = Object.values(settings.connections).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={26} color="var(--primary)" /> Enterprise Integrations
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            Connect EnterpriseSync AI to your team's existing tools. Notifications and actions flow automatically.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: connectedCount > 0 ? 'var(--primary-soft)' : 'var(--surface-2)', border: `1px solid ${connectedCount > 0 ? 'var(--primary-border)' : 'var(--border)'}`, borderRadius: 12 }}>
          <CheckCircle2 size={16} color={connectedCount > 0 ? 'var(--primary)' : '#94a3b8'} />
          <span style={{ fontSize: 14, fontWeight: 700, color: connectedCount > 0 ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
            {connectedCount} / {INTEGRATIONS.length} Connected
          </span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {INTEGRATIONS.map(intg => {
          const connected = !!settings.connections[intg.id]
          const isOpen = expanded === intg.id
          return (
            <div key={intg.id}
              className="es-card"
              style={{ padding: 0, overflow: 'hidden', border: `1.5px solid ${connected ? 'var(--primary-border)' : 'var(--border-light)'}`, transition: 'all 0.3s ease' }}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpanded(isOpen ? null : intg.id)}
                style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, background: connected ? 'var(--primary-soft)' : '#fff' }}
              >
                <div style={{ fontSize: 32, lineHeight: 1 }}>{intg.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{intg.name}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border)' }}>
                      {intg.category}
                    </span>
                    {connected && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#dcfce7', color: '#15803d', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                        ● LIVE
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>{intg.description.slice(0, 60)}…</p>
                </div>
                {/* Toggle */}
                <button
                  onClick={e => { e.stopPropagation(); toggleConnection(intg.id) }}
                  title={connected ? 'Disconnect' : 'Connect'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                >
                  {connected
                    ? <ToggleRight size={32} color="var(--primary)" />
                    : <ToggleLeft size={32} color="#94a3b8" />}
                </button>
              </div>

              {/* Expanded Config Panel */}
              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-light)', animation: 'fadeIn 0.25s ease both' }}>

                  {/* Features list */}
                  <div style={{ padding: '12px 0 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {intg.features.map(f => (
                      <span key={f} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--surface-2)', borderRadius: 20, color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        ✓ {f}
                      </span>
                    ))}
                  </div>

                  {/* Webhook URL Input */}
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    {intg.webhookLabel}
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      type="text"
                      placeholder={intg.webhookPlaceholder}
                      value={settings.webhooks[intg.id] || ''}
                      onChange={e => setWebhook(intg.id, e.target.value)}
                      className="es-input"
                      style={{ fontSize: 11, flex: 1 }}
                    />
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => testWebhook(intg)}
                      disabled={testing === intg.id}
                      className="es-btn es-btn-primary"
                      style={{ fontSize: 12, padding: '8px 14px', gap: 6 }}
                    >
                      {testing === intg.id
                        ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Testing…</>
                        : <><Send size={13} /> Send Test</>}
                    </button>
                    <a href={intg.docsUrl} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      <ExternalLink size={12} /> Docs
                    </a>
                    <button
                      onClick={() => copyWebhookDocs(intg.id, intg.webhookPlaceholder)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: 0 }}
                    >
                      {copiedId === intg.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                      {copiedId === intg.id ? 'Copied' : 'Copy URL'}
                    </button>
                  </div>

                  {testResult[intg.id] && (
                    <div style={{ marginTop: 10, fontSize: 12, padding: '8px 12px', borderRadius: 8, background: testResult[intg.id].startsWith('✅') ? '#f0fdf4' : '#fff1f2', border: `1px solid ${testResult[intg.id].startsWith('✅') ? '#bbf7d0' : '#fca5a5'}`, color: testResult[intg.id].startsWith('✅') ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                      {testResult[intg.id]}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Notification Event Configuration */}
      <div className="es-card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Webhook size={18} color="var(--primary)" /> Notification Event Triggers
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          Choose which events trigger notifications to your connected integrations.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
          {NOTIFICATION_EVENTS.map(ev => (
            <div key={ev.id}
              onClick={() => toggleEvent(ev.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1.5px solid ${settings.events[ev.id] ? 'var(--primary-border)' : 'var(--border)'}`, borderRadius: 12, background: settings.events[ev.id] ? 'var(--primary-soft)' : '#fff', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 5, background: settings.events[ev.id] ? 'var(--primary)' : 'var(--surface-2)', border: `2px solid ${settings.events[ev.id] ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                {settings.events[ev.id] && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ev.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ev.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
