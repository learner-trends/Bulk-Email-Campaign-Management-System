import Badge from './ui/Badge'
import Button from './ui/Button'

export default function DeliveryLogsPanel({ logs, onClose, campaignName }) {
  const sent   = logs.filter(l => l.status === 'SENT').length
  const failed = logs.filter(l => l.status !== 'SENT').length

  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-display font-bold text-slate-200">Delivery Logs</h4>
          <p className="text-xs text-muted mt-0.5 truncate max-w-[240px]">{campaignName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-3 text-xs">
            <span className="text-success font-medium">{sent} sent</span>
            <span className="text-danger font-medium">{failed} failed</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-slate-300 p-1 rounded-lg hover:bg-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-secondary text-sm">
          <p className="text-2xl mb-2 opacity-30">📭</p>
          No delivery logs yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {logs.map((log, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 animate-slide-in"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 font-medium truncate">{log.recipientEmail}</p>
                {log.failureReason && (
                  <p className="text-xs text-danger mt-0.5 truncate">{log.failureReason}</p>
                )}
              </div>
              <Badge status={log.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
