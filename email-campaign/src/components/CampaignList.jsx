import Badge from './ui/Badge'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'
import DeliveryLogsPanel from './DeliveryLogsPanel'
import { SkeletonCard } from './ui/Skeleton'

function formatDate(dt) {
  if (!dt) return null
  return new Date(dt).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  })
}

export default function CampaignList({
  campaigns, isAdmin, loading,
  onDelete, onEdit, onExecute, onSchedule, onViewLogs,
  executingId, logsMap, selectedLogsId, onCloseLogs,
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon="◈"
        title="No campaigns yet"
        description="Create your first campaign to start sending emails to your recipients."
      />
    )
  }

  return (
    <div className="space-y-4 stagger">
      {campaigns.map((campaign, i) => (
        <div key={campaign.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
          <div className="bg-card border border-border rounded-2xl shadow-card hover:border-accent/20 hover:shadow-card-hover transition-all duration-200">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-slate-100 text-base truncate">
                    {campaign.campaignName}
                  </h3>
                  <p className="text-sm text-secondary mt-0.5 truncate">{campaign.subjectLine}</p>
                </div>
                <Badge status={campaign.status} />
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted mb-4">
                {campaign.scheduledTime && (
                  <span className="flex items-center gap-1">
                    <span>◷</span> {formatDate(campaign.scheduledTime)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span>⬡</span> ID #{campaign.id}
                </span>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onSchedule(campaign.id)}
                    icon={<span>◷</span>}
                  >
                    Schedule
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    loading={executingId === campaign.id}
                    onClick={() => onExecute(campaign.id)}
                    icon={<span>▶</span>}
                  >
                    Execute
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(campaign)}
                    icon={
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      selectedLogsId === campaign.id ? onCloseLogs() : onViewLogs(campaign.id)
                    }
                    icon={<span>≡</span>}
                  >
                    {selectedLogsId === campaign.id ? 'Hide Logs' : 'Logs'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(campaign.id)}
                    icon={
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Delivery Logs Panel */}
            {selectedLogsId === campaign.id && (
              <div className="border-t border-border px-5 pb-5 pt-4">
                <DeliveryLogsPanel
                  logs={logsMap[campaign.id] || []}
                  campaignName={campaign.campaignName}
                  onClose={onCloseLogs}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
