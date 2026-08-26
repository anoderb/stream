<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStreams } from './composables/useStreams'
import { usePlayer } from './composables/usePlayer'
import { useGuard } from './composables/useGuard'
import { CATS, slugify } from './services/api'
import CategoryPills from './components/CategoryPills.vue'
import EventCard from './components/EventCard.vue'
import PlayerSheet from './components/PlayerSheet.vue'
import Toast from './components/Toast.vue'

const toastEl = ref(null)
const toast = msg => toastEl.value?.show(msg)

const guard = useGuard()

const {
  rows, cat, q, loading, error, updating, lastUpdate, stats,
  filtered, liveRows, upcomingRows, endedRows, load, findMatchByHash,
} = useStreams()

const {
  open: playerOpen, match: playerMatch, activeIdx, frameUrl,
  openPlayer, selectServer, close: closePlayer,
} = usePlayer({
  onOpen: () => guard.activate(),
  onClose: () => guard.deactivate(),
  onBlocked: msg => toast('⚠️ ' + msg),
})

const theme = ref(localStorage.getItem('nobaryu-theme') || 'dark')
document.documentElement.dataset.theme = theme.value

// sections — live selalu di atas
const sections = computed(() => {
  const out = []
  if (liveRows.value.length) out.push({ key: 'live', title: '🔴 Sedang Live', list: liveRows.value })
  if (upcomingRows.value.length) out.push({ key: 'upcoming', title: '🕐 Akan Datang', list: upcomingRows.value })
  if (endedRows.value.length) out.push({ key: 'ended', title: 'Selesai', list: endedRows.value })
  return out
})

function openMatch(m) {
  const idx = rows.value.indexOf(m)
  const slug = slugify(m.tag) + '-' + idx
  history.pushState({ slug, idx }, '', '#' + slug)
  openPlayer(m)
}

function onHash() {
  const m = findMatchByHash()
  if (m) openPlayer(m)
}

onMounted(() => {
  window.addEventListener('hashchange', onHash)
  const m = findMatchByHash()
  if (m) setTimeout(() => openPlayer(m), 300)
})

onUnmounted(() => window.removeEventListener('hashchange', onHash))

async function refresh(force = false) {
  const r = await load(force)
  if (r?.cooldown) toast(`Cooldown ${r.cooldown}s lagi`)
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('nobaryu-theme', theme.value)
}

// wrapper aman buat close player — log error kalau gagal biar gak silent
function onPlayerClose() {
  try {
    closePlayer()
  } catch (err) {
    console.error('[player] close error:', err)
    // fallback: paksa tutup dengan set state langsung
    playerOpen.value = false
    playerMatch.value = null
    frameUrl.value = ''
  }
}

function clearSearch() {
  q.value = ''
  document.getElementById('search')?.focus()
}
</script>

<template>
  <div class="app-wrap">
    <!-- HEADER -->
    <header class="header">
      <div class="logo">
        ⚡<span>nobaryu</span>
        <span class="logo-sub">live</span>
      </div>
      <div class="header-actions">
        <button class="icon-btn" :title="theme === 'dark' ? 'Mode terang' : 'Mode gelap'" @click="toggleTheme">
          <svg
            v-if="theme === 'dark'"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          ><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg
            v-else
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          ><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="icon-btn" title="Refresh" @click="refresh(false)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>
    </header>

    <!-- HERO -->
    <section class="hero">
      <h1>SPORT STREAMING <em>LIVE</em></h1>
      <p><em>Nonton bareng, gampang.</em> Portal streaming olahraga live. Pilih event, pilih server, langsung tonton. Gratis, ringan, tanpa ribet.</p>
      <div class="stats-row">
        <div class="stat-item"><span class="stat-dot live pulse-dot"></span><span class="stat-num">{{ stats.live }}</span><span class="stat-label">LIVE</span></div>
        <div class="stat-item"><span class="stat-dot upcoming"></span><span class="stat-num">{{ stats.upcoming }}</span><span class="stat-label">UPCOMING</span></div>
        <div class="stat-item"><span class="stat-num">{{ stats.total }}</span><span class="stat-label">EVENTS</span></div>
      </div>
      <div class="search-bar">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="search" v-model="q" class="search-input" type="text" placeholder="Cari match, liga, olahraga..." autocomplete="off" />
        <button class="clear-btn" title="Clear" @click="clearSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <button class="icon-btn" title="Refresh" @click="refresh(false)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>
      <div class="meta-bar">
        <template v-if="loading">Mengambil data...</template>
        <template v-else-if="updating">Menyegarkan...</template>
        <template v-else>{{ lastUpdate ? `Update ${lastUpdate.toLocaleTimeString('id-ID')} · ${rows.length} event` : 'Siap' }}</template>
      </div>
    </section>

    <!-- CATEGORIES -->
    <CategoryPills :items="CATS" :active="cat" @select="cat = $event" />

    <!-- GRID -->
    <section class="grid-section">
      <!-- Skeleton -->
      <template v-if="loading">
        <div class="event-grid">
          <div v-for="n in 6" :key="n" class="skeleton" style="height: 280px" />
        </div>
      </template>

      <!-- Error -->
      <div v-else-if="error" class="state-msg">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>Gagal memuat data. <button class="retry-link" @click="refresh(true)">Coba lagi →</button></p>
      </div>

      <!-- Kosong -->
      <div v-else-if="!filtered.length" class="state-msg">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>Tidak ada event yang cocok.</p>
      </div>

      <!-- Interaktif -->
      <template v-else>
        <div v-for="sec in sections" :key="sec.key" class="grid-section-block">
          <div class="grid-section-header">
            <h2>{{ sec.title }}</h2>
            <span class="section-count">{{ sec.list.length }} event</span>
          </div>
          <div class="event-grid">
            <EventCard
              v-for="(m, i) in sec.list"
              :key="slugify(m.tag) + '-' + i"
              :match="m"
              :index="rows.indexOf(m)"
              @open="openMatch"
            />
          </div>
        </div>
      </template>
    </section>
  </div>

  <!-- PLAYER -->
  <PlayerSheet
    :open="playerOpen"
    :match="playerMatch"
    :active-idx="activeIdx"
    :frame-url="frameUrl"
    @close="onPlayerClose"
    @select="selectServer"
  />

  <!-- TOAST -->
  <Toast ref="toastEl" />
