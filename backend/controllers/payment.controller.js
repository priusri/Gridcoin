const paymentService = require('../services/payment.service');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');

class PaymentController {
  /**
   * Create an order for one-time transaction payment
   */
  async createTransactionOrder(req, res) {
    try {
      const { amount, energyListingId, description, paymentMethod } = req.body;
      const user = req.user;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

      const orderData = await paymentService.createOrder(user, amount, 'INR', {
        type: 'transaction',
        energyListing: energyListingId,
        paymentMethod: paymentMethod || 'wallet',
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: orderData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Verify and confirm payment
   */
  async verifyPayment(req, res) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'Missing payment details' });
      }

      const result = await paymentService.confirmPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        {
          walletAddress: req.body.walletAddress,
          platform: 'web',
        }
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: result,
      });
    } catch (error) {
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

      const refund = await paymentService.refundPayment(
        payment.razorpayPaymentId,
        amount || payment.amount,
        { reason }
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
   * Create subscription order
   */
  async createSubscriptionOrder(req, res) {
    try {
      const { planName, billingPeriod = 'monthly' } = req.body;
      const user = req.user;

      const planConfig = {
        basic: { amount: 499 },
        premium: { amount: 999 },
        enterprise: { amount: 4999 },
      };

      const plan = planConfig[planName];
      if (!plan) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      // Create Razorpay plan
      const rzPlan = await paymentService.createSubscriptionPlan(
        planName,
        plan.amount,
        billingPeriod
      );

      // Create subscription
      const subscription = await paymentService.createSubscription(
        user,
        rzPlan.id,
        planName,
        plan.amount,
        billingPeriod
      );

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get subscription details
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

      const rzDetails = await paymentService.getSubscriptionDetails(
        subscription.razorpaySubscriptionId
      );

      res.status(200).json({
        success: true,
        data: {
          ...subscription.toObject(),
          razorpayDetails: rzDetails,
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
      const { shouldNotify = true } = req.body;

      const subscription = await Subscription.findOne({
        user: user._id,
        status: 'active',
      });

      if (!subscription) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      const result = await paymentService.cancelSubscription(
        subscription.razorpaySubscriptionId,
        shouldNotify
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
   * Handle Razorpay webhooks
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];

      if (!paymentService.validateWebhookSignature(req.body, signature)) {
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }

      const event = req.body;

      switch (event.event) {
        case 'payment.authorized':
        case 'payment.captured':
          await this.handlePaymentSuccess(event);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(event);
          break;

        case 'subscription.activated':
          await this.handleSubscriptionActivated(event);
          break;

        case 'subscription.paused':
          await this.handleSubscriptionPaused(event);
          break;

        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(event);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event);
          break;

        default:
          console.log(`Unhandled event: ${event.event}`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handlePaymentSuccess(event) {
    const paymentId = event.payload.payment.entity.id;
    // Payment already updated in confirmPayment, just log
    console.log(`Payment captured: ${paymentId}`);
  }

  async handlePaymentFailed(event) {
    const razorpayPaymentId = event.payload.payment.entity.id;
    const reason = event.payload.payment.entity.error_description;

    await Payment.findOneAndUpdate(
      { razorpayPaymentId },
      {
        status: 'failed',
        failureReason: reason,
      }
    );

    console.log(`Payment failed: ${razorpayPaymentId} - ${reason}`);
  }

  async handleSubscriptionActivated(event) {
    const razorpaySubscriptionId = event.payload.subscription.entity.id;

    await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId },
      {
        status: 'active',
        startDate: new Date(event.payload.subscription.entity.start_at * 1000),
      }
    );

    console.log(`Subscription activated: ${razorpaySubscriptionId}`);
  }

  async handleSubscriptionPaused(event) {
    const razorpaySubscriptionId = event.payload.subscription.entity.id;

    await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId },
      { status: 'paused' }
    );

    console.log(`Subscription paused: ${razorpaySubscriptionId}`);
  }

  async handleSubscriptionCancelled(event) {
    const razorpaySubscriptionId = event.payload.subscription.entity.id;

    await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId },
      {
        status: 'cancelled',
        endDate: new Date(),
      }
    );

    console.log(`Subscription cancelled: ${razorpaySubscriptionId}`);
  }

  async handleInvoicePaid(event) {
    const invoiceId = event.payload.invoice.entity.id;
    const subscriptionId = event.payload.invoice.entity.subscription_id;

    const subscription = await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId: subscriptionId },
      {
        $inc: { totalPayments: 1 },
        lastPaymentDate: new Date(),
        failedAttempts: 0,
      },
      { new: true }
    );

    console.log(`Invoice paid: ${invoiceId}`);
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
}

module.exports = new PaymentController();
