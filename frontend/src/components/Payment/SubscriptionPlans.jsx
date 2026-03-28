import React, { useState, useEffect } from 'react';
import usePayment from '../../hooks/usePayment';
import './SubscriptionPlans.css';

const SubscriptionPlans = ({ onSuccess, onError }) => {
  const [plans] = useState([
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 4.99,
      yearlyPrice: 49.90,
      features: [
        'Up to 50 Energy Listings',
        'Up to 100 Transactions/month',
        'Basic Analytics Dashboard',
        'Email Support',
      ],
      recommended: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 9.99,
      yearlyPrice: 99.90,
      features: [
        'Up to 500 Energy Listings',
        'Up to 1000 Transactions/month',
        'Advanced Analytics',
        'Priority Support',
        'API Access',
      ],
      recommended: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 49.99,
      yearlyPrice: 499.90,
      features: [
        'Unlimited Listings & Transactions',
        'Custom Analytics',
        'Dedicated Support',
        'Custom API Rate Limits',
        'White Label Option',
      ],
      recommended: false,
    },
  ]);

  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { createSubscription, redirectToCheckout, error } = usePayment();

  const subscribeToPlan = async (planId) => {
    try {
      setLoading(true);

      // Create subscription
      const subscriptionData = await createSubscription(
        planId,
        billingPeriod
      );

      if (!subscriptionData || !subscriptionData.sessionId) {
        throw new Error('Failed to create subscription');
      }

      // Redirect to Stripe checkout
      const result = await redirectToCheckout(subscriptionData.sessionId);
      
      if (result?.error) {
        onError?.(result.error.message);
      } else {
        onSuccess?.(subscriptionData);
      }
    } catch (err) {
      console.error('Subscription creation failed:', err);
      onError?.(err.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <h2>Choose Your Plan</h2>
        <p className="subtitle">Select a plan to get started with Gridcoin Energy Trading</p>
        <div className="billing-toggle">
          <button
            className={`toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`toggle-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly (Save 15%)
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="plans-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.recommended ? 'recommended' : ''}`}
          >
            {plan.recommended && <div className="recommended-badge">Recommended</div>}

            <h3>{plan.name}</h3>

            <div className="price">
              <span className="currency">$</span>
              <span className="amount">
                {billingPeriod === 'monthly' ? plan.monthlyPrice.toFixed(2) : plan.yearlyPrice.toFixed(2)}
              </span>
              <span className="period">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
            </div>

            <ul className="features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <span className="checkmark">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => subscribeToPlan(plan.id)}
              className={`subscribe-btn ${plan.recommended ? 'primary' : 'secondary'}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      <div className="plans-footer">
        <p className="text-muted">
          All plans include 14-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
