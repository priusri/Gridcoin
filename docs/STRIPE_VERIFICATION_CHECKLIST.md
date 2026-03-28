# Stripe Integration Verification Checklist

Use this checklist to verify that all Stripe integration components are properly installed and configured.

---

## Backend Setup Verification

### ✅ Dependencies
- [ ] `npm list stripe` shows stripe 13.0.0 (or higher)
- [ ] `npm list` shows no missing dependencies
- [ ] `package.json` no longer has razorpay dependency
- [ ] `package-lock.json` is updated

### ✅ Service Layer
- [ ] `backend/services/stripe.service.js` exists (350+ lines)
- [ ] File imports: stripe, mongoose, dotenv
- [ ] Contains 11+ main methods:
  - [ ] createCheckoutSession()
  - [ ] verifyPayment()
  - [ ] refundPayment()
  - [ ] createBillingPortalSession()
  - [ ] createSubscriptionProduct()
  - [ ] createSubscription()
  - [ ] cancelSubscription()
  - [ ] getOrCreateCustomer()
  - [ ] validateWebhookSignature()
  - [ ] getPlanFeatures()
  - [ ] getPaymentDetails()

### ✅ Controller Layer
- [ ] `backend/controllers/stripe.payment.controller.js` exists (400+ lines)
- [ ] File imports: stripe service, models, express
- [ ] Contains 12+ endpoints:
  - [ ] createCheckoutSession()
  - [ ] verifyPayment()
  - [ ] getPaymentHistory()
  - [ ] getPaymentDetails()
  - [ ] refundPayment()
  - [ ] createSubscriptionSession()
  - [ ] getSubscription()
  - [ ] cancelSubscription()
  - [ ] getInvoices()
  - [ ] getBillingPortal()
  - [ ] handleWebhook()
  - [ ] getPaymentStats()
- [ ] Webhook handler covers 5+ event types

### ✅ Models
- [ ] `backend/models/Payment.js` updated:
  - [ ] Has `stripeSessionId` field
  - [ ] Has `stripePaymentIntentId` field
  - [ ] Has `stripeChargeId` field
  - [ ] No longer references razorpayOrderId
  - [ ] No longer references razorpayPaymentId
  - [ ] No longer references razorpaySignature
- [ ] `backend/models/Subscription.js` updated:
  - [ ] Has `stripeSubscriptionId` field
  - [ ] Has `stripeCustomerId` field
  - [ ] Has `stripePriceId` field
  - [ ] No longer references razorpay fields

### ✅ Routes
- [ ] `backend/routes/payment.routes.js` exists
- [ ] Imports stripe controller (not razorpay)
- [ ] Routes to `/checkout-session` (not `/transaction/create-order`)
- [ ] Routes to `/webhook/stripe` (not `/webhook/razorpay`)
- [ ] Has `/billing/portal` endpoint
- [ ] Has `/subscription/*` endpoints
- [ ] Has `/invoices/*` endpoints

