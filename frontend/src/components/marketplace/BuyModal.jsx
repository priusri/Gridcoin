import { useState } from 'react'
import { X, Zap, Leaf } from 'lucide-react'
import GlowButton from '../Shared/GlowButton'
import LoadingSpinner from '../Shared/LoadingSpinner'
import { usePayment } from '../../hooks/usePayment'

const GRD_RATE = 5.2 // 1 GRD = ₹5.2
const USD_RATE = 0.012 // Approximate ₹1 = $0.012

export default function BuyModal({ listing, onClose, onConfirm }) {
  const [kWh, setKWh] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { createCheckoutSession, redirectToCheckout, error } = usePayment()

  const total   = parseFloat((kWh * listing.pricePerKWh).toFixed(2))
  const grd     = parseFloat((total / GRD_RATE).toFixed(2))
  const co2     = parseFloat((kWh * 0.82).toFixed(2)) // 0.82 kg saved per kWh solar
  const amountUSD = Math.round(total * USD_RATE * 100) // Convert to USD cents

  async function handleConfirm() {
    setLoading(true)
    try {
      const response = await createCheckoutSession(
        amountUSD,
        'purchase',
        {
          energyListingId: String(listing._id || listing.id),
          sellerId: listing.sellerId || listing.seller,
          kWh: kWh,
          pricePerKWh: listing.pricePerKWh,
          location: listing.location,
          description: `Energy purchase: ${kWh} kWh from ${listing.seller}`,
          paymentMethod: 'credit_card'
        }
      )
      
      if (response && (response.checkoutUrl || response.sessionId)) {
        await redirectToCheckout(response.checkoutUrl || response.sessionId)
      }
    } catch (err) {
      setLoading(false)
      alert('Payment error: ' + (error || err.message))
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
            }}>
              BUY ENERGY
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              from {listing.seller} · {listing.location}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Price summary */}
            <div style={{
              background: 'rgba(0,245,255,0.04)',
              border: '1px solid rgba(0,245,255,0.12)',
              borderRadius: 10,
              padding: '14px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Price per kWh</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                }}>
                  ₹{listing.pricePerKWh}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Available</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                }}>
                  {listing.kWh} kWh
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Green Score</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  color: 'var(--accent-green)',
                  fontWeight: 700,
                }}>
                  {listing.greenScore}%
                </div>
              </div>
            </div>

            {/* kWh input */}
            <label style={{ display: 'block', marginBottom: 20 }}>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                How many kWh? (max {listing.kWh})
              </div>
              <input
                type="number"
                className="gc-input"
                min={0.1}
                max={listing.kWh}
                step={0.1}
                value={kWh}
                onChange={e => setKWh(Math.min(listing.kWh, Math.max(0.1, parseFloat(e.target.value) || 0.1)))}
              />
              <input
                type="range"
                min={0.1}
                max={listing.kWh}
                step={0.1}
                value={kWh}
                onChange={e => setKWh(parseFloat(e.target.value))}
                style={{ marginTop: 10 }}
              />
            </label>

            {/* Calculated totals */}
            <div style={{
              background: 'rgba(0,255,136,0.04)',
              border: '1px solid rgba(0,255,136,0.12)',
              borderRadius: 10,
              padding: '14px',
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {[
                { label: 'Total Cost (₹)',    value: `₹${total}`,  color: 'var(--text-primary)' },
                { label: 'Cost in GRD',       value: `${grd} GRD`, color: 'var(--accent-cyan)'  },
                { label: 'CO₂ Saved',         value: `${co2} kg`,  color: 'var(--accent-green)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color,
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <GlowButton onClick={handleConfirm} disabled={loading} fullWidth>
              {loading ? (
                <><LoadingSpinner size={16} /> PROCESSING...</>
              ) : (
                <><Zap size={14} /> CONFIRM TRANSACTION</>
              )}
            </GlowButton>
      </div>
    </div>
  )
}
