// ── Marketplace listings ──────────────────────────────────────────
export const listings = [
  {
    id: 1,
    seller: 'Arjun Sharma',
    walletAddress: '0xA1b2C3d4E5f6A7B8C9d0E1F2A3b4C5d6',
    location: 'Bengaluru, KA',
    kWh: 12.5,
    pricePerKWh: 4.2,
    rating: 4.9,
    reviews: 142,
    distance: 0.4,
    greenScore: 98,
    panelAge: 2,
    totalSold: 4820,
    avatar: 'AS',
    avatarColor: '#00f5ff',
  },
  {
    id: 2,
    seller: 'Priya Menon',
    walletAddress: '0xB2c3D4e5F6a7B8C9d0E1f2A3B4C5D6e7',
    location: 'Pune, MH',
    kWh: 8.0,
    pricePerKWh: 4.5,
    rating: 4.7,
    reviews: 89,
    distance: 1.2,
    greenScore: 95,
    panelAge: 3,
    totalSold: 2310,
    avatar: 'PM',
    avatarColor: '#00ff88',
  },
  {
    id: 3,
    seller: 'Ravi Krishnan',
    walletAddress: '0xC3d4E5f6A7b8C9D0e1F2a3B4c5D6e7F8',
    location: 'Chennai, TN',
    kWh: 15.0,
    pricePerKWh: 4.8,
    rating: 4.8,
    reviews: 203,
    distance: 2.1,
    greenScore: 92,
    panelAge: 1,
    totalSold: 7640,
    avatar: 'RK',
    avatarColor: '#ffd700',
  },
  {
    id: 4,
    seller: 'Sneha Patel',
    walletAddress: '0xD4e5F6a7B8c9D0E1f2A3b4C5d6E7f8A9',
    location: 'Ahmedabad, GJ',
    kWh: 6.5,
    pricePerKWh: 4.3,
    rating: 5.0,
    reviews: 317,
    distance: 0.8,
    greenScore: 99,
    panelAge: 1,
    totalSold: 9120,
    avatar: 'SP',
    avatarColor: '#00f5ff',
  },
  {
    id: 5,
    seller: 'Vikram Nair',
    walletAddress: '0xE5f6A7b8C9d0E1F2a3B4c5D6e7F8a9B0',
    location: 'Hyderabad, TS',
    kWh: 10.2,
    pricePerKWh: 5.1,
    rating: 4.6,
    reviews: 55,
    distance: 3.4,
    greenScore: 88,
    panelAge: 4,
    totalSold: 1890,
    avatar: 'VN',
    avatarColor: '#00ff88',
  },
  {
    id: 6,
    seller: 'Kavya Reddy',
    walletAddress: '0xF6a7B8c9D0e1F2A3b4C5d6E7f8A9b0C1',
    location: 'Mumbai, MH',
    kWh: 3.8,
    pricePerKWh: 5.8,
    rating: 4.5,
    reviews: 28,
    distance: 4.7,
    greenScore: 85,
    panelAge: 5,
    totalSold: 890,
    avatar: 'KR',
    avatarColor: '#ffd700',
  },
  {
    id: 7,
    seller: 'Deepak Joshi',
    walletAddress: '0xA7b8C9d0E1f2A3B4c5D6e7F8a9B0c1D2',
    location: 'Jaipur, RJ',
    kWh: 7.3,
    pricePerKWh: 4.6,
    rating: 4.8,
    reviews: 176,
    distance: 1.9,
    greenScore: 94,
    panelAge: 2,
    totalSold: 5430,
    avatar: 'DJ',
    avatarColor: '#00f5ff',
  },
  {
    id: 8,
    seller: 'Ananya Chopra',
    walletAddress: '0xB8c9D0e1F2a3B4C5d6E7f8A9b0C1d2E3',
    location: 'Delhi, DL',
    kWh: 9.6,
    pricePerKWh: 4.9,
    rating: 4.7,
    reviews: 94,
    distance: 5.0,
    greenScore: 91,
    panelAge: 3,
    totalSold: 3270,
    avatar: 'AC',
    avatarColor: '#00ff88',
  },
]

