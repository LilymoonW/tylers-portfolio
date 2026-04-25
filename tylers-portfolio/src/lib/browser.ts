/**
 * True for WebKit Safari (macOS / iPadOS / iOS Safari). Excludes Chromium-based
 * browsers that also include "Safari" in the UA (Chrome, Edge, Opera, etc.).
 */
export function isSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (!/safari/i.test(ua)) return false
  if (/chrome|chromium|crios|fxios|edgios|opr\//i.test(ua)) return false
  return true
}

/** Chrome, Edge, Opera, Brave, etc. — useful for tuning GPU-heavy effects separately from Safari. */
export function isChromiumBasedBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /chrome|chromium|crios|edg\//i.test(navigator.userAgent)
}
