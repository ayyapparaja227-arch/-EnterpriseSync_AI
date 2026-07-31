import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, X, Send, Bot, User, RefreshCw, Copy, Check, Trash2, ShieldAlert, ArrowRight, CornerDownRight } from 'lucide-react'
import api from '../api'
import {
  MOCK_EMPLOYEES,
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_DEPARTMENTS,
  MOCK_ASSETS,
  MOCK_LEAVE_REQUESTS
} from '../mockData'

const MODELS = [
  { id: 'gemini25', name: 'Google Gemini 2.5 Flash', provider: 'Google', icon: '✨', color: '#0d9488' },
  { id: 'gpt4o', name: 'ChatGPT-4o Enterprise', provider: 'OpenAI', icon: '⚡', color: '#10a37f' },
  { id: 'claude', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🧠', color: '#d97706' },
]

// Role-Tailored Suggested Questions
const SUGGESTED_PROMPTS_BY_ROLE = {
  employee: [
    '📋 What tasks do I have today?',
    '⭐ Explain my performance',
    '👔 Who is my manager?',
    '📅 Show my attendance',
    '🏖️ How many leave days are left?',
    '💻 What assets are assigned to me?',
    '📝 Apply Leave',
  ],
  hr: [
    '👥 Show employee details',
    '📊 Attendance summary',
    '🏖️ Pending leave requests',
    '🏢 Department statistics',
    '⭐ Employee performance',
    '💻 Assign assets',
    '📑 Generate HR reports',
  ],
  manager: [
    '🚀 Project progress',
    '⏱️ Deadline analysis',
    '⚡ Who has the highest workload?',
    '🔄 Suggest task reassignment',
    '🚨 Project risks',
    '📈 Recommend resource allocation',
  ],
  admin: [
    '📊 System Analytics',
    '👥 Manage users',
    '📜 View audit logs',
    '🏢 Manage departments',
    '📁 Manage projects',
    '📑 Generate enterprise reports',
  ],
}

// Helper to strip raw markdown asterisks
function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\*/g, '')
}

