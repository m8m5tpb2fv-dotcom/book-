import clsx from 'clsx'
import { Cover } from './Cover'
import { formatDuration } from '../../lib/format'
import type { Track } from '../../types'
import { EqBars } from './EqBars'
import { MoreIcon } from '../icons'

interface TrackRowProps {
  track: Track
  index?: number
  isActive?: boolean
  isPlaying?: boolean
  onPress: () => void
  onMenu?: () => void
  showAlbum?: boolean
}

export function TrackRow({ track, index, isActive, isPlaying, onPress, onMenu, showAlbum }: TrackRowProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-5 py-2.5 active:bg-surface transition-colors',
        isActive && 'bg-surface',
      )}
    >
      <button onClick={onPress} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        {index !== undefined ? (
          <div className="w-6 shrink-0 text-center">
            {isActive ? (
              <EqBars playing={Boolean(isPlaying)} />
            ) : (
              <span className="text-sm text-muted tabular-nums">{index + 1}</span>
            )}
          </div>
        ) : (
          <Cover title={track.title} imageUrl={track.coverDataUrl} size="sm" rounded="md" />
        )}
        <div className="min-w-0 flex-1">
          <p className={clsx('text-[15px] font-semibold truncate', isActive && 'text-accent')}>{track.title}</p>
          <p className="text-[13px] text-muted truncate">
            {track.artist}
            {showAlbum && track.album ? ` · ${track.album}` : ''}
          </p>
        </div>
      </button>
      <span className="text-xs text-muted tabular-nums shrink-0">{formatDuration(track.duration)}</span>
      {onMenu && (
        <button
          onClick={onMenu}
          className="shrink-0 p-1.5 -mr-1.5 text-muted active:text-ink"
          aria-label="Действия"
        >
          <MoreIcon />
        </button>
      )}
    </div>
  )
}