</template>

<style>
/* ============ LAYOUT (global, dari styles legacy) ============ */
.app-wrap {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

/* HEADER */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  gap: 12px;
  flex-wrap: wrap;
}
.logo {
  font-family: 'Syne', sans-serif;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: -0.03em;
  display: flex;
  align-items: center;
  gap: 4px;
}
.logo span {
  color: var(--accent);
}
.logo-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-left: 6px;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--surface);
  border: 1px solid var(--line);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line2);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted2);
  transition: 0.15s;
}
.icon-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}

/* HERO */
.hero {
  padding: 30px 0 0;
}
.hero h1 {
  font-family: 'Syne', sans-serif;
  font-weight: 900;
  font-size: 38px;
  letter-spacing: -0.03em;
  line-height: 1.15;
}
.hero h1 em {
  font-style: normal;
  color: var(--accent);
}
.hero p {
  font-size: 15px;
  color: var(--muted);
  margin-top: 10px;
  max-width: 520px;
}
.stats-row {
  display: flex;
  gap: 20px;
  padding: 24px 0 0;
  flex-wrap: wrap;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-num {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 22px;
  line-height: 1;
}
.stat-label {
  font-size: 12px;
  color: var(--muted2);
  font-weight: 500;
}
.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.stat-dot.live {
  background: var(--live);
  box-shadow: 0 0 8px var(--live);
}
.stat-dot.upcoming {
  background: var(--upcoming);
}

/* SEARCH */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 22px;
}
.search-icon {
  width: 20px;
  height: 20px;
  color: var(--muted);
  position: absolute;
  left: 14px;
  pointer-events: none;
}
.search-input {
  flex: 1;
  height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line2);
  background: var(--card);
  padding: 11px 14px 11px 44px;
  color: var(--text);
  outline: none;
  transition: 0.18s;
  font-size: 14px;
}
.search-input::placeholder {
  color: var(--muted);
}
.search-input:focus {
  border-color: var(--accent);
  background: var(--card);
}
.clear-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line2);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: 0.18s;
}
.clear-btn:hover {
  border-color: var(--live);
  color: var(--live);
}

/* META */
.meta-bar {
  padding: 10px 0 0;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

/* GRID */
.grid-section {
  padding: 6px 0 40px;
}
.grid-section-block {
  margin-bottom: 8px;
}
.grid-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 20px 0 8px;
  gap: 8px;
  flex-wrap: wrap;
}
.grid-section-header h2 {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.02em;
}
.section-count {
  font-size: 12px;
  color: var(--muted2);
  font-weight: 500;
}
.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
}

/* STATE */
.state-msg {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 15px;
}
.retry-link {
  color: var(--accent);
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .app-wrap {
    padding: 0 12px;
  }
  .logo {
    font-size: 22px;
  }
  .hero h1 {
    font-size: 26px;
  }
  .stats-row {
    gap: 14px;
  }
  .event-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .header {
    padding: 12px 0;
  }
  .search-bar {
    flex-wrap: wrap;
  }
}
</style>
