# Quick Start Guide - Payment Gateway Integration

## 🚀 Fast Setup (5 Minutes)

### Step 1: Clone & Install
```bash
# For Windows
setup-payment.bat

# For Mac/Linux
bash setup-payment.sh
```

### Step 2: Get Razorpay Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Copy your **Key ID** and **Key Secret**
3. Create a webhook → Copy **Webhook Secret**

### Step 3: Configure Environment
**Backend** (`backend/.env`):
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=test_xxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxx
MONGODB_URI=mongodb://localhost:27017/gridcoin
JWT_SECRET=your_secret_key
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxx
```

### Step 4: Start Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: MongoDB (if local)
mongod
```

### Step 5: Test Payment
1. Open http://localhost:3000
2. Go to payment page
3. Use test card: **4111 1111 1111 1111**
4. Check Payment History

---

## 📋 Complete Integration Steps

### Backend Integration
```javascript
// In server.js
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payments', paymentRoutes);
```

### Frontend Integration
```javascript
// In your component
import usePayment from './hooks/usePayment';

function MyComponent() {
  const { createOrder, verifyPayment, loading } = usePayment();
  
  const handlePayment = async () => {
    const order = await createOrder(100, 'transaction');
    // Display Razorpay payment window
  };

  return <button onClick={handlePayment}>Pay ₹100</button>;
}
```

---

## 🧪 Test Cards

| Card | Details | Result |
|------|---------|--------|
| Visa | 4111 1111 1111 1111 | Success |
| Mastercard | 5555 5555 5555 4444 | Success |
| Amex | 3782 822463 10005 | Success |

**Expiry**: Any future date  
**CVV**: Any 3 digits

---

## 📚 API Quick Reference

### Create Payment Order
```bash
curl -X POST http://localhost:5000/api/payments/transaction/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 100, "type": "transaction"}'
```

### Verify Payment
```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "razorpayOrderId": "order_xxx",
    "razorpayPaymentId": "pay_xxx",
    "razorpaySignature": "sig_xxx"
  }'
```

### Get Payment History
```bash
curl http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔗 File Structure Added

```
backend/
├── models/
│   ├── Payment.js
│   ├── Subscription.js
│   └── Invoice.js
├── services/
│   └── payment.service.js
├── controllers/
│   └── payment.controller.js
├── routes/
│   └── payment.routes.js
└── utils/
    ├── payment.utils.js
    └── invoice.generator.js

frontend/
├── components/Payment/
│   ├── PaymentGateway.jsx
│   ├── SubscriptionPlans.jsx
│   ├── PaymentHistory.jsx
│   ├── Invoices.jsx
│   └── *.css
└── hooks/
    └── usePayment.js

blockchain/
└── contracts/
    └── PaymentRecord.sol
```

---

## 🛠️ Common Issues

### "API Key Error"
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env

### "MongoDB Connection Failed"
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

### "Webhook Not Triggering"
- Use ngrok for local testing: `ngrok http 5000`
- Update webhook URL in Razorpay dashboard

### "CORS Error"
- Check FRONTEND_URL in backend .env
- Verify CORS middleware in server.js

---

## 📞 Support Resources

- **Razorpay Docs**: https://razorpay.com/docs
- **MongoDB Guide**: https://docs.mongodb.com
- **Full Guide**: See `PAYMENT_INTEGRATION_GUIDE.md`

---

## ✅ Checklist

- [ ] Razorpay account created
- [ ] API keys obtained
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Dependencies installed
- [ ] MongoDB running
- [ ] Backend server started
- [ ] Frontend app started
- [ ] Test payment successful
- [ ] Webhook configured

---

## 🎉 You're Ready!

Your payment gateway is now integrated. Start accepting payments with Razorpay!

For enterprise features (White label, custom rates), contact Razorpay sales.
