import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../store/library'
import { usePlayerStore } from '../store/player'
import { getTelegramUser } from '../lib/telegram'
import { Cover } from '../components/common/Cover'
import { SectionHeader } from '../components/common/SectionHeader'
import { EmptyState } from '../components/common/EmptyState'
import { HeartIcon, PlayIcon, ShuffleIcon, UploadIcon, PlaylistIcon, AlbumIcon } from '../components/icons'
import { formatTotalDuration, pluralizeTracks } from '../lib/format'
import { haptic } from '../lib/telegram'
import { UploadSheet } from '../components/sheets/UploadSheet'
import type { Track } from '../types'

export function Home() {
  const navigate = useNavigate()
  const tracks = useLibraryStore((s) => s.tracks)
  const albums = useLibraryStore((s) => s.albums)
  const playlists = useLibraryStore((s) => s.playlists)
  const toggleLike = useLibraryStore((s) => s.toggleLike)
  const playQueue = usePlayerStore((s) => s.playQueue)

  const [uploadOpen, setUploadOpen] = useState(false)

  const user = getTelegramUser()
  const greetingName = user?.first_name ?? 'слушатель'

  const totalDuration = useMemo(() => tracks.reduce((sum, t) => sum + t.duration, 0), [tracks])

  const recentlyAdded = useMemo(() => [...tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 8), [tracks])
  const mostPlayed = useMemo(
    () => [...tracks].filter((t) => t.playCount > 0).sort((a, b) => b.playCount - a.playCount).slice(0, 4),
    [tracks],
  )
  const bestOf = mostPlayed.length >= 4 ? mostPlayed : recentlyAdded.slice(0, 4)
  const heroTrack = recentlyAdded[0]

  const playAll = (fromTrack?: Track) => {
    if (tracks.length === 0) return
    haptic('medium')
    const startIndex = fromTrack ? tracks.findIndex((t) => t.id === fromTrack.id) : 0
    playQueue(tracks, Math.max(startIndex, 0))
  }

  if (tracks.length === 0) {
    return (
      <div className="pt-6">
        <div className="px-5 flex items-center justify-between mb-8">
          <span className="font-display font-black text-xl tracking-tight">WAVE</span>
        </div>
        <EmptyState
          icon={<AlbumIcon size={40} />}
          title="Библиотека пока пуста"
          description="Загрузите свою музыку — MP3, M4A, WAV или FLAC — и WAVE соберёт для вас треки, альбомы и плейлисты."
          actionLabel="Добавить музыку"
          onAction={() => setUploadOpen(true)}
        />
        <UploadSheet open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </div>
    )
  }

  return (
    <div className="pt-4 flex flex-col gap-9">
      <div className="px-5 flex items-center justify-between">
        <span className="font-display font-black text-xl tracking-tight">WAVE</span>
        <button
          onClick={() => navigate('/library')}
          className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center overflow-hidden"
        >
          {user?.photo_url ? (
            <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-sm">{greetingName[0]?.toUpperCase()}</span>
          )}
        </button>
      </div>

      {/* Hero */}
      <section className="px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-2">
          Привет, {greetingName}
        </p>
        <h1 className="font-display font-black text-[15vw] leading-[0.85] tracking-tighter -ml-0.5 mb-5 text-balance">
          ВАША
          <br />
          МУЗЫКА
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => playAll()}
              className="flex items-center gap-2 bg-ink text-paper font-semibold text-sm px-5 py-3 rounded-full active:scale-95 transition-transform"
            >
              <PlayIcon size={16} />
              Слушать
            </button>
            <button
              onClick={() => {
                haptic('light')
                playQueue([...tracks].sort(() => Math.random() - 0.5), 0)
              }}
              className="flex items-center gap-2 border border-line font-semibold text-sm px-4 py-3 rounded-full active:bg-surface"
            >
              <ShuffleIcon size={16} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Библиотека</p>
            <p className="text-sm font-semibold">
              {pluralizeTracks(tracks.length)} · {formatTotalDuration(totalDuration)}
            </p>
          </div>
        </div>
      </section>

      {/* Category band */}
      <section className="bg-ink text-paper py-6 flex gap-4 px-5 -mx-0">
        <button onClick={() => navigate('/library')} className="flex-1 text-left">
          <p className="font-display font-extrabold text-base mb-0.5">Треки</p>
          <p className="text-xs opacity-60">{tracks.length} в библиотеке</p>
        </button>
        <div className="w-px bg-white/15" />
        <button onClick={() => navigate('/library')} className="flex-1 text-left">
          <p className="font-display font-extrabold text-base mb-0.5">Альбомы</p>
          <p className="text-xs opacity-60">{albums.length} созданных</p>
        </button>
        <div className="w-px bg-white/15" />
        <button onClick={() => navigate('/library')} className="flex-1 text-left">
          <p className="font-display font-extrabold text-base mb-0.5">Плейлисты</p>
          <p className="text-xs opacity-60">{playlists.length} созданных</p>
        </button>
      </section>

      {/* New today spotlight */}
      {heroTrack && (
        <section className="px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-3">Недавно добавлено</p>
          <div className="bg-surface rounded-3xl p-5 flex items-center gap-4">
            <Cover title={heroTrack.title} imageUrl={heroTrack.coverDataUrl} size="lg" rounded="lg" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-extrabold text-lg leading-tight truncate">{heroTrack.title}</h3>
              <p className="text-sm text-muted truncate mb-3">{heroTrack.artist}</p>
              <button
                onClick={() => playAll(heroTrack)}
                className="flex items-center gap-2 bg-ink text-paper text-xs font-semibold px-4 py-2 rounded-full active:scale-95 transition-transform"
              >
                <PlayIcon size={12} />
                Слушать
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="grid grid-cols-2 gap-x-4 gap-y-5 px-5">
        {[
          { icon: <UploadIcon size={20} />, title: 'Быстрый импорт', desc: 'Любые MP3 и FLAC' },
          { icon: <AlbumIcon size={20} />, title: 'Свои альбомы', desc: 'Группируйте треки' },
          { icon: <PlaylistIcon size={20} />, title: 'Плейлисты', desc: 'Под любое настроение' },
          { icon: <HeartIcon size={20} />, title: 'Офлайн доступ', desc: 'Хранится на устройстве' },
        ].map((f) => (
          <div key={f.title} className="flex items-start gap-2.5">
            <div className="text-ink shrink-0">{f.icon}</div>
            <div>
              <p className="text-[13px] font-semibold leading-tight">{f.title}</p>
              <p className="text-[12px] text-muted leading-tight">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Best of */}
      {bestOf.length > 0 && (
        <section>
          <SectionHeader title="Лучшее" actionLabel="Все" onAction={() => navigate('/library')} />
          <div className="grid grid-cols-2 gap-4 px-5">
            {bestOf.map((track) => (
              <div
                key={track.id}
                role="button"
                tabIndex={0}
                onClick={() => playAll(track)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') playAll(track)
                }}
                className="w-full text-left"
              >
                <div className="relative">
                  <Cover title={track.title} imageUrl={track.coverDataUrl} size="xl" rounded="lg" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      haptic('light')
                      toggleLike(track.id)
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-paper/85 backdrop-blur flex items-center justify-center"
                  >
                    <HeartIcon size={14} filled={track.liked} className={track.liked ? 'text-accent' : ''} />
                  </button>
                </div>
                <p className="text-[13.5px] font-semibold mt-2 truncate">{track.title}</p>
                <p className="text-[12px] text-muted truncate">{track.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <UploadSheet open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  )
}
