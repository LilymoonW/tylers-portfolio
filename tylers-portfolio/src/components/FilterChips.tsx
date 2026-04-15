'use client'

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
        className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${
          active.length === 0
            ? 'bg-bright-blue text-white border-bright-blue'
            : 'bg-transparent text-muted border-white/10 hover:border-white/30'
        }`}
        data-cursor="expand"
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${
            active.includes(tag)
              ? 'bg-bright-blue text-white border-bright-blue'
              : 'bg-transparent text-muted border-white/10 hover:border-white/30'
          }`}
          data-cursor="expand"
        >
          {tag.replace(/-/g, ' ')}
        </button>
      ))}
    </div>
  )
}
