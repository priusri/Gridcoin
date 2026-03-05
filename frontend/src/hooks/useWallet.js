import { createContext, useContext, useState, createElement } from 'react'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const wallet = {
    address: '0x7f4A9c2E8B1D5f3A6e0C4d7B9a2F1E8c5D3b2c',
    shortAddress: '0x7f4A...3B2c',
    balance: 1284.50,
    ethBalance: 0.42,
    pendingRewards: 24.8,
    network: 'Sepolia Testnet',
    chainId: 11155111,
  }

  async function connect() {
    setConnecting(true)
    await new Promise(r => setTimeout(r, 1200))
    setConnected(true)
    setConnecting(false)
  }

  function disconnect() {
    setConnected(false)
  }

  return createElement(
    WalletContext.Provider,
    { value: { connected, connecting, connect, disconnect, wallet } },
    children
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
