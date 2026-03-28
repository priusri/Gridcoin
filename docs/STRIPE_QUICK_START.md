# Stripe Quick Start Guide

Get the Gridcoin payment system with Stripe running in 5 minutes.

## Prerequisites

- Node.js 14+
- MongoDB running locally or connection string
- Stripe account (free at [stripe.com](https://stripe.com))

## 1. Get Stripe API Keys (2 minutes)

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up and verify email
3. Go to **Developers** → **API Keys**
4. Copy **Publishable Key** and **Secret Key** (test mode is on by default)

## 2. Configure Environment Variables (1 minute)

### Backend (.env)

```bash
cd backend
```

Create `.env`:
```env
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_KEY_HERE

FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/gridcoin
JWT_SECRET=dev_secret_key
NODE_ENV=development
```

### Frontend (.env)

```bash
cd ../frontend
```

Create `.env`:
```env
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
REACT_APP_API_URL=http://localhost:5000/api
```

## 3. Install Dependencies & Start (2 minutes)

### Backend

```bash
cd backend
npm install
npm start
```

Expected: `Server running on port 5000` ✅

### Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Expected: `Local: http://localhost:3000` ✅

## 4. Test Payment Flow

1. Open http://localhost:3000
2. Navigate to payment page
3. Click **Pay with Stripe**
4. Use test card: `4242 4242 4242 4242`
5. Expiry: `12/25` (any future date)
6. CVC: `123` (any 3 digits)
7. Enter any billing details
8. Click **Pay**
9. You should see success page ✅

## Test Card Numbers

| Card | Type | Status |
|---|---|---|
| `4242 4242 4242 4242` | Visa | Success |
| `4000 0000 0000 0002` | Visa | Decline |
| `5555 5555 5555 4444` | Mastercard | Success |

## API Endpoints

### Start Payment

```bash
curl -X POST http://localhost:5000/api/payments/checkout-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "transaction"
  }'
```

Response includes `checkoutUrl` - redirect user there.

### Verify Payment

```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "cs_test_xxx"
  }'
```

### Get Payment History

```bash
curl http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Subscription

```bash
curl -X POST http://localhost:5000/api/payments/subscription/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "premium",
    "billingPeriod": "month"
  }'
```

## Webhook Testing (Optional)

Local testing with Stripe CLI:

```bash
# Download and login
brew install stripe/stripe-cli/stripe  # or download from stripe.com
stripe login

# Start forwarding webhooks
stripe listen --forward-to localhost:5000/api/payments/webhook/stripe

# Copy the webhook secret from the output and add to .env:
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Database Models

### Payment Record
```javascript
{
  user: ObjectId,           // User who made payment
  amount: 5000,            // Amount in cents
  currency: "usd",         // Currency
  type: "transaction",     // Type of payment
  status: "completed",     // pending|completed|failed|refunded
  stripeSessionId: "cs_test_xxx",      // Stripe session
  stripePaymentIntentId: "pi_xxx",     // Payment intent
  stripeChargeId: "ch_xxx",            // Charge ID
  energyListingId: "listing123",       // Related listing
  createdAt: timestamp,
  updatedAt: timestamp,
  refundedAt: timestamp,               // When refunded
  refundReason: "Customer request"     // Refund reason
}
```

### Subscription Record
```javascript
{
  user: ObjectId,
  plan: "premium",         // Plan name
  amount: 999,            // Monthly amount in cents
  currency: "usd",
  billingPeriod: "month",
  status: "active",       // active|cancelled|past_due
  stripeSubscriptionId: "sub_xxx",
  stripeCustomerId: "cus_xxx",
  stripePriceId: "price_xxx",
  currentPeriodStart: timestamp,
  currentPeriodEnd: timestamp,
  cancelledAt: timestamp,
  features: ["feature1", "feature2"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Invoice Record
```javascript
{
  user: ObjectId,
  paymentId: ObjectId,     // Related payment
  amount: 5000,           // Amount in cents
  status: "paid",         // draft|open|paid|void|uncollectible
  invoiceNumber: "INV-001",
  description: "Payment for energy",
  stripeInvoiceId: "in_xxx",
  issueDate: timestamp,
  dueDate: timestamp,
  paidAt: timestamp,
  createdAt: timestamp
}
```

## Frontend Components

### PaymentGateway

```jsx
<PaymentGateway
  amount={5000}
  type="transaction"
  energyListingId="listing123"
  onSuccess={(payment) => console.log('Paid!', payment)}
  onError={(error) => console.error('Error:', error)}
/>
```

### SubscriptionPlans

```jsx
<SubscriptionPlans
  onSuccess={(sub) => console.log('Subscribed!', sub)}
  onError={(error) => console.error('Error:', error)}
/>
```

### PaymentHistory

```jsx
<PaymentHistory />
```

### BillingPortal

```jsx
<BillingPortal
  onError={(error) => console.error('Error:', error)}
/>
```

## Troubleshooting

**Issue: "Invalid API Key"**
- Check `.env` has correct key format (`pk_test_` or `sk_test_`)
- Restart server after changing `.env`

**Issue: "Checkout failed"**
- Verify frontend `.env` has `REACT_APP_STRIPE_PUBLIC_KEY`
- Check browser console for JavaScript errors
- Ensure Stripe.js loaded (check Network tab)

**Issue: "Payment verification failed"**
- Verify `sessionId` is from current payment
- Sessions expire after 24 hours
- Check MongoDB is running and accessible

**Issue: "Webhook not firing"**
- For local testing, use Stripe CLI: `stripe listen`
- Ensure `.env` has correct `STRIPE_WEBHOOK_SECRET`
- Check server logs for webhook delivery errors

## Next Steps

1. **Read Full Guide**: See [STRIPE_INTEGRATION_GUIDE.md](STRIPE_INTEGRATION_GUIDE.md)
2. **Production Setup**: Switch to live keys when ready
3. **Customize**: Modify components, styling, emails
4. **Monitor**: Check Stripe Dashboard for transactions

## Key Files

- Backend Service: `backend/services/stripe.service.js` (350+ lines)
- Backend Controller: `backend/controllers/stripe.payment.controller.js` (400+ lines)
- Backend Routes: `backend/routes/payment.routes.js`
- Frontend Hook: `frontend/src/hooks/usePayment.js`
- Frontend Components: `frontend/src/components/Payment/`
  - PaymentGateway.jsx
  - SubscriptionPlans.jsx
  - PaymentHistory.jsx
  - BillingPortal.jsx
  - Invoices.jsx

## Support

- Stripe Support: [support.stripe.com](https://support.stripe.com)
- Documentation: [stripe.com/docs](https://stripe.com/docs)
- Test Cards Guide: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

**Ready to accept payments?** 🎉 You're all set! Start by running the backend and frontend servers above.
