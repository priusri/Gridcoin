import { useState } from 'react'
import { Sun, Zap, Battery, Edit2, X, CheckCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import StatCard from '../components/shared/StatCard'
import GlowButton from '../components/shared/GlowButton'
import Badge from '../components/shared/Badge'
import { weeklyGeneration, myListings as seedListings } from '../data/mockData'

function ToastNotification({ message }) {
  return (
    <div className="toast">
      <CheckCircle size={18} />
      {message}
    </div>
  )
}

export default function MyEnergy() {
  const [listings, setListings] = useState(seedListings)
  const [form, setForm] = useState({ kWh: '', price: '4.5', autoAdjust: false, duration: '6hr' })
  const [toast, setToast] = useState(null)

  const surplus = 5.5

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleList(e) {
    e.preventDefault()
    const kwh = parseFloat(form.kWh)
    if (!kwh || kwh <= 0 || kwh > surplus) return
    const newListing = {
      id: `L${Date.now()}`,
      kWh: kwh,
      pricePerKWh: parseFloat(form.price),
      duration: form.duration,
      expiresIn: form.duration === '1hr' ? '59m' : form.duration === '6hr' ? '5h 59m' : '23h 59m',
      status: 'active',
    }
    setListings(l => [newListing, ...l])
    setForm({ kWh: '', price: '4.5', autoAdjust: false, duration: '6hr' })
    showToast('Energy listed successfully!')
  }

  function cancelListing(id) {
    setListings(l => l.filter(x => x.id !== id))
    showToast('Listing cancelled.')
  }

  const estimated = parseFloat((parseFloat(form.kWh || 0) * parseFloat(form.price)).toFixed(2))

  const barTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: '0.78rem',
      }}>
        <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--text-primary)' }}>{payload[0].value} kWh</div>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat row */}
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard icon={Sun}     label="Panel Capacity"     value={5}    unit="kW"  color="yellow" />
        <StatCard icon={Zap}     label="Today Generated"    value={14.2} unit="kWh" color="cyan"   />
        <StatCard icon={Battery} label="Surplus Available"  value={surplus} unit="kWh" color="green"  />
      </div>

      {/* Bar chart + Active listings */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* 7-day bar chart */}
        <div className="card" style={{ flex: '55', padding: '20px' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            LAST 7 DAYS GENERATION
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Daily kWh from your solar panels
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyGeneration} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00f5ff" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-heading)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={barTooltip} cursor={{ fill: 'rgba(0,245,255,0.04)' }} />
              <Bar
                dataKey="kWh"
                fill="url(#barGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active listings */}
        <div className="card" style={{ flex: '45', padding: '20px', overflow: 'hidden' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: 16,
          }}>
            MY ACTIVE LISTINGS
          </h3>
          {listings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 20 }}>
              No active listings.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {listings.map(l => (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'rgba(0,245,255,0.04)',
                    border: '1px solid rgba(0,245,255,0.12)',
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.82rem',
                      color: 'var(--accent-cyan)',
                      marginBottom: 3,
                    }}>
                      {l.kWh} kWh @ ₹{l.pricePerKWh}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Expires in {l.expiresIn} · {l.duration}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge variant="confirmed">LIVE</Badge>
                    <button
                      onClick={() => cancelListing(l.id)}
                      style={{
                        background: 'rgba(255,68,68,0.1)',
                        border: '1px solid rgba(255,68,68,0.2)',
                        borderRadius: 6,
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--accent-red)',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create listing form */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          color: 'var(--text-primary)',
          marginBottom: 20,
        }}>
          CREATE NEW LISTING
        </h3>

        <form onSubmit={handleList}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
            {/* kWh */}
            <div>
              <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                kWh to list (surplus: {surplus} kWh)
              </label>
              <input
                className="gc-input"
                type="number"
                min={0.1}
                max={surplus}
                step={0.1}
                placeholder="e.g. 3.5"
                value={form.kWh}
                onChange={e => setForm(f => ({ ...f, kWh: e.target.value }))}
                required
              />
            </div>

            {/* Price */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <label style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  Price per kWh (₹)
                </label>
                <span style={{
                  fontSize: '0.6rem',
                  color: 'var(--accent-green)',
                  background: 'rgba(0,255,136,0.1)',
                  border: '1px solid rgba(0,255,136,0.2)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontFamily: 'var(--font-heading)',
                }}>
                  ML: ₹{form.autoAdjust ? '4.6' : form.price}
                </span>
              </div>
              <input
                className="gc-input"
                type="number"
                min={3}
                max={8}
                step={0.1}
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                disabled={form.autoAdjust}
              />
            </div>

            {/* Auto-adjust */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                onClick={() => setForm(f => ({ ...f, autoAdjust: !f.autoAdjust, price: !f.autoAdjust ? '4.6' : f.price }))}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: form.autoAdjust ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: form.autoAdjust ? 21 : 3,
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Auto-adjust price (ML optimized)
              </span>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Duration
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['1hr', '6hr', '24hr'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, duration: d }))}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      border: `1px solid ${form.duration === d ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      background: form.duration === d ? 'rgba(0,245,255,0.1)' : 'transparent',
                      color: form.duration === d ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.kWh > 0 && (
            <div style={{
              marginTop: 20,
              padding: '14px',
              background: 'var(--gradient-energy)',
              border: '1px solid rgba(0,245,255,0.15)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Estimated Earnings</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  color: 'var(--accent-green)',
                  fontWeight: 700,
                }}>
                  ₹{estimated}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>In GRD</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                }}>
                  {(estimated / 5.2).toFixed(2)} GRD
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Duration</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                }}>
                  {form.duration}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <GlowButton type="submit" variant="green" size="lg">
              <Zap size={15} />
              LIST ENERGY
            </GlowButton>
          </div>
        </form>
      </div>

      {toast && <ToastNotification message={toast} />}
    </div>
  )
}
