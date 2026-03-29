import { MapPin, Star, Zap } from 'lucide-react'
import GlowButton from '../Shared/GlowButton'

function GreenRing({ score }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle
        cx={22} cy={22} r={r}
        fill="none"
        stroke={score >= 95 ? '#00ff88' : score >= 88 ? '#ffd700' : '#ff4444'}
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text
        x={22} y={22}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e2e8f0"
        fontSize={9}
        fontFamily="var(--font-heading)"
        fontWeight={700}
      >
        {score}%
      </text>
    </svg>
  )
}

export default function ListingCard({ listing, onBuy }) {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'default',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: `${listing.avatarColor}22`,
          border: `1px solid ${listing.avatarColor}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.8rem',
          color: listing.avatarColor,
        }}>
          {listing.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            {listing.seller}
          </div>
          <div style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.04em',
            marginTop: 2,
          }}>
            {listing.walletAddress.slice(0, 10)}...{listing.walletAddress.slice(-4)}
          </div>
        </div>
        <div style={{
          background: 'rgba(0,245,255,0.08)',
          border: '1px solid rgba(0,245,255,0.15)',
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: '0.68rem',
          color: 'var(--accent-cyan)',
          fontFamily: 'var(--font-heading)',
        }}>
          {listing.distance} km
        </div>
      </div>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <MapPin size={12} color="var(--text-muted)" />
        {listing.location}
      </div>

      {/* kWh battery bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Available</span>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.73rem',
            color: 'var(--accent-cyan)',
          }}>
            {listing.kWh} kWh
          </span>
        </div>
        <div style={{
          height: 6,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(listing.kWh / 15) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00f5ff, #00ff88)',
            borderRadius: 3,
            boxShadow: '0 0 6px rgba(0,245,255,0.4)',
          }} />
        </div>
      </div>

      {/* Price */}
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--accent-cyan)',
        letterSpacing: '-0.02em',
      }}>
        ₹{listing.pricePerKWh}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>
          / kWh
        </span>
      </div>

      {/* Bottom row: green score + rating + buy button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <GreenRing score={listing.greenScore} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  fill={i < Math.round(listing.rating) ? '#ffd700' : 'transparent'}
                  color={i < Math.round(listing.rating) ? '#ffd700' : 'var(--text-muted)'}
                />
              ))}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 3 }}>
                {listing.rating}
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {listing.reviews} reviews
            </div>
          </div>
        </div>

        <GlowButton onClick={() => onBuy(listing)} size="sm">
          <Zap size={12} />
          BUY
        </GlowButton>
      </div>
    </div>
  )
}
