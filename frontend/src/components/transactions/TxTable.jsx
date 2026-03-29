import { useState } from 'react'
import TxRow from './TxRow'
import GlowButton from '../Shared/GlowButton'
import { Download } from 'lucide-react'

const TABS = ['all', 'buy', 'sell', 'pending', 'failed']
const PAGE_SIZE = 10

export default function TxTable({ transactions }) {
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = transactions.filter(tx => {
    if (tab === 'all')     return true
    if (tab === 'pending') return tx.status === 'pending'
    if (tab === 'failed')  return tx.status === 'failed'
    return tx.type === tab
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function exportCSV() {
    const header = 'txHash,type,kWh,pricePerKWh,total,counterparty,status,block\n'
    const rows = transactions.map(tx =>
      [tx.txHash, tx.type, tx.kWh, tx.pricePerKWh,
       (tx.kWh * tx.pricePerKWh).toFixed(2), tx.counterparty, tx.status, tx.block || ''].join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gridcoin-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Tab bar + Export */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1) }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '7px 14px',
                borderRadius: 6,
                border: tab === t
                  ? '1px solid rgba(0,245,255,0.3)'
                  : '1px solid transparent',
                background: tab === t ? 'rgba(0,245,255,0.1)' : 'transparent',
                color: tab === t ? 'var(--accent-cyan)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <GlowButton size="sm" onClick={exportCSV}>
          <Download size={13} />
          EXPORT CSV
        </GlowButton>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="gc-table" style={{ minWidth: 760 }}>
          <thead>
            <tr>
              {['TX HASH', 'TYPE', 'AMOUNT', 'PRICE/KWH', 'TOTAL', 'COUNTERPARTY', 'TIME', 'STATUS', ''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(tx => <TxRow key={tx.id} tx={tx} />)}
            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '16px',
          borderTop: '1px solid rgba(0,245,255,0.06)',
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="glow-btn"
            style={{ padding: '5px 14px', fontSize: '0.68rem' }}
          >
            ← PREV
          </button>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
          }}>
            PAGE {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="glow-btn"
            style={{ padding: '5px 14px', fontSize: '0.68rem' }}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}
