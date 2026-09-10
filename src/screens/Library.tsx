import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useLibraryStore } from '../store/library'
import { usePlayerStore } from '../store/player'
import { TrackRow } from '../components/common/TrackRow'
import { Cover } from '../components/common/Cover'
import { EmptyState } from '../components/common/EmptyState'
import { UploadSheet } from '../components/sheets/UploadSheet'
import { CreateCollectionSheet } from '../components/sheets/CreateCollectionSheet'
import { TrackActionsSheet } from '../components/sheets/TrackActionsSheet'
import { UploadIcon, PlusIcon, AlbumIcon, PlaylistIcon, HeartIcon } from '../components/icons'
import { pluralizeTracks } from '../lib/format'
import { haptic } from '../lib/telegram'
import type { Track } from '../types'

type Tab = 'tracks' | 'albums' | 'playlists'

export function Library() {
  const navigate = useNavigate()
  const tracks = useLibraryStore((s) => s.tracks)
  const albums = useLibraryStore((s) => s.albums)
  const playlists = useLibraryStore((s) => s.playlists)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  const [tab, setTab] = useState<Tab>('tracks')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [createKind, setCreateKind] = useState<'album' | 'playlist' | null>(null)
  const [menuTrack, setMenuTrack] = useState<Track | null>(null)

  const likedTracks = useMemo(() => tracks.filter((t) => t.liked), [tracks])
  const sortedTracks = useMemo(() => [...tracks].sort((a, b) => b.addedAt - a.addedAt), [tracks])
  const currentTrackId = currentIndex >= 0 ? activeQueue[currentIndex]?.id : undefined

  return (
    <div className="pt-4">
      <div className="px-5 flex items-center justify-between mb-5">
        <h1 className="font-display font-black text-2xl tracking-tight">Моя музыка</h1>
        <button
          onClick={() => setUploadOpen(true)}
          className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Добавить музыку"
        >
          <UploadIcon size={18} />
        </button>
      </div>

      <div className="px-5 flex gap-2 mb-5">
        {(
          [
            ['tracks', 'Треки'],
            ['albums', 'Альбомы'],
            ['playlists', 'Плейлисты'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
              tab === key ? 'bg-ink text-paper' : 'bg-surface-2 text-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'tracks' && (
        <div>
          {likedTracks.length > 0 && (
            <button
              onClick={() => playQueue(likedTracks, 0)}
              className="mx-5 mb-4 flex items-center gap-3 bg-surface rounded-2xl px-4 py-3 w-[calc(100%-2.5rem)] text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <HeartIcon size={20} filled className="text-accent-ink" />
              </div>
              <div>
                <p className="font-semibold text-sm">Мне нравится</p>
                <p className="text-xs text-muted">{pluralizeTracks(likedTracks.length)}</p>
              </div>
            </button>
          )}

          {sortedTracks.length === 0 ? (
            <EmptyState
              icon={<UploadIcon size={36} />}
              title="Нет треков"
              description="Добавьте аудиофайлы, чтобы начать собирать библиотеку."
              actionLabel="Добавить музыку"
              onAction={() => setUploadOpen(true)}
            />
          ) : (
            <div>
              {sortedTracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  showAlbum
                  isActive={track.id === currentTrackId}
                  isPlaying={isPlaying}
                  onPress={() => {
                    haptic('light')
                    playQueue(sortedTracks, i)
                  }}
                  onMenu={() => setMenuTrack(track)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'albums' && (
        <div>
          <div className="px-5 mb-4">
            <button
              onClick={() => setCreateKind('album')}
              className="flex items-center gap-2 text-sm font-semibold text-muted border border-line rounded-full px-4 py-2 active:bg-surface"
            >
              <PlusIcon size={14} />
              Новый альбом
            </button>
          </div>
          {albums.length === 0 ? (
            <EmptyState
              icon={<AlbumIcon size={36} />}
              title="Нет альбомов"
              description="Соберите треки в альбомы, как в настоящем плеере."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 px-5">
              {albums.map((album) => (
                <button key={album.id} onClick={() => navigate(`/album/${album.id}`)} className="text-left">
                  <Cover title={album.title} imageUrl={album.coverDataUrl} size="xl" rounded="lg" />
                  <p className="text-[13.5px] font-semibold mt-2 truncate">{album.title}</p>
                  <p className="text-[12px] text-muted truncate">{pluralizeTracks(album.trackIds.length)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'playlists' && (
        <div>
          <div className="px-5 mb-4">
            <button
              onClick={() => setCreateKind('playlist')}
              className="flex items-center gap-2 text-sm font-semibold text-muted border border-line rounded-full px-4 py-2 active:bg-surface"
            >
              <PlusIcon size={14} />
              Новый плейлист
            </button>
          </div>
          {playlists.length === 0 ? (
            <EmptyState
              icon={<PlaylistIcon size={36} />}
              title="Нет плейлистов"
              description="Создайте плейлист под настроение, поездку или тренировку."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 px-5">
              {playlists.map((playlist) => (
                <button key={playlist.id} onClick={() => navigate(`/playlist/${playlist.id}`)} className="text-left">
                  <Cover title={playlist.title} imageUrl={playlist.coverDataUrl} size="xl" rounded="lg" />
                  <p className="text-[13.5px] font-semibold mt-2 truncate">{playlist.title}</p>
                  <p className="text-[12px] text-muted truncate">{pluralizeTracks(playlist.trackIds.length)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <UploadSheet open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <CreateCollectionSheet
        open={createKind !== null}
        kind={createKind ?? 'album'}
        onClose={() => setCreateKind(null)}
        onCreated={(id) => navigate(createKind === 'album' ? `/album/${id}` : `/playlist/${id}`)}
      />
      {menuTrack && <TrackActionsSheet open track={menuTrack} onClose={() => setMenuTrack(null)} />}
    </div>
  )
}
