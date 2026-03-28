import React, { useState, useEffect } from 'react';
import usePayment from '../../hooks/usePayment';

const PaymentGateway = ({ amount, type = 'transaction', energyListingId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const { createCheckoutSession, redirectToCheckout, error } = usePayment();
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  // Initialize Stripe.js script
  useEffect(() => {
    // Load Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const sessionData = await createCheckoutSession(amount, type, {
        energyListingId,
        paymentMethod: 'card',
        description: `Payment for ${type}`,
      });

      if (!sessionData || !sessionData.sessionId) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      const result = await redirectToCheckout(sessionData.sessionId);
      
      if (result.error) {
        onError?.(result.error.message);
      }
    } catch (err) {
      console.error('Payment initiation failed:', err);
      onError?.(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-gateway">
      <div className="payment-form">
        <h2>Complete Payment</h2>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="payment-summary">
          <p>Amount to Pay: <strong>${(amount / 100).toFixed(2)}</strong></p>
          <p className="text-muted">USD</p>
        </div>

        <div className="payment-info">
          <p className="small text-muted">
            You will be redirected to Stripe to complete your payment securely.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !stripePublicKey}
          className="btn btn-primary btn-block"
        >
          {loading ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
        </button>

        {!stripePublicKey && (
          <p className="alert alert-warning small mt-3">
            Stripe public key not configured. Please check your environment variables.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
