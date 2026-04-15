import type { Tool } from '@/types'

export const tools: Tool[] = [
  { id: 'after-effects', name: 'After Effects', iconSrc: '/images/tools/ae.svg', category: 'vfx' },
  { id: 'premiere', name: 'Premiere Pro', iconSrc: '/images/tools/pr.svg', category: 'editing' },
  { id: 'blender', name: 'Blender', iconSrc: '/images/tools/blender.svg', category: '3d' },
  { id: 'davinci', name: 'DaVinci Resolve', iconSrc: '/images/tools/davinci.svg', category: 'color' },
  { id: 'cinema-4d', name: 'Cinema 4D', iconSrc: '/images/tools/c4d.svg', category: '3d' },
  { id: 'nuke', name: 'Nuke', iconSrc: '/images/tools/nuke.svg', category: 'vfx' },
]
