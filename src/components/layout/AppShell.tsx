import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { MiniPlayer } from '../player/MiniPlayer'
import { FullPlayer } from '../player/FullPlayer'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useTelegramBackButton } from '../../hooks/useTelegramChrome'
import { useLibraryStore } from '../../store/library'
import { usePlayerStore } from '../../store/player'

export function AppShell() {
  useAudioEngine()
  useTelegramBackButton()

  const tracks = useLibraryStore((s) => s.tracks)
  const syncTrackData = usePlayerStore((s) => s.syncTrackData)
  useEffect(() => {
    syncTrackData(tracks)
  }, [tracks, syncTrackData])

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <main className="pb-32" style={{ paddingTop: 'var(--safe-top)' }}>
        <Outlet />
      </main>
      <MiniPlayer />
      <BottomNav />
      <FullPlayer />
    </div>
  )
}
