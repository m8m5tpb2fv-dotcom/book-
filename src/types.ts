export type RepeatMode = 'off' | 'all' | 'one'

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  albumId?: string
  duration: number
  coverDataUrl?: string
  genre?: string
  addedAt: number
  liked: boolean
  playCount: number
}

export interface Album {
  id: string
  title: string
  artist: string
  coverDataUrl?: string
  trackIds: string[]
  createdAt: number
}

export interface Playlist {
  id: string
  title: string
  description?: string
  coverDataUrl?: string
  trackIds: string[]
  createdAt: number
}

export interface LibrarySnapshot {
  tracks: Track[]
  albums: Album[]
  playlists: Playlist[]
}
