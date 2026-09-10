import { Sheet } from '../common/Sheet'
import { Cover } from '../common/Cover'
import { usePlayerStore } from '../../store/player'
import { EqBars } from '../common/EqBars'
import { CloseIcon } from '../icons'
import { haptic } from '../../lib/telegram'
import clsx from 'clsx'

export function QueueSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const jumpTo = usePlayerStore((s) => s.jumpTo)
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue)

  return (
    <Sheet open={open} onClose={onClose} title="Очередь воспроизведения" fullHeight>
      <div className="pb-6">
        {activeQueue.map((track, i) => (
          <div
            key={`${track.id}-${i}`}
            className={clsx('flex items-center gap-3 px-5 py-2.5', i === currentIndex && 'bg-surface')}
          >
            <button
              onClick={() => {
                haptic('light')
                jumpTo(i)
              }}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <Cover title={track.title} imageUrl={track.coverDataUrl} size="xs" rounded="md" />
              <div className="min-w-0 flex-1">
                <p className={clsx('text-[14px] font-semibold truncate', i === currentIndex && 'text-accent')}>
                  {track.title}
                </p>
                <p className="text-[12px] text-muted truncate">{track.artist}</p>
              </div>
              {i === currentIndex && <EqBars playing={isPlaying} />}
            </button>
            <button
              onClick={() => removeFromQueue(track.id)}
              className="p-1.5 text-muted active:text-ink shrink-0"
              aria-label="Убрать из очереди"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </Sheet>
  )
}
