import { useState, useMemo } from 'react'
import { Zap } from 'lucide-react'
import ListingCard from '../components/marketplace/ListingCard'
import FilterBar from '../components/marketplace/FilterBar'
import BuyModal from '../components/marketplace/BuyModal'
import { listings as allListings, networkStats } from '../data/mockData'

const DEFAULT_FILTERS = {
  search:    '',
  sortBy:    'price',
  maxPrice:  8,
  greenOnly: false,
}

export default function Marketplace() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [buyTarget, setBuyTarget] = useState(null)
  const [buyHistory, setBuyHistory] = useState([])

  const filtered = useMemo(() => {
    let list = allListings.filter(l => {
      if (filters.search && !l.location.toLowerCase().includes(filters.search.toLowerCase())
          && !l.seller.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (l.pricePerKWh > filters.maxPrice) return false
      if (filters.greenOnly && l.greenScore < 95) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (filters.sortBy === 'price')      return a.pricePerKWh - b.pricePerKWh
      if (filters.sortBy === 'distance')   return a.distance   - b.distance
      if (filters.sortBy === 'greenScore') return b.greenScore - a.greenScore
      if (filters.sortBy === 'rating')     return b.rating     - a.rating
      return 0
    })

    return list
  }, [filters])

  function handleConfirm(tx) {
    setBuyHistory(h => [tx, ...h])
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            ENERGY MARKETPLACE
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Buy solar energy directly from peers on the blockchain
          </p>
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.9rem',
          color: 'var(--accent-cyan)',
          background: 'rgba(0,245,255,0.08)',
          border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: 10,
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Zap size={16} />
          {networkStats.activeListings} Active Listings
        </div>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 20,
      }}>
        {filtered.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onBuy={setBuyTarget}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}>
            No listings match your filters.
          </div>
        )}
      </div>

      {buyTarget && (
        <BuyModal
          listing={buyTarget}
          onClose={() => setBuyTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
