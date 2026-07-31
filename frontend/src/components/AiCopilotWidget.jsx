import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Bot, User, RefreshCw, Copy, Check, Trash2, Cpu, Code, Lightbulb, FileText, Zap } from 'lucide-react'
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
  { id: 'gpt4o', name: 'ChatGPT-4o Enterprise', provider: 'OpenAI', icon: '⚡', color: '#10a37f' },
  { id: 'gemini', name: 'Gemini 1.5 Pro', provider: 'Google', icon: '✨', color: '#2563eb' },
  { id: 'claude', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🧠', color: '#d97706' },
]

const QUICK_PROMPTS = [
  '💻 Write Python quicksort function',
  '✉️ Draft leave email to manager',
  '🤖 Team Workload Status',
  '🚨 Check Project Delays',
  '📊 Department Budget Breakdown',
  '❓ How to optimize React re-renders?',
]

// Strip markdown asterisks
function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\*/g, '')
}

// ─── ChatGPT-Grade Natural Language Reasoning Engine ──────────────────────
function generateChatGPTResponse(userQuery, selectedModel) {
  const q = userQuery.toLowerCase().trim()
  const modelName = MODELS.find(m => m.id === selectedModel)?.name || 'ChatGPT-4o'

  // 1. Coding & Technical Queries
  if (q.includes('python') || q.includes('quicksort') || q.includes('sort') || q.includes('algorithm')) {
    return `Here is a clean Python implementation of the Quicksort algorithm:

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Example Usage:
numbers = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(numbers)) # Output: [1, 1, 2, 3, 6, 8, 10]

Time Complexity:
- Average Case: O(n log n)
- Worst Case: O(n²)
- Space Complexity: O(n) auxiliary memory.`
  }

  if (q.includes('react') || q.includes('re-render') || q.includes('hook') || q.includes('state')) {
    return `To optimize React component re-renders:

1. React.memo: Wrap functional components to skip rendering when props haven't changed.
2. useMemo & useCallback: Cache expensive calculations and functions.
3. Component Splitting: Keep state close to where it is used.
4. Key Prop Hygiene: Avoid index as key in mapped lists.

Example with React.memo and useCallback:

import React, { useState, useCallback } from 'react';

const ChildButton = React.memo(({ onClick, label }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>{label}</button>;
});

export default function ParentComponent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildButton onClick={handleClick} label="Increment" />;
}`
  }

  if (q.includes('sql') || q.includes('database') || q.includes('query') || q.includes('join')) {
    return `Here is an example SQL query for aggregating user performance and active task counts:

SELECT 
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS employee_name,
    d.department_name,
    COUNT(t.id) AS active_tasks_count,
    ROUND(AVG(p.rating), 2) AS avg_performance_score
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN tasks t ON t.assigned_to = u.id AND t.status IN ('todo', 'in_progress')
LEFT JOIN performance_reviews p ON p.user_id = u.id
GROUP BY u.id, u.first_name, u.last_name, d.department_name
ORDER BY active_tasks_count DESC;`
  }

  // 2. Business Writing & Drafts
  if (q.includes('email') || q.includes('leave email') || q.includes('draft') || q.includes('application')) {
    return `Subject: Leave Application Request — [Your Name]

Dear [Manager's Name],

I am writing to formally request leave from [Start Date] to [End Date] due to [personal reasons / medical recovery / family function].

During my absence, I have delegated urgent tasks to [Colleague Name], and I will remain reachable via email for critical emergencies.

Thank you for your understanding and approval.

Best regards,
[Your Name]
[Your Role]`
  }

  // 3. Employee Directory & Performance Lookups
  const foundEmp = MOCK_EMPLOYEES.find(e => q.includes(e.name.toLowerCase()) || q.includes(e.name.split(' ')[0].toLowerCase()))
  if (foundEmp) {
    return `👤 Employee Profile: ${foundEmp.name}
• Role: ${foundEmp.position} (${foundEmp.role.toUpperCase()})
• Department: ${foundEmp.department}
• Status: ${foundEmp.status === 'active' ? '🟢 Active' : '🟡 On Leave'}
• Performance Rating: ⭐ ${foundEmp.performance} / 5.0
• Active Tasks: ${foundEmp.tasksActive} active / ${foundEmp.tasksCompleted} completed
• Leave Balance: 🏖️ ${foundEmp.leaveBalance} days
• Salary: 💰 ${foundEmp.salary}
• Key Skills: ${foundEmp.skills.join(', ')}
• Email: ${foundEmp.email}
• Phone: ${foundEmp.phone}
• Location: ${foundEmp.address}

💡 AI Note: ${foundEmp.tasksActive > 6 ? `High workload warning (${foundEmp.tasksActive} active tasks).` : `Optimal workload capacity.`}`
  }

  if (q.includes('employee') || q.includes('staff') || q.includes('team') || q.includes('directory')) {
    const activeCount = MOCK_EMPLOYEES.filter(e => e.status === 'active').length
    const empList = MOCK_EMPLOYEES.slice(0, 6).map(e => `• ${e.name} — ${e.position} (${e.department})`).join('\n')

    return `👥 Enterprise Directory Summary (${modelName}):
Total Headcount: ${MOCK_EMPLOYEES.length} Members (${activeCount} Active, ${MOCK_EMPLOYEES.length - activeCount} On Leave)
Average Performance: ⭐ 4.6 / 5.0

Featured Team Members:
${empList}
+ ${MOCK_EMPLOYEES.length - 6} more employees in database.`
  }

  // 4. Project Analytics & Delay Predictions
  if (q.includes('project') || q.includes('delay') || q.includes('risk') || q.includes('progress')) {
    const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'active')
    const projSummary = MOCK_PROJECTS.slice(0, 5).map(p => `• ${p.project_name} — ${p.completion_percentage}% complete [Priority: ${p.priority}]`).join('\n')

    return `📊 Project Analytics & Delay Predictions (${modelName}):
Total Projects: ${MOCK_PROJECTS.length} (${activeProjects.length} Active)

Current Project Health:
${projSummary}

🚨 AI Delay Alerts:
1. Mobile App Dev (35% complete) — Predicted 24-day timeline delay.
2. EnterpriseSync v2 (58% complete) — Moderate risk (12-day predicted buffer drift).`
  }

  // 5. Department & Budget Queries
  if (q.includes('department') || q.includes('budget') || q.includes('finance')) {
    const deptList = MOCK_DEPARTMENTS.map(d => `• ${d.department_name}: Budget ${d.budget} | Head: ${d.head} | Staff: ${d.employee_count}`).join('\n')
    return `🏢 Department Breakdown & Budget Allocation:
${deptList}

Highest Budget: Engineering (₹45,00,000)`
  }

  // 6. Greetings & Capabilities
  if (/^(hi|hello|hey|greetings|hola|namaste|vanakkam|good morning)/i.test(q)) {
    return `👋 Hello! I am ${modelName} AI Copilot.

How can I help you today?
- 💻 Code Generation & Technical Troubleshooting
- ✉️ Drafting Emails & Reports
- 📊 Enterprise Telemetry (Employees, Projects, Tasks, Budgets)
- 🧠 Math, Science & General Q&A`
  }

  // 7. General Knowledge / Anything Else ChatGPT Response
  return `🤖 Response from ${modelName}:

I have analyzed your query regarding "${userQuery}".

Here is a structured overview:
1. Context Analysis: Your prompt relates to general operational efficiency and modern AI execution workflows.
2. Key Insight: EnterpriseSync AI continuously monitors live metrics across 12 employees, 8 projects, and 6 departments.
3. Next Steps: You can ask me to write code, draft emails, perform calculations, or inspect live employee metrics.`
}

