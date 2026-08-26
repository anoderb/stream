import { ref, computed, onMounted, onUnmounted } from 'vue'
import { fetchStreams, statusOf, slugify } from '../services/api'

// ===== useStreams: data, filter, search, auto-refresh =====
const COOLDOWN = 30000 // refresh manual cooldown (ms)
const AUTO_REFRESH = 60000 // auto-refresh (ms)

export function useStreams() {
  const rows = ref([])
  const cat = ref('all')
  const q = ref('')
  const loading = ref(true)
  const error = ref(null)
  const updating = ref(false)
  const lastFetch = ref(0)
  const lastUpdate = ref(null)

  let autoTimer = null

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

  async function load(force = false) {
    const now = Date.now()
    if (!force && now - lastFetch.value < COOLDOWN && lastFetch.value) {
      const s = Math.ceil((COOLDOWN - (now - lastFetch.value)) / 1000)
      return { cooldown: s }
    }
    lastFetch.value = now
    if (!loading.value) updating.value = true
    try {
      rows.value = await fetchStreams()
      lastUpdate.value = new Date()
      error.value = null
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

  // deep link — buka player langsung dari #slug
  function findMatchByHash() {
    const h = location.hash.slice(1)
    if (!h || !rows.value.length) return null
    return rows.value.find((x, i) => slugify(x.tag) + '-' + i === h) || null
  }

  onMounted(() => {
    load(true)
    startAutoRefresh()
  })
  onUnmounted(stopAutoRefresh)

  return {
    rows, cat, q, loading, error, updating, lastUpdate, stats,
    filtered, liveRows, upcomingRows, endedRows,
    load, findMatchByHash,
  }
}
