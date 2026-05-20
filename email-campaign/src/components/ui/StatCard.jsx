import Skeleton from './Skeleton'

export default function StatCard({ label, value, icon, color = 'accent', loading = false, sub }) {
  const colorMap = {
    accent:  { text: 'text-accent',   bg: 'bg-accent/10',   border: 'border-accent/20' },
    success: { text: 'text-success',  bg: 'bg-success/10',  border: 'border-success/20' },
    warning: { text: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/20' },
    danger:  { text: 'text-danger',   bg: 'bg-danger/10',   border: 'border-danger/20' },
  }
  const c = colorMap[color]

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
          <span className={`text-xl ${c.text}`}>{icon}</span>
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </>
      ) : (
        <>
          <p className="text-3xl font-display font-bold text-slate-100 mb-1">{value ?? '—'}</p>
          <p className="text-sm text-secondary">{label}</p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </>
      )}
    </div>
  )
}
