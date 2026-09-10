import { useRef, useState } from 'react'
import { Sheet } from '../common/Sheet'
import { useLibraryStore } from '../../store/library'
import { hapticNotify } from '../../lib/telegram'
import { UploadIcon } from '../icons'

export function UploadSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const importFiles = useLibraryStore((s) => s.importFiles)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [imported, setImported] = useState(0)
  const [total, setTotal] = useState(0)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    setTotal(files.length)
    setImported(0)
    setIsImporting(true)
    await importFiles(files)
    setImported(files.length)
    hapticNotify('success')
    setIsImporting(false)
    setTimeout(() => {
      onClose()
      setTotal(0)
      setImported(0)
    }, 600)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Добавить музыку">
      <div className="px-5 pb-8 flex flex-col gap-4">
        <p className="text-sm text-muted">
          Загрузите аудиофайлы (MP3, M4A, WAV, FLAC, OGG) с устройства. Название, исполнитель, альбом и обложка
          определяются автоматически по тегам файла — их всегда можно изменить вручную.
        </p>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isImporting}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-2xl py-10 active:bg-surface disabled:opacity-60"
        >
          <UploadIcon size={26} className="text-muted" />
          <span className="font-semibold text-[15px]">
            {isImporting ? `Импорт… ${imported}/${total}` : 'Выбрать файлы'}
          </span>
          <span className="text-xs text-muted">или перетащите сюда</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.flac,.ogg,.aac"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="rounded-2xl bg-surface-2 px-4 py-3 text-xs text-muted leading-relaxed">
          Файлы хранятся локально на этом устройстве, в библиотеке Mini App — они не отправляются на сервер и
          доступны офлайн.
        </div>
      </div>
    </Sheet>
  )
}
