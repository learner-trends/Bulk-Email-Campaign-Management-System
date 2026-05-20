export default function Card({ children, className = '', hover = false, accent = false }) {
  return (
    <div
      className={`
        bg-card border border-border rounded-2xl shadow-card
        ${hover ? 'transition-all duration-200 hover:border-accent/40 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${accent ? 'border-l-2 border-l-accent' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
