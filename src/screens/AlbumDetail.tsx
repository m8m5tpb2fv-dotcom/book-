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

export function AlbumDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const album = useLibraryStore((s) => s.albums.find((a) => a.id === id))
  const tracks = useLibraryStore((s) => s.tracks)
  const addTracksToAlbum = useLibraryStore((s) => s.addTracksToAlbum)
  const removeTrackFromAlbum = useLibraryStore((s) => s.removeTrackFromAlbum)
  const updateAlbum = useLibraryStore((s) => s.updateAlbum)
  const deleteAlbum = useLibraryStore((s) => s.deleteAlbum)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  const [selectOpen, setSelectOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [menuTrack, setMenuTrack] = useState<Track | null>(null)
  const [editTitle, setEditTitle] = useState(album?.title ?? '')
  const [editArtist, setEditArtist] = useState(album?.artist ?? '')
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const albumTracks = useMemo(() => {
    if (!album) return []
    const byId = new Map(tracks.map((t) => [t.id, t]))
    return album.trackIds.map((tid) => byId.get(tid)).filter((t): t is Track => Boolean(t))
  }, [album, tracks])

  const totalDuration = useMemo(() => albumTracks.reduce((sum, t) => sum + t.duration, 0), [albumTracks])
  const currentTrackId = currentIndex >= 0 ? activeQueue[currentIndex]?.id : undefined

  if (!album) {
    return <EmptyState title="Альбом не найден" actionLabel="К библиотеке" onAction={() => navigate('/library')} />
  }

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToSquareDataUrl(file)
    updateAlbum(album.id, { coverDataUrl: dataUrl })
  }

  return (
    <div className="pt-4">
      <div className="px-5 flex flex-col items-center text-center gap-3 mb-6">
        <button onClick={() => coverInputRef.current?.click()} className="relative">
          <Cover title={album.title} imageUrl={album.coverDataUrl} size="lg" rounded="lg" className="w-44 h-44" />
        </button>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Альбом</p>
          <h1 className="font-display font-black text-2xl tracking-tight">{album.title}</h1>
          <p className="text-sm text-muted mt-1">{album.artist}</p>
          <p className="text-xs text-muted mt-1">
            {pluralizeTracks(albumTracks.length)} · {formatTotalDuration(totalDuration)}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => {
              if (albumTracks.length === 0) return
              haptic('medium')
              playQueue(albumTracks, 0)
            }}
            className="flex items-center gap-2 bg-ink text-paper font-semibold text-sm px-6 py-3 rounded-full active:scale-95 transition-transform disabled:opacity-40"
            disabled={albumTracks.length === 0}
          >
            <PlayIcon size={16} />
            Слушать
          </button>
          <button
            onClick={() => {
              if (albumTracks.length === 0) return
              haptic('light')
              playQueue([...albumTracks].sort(() => Math.random() - 0.5), 0)
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

      {albumTracks.length === 0 ? (
        <EmptyState title="В альбоме пока нет треков" description="Добавьте треки из библиотеки." />
      ) : (
        <div>
          {albumTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              isActive={track.id === currentTrackId}
              isPlaying={isPlaying}
              onPress={() => {
                haptic('light')
                playQueue(albumTracks, i)
              }}
              onMenu={() => setMenuTrack(track)}
            />
          ))}
        </div>
      )}

      <SelectTracksSheet
        open={selectOpen}
        onClose={() => setSelectOpen(false)}
        excludeIds={album.trackIds}
        onConfirm={(ids) => addTracksToAlbum(album.id, ids)}
        title="Добавить в альбом"
      />

      {menuTrack && (
        <TrackActionsSheet
          open
          track={menuTrack}
          onClose={() => setMenuTrack(null)}
          contextAction={{
            label: 'Убрать из этого альбома',
            onClick: () => removeTrackFromAlbum(album.id, menuTrack.id),
          }}
        />
      )}

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="pb-6">
          <button
            onClick={() => {
              setMenuOpen(false)
              setEditTitle(album.title)
              setEditArtist(album.artist)
              setEditOpen(true)
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-surface text-left"
          >
            <EditIcon size={20} />
            <span className="text-[15px] font-medium">Изменить обложку и название</span>
          </button>
          <button
            onClick={async () => {
              await deleteAlbum(album.id, false)
              hapticNotify('success')
              navigate('/library')
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-surface text-left text-danger"
          >
            <TrashIcon size={20} />
            <span className="text-[15px] font-medium">Удалить альбом (треки останутся)</span>
          </button>
        </div>
      </Sheet>

      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Изменить альбом">
        <div className="px-5 pb-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Название</span>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-surface-2 rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 ring-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Исполнитель</span>
            <input
              value={editArtist}
              onChange={(e) => setEditArtist(e.target.value)}
              className="bg-surface-2 rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 ring-accent"
            />
          </label>
          <button
            onClick={() => {
              updateAlbum(album.id, { title: editTitle.trim() || album.title, artist: editArtist.trim() || album.artist })
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
