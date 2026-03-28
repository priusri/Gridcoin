import React, { useState, useEffect } from 'react';
import usePayment from '../../hooks/usePayment';
import './Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { getInvoices, error } = usePayment();

  useEffect(() => {
    fetchInvoices();
  }, [getInvoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await getInvoices(null, 1, 50);
      setInvoices(response.data);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="invoices-container">
      <h2>Invoices</h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : invoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices found</p>
        </div>
      ) : (
        <div className="invoices-list">
          {invoices.map((invoice) => (
            <div key={invoice._id} className="invoice-card">
              <div className="invoice-header">
                <h3>{invoice.invoiceNumber}</h3>
                <span className={`status-badge badge-${invoice.status}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>

              <div className="invoice-details">
                <p>
                  <strong>Amount:</strong> {formatAmount(invoice.totalAmount)}
                </p>
                <p>
                  <strong>Issued:</strong> {formatDate(invoice.issueDate)}
                </p>
                <p>
                  <strong>For:</strong> {invoice.description}
                </p>
              </div>

              <div className="invoice-actions">
                <button
                  onClick={() => setSelectedInvoice(invoice)}
                  className="btn-view"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

const InvoiceModal = ({ invoice, onClose }) => {
  const formatAmount = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="btn-close" onClick={onClose}>
          ×
        </button>

        <div className="invoice-view">
          <h2>Invoice {invoice.invoiceNumber}</h2>

          <div className="invoice-grid">
            <div className="grid-item">
              <strong>Amount</strong>
              <p>{formatAmount(invoice.totalAmount)}</p>
            </div>
            <div className="grid-item">
              <strong>Issue Date</strong>
              <p>{formatDate(invoice.issueDate)}</p>
            </div>
            <div className="grid-item">
              <strong>Due Date</strong>
              <p>
                {invoice.dueDate
                  ? formatDate(invoice.dueDate)
                  : 'No due date'}
              </p>
            </div>
            <div className="grid-item">
              <strong>Status</strong>
              <p>{invoice.status.toUpperCase()}</p>
            </div>
          </div>

          <div className="invoice-summary">
            <h3>Summary</h3>
            <div className="summary-item">
              <span>Description:</span>
              <span>{invoice.description}</span>
            </div>
            <div className="summary-item">
              <span>Stripe ID:</span>
              <span className="code">{invoice.stripeInvoiceId}</span>
            </div>
            {invoice.paidAt && (
              <div className="summary-item">
                <span>Paid At:</span>
                <span>{formatDate(invoice.paidAt)}</span>
              </div>
            )}
          </div>

          {invoice.notes && (
            <div className="invoice-notes">
              <strong>Notes:</strong>
              <p>{invoice.notes}</p>
            </div>
          )}

          <div className="invoice-footer">
            <p className="help-text">
              Manage your invoices from the Stripe billing portal for additional options like downloading PDFs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
