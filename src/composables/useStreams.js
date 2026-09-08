import { ref, computed } from 'vue'
import { fetchStreams, statusOf, slugify } from '../services/api'

// ===== useStreams: singleton state dipakai semua halaman =====

const COOLDOWN = 30000
const AUTO_REFRESH = 60000

// module-level state → satu instance data di seluruh app
const rows = ref([])
const cat = ref('all')
const q = ref('')
const loading = ref(true)
const error = ref(null)
const updating = ref(false)
const lastFetch = ref(0)
const lastUpdate = ref(null)

let autoTimer = null

export function useStreams() {
  const filtered = computed(() => {
    const needle = q.value.trim().toLowerCase()
    return rows.value.filter(m => {
      const okCat = cat.value === 'all' || m.category === cat.value
      const okQ = !needle || `${m.tag} ${m.league} ${m.category}`.toLowerCase().includes(needle)
      return okCat && okQ
    })
  })

  const liveRows = computed(() => filtered.value.filter(m => statusOf(m) === 'live'))
  const upcomingRows = computed(() => filtered.value.filter(m => statusOf(m) === 'upcoming'))
  const endedRows = computed(() => filtered.value.filter(m => statusOf(m) === 'ended'))

  const stats = computed(() => ({
    live: rows.value.filter(m => statusOf(m) === 'live').length,
    upcoming: rows.value.filter(m => statusOf(m) === 'upcoming').length,
    total: rows.value.length,
  }))

  const byCategory = computed(() => {
    const map = {}
    for (const m of rows.value) {
      map[m.category] = (map[m.category] || 0) + 1
    }
    return map
  })

  const leagues = computed(() => {
    const s = new Set()
    for (const m of rows.value) {
      if (m.league) s.add(m.league)
    }
    return [...s].sort()
  })

  async function load(force = false) {
    const now = Date.now()
    if (!force && now - lastFetch.value < COOLDOWN && lastFetch.value) {
      const s = Math.ceil((COOLDOWN - (now - lastFetch.value)) / 1000)
      return { cooldown: s }
    }

    // === cache: pakai sessionStorage biar reload cepat (anti-buffer) ===
    if (!rows.value.length) {
      try {
        const cached = sessionStorage.getItem('nobaryu-cache')
        if (cached) {
          rows.value = JSON.parse(cached)
          loading.value = false
          lastUpdate.value = new Date()
        }
      } catch { /* noop */ }
    }

    lastFetch.value = now
    if (!loading.value) updating.value = true

    try {
      rows.value = await fetchStreams()
      lastUpdate.value = new Date()
      error.value = null
      // simpan ke cache (anti-buffer: reload gak perlu refetch)
      try { sessionStorage.setItem('nobaryu-cache', JSON.stringify(rows.value)) } catch { /* quota */ }
      return { ok: true }
    } catch (e) {
      console.error(e)
      error.value = e
      return { ok: false, err: e.message }
    } finally {
      loading.value = false
      updating.value = false
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    autoTimer = setInterval(() => load(false), AUTO_REFRESH)
  }
  function stopAutoRefresh() {
    if (autoTimer) {
      clearInterval(autoTimer)
      autoTimer = null
    }
  }

  function findMatchByHash() {
    const h = location.hash.slice(1)
    if (!h || !rows.value.length) return null
    return rows.value.find((x, i) => slugify(x.tag) + '-' + i === h) || null
  }

  function findMatchBySlug(slug) {
    // cari pakai slug API (m.slug) dulu — lebih stabil
    let m = rows.value.find(x => x.slug === slug)
    if (m) return m
    // fallback: cari pakai slugify(tag)+index (lama)
    return rows.value.find((x, i) => slugify(x.tag) + '-' + i === slug) || null
  }

  if (!autoTimer) {
    load(true)
    startAutoRefresh()
  }

  return {
    rows, cat, q, loading, error, updating, lastUpdate, stats,
    filtered, liveRows, upcomingRows, endedRows, byCategory, leagues,
    load, findMatchByHash, findMatchBySlug,
  }
}
