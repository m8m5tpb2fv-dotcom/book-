import { useState } from 'react'
import { Sheet } from '../common/Sheet'
import type { Track } from '../../types'
import { useLibraryStore } from '../../store/library'
import { usePlayerStore } from '../../store/player'
import { haptic, hapticNotify } from '../../lib/telegram'
import {
  HeartIcon,
  NextIcon,
  QueueIcon,
  PlaylistIcon,
  AlbumIcon,
  EditIcon,
  TrashIcon,
  ChevronDownIcon,
  CloseIcon,
} from '../icons'
import { Cover } from '../common/Cover'

type View = 'menu' | 'playlists' | 'albums' | 'rename' | 'confirm-delete'

interface ContextAction {
  label: string
  onClick: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  track: Track
  contextAction?: ContextAction
}

interface RowProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}

function Row({ icon, label, onClick, danger }: RowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 active:bg-surface text-left ${danger ? 'text-danger' : ''}`}
    >
      {icon}
      <span className="text-[15px] font-medium">{label}</span>
    </button>
  )
}

export function TrackActionsSheet({ open, onClose, track, contextAction }: Props) {
  const [view, setView] = useState<View>('menu')
  const [title, setTitle] = useState(track.title)
  const [artist, setArtist] = useState(track.artist)

  const playlists = useLibraryStore((s) => s.playlists)
  const albums = useLibraryStore((s) => s.albums)
  const toggleLike = useLibraryStore((s) => s.toggleLike)
  const updateTrack = useLibraryStore((s) => s.updateTrack)
  const deleteTrack = useLibraryStore((s) => s.deleteTrack)
  const addTracksToPlaylist = useLibraryStore((s) => s.addTracksToPlaylist)
  const addTracksToAlbum = useLibraryStore((s) => s.addTracksToAlbum)

  const playTrackNext = usePlayerStore((s) => s.playTrackNext)
  const addToQueueEnd = usePlayerStore((s) => s.addToQueueEnd)

  const close = () => {
    setView('menu')
    onClose()
  }

  if (view === 'playlists') {
    return (
      <Sheet open={open} onClose={close} title="Добавить в плейлист">
        <div className="pb-6">
          {playlists.length === 0 && <p className="px-5 py-6 text-sm text-muted">Нет плейлистов. Создайте его в разделе «Моя музыка».</p>}
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                addTracksToPlaylist(p.id, [track.id])
                hapticNotify('success')
                close()
              }}
              className="w-full flex items-center gap-3 px-5 py-2.5 active:bg-surface text-left"
            >
              <Cover title={p.title} imageUrl={p.coverDataUrl} size="sm" rounded="md" />
              <span className="text-[15px] font-semibold truncate">{p.title}</span>
            </button>
          ))}
        </div>
      </Sheet>
    )
  }

  if (view === 'albums') {
    return (
      <Sheet open={open} onClose={close} title="Добавить в альбом">
        <div className="pb-6">
          {albums.length === 0 && <p className="px-5 py-6 text-sm text-muted">Нет альбомов. Создайте его в разделе «Моя музыка».</p>}
          {albums.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                addTracksToAlbum(a.id, [track.id])
                hapticNotify('success')
                close()
              }}
              className="w-full flex items-center gap-3 px-5 py-2.5 active:bg-surface text-left"
            >
              <Cover title={a.title} imageUrl={a.coverDataUrl} size="sm" rounded="md" />
              <span className="text-[15px] font-semibold truncate">{a.title}</span>
            </button>
          ))}
        </div>
      </Sheet>
    )
  }

  if (view === 'rename') {
    return (
      <Sheet open={open} onClose={close} title="Изменить информацию">
        <div className="px-5 pb-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Название</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface-2 rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 ring-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Исполнитель</span>
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="bg-surface-2 rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 ring-accent"
            />
          </label>
          <button
            onClick={() => {
              updateTrack(track.id, { title: title.trim() || track.title, artist: artist.trim() || track.artist })
              hapticNotify('success')
              close()
            }}
            className="mt-2 w-full bg-ink text-paper font-semibold py-3 rounded-full active:scale-[0.98] transition-transform"
          >
            Сохранить
          </button>
        </div>
      </Sheet>
    )
  }

  if (view === 'confirm-delete') {
    return (
      <Sheet open={open} onClose={close} title="Удалить трек?">
        <div className="px-5 pb-6 flex flex-col gap-3">
          <p className="text-sm text-muted">«{track.title}» будет удалён из библиотеки и всех плейлистов и альбомов безвозвратно.</p>
          <button
            onClick={async () => {
              await deleteTrack(track.id)
              hapticNotify('success')
              close()
            }}
            className="w-full bg-danger text-white font-semibold py-3 rounded-full active:scale-[0.98] transition-transform"
          >
            Удалить
          </button>
          <button onClick={() => setView('menu')} className="w-full py-2.5 text-sm text-muted font-medium">
            Отмена
          </button>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onClose={close}>
      <div className="flex items-center gap-3 px-5 py-3 border-b border-line mb-1">
        <Cover title={track.title} imageUrl={track.coverDataUrl} size="sm" rounded="md" />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold truncate">{track.title}</p>
          <p className="text-[13px] text-muted truncate">{track.artist}</p>
        </div>
      </div>
      <div className="pb-6">
        {contextAction && (
          <Row
            icon={<CloseIcon size={20} />}
            label={contextAction.label}
            onClick={() => {
              contextAction.onClick()
              close()
            }}
          />
        )}
        <Row
          icon={<HeartIcon size={20} filled={track.liked} />}
          label={track.liked ? 'Убрать из «Мне нравится»' : 'Добавить в «Мне нравится»'}
          onClick={() => {
            haptic('light')
            toggleLike(track.id)
          }}
        />
        <Row icon={<NextIcon size={20} />} label="Играть следующим" onClick={() => { playTrackNext(track); close() }} />
        <Row icon={<QueueIcon size={20} />} label="Добавить в очередь" onClick={() => { addToQueueEnd(track); close() }} />
        <Row icon={<PlaylistIcon size={20} />} label="Добавить в плейлист" onClick={() => setView('playlists')} />
        <Row icon={<AlbumIcon size={20} />} label="Добавить в альбом" onClick={() => setView('albums')} />
        <Row icon={<EditIcon size={20} />} label="Изменить информацию" onClick={() => setView('rename')} />
        <Row icon={<TrashIcon size={20} />} label="Удалить трек" danger onClick={() => setView('confirm-delete')} />
        <Row icon={<ChevronDownIcon size={20} className="rotate-180" />} label="Закрыть" onClick={close} />
      </div>
    </Sheet>
  )
}
