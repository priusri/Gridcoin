export default function Badge({ children, variant = 'confirmed' }) {
  return (
    <span className={`badge ${variant}`}>
      {(variant === 'confirmed' || variant === 'live') && (
        <span className="live-dot" style={{ width: 6, height: 6 }} />
      )}
      {variant === 'pending' && (
        <span className="live-dot yellow" style={{ width: 6, height: 6 }} />
      )}
      {variant === 'failed' && (
        <span className="live-dot red" style={{ width: 6, height: 6 }} />
      )}
      {children}
    </span>
  )
}
