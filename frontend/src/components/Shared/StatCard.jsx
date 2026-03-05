import { useEffect, useRef, useState } from 'react'

export default function StatCard({ icon: Icon, label, value, unit = '', change, changeLabel, color = 'cyan' }) {
  const [displayed, setDisplayed] = useState(0)
  const targetRef = useRef(parseFloat(value))

  useEffect(() => {
    targetRef.current = parseFloat(value)
    let start = null
    const duration = 1200
    const from = 0

    function step(timestamp) {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayed(parseFloat((from + (targetRef.current - from) * eased).toFixed(1)))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [value])

  const colorMap = {
    cyan:   { text: 'var(--accent-cyan)',   bg: 'rgba(0,245,255,0.08)',   border: 'rgba(0,245,255,0.2)'   },
    green:  { text: 'var(--accent-green)',  bg: 'rgba(0,255,136,0.08)',   border: 'rgba(0,255,136,0.2)'   },
    yellow: { text: 'var(--accent-yellow)', bg: 'rgba(255,215,0,0.08)',   border: 'rgba(255,215,0,0.2)'   },
    red:    { text: 'var(--accent-red)',     bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.2)'   },
  }
  const c = colorMap[color] || colorMap.cyan

  const isPositive = change > 0
  const changeColor = isPositive ? 'var(--accent-green)' : 'var(--accent-red)'
  const changeSign  = isPositive ? '↑' : '↓'

  return (
    <div className="card" style={{
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1,
      animation: 'fadeSlideUp 0.5s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
        }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: c.bg,
            border: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={18} color={c.text} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 700,
          color: c.text,
          letterSpacing: '-0.02em',
          animation: 'countUp 0.4s ease',
        }}>
          {displayed.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
        </span>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}>
          {unit}
        </span>
      </div>

      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: changeColor,
          }}>
            {changeSign} {Math.abs(change)}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {changeLabel || 'vs yesterday'}
          </span>
        </div>
      )}
    </div>
  )
}