// ── Transactions ────────────────────────────────────────────────────
export const transactions = [
  { id: 1,  txHash: '0xabc123def456abc123def456abc123de', type: 'buy',  kWh: 5.0,  pricePerKWh: 4.2,  counterparty: 'Arjun Sharma',  timestamp: new Date(Date.now() - 2*60*1000),     status: 'confirmed', block: 7284920 },
  { id: 2,  txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', type: 'sell', kWh: 3.5,  pricePerKWh: 4.5,  counterparty: 'Priya Menon',   timestamp: new Date(Date.now() - 18*60*1000),    status: 'confirmed', block: 7284898 },
  { id: 3,  txHash: '0x9f8e7d6c5b4a3210fedcba9876543210', type: 'buy',  kWh: 8.2,  pricePerKWh: 4.8,  counterparty: 'Ravi Krishnan', timestamp: new Date(Date.now() - 45*60*1000),    status: 'confirmed', block: 7284872 },
  { id: 4,  txHash: '0xdeadbeef1234567890abcdef12345678', type: 'sell', kWh: 2.1,  pricePerKWh: 4.3,  counterparty: 'Sneha Patel',   timestamp: new Date(Date.now() - 1.5*3600*1000), status: 'pending',   block: null      },
  { id: 5,  txHash: '0x0011223344556677889900aabbccddee', type: 'buy',  kWh: 10.0, pricePerKWh: 5.1,  counterparty: 'Vikram Nair',   timestamp: new Date(Date.now() - 2*3600*1000),   status: 'confirmed', block: 7284801 },
  { id: 6,  txHash: '0xffeeddccbbaa99887766554433221100', type: 'sell', kWh: 4.7,  pricePerKWh: 5.8,  counterparty: 'Kavya Reddy',   timestamp: new Date(Date.now() - 3*3600*1000),   status: 'failed',    block: null      },
  { id: 7,  txHash: '0x1122334455667788990011aabbccdd00', type: 'buy',  kWh: 6.0,  pricePerKWh: 4.6,  counterparty: 'Deepak Joshi',  timestamp: new Date(Date.now() - 4*3600*1000),   status: 'confirmed', block: 7284734 },
  { id: 8,  txHash: '0x2233445566778899001122bbccdd0011', type: 'buy',  kWh: 3.3,  pricePerKWh: 4.9,  counterparty: 'Ananya Chopra', timestamp: new Date(Date.now() - 5*3600*1000),   status: 'confirmed', block: 7284712 },
  { id: 9,  txHash: '0x3344556677889900112233ccdd001122', type: 'sell', kWh: 7.8,  pricePerKWh: 4.2,  counterparty: 'Arjun Sharma',  timestamp: new Date(Date.now() - 6*3600*1000),   status: 'confirmed', block: 7284690 },
  { id: 10, txHash: '0x4455667788990011223344dd00112233', type: 'buy',  kWh: 5.5,  pricePerKWh: 4.5,  counterparty: 'Priya Menon',   timestamp: new Date(Date.now() - 8*3600*1000),   status: 'confirmed', block: 7284651 },
  { id: 11, txHash: '0x5566778899001122334455ee11223344', type: 'sell', kWh: 11.0, pricePerKWh: 4.8,  counterparty: 'Ravi Krishnan', timestamp: new Date(Date.now() - 10*3600*1000),  status: 'pending',   block: null      },
  { id: 12, txHash: '0x6677889900112233445566ff22334455', type: 'buy',  kWh: 2.5,  pricePerKWh: 4.3,  counterparty: 'Sneha Patel',   timestamp: new Date(Date.now() - 12*3600*1000),  status: 'confirmed', block: 7284580 },
  { id: 13, txHash: '0x778899001122334455667700aa334455', type: 'sell', kWh: 9.1,  pricePerKWh: 5.1,  counterparty: 'Vikram Nair',   timestamp: new Date(Date.now() - 14*3600*1000),  status: 'confirmed', block: 7284542 },
  { id: 14, txHash: '0x8899001122334455667788bbcc445566', type: 'buy',  kWh: 4.0,  pricePerKWh: 5.8,  counterparty: 'Kavya Reddy',   timestamp: new Date(Date.now() - 16*3600*1000),  status: 'failed',    block: null      },
  { id: 15, txHash: '0x9900112233445566778899ccdd556677', type: 'sell', kWh: 6.5,  pricePerKWh: 4.6,  counterparty: 'Deepak Joshi',  timestamp: new Date(Date.now() - 18*3600*1000),  status: 'confirmed', block: 7284498 },
  { id: 16, txHash: '0xaa0011223344556677889900ee667788', type: 'buy',  kWh: 3.0,  pricePerKWh: 4.9,  counterparty: 'Ananya Chopra', timestamp: new Date(Date.now() - 20*3600*1000),  status: 'confirmed', block: 7284461 },
  { id: 17, txHash: '0xbb1122334455667788990011ff778899', type: 'sell', kWh: 8.8,  pricePerKWh: 4.2,  counterparty: 'Arjun Sharma',  timestamp: new Date(Date.now() - 22*3600*1000),  status: 'confirmed', block: 7284432 },
  { id: 18, txHash: '0xcc2233445566778899001122aa889900', type: 'buy',  kWh: 1.5,  pricePerKWh: 4.5,  counterparty: 'Priya Menon',   timestamp: new Date(Date.now() - 24*3600*1000),  status: 'confirmed', block: 7284401 },
  { id: 19, txHash: '0xdd3344556677889900112233bb990011', type: 'sell', kWh: 13.0, pricePerKWh: 4.8,  counterparty: 'Ravi Krishnan', timestamp: new Date(Date.now() - 26*3600*1000),  status: 'confirmed', block: 7284374 },
  { id: 20, txHash: '0xee4455667788990011223344cc001122', type: 'buy',  kWh: 7.0,  pricePerKWh: 4.3,  counterparty: 'Sneha Patel',   timestamp: new Date(Date.now() - 28*3600*1000),  status: 'confirmed', block: 7284340 },
]

// ── 24 hours of chart data ──────────────────────────────────────────
// Solar curve: peak around 13:00, near-zero at night
export const chartData = Array.from({ length: 24 }, (_, i) => {
  const solarCurve = Math.max(0, Math.sin((i - 6) * (Math.PI / 12)))
  const generated = i >= 6 && i <= 18
    ? parseFloat((solarCurve * 2.8 + Math.random() * 0.3).toFixed(2))
    : parseFloat((Math.random() * 0.05).toFixed(2))
  const consumed = parseFloat((0.3 + Math.random() * 0.8 + (i >= 18 ? 0.5 : 0)).toFixed(2))
  const traded   = parseFloat((Math.min(generated * 0.4, Math.random() * 0.9)).toFixed(2))
  return {
    hour: `${i.toString().padStart(2,'0')}:00`,
    generated,
    consumed,
    traded,
  }
})

// ── 7-day personal generation (bar chart) ──────────────────────────
export const weeklyGeneration = [
  { day: 'Mon', kWh: 12.4 },
  { day: 'Tue', kWh: 15.1 },
  { day: 'Wed', kWh: 9.8  },
  { day: 'Thu', kWh: 13.7 },
  { day: 'Fri', kWh: 16.2 },
  { day: 'Sat', kWh: 14.5 },
  { day: 'Sun', kWh: 14.2 },
]

// ── 30-day GRD earnings (wallet line chart) ─────────────────────────
export const grdEarnings = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  grd: parseFloat((18 + Math.random() * 15 + i * 0.4).toFixed(2)),
}))

