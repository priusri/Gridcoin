import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Home, Eye, Download, AlertCircle } from 'lucide-react'
import { usePayment } from '../hooks/usePayment'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState(null)
  const { verifyPayment } = usePayment()

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
        .then(data => {
          setPayment(data.payment)
          setInvoice(data.invoice)
          setVerified(true)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message || 'Failed to verify payment. Please contact support.')
          setLoading(false)
        })
    }
  }, [sessionId, verifyPayment])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      padding: '20px',
      fontFamily: 'var(--font-heading)'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '2px solid rgba(0, 245, 255, 0.2)',
        borderRadius: '16px',
        padding: '48px 32px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px rgba(0, 245, 255, 0.1)'
      }}>
        {loading ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '4px solid rgba(0, 245, 255, 0.2)',
              borderTop: '4px solid #00f5ff',
              margin: '0 auto 24px',
              animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '8px',
              letterSpacing: '0.05em'
            }}>
              VERIFYING PAYMENT
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px'
            }}>
              Please wait while we confirm your transaction...
            </p>
          </>
        ) : verified ? (
          <>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 24px',
              color: '#00ff88',
              animation: 'scaleIn 0.6s ease'
            }}>
              <CheckCircle size={100} />
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00ff88, #00f5ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              letterSpacing: '0.05em'
            }}>
              PAYMENT SUCCESSFUL ✓
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Your payment has been processed successfully and your invoice has been generated.
            </p>

            {/* Payment Details Card */}
            {payment && (
              <div style={{
                background: 'rgba(0, 245, 255, 0.05)',
                border: '1px solid rgba(0, 245, 255, 0.12)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '13px'
              }}>
                <h3 style={{
                  color: '#00f5ff',
                  marginBottom: '12px',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  💳 Payment Details
                </h3>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Amount:</span>
                  <span style={{ color: '#00f5ff', float: 'right', fontWeight: 700 }}>
                    ${(payment.amount / 100).toFixed(2)} {payment.currency}
                  </span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Status:</span>
                  <span style={{ color: '#00ff88', float: 'right', fontWeight: 600 }}>
                    COMPLETED ✓
                  </span>
                </div>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Date:</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', float: 'right', fontSize: '12px' }}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* Invoice Details Card */}
            {invoice && (
              <div style={{
                background: 'rgba(0, 255, 136, 0.05)',
                border: '1px solid rgba(0, 255, 136, 0.12)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '13px'
              }}>
                <h3 style={{
                  color: '#00ff88',
                  marginBottom: '12px',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  📄 Invoice Details
                </h3>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Invoice #:</span>
                  <span style={{ color: '#00ff88', float: 'right', fontWeight: 600, fontSize: '12px' }}>
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Amount:</span>
                  <span style={{ color: '#00ff88', float: 'right', fontWeight: 600 }}>
                    ${(invoice.totalAmount / 100).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Status:</span>
                  <span style={{ color: '#00ff88', float: 'right', fontWeight: 600 }}>
                    PAID ✓
                  </span>
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '12px'
            }}>
              {invoice && (
                <button
                  onClick={async () => {
                    try {
                      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
                      const token = localStorage.getItem('authToken')
                      
                      const response = await fetch(
                        `${apiUrl}/payments/invoices/${invoice._id}/pdf`,
                        {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        }
                      )
                      
                      if (!response.ok) throw new Error('Failed to download invoice')
                      
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `${invoice.invoiceNumber}.pdf`
                      link.click()
                      window.URL.revokeObjectURL(url)
                    } catch (err) {
                      console.error('Download error:', err)
                      alert('Failed to download invoice')
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '2px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '8px',
                    color: '#00ff88',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 255, 136, 0.15)'
                    e.target.style.borderColor = 'rgba(0, 255, 136, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 255, 136, 0.1)'
                    e.target.style.borderColor = 'rgba(0, 255, 136, 0.3)'
                  }}
                >
                  <Download size={16} /> INVOICE
                </button>
              )}
              <button
                onClick={() => navigate('/marketplace')}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(0, 245, 255, 0.1)',
                  border: '2px solid rgba(0, 245, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#00f5ff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 245, 255, 0.15)'
                  e.target.style.borderColor = 'rgba(0, 245, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 245, 255, 0.1)'
                  e.target.style.borderColor = 'rgba(0, 245, 255, 0.3)'
                }}
              >
                <Eye size={16} /> DETAILS
              </button>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #00ff88, #00f5ff)',
                border: 'none',
                borderRadius: '8px',
                color: '#0f172a',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                width: '100%',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 10px 25px rgba(0, 255, 136, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <Home size={18} /> RETURN TO DASHBOARD
            </button>
          </>
        ) : (
          <>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>⚠️</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ff4444',
              marginBottom: '12px',
              letterSpacing: '0.05em'
            }}>
              VERIFICATION FAILED
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: '1.6',
              padding: '16px',
              background: 'rgba(255, 68, 68, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 68, 68, 0.1)'
            }}>
              {error || 'We couldn\'t verify your payment. Please try again or contact support.'}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                <Home size={16} /> DASHBOARD
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(0, 100, 150, 0.2)',
                  border: '2px solid rgba(0, 150, 200, 0.3)',
                  borderRadius: '8px',
                  color: '#00f5ff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 150, 200, 0.1)'
                  e.target.style.borderColor = 'rgba(0, 150, 200, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 100, 150, 0.2)'
                  e.target.style.borderColor = 'rgba(0, 150, 200, 0.3)'
                }}
              >
                TRY AGAIN
              </button>
            </div>
          </>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
