# Migration Guide: Razorpay to Stripe

This guide helps you migrate your payment system from Razorpay to Stripe.

## Overview

GridCoin has transitioned from **Razorpay** to **Stripe** for improved payment processing, customer experience, and billing management.

### Key Changes

| Feature | Razorpay | Stripe |
|---------|----------|--------|
| **Checkout** | Modal popup within your page | Hosted page (redirect) |
| **Customer Portal** | Manual building required | Built-in self-service |
| **Subscriptions** | Create in Razorpay dashboard | API-based management |
| **Payment Methods** | Limited options | 135+ payment methods |
| **Compliance** | Regional support | Global + regional regulation |
| **Refunds** | Manual from dashboard | Full API support |
| **API Complexity** | Medium | High but well-documented |

---

## What Changed

### Database Models

#### Payment Model

**Before (Razorpay):**
```javascript
{
  razorpayOrderId: "order_xxx",
  razorpayPaymentId: "pay_xxx",
  razorpaySignature: "signature_xxx"
}
```

**After (Stripe):**
```javascript
{
  stripeSessionId: "cs_test_xxx",        // Stripe checkout session
  stripePaymentIntentId: "pi_xxx",       // Payment processing intent
  stripeChargeId: "ch_xxx"               // Charge confirmation
}
```

#### Subscription Model

**Before (Razorpay):**
```javascript
{
  razorpayPlanId: "plan_xxx",
  razorpaySubscriptionId: "sub_xxx"
}
```

**After (Stripe):**
```javascript
{
  stripeSubscriptionId: "sub_xxx",
  stripeCustomerId: "cus_xxx",           // Required for subscriptions
  stripePriceId: "price_xxx"             // Price object in Stripe
}
```

### API Endpoints

#### Create Payment

**Before:**
```bash
POST /api/payments/transaction/create-order
{
  "amount": 5000,
  "paymentMethod": "credit_card"
}
# Returns: Razorpay order details
```

**After:**
```bash
POST /api/payments/checkout-session
{
  "amount": 5000,
  "paymentMethod": "card"
}
# Returns: Stripe session + checkout URL
```

**Migration Note**: New endpoint! Redirect user to `checkoutUrl` instead of opening modal.

#### Verify Payment

**Before:**
```bash
POST /api/payments/verify
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

**After:**
```bash
POST /api/payments/verify
{
  "sessionId": "cs_test_xxx"
}
```

**Migration Note**: Much simpler! Just pass session ID, no signature validation needed.

#### Webhook Handler

**Before:**
```
POST /api/payments/webhook/razorpay
```

**After:**
```
POST /api/payments/webhook/stripe
```

**Migration Note**: Path changed, event names changed, signature verification method changed.

---

## Component Changes

### PaymentGateway Component

**Before (Razorpay):**
```jsx
import Razorpay from 'razorpay-checkout';

const handlePayment = () => {
  const razorpay = new Razorpay({
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    order_id: orderData.orderId,
    handler: (response) => verifyPayment(response)
  });
  razorpay.open();
};
```

**After (Stripe):**
```jsx
import { usePayment } from '../hooks/usePayment';

const handlePayment = async () => {
  const session = await createCheckoutSession(amount, type, options);
  await redirectToCheckout(session.sessionId);
};
```

**Key Differences:**
- No Razorpay modal
- Stripe checkout is a hosted page (redirect)
- Cleaner API with custom hook

### SubscriptionPlans Component

**Before:** Used Razorpay subscription modal with subscription_id
**After:** Uses Stripe Checkout session for subscriptions

**Breaking Change:** Users see Stripe checkout page instead of Razorpay modal.

### New Component: BillingPortal

**Before:** No self-service portal, users contact support
**After:** Customers can manage subscriptions themselves
```jsx
<BillingPortal />
```

---

## Environment Variables

### Backend .env

**Before:**
```env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
```

**After:**
```env
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend .env

**Before:**
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxx
```

**After:**
```env
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
```

---

## Dependencies

### Before
```json
{
  "razorpay": "^2.9.0"
}
```

### After
```json
{
  "stripe": "^13.0.0"
}
```

**Update:** Run `npm install` after updating package.json

---

## Payment Flow Comparison

### Razorpay Flow

```
1. User clicks Pay
   ↓
2. Create order via API
   ↓
3. Open Razorpay modal
   ↓
4. User enters card details in modal
   ↓
5. Razorpay processes payment
   ↓
6. Modal callback with payment data
   ↓
7. Verify signature
   ↓
8. Show success page
```

### Stripe Flow

```
1. User clicks Pay
   ↓
2. Create checkout session via API
   ↓
3. Get Stripe checkout URL
   ↓
4. Redirect to Stripe checkout page
   ↓
5. Stripe processes payment & redirects back
   ↓
6. Verify session completion
   ↓
7. Show success page
```

**Key Difference**: Redirect instead of modal means user leaves your site during checkout.

---

## Testing

### Test Card Numbers

**Razorpay:**
- Any random 16-digit number worked in test mode
- No expiry validation

**Stripe:**
```
4242 4242 4242 4242    -> Success
4000 0000 0000 0002    -> Declined
5555 5555 5555 4444    -> Mastercard
```

**Expiry:** Any future date (e.g., 12/25)
**CVC:** Any 3-4 digits

### Testing Subscriptions

**Razorpay:**
```bash
# Create plan in Razorpay dashboard first
POST /api/payments/subscription/create
{
  "planName": "basic",
  "billingPeriod": "monthly"
}
```

**Stripe:**
```bash
# Plan/price created dynamically
POST /api/payments/subscription/create
{
  "planName": "basic",
  "billingPeriod": "month"
}
```

### Testing Webhooks

**Razorpay:**
```bash
# Use Razorpay test console
Test → payment.captured
```

**Stripe:**
```bash
# Download Stripe CLI
stripe listen --forward-to localhost:5000/api/payments/webhook/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## Data Migration (If Needed)

