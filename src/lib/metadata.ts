import { parseBlob } from 'music-metadata'

export interface ParsedTrackMeta {
  title: string
  artist: string
  album: string
  duration: number
  genre?: string
  coverDataUrl?: string
}

function fallbackTitleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

function bytesToDataUrl(bytes: Uint8Array, format: string): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return `data:${format};base64,${btoa(binary)}`
}

export async function parseTrackMetadata(file: File): Promise<ParsedTrackMeta> {
  try {
    const parsed = await parseBlob(file, { duration: true, skipCovers: false })
    const { common, format } = parsed
    const cover = common.picture?.[0]

    return {
      title: common.title?.trim() || fallbackTitleFromFileName(file.name),
      artist: common.artist?.trim() || common.albumartist?.trim() || 'Неизвестный исполнитель',
      album: common.album?.trim() || 'Без альбома',
      duration: format.duration ?? 0,
      genre: common.genre?.[0],
      coverDataUrl: cover ? bytesToDataUrl(cover.data, cover.format) : undefined,
    }
  } catch {
    return {
      title: fallbackTitleFromFileName(file.name),
      artist: 'Неизвестный исполнитель',
      album: 'Без альбома',
      duration: 0,
    }
  }
}
