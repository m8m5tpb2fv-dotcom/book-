type IconProps = { className?: string; size?: number }

const base = (size = 22) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function HomeIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function SearchIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

export function LibraryIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 5v14" />
      <path d="M10 5v14" />
      <path d="m16 5.5 4 1.2v12.6l-4-1.2z" />
    </svg>
  )
}

export function PlayIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)} fill="currentColor" stroke="none">
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  )
}

export function PauseIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)} fill="currentColor" stroke="none">
      <rect x="6" y="4.5" width="4.5" height="15" rx="1" />
      <rect x="13.5" y="4.5" width="4.5" height="15" rx="1" />
    </svg>
  )
}

export function NextIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)} fill="currentColor" stroke="none">
      <path d="M6 5v14l10-7z" />
      <rect x="17" y="5" width="2.2" height="14" rx="0.6" />
    </svg>
  )
}

export function PrevIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)} fill="currentColor" stroke="none">
      <path d="M18 5v14L8 12z" />
      <rect x="4.8" y="5" width="2.2" height="14" rx="0.6" />
    </svg>
  )
}

export function ShuffleIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="m3 6 4.5 0L15 18h5.5" />
      <path d="m17.5 4 3 2.5-3 2.5" />
      <path d="m3 18 4.5 0L12 12" />
      <path d="m17.5 20 3-2.5-3-2.5" />
    </svg>
  )
}

export function RepeatIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 8h13.5A2.5 2.5 0 0 1 20 10.5V13" />
      <path d="m7 5-3 3 3 3" />
      <path d="M20 16H6.5A2.5 2.5 0 0 1 4 13.5V11" />
      <path d="m17 19 3-3-3-3" />
    </svg>
  )
}

export function RepeatOneIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 8h13.5A2.5 2.5 0 0 1 20 10.5V13" />
      <path d="m7 5-3 3 3 3" />
      <path d="M20 16H6.5A2.5 2.5 0 0 1 4 13.5V11" />
      <path d="m17 19 3-3-3-3" />
      <text x="11" y="12.5" fontSize="7" fill="currentColor" stroke="none" fontWeight="700">1</text>
    </svg>
  )
}

export function HeartIcon({ className, size, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} {...base(size)} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20.5s-7.5-4.6-9.8-9.3C.7 7.6 2.3 4 6 4c2 0 3.4 1 6 3.6C14.6 5 16 4 18 4c3.7 0 5.3 3.6 3.8 7.2-2.3 4.7-9.8 9.3-9.8 9.3Z" />
    </svg>
  )
}

export function MoreIcon({ className, size = 20 }: IconProps) {
  return (
    <svg className={className} {...base(size)} fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="19" r="1.7" />
    </svg>
  )
}

export function PlusIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M12 4.5v15M4.5 12h15" />
    </svg>
  )
}

export function CloseIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  )
}

export function ChevronDownIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="m5 8 7 7 7-7" />
    </svg>
  )
}

export function QueueIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 6h13M4 12h13M4 18h9" />
      <path d="M19 15v6M16 18h6" />
    </svg>
  )
}

export function UploadIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

export function AlbumIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export function TelegramIcon({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.5 4.5 2.8 11.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.8-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.7l3-14.2c.3-1.2-.4-1.7-1.6-1.7ZM8.6 14.4l9-5.7c.4-.3.8-.1.5.2l-7.3 6.6-.3 3.1-1.4-4.2Z" />
    </svg>
  )
}

export function TrashIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 7h16" />
      <path d="M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7" />
      <path d="M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7" />
    </svg>
  )
}

export function EditIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" />
    </svg>
  )
}

export function PlaylistIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...base(size)}>
      <path d="M4 6h16M4 12h10M4 18h10" />
      <circle cx="18" cy="17.5" r="2.5" />
      <path d="M20.5 17.5V9" />
    </svg>
  )
}
