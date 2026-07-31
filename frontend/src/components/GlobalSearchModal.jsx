import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, FolderKanban, CheckSquare, Building2, X, Command, ArrowRight, CornerDownLeft } from 'lucide-react'
import { MOCK_EMPLOYEES } from '../mockData'

const SYSTEM_PAGES = [
  { id: 'p1', type: 'page', title: 'Dashboard', desc: 'Overview & metrics', path: '/', icon: Building2 },
  { id: 'p2', type: 'page', title: 'Manage Employees', desc: 'Employee directory & workload', path: '/employees', icon: User },
  { id: 'p3', type: 'page', title: 'Enterprise Projects', desc: 'Project timelines & status', path: '/projects', icon: FolderKanban },
  { id: 'p4', type: 'page', title: 'Tasks Management', desc: 'Assigned tasks & deadlines', path: '/tasks', icon: CheckSquare },
  { id: 'p5', type: 'page', title: 'AI Risk Engine', desc: 'Predictive delay & burnout analytics', path: '/risk-prediction', icon: Command },
]

const MOCK_SEARCH_PROJECTS = [
  { id: 'proj-1', type: 'project', title: 'Website Redesign', desc: 'Frontend redesign in React', path: '/projects' },
  { id: 'proj-2', type: 'project', title: 'Mobile App Dev', desc: 'iOS & Android cross platform app', path: '/projects' },
  { id: 'proj-3', type: 'project', title: 'Database Migration', desc: 'Migrate PostgreSQL schema', path: '/projects' },
  { id: 'proj-4', type: 'project', title: 'AI Analytics Module', desc: 'ML models for risk prediction', path: '/projects' },
]

const MOCK_SEARCH_TASKS = [
  { id: 'task-1', type: 'task', title: 'Complete UI Design Review', desc: 'High priority task', path: '/tasks' },
  { id: 'task-2', type: 'task', title: 'Update REST API Documentation', desc: 'Medium priority task', path: '/tasks' },
  { id: 'task-3', type: 'task', title: 'Fix Authentication Bug #342', desc: 'Security patch', path: '/tasks' },
]

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Build complete searchable index
  const allResults = [
    ...SYSTEM_PAGES,
    ...MOCK_EMPLOYEES.map(e => ({
      id: `emp-${e.id}`,
      type: 'employee',
      title: e.name,
      desc: `${e.position} · ${e.department}`,
      path: '/employees',
      icon: User
    })),
    ...MOCK_SEARCH_PROJECTS.map(p => ({ ...p, icon: FolderKanban })),
    ...MOCK_SEARCH_TASKS.map(t => ({ ...t, icon: CheckSquare })),
  ]

  const filtered = allResults.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab
    const q = query.toLowerCase().trim()
    if (!q) return matchesTab
    return matchesTab && (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    )
  })

  // Keyboard navigation (Arrow keys + Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1))
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault()
        onClose()
        navigate(filtered[selectedIndex].path)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selectedIndex, navigate, onClose])

  if (!isOpen) return null

  return (
    <div className="es-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="es-modal animate-scaleIn" style={{ maxWidth: 620, borderRadius: 20, overflow: 'hidden' }}>

        {/* Input Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: '1px solid var(--border-light)',
          background: 'var(--surface)'
        }}>
          <Search size={20} color="var(--primary)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            placeholder="Search employees, projects, tasks, or jump to page…"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
              outline: 'none', fontFamily: 'inherit'
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', cursor: 'pointer'
            }}
          >
            ESC
          </button>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex', gap: 6, padding: '10px 20px',
          background: 'var(--surface-2)', borderBottom: '1px solid var(--border-light)'
        }}>
          {['all', 'page', 'employee', 'project', 'task'].map(t => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setSelectedIndex(0) }}
              style={{
                padding: '4px 12px', borderRadius: 20, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', textTransform: 'capitalize',
                background: activeTab === t ? 'var(--primary)' : 'transparent',
                color: activeTab === t ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {t === 'all' ? 'All Results' : `${t}s`}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '10px 12px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              <Search size={32} opacity={0.3} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: 14 }}>No matching results found for "{query}"</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const IconComp = item.icon || Search
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => { onClose(); navigate(item.path) }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                    background: isSelected ? 'rgba(37,99,235,0.08)' : 'transparent',
                    border: isSelected ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: isSelected ? 'var(--primary)' : 'var(--surface-2)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}>
                      <IconComp size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 6,
                      background: item.type === 'employee' ? '#dbeafe' : item.type === 'project' ? '#dcfce7' : '#f3f4f6',
                      color: item.type === 'employee' ? '#1e40af' : item.type === 'project' ? '#15803d' : '#475569'
                    }}>
                      {item.type}
                    </span>
                    {isSelected && <CornerDownLeft size={14} color="var(--primary)" />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div style={{
          padding: '10px 20px', background: 'var(--surface-2)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, color: 'var(--text-muted)', fontWeight: 600
        }}>
          <span>Navigate with <kbd style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1' }}>↑</kbd> <kbd style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1' }}>↓</kbd></span>
          <span>Open with <kbd style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1' }}>↵ Enter</kbd></span>
        </div>

      </div>
    </div>
  )
}
