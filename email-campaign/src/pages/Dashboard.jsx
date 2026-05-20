import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { getAllCampaigns } from '../services/campaignService'
import { getRecipientStats } from '../services/recipientService'
import { useApi } from '../hooks/useApi'
import { useNavigate } from 'react-router-dom'

function PageHeader({ user, isAdmin }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = user?.sub?.split('@')[0] || 'there'

  return (
    <div className="mb-8 animate-fade-up">
      <p className="text-secondary text-sm mb-1">{greeting} 👋</p>
      <h1 className="font-display text-3xl font-bold text-slate-100 mb-1 capitalize">{name}</h1>
      <p className="text-secondary text-sm">
        {isAdmin ? 'You have full admin access.' : "Here's what's happening across your campaigns."}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { run } = useApi()

  const [campaigns, setCampaigns] = useState([])
  const [recipientStats, setRecipientStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [campRes, statsRes] = await Promise.all([
          run(() => getAllCampaigns()),
          run(() => getRecipientStats()),
        ])
        setCampaigns(campRes.data.data || [])
        setRecipientStats(statsRes.data.data || null)
      } catch {
        // errors shown via toast in useApi
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalCampaigns  = campaigns.length
  const completed       = campaigns.filter(c => c.status === 'COMPLETED').length
  const scheduled       = campaigns.filter(c => c.status === 'SCHEDULED').length
  const failed          = campaigns.filter(c => c.status === 'FAILED').length
  const deliveryRate    = totalCampaigns > 0
    ? Math.round((completed / totalCampaigns) * 100)
    : 0

  const recent = [...campaigns]
    .sort((a, b) => new Date(b.scheduledTime || 0) - new Date(a.scheduledTime || 0))
    .slice(0, 5)

  return (
    <Layout>
      <PageHeader user={user} isAdmin={isAdmin} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard
          label="Total Campaigns"
          value={totalCampaigns}
          icon="◈"
          color="accent"
          loading={loading}
        />
        <StatCard
          label="Recipients"
          value={recipientStats?.total ?? '—'}
          icon="◎"
          color="success"
          loading={loading}
          sub={recipientStats ? `${recipientStats.subscribed} subscribed` : undefined}
        />
        <StatCard
          label="Delivery Rate"
          value={loading ? undefined : `${deliveryRate}%`}
          icon="⬡"
          color="warning"
          loading={loading}
          sub={`${completed} completed`}
        />
        <StatCard
          label="Scheduled"
          value={scheduled}
          icon="◷"
          color="danger"
          loading={loading}
          sub={failed > 0 ? `${failed} failed` : 'No failures'}
        />
      </div>

      {/* Campaign status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-slate-200 text-lg">Recent Campaigns</h2>
            <button
              onClick={() => navigate('/campaigns')}
              className="text-xs text-accent hover:underline"
            >
              View all →
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            {loading ? (
              <div className="divide-y divide-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-5 w-20 rounded-full ml-auto" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-12 text-center text-secondary text-sm">
                <p className="text-3xl mb-2 opacity-30">◈</p>
                No campaigns yet.{' '}
                <button onClick={() => navigate('/campaigns')} className="text-accent hover:underline">
                  Create one →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-hover transition-colors duration-150 animate-slide-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{c.campaignName}</p>
                      <p className="text-xs text-muted truncate mt-0.5">{c.subjectLine}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {c.scheduledTime && (
                        <span className="text-xs text-muted hidden sm:block">
                          {new Date(c.scheduledTime).toLocaleDateString()}
                        </span>
                      )}
                      <Badge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div>
          <h2 className="font-display font-bold text-slate-200 text-lg mb-4">Status Breakdown</h2>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            {[
              { label: 'Completed', status: 'COMPLETED', color: 'bg-success', count: completed },
              { label: 'Scheduled', status: 'SCHEDULED', color: 'bg-warning', count: scheduled },
              { label: 'Failed',    status: 'FAILED',    color: 'bg-danger',  count: failed },
              { label: 'Draft',     status: 'DRAFT',     color: 'bg-muted',
                count: campaigns.filter(c => c.status === 'DRAFT').length },
            ].map(({ label, color, count }) => {
              const pct = totalCampaigns > 0 ? Math.round((count / totalCampaigns) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-secondary">{label}</span>
                    <span className="text-slate-300 font-medium">{loading ? '—' : count}</span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: loading ? '0%' : `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}

            {/* Subscriber ratio */}
            {recipientStats && (
              <div className="pt-2 border-t border-border mt-2">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-secondary">Subscriber ratio</span>
                  <span className="text-slate-300 font-medium">
                    {recipientStats.total > 0
                      ? `${Math.round((recipientStats.subscribed / recipientStats.total) * 100)}%`
                      : '—'}
                  </span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{
                      width: recipientStats.total > 0
                        ? `${Math.round((recipientStats.subscribed / recipientStats.total) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