// ── Network stats ───────────────────────────────────────────────────
export const networkStats = {
  totalTraders:    12847,
  totalKWhTraded:  284920,
  avgPrice:        4.92,
  co2Saved:        142.3,
  activeListings:  347,
  blockHeight:     7284920,
  tps:             14,
  uptime:          99.97,
}

// ── My active listings ──────────────────────────────────────────────
export const myListings = [
  { id: 'L1', kWh: 5.5,  pricePerKWh: 4.4,  duration: '6hr',  expiresIn: '3h 22m', status: 'active' },
  { id: 'L2', kWh: 2.0,  pricePerKWh: 4.6,  duration: '1hr',  expiresIn: '12m',    status: 'active' },
]

// ── App wallet ──────────────────────────────────────────────────────
export const walletData = {
  address:        '0x7f4A9c2E8B1D5f3A6e0C4d7B9a2F1E8c5D3b2c',
  shortAddress:   '0x7f4A...3B2c',
  balance:        1284.50,
  ethBalance:     0.42,
  pendingRewards: 24.8,
  network:        'Sepolia Testnet',
}

// ── Live feed (seed data — LiveFeed component adds more over time) ──
export const seedFeed = [
  { id: 1, type: 'buy',  kWh: 5.0,  seller: 'Arjun S.',    price: 4.2,  time: '2s ago'   },
  { id: 2, type: 'sell', kWh: 3.5,  seller: 'You',          price: 4.5,  time: '18s ago'  },
  { id: 3, type: 'buy',  kWh: 8.2,  seller: 'Ravi K.',      price: 4.8,  time: '45s ago'  },
  { id: 4, type: 'buy',  kWh: 6.0,  seller: 'Deepak J.',    price: 4.6,  time: '1m ago'   },
  { id: 5, type: 'sell', kWh: 4.7,  seller: 'Priya M.',     price: 4.5,  time: '2m ago'   },
]
