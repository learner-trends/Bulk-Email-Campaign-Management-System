import { useState } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'

export default function CampaignForm({ onSubmit, editingCampaign, onCancel, loading }) {
  const [form, setForm] = useState({
    campaignName:  editingCampaign?.campaignName  || '',
    subjectLine:   editingCampaign?.subjectLine   || '',
    emailContent:  editingCampaign?.emailContent  || '',
    scheduledTime: editingCampaign?.scheduledTime || '',
  })

  const [errors, setErrors] = useState({})

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((e2) => ({ ...e2, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.campaignName.trim())  e.campaignName  = 'Campaign name is required'
    if (!form.subjectLine.trim())   e.subjectLine   = 'Subject line is required'
    if (!form.emailContent.trim())  e.emailContent  = 'Email content is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSubmit(form)
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-slate-100 text-lg">
            {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {editingCampaign ? `Editing: ${editingCampaign.campaignName}` : 'Fill in the details below'}
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-muted hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-hover">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Campaign Name"
            placeholder="e.g. Summer Sale 2025"
            value={form.campaignName}
            onChange={set('campaignName')}
            error={errors.campaignName}
          />
          <Input
            label="Subject Line"
            placeholder="e.g. Exclusive offer just for you!"
            value={form.subjectLine}
            onChange={set('subjectLine')}
            error={errors.subjectLine}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">Email Content</label>
          <textarea
            rows={6}
            placeholder="Write your email content here. HTML is supported."
            value={form.emailContent}
            onChange={set('emailContent')}
            className={`
              w-full bg-surface border rounded-xl px-4 py-3 text-sm text-slate-200
              placeholder:text-muted resize-y
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
              transition-all duration-200
              ${errors.emailContent ? 'border-danger' : 'border-border'}
            `}
          />
          {errors.emailContent && <p className="text-xs text-danger">{errors.emailContent}</p>}
          <p className="text-xs text-muted">You can use HTML tags. The content will be rendered in the email client.</p>
        </div>

        <Input
          label="Scheduled Time (optional)"
          type="datetime-local"
          value={form.scheduledTime}
          onChange={set('scheduledTime')}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={loading} className="min-w-[140px]">
            {editingCampaign ? 'Save Changes' : 'Create Campaign'}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
