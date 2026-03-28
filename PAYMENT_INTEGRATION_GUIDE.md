# Payment Gateway Integration Guide - Gridcoin

## Overview

This guide will help you set up the complete payment gateway system with Razorpay integration for the Gridcoin energy trading platform. The system supports:

- ✅ One-time transaction payments
- ✅ Recurring subscriptions
- ✅ Invoice generation
- ✅ Webhook handling
- ✅ Hybrid payment (fiat + crypto)

## Prerequisites

- Node.js (v14+)
- MongoDB
- Redis (optional)
- Razorpay account
- Web3.js for blockchain integration

## Step 1: Razorpay Setup

### 1.1 Create Razorpay Account

1. Go to [Razorpay](https://razorpay.com)
2. Sign up and complete your account verification
3. Navigate to **Settings → API Keys**
4. Copy your:
   - Key ID (Public Key)
   - Key Secret (Secret Key)

### 1.2 Get Webhook Secret

1. Go to **Settings → Webhooks**
2. Add endpoint: `https://yourdomain.com/api/payments/webhook/razorpay`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `subscription.activated`
   - `subscription.paused`
   - `subscription.cancelled`
   - `invoice.paid`
4. Copy the **Webhook Secret** token

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create `.env` file in the `backend` directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Database
MONGODB_URI=mongodb://localhost:27017/gridcoin

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### 2.3 Integrate Payment Routes

Update your `server.js`:

```javascript
const paymentRoutes = require('./routes/payment.routes');

// Add this to your Express app
app.use('/api/payments', paymentRoutes);

// Add this as webhook route (before auth middleware)
app.post('/api/payments/webhook/razorpay', paymentController.handleWebhook);
```

### 2.4 Connect to Database

Ensure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB Atlas, update MONGODB_URI in .env
```

### 2.5 Start Backend Server

```bash
npm run dev
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

Create `.env` file in the `frontend` directory:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3.3 Add Payment Components to App

#### In your main App.jsx or routing file:

```javascript
import PaymentGateway from './components/Payment/PaymentGateway';
import SubscriptionPlans from './components/Payment/SubscriptionPlans';
import PaymentHistory from './components/Payment/PaymentHistory';
import Invoices from './components/Payment/Invoices';

// Add routes
<Route path="/payment" element={<PaymentGateway />} />
<Route path="/subscription" element={<SubscriptionPlans />} />
<Route path="/payment-history" element={<PaymentHistory />} />
<Route path="/invoices" element={<Invoices />} />
```

### 3.4 Add Razorpay Script

In your `public/index.html`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Or load dynamically (already included in PaymentGateway.jsx)

### 3.5 Start Frontend

```bash
npm start
```

## Step 4: Testing the Integration

### 4.1 Create Test Order

```bash
curl -X POST http://localhost:5000/api/payments/transaction/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "type": "transaction",
    "energyListingId": "LISTING_ID",
    "paymentMethod": "credit_card",
    "description": "Test Payment"
  }'
```

### 4.2 Test Payment Verification

Use these test card details:

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (MM/YY)
- **CVV**: Any 3 digits

### 4.3 Razorpay Test Cards

| Card Type | Card Number | Status |
|-----------|------------|--------|
| Visa | 4111 1111 1111 1111 | Success |
| Mastercard | 5555 5555 5555 4444 | Success |
| Amex | 3782 822463 10005 | Success |

## Step 5: Smart Contract Integration (Blockchain)

For hybrid payments (recording on blockchain):

### 5.1 Create Payment Record Smart Contract

```solidity
// contracts/PaymentRecord.sol
pragma solidity ^0.8.0;

contract PaymentRecord {
    struct Payment {
        address user;
        uint256 amount;
        uint256 timestamp;
        string orderId;
        bool completed;
    }

    mapping(string => Payment) public payments;

    event PaymentRecorded(
        address indexed user,
        uint256 amount,
        string orderId
    );

    function recordPayment(
        address user,
        uint256 amount,
        string memory orderId
    ) public {
        payments[orderId] = Payment(
            user,
            amount,
            block.timestamp,
            orderId,
            true
        );
        emit PaymentRecorded(user, amount, orderId);
    }
}
```

### 5.2 Update Payment Service

After successful Razorpay payment, record on blockchain:

```javascript
// In confirmPayment method
async recordPaymentOnBlockchain(payment) {
    const contract = await this.getContract();
    const tx = await contract.recordPayment(
        payment.user,
        payment.amount,
        payment.razorpayOrderId
    );
    return tx.hash;
}
```

## Step 6: Webhook Configuration

### 6.1 Local Testing with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 5000

# Get public URL (e.g., https://xxxx-xx-xxx-xxx-xx.ngrok.io)

# Update webhook URL in Razorpay:
# https://xxxx-xx-xxx-xxx-xx.ngrok.io/api/payments/webhook/razorpay
```

### 6.2 Production Webhook Setup

1. Deploy your backend to a server
2. Use your domain: `https://yourdomain.com/api/payments/webhook/razorpay`
3. Update webhook URL in Razorpay dashboard

## Step 7: Database Models

The following MongoDB collections will be created:

- **payments** - Individual payment transactions
- **subscriptions** - Recurring subscription records
- **invoices** - Generated invoices for payments
- **users** - User accounts (existing)
- **energylistings** - Energy listings (existing)

## API Endpoints

### Payment Endpoints

```
POST   /api/payments/transaction/create-order    - Create payment order
POST   /api/payments/verify                       - Verify payment
GET    /api/payments/history                      - Get payment history
GET    /api/payments/:paymentId                   - Get payment details
POST   /api/payments/:paymentId/refund            - Refund payment
GET    /api/payments/stats/overview               - Payment statistics
```

### Subscription Endpoints

```
POST   /api/payments/subscription/create          - Create subscription
GET    /api/payments/subscription/active          - Get active subscription
POST   /api/payments/subscription/cancel          - Cancel subscription
```

### Invoice Endpoints

```
GET    /api/payments/invoices/list                - Get invoices
GET    /api/payments/invoices/:invoiceId/download - Download invoice PDF
```

### Webhook

```
POST   /api/payments/webhook/razorpay            - Razorpay webhook handler
```

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly in server.js
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate all payment inputs
6. **Signature Verification**: Always verify Razorpay signatures

## Example: Implementing Payment in Energy Trading

```javascript
// In your energy trading component
import PaymentGateway from '../components/Payment/PaymentGateway';

function BuyEnergy({ energyListing }) {
  const handlePaymentSuccess = async (paymentData) => {
    // Record the transaction in your system
    console.log('Payment successful:', paymentData);
    
    // Update energy listing with transaction
    // Create transaction record
    // Update user wallet
  };

  return (
    <PaymentGateway
      amount={energyListing.price}
      type="transaction"
      energyListingId={energyListing._id}
      onSuccess={handlePaymentSuccess}
      onError={(error) => alert(error)}
    />
  );
}
```

## Troubleshooting

### Payment Creation Fails
- Verify Razorpay API keys are correct
- Check MongoDB connection
- Ensure JWT token is valid

### Webhook Not Triggering
- Verify webhook URL is correct and publicly accessible
- Check webhook secret matches in environment
- Review Razorpay webhook logs in dashboard

### Payment Verification Fails
- Verify signature calculation is correct
- Check if payment status is "captured"
- Review error logs

## Support

For issues or questions:
1. Check Razorpay documentation: https://razorpay.com/docs
2. Review webhook logs in Razorpay dashboard
3. Check browser console for frontend errors
4. Check server logs for backend errors

## Next Steps

1. ✅ Set up Razorpay account
2. ✅ Configure environment variables
3. ✅ Start backend and frontend
4. ✅ Test with test cards
5. ✅ Deploy to production
6. ✅ Switch to live API keys
7. ✅ Test with real payments

For more information on running the entire project, see the main README.md
