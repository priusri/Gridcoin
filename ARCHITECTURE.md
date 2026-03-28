# Payment Gateway Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONT-END (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Payment     │  │ Subscription │  │  Payment     │           │
│  │  Gateway     │  │  Plans       │  │  History     │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
│                    ┌───────▼────────┐                             │
│                    │  usePayment()  │                             │
│                    │  Custom Hook   │                             │
│                    └───────┬────────┘                             │
│                            │                                      │
│                ════════════════════════════════════               │
│                          HTTP REST API                            │
│                     (Razorpay Script CDN)                         │
│                ════════════════════════════════════               │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ HTTPS/TLS
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                      BACK-END (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐      ┌──────────────────┐                    │
│  │ API Routes       │      │ Middleware       │                    │
│  │                  │      │                  │                    │
│  │ payment.routes   │─────▶│ Auth            │                    │
│  │ • Transaction    │      │ Error Handling  │                    │
│  │ • Subscription   │      │ CORS            │                    │
│  │ • Invoice        │      │ Rate Limiting   │                    │
│  │ • Webhook        │      │                  │                    │
│  └────────┬─────────┘      └──────████────────┘                    │
│           │                        │                               │
│  ┌────────▼────────────────────────┴──────────┐                    │
│  │      Payment Controller                     │                    │
│  │  payment.controller.js                      │                    │
│  │  • createTransactionOrder()                │                    │
│  │  • verifyPayment()                         │                    │
│  │  • createSubscription()                    │                    │
│  │  • handleWebhook()                         │                    │
│  │  • getPaymentHistory()                     │                    │
│  └────────┬─────────────────────────────────────┘                  │
│           │                                                        │
│  ┌────────▼────────────────────────────────────┐                   │
│  │      Payment Service Layer                   │                   │
│  │  payment.service.js (Core Razorpay Logic)  │                   │
│  │  • createOrder()                           │                   │
│  │  • verifySignature()                       │                   │
│  │  • confirmPayment()                        │                   │
│  │  • refundPayment()                         │                   │
│  │  • createSubscription()                    │                   │
│  │  • getPaymentDetails()                     │                   │
│  └────────┬─────────────────────────────────────┘                  │
│           │                                                        │
│           │   ┌─────────────────┐      ┌──────────────────┐       │
│           │   │  Utilities      │      │  Invoice         │       │
│           │   │                 │      │  Generator       │       │
│           │   │ payment.utils   │      │  (PDF Export)    │       │
│           │   │ invoice.gen     │      │                  │       │
│           │   └─────────────────┘      └──────────────────┘       │
│           │                                                        │
│  ┌────────▼────────────────────────────────────┐                   │
│  │      Database Layer (MongoDB)                │                   │
│  │                                              │                   │
│  │  ┌──────────┐  ┌──────┐  ┌──────┐          │                   │
│  │  │ Payment  │  │Sub   │  │Inv   │  (Other) │                   │
│  │  │ Records  │  │scription  │oice │  Models │                   │
│  │  └──────────┘  └──────┘  └──────┘          │                   │
│  └────────┬─────────────────────────────────────┘                   │
│           │                                                        │
└───────────┼────────────────────────────────────────────────────────┘
            │
            │ TCP/27017
            │
     ┌──────▼────────┐
     │   MongoDB     │
     │   (Payment DB)│
     └───────────────┘


    ═══════════════════════════════════════════════════════════════
                     3RD PARTY SERVICES
    ═══════════════════════════════════════════════════════════════

    ┌──────────────────┐         ┌──────────────────┐
    │  Razorpay API    │         │   Blockchain     │
    │  Payments        │         │   (Ethereum)     │
    │  Subscriptions   │         │                  │
    │  Refunds         │         │  Smart Contract: │
    │  Webhooks        │         │  PaymentRecord   │
    └──────────────────┘         └──────────────────┘


    ┌──────────────────┐         ┌──────────────────┐
    │   Email Service  │         │   Analytics      │
    │   (SendGrid,     │         │   (Optional)     │
    │    Gmail SMTP)   │         │                  │
    └──────────────────┘         └──────────────────┘
```

---

## Component Flow

### Payment Creation Flow
```
User Clicks "Pay"
       │
       ▼
Frontend: createOrder() [usePayment hook]
       │
       ▼
Backend: POST /api/payments/transaction/create-order
       │
       ├─► Validate input
       ├─► Create Razorpay order
       ├─► Save Payment record (status: pending)
       │
       ▼
Return: Order ID + Razorpay Key
       │
       ▼
Frontend: Display Razorpay Checkout
       │
       ▼
User: Enter Payment Details
       │
       ▼
Razorpay: Process Payment
       │
       ├─ Success ──────┐
       │               │
       ├─ Failed ───┐  │
       │            │  │
       ▼            │  ▼
Return: Payment ID │  Error
            │      │
            └──────┼──► Backend: POST /api/payments/verify
                   │            │
                   │            ├─► Verify Signature
                   │            ├─► Update Payment (completed)
                   │            ├─► Create Invoice
                   │            │
                   │            ▼
                   │         Frontend: Show Success
                   │
                   └──────► Frontend: Show Error
```

### Subscription Flow
```
User Selects Plan
       │
       ▼
Frontend: createSubscription()
       │
       ▼
Backend: POST /api/payments/subscription/create
       │
       ├─► Create Razorpay Plan
       ├─► Create Razorpay Subscription
       ├─► Save Subscription record
       │
       ▼
Return: Subscription Details
       │
       ▼
Razorpay: Process Subscription
       │
       ▼
Webhook: /api/payments/webhook/razorpay
       │
       ├─► Parse Event
       ├─► Validate Signature
       ├─► Update Subscription Status
       │
       ▼
Repeat Charges (Auto-renewal)
       │
       ├─► Each billing period
       ├─► Create invoice
       └─► Send email confirmation
```

### Webhook Event Flow
```
Payment/Subscription Event
       │
       ▼
Razorpay Webhook Server
       │
       ▼
POST: /api/payments/webhook/razorpay
       │
       ├─► Extract signature
       ├─► Validate using secret key
       │
       ├─ Valid ──┐
       │         │
       ├─ Invalid ─► Error 400
       │         │
       ▼         │
Parse Event Type│
       │        │
       ├─ payment.captured
       │    │
       │    └─► Update Payment (completed)
       │
       ├─ subscription.activated
       │    │
       │    └─► Update Subscription (active)
       │
       ├─ subscription.cancelled
       │    │
       │    └─► Update Subscription (cancelled)
       │
       ├─ invoice.paid
       │    │
       │    └─► Create Invoice Record
       │        └─► Send Receipt Email
       │
       ▼
Return 200 OK
```

---

## Data Flow: Payment to Blockchain

```
Payment Completed in Razorpay
       │
       ▼
Create Payment Record (MongoDB)
       │
       ├─► Store: razorpayOrderId, amount, paymentId
       ├─► Status: completed
       ├─► Timestamp
       │
       ▼
Generate Invoice (PDF)
       │
       ├─► Format invoice data
       ├─► Generate PDF
       ├─► Save file reference
       │
       ▼
Optional: Record on Blockchain
       │
       ├─► Call Smart Contract: recordPayment()
       ├─► Parameters:
       │   ├─ User address
       │   ├─ Amount (in wei)
       │   ├─ Order ID
       │   ├─ Payment ID
       │
       ▼
Transaction Recorded on Ethereum
       │
       └─► Immutable audit trail created
```

---

## API Endpoint Architecture

```
┌─ /api/payments
│
├─┬─ /transaction
│ │  ├─ POST /create-order      [Create payment]
│ │  └─ POST /verify            [Verify & confirm]
│ │
├─┬─ /subscription
│ │  ├─ POST /create            [Create recurring]
│ │  ├─ GET  /active            [Get current]
│ │  └─ POST /cancel            [Stop subscription]
│ │
├─┬─ /invoices
│ │  ├─ GET  /list              [List all invoices]
│ │  └─ GET  /:id/download      [Download PDF]
│ │
├─┬─ /history
│ │  ├─ GET  /                  [Paginated list]
│ │  └─ GET  /:id               [Single payment]
│ │
├─┬─ /stats
│ │  └─ GET  /overview          [Statistics]
│ │
└─┬─ /webhook
   └─ POST /razorpay            [Webhook handler]
```

---

## Database Relationship Diagram

```
┌─────────────────────┐
│      User           │
├─────────────────────┤
│ _id                 │
│ name                │
│ email               │
│ phone               │
│ walletAddress (opt) │
└──────────┬──────────┘
           │
           │ 1:Many
           │
┌──────────▼────────────────┐
│      Payment              │
├───────────────────────────┤
│ _id                       │
│ user ──────┐ FK           │
│ razorpayOrderId (unique)  │
│ amount                    │
│ status                    │
│ energyListing (opt) ──┐   │
└───────────┬───────────┼───┘
            │           │
            │           └──────────┐
            │                      │
            ▼                      ▼
     ┌─────────────────┐  ┌──────────────────┐
     │ Invoice         │  │  EnergyListing   │
     ├─────────────────┤  ├──────────────────┤
     │ _id             │  │ _id              │
     │ payment (FK)    │  │ seller           │
     │ amount          │  │ price            │
     │ status          │  │ quantity         │
     │ fileUrl         │  │ timestamp        │
     └─────────────────┘  └──────────────────┘

┌──────────────────────┐
│   Subscription       │
├──────────────────────┤
│ _id                  │
│ user (FK)            │
│ plan (basic|premium) │
│ razorpaySubId        │
│ amount               │
│ billingPeriod        │
│ status               │
│ startDate            │
│ renewalDate          │
│ totalPayments        │
└──────────────────────┘
```

---

## Security Layer

```
┌──────────────────────────────────────────┐
│      HTTPS/TLS Encryption                │
│     (All API Requests & Responses)       │
└──────────────────────────────────────────┘
           │                  │
           ▼                  ▼
    ┌─────────────┐   ┌──────────────┐
    │    JWT      │   │   Signature  │
    │ Authentication  │ Verification │
    │   Token     │   │  (Razorpay)  │
    └─────────────┘   └──────────────┘
           │                  │
           ▼                  ▼
      ┌─────────────────────────────┐
      │  Input Validation & Sanitiz │
      │  CORS Policy Enforcement    │
      │  Rate Limiting              │
      └─────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────┐
    │   MongoDB Index & Encryption│
    │   Payment Data Encryption   │
    └─────────────────────────────┘
```

---

## Supported Payment Methods

```
Razorpay Payment Gateway supports:

┌─────────────────────────────────────────┐
│  CARDS                                  │
├─────────────────────────────────────────┤
│ • Visa (Domestic & International)       │
│ • Mastercard (Domestic & International) │
│ • American Express                      │
│ • Diners Club                           │
│ • RuPay                                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  WALLETS & PREPAID                      │
├─────────────────────────────────────────┤
│ • PayTM                                 │
│ • Amazon Pay                            │
│ • Airtel Money                          │
│ • Freecharge                            │
│ • Mobiwik                               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  NET BANKING                            │
├─────────────────────────────────────────┤
│ • All major Indian banks                │
│ • International bank transfers          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  OTHER PAYMENT METHODS                  │
├─────────────────────────────────────────┤
│ • Unified Payments Interface (UPI)      │
│ • BNPL (Buy Now Pay Later)              │
│ • Bank Transfers                        │
└─────────────────────────────────────────┘
```

---

## Deployment Architecture

```
Development Environment
│
├─ Frontend:  http://localhost:3000
├─ Backend:   http://localhost:5000
├─ MongoDB:   localhost:27017
├─ Razorpay:  TEST MODE
│
└─ ngrok: Public tunnel for webhooks

    │
    ▼

Production Environment
│
├─ Frontend:  https://yourdomain.com
├─ Backend:   https://api.yourdomain.com
├─ MongoDB:   (Cloud: MongoDB Atlas)
├─ Razorpay:  LIVE MODE
│
├─ CDN:       CloudFlare/AWS CloudFront
├─ Email:     SendGrid/SES
├─ Logging:   Sentry/CloudWatch
│
└─ Blockchain: Ethereum (mainnet/testnet)
```

---

## Implementation Status

```
✅ Core Payment Processing
   ├─ Order Creation
   ├─ Payment Verification
   ├─ Signature Validation
   └─ Refund Processing

✅ Subscription Management
   ├─ Plan Creation
   ├─ Subscription Setup
   ├─ Auto-renewal
   └─ Cancellation

✅ Invoice Management
   ├─ Auto-generation
   ├─ PDF Export
   └─ Email Delivery (ready)

✅ Webhook Handling
   ├─ Event Signature Verification
   ├─ Payment Events
   ├─ Subscription Events
   └─ Invoice Events

✅ Frontend Components
   ├─ Payment Gateway UI
   ├─ Subscription Plans
   ├─ Payment History
   └─ Invoice Management

✅ Blockchain Integration
   ├─ Smart Contract
   ├─ Payment Recording
   ├─ Audit Trail
   └─ Refund Tracking

🔄 Optional Enhancements
   ├─ Multi-currency support
   ├─ Advanced analytics
   ├─ GST/Tax integration
   ├─ Accounting software integration
   └─ BNPL options
```

---

This architecture is scalable, secure, and production-ready for enterprise payment processing.
