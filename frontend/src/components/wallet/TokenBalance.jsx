import { Zap } from 'lucide-react'
import GlowButton from '../Shared/GlowButton'

export default function TokenBalance({ symbol, value, unit = '', color = '#00f5ff', pending = false, onClaim }) {
  return (
    <div className="card" style={{ padding: '20px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Zap size={17} color={color} />
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          {symbol}
        </span>
        {pending && (
          <span style={{
            fontSize: '0.6rem',
            background: 'rgba(255,215,0,0.12)',
            color: 'var(--accent-yellow)',
            border: '1px solid rgba(252, 216, 13, 0.3)',
            borderRadius: 4,
            padding: '2px 6px',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.06em',
          }}>
            PENDING
          </span>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '2rem',
        fontWeight: 700,
        color,
        letterSpacing: '-0.02em',
        marginBottom: 4,
      }}>
        {value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
          {unit}
        </span>
      </div>

      {pending && onClaim && (
        <div style={{ marginTop: 14 }}>
          <GlowButton variant="green" size="sm" onClick={onClaim}>
            CLAIM REWARDS
          </GlowButton>
        </div>
      )}
    </div>
  )
}
