import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Copy } from 'lucide-react'
import { useWallet } from '../../hooks/useWallet'

const pageTitles = {
  '/dashboard':    'Dashboard',
  '/marketplace':  'Energy Marketplace',
  '/my-energy':   'My Energy',
  '/transactions': 'Transactions',
  '/wallet':       'Wallet',
}

export default function TopBar() {
  const [time, setTime] = useState(new Date())
  const [copied, setCopied] = useState(false)
  const location = useLocation()
  const { connected, wallet } = useWallet()

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  function copyAddress() {
    navigator.clipboard.writeText(wallet.address).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const title = pageTitles[location.pathname] || 'GridCoin'

  return (
    <header style={{
      height: 60,
      background: 'var(--bg-panel)',
      borderBottom: '1px solid rgba(0,245,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 240,
      right: 0,
      zIndex: 99,
    }}>
      {/* Left: Page title */}
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: '0.9rem',
        letterSpacing: '0.1em',
        color: 'var(--text-primary)',
      }}>
        {title}
      </h1>

      {/* Center: Live clock */}
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: '0.85rem',
        letterSpacing: '0.12em',
        color: 'var(--accent-cyan)',
        textShadow: '0 0 10px rgba(0,245,255,0.4)',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        {time.toLocaleTimeString('en-GB')}
      </div>

      {/* Right: Status + wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Network badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-dot" />
          <span className="badge testnet" style={{ fontSize: '0.58rem' }}>
            SEPOLIA TESTNET
          </span>
        </div>

        {/* Wallet address */}
        {connected && (
          <>
            <button
              onClick={copyAddress}
              style={{
                background: 'rgba(0,245,255,0.06)',
                border: '1px solid rgba(0,245,255,0.15)',
                borderRadius: 6,
                padding: '5px 12px',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ COPIED' : wallet.shortAddress}
              <Copy size={10} />
            </button>

            {/* GRD balance */}
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.72rem',
              color: 'var(--accent-green)',
              background: 'rgba(0,255,136,0.06)',
              border: '1px solid rgba(0,255,136,0.15)',
              borderRadius: 6,
              padding: '5px 10px',
            }}>
              {wallet.balance.toLocaleString('en-IN')} GRD
            </div>
          </>
        )}

        {/* Bell */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(0,245,255,0.06)',
          border: '1px solid rgba(0,245,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell size={15} color="var(--text-muted)" />
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-red)',
            boxShadow: '0 0 4px var(--accent-red)',
          }} />
        </div>
      </div>
    </header>
  )
}
