const gradients = [
  ['#d7ff3b', '#0b0b0c'],
  ['#ff5c8a', '#1a0b12'],
  ['#5cc9ff', '#0b1420'],
  ['#ffb84d', '#1c1206'],
  ['#9b8cff', '#120b1c'],
  ['#3bffd0', '#06201c'],
  ['#ff7a45', '#1c0d06'],
  ['#e0e0d8', '#141414'],
]

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function gradientFor(seed: string): [string, string] {
  const idx = hashString(seed) % gradients.length
  return gradients[idx] as [string, string]
}

export function initialsFor(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return '·'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
