import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import CampaignForm from '../components/CampaignForm'
import CampaignList from '../components/CampaignList'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import {
  getAllCampaigns, createCampaign, updateCampaign,
  deleteCampaign, scheduleCampaign, executeCampaign, getDeliveryLogs,
} from '../services/campaignService'

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SCHEDULED', 'EXECUTING', 'COMPLETED', 'FAILED']

export default function Campaigns() {
  const { isAdmin } = useAuth()
  const { run } = useApi()

  const [campaigns, setCampaigns]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editingCampaign, setEditing]   = useState(null)
  const [formLoading, setFormLoading]   = useState(false)
  const [executingId, setExecutingId]   = useState(null)
  const [logsMap, setLogsMap]           = useState({})     // { [campaignId]: logs[] }
  const [selectedLogsId, setSelectedLogsId] = useState(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await run(() => getAllCampaigns())
      setCampaigns(res.data.data || [])
    } catch {
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

  const filtered = useMemo(() => {
    let list = campaigns
    if (statusFilter !== 'ALL') list = list.filter(c => c.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.campaignName.toLowerCase().includes(q) ||
        c.subjectLine?.toLowerCase().includes(q)
      )
    }
    return list
  }, [campaigns, statusFilter, search])

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingCampaign) {
        const res = await run(() => updateCampaign(editingCampaign.id, formData))
        toast.success(res.data.message || 'Campaign updated')
      } else {
        const res = await run(() => createCampaign(formData))
        toast.success(res.data.message || 'Campaign created')
      }
      setShowForm(false)
      setEditing(null)
      fetchCampaigns()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save campaign')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return
    try {
      await run(() => deleteCampaign(id))
      toast.success('Campaign deleted')
      setCampaigns(prev => prev.filter(c => c.id !== id))
      if (selectedLogsId === id) setSelectedLogsId(null)
    } catch {
      toast.error('Failed to delete campaign')
    }
  }

  const handleSchedule = async (id) => {
    try {
      const res = await run(() => scheduleCampaign(id))
      toast.success(res.data.message || 'Campaign scheduled')
      fetchCampaigns()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to schedule')
    }
  }

  const handleExecute = async (id) => {
    setExecutingId(id)
    try {
      const res = await run(() => executeCampaign(id))
      toast.success(res.data.message || 'Execution triggered')
      fetchCampaigns()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to execute')
    } finally {
      setExecutingId(null)
    }
  }

  const handleViewLogs = async (id) => {
    try {
      const res = await run(() => getDeliveryLogs(id))
      setLogsMap(prev => ({ ...prev, [id]: res.data.data || [] }))
      setSelectedLogsId(id)
    } catch {
      toast.error('Failed to load delivery logs')
    }
  }

  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit   = (campaign) => { setEditing(campaign); setShowForm(true) }
  const closeForm  = () => { setShowForm(false); setEditing(null) }

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Campaigns</h1>
          <p className="text-secondary text-sm mt-0.5">
            {loading ? '…' : `${campaigns.length} total · ${filtered.length} shown`}
          </p>
        </div>
        {isAdmin && !showForm && (
          <Button onClick={openCreate} icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
          }>
            New Campaign
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-6">
          <CampaignForm
            editingCampaign={editingCampaign}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            loading={formLoading}
          />
        </div>
      )}

      {/* Search + Filter Bar */}
      {!loading && campaigns.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5 animate-fade-up">
          <div className="flex-1">
            <Input
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              }
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`
                  px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150
                  ${statusFilter === s
                    ? 'bg-accent/10 text-accent border-accent/30'
                    : 'bg-card border-border text-secondary hover:border-accent/20 hover:text-slate-300'
                  }
                `}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campaign List */}
      <CampaignList
        campaigns={filtered}
        isAdmin={isAdmin}
        loading={loading}
        onDelete={handleDelete}
        onEdit={openEdit}
        onExecute={handleExecute}
        onSchedule={handleSchedule}
        onViewLogs={handleViewLogs}
        onCloseLogs={() => setSelectedLogsId(null)}
        executingId={executingId}
        logsMap={logsMap}
        selectedLogsId={selectedLogsId}
      />
    </Layout>
  )
}
