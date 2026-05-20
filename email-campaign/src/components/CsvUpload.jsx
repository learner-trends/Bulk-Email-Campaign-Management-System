import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import Button from './ui/Button'
import { uploadCsv } from '../services/recipientService'

export default function CsvUpload({ onSuccess }) {
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith('.csv')) {
      toast.error('Only .csv files are accepted')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Please select a CSV file'); return }
    setLoading(true)
    try {
      const res = await uploadCsv(file)
      const result = res.data.data
      const msg = result
        ? `Imported ${result.successCount ?? 0} recipients${result.failedCount ? `, ${result.failedCount} skipped` : ''}`
        : res.data.message || 'Upload successful'
      toast.success(msg)
      setFile(null)
      onSuccess?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card animate-fade-up">
      <h3 className="font-display font-bold text-slate-200 mb-1">Import Recipients</h3>
      <p className="text-xs text-muted mb-4">Upload a CSV with columns: <code className="bg-surface px-1.5 py-0.5 rounded text-accent">name, email</code></p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-accent bg-accent/5'
            : file
              ? 'border-success/40 bg-success/5'
              : 'border-border hover:border-accent/40 hover:bg-hover'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center">
              <span className="text-success text-lg">✓</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-200">{file.name}</p>
              <p className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
              className="ml-2 text-muted hover:text-danger transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        ) : (
          <div>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <p className="text-sm text-secondary">
              <span className="text-accent font-medium">Click to browse</span> or drag and drop
            </p>
            <p className="text-xs text-muted mt-1">CSV files only · max 10MB</p>
          </div>
        )}
      </div>

      {file && (
        <Button
          className="w-full mt-3"
          onClick={handleUpload}
          loading={loading}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          }
        >
          Upload CSV
        </Button>
      )}
    </div>
  )
}
