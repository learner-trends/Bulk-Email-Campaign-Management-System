import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import RecipientList from '../components/RecipientList'
import CsvUpload from '../components/CsvUpload'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import {
  getAllRecipients, getRecipientStats,
  deleteRecipient, unsubscribeRecipient, resubscribeRecipient,
} from '../services/recipientService'

export default function Recipients() {
  const { isAdmin } = useAuth()
  const { run } = useApi()

  const [recipients, setRecipients] = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch]         = useState('')
  const [subFilter, setSubFilter]   = useState('ALL') // ALL | SUBSCRIBED | UNSUBSCRIBED

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [rRes, sRes] = await Promise.all([
        run(() => getAllRecipients()),
        run(() => getRecipientStats()),
      ])
      setRecipients(rRes.data.data || [])
      setStats(sRes.data.data || null)
    } catch {
      toast.error('Failed to load recipients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = useMemo(() => {
    let list = recipients
    if (subFilter !== 'ALL') list = list.filter(r => r.subscriptionStatus === subFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.email.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q)
      )
    }
    return list
  }, [recipients, subFilter, search])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipient?')) return
    try {
      await run(() => deleteRecipient(id))
      toast.success('Recipient deleted')
      setRecipients(prev => prev.filter(r => r.id !== id))
    } catch {
      toast.error('Failed to delete recipient')
    }
  }

  const handleUnsubscribe = async (id) => {
    try {
      const res = await run(() => unsubscribeRecipient(id))
      toast.success(res.data.message || 'Unsubscribed')
      setRecipients(prev => prev.map(r => r.id === id ? { ...r, subscriptionStatus: 'UNSUBSCRIBED' } : r))
    } catch {
      toast.error('Failed to unsubscribe')
    }
  }

  const handleResubscribe = async (id) => {
    try {
      const res = await run(() => resubscribeRecipient(id))
      toast.success(res.data.message || 'Resubscribed')
      setRecipients(prev => prev.map(r => r.id === id ? { ...r, subscriptionStatus: 'SUBSCRIBED' } : r))
    } catch {
      toast.error('Failed to resubscribe')
    }
  }

  const subscribed   = recipients.filter(r => r.subscriptionStatus === 'SUBSCRIBED').length
  const unsubscribed = recipients.filter(r => r.subscriptionStatus === 'UNSUBSCRIBED').length

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Recipients</h1>
          <p className="text-secondary text-sm mt-0.5">
            {loading ? '…' : `${recipients.length} total · ${subscribed} subscribed · ${unsubscribed} unsubscribed`}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant={showUpload ? 'secondary' : 'primary'}
            onClick={() => setShowUpload(v => !v)}
            icon={
              showUpload
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            }
          >
            {showUpload ? 'Cancel' : 'Import CSV'}
          </Button>
        )}
      </div>

      {/* CSV Upload */}
      {showUpload && isAdmin && (
        <div className="mb-6">
          <CsvUpload onSuccess={() => { setShowUpload(false); fetchAll() }} />
        </div>
      )}

      {/* Stats bar */}
      {!loading && recipients.length > 0 && (
        <div className="bg-card border border-border rounded-2xl px-5 py-4 mb-5 flex flex-wrap gap-6 animate-fade-up">
          <div>
            <p className="text-2xl font-display font-bold text-slate-100">{recipients.length}</p>
            <p className="text-xs text-secondary">Total</p>
          </div>
          <div className="w-px bg-border self-stretch hidden sm:block" />
          <div>
            <p className="text-2xl font-display font-bold text-success">{subscribed}</p>
            <p className="text-xs text-secondary">Subscribed</p>
          </div>
          <div className="w-px bg-border self-stretch hidden sm:block" />
          <div>
            <p className="text-2xl font-display font-bold text-danger">{unsubscribed}</p>
            <p className="text-xs text-secondary">Unsubscribed</p>
          </div>
          <div className="w-px bg-border self-stretch hidden sm:block" />
          <div className="flex-1 min-w-[160px] flex items-center">
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted mb-1.5">
                <span>Subscription rate</span>
                <span className="text-slate-300 font-medium">
                  {recipients.length > 0 ? `${Math.round((subscribed / recipients.length) * 100)}%` : '—'}
                </span>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-700"
                  style={{ width: recipients.length > 0 ? `${(subscribed / recipients.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search + Sub Filter */}
      {!loading && recipients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5 animate-fade-up">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              }
            />
          </div>
          <div className="flex gap-1.5">
            {['ALL', 'SUBSCRIBED', 'UNSUBSCRIBED'].map(f => (
              <button
                key={f}
                onClick={() => setSubFilter(f)}
                className={`
                  px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150
                  ${subFilter === f
                    ? 'bg-accent/10 text-accent border-accent/30'
                    : 'bg-card border-border text-secondary hover:border-accent/20 hover:text-slate-300'
                  }
                `}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <RecipientList
        recipients={filtered}
        isAdmin={isAdmin}
        loading={loading}
        onDelete={handleDelete}
        onUnsubscribe={handleUnsubscribe}
        onResubscribe={handleResubscribe}
      />
    </Layout>
  )
}
