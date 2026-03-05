export default function GlowButton({
  children,
  onClick,
  variant = 'cyan',
  size = 'md',
  disabled = false,
  type = 'button',
  fullWidth = false,
  style = {},
}) {
  const sizeMap = {
    sm: { padding: '6px 14px', fontSize: '0.68rem' },
    md: { padding: '10px 20px', fontSize: '0.75rem' },
    lg: { padding: '13px 28px', fontSize: '0.82rem' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glow-btn ${variant}`}
      style={{
        ...sizeMap[size],
        width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
