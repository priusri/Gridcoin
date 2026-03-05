import { useState } from 'react'
import { Copy, Send, QrCode, CheckCircle } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import ConnectButton from '../components/wallet/ConnectButton'
import TokenBalance from '../components/wallet/TokenBalance'
import GlowButton from '../components/shared/GlowButton'
import { useWallet } from '../hooks/useWallet'
import { walletData, grdEarnings } from '../data/mockData'

function ToastNotification({ message }) {
  return (
    <div className="toast">
      <CheckCircle size={18} />
      {message}
    </div>
  )
}

export default function Wallet() {
  const { connected, wallet } = useWallet()
  const [copied, setCopied] = useState(false)
  const [sendForm, setSendForm] = useState({ address: '', amount: '' })
  const [sendDone, setSendDone] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function copyAddress() {
    navigator.clipboard.writeText(walletData.address).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleSend(e) {
    e.preventDefault()
    setSendDone(true)
    showToast(`Sent ${sendForm.amount} GRD to ${sendForm.address.slice(0,10)}...`)
    setSendForm({ address: '', amount: '' })
    setTimeout(() => setSendDone(false), 2000)
  }

  function handleClaim() {
    setClaimed(true)
    showToast('24.8 GRD rewards claimed!')
  }

  const lineTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: '0.78rem',
      }}>
        <span style={{ color: 'var(--accent-cyan)' }}>Day {payload[0].payload.day}: </span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{payload[0].value} GRD</span>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Wallet card */}
      <div style={{
        borderRadius: 16,
        padding: '28px 32px',
        background: 'var(--bg-card)',
        border: '1px solid rgba(0,245,255,0.25)',
        boxShadow: '0 0 30px rgba(0,245,255,0.1)',
        backgroundImage: 'linear-gradient(135deg, rgba(0,245,255,0.04) 0%, rgba(0,255,136,0.04) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {connected ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,255,136,0.1)',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: 6,
                padding: '4px 10px',
              }}>
                <span className="live-dot" />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', color: 'var(--accent-green)', letterSpacing: '0.08em' }}>
                  CONNECTED
                </span>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,68,68,0.1)',
                border: '1px solid rgba(255,68,68,0.25)',
                borderRadius: 6,
                padding: '4px 10px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                color: 'var(--accent-red)',
                letterSpacing: '0.08em',
              }}>
                NOT CONNECTED
              </div>
            )}
            <span className="badge testnet">SEPOLIA TESTNET</span>
          </div>

          {connected && (
            <button
              onClick={copyAddress}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 0,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.06em',
              }}>
                {walletData.address.slice(0, 20)}...{walletData.address.slice(-6)}
              </span>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                background: 'rgba(0,245,255,0.1)',
                border: '1px solid rgba(0,245,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {copied ? <CheckCircle size={14} color="var(--accent-green)" /> : <Copy size={14} color="var(--accent-cyan)" />}
              </div>
            </button>
          )}
        </div>
        <ConnectButton />
      </div>

      {/* Token balances */}
      <div style={{ display: 'flex', gap: 16 }}>
        <TokenBalance
          symbol="GRD Token"
          value={walletData.balance}
          unit="GRD"
          color="var(--accent-cyan)"
        />
        <TokenBalance
          symbol="ETH Balance"
          value={walletData.ethBalance}
          unit="ETH"
          color="var(--accent-yellow)"
        />
        <TokenBalance
          symbol="Pending Rewards"
          value={claimed ? 0 : walletData.pendingRewards}
          unit="GRD"
          color="var(--accent-green)"
          pending={!claimed}
          onClaim={handleClaim}
        />
      </div>

      {/* GRD earnings chart */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          GRD EARNINGS — LAST 30 DAYS
        </h3>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Daily GridCoin token rewards
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={grdEarnings} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-heading)' }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={lineTooltip} />
            <Line
              type="monotone"
              dataKey="grd"
              stroke="#00f5ff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#00f5ff', stroke: '#0d1117', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Send + Receive */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Send */}
        <div className="card" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: 20,
          }}>
            SEND GRD
          </h3>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Recipient Address
              </label>
              <input
                className="gc-input"
                placeholder="0x..."
                value={sendForm.address}
                onChange={e => setSendForm(f => ({ ...f, address: e.target.value }))}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Amount (GRD)
              </label>
              <input
                className="gc-input"
                type="number"
                placeholder="0.00"
                min={0.01}
                step={0.01}
                value={sendForm.amount}
                onChange={e => setSendForm(f => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
            <GlowButton type="submit" fullWidth disabled={!connected || sendDone}>
              <Send size={14} />
              {sendDone ? 'SENT!' : 'SEND GRD'}
            </GlowButton>
          </form>
        </div>

        {/* Receive */}
        <div className="card" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            alignSelf: 'flex-start',
          }}>
            RECEIVE GRD
          </h3>

          {/* QR placeholder */}
          <div style={{
            width: 140,
            height: 140,
            background: 'rgba(0,245,255,0.06)',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <QrCode size={56} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
              QR CODE
            </span>
          </div>

          <button
            onClick={copyAddress}
            style={{
              background: 'rgba(0,245,255,0.06)',
              border: '1px solid rgba(0,245,255,0.15)',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.65rem',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {copied ? '✓ COPIED' : walletData.shortAddress}
            <Copy size={12} />
          </button>
        </div>
      </div>

      {toast && <ToastNotification message={toast} />}
    </div>
  )
}
