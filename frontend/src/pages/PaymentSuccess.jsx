import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Home, Eye } from 'lucide-react'
import { usePayment } from '../hooks/usePayment'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState(null)
  const { verifyPayment } = usePayment()

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
        .then(data => {
          setPayment(data)
          setVerified(true)
          setLoading(false)
        })
        .catch(() => {
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
              marginBottom: '16px',
              letterSpacing: '0.05em'
            }}>
              PAYMENT SUCCESSFUL
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Your payment has been processed successfully. Your transaction details have been saved.
            </p>

            {payment && (
              <div style={{
                background: 'rgba(0, 245, 255, 0.05)',
                border: '1px solid rgba(0, 245, 255, 0.12)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '32px',
                textAlign: 'left',
                fontSize: '14px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Amount:</span>
                  <span style={{ color: '#00f5ff', float: 'right', fontWeight: 600 }}>
                    {payment.amount} {payment.currency}
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Status:</span>
                  <span style={{ color: '#00ff88', float: 'right', fontWeight: 600 }}>
                    COMPLETED ✓
                  </span>
                </div>
                {payment.stripeSessionId && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Session ID:</span>
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      float: 'right',
                      wordBreak: 'break-all',
                      fontSize: '12px'
                    }}>
                      {payment.stripeSessionId.substring(0, 20)}...
                    </span>
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
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
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  fontSize: '13px'
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
                <Eye size={16} /> VIEW DETAILS
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '12px 16px',
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
                  fontSize: '13px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'none'
                }}
              >
                <Home size={16} /> DASHBOARD
              </button>
            </div>
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
              color: 'white',
              marginBottom: '8px'
            }}>
              VERIFICATION FAILED
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              marginBottom: '32px'
            }}>
              We couldn't verify your payment. Please contact support.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ff0080, #ff8c00)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
              }}
            >
              RETURN TO MARKETPLACE
            </button>
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
