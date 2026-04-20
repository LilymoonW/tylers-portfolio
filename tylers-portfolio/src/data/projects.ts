import type { Project } from '@/types'

/** Each `id` matches `title`. Raster thumbnails use a URL-safe filename derived from the title under `public/images/thumbnails/`. */
export const projects: Project[] = [
  {
    id: 'Abdul Carter 32 Team Swap',
    title: 'Abdul Carter 32 Team Swap',
    duration: '0:04',
    year: 2025,
    role: 'VFX Editor',
    bio: 'Ahead of the 2025 NFL Draft, Penn State Football wanted to create a social reel to build hype. This video worked well, because by editing the team\'s top prospect into every NFL team\'s jersey, it reached a larger audience and gave a reason to continue rewatching the video. \n \nThe process of making this video was more complicated than most video jersey swaps, mostly due to the rotation of the player in the clip. In a typical workflow, I\'d just need one mesh track for the whole video; in this video, though, I needed new tracking points as areas of the player revealed and dissapeared in the rotation. Often, this would be problematic, as the cut to each new track would cause inconsistencies in the edited jersey - but since this video is already switching from jersey to jersey rapidly, such inconsistencies were ironed out. \n \nThis is one of my favorite videos that I\'ve ever done!',
    thumbnail: '/images/thumbnails/abdul-carter-32-team-swap.png',
    videoSrc: '/video/abdul-media.mp4',
    cardHref: 'https://www.instagram.com/p/DIorXKlunws/',
    embedUrl: 'https://www.instagram.com/p/DIorXKlunws/',
    tags: ['vfx'],
    viewCount: 1900000,
    toolsUsed: ['after-effects'],
    brand: 'Penn State Football',
    featured: true,
    aspectRatio: '9:16',
  },
  {
    id: 'World Series Champions',
    title: 'World Series Champs',
    duration: '1:43',
    year: 2025,
    role: 'VFX Editor, Editor',
    bio: 'Add World Series Champions project bio here.',
    thumbnail: '/images/thumbnails/world-series-champions.png',
    thumbnailZoom: 1.1,
    cardHref: 'https://www.instagram.com/reels/DQi5Si8Dkxr/',
    embedUrl: 'https://www.instagram.com/reels/DQi5Si8Dkxr/',
    tags: ['vfx', 'editing'],
    viewCount: 1000000,
    toolsUsed: ['after-effects', 'blender', 'premiere pro'],
    brand: 'MLB',
    featured: true,
    aspectRatio: '9:16',
  },
  {
    id: 'Ohtani | Japan x LA',
    title: 'Ohtani | Japan x LA',
    duration: '0:12',
    year: 2025,
    role: 'VFX',
    bio: 'Add Ohtani project bio here.',
    thumbnail: '/images/thumbnails/ohtani-japan-x-la.png',
    cardHref: 'https://www.instagram.com/p/DHUZZDOzWj4/',
    embedUrl: 'https://www.instagram.com/p/DHUZZDOzWj4/',
    tags: ['vfx'],
    viewCount: 2000000,
    toolsUsed: ['after-effects'],
    brand: 'MLB',
    featured: true,
    aspectRatio: '9:16',
  },
  {
    id: 'All Roads Lead Here',
    title: 'All Roads Lead Here',
    duration: '0:43',
    year: 2024,
    role: 'VFX Editor',
    bio: 'Add All Roads Lead Here project bio here.',
    thumbnail: '/images/thumbnails/all-roads-lead-here.png',
    cardHref: 'https://www.tiktok.com/@espn/video/7377078062736772383',
    embedUrl: 'https://www.tiktok.com/@espn/video/7377078062736772383',
    tags: ['collaborative', 'vfx'],
    viewCount: 8900000,
    toolsUsed: ['after-effects', 'collaborative'],
    brand: 'ESPN',
    featured: true,
    aspectRatio: '9:16',
  },
  {
    id: 'Drift',
    title: 'Drift',
    duration: '2:00',
    year: 2023,
    role: 'Editor',
    bio: 'Add Drift project bio here.',
    thumbnail: '/images/thumbnails/placeholder.svg',
    embedUrl: 'https://player.vimeo.com/video/000000004',
    tags: ['short-film', 'narrative'],
    viewCount: 350000,
    toolsUsed: ['premiere', 'davinci'],
    brand: 'Independent',
    featured: false,
    aspectRatio: '9:16',
  },
  {
    id: 'Pull Up the Picture...',
    title: 'Pull Up the Picture...',
    duration: '1:00',
    year: 2024,
    role: 'Editor',
    bio: 'Add Pull Up the Picture project bio here.',
    thumbnail: '/images/thumbnails/pull-up-the-picture.png',
    cardHref: 'https://www.instagram.com/p/C5_eP8rOHwf',
    embedUrl: 'https://www.instagram.com/p/C5_eP8rOHwf',
    tags: ['social', 'podcast'],
    viewCount: 4400000,
    toolsUsed: ['premiere'],
    brand: 'Playmaker',
    featured: true,
    aspectRatio: '9:16',
  },
  ...buildPlaceholders(),
]