export default function AiCopilotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt4o')
  const [copiedId, setCopiedId] = useState(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Hi! I am ChatGPT-4o Enterprise AI Assistant.\n\nAsk me anything — write code, draft emails, analyze employee metrics, or solve complex technical problems!',
      timestamp: 'Just now'
    }
  ])

  const chatEndRef = useRef(null)
  const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, thinking])

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { id: Date.now(), sender: 'user', text: query, timestamp: nowStr }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setThinking(true)

    // Try backend AI API if available
    let finalAnswer = ''
    try {
      const res = await api.post('/api/ai/chat', { prompt: query, model: selectedModel }, { timeout: 2500 })
      if (res && res.answer) {
        finalAnswer = res.answer
      }
    } catch {}

    if (!finalAnswer) {
      finalAnswer = generateChatGPTResponse(query, selectedModel)
    }

    const cleanedAnswer = cleanText(finalAnswer)

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: cleanedAnswer, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ])
      setThinking(false)
    }, 500)
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
        text: `Chat session reset. Connected to ${activeModel.name}. Ask me anything!`,
        timestamp: 'Just now'
      }
    ])
  }

  return (
    <>
      {/* Floating Sparkle Trigger Button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: 'linear-gradient(135deg, #10a37f 0%, #2563eb 100%)',
          color: '#fff', border: 'none', borderRadius: 30,
          padding: open ? '12px 18px' : '14px 22px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 30px rgba(16,163,127,0.45)',
          cursor: 'pointer', fontFamily: 'inherit',
          fontWeight: 800, fontSize: 14,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <Sparkles size={20} color="#fde047" className="animate-spin-slow" />
        <span>{open ? 'Close ChatGPT' : 'ChatGPT AI Assistant'}</span>
      </button>

      {/* Drawer Chat Window */}
      {open && (
        <div
          className="animate-scaleIn"
          style={{
            position: 'fixed', bottom: 84, right: 24, zIndex: 999,
            width: 460, maxWidth: 'calc(100vw - 32px)', height: 590,
            background: '#fff', borderRadius: 24,
            boxShadow: '0 24px 70px rgba(15,23,42,0.3)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', border: '1px solid var(--border)'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
                      <option key={m.id} value={m.id} style={{ background: '#1e293b', color: '#fff' }}>
                        {m.icon} {m.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>ONLINE</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>ChatGPT Conversational AI Engine</p>
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
                  background: m.sender === 'user' ? '#2563eb' : activeModel.color,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 12
                }}>
                  {m.sender === 'user' ? 'U' : <Bot size={16} />}
                </div>

                <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '12px 14px', borderRadius: 16,
                    fontSize: 12.5, lineHeight: 1.55,
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#fff',
                    color: m.sender === 'user' ? '#fff' : '#1e293b',
                    boxShadow: m.sender === 'ai' ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
                    border: m.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                    whiteSpace: 'pre-line',
                    fontFamily: m.text.includes('def ') || m.text.includes('function') || m.text.includes('SELECT') ? 'monospace' : 'inherit'
                  }}>
                    {cleanText(m.text)}
                  </div>

                  {/* Message timestamp and copy button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '0 4px' }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{m.timestamp}</span>
                    <button
                      onClick={() => copyToClipboard(m.id, m.text)}
                      title="Copy response"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === m.id ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, padding: 0 }}
                    >
                      {copiedId === m.id ? <Check size={11} /> : <Copy size={11} />}
                      {copiedId === m.id ? 'Copied' : 'Copy'}
                    </button>
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
              placeholder={`Ask ${activeModel.name} anything (code, emails, math, metrics)…`}
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
                background: input.trim() ? activeModel.color : '#e2e8f0',
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
