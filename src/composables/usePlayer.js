import { ref, onMounted, onUnmounted } from 'vue'
import { slugify } from '../services/api'
import { isBlocked } from './useGuard'

// ===== usePlayer: buka player, pilih server, remember pilihan =====
const KEY = 'nobaryu-server-prefs'

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function usePlayer({ onOpen = null, onClose = null, onBlocked = null } = {}) {
  const open = ref(false)
  const match = ref(null)
  const activeIdx = ref(0)
  const frameUrl = ref('')
  let prefs = loadPrefs()

  function openPlayer(m) {
    match.value = m
    const servers = m.iframes || []
    const fav = prefs[slugify(m.tag)]
    // prefer server favorit; fallback server HD/FHD kalau ada
    if (fav != null && servers[fav]) {
      activeIdx.value = fav
    } else {
      const hdIdx = servers.findIndex(s => /hd|fhd|1080/i.test(s.server || ''))
      activeIdx.value = hdIdx >= 0 ? hdIdx : 0
    }
    // set frame ke server aktif (default server pertama/favorit)
    frameUrl.value = servers[activeIdx.value]?.url || ''
    open.value = true
    onOpen && onOpen(m)
  }

  function selectServer(i) {
    if (!match.value) return
    const servers = match.value.iframes || []
    const s = servers[i]
    if (!s) return
    if (isBlocked(s.url)) {
      onBlocked && onBlocked('Server ini tidak tersedia. Coba server lain.')
      return
    }
    activeIdx.value = i
    prefs[slugify(match.value.tag)] = i
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs))
    } catch { /* noop */ }
    frameUrl.value = s.url
  }

  function close() {
    open.value = false
    match.value = null
    frameUrl.value = ''
    activeIdx.value = 0
    // reset hash supaya deep-link gak nyangkut & gak ke-reopen via hashchange
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search)
    }
    onClose && onClose()
  }

  // ESC close
  function onKey(e) {
    if (e.key === 'Escape') close()
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onUnmounted(() => window.removeEventListener('keydown', onKey))

  return {
    open, match, activeIdx, frameUrl,
    openPlayer, selectServer, close,
  }
}