### ✅ Configuration
- [ ] `backend/.env.example` exists with:
  - [ ] `STRIPE_PUBLIC_KEY=pk_test_...`
  - [ ] `STRIPE_SECRET_KEY=sk_test_...`
  - [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
  - [ ] No RAZORPAY_* variables
- [ ] `.env` file created (not committed to git)
- [ ] `.env` has actual Stripe test keys
- [ ] FRONTEND_URL set correctly

---

## Frontend Setup Verification

### ✅ Dependencies
- [ ] No razor pay packages in `frontend/package.json`
- [ ] All dependencies installed: `npm install`
- [ ] No console warnings about missing packages

### ✅ Hook
- [ ] `frontend/src/hooks/usePayment.js` exists (300+ lines)
- [ ] Has `createCheckoutSession()` method
- [ ] Has `redirectToCheckout()` method
- [ ] Has `verifyPayment()` method
- [ ] Has `getPaymentHistory()` method
- [ ] Has `getPaymentDetails()` method
- [ ] Has `refundPayment()` method
- [ ] Has `createSubscription()` method
- [ ] Has `getActiveSubscription()` method
- [ ] Has `cancelSubscription()` method
- [ ] Has `getBillingPortal()` method
- [ ] Has `getInvoices()` method
- [ ] Has proper error handling

### ✅ Components Created
- [ ] `frontend/src/components/Payment/BillingPortal.jsx` exists
- [ ] `frontend/src/components/Payment/BillingPortal.css` exists
- [ ] Component displays subscription details
- [ ] Component has "Manage Billing" button
- [ ] Component shows status and features

### ✅ Components Updated
- [ ] `frontend/src/components/Payment/PaymentGateway.jsx` updated:
  - [ ] Uses Stripe.js from CDN
  - [ ] Has `createCheckoutSession()` call
  - [ ] Has `redirectToCheckout()` call
  - [ ] Shows loading state
  - [ ] Handles errors
  - [ ] No Razorpay references
  
- [ ] `frontend/src/components/Payment/SubscriptionPlans.jsx` updated:
  - [ ] Uses cost in dollars (not rupees)
  - [ ] Calls `createSubscription()`
  - [ ] Calls `redirectToCheckout()`
  - [ ] No Razorpay modal code
  - [ ] Shows plans correctly
  
- [ ] `frontend/src/components/Payment/PaymentHistory.jsx` updated:
  - [ ] Uses `stripeSessionId` (not razorpayOrderId)
  - [ ] Calls `getPaymentHistory()` from hook
  - [ ] Shows Stripe payment details
  - [ ] Has details modal view
  - [ ] Formats amounts in dollars
  
- [ ] `frontend/src/components/Payment/Invoices.jsx` updated:
  - [ ] Uses `usePayment` hook
  - [ ] Displays Stripe invoice fields
  - [ ] Shows proper amount formatting
  - [ ] Has invoice details modal
  
- [ ] All components use proper error handling

### ✅ Configuration
- [ ] `frontend/.env.example` exists with:
  - [ ] `REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...`
  - [ ] `REACT_APP_API_URL=http://localhost:5000/api`
  - [ ] No REACT_APP_RAZORPAY_* variables
- [ ] `.env` file created with actual Stripe public key
- [ ] Stripe public key starts with `pk_test_` or `pk_live_`

### ✅ Stripe.js Loading
- [ ] PaymentGateway component loads Stripe.js from CDN
- [ ] Script tag points to `https://js.stripe.com/v3/`
- [ ] Script is loaded in useEffect
- [ ] No errors in browser console

---

## Documentation Verification

### ✅ Guides Created
- [ ] `docs/STRIPE_QUICK_START.md` exists (300+ lines)
  - [ ] Has 5-minute setup guide
  - [ ] Has test card numbers
  - [ ] Has API endpoint examples
  - [ ] Has troubleshooting section
  
- [ ] `docs/STRIPE_INTEGRATION_GUIDE.md` exists (1100+ lines)
  - [ ] Complete integration guide
  - [ ] Setup instructions
  - [ ] API reference
  - [ ] Webhook guide
  - [ ] Production checklist
  - [ ] Troubleshooting
  
- [ ] `docs/RAZORPAY_TO_STRIPE_MIGRATION.md` exists (600+ lines)
  - [ ] Migration guide
  - [ ] Field mapping
  - [ ] Flow comparison
  - [ ] Data migration options
  
- [ ] `docs/STRIPE_IMPLEMENTATION_SUMMARY.md` exists
  - [ ] Summary of changes
  - [ ] File list
  - [ ] Breaking changes
  - [ ] Deployment checklist

### ✅ README Updated
- [ ] Main `README.md` mentions Stripe
- [ ] Tech stack includes payment processing
- [ ] Environment variables section updated
- [ ] Links to documentation guides

---

## Testing Verification

### ✅ Test Card Numbers
- [ ] Know test card: `4242 4242 4242 4242` (success)
- [ ] Know test card: `4000 0000 0000 0002` (decline)
- [ ] Any future expiry date works
- [ ] Any 3-digit CVC works

### ✅ Local Testing
- [ ] Backend starts: `npm start` (port 5000) ✅
- [ ] Frontend starts: `npm run dev` (port 3000) ✅
- [ ] Can navigate to payment page
- [ ] Payment button appears
- [ ] Can click "Pay with Stripe"
- [ ] Stripe checkout page loads
- [ ] Can see test card inputs
- [ ] Test payment succeeds
- [ ] Redirected to success page
- [ ] Payment appears in database

### ✅ Subscription Testing
- [ ] Can navigate to subscription page
- [ ] Plans display with pricing
- [ ] Can click "Get Started"
- [ ] Stripe checkout loads
- [ ] Can complete test payment
- [ ] Subscription created in database
- [ ] Subscription status shows "active"

### ✅ Refund Testing
- [ ] Can refund a test payment
- [ ] Payment status changes to "refunded"
- [ ] No errors in logs

### ✅ Webhook Testing (Optional)
- [ ] Have Stripe CLI installed
- [ ] Run: `stripe listen --forward-to localhost:5000/api/payments/webhook/stripe`
- [ ] Copy webhook secret to .env
- [ ] Webhook secret starts with `whsec_`
- [ ] Can trigger test event: `stripe trigger payment_intent.succeeded`
- [ ] Backend receives webhook
- [ ] Database updated from webhook

---

## Database Verification

### ✅ Payment Collection
- [ ] Query: `db.payments.findOne()`
- [ ] Check for `stripeSessionId` field
- [ ] Check for `stripePaymentIntentId` field
- [ ] Check for `stripeChargeId` field
- [ ] Check for `status` field (pending/completed/failed/refunded)
- [ ] Check for `createdAt` and `updatedAt` timestamps
- [ ] No `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature` fields

### ✅ Subscription Collection
- [ ] Query: `db.subscriptions.findOne()`
- [ ] Check for `stripeSubscriptionId` field
- [ ] Check for `stripeCustomerId` field
- [ ] Check for `stripePriceId` field
- [ ] Check for `status` field (active/paused/cancelled)
- [ ] Check for `currentPeriodStart` and `currentPeriodEnd`
- [ ] No `razorpaySubscriptionId`, `razorpayPlanId` fields

### ✅ Invoice Collection
- [ ] Query: `db.invoices.findOne()`
- [ ] Check for `stripeInvoiceId` field
- [ ] Check for `status` field (draft/open/paid/void)
- [ ] Check for `totalAmount` and `issueDate`

---

## API Endpoint Verification

### ✅ Test Each Endpoint
Run with actual JWT token from authentication

```bash
# Create checkout session
curl -X POST http://localhost:5000/api/payments/checkout-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "type": "transaction"}'
# ✅ Expect: sessionId and checkoutUrl

# Verify payment
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "cs_test_xxx"}'
# ✅ Expect: payment details

# Get payment history
curl http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"
# ✅ Expect: array of payments

# Get payment details
curl http://localhost:5000/api/payments/{paymentId} \
  -H "Authorization: Bearer YOUR_TOKEN"
# ✅ Expect: single payment object

# Create subscription
curl -X POST http://localhost:5000/api/payments/subscription/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planName": "premium", "billingPeriod": "month"}'
# ✅ Expect: sessionId and checkoutUrl

# Get active subscription
curl http://localhost:5000/api/payments/subscription/active \
  -H "Authorization: Bearer YOUR_TOKEN"
# ✅ Expect: subscription details

# Get billing portal URL
curl http://localhost:5000/api/payments/billing/portal \
  -H "Authorization: Bearer YOUR_TOKEN"
# ✅ Expect: portal URL

# Get invoices
curl http://localhost:5000/api/payments/invoices/list \
  -H "Authorization: Bearer YOUR_TOKEN"
# ✅ Expect: array of invoices

# Get stats
curl http://localhost:5000/api/payments/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
# ✅ Expect: payment statistics
```

---

## Error Handling Verification

### ✅ Frontend Error Cases
- [ ] Missing Stripe public key shows warning
- [ ] Network errors show friendly messages
- [ ] API errors display to user
- [ ] Payment failures show details
- [ ] Subscription failures show details

### ✅ Backend Error Cases
- [ ] Invalid session ID: returns 400 error
- [ ] Missing Stripe key secret: throws error
- [ ] Webhook signature verification fails: rejects
- [ ] Missing user: returns 401 auth error
- [ ] Invalid amount: returns 400 error

---

## Stripe Account Verification

### ✅ Stripe Dashboard Access
- [ ] Can log in to Stripe
- [ ] Can view Test Mode dashboard
- [ ] Can see API Keys section
- [ ] Publish key starts with `pk_test_`
- [ ] Secret key starts with `sk_test_`
- [ ] Can view Webhooks section
- [ ] Can see test transactions

### ✅ Test Mode Features
- [ ] Can see test payments
- [ ] Can see test subscriptions
- [ ] Can see test customers
- [ ] Can view webhook logs
- [ ] Can trigger test events

---

## Production Readiness Checklist

### ✅ Before Going Live
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Error logging configured
- [ ] Monitoring set up
- [ ] SSL/HTTPS enabled
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### ✅ Stripe Live Setup (When Ready)
- [ ] Get Stripe live keys from dashboard
- [ ] Add live keys to production `.env`
- [ ] Update redirect URLs in Stripe
- [ ] Set up production webhook
- [ ] Test with live keys on staging
- [ ] Monitor first transactions closely

---

## File Checklist

### ✅ Backend Files
- [ ] `backend/services/stripe.service.js` ✅
- [ ] `backend/controllers/stripe.payment.controller.js` ✅
- [ ] `backend/models/Payment.js` (updated) ✅
- [ ] `backend/models/Subscription.js` (updated) ✅
- [ ] `backend/routes/payment.routes.js` (updated) ✅
- [ ] `backend/package.json` (updated) ✅
- [ ] `backend/.env.example` (updated) ✅
- [ ] `backend/.env` (created locally) ✅

### ✅ Frontend Files
- [ ] `frontend/src/hooks/usePayment.js` (updated) ✅
- [ ] `frontend/src/components/Payment/PaymentGateway.jsx` (updated) ✅
- [ ] `frontend/src/components/Payment/SubscriptionPlans.jsx` (updated) ✅
- [ ] `frontend/src/components/Payment/PaymentHistory.jsx` (updated) ✅
- [ ] `frontend/src/components/Payment/Invoices.jsx` (updated) ✅
- [ ] `frontend/src/components/Payment/BillingPortal.jsx` (created) ✅
- [ ] `frontend/src/components/Payment/BillingPortal.css` (created) ✅
- [ ] `frontend/.env.example` (updated) ✅
- [ ] `frontend/.env` (created locally) ✅

### ✅ Documentation Files
- [ ] `docs/STRIPE_QUICK_START.md` ✅
- [ ] `docs/STRIPE_INTEGRATION_GUIDE.md` ✅
- [ ] `docs/RAZORPAY_TO_STRIPE_MIGRATION.md` ✅
- [ ] `docs/STRIPE_IMPLEMENTATION_SUMMARY.md` ✅
- [ ] `README.md` (updated) ✅

---

## Success Criteria

✅ **All items checked = Ready for Development**

If any item is not checked:
1. Review the related guide
2. Follow the setup instructions
3. Test the component/feature
4. Re-check the item

---

## Quick Reference

| What | Where |
|------|-------|
| Get Stripe Keys | https://dashboard.stripe.com/apikeys |
| Backend Service | backend/services/stripe.service.js |
| Backend Controller | backend/controllers/stripe.payment.controller.js |
| Frontend Hook | frontend/src/hooks/usePayment.js |
| Quick Start Guide | docs/STRIPE_QUICK_START.md |
| Full Guide | docs/STRIPE_INTEGRATION_GUIDE.md |
| Migration Guide | docs/RAZORPAY_TO_STRIPE_MIGRATION.md |
| Test Cards | https://stripe.com/docs/testing#card-numbers |
| Test Dashboard | https://dashboard.stripe.com/test/dashboard |
| Webhook Testing | Use Stripe CLI: stripe listen |

---

## Contact & Support

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Project Issues**: Check GitHub issues
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)

---

**Print this checklist and check items as you set up Stripe integration.**

**Date Started**: ___________  
**Date Completed**: ___________  
**Verified By**: ___________
