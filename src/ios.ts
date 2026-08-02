/** iOS Safari / standalone PWA helpers — game logic unchanged. */

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

export function setupIOSCompat(): void {
  document.documentElement.classList.toggle('is-ios', isIOS())
  document.documentElement.classList.toggle('is-standalone', isStandalone())

  // Avoid rubber-band scroll locking the whole page while still allowing panels to scroll.
  document.body.style.overscrollBehavior = 'none'

  // Keep visual viewport CSS vars updated for Safari toolbar show/hide.
  const vv = window.visualViewport
  const apply = () => {
    const height = vv?.height ?? window.innerHeight
    const offsetTop = vv?.offsetTop ?? 0
    document.documentElement.style.setProperty('--app-height', `${height}px`)
    document.documentElement.style.setProperty('--vv-offset-top', `${offsetTop}px`)
  }
  apply()
  vv?.addEventListener('resize', apply)
  vv?.addEventListener('scroll', apply)
  window.addEventListener('orientationchange', () => setTimeout(apply, 120))
}
