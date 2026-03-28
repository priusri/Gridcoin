# ⚡ GridCoin — Decentralized Peer-to-Peer Energy Trading Platform

GridCoin is a blockchain-powered marketplace where solar panel owners can sell 
their surplus electricity directly to neighbors — cutting out utility company 
middlemen and enabling fair, transparent energy trading.

---

## 🚀 Live Demo
> Coming soon — Deployed on Vercel + Sepolia Testnet

---

##  The Problem

Solar panel owners in India generate surplus energy every day.
Utility companies (BESCOM, TNEB) buy it at ₹2/kWh and resell it at ₹8/kWh.
Neighbors pay full price despite a willing seller next door.
There is no direct way to trade energy between individuals.

**GridCoin fixes this** — enabling direct peer-to-peer energy trading at fair prices.

---

##  The Solution

- Solar owners list their surplus energy on the GridCoin marketplace
- Nearby buyers purchase directly at a mutually agreed price
- Smart contracts handle payment, verification, and trust automatically
- ML model predicts optimal prices and detects meter fraud
- Every transaction is recorded on the Ethereum blockchain

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js + Vite | UI framework |
| React Router v6 | Page navigation |
| Recharts | Energy charts and graphs |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Web3.js | Blockchain wallet integration |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Off-chain data storage |
| JWT | Authentication |
| Socket.io | Real-time energy feed |

### Blockchain
| Technology | Purpose |
|---|---|
| Solidity | Smart contract language |
| Hardhat | Development and testing |
| Ethereum (Sepolia) | Testnet deployment |
| IPFS | Decentralized storage |
| MetaMask | Wallet connection |

### ML / AI
| Technology | Purpose |
|---|---|
| Python + Flask | ML microservice API |
| Scikit-learn | Price prediction model |
| Pandas + NumPy | Data processing |
| NREL / Kaggle datasets | Training data |

### Payment Processing
| Technology | Purpose |
|---|---|
| Stripe | Payment gateway |
| Stripe Checkout | Hosted payment page |
| Stripe Billing Portal | Subscription management |
| Stripe Webhooks | Real-time payment events |

---

## 📁 Folder Structure
```
gridcoin/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── data/
├── backend/           # Node.js + Express API
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── blockchain/        # Solidity smart contracts
│   ├── contracts/
│   ├── scripts/
│   └── test/
├── ml-api/            # Python ML microservice
├── iot-simulator/     # Smart meter simulator
└── docs/              # Documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- MetaMask browser extension
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/gridcoin.git
cd gridcoin
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT secret in .env
npm run dev
```

### 4. Setup ML API
```bash
cd ml-api
pip install -r requirements.txt
python app.py
```

### 5. Setup Smart Contracts
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🔑 Environment Variables

Create a `.env` file in the backend folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
PRIVATE_KEY=your_wallet_private_key

# Stripe Payment Configuration
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_key_here

# Frontend URL for payment success/cancel redirects
FRONTEND_URL=http://localhost:3000
```

### Payment Setup

GridCoin uses **Stripe** for secure payment processing:

1. **One-time Payments** — Buy energy directly
2. **Recurring Billing** — Monthly subscription plans
3. **Invoicing** — Automatic invoice generation
4. **Refunds** — Handle payment disputes
5. **Billing Portal** — Customer self-service management

**Quick Start**:
```bash
# 1. Get Stripe API keys from https://dashboard.stripe.com
# 2. Add keys to backend/.env
# 3. Add public key to frontend/.env
# 4. Run npm install in backend (stripe package)
# 5. Test with card: 4242 4242 4242 4242
```

Full guide: [Stripe Quick Start](docs/STRIPE_QUICK_START.md) | [Complete Guide](docs/STRIPE_INTEGRATION_GUIDE.md)

---

## 📊 Datasets Used

| Dataset | Source | Purpose |
|---|---|---|
| Solar Power Generation (India) | Kaggle | Solar output prediction |
| NREL NSRDB | nrel.gov | Solar irradiance data |
| UCI Household Power Consumption | UCI ML Repo | Demand forecasting |
| Smart Meters London | Kaggle | Consumption patterns |
| POSOCO India Grid Data | posoco.in | Grid pricing reference |

---

## 🧠 ML Models

- **Price Prediction** — Predicts optimal listing price based on weather, time, demand
- **Demand Forecasting** — Predicts neighborhood energy demand for next 6 hours
- **Anomaly Detection** — Detects fraudulent meter readings and theft patterns
- **Solar Forecasting** — Predicts how much a panel will generate tomorrow

---

## 📜 Smart Contracts

| Contract | Purpose |
|---|---|
| GridToken.sol | ERC-20 GRD token |
| EnergyMarket.sol | P2P trading marketplace |
| MeterNFT.sol | Smart meter as NFT |
| Reputation.sol | Seller/buyer trust scores |

---

## 🌍 Real World Impact

- 500 million small farmers and homeowners exploited by utility middlemen
- GridCoin can reduce household electricity bills by up to 40%
- Every kWh traded locally saves approx 0.82 kg of CO2
- Targets India's 10 million+ rooftop solar installations by 2030

---



---





---

*"Electricity is the only product where the person who makes it has no 
power over who buys it — GridCoin changes that."*