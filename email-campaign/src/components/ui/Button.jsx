const variants = {
  primary:   'bg-accent text-base hover:bg-accent-dim shadow-glow-sm hover:shadow-glow',
  secondary: 'bg-card border border-border text-slate-200 hover:bg-hover hover:border-accent/40',
  danger:    'bg-danger/10 border border-danger/40 text-danger hover:bg-danger/20',
  success:   'bg-success/10 border border-success/40 text-success hover:bg-success/20',
  warning:   'bg-warning/10 border border-warning/40 text-warning hover:bg-warning/20',
  ghost:     'text-secondary hover:text-slate-200 hover:bg-hover',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-2.5 text-base rounded-xl gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
