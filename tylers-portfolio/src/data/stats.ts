import type { Stat } from '@/types'

export const stats: Stat[] = [
  { id: 'views', label: 'Total Views', value: 15000000, suffix: '+', format: 'abbreviated' },
  { id: 'projects', label: 'Projects', value: 200, suffix: '+', format: 'number' },
  { id: 'brands', label: 'Brands', value: 50, suffix: '+', format: 'number' },
  { id: 'years', label: 'Years Experience', value: 5, suffix: '', format: 'number' },
]
