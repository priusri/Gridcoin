export default function LoadingSpinner({ size = 24, color = 'var(--accent-cyan)' }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size, borderTopColor: color }}
    />
  )
}
