import { useState } from 'react'
import { usePlayerStore } from '../../store/player'
import { useLibraryStore } from '../../store/library'
import { Cover } from '../common/Cover'
import { ProgressBar } from './ProgressBar'
import {
  ChevronDownIcon,
  HeartIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  QueueIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
  MoreIcon,
} from '../icons'
import { haptic } from '../../lib/telegram'
import { QueueSheet } from './QueueSheet'
import { TrackActionsSheet } from '../sheets/TrackActionsSheet'
import clsx from 'clsx'

export function FullPlayer() {
  const isOpen = usePlayerStore((s) => s.isFullPlayerOpen)
  const close = usePlayerStore((s) => s.closeFullPlayer)
  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const position = usePlayerStore((s) => s.position)
  const duration = usePlayerStore((s) => s.duration)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const prev = usePlayerStore((s) => s.prev)
  const seek = usePlayerStore((s) => s.seek)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)

  const toggleLike = useLibraryStore((s) => s.toggleLike)

  const [queueOpen, setQueueOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)

  const track = currentIndex >= 0 ? activeQueue[currentIndex] : undefined

  if (!isOpen || !track) return null

  return (
    <div className="fixed inset-0 z-40 bg-paper flex flex-col" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <button onClick={close} className="p-2 -ml-2 active:opacity-60" aria-label="Свернуть">
          <ChevronDownIcon size={26} />
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">Сейчас играет</span>
        <button onClick={() => setActionsOpen(true)} className="p-2 -mr-2 active:opacity-60" aria-label="Ещё">
          <MoreIcon size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 gap-8 min-h-0">
        <div className="w-full max-w-xs mx-auto">
          <Cover title={track.title} imageUrl={track.coverDataUrl} size="xl" rounded="lg" className="shadow-2xl" />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-2xl tracking-tight truncate">{track.title}</h1>
            <p className="text-muted text-[15px] mt-1 truncate">{track.artist}</p>
          </div>
          <button
            onClick={() => {
              haptic('light')
              toggleLike(track.id)
            }}
            className={clsx('p-2 shrink-0 mt-1', track.liked ? 'text-accent' : 'text-muted')}
            aria-label="Нравится"
          >
            <HeartIcon size={26} filled={track.liked} />
          </button>
        </div>

        <ProgressBar position={position} duration={duration || track.duration} onSeek={seek} />

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              haptic('light')
              toggleShuffle()
            }}
            className={clsx('p-2', shuffle ? 'text-accent' : 'text-muted')}
            aria-label="Перемешать"
          >
            <ShuffleIcon size={20} />
          </button>
          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                haptic('light')
                prev()
              }}
              className="p-2 active:scale-90 transition-transform"
              aria-label="Предыдущий"
            >
              <PrevIcon size={30} />
            </button>
            <button
              onClick={() => {
                haptic('medium')
                togglePlay()
              }}
              className="w-16 h-16 rounded-full bg-ink text-paper flex items-center justify-center active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Пауза' : 'Играть'}
            >
              {isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} className="ml-0.5" />}
            </button>
            <button
              onClick={() => {
                haptic('light')
                next()
              }}
              className="p-2 active:scale-90 transition-transform"
              aria-label="Следующий"
            >
              <NextIcon size={30} />
            </button>
          </div>
          <button
            onClick={() => {
              haptic('light')
              cycleRepeat()
            }}
            className={clsx('p-2', repeat !== 'off' ? 'text-accent' : 'text-muted')}
            aria-label="Повтор"
          >
            {repeat === 'one' ? <RepeatOneIcon size={20} /> : <RepeatIcon size={20} />}
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 flex justify-center">
        <button
          onClick={() => setQueueOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted px-4 py-2.5 rounded-full border border-line active:bg-surface"
        >
          <QueueIcon size={16} />
          Очередь · {activeQueue.length}
        </button>
      </div>

      <QueueSheet open={queueOpen} onClose={() => setQueueOpen(false)} />
      <TrackActionsSheet open={actionsOpen} onClose={() => setActionsOpen(false)} track={track} />
    </div>
  )
}
