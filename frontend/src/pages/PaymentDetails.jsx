import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Download, RefreshCw } from 'lucide-react';
import usePayment from '../hooks/usePayment';
import '../components/Payment/PaymentHistory.css';

export default function PaymentDetails() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const { getPaymentDetails, downloadInvoice } = usePayment();

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await getPaymentDetails(paymentId);
      setPayment(details);
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
      setError(err.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-danger',
      refunded: 'badge-info',
    };

    const statusColors = {
      completed: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444',
      refunded: '#3b82f6',
    };

    return (
      <span 
        className={`badge ${statusClasses[status] || 'badge-secondary'}`}
        style={{
          display: 'inline-block',
          padding: '6px 12px',
          borderRadius: '6px',
          backgroundColor: `${statusColors[status] || '#6b7280'}20`,
          color: statusColors[status] || '#6b7280',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    return `${currencySymbol}${(numAmount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-muted)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--accent-red)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '16px' }}>❌ {error}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-muted)',
      }}>
        <p>Payment not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }} className="page-enter">
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-blue)',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
          }}
        >
          <ArrowLeft size={20} /> Back to Payments
        </button>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '16px',
            color: 'var(--text-primary)',
          }}>
            Payment Details
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {formatDate(payment.createdAt)}
            </p>
            {getStatusBadge(payment.status)}
          </div>
        </div>

        {/* Amount Section */}
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          backgroundImage: 'linear-gradient(135deg, var(--accent-blue)20, var(--accent-cyan)20)',
          border: '1px solid var(--accent-blue)44',
          marginBottom: '32px',
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>
            Amount
          </p>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--accent-blue)',
            margin: 0,
          }}>
            {formatAmount(payment.amount, payment.currency)}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.85rem' }}>
            Currency: {payment.currency || 'USD'}
          </p>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Transaction Info */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}>
              Transaction Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DetailRow
                label="Session ID"
                value={payment.stripeSessionId}
                copyable
                onCopy={() => copyToClipboard(payment.stripeSessionId, 'sessionId')}
                copied={copied === 'sessionId'}
              />
              <DetailRow
                label="Payment Intent ID"
                value={payment.stripePaymentIntentId || 'N/A'}
                copyable={!!payment.stripePaymentIntentId}
                onCopy={() => payment.stripePaymentIntentId && copyToClipboard(payment.stripePaymentIntentId, 'paymentIntentId')}
                copied={copied === 'paymentIntentId'}
              />
              <DetailRow
                label="Type"
                value={payment.type ? payment.type.charAt(0).toUpperCase() + payment.type.slice(1) : 'N/A'}
              />
              <DetailRow
                label="Payment Method"
                value={payment.paymentMethod ? payment.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A'}
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '16px',
            }}>
              Dates
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <DetailRow
                label="Created"
                value={formatDate(payment.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatDate(payment.updatedAt)}
              />
              {payment.status === 'refunded' && (
                <DetailRow
                  label="Refunded"
                  value={formatDate(payment.refundedAt) || 'N/A'}
                />
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-secondary)',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}>
            Additional Information
          </h3>
          {payment.description && (
            <DetailRow
              label="Description"
              value={payment.description}
            />
          )}
          {payment.energyListing && (
            <DetailRow
              label="Energy Listing ID"
              value={payment.energyListing._id || payment.energyListing}
              copyable
              onCopy={() => copyToClipboard(payment.energyListing._id || payment.energyListing, 'energyListingId')}
              copied={copied === 'energyListingId'}
            />
          )}
          {payment.notes && (
            <DetailRow
              label="Notes"
              value={payment.notes}
            />
          )}
        </div>

        {/* Invoice Section */}
        {payment.invoice && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--accent-green)44',
            backgroundColor: 'var(--accent-green)10',
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '12px',
            }}>
              Invoice
            </h3>
            <DetailRow
              label="Invoice Number"
              value={payment.invoice.invoiceNumber || payment.invoice._id}
              copyable
              onCopy={() => copyToClipboard(payment.invoice.invoiceNumber || payment.invoice._id, 'invoiceId')}
              copied={copied === 'invoiceId'}
            />
            <DetailRow
              label="Invoice Status"
              value={payment.invoice.status ? payment.invoice.status.toUpperCase() : 'N/A'}
            />
            {payment.invoice.invoiceNumber && (
              <button
                onClick={() => downloadInvoice(payment.invoice._id)}
                style={{
                  marginTop: '12px',
                  padding: '10px 16px',
                  backgroundColor: 'var(--accent-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <Download size={16} /> Download Invoice
              </button>
            )}
          </div>
        )}

        {/* Metadata */}
        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '12px',
            }}>
              Metadata
            </h3>
            {Object.entries(payment.metadata).map(([key, value]) => (
              <DetailRow
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={String(value)}
                copyable={typeof value === 'string'}
                onCopy={() => copyToClipboard(String(value), key)}
                copied={copied === key}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for detail rows
function DetailRow({ label, value, copyable, onCopy, copied }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '12px',
      borderBottom: '1px solid var(--bg-secondary)',
    }}>
      <label style={{
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        fontWeight: 500,
        minWidth: '120px',
      }}>
        {label}:
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        justifyContent: 'flex-end',
      }}>
        <span style={{
          color: 'var(--text-primary)',
          wordBreak: 'break-all',
          fontFamily: value && value.length > 20 ? 'monospace' : 'inherit',
          fontSize: value && value.length > 20 ? '0.85rem' : '0.9rem',
        }}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={onCopy}
            style={{
              background: 'none',
              border: 'none',
              color: copied ? 'var(--accent-green)' : 'var(--accent-blue)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
