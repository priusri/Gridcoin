import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for Stripe payment gateway integration
 * Provides methods for creating checkout sessions, verifying payments, and managing subscriptions
 */
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  /**
   * Create a checkout session
   */
  const createCheckoutSession = useCallback(
    async (amount, type = 'transaction', options = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(`${apiUrl}/payments/checkout-session`, {
          amount,
          type,
          energyListingId: options.energyListingId,
          paymentMethod: options.paymentMethod || 'card',
          description: options.description,
          notes: options.notes,
        }, { headers });

        setPayment(response.data.data);
        return response.data.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Redirect to Stripe checkout using the session URL
   */
  const redirectToCheckout = useCallback((sessionIdOrUrl) => {
    // If it's a URL, use it directly
    if (sessionIdOrUrl.includes('http')) {
      window.location.href = sessionIdOrUrl;
      return;
    }
    
    // Otherwise, redirect to Stripe checkout
    const stripeUrl = `https://checkout.stripe.com/pay/${sessionIdOrUrl}`;
    window.location.href = stripeUrl;
  }, []);

  /**
   * Verify payment after checkout
   */
  const verifyPayment = useCallback(
    async (sessionId) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${apiUrl}/payments/verify`,
          { sessionId },
          { headers }
        );

        setPayment(response.data.data);
        return response.data.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Get payment history
   */
  const getPaymentHistory = useCallback(
    async (status = null, page = 1, limit = 10) => {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit };
        if (status) params.status = status;

        const response = await axios.get(`${apiUrl}/payments/history`, {
          params,
          headers,
        });

        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Get payment details
   */
  const getPaymentDetails = useCallback(
    async (paymentId) => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${apiUrl}/payments/${paymentId}`, {
          headers,
        });

        return response.data.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Refund a payment
   */
  const refundPayment = useCallback(
    async (paymentId, amount = null, reason = '') => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${apiUrl}/payments/${paymentId}/refund`,
          {
            amount,
            reason,
          },
          { headers }
        );

        return response.data.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Create subscription
   */
  const createSubscription = useCallback(
    async (planName, billingPeriod = 'month') => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${apiUrl}/payments/subscription/create`,
          {
            planName,
            billingPeriod,
          },
          { headers }
        );

        return response.data.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Get active subscription
   */
  const getActiveSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/payments/subscription/active`, {
        headers,
      });

      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, headers]);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${apiUrl}/payments/subscription/cancel`,
          {},
          { headers }
        );

        return response.data.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Get billing portal URL
   */
  const getBillingPortal = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/payments/billing/portal`, {
        headers,
      });

      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, headers]);

  /**
   * Get invoices
   */
  const getInvoices = useCallback(
    async (status = null, page = 1, limit = 10) => {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit };
        if (status) params.status = status;

        const response = await axios.get(`${apiUrl}/payments/invoices/list`, {
          params,
          headers,
        });

        return response.data;
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, headers]
  );

  /**
   * Get payment statistics
   */
  const getPaymentStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/payments/stats/overview`, {
        headers,
      });

      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, headers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    payment,
    clearError,

    // Methods
    createCheckoutSession,
    redirectToCheckout,
    verifyPayment,
    getPaymentHistory,
    getPaymentDetails,
    refundPayment,
    createSubscription,
    getActiveSubscription,
    cancelSubscription,
    getBillingPortal,
    getInvoices,
    getPaymentStats,
  };
};

export default usePayment;
