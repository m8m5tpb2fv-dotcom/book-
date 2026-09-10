export async function fileToSquareDataUrl(file: File, size = 400): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const scale = Math.max(size / bitmap.width, size / bitmap.height)
  const drawWidth = bitmap.width * scale
  const drawHeight = bitmap.height * scale
  const dx = (size - drawWidth) / 2
  const dy = (size - drawHeight) / 2

  ctx.drawImage(bitmap, dx, dy, drawWidth, drawHeight)
  return canvas.toDataURL('image/jpeg', 0.85)
}
