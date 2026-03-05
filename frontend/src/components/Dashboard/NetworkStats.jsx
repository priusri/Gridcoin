import { useEffect, useState } from 'react'
import { networkStats } from '../../data/mockData'
import { Users, Zap, TrendingUp, Leaf, List, Cpu } from 'lucide-react'

function AnimatedNumber({ target, decimals = 0, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    let start = null
    const duration = 1500

    function step(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(parseFloat((target * ease).toFixed(decimals)))
      if (p < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [target, decimals])

  return (
    <span>
      {prefix}
      {val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

const stats = [
  { label: 'Total Traders',      value: networkStats.totalTraders,   decimals: 0, suffix: '',    icon: Users,     color: '#00f5ff' },
  { label: 'Total kWh Traded',   value: networkStats.totalKWhTraded, decimals: 0, suffix: ' kWh', icon: Zap,       color: '#ffd700' },
  { label: 'Avg Price / kWh',    value: networkStats.avgPrice,       decimals: 2, prefix: '₹',   icon: TrendingUp, color: '#00ff88' },
  { label: 'CO₂ Saved',          value: networkStats.co2Saved,       decimals: 1, suffix: 't',   icon: Leaf,      color: '#00ff88' },
  { label: 'Active Listings',    value: networkStats.activeListings, decimals: 0, suffix: '',    icon: List,      color: '#00f5ff' },
  { label: 'Block Height',       value: networkStats.blockHeight,    decimals: 0, suffix: '',    icon: Cpu,       color: '#ffd700' },
]

export default function NetworkStats() {
  return (
    <div className="card" style={{ padding: '20px', height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          NETWORK STATS
        </h3>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          GridCoin global network
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stats.map(({ label, value, decimals, prefix = '', suffix, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon size={14} color={color} />
              <span style={{
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
              }}>
                {label}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 700,
              color,
              letterSpacing: '0.04em',
            }}>
              <AnimatedNumber
                target={value}
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
              />
            </span>
          </div>
        ))}
      </div>

      {/* Uptime bar */}
      <div style={{ marginTop: 16, padding: '12px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Network Uptime</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: 'var(--accent-green)' }}>
            {networkStats.uptime}%
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${networkStats.uptime}%`,
            background: 'var(--accent-green)',
            borderRadius: 2,
            boxShadow: '0 0 8px var(--accent-green)',
          }} />
        </div>
      </div>
    </div>
  )
}
