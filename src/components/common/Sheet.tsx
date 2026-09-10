import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  fullHeight?: boolean
}

export function Sheet({ open, onClose, children, title, fullHeight }: SheetProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full max-w-md bg-surface rounded-t-3xl border-t border-x border-line',
          'animate-[sheet-in_0.22s_cubic-bezier(0.16,1,0.3,1)]',
          fullHeight ? 'h-[92dvh]' : 'max-h-[85dvh]',
          'flex flex-col',
        )}
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-line" />
        </div>
        {title && (
          <div className="px-5 pb-3 pt-1 shrink-0">
            <h2 className="font-display font-extrabold text-lg tracking-tight">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto no-scrollbar flex-1">{children}</div>
      </div>
      <style>{`
        @keyframes sheet-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  )
}
