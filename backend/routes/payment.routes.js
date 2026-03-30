const express = require('express');
const router = express.Router();
const stripePaymentController = require('../controllers/stripe.payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes - no authentication required
router.get('/all', stripePaymentController.getAllPayments);

// Protected routes - require authentication
router.use(authMiddleware);

// Transaction Payment Routes
router.post('/checkout-session', stripePaymentController.createCheckoutSession);
router.post('/verify', stripePaymentController.verifyPayment);
router.get('/history', stripePaymentController.getPaymentHistory);
router.get('/:paymentId', stripePaymentController.getPaymentDetails);
router.post('/:paymentId/refund', stripePaymentController.refundPayment);
router.get('/stats/overview', stripePaymentController.getPaymentStats);

// Subscription Routes
router.post('/subscription/create', stripePaymentController.createSubscriptionSession);
router.get('/subscription/active', stripePaymentController.getSubscription);
router.post('/subscription/cancel', stripePaymentController.cancelSubscription);

// Billing Portal Route
router.get('/billing/portal', stripePaymentController.getBillingPortal);

// Invoice Routes
router.get('/invoices/list', stripePaymentController.getInvoices);
router.get('/invoices/:invoiceId/pdf', stripePaymentController.downloadInvoicePDF);

// Webhook Routes (No auth required)
router.post('/webhook/stripe', (req, res, next) => {
  // Webhook handler doesn't need auth - remove from protected routes
  next();
}, stripePaymentController.handleWebhook);

module.exports = router;
