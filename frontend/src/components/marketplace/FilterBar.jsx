import { Search } from 'lucide-react'

export default function FilterBar({ filters, onChange, resultCount }) {
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid rgba(0,245,255,0.1)',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
        <Search
          size={14}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          className="gc-input"
          placeholder="Search by location..."
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Sort by
        </span>
        <select
          value={filters.sortBy}
          onChange={e => onChange({ ...filters, sortBy: e.target.value })}
          className="gc-input"
          style={{ width: 'auto', paddingRight: 28 }}
        >
          <option value="price">Price (low → high)</option>
          <option value="distance">Distance</option>
          <option value="greenScore">Green Score</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Max price */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 160px' }}>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Max ₹{filters.maxPrice}
        </span>
        <input
          type="range"
          min={3}
          max={8}
          step={0.1}
          value={filters.maxPrice}
          onChange={e => onChange({ ...filters, maxPrice: parseFloat(e.target.value) })}
        />
      </div>

      {/* Green only toggle */}
      <div
        onClick={() => onChange({ ...filters, greenOnly: !filters.greenOnly })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: '6px 12px',
          borderRadius: 8,
          border: `1px solid ${filters.greenOnly ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.08)'}`,
          background: filters.greenOnly ? 'rgba(0,255,136,0.08)' : 'transparent',
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: filters.greenOnly ? 'var(--accent-green)' : 'transparent',
          border: `1.5px solid ${filters.greenOnly ? 'var(--accent-green)' : 'var(--text-muted)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          color: '#000',
        }}>
          {filters.greenOnly && '✓'}
        </div>
        <span style={{ fontSize: '0.73rem', color: filters.greenOnly ? 'var(--accent-green)' : 'var(--text-muted)' }}>
          Green only (95%+)
        </span>
      </div>

      {/* Results count */}
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '0.68rem',
        color: 'var(--accent-cyan)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.06em',
      }}>
        {resultCount} LISTINGS
      </div>
    </div>
  )
}
