import { createStore, get, set, del, type UseStore } from 'idb-keyval'
import type { StateStorage } from 'zustand/middleware'

function isIndexedDbUsable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

const hasIdb = isIndexedDbUsable()

function safeCreateStore(dbName: string, storeName: string): UseStore | undefined {
  if (!hasIdb) return undefined
  try {
    return createStore(dbName, storeName)
  } catch {
    return undefined
  }
}

// --- Track audio blobs ---
// Falls back to an in-memory Map when IndexedDB is unavailable or blocked
// (some Telegram WebView environments restrict it) so the app still mounts
// and plays audio for the session instead of crashing at import time.
const blobStore = safeCreateStore('wave-player-blobs', 'audio-blobs')
const memoryBlobStore = new Map<string, Blob>()

export async function saveTrackBlob(trackId: string, blob: Blob): Promise<void> {
  if (!blobStore) {
    memoryBlobStore.set(trackId, blob)
    return
  }
  try {
    await set(trackId, blob, blobStore)
  } catch {
    memoryBlobStore.set(trackId, blob)
  }
}

export async function getTrackBlob(trackId: string): Promise<Blob | undefined> {
  if (!blobStore) return memoryBlobStore.get(trackId)
  try {
    return (await get(trackId, blobStore)) ?? memoryBlobStore.get(trackId)
  } catch {
    return memoryBlobStore.get(trackId)
  }
}

export async function deleteTrackBlob(trackId: string): Promise<void> {
  memoryBlobStore.delete(trackId)
  if (!blobStore) return
  try {
    await del(trackId, blobStore)
  } catch {
    // ignore
  }
}

// --- Persisted app state (library metadata) ---
const stateStore = safeCreateStore('wave-player-state', 'app-state')
const memoryState = new Map<string, string>()

export const idbStateStorage: StateStorage = {
  getItem: async (name) => {
    if (!stateStore) return memoryState.get(name) ?? null
    try {
      const value = await get(name, stateStore)
      return value ?? null
    } catch {
      return memoryState.get(name) ?? null
    }
  },
  setItem: async (name, value) => {
    if (!stateStore) {
      memoryState.set(name, value)
      return
    }
    try {
      await set(name, value, stateStore)
    } catch {
      memoryState.set(name, value)
    }
  },
  removeItem: async (name) => {
    memoryState.delete(name)
    if (!stateStore) return
    try {
      await del(name, stateStore)
    } catch {
      // ignore
    }
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
