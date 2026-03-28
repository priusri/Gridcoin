const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class RazorpayService {
  /**
   * Create an order for one-time payment
   */
  async createOrder(user, amount, currency = 'INR', options = {}) {
    try {
      const orderData = {
        amount: amount * 100, // Razorpay uses amount in paise
        currency,
        receipt: `order_${user._id}_${Date.now()}`,
        payment_capture: 1,
        notes: {
          userId: user._id.toString(),
          email: user.email,
          userName: user.name,
          ...options.notes,
        },
      };

      const order = await razorpay.orders.create(orderData);

      // Save payment record with pending status
      const payment = await Payment.create({
        user: user._id,
        razorpayOrderId: order.id,
        amount,
        currency,
        type: options.type || 'transaction',
        paymentMethod: options.paymentMethod || 'wallet',
        status: 'pending',
        energyListing: options.energyListing,
        description: options.description,
        notes: options.notes,
      });

      return {
        orderId: order.id,
        paymentId: payment._id,
        amount,
        currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      return expectedSignature === razorpaySignature;
    } catch (error) {
      throw new Error(`Signature verification failed: ${error.message}`);
    }
  }

  /**
   * Confirm payment after successful transaction
   */
  async confirmPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, metadata = {}) {
    try {
      // Verify signature first
      if (!this.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
        throw new Error('Invalid payment signature');
      }

      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId,
          razorpaySignature,
          status: 'completed',
          metadata,
        },
        { new: true }
      ).populate('user');

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Fetch payment details from Razorpay
      const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = await Invoice.create({
        user: payment.user._id,
        invoiceNumber,
        payment: payment._id,
        subscription: payment.subscription,
        amount: payment.amount,
        totalAmount: payment.amount,
        currency: payment.currency,
        status: 'paid',
        paidDate: new Date(),
        items: [
          {
            description: payment.description || 'Energy Trading Payment',
            quantity: 1,
            unitPrice: payment.amount,
            amount: payment.amount,
          },
        ],
      });

      return {
        payment,
        invoice,
        paymentDetails,
      };
    } catch (error) {
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(razorpayPaymentId, amount, notes = {}) {
    try {
      const refundData = {
        amount: amount ? amount * 100 : undefined,
        notes,
      };

      const refund = await razorpay.payments.refund(razorpayPaymentId, refundData);

      // Update payment record
      await Payment.findOneAndUpdate(
        { razorpayPaymentId },
        {
          status: 'refunded',
          refundId: refund.id,
          refundAmount: refund.amount / 100,
        }
      );

      return refund;
    } catch (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Create subscription plan
   */
  async createSubscriptionPlan(planName, amount, interval = 'monthly', period = 12) {
    try {
      const planData = {
        period: interval === 'monthly' ? 'monthly' : 'yearly',
        interval: 1,
        amount: amount * 100,
        currency: 'INR',
        description: planName,
      };

      const plan = await razorpay.plans.create(planData);
      return plan;
    } catch (error) {
      throw new Error(`Failed to create subscription plan: ${error.message}`);
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(user, planId, planName, amount, billingPeriod, cycles = 12) {
    try {
      const subscriptionData = {
        plan_id: planId,
        customer_notify: 1,
        quantity: 1,
        total_count: cycles,
        notes: {
          userId: user._id.toString(),
          email: user.email,
          userName: user.name,
        },
      };

      const subscription = await razorpay.subscriptions.create(subscriptionData);

      // Save subscription record
      const subRecord = await Subscription.create({
        user: user._id,
        plan: planName,
        razorpayPlanId: planId,
        razorpaySubscriptionId: subscription.id,
        amount,
        billingPeriod,
        status: 'pending',
        totalPayments: 0,
        features: this.getPlanFeatures(planName),
      });

      return {
        subscription,
        subscriptionRecord: subRecord,
      };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(razorpaySubscriptionId, shouldNotify = true) {
    try {
      const subscription = await razorpay.subscriptions.cancel(razorpaySubscriptionId, {
        notify_email: shouldNotify ? 1 : 0,
      });

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId },
        {
          status: 'cancelled',
          endDate: new Date(),
        }
      );

      return subscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(razorpaySubscriptionId) {
    try {
      const subscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId);
      return subscription;
    } catch (error) {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(razorpayPaymentId) {
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      return payment;
    } catch (error) {
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(razorpayOrderId) {
    try {
      const order = await razorpay.orders.fetch(razorpayOrderId);
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      throw new Error(`Webhook validation failed: ${error.message}`);
    }
  }

  /**
   * Get plan features based on plan name
   */
  getPlanFeatures(planName) {
    const features = {
      basic: [
        { name: 'API Calls', limit: 10000 },
        { name: 'Energy Listings', limit: 50 },
        { name: 'Transactions', limit: 100 },
      ],
      premium: [
        { name: 'API Calls', limit: 50000 },
        { name: 'Energy Listings', limit: 500 },
        { name: 'Transactions', limit: 1000 },
        { name: 'Priority Support', limit: 1 },
      ],
      enterprise: [
        { name: 'API Calls', limit: -1 },
        { name: 'Energy Listings', limit: -1 },
        { name: 'Transactions', limit: -1 },
        { name: 'Priority Support', limit: 1 },
        { name: 'Dedicated Account Manager', limit: 1 },
      ],
    };
    return features[planName] || [];
  }
}

module.exports = new RazorpayService();
