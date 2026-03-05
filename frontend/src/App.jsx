import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './hooks/useWallet'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import MyEnergy from './pages/MyEnergy'
import Transactions from './pages/Transactions'
import Wallet from './pages/Wallet'

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="my-energy" element={<MyEnergy />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="wallet" element={<Wallet />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}