/**
 * Placeholder projects that fill the 3D wheel until finalized cuts are slotted
 * in. They all share the generic `/placeholder.svg` thumbnail so the wheel can
 * detect them and render a generated gradient cover in its place. Brand / tag /
 * year values are intentionally varied so the SORT filters still read as a
 * meaningful CMS even before real thumbnails land.
 */
function buildPlaceholders() {
  const seeds: Array<{
    title: string
    brand: string
    tags: string[]
    year: number
    role: string
    duration: string
    tools: string[]
  }> = [
    { title: 'Untitled Project 07', brand: 'ESPN', tags: ['editing', 'vfx'], year: 2025, role: 'Editor', duration: '0:45', tools: ['premiere'] },
    { title: 'Untitled Project 08', brand: 'NBA', tags: ['vfx', 'social'], year: 2025, role: 'VFX Editor', duration: '0:30', tools: ['after-effects'] },
    { title: 'Untitled Project 09', brand: 'Nike', tags: ['editing', 'commercial'], year: 2024, role: 'Editor', duration: '0:60', tools: ['premiere', 'davinci'] },
    { title: 'Untitled Project 10', brand: 'MLB', tags: ['vfx', 'hype'], year: 2025, role: 'VFX Editor', duration: '0:20', tools: ['after-effects'] },
    { title: 'Untitled Project 11', brand: 'Penn State Football', tags: ['vfx'], year: 2024, role: 'VFX', duration: '0:15', tools: ['after-effects'] },
    { title: 'Untitled Project 12', brand: 'NFL', tags: ['editing', 'hype'], year: 2024, role: 'Editor', duration: '0:45', tools: ['premiere'] },
    { title: 'Untitled Project 13', brand: 'Bleacher Report', tags: ['social', 'editing'], year: 2024, role: 'Editor', duration: '0:30', tools: ['premiere'] },
    { title: 'Untitled Project 14', brand: 'Playmaker', tags: ['social'], year: 2025, role: 'Editor', duration: '0:40', tools: ['premiere'] },
    { title: 'Untitled Project 15', brand: 'Adidas', tags: ['commercial', 'vfx'], year: 2025, role: 'VFX Editor', duration: '0:30', tools: ['after-effects', 'premiere'] },
    { title: 'Untitled Project 16', brand: 'UFC', tags: ['hype', 'vfx'], year: 2024, role: 'VFX Editor', duration: '0:25', tools: ['after-effects'] },
    { title: 'Untitled Project 17', brand: 'Red Bull', tags: ['commercial', 'editing'], year: 2024, role: 'Editor', duration: '1:00', tools: ['premiere', 'davinci'] },
    { title: 'Untitled Project 18', brand: 'Independent', tags: ['narrative', 'short-film'], year: 2023, role: 'Editor', duration: '2:30', tools: ['premiere', 'davinci'] },
    { title: 'Untitled Project 19', brand: 'ESPN', tags: ['hype', 'editing'], year: 2025, role: 'Editor', duration: '0:50', tools: ['premiere'] },
    { title: 'Untitled Project 20', brand: 'MLB', tags: ['vfx', 'social'], year: 2025, role: 'VFX', duration: '0:18', tools: ['after-effects'] },
  ]

  return seeds.map<Project>((seed, i) => ({
    id: seed.title,
    title: seed.title,
    duration: seed.duration,
    year: seed.year,
    role: seed.role,
    bio: `Add ${seed.title} project bio here.`,
    thumbnail: '/images/thumbnails/placeholder.svg',
    embedUrl: `https://player.vimeo.com/video/placeholder-${i + 7}`,
    tags: seed.tags,
    viewCount: 0,
    toolsUsed: seed.tools,
    brand: seed.brand,
    featured: false,
    aspectRatio: '9:16',
  }))
}
