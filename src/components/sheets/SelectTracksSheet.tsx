import { useMemo, useState } from 'react'
import { Sheet } from '../common/Sheet'
import { Cover } from '../common/Cover'
import { useLibraryStore } from '../../store/library'
import { SearchIcon } from '../icons'
import { hapticNotify } from '../../lib/telegram'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
  excludeIds: string[]
  onConfirm: (trackIds: string[]) => void
  title?: string
}

export function SelectTracksSheet({ open, onClose, excludeIds, onConfirm, title = 'Добавить треки' }: Props) {
  const tracks = useLibraryStore((s) => s.tracks)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const available = useMemo(() => tracks.filter((t) => !excludeIds.includes(t.id)), [tracks, excludeIds])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return available
    return available.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
  }, [available, query])

  const close = () => {
    setQuery('')
    setSelected(new Set())
    onClose()
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Sheet open={open} onClose={close} title={title} fullHeight>
      <div className="px-5 pb-3 sticky top-0 bg-surface z-10">
        <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2.5">
          <SearchIcon size={18} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по библиотеке"
            className="bg-transparent outline-none text-[15px] flex-1 placeholder:text-muted"
          />
        </div>
      </div>

      <div className="pb-24">
        {filtered.length === 0 && <p className="px-5 py-8 text-sm text-muted text-center">Ничего не найдено</p>}
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className="w-full flex items-center gap-3 px-5 py-2.5 active:bg-surface text-left"
          >
            <div
              className={clsx(
                'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center',
                selected.has(t.id) ? 'bg-accent border-accent' : 'border-line',
              )}
            >
              {selected.has(t.id) && <span className="w-2 h-2 rounded-full bg-accent-ink" />}
            </div>
            <Cover title={t.title} imageUrl={t.coverDataUrl} size="xs" rounded="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold truncate">{t.title}</p>
              <p className="text-[12px] text-muted truncate">{t.artist}</p>
            </div>
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-surface border-t border-line">
          <button
            onClick={() => {
              onConfirm(Array.from(selected))
              hapticNotify('success')
              close()
            }}
            className="w-full bg-ink text-paper font-semibold py-3 rounded-full"
          >
            Добавить · {selected.size}
          </button>
        </div>
      )}
    </Sheet>
  )
}
