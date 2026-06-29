import { GRAIN_TILE_SIZE_PX } from '@/config/grain'
import { cn } from '@/lib/utils'

type FilmGrainProps = {
  className?: string
  /** Cover the viewport (paper pages) instead of a local background box. */
  fixed?: boolean
}

export default function FilmGrain({ className, fixed = false }: FilmGrainProps) {
  return (
    <div
      aria-hidden
      className={cn('film-grain pointer-events-none', fixed && 'fixed inset-0', className)}
      style={{ backgroundSize: `${GRAIN_TILE_SIZE_PX}px ${GRAIN_TILE_SIZE_PX}px` }}
    />
  )
}
