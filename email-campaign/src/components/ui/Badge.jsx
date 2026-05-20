const statusMap = {
  DRAFT:      { dot: 'dot-muted',   text: 'text-secondary', bg: 'bg-surface border-border',    label: 'Draft' },
  SCHEDULED:  { dot: 'dot-warning', text: 'text-warning',   bg: 'bg-warning/10 border-warning/30', label: 'Scheduled' },
  EXECUTING:  { dot: 'dot-success', text: 'text-accent',    bg: 'bg-accent/10 border-accent/30',   label: 'Executing' },
  COMPLETED:  { dot: 'dot-success', text: 'text-success',   bg: 'bg-success/10 border-success/30', label: 'Completed' },
  FAILED:     { dot: 'dot-danger',  text: 'text-danger',    bg: 'bg-danger/10 border-danger/30',   label: 'Failed' },
  SUBSCRIBED:   { dot: 'dot-success', text: 'text-success', bg: 'bg-success/10 border-success/30', label: 'Subscribed' },
  UNSUBSCRIBED: { dot: 'dot-danger',  text: 'text-danger',  bg: 'bg-danger/10 border-danger/30',   label: 'Unsubscribed' },
  SENT:   { dot: 'dot-success', text: 'text-success', bg: 'bg-success/10 border-success/30', label: 'Sent' },
  FAILED_DELIVERY: { dot: 'dot-danger', text: 'text-danger', bg: 'bg-danger/10 border-danger/30', label: 'Failed' },
}

export default function Badge({ status, className = '' }) {
  const s = statusMap[status] || { dot: 'dot-muted', text: 'text-secondary', bg: 'bg-surface border-border', label: status }
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
      animate-badge-pop ${s.bg} ${s.text} ${className}
    `}>
      <span className={`dot ${s.dot}`} />
      {s.label}
    </span>
  )
}