### Scenario 1: Fresh Start (Recommended)

Simply use the new Stripe implementation. Old Razorpay payments lose payment method details but keep amounts and dates.

```javascript
// Optional: Migrate existing payments
db.payments.updateMany({}, {
  $unset: {
    razorpayOrderId: 1,
    razorpayPaymentId: 1,
    razorpaySignature: 1
  },
  $set: {
    migrationDate: new Date(),
    migratedFrom: "razorpay"
  }
});
```

### Scenario 2: Data Archival

Keep old Razorpay payment records separate:

```javascript
// Archive Razorpay payments
db.razorpay_payments_archive.insertMany(
  db.payments.find({ razorpayOrderId: { $exists: true } }).toArray()
);

// Create clean payments collection for Stripe
db.payments.deleteMany({ razorpayOrderId: { $exists: true } });
```

---

## Webhook Event Mapping

| Razorpay Event | Stripe Event | Action |
|---|---|---|
| `payment.captured` | `payment_intent.succeeded` | Mark payment complete |
| `payment.failed` | `payment_intent.payment_failed` | Mark payment failed |
| `subscription.activated` | `customer.subscription.created` | Create subscription |
| `subscription.paused` | `customer.subscription.updated` (paused) | Pause subscription |
| `subscription.cancelled` | `customer.subscription.deleted` | Cancel subscription |

---

## Feature Comparison

### Payments

| Feature | Razorpay | Stripe |
|---------|----------|--------|
| One-time payment | ✅ | ✅ |
| Payment methods | Cards, UPI, Wallets | Cards, 135+ methods |
| Refunds | Manual | API + Manual |
| Dispute handling | Manual | Automatic |

### Subscriptions

| Feature | Razorpay | Stripe |
|---------|----------|--------|
| Creating plans | Dashboard | API |
| Creating subscriptions | Dashboard | API |
| Automatic renewal | ✅ | ✅ |
| Customer portal | ❌ | ✅ (Built-in) |
| Pause subscription | ✅ | ✅ |
| Change plan | Manual | API |

### Developer Experience

| Feature | Razorpay | Stripe |
|---------|----------|--------|
| Documentation | Good | Excellent |
| SDK quality | Good | Excellent |
| API status page | ✅ | ✅ |
| Sandbox environment | ✅ | ✅ |
| Webhook dashboard | ✅ | ✅ |
| CLI tools | ❌ | ✅ (Stripe CLI) |

---

## Troubleshooting Migration

### Issue: Payments Not Processing

**Before (Razorpay):**
- Check Razorpay dashboard → Payments
- Verify payment signature

**After (Stripe):**
- Check Stripe dashboard → Payments
- Verify session ID in database
- Check webhook logs

### Issue: Webhook Not Firing

**Razorpay:** Check Razorpay dashboard → Webhooks
**Stripe:**
```bash
stripe logs
# or
stripe trigger payment_intent.succeeded
```

### Issue: Old Integration Still References Razorpay

Find and replace:
```bash
grep -r "razorpay" . --include="*.js" --include="*.jsx"
```

Replace with Stripe equivalents:
- `razorpayOrderId` → `stripeSessionId`
- `razorpayPaymentId` → `stripePaymentIntentId`
- `razorpaySignature` → `stripeChargeId`

---

## Production Migration Checklist

- [ ] Install Stripe npm package
- [ ] Update backend `.env` with Stripe test keys
- [ ] Update frontend `.env` with Stripe public key
- [ ] Test payment flow with test cards
- [ ] Test subscription creation and cancellation
- [ ] Test refund flow
- [ ] Update webhook handler
- [ ] Set up Stripe CLI for local webhook testing
- [ ] Update documentation (README, API docs)
- [ ] ~~Remove~~ Keep Razorpay code (optional backup)
- [ ] Deploy to staging
- [ ] Test on staging with test Stripe account
- [ ] Switch to Stripe live keys
- [ ] Update Stripe redirect URLs in dashboard
- [ ] Set up production webhook in Stripe
- [ ] Monitor first transactions carefully
- [ ] Update customer documentation

---

## API Keys Comparison

### Razorpay Keys

```
Key ID:        rzp_test_abc123xyz
Key Secret:    secret_abc123xyz
Webhook Key:   webhook_secret_abc123xyz
```

### Stripe Keys

```
Publishable Key:   pk_test_abc123123123123123
Secret Key:        sk_test_abc123123123123123
Webhook Secret:    whsec_abc123abc123abc123
```

**Length:** Stripe keys are longer and more URL-safe.

---

## Support Resources

### Razorpay Docs (Reference)
- [Razorpay Documentation](https://razorpay.com/docs)
- [Razorpay API Reference](https://razorpay.com/docs/api)

### Stripe Docs (Your New Home)
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Test Mode Guide](https://stripe.com/docs/testing)

---

## Questions?

These resources can help:

1. **Complete Integration Guide**: [STRIPE_INTEGRATION_GUIDE.md](STRIPE_INTEGRATION_GUIDE.md)
2. **Quick Start**: [STRIPE_QUICK_START.md](STRIPE_QUICK_START.md)
3. **Stripe Support**: [support.stripe.com](https://support.stripe.com)
4. **GitHub Discussions**: Check the Gridcoin repository

---

**Migration Date**: 2024
**Status**: Production Ready
