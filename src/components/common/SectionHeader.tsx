interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between px-5 mb-3">
      <h2 className="font-display font-extrabold text-xl tracking-tight">{title}</h2>
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-xs font-semibold uppercase tracking-wider text-muted underline underline-offset-4 decoration-line active:opacity-60"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
