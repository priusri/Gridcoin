import { useWallet } from '../../hooks/useWallet'
import GlowButton from '../shared/GlowButton'
import LoadingSpinner from '../shared/LoadingSpinner'
import { Wallet } from 'lucide-react'

export default function ConnectButton() {
  const { connected, connecting, connect, disconnect, wallet } = useWallet()

  if (connected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(0,255,136,0.08)',
          border: '1px solid rgba(0,255,136,0.25)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span className="live-dot" />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            color: 'var(--accent-green)',
          }}>
            CONNECTED
          </span>
        </div>
        <GlowButton variant="yellow" size="sm" onClick={disconnect}>
          DISCONNECT
        </GlowButton>
      </div>
    )
  }

  return (
    <GlowButton onClick={connect} disabled={connecting}>
      {connecting ? (
        <><LoadingSpinner size={16} /> CONNECTING...</>
      ) : (
        <><Wallet size={15} /> CONNECT METAMASK</>
      )}
    </GlowButton>
  )
}
