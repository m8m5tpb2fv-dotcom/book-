import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/player'
import { useLibraryStore } from '../store/library'
import { getTrackObjectUrl } from '../lib/db'

export function useAudioEngine(): void {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadedTrackId = useRef<string | undefined>(undefined)

  if (!audioRef.current && typeof window !== 'undefined') {
    audioRef.current = new Audio()
    audioRef.current.preload = 'metadata'
  }

  const activeQueue = usePlayerStore((s) => s.activeQueue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const seekVersion = usePlayerStore((s) => s.seekVersion)
  const seekTarget = usePlayerStore((s) => s.seekTarget)
  const reportPosition = usePlayerStore((s) => s.reportPosition)
  const reportDuration = usePlayerStore((s) => s.reportDuration)
  const reportEnded = usePlayerStore((s) => s.reportEnded)
  const registerPlay = useLibraryStore((s) => s.registerPlay)

  const currentTrack = currentIndex >= 0 ? activeQueue[currentIndex] : undefined

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (loadedTrackId.current === currentTrack.id) return

    let cancelled = false
    loadedTrackId.current = currentTrack.id

    getTrackObjectUrl(currentTrack.id).then((url) => {
      if (cancelled || !url || !audio) return
      audio.src = url
      audio.currentTime = 0
      if (isPlaying) {
        audio.play().catch(() => {})
        registerPlay(currentTrack.id)
      }
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || seekTarget === null) return
    audio.currentTime = seekTarget
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekVersion])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let raf = 0
    const tick = () => {
      reportPosition(audio.currentTime)
      raf = requestAnimationFrame(tick)
    }

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) reportDuration(audio.duration)
    }
    const onEnded = () => reportEnded()
    const onPlay = () => {
      raf = requestAnimationFrame(tick)
    }
    const onPause = () => cancelAnimationFrame(raf)

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      cancelAnimationFrame(raf)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
