import { onMounted, onUnmounted } from 'vue'

// ===== useGuard: anti-redirect judol 3 lapis + blocklist terpusat =====
export const BLOCKED = [
  // keyword umum judol / judi
  'slot', 'togel', 'casino', 'gacor', 'maxwin', 'judol', 'judii', 'judi',
  'bonus', 'deposit', 'bandar', 'poker', 'domino', 'qq', 'qq188', 'qq288', 'qq88',
  'betting', 'sbotop', 'ibcbet', 's128', 'sv388', 'agen', 'agen138', 'daftar',
  'rtp', 'bigwin', 'totobet', 'toto', 'olxtoto', 'bolatangkas', 'bola tangkas',
  'live22', 'mega888', 'indobet', 'kakekmerah', 'raja slot', 'mahjong ways', 'spaceman',
  // domain blacklist spesifik
  'bossmahjong2.games', 'tonicgoverness.com', 'exclusive-spin.com',
  'omg10.com', 'ay267.com', 'pragmaticplay.net', 'hacksaw.gaming',
]

export const isBlocked = url => BLOCKED.some(k => (url || '').toLowerCase().includes(k))

const ALLOWED_ORIGINS = ['https://www.nobaryu.biz.id']

/**
 * Aktifkan guard selama player terbuka:
 *  Lapis 1 — polling 200ms: URL berubah ke URL yang ter-block / keluar domain → restore
 *  Lapis 2 — popstate: back setelah redirect blocklist → restore
 *  Lapis 3 — beforeunload: konfirm sebelum keluar saat modal terbuka
 */
export function useGuard({ onBlocked = null } = {}) {
  let timer = null
  let cleanup = null

  function activate() {
    deactivate()
    const origUrl = location.href
    const origOrigin = location.origin

    const isForeign = () =>
      location.origin !== origOrigin &&
      !ALLOWED_ORIGINS.includes(location.origin) &&
      !location.href.startsWith(origOrigin)

    const hit = () => {
      if (location.href !== origUrl && isBlocked(location.href)) return true
      return isForeign()
    }
    const restore = reason => {
      history.replaceState(null, '', origUrl)
      onBlocked && onBlocked(reason)
    }

    timer = setInterval(() => {
      if (hit()) restore('redirect')
    }, 200)

    const onPop = () => {
      if (location.href !== origUrl && isBlocked(location.href)) {
        history.replaceState(null, '', origUrl)
      }
    }
    const onUnload = e => {
      if (document.getElementById('modal')?.classList.contains('open')) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('beforeunload', onUnload)

    cleanup = () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('beforeunload', onUnload)
    }
  }

  function deactivate() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  onUnmounted(deactivate)

  return { activate, deactivate }
}
