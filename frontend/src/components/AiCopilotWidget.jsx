import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Bot, User, RefreshCw, ChevronRight, Zap, CheckCircle2 } from 'lucide-react'

const QUICK_PROMPTS = [
  '🤖 Analyze Team Workload',
  '🚨 Check Project Delays',
  '⚡ Recommend Task Rebalance',
  '📝 Summarize HR Risk Factors',
]

const MOCK_AI_KNOWLEDGE = {
  'workload': `📊 **Team Workload Summary**:
- **Arun Kumar**: 5 active tasks (92% capacity — High Risk)
- **Priya Sharma**: 3 active tasks (65% capacity — Normal)
- **Rahul Patel**: 4 active tasks (80% capacity — Moderate)

💡 *Recommendation*: Reallocate 2 UI tasks from Arun Kumar to Priya Sharma to avoid developer burnout.`,

  'delays': `🚨 **Project Risk & Delay Breakdown**:
1. **Website Redesign**: 12 days predicted delay due to frontend bottleneck.
2. **Mobile App Dev**: 24 days critical delay probability.
3. **Database Migration**: On schedule (0 days delay).

💡 *Action Plan*: Approve deadline extension or shift non-critical features to Phase 2.`,

  'rebalance': `⚡ **AI Automated Workload Rebalance**:
- Transfer Task #104 (*"React Native Setup"*) from **Arun Kumar** ➔ **Priya Sharma**.
- Transfer Task #108 (*"QA Regression Test"*) from **Arun Kumar** ➔ **Rahul Patel**.

✅ *Result*: Workload balance rating improves from 62% to 94%.`,

  'hr': `📝 **HR Wellness & Risk Insight**:
- 1 employee flagged for high burnout risk (*Arun Kumar*).
- 2 pending leave requests waiting for HR review (*Rahul Patel* & *Priya Sharma*).
- System overall health score: **94/100**.`,
}

export default function AiCopilotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Hi! I am **EnterpriseSync AI Copilot**. How can I assist you with team analytics, risk prediction, or task balancing today?'
    }
  ])

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const handleSend = (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg = { id: Date.now(), sender: 'user', text: query }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setThinking(true)

    // Simulate AI inference delay
    setTimeout(() => {
      let responseText = `🤖 Based on system telemetry and database metrics:\n\n`
      const lower = query.toLowerCase()

      if (lower.includes('workload') || lower.includes('team')) {
        responseText += MOCK_AI_KNOWLEDGE['workload']
      } else if (lower.includes('delay') || lower.includes('project') || lower.includes('risk')) {
        responseText += MOCK_AI_KNOWLEDGE['delays']
      } else if (lower.includes('rebalance') || lower.includes('task')) {
        responseText += MOCK_AI_KNOWLEDGE['rebalance']
      } else if (lower.includes('hr') || lower.includes('wellness') || lower.includes('burnout')) {
        responseText += MOCK_AI_KNOWLEDGE['hr']
      } else {
        responseText += `I have analyzed your query regarding *"${query}"*.\n\nAll 4 active projects and 6 system users are monitored. Recommended action: check the **Risk Engine** tab for live prediction charts.`
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: responseText }])
      setThinking(false)
    }, 800)
  }

  return (
    <>
      {/* Floating Sparkle Trigger Button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: '#fff', border: 'none', borderRadius: 30,
          padding: open ? '12px 18px' : '14px 22px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 30px rgba(37,99,235,0.45)',
          cursor: 'pointer', fontFamily: 'inherit',
          fontWeight: 800, fontSize: 14,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <Sparkles size={20} color="#fde047" className="animate-spin-slow" />
        <span>{open ? 'Close Copilot' : 'AI Copilot Assistant'}</span>
      </button>

      {/* Drawer Chat Window */}
      {open && (
        <div
          className="animate-scaleIn"
          style={{
            position: 'fixed', bottom: 84, right: 24, zIndex: 999,
            width: 400, maxWidth: 'calc(100vw - 32px)', height: 540,
            background: '#fff', borderRadius: 24,
            boxShadow: '0 24px 70px rgba(15,23,42,0.3)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', border: '1px solid var(--border)'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '18px 20px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#2563eb', padding: 8, borderRadius: 10, display: 'flex' }}>
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  EnterpriseSync AI
                  <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 10 }}>ONLINE</span>
                </h3>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Powered by AGY Neural Risk Engine</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: 'var(--surface-2)', overflowX: 'auto', borderBottom: '1px solid var(--border-light)' }}>
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                style={{
                  whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 20,
                  border: '1px solid var(--border)', background: '#fff',
                  fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex', gap: 10,
                  flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: m.sender === 'user' ? '#2563eb' : '#0f172a',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 12
                }}>
                  {m.sender === 'user' ? 'U' : <Bot size={16} />}
                </div>
                <div style={{
                  maxWidth: '82%', padding: '12px 14px', borderRadius: 14,
                  fontSize: 12.5, lineHeight: 1.5,
                  background: m.sender === 'user' ? '#2563eb' : '#fff',
                  color: m.sender === 'user' ? '#fff' : '#1e293b',
                  boxShadow: m.sender === 'ai' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  border: m.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                  whiteSpace: 'pre-line'
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {thinking && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="#fff" />
                </div>
                <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                  <div className="es-loader"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={e => { e.preventDefault(); handleSend() }}
            style={{
              padding: '12px 16px', background: '#fff',
              borderTop: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', gap: 10
            }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask EnterpriseSync AI anything…"
              style={{
                flex: 1, border: '1.5px solid var(--border)', borderRadius: 12,
                padding: '9px 14px', fontSize: 13, outline: 'none',
                fontFamily: 'inherit', color: 'var(--text-primary)'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                background: input.trim() ? 'var(--primary)' : '#e2e8f0',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '9px 12px', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </>
  )
}
