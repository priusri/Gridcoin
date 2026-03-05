import { NavLink } from 'react-router-dom'
import { BarChart2, Zap, Sun, ArrowLeftRight, Wallet } from 'lucide-react'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: BarChart2     },
  { to: '/marketplace',  label: 'Marketplace',   icon: Zap           },
  { to: '/my-energy',   label: 'My Energy',     icon: Sun           },
  { to: '/transactions', label: 'Transactions',  icon: ArrowLeftRight },
  { to: '/wallet',       label: 'Wallet',        icon: Wallet        },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--bg-panel)',
      borderRight: '1px solid rgba(0,245,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: 'rgba(0,245,255,0.12)',
          borderRadius: 8,
          border: '1px solid rgba(0,245,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          boxShadow: '0 0 15px rgba(0,245,255,0.2)',
        }}>
          ⚡
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 900,
          fontSize: '1.1rem',
          letterSpacing: '0.12em',
          color: 'var(--accent-cyan)',
          textShadow: '0 0 15px rgba(0,245,255,0.5)',
        }}>
          GRIDCOIN
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: 8,
              marginBottom: 4,
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.88rem',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
              background: isActive ? 'rgba(0,245,255,0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 12px rgba(0,245,255,0.12)' : 'none',
              transition: 'all 0.2s ease',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(0,245,255,0.08)',
      }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
        }}>
          v0.1.0 — Testnet
        </span>
      </div>
    </aside>
  )
}
