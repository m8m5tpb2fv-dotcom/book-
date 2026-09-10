interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-14 gap-3">
      {icon && <div className="text-muted mb-1">{icon}</div>}
      <p className="font-display font-extrabold text-lg tracking-tight">{title}</p>
      {description && <p className="text-sm text-muted max-w-[26ch] text-balance">{description}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-3 px-5 py-2.5 rounded-full bg-ink text-paper font-semibold text-sm active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
