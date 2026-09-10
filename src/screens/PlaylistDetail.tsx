import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLibraryStore } from '../store/library'
import { usePlayerStore } from '../store/player'
import { Cover } from '../components/common/Cover'
import { TrackRow } from '../components/common/TrackRow'
import { EmptyState } from '../components/common/EmptyState'
import { SelectTracksSheet } from '../components/sheets/SelectTracksSheet'
import { TrackActionsSheet } from '../components/sheets/TrackActionsSheet'
import { Sheet } from '../components/common/Sheet'
import { PlayIcon, ShuffleIcon, PlusIcon, MoreIcon, TrashIcon, EditIcon } from '../components/icons'
import { pluralizeTracks, formatTotalDuration } from '../lib/format'
import { haptic, hapticNotify } from '../lib/telegram'
import { fileToSquareDataUrl } from '../lib/image'
import type { Track } from '../types'

export function PlaylistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const playlist = useLibraryStore((s) => s.playlists.find((p) => p.id === id))
  const tracks = useLibraryStore((s) => s.tracks)
  const addTracksToPlaylist = useLibraryStore((s) => s.addTracksToPlaylist)
  const removeTrackFromPlaylist = useLibraryStore((s) => s.removeTrackFromPlaylist)
  const updatePlaylist = useLibraryStore((s) => s.updatePlaylist)
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  const [selectOpen, setSelectOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [menuTrack, setMenuTrack] = useState<Track | null>(null)
  const [editTitle, setEditTitle] = useState(playlist?.title ?? '')
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const playlistTracks = useMemo(() => {
    if (!playlist) return []
    const byId = new Map(tracks.map((t) => [t.id, t]))
    return playlist.trackIds.map((tid) => byId.get(tid)).filter((t): t is Track => Boolean(t))
  }, [playlist, tracks])

  const totalDuration = useMemo(() => playlistTracks.reduce((sum, t) => sum + t.duration, 0), [playlistTracks])
  const currentTrackId = currentIndex >= 0 ? activeQueue[currentIndex]?.id : undefined

  if (!playlist) {
    return <EmptyState title="Плейлист не найден" actionLabel="К библиотеке" onAction={() => navigate('/library')} />
  }

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToSquareDataUrl(file)
    updatePlaylist(playlist.id, { coverDataUrl: dataUrl })
  }

  return (
    <div className="pt-4">
      <div className="px-5 flex flex-col items-center text-center gap-3 mb-6">
        <button onClick={() => coverInputRef.current?.click()} className="relative">
          <Cover title={playlist.title} imageUrl={playlist.coverDataUrl} size="lg" rounded="lg" className="w-44 h-44" />
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Плейлист</p>
          <h1 className="font-display font-black text-2xl tracking-tight">{playlist.title}</h1>
          <p className="text-xs text-muted mt-1">
            {pluralizeTracks(playlistTracks.length)} · {formatTotalDuration(totalDuration)}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => {
              if (playlistTracks.length === 0) return
              haptic('medium')
              playQueue(playlistTracks, 0)
            }}
            className="flex items-center gap-2 bg-ink text-paper font-semibold text-sm px-6 py-3 rounded-full active:scale-95 transition-transform disabled:opacity-40"
            disabled={playlistTracks.length === 0}
          >
            <PlayIcon size={16} />
            Слушать
          </button>
          <button
            onClick={() => {
              if (playlistTracks.length === 0) return
              haptic('light')
              playQueue([...playlistTracks].sort(() => Math.random() - 0.5), 0)
            }}
            className="p-3 border border-line rounded-full active:bg-surface"
            aria-label="Перемешать"
          >
            <ShuffleIcon size={18} />
          </button>
          <button onClick={() => setMenuOpen(true)} className="p-3 border border-line rounded-full active:bg-surface" aria-label="Ещё">
            <MoreIcon size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 mb-3">
        <button
          onClick={() => setSelectOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-muted border border-line rounded-full px-4 py-2 active:bg-surface"
        >
          <PlusIcon size={14} />
          Добавить треки
        </button>
      </div>

      {playlistTracks.length === 0 ? (
        <EmptyState title="В плейлисте пока нет треков" description="Добавьте треки из библиотеки." />
      ) : (
        <div>
          {playlistTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              isActive={track.id === currentTrackId}
              isPlaying={isPlaying}
              onPress={() => {
                haptic('light')
                playQueue(playlistTracks, i)
              }}
              onMenu={() => setMenuTrack(track)}
            />
          ))}
        </div>
      )}

      <SelectTracksSheet
        open={selectOpen}
        onClose={() => setSelectOpen(false)}
        excludeIds={playlist.trackIds}
        onConfirm={(ids) => addTracksToPlaylist(playlist.id, ids)}
        title="Добавить в плейлист"
      />

      {menuTrack && (
        <TrackActionsSheet
          open
          track={menuTrack}
          onClose={() => setMenuTrack(null)}
          contextAction={{
            label: 'Убрать из этого плейлиста',
            onClick: () => removeTrackFromPlaylist(playlist.id, menuTrack.id),
          }}
        />
      )}

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="pb-6">
          <button
            onClick={() => {
              setMenuOpen(false)
              setEditTitle(playlist.title)
              setEditOpen(true)
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-surface text-left"
          >
            <EditIcon size={20} />
            <span className="text-[15px] font-medium">Изменить обложку и название</span>
          </button>
          <button
            onClick={() => {
              deletePlaylist(playlist.id)
              hapticNotify('success')
              navigate('/library')
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-surface text-left text-danger"
          >
            <TrashIcon size={20} />
            <span className="text-[15px] font-medium">Удалить плейлист</span>
          </button>
        </div>
      </Sheet>

      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Изменить плейлист">
        <div className="px-5 pb-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Название</span>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-surface-2 rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 ring-accent"
            />
          </label>
          <button
            onClick={() => {
              updatePlaylist(playlist.id, { title: editTitle.trim() || playlist.title })
              setEditOpen(false)
            }}
            className="mt-2 w-full bg-ink text-paper font-semibold py-3 rounded-full active:scale-[0.98] transition-transform"
          >
            Сохранить
          </button>
        </div>
      </Sheet>
    </div>
  )
}
