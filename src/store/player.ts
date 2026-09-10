import { create } from 'zustand'
import type { RepeatMode, Track } from '../types'

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface PlayerState {
  baseQueue: Track[]
  activeQueue: Track[]
  currentIndex: number
  isPlaying: boolean
  position: number
  duration: number
  shuffle: boolean
  repeat: RepeatMode
  volume: number
  isFullPlayerOpen: boolean
  seekTarget: number | null
  seekVersion: number

  currentTrack: () => Track | undefined
  playQueue: (tracks: Track[], startIndex?: number) => void
  playTrackNext: (track: Track) => void
  addToQueueEnd: (track: Track) => void
  togglePlay: () => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  reportPosition: (seconds: number) => void
  reportDuration: (seconds: number) => void
  reportEnded: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setVolume: (v: number) => void
  openFullPlayer: () => void
  closeFullPlayer: () => void
  removeFromQueue: (trackId: string) => void
  syncTrackData: (tracks: Track[]) => void
  jumpTo: (index: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  baseQueue: [],
  activeQueue: [],
  currentIndex: -1,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off',
  volume: 1,
  isFullPlayerOpen: false,
  seekTarget: null,
  seekVersion: 0,

  currentTrack: () => {
    const { activeQueue, currentIndex } = get()
    return currentIndex >= 0 ? activeQueue[currentIndex] : undefined
  },

  playQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return
    const { shuffle } = get()
    if (shuffle) {
      const startTrack = tracks[startIndex]
      const rest = tracks.filter((_, i) => i !== startIndex)
      const shuffled = [startTrack, ...shuffleArray(rest)]
      set({
        baseQueue: tracks,
        activeQueue: shuffled,
        currentIndex: 0,
        isPlaying: true,
        position: 0,
        duration: startTrack.duration,
      })
    } else {
      set({
        baseQueue: tracks,
        activeQueue: tracks,
        currentIndex: startIndex,
        isPlaying: true,
        position: 0,
        duration: tracks[startIndex]?.duration ?? 0,
      })
    }
  },

  playTrackNext: (track) => {
    const { activeQueue, baseQueue, currentIndex } = get()
    const nextActive = [...activeQueue]
    nextActive.splice(currentIndex + 1, 0, track)
    set({ activeQueue: nextActive, baseQueue: [...baseQueue, track] })
  },

  addToQueueEnd: (track) => {
    const { activeQueue, baseQueue } = get()
    set({ activeQueue: [...activeQueue, track], baseQueue: [...baseQueue, track] })
  },

  togglePlay: () => {
    const { isPlaying, activeQueue } = get()
    if (activeQueue.length === 0) return
    set({ isPlaying: !isPlaying })
  },
  pause: () => set({ isPlaying: false }),
  resume: () => {
    if (get().activeQueue.length > 0) set({ isPlaying: true })
  },

  next: () => {
    const { activeQueue, currentIndex, repeat } = get()
    if (activeQueue.length === 0) return
    if (repeat === 'one') {
      set({ seekTarget: 0, seekVersion: get().seekVersion + 1, position: 0 })
      return
    }
    let nextIndex = currentIndex + 1
    if (nextIndex >= activeQueue.length) {
      if (repeat === 'all') nextIndex = 0
      else {
        set({ isPlaying: false, position: 0, seekTarget: 0, seekVersion: get().seekVersion + 1 })
        return
      }
    }
    set({
      currentIndex: nextIndex,
      position: 0,
      duration: activeQueue[nextIndex]?.duration ?? 0,
      isPlaying: true,
    })
  },

  prev: () => {
    const { activeQueue, currentIndex, position, repeat } = get()
    if (activeQueue.length === 0) return
    if (position > 3) {
      set({ seekTarget: 0, seekVersion: get().seekVersion + 1, position: 0 })
      return
    }
    let prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      if (repeat === 'all') prevIndex = activeQueue.length - 1
      else prevIndex = 0
    }
    set({
      currentIndex: prevIndex,
      position: 0,
      duration: activeQueue[prevIndex]?.duration ?? 0,
      isPlaying: true,
    })
  },

  seek: (seconds) => set({ seekTarget: seconds, seekVersion: get().seekVersion + 1, position: seconds }),

  reportPosition: (seconds) => set({ position: seconds }),
  reportDuration: (seconds) => set({ duration: seconds }),
  reportEnded: () => get().next(),

  toggleShuffle: () => {
    const { shuffle, activeQueue, baseQueue, currentIndex } = get()
    const current = activeQueue[currentIndex]
    if (!shuffle) {
      const rest = baseQueue.filter((t) => t.id !== current?.id)
      const shuffled = current ? [current, ...shuffleArray(rest)] : shuffleArray(baseQueue)
      set({ shuffle: true, activeQueue: shuffled, currentIndex: 0 })
    } else {
      const restoredIndex = current ? baseQueue.findIndex((t) => t.id === current.id) : 0
      set({ shuffle: false, activeQueue: baseQueue, currentIndex: Math.max(restoredIndex, 0) })
    }
  },

  cycleRepeat: () => {
    const order: RepeatMode[] = ['off', 'all', 'one']
    const idx = order.indexOf(get().repeat)
    set({ repeat: order[(idx + 1) % order.length] })
  },

  setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),

  openFullPlayer: () => set({ isFullPlayerOpen: true }),
  closeFullPlayer: () => set({ isFullPlayerOpen: false }),

  removeFromQueue: (trackId) => {
    const { activeQueue, baseQueue, currentIndex } = get()
    const removingCurrent = activeQueue[currentIndex]?.id === trackId
    const newActive = activeQueue.filter((t) => t.id !== trackId)
    const newBase = baseQueue.filter((t) => t.id !== trackId)
    let newIndex = currentIndex
    if (removingCurrent) {
      newIndex = Math.min(currentIndex, newActive.length - 1)
    } else {
      const oldTrackId = activeQueue[currentIndex]?.id
      newIndex = newActive.findIndex((t) => t.id === oldTrackId)
    }
    set({ activeQueue: newActive, baseQueue: newBase, currentIndex: newIndex })
  },

  jumpTo: (index) => {
    const { activeQueue } = get()
    if (index < 0 || index >= activeQueue.length) return
    set({ currentIndex: index, position: 0, duration: activeQueue[index]?.duration ?? 0, isPlaying: true })
  },

  syncTrackData: (tracks) => {
    const byId = new Map(tracks.map((t) => [t.id, t]))
    const { activeQueue, baseQueue } = get()
    set({
      activeQueue: activeQueue.map((t) => byId.get(t.id) ?? t),
      baseQueue: baseQueue.map((t) => byId.get(t.id) ?? t),
    })
  },
}))
