import { useRef, useState } from 'react'
import { formatDuration } from '../../lib/format'

interface ProgressBarProps {
  position: number
  duration: number
  onSeek: (seconds: number) => void
}

export function ProgressBar({ position, duration, onSeek }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragValue, setDragValue] = useState<number | null>(null)

  const safeDuration = duration > 0 ? duration : 0.001
  const shown = dragValue ?? position
  const ratio = Math.min(1, Math.max(0, shown / safeDuration))

  const valueFromEvent = (clientX: number): number => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return r * safeDuration
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    setDragValue(valueFromEvent(e.clientX))
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragValue === null) return
    setDragValue(valueFromEvent(e.clientX))
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragValue !== null) {
      onSeek(valueFromEvent(e.clientX))
    }
    setDragValue(null)
  }

  return (
    <div>
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative h-6 flex items-center touch-none cursor-pointer group"
      >
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface-2" />
        <div
          className="absolute h-1.5 rounded-full bg-accent left-0"
          style={{ width: `${ratio * 100}%` }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-accent shadow-sm -translate-x-1/2"
          style={{ left: `${ratio * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted tabular-nums -mt-1">
        <span>{formatDuration(shown)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  )
}
