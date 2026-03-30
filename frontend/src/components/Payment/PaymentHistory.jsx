import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePayment from '../../hooks/usePayment';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { getPaymentHistory, error } = usePayment();

  useEffect(() => {
    fetchPayments();
  }, [filter, currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getPaymentHistory(
        filter !== 'all' ? filter : null,
        currentPage,
        10
      );
      setPayments(response.data);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (paymentId) => {
    navigate(`/payment/${paymentId}`);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-danger',
      refunded: 'badge-info',
    };

    return (
      <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="payment-history">
      <h2>Payment History</h2>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="filter-section">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="all">All Payments</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <p>No payments found</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="session-id">
                      {payment.stripeSessionId.substring(0, 20)}...
                    </td>
                    <td>{formatAmount(payment.amount)}</td>
                    <td>{payment.type}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(payment._id)}
                        className="btn-view"
                        disabled={loading}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-pagination"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-pagination"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistory;
