import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../store/library'
import { usePlayerStore } from '../store/player'
import { TrackRow } from '../components/common/TrackRow'
import { Cover } from '../components/common/Cover'
import { SectionHeader } from '../components/common/SectionHeader'
import { SearchIcon, TelegramIcon, CloseIcon } from '../components/icons'
import { isRunningInTelegram, switchInlineQuery, haptic } from '../lib/telegram'
import { pluralizeTracks } from '../lib/format'
import type { Track } from '../types'

export function Search() {
  const navigate = useNavigate()
  const tracks = useLibraryStore((s) => s.tracks)
  const albums = useLibraryStore((s) => s.albums)
  const playlists = useLibraryStore((s) => s.playlists)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const currentTrackId = currentIndex >= 0 ? activeQueue[currentIndex]?.id : undefined

  const matchedTracks = useMemo(() => {
    if (!q) return []
    return tracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q),
    )
  }, [tracks, q])

  const matchedAlbums = useMemo(() => {
    if (!q) return []
    return albums.filter((a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q))
  }, [albums, q])

  const matchedPlaylists = useMemo(() => {
    if (!q) return []
    return playlists.filter((p) => p.title.toLowerCase().includes(q))
  }, [playlists, q])

  const genres = useMemo(() => {
    const set = new Set<string>()
    tracks.forEach((t) => t.genre && set.add(t.genre))
    return Array.from(set).slice(0, 8)
  }, [tracks])

  const hasResults = matchedTracks.length > 0 || matchedAlbums.length > 0 || matchedPlaylists.length > 0

  const play = (track: Track, list: Track[]) => {
    haptic('light')
    const idx = list.findIndex((t) => t.id === track.id)
    playQueue(list, Math.max(idx, 0))
  }

  return (
    <div className="pt-4">
      <div className="px-5 mb-5">
        <h1 className="font-display font-black text-2xl tracking-tight mb-4">Поиск</h1>
        <div className="flex items-center gap-2 bg-surface-2 rounded-2xl px-4 py-3">
          <SearchIcon size={20} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Треки, альбомы, плейлисты, исполнители"
            className="bg-transparent outline-none text-[15px] flex-1 placeholder:text-muted"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted p-1" aria-label="Очистить">
              <CloseIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {q && isRunningInTelegram() && (
        <div className="px-5 mb-6">
          <button
            onClick={() => switchInlineQuery(query.trim())}
            className="w-full flex items-center gap-3 bg-surface border border-line rounded-2xl px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#2AABEE] flex items-center justify-center text-white shrink-0">
              <TelegramIcon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Искать «{query.trim()}» в Telegram</p>
              <p className="text-xs text-muted">Откроет поиск через инлайн-ботов Telegram в чате</p>
            </div>
          </button>
        </div>
      )}

      {!q && (
        <div className="px-5">
          {genres.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Жанры в библиотеке</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setQuery(g)}
                    className="px-4 py-2 rounded-full bg-surface-2 text-sm font-medium active:bg-surface"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="bg-surface rounded-2xl p-5 flex flex-col gap-2">
            <p className="font-display font-extrabold text-base">Пополните библиотеку</p>
            <p className="text-sm text-muted">
              Найдите трек через поиск музыки в Telegram, сохраните его как файл и загрузите в разделе «Моя
              музыка» — он появится здесь со всеми тегами и обложкой.
            </p>
            <button
              onClick={() => navigate('/library')}
              className="self-start mt-1 text-sm font-semibold underline underline-offset-4"
            >
              Перейти к загрузке
            </button>
          </div>
        </div>
      )}

      {q && !hasResults && (
        <p className="px-5 text-sm text-muted">Ничего не найдено в вашей библиотеке.</p>
      )}

      {matchedTracks.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Треки" />
          {matchedTracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              showAlbum
              isActive={track.id === currentTrackId}
              isPlaying={isPlaying}
              onPress={() => play(track, matchedTracks)}
            />
          ))}
        </div>
      )}

      {matchedAlbums.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Альбомы" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
            {matchedAlbums.map((album) => (
              <button key={album.id} onClick={() => navigate(`/album/${album.id}`)} className="text-left w-28 shrink-0">
                <Cover title={album.title} imageUrl={album.coverDataUrl} size="lg" rounded="lg" className="w-28 h-28" />
                <p className="text-[13px] font-semibold mt-2 truncate">{album.title}</p>
                <p className="text-[11px] text-muted truncate">{pluralizeTracks(album.trackIds.length)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {matchedPlaylists.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Плейлисты" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-5">
            {matchedPlaylists.map((playlist) => (
              <button key={playlist.id} onClick={() => navigate(`/playlist/${playlist.id}`)} className="text-left w-28 shrink-0">
                <Cover title={playlist.title} imageUrl={playlist.coverDataUrl} size="lg" rounded="lg" className="w-28 h-28" />
                <p className="text-[13px] font-semibold mt-2 truncate">{playlist.title}</p>
                <p className="text-[11px] text-muted truncate">{pluralizeTracks(playlist.trackIds.length)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
