import { Zap, Sun, Coins, Leaf } from 'lucide-react'
import StatCard from '../components/shared/StatCard'
import EnergyChart from '../components/dashboard/EnergyChart'
import LiveFeed from '../components/dashboard/LiveFeed'
import NetworkStats from '../components/dashboard/NetworkStats'
import ListingCard from '../components/marketplace/ListingCard'
import BuyModal from '../components/marketplace/BuyModal'
import { listings } from '../data/mockData'
import { useState } from 'react'

const cheapest = [...listings].sort((a, b) => a.pricePerKWh - b.pricePerKWh).slice(0, 3)

export default function Dashboard() {
  const [buyTarget, setBuyTarget] = useState(null)

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard icon={Zap}   label="Today's Generation"   value={14.2} unit="kWh" change={12}  color="cyan"   />
        <StatCard icon={Sun}   label="Today's Consumption"  value={8.7}  unit="kWh" change={-3}  color="yellow" />
        <StatCard icon={Coins} label="GRD Earned Today"     value={26.4} unit="GRD" change={18}  color="green"  />
        <StatCard icon={Leaf}  label="CO₂ Saved"            value={6.8}  unit="kg"  change={8}   color="green"  />
      </div>

      {/* Chart + Network stats */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: '65' }}>
          <EnergyChart />
        </div>
        <div style={{ flex: '35' }}>
          <NetworkStats />
        </div>
      </div>

      {/* Live feed + Quick buy */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: '60' }}>
          <LiveFeed />
        </div>
        <div style={{ flex: '40' }}>
          <div className="card" style={{ padding: '20px', height: '100%' }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}>
              QUICK BUY
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Cheapest nearby listings
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cheapest.map(l => (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'rgba(0,245,255,0.04)',
                    border: '1px solid rgba(0,245,255,0.1)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {l.seller}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {l.kWh} kWh · {l.location}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.9rem',
                      color: 'var(--accent-cyan)',
                    }}>
                      ₹{l.pricePerKWh}
                    </span>
                    <button
                      onClick={() => setBuyTarget(l)}
                      className="glow-btn"
                      style={{ padding: '5px 12px', fontSize: '0.65rem' }}
                    >
                      BUY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {buyTarget && (
        <BuyModal
          listing={buyTarget}
          onClose={() => setBuyTarget(null)}
          onConfirm={() => {}}
        />
      )}
    </div>
  )
}
