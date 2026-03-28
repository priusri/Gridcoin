import React, { useState, useEffect } from 'react';
import usePayment from '../../hooks/usePayment';
import './BillingPortal.css';

const BillingPortal = ({ onError }) => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const { getActiveSubscription, getBillingPortal, error } = usePayment();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const subData = await getActiveSubscription();
        setSubscription(subData);
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
        onError?.(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [getActiveSubscription, onError]);

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      const portalData = await getBillingPortal();

      if (portalData && portalData.url) {
        window.location.href = portalData.url;
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <div className="billing-portal">
        <div className="no-subscription">
          <h3>No Active Subscription</h3>
          <p>You currently don't have an active subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-portal">
      <div className="portal-header">
        <h2>Billing & Subscription</h2>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="subscription-details">
        <div className="detail-card">
          <h3>Current Plan</h3>
          <div className="detail-content">
            <p className="plan-name">{subscription.plan}</p>
            <p className="plan-amount">
              ${(subscription.amount / 100).toFixed(2)} / {subscription.billingPeriod}
            </p>
            <div className="status-badge">
              <span className={`badge badge-${subscription.status}`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3>Billing Period</h3>
          <div className="detail-content">
            <p>
              <strong>Current Period:</strong>
              <br />
              {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="detail-card">
          <h3>Plan Features</h3>
          <div className="detail-content">
            <ul className="features-list">
              {subscription.features && subscription.features.map((feature, index) => (
                <li key={index}>
                  <span className="checkmark">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="portal-actions">
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Loading...' : 'Manage Billing & Payment Methods'}
        </button>
        <p className="help-text">
          Click above to access Stripe's billing portal where you can update payment methods,
          download invoices, view billing history, and manage your subscription.
        </p>
      </div>
    </div>
  );
};

export default BillingPortal;