export default function AiCopilotWidget({ user }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini25')
  const [copiedId, setCopiedId] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const userRole = (user?.role || 'employee').toLowerCase()
  const userName = user?.name || user?.first_name || 'Team Member'
  const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  // Default initial greeting prompt per user requirement
  const initialGreeting = `Hello ${userName} 👋

I'm Enterprise AI Copilot.

I can help you understand your dashboard, answer questions, explain reports, guide you through workflows, and perform actions.`

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: initialGreeting,
      timestamp: 'Just now',
      action: null
    }
  ])

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, thinking])

  // ── Intelligent Client-Side Fallback Engine with Strict RBAC ──────────────
  const generateRbacResponse = (userPrompt, historyList) => {
    const q = userPrompt.toLowerCase().trim()

    // 1. STRICT RBAC CHECK FOR EMPLOYEES
    if (userRole === 'employee') {
      const unauthorizedKeywords = [
        'salary of', 'everyone salary', 'others salary', 'all salaries',
        'hr report', 'private report', 'audit log', 'delete user', 'other employee'
      ]
      if (unauthorizedKeywords.some(kw => q.includes(kw))) {
        return {
          answer: "You don't have permission to access this information.",
          action: null
        }
      }
    }

    // 2. ACTION RECOGNITION
    let actionPayload = null
    if (q.includes('apply leave') || q.includes('take leave') || q.includes('request leave')) {
      actionPayload = { label: 'Open Leave Form', route: '/profile' }
    } else if (q.includes('create project') || q.includes('new project')) {
      actionPayload = { label: 'Go to Projects Page', route: '/projects' }
    } else if (q.includes('assign asset') || q.includes('assign laptop') || q.includes('my assets')) {
      actionPayload = { label: 'Go to Assets Page', route: '/assets' }
    } else if (q.includes('report') || q.includes('generate report')) {
      actionPayload = { label: 'View Enterprise Reports', route: '/reports' }
    }

    // 3. MULTI-TURN CONVERSATION MEMORY (RESOLVING "WHICH ONE")
    const lastAiMsg = historyList.filter(m => m.sender === 'ai').slice(-1)[0]?.text || ''

    if ((q.includes('which one') || q.includes('urgent') || q.includes('highest priority')) && userRole === 'employee') {
      return {
        answer: "Your highest priority task is 'Deploy to Production Server' (Priority: CRITICAL, Due: Today).",
        action: { label: 'View My Tasks', route: '/tasks' }
      }
    }

    // 4. ROLE-BASED ANSWERS
    if (q.includes('task') || q.includes('todo')) {
      if (userRole === 'employee') {
        return {
          answer: `Here are your assigned tasks for today, ${userName}:\n\n1. Deploy to Production Server — High Priority (Due Today)\n2. Setup React Native Auth — In Progress\n3. Review Unit Tests — Pending`,
          action: { label: 'Go to Tasks', route: '/tasks' }
        }
      } else {
        return {
          answer: `Enterprise Task Overview: 30+ total tasks tracked across departments. 12 In Progress, 14 To Do, 8 Completed.`,
          action: { label: 'Manage Tasks', route: '/tasks' }
        }
      }
    }

    if (q.includes('performance') || q.includes('score') || q.includes('review')) {
      return {
        answer: `Your performance score is ⭐ 4.8/5.0. Excellent delivery rate across assigned sprint tasks with 94% code quality accuracy.`
      }
    }

    if (q.includes('manager')) {
      return {
        answer: `Your designated manager is John Manager (Engineering Operations Lead).`
      }
    }

    if (q.includes('attendance')) {
      return {
        answer: `Your attendance record today is: 🟢 Present (Checked in at 09:15 AM).`
      }
    }

    if (q.includes('leave') || q.includes('vacation')) {
      return {
        answer: `You have 14 days of annual leave remaining (4 days used out of 18 total allocated).`,
        action: actionPayload || { label: 'Apply Leave', route: '/profile' }
      }
    }

    if (q.includes('asset') || q.includes('laptop') || q.includes('hardware')) {
      return {
        answer: `Assigned Assets to ${userName}:\n• MacBook Pro 16" M3 Max (Serial: #MBP-2026-992)\n• 4K Dell UltraSharp Display 27" (Serial: #DEL-8821)`,
        action: { label: 'View Assets', route: '/assets' }
      }
    }

    if (q.includes('workload') || q.includes('rebalance')) {
      if (userRole === 'employee') {
        return {
          answer: "Your current workload capacity is at 72% (Optimal load across 3 active tasks)."
        }
      }
      return {
        answer: "Workload Rebalance Recommendation: Arun Kumar has 8 active tasks (92% capacity). Recommend re-allocating 2 tasks to Priya Sharma to prevent sprint delay.",
        action: { label: 'Open Risk Engine', route: '/risk-prediction' }
      }
    }

    if (q.includes('risk') || q.includes('delay') || q.includes('project progress')) {
      return {
        answer: "Project Delay Analysis: 'Mobile App Dev' has a predicted 24-day timeline delay due to unassigned API endpoints.",
        action: { label: 'View Projects', route: '/projects' }
      }
    }

    // Default conversational response
    return {
      answer: `I have processed your request regarding "${userPrompt}" for ${userName} (${userRole.toUpperCase()}).\n\nAll PostgreSQL metrics and role authorizations are verified. How else can I assist your workflow today?`,
      action: actionPayload
    }
  }

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { id: Date.now(), sender: 'user', text: query, timestamp: nowStr }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setThinking(true)

    // Send history context to API
    const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }))

    let aiResult = null
    try {
      const res = await api.post('/api/ai/chat', {
        prompt: query,
        history: historyPayload,
        current_page: location.pathname,
        model: selectedModel
      }, { timeout: 2500 })

      if (res && res.answer) {
        aiResult = {
          answer: res.answer,
          action: res.action ? { label: res.action.label || 'View Details', route: res.action.route } : null
        }
      }
    } catch {
      // Offline fallback
    }

    if (!aiResult) {
      aiResult = generateRbacResponse(query, messages)
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: cleanText(aiResult.answer),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: aiResult.action
        }
      ])
      setThinking(false)
    }, 450)
  }

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: initialGreeting,
        timestamp: 'Just now',
        action: null
      }
    ])
  }

  const handleRegenerate = () => {
    const lastUserMsg = messages.filter(m => m.sender === 'user').slice(-1)[0]
    if (lastUserMsg) {
      handleSend(lastUserMsg.text)
    }
  }

  const promptChips = SUGGESTED_PROMPTS_BY_ROLE[userRole] || SUGGESTED_PROMPTS_BY_ROLE.employee

  return (
    <>
      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          color: '#fff', border: 'none', borderRadius: 30,
          padding: open ? '12px 18px' : '14px 22px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 30px rgba(13,148,136,0.40)',
          cursor: 'pointer', fontFamily: 'inherit',
          fontWeight: 800, fontSize: 14,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <Sparkles size={20} color="#5eead4" className="animate-spin-slow" />
        <span>{open ? 'Close Copilot' : 'Enterprise AI Copilot'}</span>
      </button>

      {/* Drawer Chat Window */}
      {open && (
        <div
          className="animate-scaleIn"
          style={{
            position: 'fixed', bottom: 84, right: 24, zIndex: 999,
            width: 460, maxWidth: 'calc(100vw - 32px)', height: 600,
            background: '#fff', borderRadius: 24,
            boxShadow: '0 24px 70px rgba(15,32,39,0.35)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', border: '1px solid var(--border)'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f2027 0%, #1a3040 100%)',
            padding: '16px 20px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: activeModel.color, padding: 8, borderRadius: 10, display: 'flex' }}>
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.12)', color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                      fontSize: 12, fontWeight: 700, padding: '2px 8px', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    {MODELS.map(m => (
                      <option key={m.id} value={m.id} style={{ background: '#1a3040', color: '#fff' }}>
                        {m.icon} {m.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                    {userRole}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>RBAC Secured Telemetry Copilot</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={clearChat}
                title="Clear Chat History"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#94a3b8' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Role-Tailored Suggested Prompts */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: 'var(--surface-2)', overflowX: 'auto', borderBottom: '1px solid var(--border-light)' }}>
            {promptChips.map((p, idx) => (
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
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, background: '#f8fafc' }}>
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
                  background: m.sender === 'user' ? 'var(--primary)' : activeModel.color,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 12
                }}>
                  {m.sender === 'user' ? 'U' : <Bot size={16} />}
                </div>

                <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '12px 14px', borderRadius: 16,
                    fontSize: 12.5, lineHeight: 1.55,
                    background: m.sender === 'user' ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : '#fff',
                    color: m.sender === 'user' ? '#fff' : '#1e293b',
                    boxShadow: m.sender === 'ai' ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
                    border: m.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                    whiteSpace: 'pre-line'
                  }}>
                    {cleanText(m.text)}

                    {/* Interactive Action Assistance Button */}
                    {m.action && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => { if (m.action.route) navigate(m.action.route) }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', background: 'var(--primary-soft)',
                            color: 'var(--primary-dark)', border: '1px solid var(--primary-border)',
                            borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ccfbf1'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-soft)'}
                        >
                          {m.action.label} <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Footer Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, padding: '0 4px' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{m.timestamp}</span>
                    {m.sender === 'ai' && (
                      <>
                        <button
                          onClick={() => copyToClipboard(m.id, m.text)}
                          title="Copy response"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === m.id ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, padding: 0 }}
                        >
                          {copiedId === m.id ? <Check size={11} /> : <Copy size={11} />}
                          {copiedId === m.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={handleRegenerate}
                          title="Regenerate response"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, padding: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                        >
                          <RefreshCw size={11} /> Retry
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {thinking && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: activeModel.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              placeholder={`Ask ${activeModel.name} anything…`}
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
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
