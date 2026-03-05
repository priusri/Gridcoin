import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { chartData } from '../../data/mockData'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(0,245,255,0.25)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.8rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '0.7rem',
        color: 'var(--accent-cyan)',
        marginBottom: 8,
        letterSpacing: '0.06em',
      }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.name} style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 4,
        }}>
          <span style={{ color: entry.color, textTransform: 'capitalize' }}>{entry.name}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {entry.value.toFixed(2)} kWh
          </span>
        </div>
      ))}
    </div>
  )
}

export default function EnergyChart() {
  return (
    <div className="card" style={{ padding: '20px 16px 10px', height: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingLeft: 8,
        paddingRight: 8,
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            24H ENERGY OVERVIEW
          </h3>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            Generation vs Consumption vs Traded
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Generated', color: '#00f5ff' },
            { label: 'Consumed',  color: '#ffd700' },
            { label: 'Traded',    color: '#00ff88' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24,
                height: 3,
                background: color,
                borderRadius: 2,
                boxShadow: `0 0 6px ${color}`,
              }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 4, right: 12, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00f5ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradYellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ffd700" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="hour"
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-heading)' }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-heading)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="generated"
            stroke="#00f5ff"
            strokeWidth={2}
            fill="url(#gradCyan)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="consumed"
            stroke="#ffd700"
            strokeWidth={2}
            fill="url(#gradYellow)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="traded"
            stroke="#00ff88"
            strokeWidth={1.5}
            fill="url(#gradGreen)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
