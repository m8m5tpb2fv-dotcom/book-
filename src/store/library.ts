import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { idbStateStorage, saveTrackBlob, deleteTrackBlob } from '../lib/db'
import { parseTrackMetadata } from '../lib/metadata'
import { createId } from '../lib/id'
import type { Album, Playlist, Track } from '../types'

interface NewAlbumInput {
  title: string
  artist: string
  coverDataUrl?: string
  trackIds?: string[]
}

interface NewPlaylistInput {
  title: string
  description?: string
  coverDataUrl?: string
  trackIds?: string[]
}

interface LibraryState {
  tracks: Track[]
  albums: Album[]
  playlists: Playlist[]
  hasHydrated: boolean

  setHasHydrated: (v: boolean) => void
  importFiles: (files: File[]) => Promise<Track[]>
  updateTrack: (id: string, patch: Partial<Track>) => void
  deleteTrack: (id: string) => Promise<void>
  toggleLike: (id: string) => void
  registerPlay: (id: string) => void

  createAlbum: (input: NewAlbumInput) => Album
  updateAlbum: (id: string, patch: Partial<Album>) => void
  deleteAlbum: (id: string, deleteTracks?: boolean) => Promise<void>
  addTracksToAlbum: (albumId: string, trackIds: string[]) => void
  removeTrackFromAlbum: (albumId: string, trackId: string) => void

  createPlaylist: (input: NewPlaylistInput) => Playlist
  updatePlaylist: (id: string, patch: Partial<Playlist>) => void
  deletePlaylist: (id: string) => void
  addTracksToPlaylist: (playlistId: string, trackIds: string[]) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      tracks: [],
      albums: [],
      playlists: [],
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      importFiles: async (files) => {
        const audioFiles = files.filter((f) => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(f.name))
        const newTracks: Track[] = []
        for (const file of audioFiles) {
          const meta = await parseTrackMetadata(file)
          const id = createId('track')
          await saveTrackBlob(id, file)
          newTracks.push({
            id,
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            duration: meta.duration,
            coverDataUrl: meta.coverDataUrl,
            genre: meta.genre,
            addedAt: Date.now(),
            liked: false,
            playCount: 0,
          })
        }
        if (newTracks.length > 0) {
          set({ tracks: [...newTracks, ...get().tracks] })
        }
        return newTracks
      },

      updateTrack: (id, patch) => {
        set({ tracks: get().tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
      },

      deleteTrack: async (id) => {
        await deleteTrackBlob(id)
        set({
          tracks: get().tracks.filter((t) => t.id !== id),
          albums: get().albums.map((a) => ({ ...a, trackIds: a.trackIds.filter((tid) => tid !== id) })),
          playlists: get().playlists.map((p) => ({ ...p, trackIds: p.trackIds.filter((tid) => tid !== id) })),
        })
      },

      toggleLike: (id) => {
        set({ tracks: get().tracks.map((t) => (t.id === id ? { ...t, liked: !t.liked } : t)) })
      },

      registerPlay: (id) => {
        set({ tracks: get().tracks.map((t) => (t.id === id ? { ...t, playCount: t.playCount + 1 } : t)) })
      },

      createAlbum: (input) => {
        const album: Album = {
          id: createId('album'),
          title: input.title,
          artist: input.artist,
          coverDataUrl: input.coverDataUrl,
          trackIds: input.trackIds ?? [],
          createdAt: Date.now(),
        }
        set({ albums: [album, ...get().albums] })
        if (input.trackIds?.length) {
          set({
            tracks: get().tracks.map((t) =>
              input.trackIds!.includes(t.id) ? { ...t, album: album.title, albumId: album.id } : t,
            ),
          })
        }
        return album
      },

      updateAlbum: (id, patch) => {
        set({ albums: get().albums.map((a) => (a.id === id ? { ...a, ...patch } : a)) })
      },

      deleteAlbum: async (id, deleteTracks = false) => {
        const album = get().albums.find((a) => a.id === id)
        if (deleteTracks && album) {
          for (const trackId of album.trackIds) {
            await deleteTrackBlob(trackId)
          }
          set({ tracks: get().tracks.filter((t) => !album.trackIds.includes(t.id)) })
        } else if (album) {
          set({
            tracks: get().tracks.map((t) =>
              album.trackIds.includes(t.id) ? { ...t, albumId: undefined } : t,
            ),
          })
        }
        set({ albums: get().albums.filter((a) => a.id !== id) })
      },

      addTracksToAlbum: (albumId, trackIds) => {
        const album = get().albums.find((a) => a.id === albumId)
        if (!album) return
        const merged = Array.from(new Set([...album.trackIds, ...trackIds]))
        set({
          albums: get().albums.map((a) => (a.id === albumId ? { ...a, trackIds: merged } : a)),
          tracks: get().tracks.map((t) =>
            trackIds.includes(t.id) ? { ...t, album: album.title, albumId: album.id } : t,
          ),
        })
      },

      removeTrackFromAlbum: (albumId, trackId) => {
        set({
          albums: get().albums.map((a) =>
            a.id === albumId ? { ...a, trackIds: a.trackIds.filter((id) => id !== trackId) } : a,
          ),
          tracks: get().tracks.map((t) => (t.id === trackId ? { ...t, albumId: undefined } : t)),
        })
      },

      createPlaylist: (input) => {
        const playlist: Playlist = {
          id: createId('playlist'),
          title: input.title,
          description: input.description,
          coverDataUrl: input.coverDataUrl,
          trackIds: input.trackIds ?? [],
          createdAt: Date.now(),
        }
        set({ playlists: [playlist, ...get().playlists] })
        return playlist
      },

      updatePlaylist: (id, patch) => {
        set({ playlists: get().playlists.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
      },

      deletePlaylist: (id) => {
        set({ playlists: get().playlists.filter((p) => p.id !== id) })
      },

      addTracksToPlaylist: (playlistId, trackIds) => {
        set({
          playlists: get().playlists.map((p) =>
            p.id === playlistId
              ? { ...p, trackIds: Array.from(new Set([...p.trackIds, ...trackIds])) }
              : p,
          ),
        })
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set({
          playlists: get().playlists.map((p) =>
            p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p,
          ),
        })
      },
    }),
    {
      name: 'wave-library',
      storage: {
        getItem: async (name) => {
          const value = await idbStateStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name, value) => {
          await idbStateStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name) => {
          await idbStateStorage.removeItem(name)
        },
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
