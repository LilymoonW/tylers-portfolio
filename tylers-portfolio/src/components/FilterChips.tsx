'use client'

import { bannerTypeControl } from '@/config/scrollBanner'
import { cn } from '@/lib/utils'

interface FilterChipsProps {
  tags: string[]
  active: string[]
  onToggle: (tag: string) => void
}

export default function FilterChips({ tags, active, onToggle }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => active.length > 0 && onToggle('__clear__')}
        className={cn(
          bannerTypeControl,
          'rounded-full border px-4 py-2 transition-all',
          active.length === 0
            ? 'border-bright-blue bg-bright-blue text-white'
            : 'border-white/10 bg-transparent text-white/70 hover:border-white/30'
        )}
        data-cursor="expand"
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={cn(
            bannerTypeControl,
            'rounded-full border px-4 py-2 transition-all',
            active.includes(tag)
              ? 'border-bright-blue bg-bright-blue text-white'
              : 'border-white/10 bg-transparent text-white/70 hover:border-white/30'
          )}
          data-cursor="expand"
        >
          {tag.replace(/-/g, ' ')}
        </button>
      ))}
    </div>
  )
}
