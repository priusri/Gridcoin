# Stripe Payment Integration Guide

This guide covers the complete setup and implementation of Stripe payment processing for the Gridcoin Energy Trading platform.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Account Setup](#account-setup)
3. [Environment Configuration](#environment-configuration)
4. [Installation](#installation)
5. [API Integration](#api-integration)
6. [Frontend Implementation](#frontend-implementation)
7. [Webhook Setup](#webhook-setup)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

Stripe is a modern payment processing platform that provides:
- **One-time Payments**: Accept credit/debit cards for one-time purchases
- **Recurring Billing**: Manage subscriptions with automatic charges
- **Customer Management**: Built-in customer portal for self-service management
- **Invoicing**: Automatic invoice generation and delivery
- **Refunds**: Full or partial refunds with audit trails
- **Webhooks**: Real-time event notifications

### Why Stripe?

- **Security**: PCI DSS Level 1 certified, handles all card data encryption
- **Global**: Supports 135+ currencies and payment methods
- **Developer-Friendly**: Comprehensive API and SDKs for all languages
- **Customer Portal**: Self-service billing management without custom UI
- **Compliance**: GDPR, PSD2, and regional payment regulations built-in

---

## Account Setup

### Step 1: Create a Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your business email
3. Complete the verification process
4. Fill in your business and bank information
5. Verify your email address

### Step 2: Get API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. You'll see two key types:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)
4. Toggle between Test and Live modes at the top

**For Development (Test Mode):**
- Use test keys that start with `pk_test_` and `sk_test_`
- Use test card numbers: `4242 4242 4242 4242`
- Use future date for expiry: `12/25`
- Use any 3-digit CVC: `123`

### Step 3: Enable Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add an endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook/stripe`
4. Select events to receive:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
5. Copy the **Signing Secret** (starts with `whsec_`)

### Step 4: Configure Allowed Redirect URLs

1. Go to **Settings** → **Redirect URIs**
2. Add your development URL: `http://localhost:3000/payment-success`
3. Add your development URL: `http://localhost:3000/payment-cancelled`
4. Add production URLs once deployed

---

## Environment Configuration

### Backend Setup

Create `.env` file in the `backend/` directory:

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Other configurations...
MONGODB_URI=mongodb://localhost:27017/gridcoin
JWT_SECRET=your_secret_key
```

### Frontend Setup

Create `.env` file in the `frontend/` directory:

```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Optional Stripe Price IDs (for custom subscription handling)
REACT_APP_STRIPE_BASIC_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install stripe
```

### 2. Install Frontend Dependencies

Stripe.js is loaded via CDN in components, no npm installation needed.

### 3. Verify Installation

Backend:
```bash
npm list stripe
```

Expected output: `stripe@13.0.0`

---

## API Integration

### Backend Service Layer

The `backend/services/stripe.service.js` provides all Stripe API interactions:

#### Creating a Checkout Session

```javascript
const { createCheckoutSession } = require('../services/stripe.service');

// For one-time payments
const session = await createCheckoutSession(user, 5000, 'usd', {
  description: 'Energy purchase',
  type: 'transaction'
});

// Returns { sessionId, checkoutUrl, ... }
```

#### Verifying Payments

```javascript
const { verifyPayment } = require('../services/stripe.service');

const payment = await verifyPayment(sessionId);
// Returns verified payment details
```

#### Processing Refunds

```javascript
const { refundPayment } = require('../services/stripe.service');

const refund = await refundPayment(paymentIntentId, 5000, 'Duplicate charge');
// Returns refund confirmation
```

#### Managing Subscriptions

```javascript
const { createSubscription } = require('../services/stripe.service');

const subscription = await createSubscription(customerId, 'basic', 'month');
// Returns subscription details including billing dates
```

#### Accessing Billing Portal

```javascript
const { createBillingPortalSession } = require('../services/stripe.service');

const portal = await createBillingPortalSession(customerId);
// Returns { url } to redirect user to Stripe billing portal
```

### Controller Endpoints

The `backend/controllers/stripe.payment.controller.js` exposes REST API endpoints:

#### Create Checkout Session

```http
POST /api/payments/checkout-session
Content-Type: application/json
Authorization: Bearer {token}

{
  "amount": 5000,
  "type": "transaction",
  "energyListingId": "listing123",
  "description": "Energy purchase"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_live_xxx",
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_live_xxx"
  }
}
```

#### Verify Payment

```http
POST /api/payments/verify
Content-Type: application/json
Authorization: Bearer {token}

{
  "sessionId": "cs_live_xxx"
}
```

#### Get Payment History

```http
GET /api/payments/history?status=completed&page=1&limit=10
Authorization: Bearer {token}
```

#### Refund Payment

```http
POST /api/payments/{paymentId}/refund
Content-Type: application/json
Authorization: Bearer {token}

{
  "amount": 5000,
  "reason": "Customer request"
}
```

#### Create Subscription

```http
POST /api/payments/subscription/create
Content-Type: application/json
Authorization: Bearer {token}

{
  "planName": "premium",
  "billingPeriod": "month"
}
```

#### Get Billing Portal

```http
GET /api/payments/billing/portal
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/session/xxx"
  }
}
```

#### Webhook Handler

```http
POST /api/payments/webhook/stripe
Content-Type: application/json
Stripe-Signature: t=timestamp,v1=signature

{
  "id": "evt_xxx",
  "type": "payment_intent.succeeded",
  "data": { ... }
}
```

---

## Frontend Implementation

### Payment Gateway Component

```jsx
import PaymentGateway from './components/Payment/PaymentGateway';

function CheckoutPage() {
  const handleSuccess = (payment) => {
    console.log('Payment completed:', payment);
    // Redirect to success page
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <PaymentGateway
      amount={5000}
      type="transaction"
      energyListingId="123"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### Subscription Plans Component

```jsx
import SubscriptionPlans from './components/Payment/SubscriptionPlans';

function SubscriptionPage() {
  return (
    <SubscriptionPlans
      onSuccess={(sub) => console.log('Subscribed:', sub)}
      onError={(err) => console.error('Subscription failed:', err)}
    />
  );
}
```

### Billing Portal Component

```jsx
import BillingPortal from './components/Payment/BillingPortal';

function AccountSettingsPage() {
  return (
    <BillingPortal
      onError={(err) => console.error('Billing error:', err)}
    />
  );
}
```

### Payment History Component

```jsx
import PaymentHistory from './components/Payment/PaymentHistory';

function HistoryPage() {
  return <PaymentHistory />;
}
```

### Using usePayment Hook

```jsx
import { usePayment } from './hooks/usePayment';

function MyComponent() {
  const {
    loading,
    error,
    payment,
    createCheckoutSession,
    redirectToCheckout,
    verifyPayment,
    getPaymentHistory,
    cancelSubscription,
    getBillingPortal,
    clearError
  } = usePayment();

  const handlePayment = async () => {
    try {
      const session = await createCheckoutSession(5000, 'transaction', {
        energyListingId: '123',
        description: 'Energy purchase'
      });
      
      await redirectToCheckout(session.sessionId);
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
```

---

## Webhook Setup

### What are Webhooks?

Webhooks are HTTP POST requests that Stripe sends to your application when events occur (payment completed, subscription renewed, etc.). They enable real-time status updates without polling.

### Webhook Events

The system automatically handles:

1. **`checkout.session.completed`**: User completed Stripe checkout
2. **`payment_intent.succeeded`**: Payment processed successfully
3. **`payment_intent.payment_failed`**: Payment failed
4. **`customer.subscription.updated`**: Subscription details changed
5. **`customer.subscription.deleted`**: Subscription cancelled
6. **`invoice.paid`**: Invoice payment received (for subscriptions)

### Setting Up Webhooks

#### Local Testing (Using Stripe CLI)

1. Download [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhook events:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook/stripe
   ```
4. Copy the signing secret and add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

#### Production Deployment

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint: `https://yourdomain.com/api/payments/webhook/stripe`
4. Select events (as listed above)
5. Copy signing secret to production `.env`

### Webhook Verification

The `stripe.service.js` validates webhook authenticity:

```javascript
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

This ensures the webhook came from Stripe and hasn't been tampered with.

---

## Testing

### Test Cards

Use these test card numbers in test mode:

| Card Number | Details |
|---|---|
| `4242 4242 4242 4242` | Visa (Success) |
| `4000 0000 0000 0002` | Visa (Decline) |
| `5555 5555 5555 4444` | Mastercard (Success) |
| `3782 822463 10005` | American Express |
| `3714 496 353 98431` | American Express |

### Expiry & CVC

- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3-4 digit number (e.g., `123`)

### Test Payment Flow

1. Start backend: `npm start` (runs on port 5000)
2. Start frontend: `npm run dev` (runs on port 3000)
3. Navigate to payment page
4. Click "Pay with Stripe"
5. Redirect to Stripe checkout
6. Enter test card details (above)
7. Enter test billing details (any values)
8. Complete payment
9. Verify success page redirect

### Test Subscription Flow

1. Navigate to subscription plans page
2. Click "Get Started" on any plan
3. Redirect to Stripe checkout
4. Test card payment
5. Verify subscription created in database
6. Check Stripe dashboard for subscription

### Test Refunds

1. Get payment ID from payment history
2. Send API request:
   ```bash
   curl -X POST http://localhost:5000/api/payments/{paymentId}/refund \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"reason": "Test refund"}'
   ```
3. Verify payment status changes to "refunded"

### Test Webhooks (Local)

1. Trigger test event:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
2. Stripe CLI forwards to your app
3. Verify webhook handler processes event
4. Check logs or database for updates

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled on domain
- [ ] Redirect URLs added to Stripe dashboard
- [ ] Webhook endpoint verification complete
- [ ] Switch Stripe keys to live mode
- [ ] Test full payment flow with live keys
- [ ] Monitor logs for errors

### Step 1: Get Live Keys

1. Go to Stripe Dashboard
2. Toggle to **Live mode** (top right)
3. Copy live keys (`pk_live_` and `sk_live_`)
4. Add to production `.env`

### Step 2: Configure Stripe Settings

1. **Redirect URIs**: Add production domain
   - Success: `https://yourdomain.com/payment-success`
   - Cancel: `https://yourdomain.com/payment-cancelled`

2. **Webhook Endpoint**: Add production URL
   - `https://yourdomain.com/api/payments/webhook/stripe`

3. **Email Settings**: Enable/disable email receipts
   - Default: On (Stripe sends receipts)

4. **Branding**: Customize payment pages
   - Logo and colors (optional)

### Step 3: Update Environment

```env
# Production .env
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_1Kxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb://production-server:27017/gridcoin
JWT_SECRET=your_production_secret_key
NODE_ENV=production
```

### Step 4: Deploy

```bash
# Build backend
cd backend
npm install
npm start

# Build frontend
cd frontend
npm install
npm run build
```

### Step 5: Monitor

1. Check Stripe Dashboard for:
   - Successful charges
   - Failed payments
   - Subscription activity
   - Webhook logs

2. Monitor application logs for errors

3. Set up alerts for payment failures

---

## Troubleshooting

### Common Issues

#### Issue: "Invalid API Key"
**Cause**: Wrong key format or wrong environment
**Solution**:
- Verify key starts with `pk_test_` or `sk_test_` (test mode)
- Verify key starts with `pk_live_` or `sk_live_` (production)
- Check `.env` file has correct keys
- Restart server after changing keys

#### Issue: "Webhook Signature Verification Failed"
**Cause**: Wrong webhook secret or signature mismatch
**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` in `.env` matches Stripe dashboard
- Ensure webhook body is not modified before verification
- Check timestamp is within 5 minutes (Stripe requirement)
- Use Stripe CLI for local testing: `stripe listen`

#### Issue: "Checkout Session Not Found"
**Cause**: Session ID doesn't exist or expired
**Solution**:
- Verify session ID is correct
- Sessions expire after 24 hours
- Create new session if expired
- Check payment was created in database

#### Issue: "Payment Intent Requires Action"
**Cause**: 3D Secure or other authentication needed
**Solution**:
- This is normal for secure payments
- Stripe automatically handles with checkout page
- Test card `4000 0025 0000 3155` requires 3D Secure in test mode

#### Issue: "Subscription Creation Fails"
**Cause**: Customer not created or price ID invalid
**Solution**:
- Verify user exists in database
- Check Stripe customer is created before subscription
- Verify price ID exists in Stripe dashboard
- Check plan configuration in controller

#### Issue: "Billing Portal Returns 404"
**Cause**: Customer doesn't have active session
**Solution**:
- Ensure customer exists in Stripe
- Create test subscription first
- Clear browser cache and try again
- Check Stripe dashboard for customer details

### Debug Mode

Enable detailed logging:

```javascript
// In stripe.service.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  httpClient: {
    timeout: 30000,
  },
});

// Add logging
stripe.on('request', (request) => {
  console.log(`[Stripe] ${request.method} ${request.path}`);
});
```

### Contact Support

- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Test Cards**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Migration from Razorpay

If migrating from Razorpay:

### Field Mapping

| Razorpay | Stripe |
|---|---|
| `razorpayOrderId` | `stripeSessionId` |
| `razorpayPaymentId` | `stripePaymentIntentId` |
| `razorpaySignature` | `stripeChargeId` |
| `razorpayPlanId` | `stripePriceId` |
| `razorpaySubscriptionId` | `stripeSubscriptionId` |

### Key Differences

| Feature | Razorpay | Stripe |
|---|---|---|
| Checkout | Modal popup | Hosted page (redirect) |
| Customer Portal | Manual building | Built-in billing portal |
| API Keys | Key ID + Secret | Public + Secret + Webhook Secret |
| Webhooks | Different event names | Different event names |
| Pricing | Per transaction | Per transaction |

### Migration Steps

1. Update models (Payment, Subscription)
2. Update services (API calls)
3. Update controllers (endpoints)
4. Update frontend components
5. Update hooks (API calls)
6. Test all flows with live keys
7. Update documentation

---

## Best Practices

1. **Security**
   - Never log secret keys
   - Use environment variables
   - Enable webhooks for real-time updates
   - Validate amounts before charging

2. **Error Handling**
   - Show user-friendly error messages
   - Log detailed errors to monitoring service
   - Handle network timeouts gracefully
   - Retry failed webhook deliveries

3. **Testing**
   - Use test mode for all development
   - Test all payment flows before production
   - Test refund flows
   - Test subscription lifecycle

4. **Monitoring**
   - Monitor webhook logs
   - Alert on payment failures
   - Track failed refunds
   - Review dispute reports

5. **Compliance**
   - Keep PCI compliance certificates current
   - Review Stripe compliance documentation
   - Follow regional payment regulations
   - Update privacy policy mentioning Stripe

---

## Resources

- [Stripe Official Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Test Mode Guide](https://stripe.com/docs/testing)
- [Webhooks Documentation](https://stripe.com/docs/webhooks)

---

**Last Updated**: 2024
**Version**: 1.0
