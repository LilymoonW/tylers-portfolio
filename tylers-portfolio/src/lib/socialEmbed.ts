const IG_HOST = /^(www\.)?instagram\.com$/i
const TIKTOK_HOST = /^(www\.)?tiktok\.com$/i

/**
 * Returns an Instagram iframe `src` for post, reel, or reels permalinks.
 * Reels public URLs use `/reels/…` but embeds use `/reel/…/embed/`.
 */
function instagramEmbedFromUrl(url: URL): string | null {
  if (!IG_HOST.test(url.hostname)) return null
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null
  const [kind, codeRaw] = parts
  if (!codeRaw) return null
  const code = codeRaw.split('?')[0]
  if (kind === 'p') {
    return `https://www.instagram.com/p/${code}/embed/`
  }
  if (kind === 'reel' || kind === 'reels') {
    return `https://www.instagram.com/reel/${code}/embed/`
  }
  return null
}

/** TikTok watch URL → v2 embed used by the official embed player. */
function tiktokEmbedFromUrl(url: URL): string | null {
  if (!TIKTOK_HOST.test(url.hostname)) return null
  const m = url.pathname.match(/\/video\/(\d+)/)
  if (!m) return null
  return `https://www.tiktok.com/embed/v2/${m[1]}`
}

type SocialEmbed = {
  platform: 'instagram' | 'tiktok'
  src: string
}

/**
 * If `url` is an Instagram or TikTok permalink we can frame, returns the iframe `src`.
 * Other URLs (YouTube, relative paths, short links) return `null`.
 */
export function getSocialEmbedSrc(url: string): SocialEmbed | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  const ig = instagramEmbedFromUrl(parsed)
  if (ig) return { platform: 'instagram', src: ig }
  const tt = tiktokEmbedFromUrl(parsed)
  if (tt) return { platform: 'tiktok', src: tt }
  return null
}
