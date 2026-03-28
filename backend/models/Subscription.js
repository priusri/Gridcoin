const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripePriceId: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    billingPeriod: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'paused', 'cancelled', 'expired'],
      default: 'pending',
    },
    startDate: Date,
    endDate: Date,
    renewalDate: Date,
    autoRenew: {
      type: Boolean,
      default: true,
    },
    totalPayments: {
      type: Number,
      default: 0,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lastPaymentDate: Date,
    features: [
      {
        name: String,
        limit: Number,
      },
    ],
    notes: String,
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ razorpaySubscriptionId: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
