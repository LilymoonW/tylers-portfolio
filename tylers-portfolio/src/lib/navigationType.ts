/**
 * Was this page view reached with Back / Forward?
 *
 * Two cases: the document itself was loaded that way (full reload of a history
 * entry, or a bfcache miss), which `PerformanceNavigationTiming.type` reports and
 * which only counts for the first mount after load; or the App Router navigated in
 * response to a `popstate`, which a module-level listener records so a mount that
 * follows it within a short window can tell the difference from a fresh click.
 *
 * Used to skip forced scroll-to-top so the browser can restore the visitor's spot.
 */
let popstateAt = 0
let initialMountConsumed = false

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    popstateAt = performance.now()
  })
}

const POPSTATE_WINDOW_MS = 1500

export function isBackForwardNavigation(): boolean {
  if (typeof window === 'undefined') return false
  if (popstateAt > 0 && performance.now() - popstateAt < POPSTATE_WINDOW_MS) return true
  if (!initialMountConsumed) {
    initialMountConsumed = true
    const entry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    return entry?.type === 'back_forward'
  }
  return false
}
