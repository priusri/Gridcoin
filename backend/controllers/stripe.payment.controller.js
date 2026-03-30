const stripeService = require('../services/stripe.service');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');

class StripePaymentController {
  /**
   * Create checkout session for one-time payment
   */
  async createCheckoutSession(req, res) {
    try {
      const { amount, energyListingId, description, paymentMethod } = req.body;
      const user = req.user;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

      const sessionData = await stripeService.createCheckoutSession(user, amount, 'usd', {
        type: 'transaction',
        energyListingId: energyListingId,
        energyListing: energyListingId,
        paymentMethod: paymentMethod || 'credit_card',
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Checkout session created successfully',
        data: sessionData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Verify payment after checkout
   */
  async verifyPayment(req, res) {
    try {
      console.log('═══════════════════════════════════════');
      console.log('✅ VERIFY ENDPOINT - VERSION 2.0');
      console.log('═══════════════════════════════════════');
      console.log('🔄 VERIFY PAYMENT REQUEST RECEIVED');
      console.log('═══════════════════════════════════════');
      console.log('📍 Method:', req.method);
      console.log('📍 Path:', req.path);
      console.log('📍 URL:', req.originalUrl);
      console.log('📍 Body:', JSON.stringify(req.body));
      console.log('📍 Headers:', {
        authorization: req.headers.authorization ? 'EXISTS' : 'MISSING',
        contentType: req.headers['content-type']
      });
      console.log('📍 User:', req.user ? req.user._id : 'NOT AUTHENTICATED');
      
      const { sessionId } = req.body;

      if (!sessionId) {
        console.log('❌ NO SESSION ID PROVIDED');
        return res.status(400).json({ message: 'Session ID is required' });
      }

      console.log('🔍 Verifying session:', sessionId);
      const result = await stripeService.verifyPayment(sessionId, req.user);
      
      console.log('✓ Verification complete');

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: result,
      });
    } catch (error) {
      console.error('✗✗✗ VERIFY PAYMENT ERROR ✗✗✗');
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(req, res) {
    try {
      const { status, type, limit = 10, page = 1 } = req.query;
      const user = req.user;

      const filter = { user: user._id };
      if (status) filter.status = status;
      if (type) filter.type = type;

      const skip = (page - 1) * limit;

      const payments = await Payment.find(filter)
        .populate('user', 'name email')
        .populate('energyListing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Payment.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get single payment details
   */
  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const user = req.user;

      const payment = await Payment.findOne({
        _id: paymentId,
        user: user._id,
      })
        .populate('user')
        .populate('subscription')
        .populate('energyListing');

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;
      const user = req.user;

      const payment = await Payment.findOne({
        _id: paymentId,
        user: user._id,
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      if (payment.status !== 'completed') {
        return res.status(400).json({ message: 'Can only refund completed payments' });
      }

      const refund = await stripeService.refundPayment(
        payment.stripePaymentIntentId,
        amount || payment.amount
      );

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: refund,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Create subscription for a plan
   */
  async createSubscriptionSession(req, res) {
    try {
      const { planName, billingPeriod = 'month' } = req.body;
      const user = req.user;

      const planConfig = {
        basic: { amount: 4.99, name: 'Basic Plan' },
        premium: { amount: 9.99, name: 'Premium Plan' },
        enterprise: { amount: 49.99, name: 'Enterprise Plan' },
      };

      const plan = planConfig[planName];
      if (!plan) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      // Create product & price if not exists
      const productData = await stripeService.createSubscriptionProduct(
        planName,
        plan.amount,
        billingPeriod
      );

      // Create subscription
      const subscription = await stripeService.createSubscription(
        user,
        productData.price.id,
        planName,
        plan.amount,
        billingPeriod
      );

      // Return client secret for payment
      const clientSecret = subscription.subscription.latest_invoice?.payment_intent?.client_secret;

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: {
          subscription: subscription.subscription,
          subscriptionRecord: subscription.subscriptionRecord,
          clientSecret,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get active subscription
   */
  async getSubscription(req, res) {
    try {
      const user = req.user;

      const subscription = await Subscription.findOne({
        user: user._id,
        status: { $in: ['active', 'pending'] },
      });

      if (!subscription) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      const stripeSubscription = await stripeService.getSubscriptionDetails(
        subscription.stripeSubscriptionId
      );

      res.status(200).json({
        success: true,
        data: {
          ...subscription.toObject(),
          stripeDetails: stripeSubscription,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(req, res) {
    try {
      const user = req.user;

      const subscription = await Subscription.findOne({
        user: user._id,
        status: 'active',
      });

      if (!subscription) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      const result = await stripeService.cancelSubscription(
        subscription.stripeSubscriptionId
      );

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get invoices
   */
  async getInvoices(req, res) {
    try {
      const { status, limit = 10, page = 1 } = req.query;
      const user = req.user;

      const filter = { user: user._id };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;

      const invoices = await Invoice.find(filter)
        .populate('payment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Invoice.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: invoices,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Download invoice as PDF
   */
  async downloadInvoicePDF(req, res) {
    try {
      const { invoiceId } = req.params;
      console.log('📥 PDF Download Request - Invoice ID:', invoiceId);

      const invoice = await Invoice.findById(invoiceId)
        .populate('payment')
        .populate('user');

      if (!invoice) {
        console.log('❌ Invoice not found:', invoiceId);
        return res.status(404).json({ message: 'Invoice not found' });
      }

      console.log('📋 Found invoice:', {
        invoiceNumber: invoice.invoiceNumber,
        user: invoice.user?.name,
        items: invoice.items?.length || 0,
        amount: invoice.amount,
        totalAmount: invoice.totalAmount,
      });

      // Generate invoice PDF buffer
      const InvoiceGenerator = require('../utils/invoice.generator');
      
      // Ensure items array exists with proper structure
      const items = (invoice.items && invoice.items.length > 0) ? invoice.items : [{
        description: invoice.description || 'Payment',
        quantity: 1,
        unitPrice: invoice.amount || 0,
        amount: invoice.amount || 0,
      }];

      console.log('🎨 Preparing PDF data with items:', items);

      const pdfData = {
        invoiceNumber: invoice.invoiceNumber,
        issuedDate: invoice.issueDate || new Date(),
        dueDate: invoice.dueDate,
        customerName: (invoice.user && invoice.user.name) ? invoice.user.name : 'Customer',
        customerEmail: (invoice.user && invoice.user.email) ? invoice.user.email : '',
        customerPhone: (invoice.user && invoice.user.phone) ? invoice.user.phone : '',
        items: items,
        subtotal: invoice.amount || 0,
        tax: invoice.tax || 0,
        taxPercentage: 0,
        totalAmount: invoice.totalAmount || invoice.amount || 0,
        currency: invoice.currency || 'USD',
        status: invoice.status || 'paid',
      };

      console.log('🚀 Calling generateInvoicePDF with:', {
        invoiceNumber: pdfData.invoiceNumber,
        itemCount: pdfData.items.length,
        totalAmount: pdfData.totalAmount,
      });

      const pdfBuffer = await InvoiceGenerator.generateInvoicePDF(pdfData);
      
      console.log('✅ PDF generated successfully. Size:', pdfBuffer.length, 'bytes');

      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      console.log('📤 Sending PDF response to client');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('❌ PDF generation error:', error.message);
      console.error('   Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get billing portal session for managing subscriptions
   */
  async getBillingPortal(req, res) {
    try {
      const user = req.user;

      // Get or create Stripe customer
      let customer = await stripeService.getOrCreateCustomer(user);

      // Create billing portal session
      const session = await stripeService.createBillingPortalSession(customer.id);

      res.status(200).json({
        success: true,
        data: {
          url: session.url,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];

      let event = stripeService.validateWebhookSignature(req.body, signature);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async handleCheckoutCompleted(session) {
    console.log(`Checkout completed: ${session.id}`);
    // Payment already updated in verifyPayment
  }

  async handlePaymentIntentSucceeded(paymentIntent) {
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: 'completed' }
    );
    console.log(`Payment succeeded: ${paymentIntent.id}`);
  }

  async handlePaymentIntentFailed(paymentIntent) {
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'failed',
        failureReason: paymentIntent.last_payment_error?.message,
      }
    );
    console.log(`Payment failed: ${paymentIntent.id}`);
  }

  async handleSubscriptionUpdated(subscription) {
    const status =
      subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'pending' : 'cancelled';

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status,
        renewalDate: new Date(subscription.current_period_end * 1000),
      }
    );
    console.log(`Subscription updated: ${subscription.id}`);
  }

  async handleSubscriptionDeleted(subscription) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: 'cancelled',
        endDate: new Date(),
      }
    );
    console.log(`Subscription deleted: ${subscription.id}`);
  }

  async handleInvoicePaid(invoice) {
    const subscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      {
        $inc: { totalPayments: 1 },
        lastPaymentDate: new Date(),
        failedAttempts: 0,
      },
      { new: true }
    );

    // Create invoice record if needed
    if (subscription && !invoice.paid) {
      const payment = await Payment.findOne({
        user: subscription.user,
      });

      if (payment) {
        await Invoice.create({
          user: subscription.user,
          payment: payment._id,
          subscription: subscription._id,
          invoiceNumber: invoice.number,
          amount: invoice.amount_paid / 100,
          totalAmount: invoice.amount_paid / 100,
          currency: invoice.currency.toUpperCase(),
          status: 'paid',
          paidDate: new Date(invoice.status_transitions.paid_at * 1000),
          items: [
            {
              description: `${subscription.plan} Plan Invoice`,
              quantity: 1,
              unitPrice: subscription.amount,
              amount: subscription.amount,
            },
          ],
        });
      }
    }

    console.log(`Invoice paid: ${invoice.id}`);
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(req, res) {
    try {
      const user = req.user;

      const stats = await Payment.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      const monthlyStats = await Payment.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          byStatus: stats,
          byMonth: monthlyStats,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all payments (public endpoint for testing)
   */
  async getAllPayments(req, res) {
    try {
      const { limit = 20, page = 1 } = req.query;
      const skip = (page - 1) * limit;

      const payments = await Payment.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Payment.countDocuments();

      res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        data: payments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new StripePaymentController();
