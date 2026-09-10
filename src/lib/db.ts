import { createStore, get, set, del } from 'idb-keyval'
import type { StateStorage } from 'zustand/middleware'

const blobStore = createStore('wave-player-blobs', 'audio-blobs')

export async function saveTrackBlob(trackId: string, blob: Blob): Promise<void> {
  await set(trackId, blob, blobStore)
}

export async function getTrackBlob(trackId: string): Promise<Blob | undefined> {
  return get(trackId, blobStore)
}

export async function deleteTrackBlob(trackId: string): Promise<void> {
  await del(trackId, blobStore)
}

const stateStore = createStore('wave-player-state', 'app-state')

export const idbStateStorage: StateStorage = {
  getItem: async (name) => {
    const value = await get(name, stateStore)
    return value ?? null
  },
  setItem: async (name, value) => {
    await set(name, value, stateStore)
  },
  removeItem: async (name) => {
    await del(name, stateStore)
  },
}

const urlCache = new Map<string, string>()

export async function getTrackObjectUrl(trackId: string): Promise<string | undefined> {
  const cached = urlCache.get(trackId)
  if (cached) return cached
  const blob = await getTrackBlob(trackId)
  if (!blob) return undefined
  const url = URL.createObjectURL(blob)
  urlCache.set(trackId, url)
  return url
}

export function revokeTrackObjectUrl(trackId: string): void {
  const cached = urlCache.get(trackId)
  if (cached) {
    URL.revokeObjectURL(cached)
    urlCache.delete(trackId)
  }
}
