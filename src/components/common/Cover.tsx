import clsx from 'clsx'
import { gradientFor, initialsFor } from '../../lib/palette'

interface CoverProps {
  title: string
  imageUrl?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'md' | 'lg' | 'full'
  className?: string
}

const sizeClasses: Record<NonNullable<CoverProps['size']>, string> = {
  xs: 'w-10 h-10 text-xs',
  sm: 'w-14 h-14 text-sm',
  md: 'w-20 h-20 text-base',
  lg: 'w-36 h-36 text-2xl',
  xl: 'w-full aspect-square text-5xl',
}

const roundedClasses: Record<NonNullable<CoverProps['rounded']>, string> = {
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
}

export function Cover({ title, imageUrl, size = 'md', rounded = 'lg', className }: CoverProps) {
  const [from, to] = gradientFor(title)

  return (
    <div
      className={clsx(
        'relative shrink-0 overflow-hidden flex items-center justify-center font-display font-extrabold select-none',
        sizeClasses[size],
        roundedClasses[rounded],
        className,
      )}
      style={
        imageUrl
          ? undefined
          : { background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`, color: to === '#0b0b0c' ? '#0b0b0c' : '#f5f4ef' }
      }
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <span className="opacity-90 tracking-tight">{initialsFor(title)}</span>
      )}
    </div>
  )
}
