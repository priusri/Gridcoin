import { useMemo } from 'react'
import { transactions } from '../data/mockData'
import TxTable from '../components/transactions/TxTable'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function Transactions() {
  const summary = useMemo(() => {
    const bought = transactions.filter(t => t.type === 'buy' && t.status === 'confirmed')
    const sold   = transactions.filter(t => t.type === 'sell' && t.status === 'confirmed')

    const totalBoughtKWh = bought.reduce((s, t) => s + t.kWh, 0)
    const totalBoughtINR = bought.reduce((s, t) => s + t.kWh * t.pricePerKWh, 0)
    const totalSoldKWh   = sold.reduce((s, t) => s + t.kWh, 0)
    const totalSoldINR   = sold.reduce((s, t) => s + t.kWh * t.pricePerKWh, 0)
    const net            = totalSoldINR - totalBoughtINR

    return { totalBoughtKWh, totalBoughtINR, totalSoldKWh, totalSoldINR, net }
  }, [])

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          {
            label:  'Total Bought',
            value1: `${summary.totalBoughtKWh.toFixed(1)} kWh`,
            value2: `₹${summary.totalBoughtINR.toFixed(0)}`,
            color:  'var(--accent-cyan)',
            icon:   TrendingDown,
          },
          {
            label:  'Total Sold',
            value1: `${summary.totalSoldKWh.toFixed(1)} kWh`,
            value2: `₹${summary.totalSoldINR.toFixed(0)}`,
            color:  'var(--accent-green)',
            icon:   TrendingUp,
          },
          {
            label:  'Net Balance',
            value1: `₹${Math.abs(summary.net).toFixed(0)}`,
            value2: summary.net >= 0 ? 'Profit' : 'Loss',
            color:  summary.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
            icon:   Activity,
          },
        ].map(({ label, value1, value2, color, icon: Icon }) => (
          <div
            key={label}
            className="card"
            style={{ flex: 1, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `${color}1a`,
              border: `1px solid ${color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)', fontSize: '0.62rem' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color, letterSpacing: '-0.01em' }}>
                {value1}
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {value2}
              </div>
            </div>
          </div>
        ))}
      </div>

      <TxTable transactions={transactions} />
    </div>
  )
}
