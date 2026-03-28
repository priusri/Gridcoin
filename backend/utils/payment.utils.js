/**
 * Payment Gateway Utilities
 */

/**
 * Format amount for display
 */
function formatCurrency(amount, currency = 'INR') {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Convert amount to paise (for Razorpay)
 */
function toPaise(amount) {
  return Math.round(amount * 100);
}

/**
 * Convert paise to rupees
 */
function fromPaise(paise) {
  return paise / 100;
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${random}-${timestamp}`;
}

/**
 * Generate order receipt
 */
function generateReceipt(userId, type) {
  const timestamp = Date.now().toString().slice(-6);
  const typePrefix = type === 'transaction' ? 'TXN' : 'SUB';
  return `${typePrefix}-${userId}-${timestamp}`;
}

/**
 * Calculate subscription renewal date
 */
function calculateRenewalDate(billingPeriod) {
  const date = new Date();
  switch (billingPeriod) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date;
}

/**
 * Validate payment amount
 */
function validatePaymentAmount(amount, minAmount = 1, maxAmount = 1000000) {
  if (typeof amount !== 'number' || amount < 0) {
    return { valid: false, message: 'Amount must be a positive number' };
  }
  if (amount < minAmount) {
    return { valid: false, message: `Minimum amount is ₹${minAmount}` };
  }
  if (amount > maxAmount) {
    return { valid: false, message: `Maximum amount is ₹${maxAmount}` };
  }
  return { valid: true };
}

/**
 * Create payment metadata for blockchain integration
 */
function createPaymentMetadata(payment) {
  return {
    paymentId: payment._id,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    amount: payment.amount,
    user: payment.user,
    type: payment.type,
    timestamp: payment.createdAt,
  };
}

/**
 * Parse Razorpay error response
 */
function parseRazorpayError(error) {
  const errorMap = {
    INVALID_ORDERID: 'Invalid order ID',
    BadRequestError: 'Invalid request data',
    NetworkError: 'Network error, please try again',
    TimeoutError: 'Request timeout, please try again',
    PAYMENT_PENDING: 'Payment is still pending',
    PAYMENT_CANCELLED: 'Payment was cancelled',
  };

  return errorMap[error.code] || error.message || 'An error occurred during payment';
}

/**
 * Calculate fees for payment
 */
function calculatePaymentFees(amount, feePercentage = 2) {
  const fee = amount * (feePercentage / 100);
  return {
    amount,
    fee: Math.round(fee * 100) / 100,
    total: Math.round((amount + fee) * 100) / 100,
  };
}

/**
 * Get plan pricing
 */
function getPlanPricing(planName) {
  const plans = {
    basic: {
      name: 'Basic',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        'Up to 50 Energy Listings',
        'Up to 100 Transactions',
        'Basic Analytics',
        'Email Support',
      ],
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      features: [
        'Up to 500 Energy Listings',
        'Up to 1000 Transactions',
        'Advanced Analytics',
        'Priority Support',
        'API Access',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 4999,
      yearlyPrice: 49990,
      features: [
        'Unlimited Listings & Transactions',
        'Custom Analytics',
        'Dedicated Support',
        'Custom API Rate Limits',
        'White Label Option',
      ],
    },
  };

  return plans[planName] || null;
}

/**
 * Format payment status badge
 */
function getPaymentStatusBadge(status) {
  const statusMap = {
    pending: { label: 'Pending', color: 'warning', icon: 'clock' },
    completed: { label: 'Completed', color: 'success', icon: 'check-circle' },
    failed: { label: 'Failed', color: 'danger', icon: 'x-circle' },
    refunded: { label: 'Refunded', color: 'info', icon: 'undo' },
  };

  return statusMap[status] || { label: status, color: 'secondary', icon: 'question-circle' };
}

module.exports = {
  formatCurrency,
  toPaise,
  fromPaise,
  generateInvoiceNumber,
  generateReceipt,
  calculateRenewalDate,
  validatePaymentAmount,
  createPaymentMetadata,
  parseRazorpayError,
  calculatePaymentFees,
  getPlanPricing,
  getPaymentStatusBadge,
};
