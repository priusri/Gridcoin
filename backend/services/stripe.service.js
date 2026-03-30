const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');

class StripeService {
  /**
   * Create a checkout session for payment
   */
  async createCheckoutSession(user, amount, currency = 'usd', options = {}) {
    try {
      const lineItems = {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: options.description || 'Energy Trading Payment',
            metadata: {
              userId: user._id.toString(),
            },
          },
          unit_amount: Math.round(amount * 100), // Stripe uses cents
        },
        quantity: 1,
      };

      const sessionData = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [lineItems],
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        customer_email: user.email,
        metadata: {
          userId: user._id.toString(),
          type: options.type || 'transaction',
          energyListingId: options.energyListingId || '',
        },
      };

      const session = await stripe.checkout.sessions.create(sessionData);

      // Save payment record with pending status
      const paymentData = {
        user: user._id,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        amount,
        currency: currency.toUpperCase(),
        type: options.type || 'transaction',
        paymentMethod: options.paymentMethod || 'credit_card',
        status: 'pending',
        description: options.description,
        notes: options.notes,
      };

      // Only add energyListing if it's a valid ObjectId
      if (options.energyListing) {
        try {
          if (typeof options.energyListing === 'string' && options.energyListing.length === 24) {
            // It's a valid ObjectId format
            paymentData.energyListing = options.energyListing;
          }
        } catch (e) {
          // Skip invalid energyListing
        }
      }

      const payment = await Payment.create(paymentData);

      return {
        sessionId: session.id,
        checkoutUrl: session.url,
        paymentId: payment._id,
        amount,
        currency,
      };
    } catch (error) {
      throw new Error(`Failed to create Stripe checkout session: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent to verify payment
   */
  async verifyPayment(stripeSessionId) {
    try {
      console.log('🔍 Verifying payment for session:', stripeSessionId);
      
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      console.log('✓ Retrieved session:', session.id, 'Status:', session.payment_status);

      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }

      // Get payment intent for more details
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
      console.log('✓ Retrieved payment intent:', paymentIntent.id);

      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId },
        {
          stripePaymentIntentId: paymentIntent.id,
          status: 'completed',
          metadata: {
            stripeCustomerId: session.customer,
            chargeId: paymentIntent.charges.data[0]?.id,
          },
        },
        { new: true }
      ).populate('user');

      if (!payment) {
        throw new Error('Payment record not found');
      }
      console.log('✓ Updated payment record:', payment._id);

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`;
      console.log('📄 Creating invoice:', invoiceNumber);
      
      const invoice = await Invoice.create({
        user: payment.user._id,
        invoiceNumber,
        payment: payment._id,
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
      
      console.log('✓ Created invoice:', invoice._id, invoice.invoiceNumber);
      console.log('📦 Returning verification result with payment and invoice');

      return {
        payment,
        invoice,
        session,
        paymentIntent,
      };
    } catch (error) {
      console.error('✗ Payment verification error:', error.message);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(stripePaymentIntentId, amount = null) {
    try {
      const refundData = {};
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create({
        payment_intent: stripePaymentIntentId,
        ...refundData,
      });

      // Update payment record
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId },
        {
          status: 'refunded',
          metadata: {
            refundId: refund.id,
            refundAmount: refund.amount / 100,
          },
        }
      );

      return refund;
    } catch (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Create a subscription
   */
  async createBillingPortalSession(customerId) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: process.env.FRONTEND_URL,
      });

      return session;
    } catch (error) {
      throw new Error(`Failed to create billing portal session: ${error.message}`);
    }
  }

  /**
   * Create subscription product
   */
  async createSubscriptionProduct(planName, amount, interval = 'month') {
    try {
      // Create product
      const product = await stripe.products.create({
        name: `${planName} Plan - Energy Trading`,
        description: `${planName} subscription plan for Gridcoin energy trading`,
        metadata: {
          plan: planName,
        },
      });

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100),
        currency: 'usd',
        recurring: {
          interval: interval,
          interval_count: 1,
        },
      });

      return { product, price };
    } catch (error) {
      throw new Error(`Failed to create subscription product: ${error.message}`);
    }
  }

  /**
   * Create subscription for customer
   */
  async createSubscription(user, priceId, planName, amount, billingPeriod) {
    try {
      // Create or get customer
      let customer = await this.getOrCreateCustomer(user);

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription record
      const subRecord = await Subscription.create({
        user: user._id,
        plan: planName,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        stripePriceId: priceId,
        amount,
        currency: 'USD',
        billingPeriod,
        status: 'pending',
        totalPayments: 0,
        features: this.getPlanFeatures(planName),
      });

      return {
        subscription,
        subscriptionRecord: subRecord,
        customer,
      };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.del(stripeSubscriptionId);

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId },
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
   * Get or create Stripe customer
   */
  async getOrCreateCustomer(user) {
    try {
      // Check if user already has a Stripe customer ID
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user._id.toString(),
          },
        });

        // Update user with Stripe customer ID
        await require('../models/User').findByIdAndUpdate(user._id, {
          stripeCustomerId: customer.id,
        });

        return customer;
      }

      return await stripe.customers.retrieve(customerId);
    } catch (error) {
      throw new Error(`Failed to get or create customer: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      throw new Error(`Webhook validation failed: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(stripeSubscriptionId) {
    try {
      return await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (error) {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }
  }

  /**
   * Get invoice details
   */
  async getInvoiceDetails(stripeInvoiceId) {
    try {
      return await stripe.invoices.retrieve(stripeInvoiceId);
    } catch (error) {
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntentDetails(stripePaymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    } catch (error) {
      throw new Error(`Failed to fetch payment intent: ${error.message}`);
    }
  }

  /**
   * Get plan features
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

module.exports = new StripeService();
