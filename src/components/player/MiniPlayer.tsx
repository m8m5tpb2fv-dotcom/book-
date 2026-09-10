import { usePlayerStore } from '../../store/player'
import { Cover } from '../common/Cover'
import { PlayIcon, PauseIcon, NextIcon } from '../icons'
import { haptic } from '../../lib/telegram'

export function MiniPlayer() {
  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const position = usePlayerStore((s) => s.position)
  const duration = usePlayerStore((s) => s.duration)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const openFullPlayer = usePlayerStore((s) => s.openFullPlayer)

  const track = currentIndex >= 0 ? activeQueue[currentIndex] : undefined
  if (!track) return null

  const ratio = duration > 0 ? Math.min(1, position / duration) : 0

  return (
    <div className="fixed left-0 right-0 z-30 px-3" style={{ bottom: 'calc(56px + var(--safe-bottom))' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          haptic('light')
          openFullPlayer()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            haptic('light')
            openFullPlayer()
          }
        }}
        className="w-full flex items-center gap-3 bg-surface/95 backdrop-blur border border-line rounded-2xl pl-2.5 pr-2 py-2 shadow-lg relative overflow-hidden text-left"
      >
        <div className="absolute top-0 left-0 h-[2px] bg-accent" style={{ width: `${ratio * 100}%` }} />
        <Cover title={track.title} imageUrl={track.coverDataUrl} size="xs" rounded="md" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[13.5px] font-semibold truncate">{track.title}</p>
          <p className="text-[12px] text-muted truncate">{track.artist}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            haptic('light')
            togglePlay()
          }}
          className="p-2 shrink-0"
          aria-label={isPlaying ? 'Пауза' : 'Играть'}
        >
          {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            haptic('light')
            next()
          }}
          className="p-2 shrink-0"
          aria-label="Следующий трек"
        >
          <NextIcon size={20} />
        </button>
      </div>
    </div>
  )
}
