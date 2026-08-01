import { useEffect, useRef, useState, useCallback } from 'react'
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react'

/**
 * useIdleTimer — Security Session Timeout Hook
 *
 * Monitors user activity (mouse, keyboard, click, scroll, touch).
 * After `idleMinutes` of no activity:
 *   → Shows warning modal at `warningMinutes` before logout
 *   → Auto-logs out and redirects to /login
 *
 * @param {Function} onLogout   - Callback to trigger logout
 * @param {number}   idleMinutes    - Total idle time before logout (default: 15 min)
 * @param {number}   warningMinutes - Show warning this many minutes before logout (default: 2 min)
 * @param {boolean}  active     - Only run when user is logged in
 */
export function useIdleTimer({ onLogout, idleMinutes = 15, warningMinutes = 2, active = true }) {
  const idleMs    = idleMinutes * 60 * 1000
  const warnMs    = warningMinutes * 60 * 1000
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown]     = useState(warningMinutes * 60)

  const idleTimer    = useRef(null)
  const warnTimer    = useRef(null)
  const countTimer   = useRef(null)
  const lastActivity = useRef(Date.now())

  const clearAllTimers = useCallback(() => {
    clearTimeout(idleTimer.current)
    clearTimeout(warnTimer.current)
    clearInterval(countTimer.current)
  }, [])

  // Called when user shows activity
  const resetTimer = useCallback(() => {
    if (!active) return
    lastActivity.current = Date.now()

    // If warning is currently showing, dismiss it
    setShowWarning(false)
    clearAllTimers()

    // Set warning timer (fires at idleMs - warnMs)
    warnTimer.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(warningMinutes * 60)

      // Start countdown tick
      countTimer.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countTimer.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, idleMs - warnMs)

    // Set auto-logout timer
    idleTimer.current = setTimeout(() => {
      clearAllTimers()
      setShowWarning(false)
      onLogout('timeout')
    }, idleMs)
  }, [active, idleMs, warnMs, warningMinutes, onLogout, clearAllTimers])

  // Attach activity listeners
  useEffect(() => {
    if (!active) return

    const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel']
    let throttleTimer = null

    const handleActivity = () => {
      // Throttle resets to max once per 5s to avoid performance issues
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        throttleTimer = null
        resetTimer()
      }, 5000)
    }

    EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))
    resetTimer() // Start the timer on mount

    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, handleActivity))
      clearAllTimers()
    }
  }, [active, resetTimer, clearAllTimers])

  // "Stay logged in" handler
  const stayLoggedIn = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  return { showWarning, countdown, stayLoggedIn }
}

/**
 * SessionTimeoutModal — Warning Dialog
 * Shown when user has been idle and is about to be auto-logged out.
 */
export function SessionTimeoutModal({ show, countdown, onStay, onLogout }) {
  if (!show) return null

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60
  const pct  = (countdown / 120) * 100   // for ring animation (based on 2-min warning)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,32,39,0.72)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.25s ease both',
      padding: 20
    }}>
      <div
        className="animate-scaleIn"
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: '40px 36px',
          maxWidth: 420, width: '100%',
          textAlign: 'center',
          boxShadow: '0 32px 80px rgba(15,32,39,0.40)',
          border: '1px solid #e1e8ed'
        }}
      >
        {/* Warning Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
          border: '2px solid #fb923c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <ShieldAlert size={34} color="#f97316" />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f2027', margin: '0 0 8px' }}>
          Session Timeout Warning
        </h2>
        <p style={{ fontSize: 14, color: '#4a5e6d', margin: '0 0 28px', lineHeight: 1.6 }}>
          You've been inactive for a while.<br />
          For your security, you'll be automatically logged out in:
        </p>

        {/* Countdown Display */}
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
          background: countdown <= 30 ? '#fff1f2' : '#f0fdfa',
          border: `2px solid ${countdown <= 30 ? '#fca5a5' : '#99f6e4'}`,
          borderRadius: 20, padding: '16px 32px', marginBottom: 28,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} color={countdown <= 30 ? '#dc2626' : '#0d9488'} />
            <span style={{
              fontSize: 36, fontWeight: 900,
              color: countdown <= 30 ? '#dc2626' : '#0f766e',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-1px',
              fontFamily: 'monospace'
            }}>
              {mins > 0 ? `${mins}:${String(secs).padStart(2,'0')}` : `0:${String(secs).padStart(2,'0')}`}
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#8fa3b0', fontWeight: 600, marginTop: 4 }}>
            {countdown <= 30 ? '⚠️ LOGGING OUT SOON' : 'Time remaining'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 12,
              border: '1.5px solid #fca5a5',
              background: '#fff1f2', color: '#dc2626',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff1f2'}
          >
            <LogOut size={16} /> Logout Now
          </button>
          <button
            onClick={onStay}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              color: '#fff',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(13,148,136,0.30)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(13,148,136,0.40)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(13,148,136,0.30)' }}
          >
            <RefreshCw size={16} /> Stay Logged In
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#8fa3b0', marginTop: 20 }}>
          🔒 Security timeout: 15 minutes of inactivity
        </p>
      </div>
    </div>
  )
}
