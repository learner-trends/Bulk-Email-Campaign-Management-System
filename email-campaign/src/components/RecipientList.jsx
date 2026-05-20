import Badge from './ui/Badge'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'
import { SkeletonCard } from './ui/Skeleton'

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-IN', { dateStyle: 'medium' })
}

export default function RecipientList({ recipients, isAdmin, loading, onDelete, onUnsubscribe, onResubscribe }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="skeleton h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-1/3 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (recipients.length === 0) {
    return (
      <EmptyState
        icon="◎"
        title="No recipients found"
        description="Upload a CSV file to import recipients, or adjust your search filters."
      />
    )
  }

  return (
    <div className="space-y-3 stagger">
      {recipients.map((r, i) => {
        const initials = r.name
          ? r.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : r.email.substring(0, 2).toUpperCase()

        return (
          <div
            key={r.id}
            className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-accent/20 transition-all duration-200 animate-fade-up"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            {/* Avatar */}
            <div className={`
              w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              ${r.subscriptionStatus === 'SUBSCRIBED'
                ? 'bg-success/10 border border-success/30 text-success'
                : 'bg-surface border border-border text-muted'
              }
            `}>
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{r.name || '—'}</p>
              <p className="text-xs text-secondary truncate">{r.email}</p>
            </div>

            {/* Date */}
            <span className="text-xs text-muted hidden md:block flex-shrink-0">
              {formatDate(r.createdAt)}
            </span>

            {/* Status */}
            <Badge status={r.subscriptionStatus} />

            {/* Actions */}
            {isAdmin && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.subscriptionStatus === 'SUBSCRIBED' ? (
                  <Button size="sm" variant="warning" onClick={() => onUnsubscribe(r.id)}>
                    Unsub
                  </Button>
                ) : (
                  <Button size="sm" variant="success" onClick={() => onResubscribe(r.id)}>
                    Resub
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(r.id)}
                  icon={
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
