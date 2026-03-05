import { ExternalLink } from 'lucide-react'
import Badge from '../shared/Badge'

function timeAgo(date) {
  const secs = Math.floor((Date.now() - date) / 1000)
  if (secs < 60)  return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`
  return `${Math.floor(secs/86400)}d ago`
}

export default function TxRow({ tx }) {
  const total = parseFloat((tx.kWh * tx.pricePerKWh).toFixed(2))

  return (
    <tr>
      {/* Tx Hash */}
      <td>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.68rem',
          color: 'var(--accent-cyan)',
          letterSpacing: '0.04em',
        }}>
          {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
        </span>
      </td>

      {/* Type */}
      <td>
        <Badge variant={tx.type === 'buy' ? 'buy' : 'sell'}>
          {tx.type.toUpperCase()}
        </Badge>
      </td>

      {/* kWh */}
      <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
        {tx.kWh} kWh
      </td>

      {/* Price/kWh */}
      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        ₹{tx.pricePerKWh}
      </td>

      {/* Total */}
      <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
        ₹{total}
      </td>

      {/* Counterparty */}
      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {tx.counterparty}
      </td>

      {/* Time */}
      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {timeAgo(tx.timestamp)}
      </td>

      {/* Status */}
      <td>
        <Badge variant={tx.status}>{tx.status.toUpperCase()}</Badge>
      </td>

      {/* Etherscan */}
      <td>
        {tx.status === 'confirmed' && tx.block && (
          <a
            href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </td>
    </tr>
  )
}
