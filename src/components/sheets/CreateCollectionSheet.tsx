import { useRef, useState } from 'react'
import { Sheet } from '../common/Sheet'
import { Cover } from '../common/Cover'
import { useLibraryStore } from '../../store/library'
import { fileToSquareDataUrl } from '../../lib/image'
import { hapticNotify } from '../../lib/telegram'
import { PlusIcon } from '../icons'

interface Props {
  open: boolean
  onClose: () => void
  kind: 'album' | 'playlist'
  onCreated?: (id: string) => void
}

export function CreateCollectionSheet({ open, onClose, kind, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [cover, setCover] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const createAlbum = useLibraryStore((s) => s.createAlbum)
  const createPlaylist = useLibraryStore((s) => s.createPlaylist)

  const reset = () => {
    setTitle('')
    setArtist('')
    setCover(undefined)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToSquareDataUrl(file)
    setCover(dataUrl)
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    if (kind === 'album') {
      const album = createAlbum({ title: title.trim(), artist: artist.trim() || 'Разные исполнители', coverDataUrl: cover })
      onCreated?.(album.id)
    } else {
      const playlist = createPlaylist({ title: title.trim(), coverDataUrl: cover })
      onCreated?.(playlist.id)
    }
    hapticNotify('success')
    handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title={kind === 'album' ? 'Новый альбом' : 'Новый плейлист'}>
      <div className="px-5 pb-6 flex flex-col gap-4">
        <div className="flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative"
            aria-label="Загрузить обложку"
          >
            <Cover title={title || '?'} imageUrl={cover} size="lg" rounded="lg" />
            <span className="absolute -bottom-1.5 -right-1.5 bg-ink text-paper rounded-full p-1.5 border-2 border-paper">
              <PlusIcon size={14} />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Название</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === 'album' ? 'Например, Ночной эфир' : 'Например, Дорожный плейлист'}
            className="bg-surface-2 rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 ring-accent placeholder:text-muted"
          />
        </label>

        {kind === 'album' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Исполнитель</span>
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Исполнитель альбома"
              className="bg-surface-2 rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 ring-accent placeholder:text-muted"
            />
          </label>
        )}

        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="mt-1 w-full bg-ink text-paper font-semibold py-3 rounded-full active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          Создать
        </button>
      </div>
    </Sheet>
  )
}
