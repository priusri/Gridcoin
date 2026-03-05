import { useEffect, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import { seedFeed } from '../../data/mockData'

const names = ['Rahul V.', 'Meena S.', 'Arjun K.', 'Pooja N.', 'Dev R.', 'Aisha M.', 'Kiran P.']

function randomEntry(id) {
  const type = Math.random() > 0.5 ? 'buy' : 'sell'
  return {
    id,
    type,
    kWh: parseFloat((Math.random() * 10 + 1).toFixed(1)),
    seller: names[Math.floor(Math.random() * names.length)],
    price: parseFloat((4.2 + Math.random() * 1.6).toFixed(2)),
    time: 'just now',
  }
}

export default function LiveFeed() {
  const [feed, setFeed] = useState(seedFeed)
  const nextId = useRef(100)

  useEffect(() => {
    const id = setInterval(() => {
      setFeed(prev => [randomEntry(nextId.current++), ...prev.slice(0, 4)])
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="card" style={{ padding: '20px', height: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
      }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          color: 'var(--text-primary)',
        }}>
          LIVE FEED
        </h3>
        <span className="live-dot" />
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          Auto-updating
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {feed.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 8,
              background: idx === 0
                ? item.type === 'buy'
                  ? 'rgba(0,245,255,0.06)'
                  : 'rgba(0,255,136,0.06)'
                : 'rgba(255,255,255,0.02)',
              border: `1px solid ${idx === 0
                ? item.type === 'buy'
                  ? 'rgba(0,245,255,0.2)'
                  : 'rgba(0,255,136,0.2)'
                : 'rgba(255,255,255,0.04)'}`,
              animation: idx === 0 ? 'slideInTop 0.35s ease' : undefined,
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: item.type === 'buy'
                  ? 'rgba(0,245,255,0.12)'
                  : 'rgba(0,255,136,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap
                  size={14}
                  color={item.type === 'buy' ? 'var(--accent-cyan)' : 'var(--accent-green)'}
                />
              </div>
              <div>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  <span style={{
                    color: item.type === 'buy' ? 'var(--accent-cyan)' : 'var(--accent-green)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.68rem',
                    marginRight: 6,
                  }}>
                    {item.type.toUpperCase()}
                  </span>
                  {item.kWh} kWh
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {item.seller}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
              }}>
                ₹{item.price}/kWh
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {item.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
