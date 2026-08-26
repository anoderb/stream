<script setup>
// ===== Top bar (desktop) — logo + nav center + search + theme + akun =====
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStreams } from '../../composables/useStreams'
import { useGuard } from '../../composables/useGuard'
import { playerStore } from '../../stores/player'
import { isBlocked } from '../../composables/useGuard'
import { slugify } from '../../services/api'

const router = useRouter()
const route = useRoute()
const { rows, cat, load, stats } = useStreams()

const emit = defineEmits(['toggle-theme', 'toast'])
const searchEl = ref(null)

const theme = defineModel('theme')

const NAV = [
  { to: '/', label: 'Beranda' },
  { to: '/live', label: 'Live Sekarang' },
  { to: '/jadwal', label: 'Jadwal' },
  { to: '/highlights', label: 'Highlights' },
  { to: '/liga', label: 'Liga' },
]

const guard = useGuard()

// ambil hasil pencarian → buka live pertama
function submitSearch() {
  const needle = (searchEl.value?.value || '').trim().toLowerCase()
  if (!needle) return
  const found = rows.value.find(m => `${m.tag} ${m.league} ${m.category}`.toLowerCase().includes(needle))
  if (found && found.iframes?.length) {
    openMatch(found)
  } else {
    emit('toast', 'Tidak ada matching untuk pencarianmu')
  }
}

function openMatch(m) {
  const idx = rows.value.indexOf(m)
  const slug = slugify(m.tag) + '-' + idx
  playerStore.match = m
  playerStore.activeIdx = playerStore.activeIdxFromPrefs ?? 0
  // pilih server HD/FHD
  const servers = m.iframes || []
  const hdIdx = servers.findIndex(s => /fhd|1080/i.test(s.server || ''))
  const serverIdx = hdIdx >= 0 ? hdIdx : 0
  playerStore.activeIdx = serverIdx
  const url = servers[serverIdx]?.url
  if (!url || isBlocked(url)) {
    emit('toast', 'Server tidak tersedia. Coba yang lain.')
    return
  }
  playerStore.frameUrl = url
  playerStore.open = true
  guard.activate()
}

function onKey(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchEl.value?.focus()
  }
}
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)"><path d="M13 2 4.5 13H10l-1.5 9L19 9h-6.5L13 2z"/></svg>
      <span class="brand-name">nobaryu</span>
      <span class="live-badge">LIVE</span>
    </div>

    <nav class="topnav">
      <router-link
        v-for="n in NAV"
        :key="n.to"
        :to="n.to"
        class="topnav-link"
        :class="{ active: route.path === n.to }"
      >{{ n.label }}</router-link>
    </nav>

    <div class="top-actions">
      <div class="search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          ref="searchEl"
          type="text"
          placeholder="Cari pertandingan, liga..."
          @keydown.enter="submitSearch"
          @keydown="onKey"
        />
        <span class="kbd">/</span>
      </div>
      <button class="icon-btn" :title="theme === 'dark' ? 'Mode terang' : 'Mode gelap'" @click="emit('toggle-theme')">
        <svg v-if="theme === 'dark'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="7" y2="7"/><line x1="17" y1="17" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="7" y2="17"/><line x1="17" y1="7" x2="19.1" y2="4.9"/></svg>
        <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
      <router-link to="/akun" class="avatar" title="Akun">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 30;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(16px) saturate(1.6);
}
.brand {
  display: flex;
  align-items: center;
  gap: 7px;
}
.brand-name {
  font-family: 'Syne', sans-serif;
  font-weight: 900;
  font-size: 19px;
  letter-spacing: -0.03em;
}
.live-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 5px;
  padding: 1px 6px;
  text-transform: uppercase;
}
.topnav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0 auto;
}
.topnav-link {
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--muted2);
  transition: 0.15s;
  white-space: nowrap;
}
.topnav-link:hover {
  color: var(--text);
}
.topnav-link.active {
  color: var(--accent);
  background: var(--accent-dim);
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.search-box svg {
  position: absolute;
  left: 10px;
  color: var(--muted);
  pointer-events: none;
}
.search-box input {
  height: 36px;
  width: 220px;
  border-radius: 9px;
  border: 1px solid var(--line2);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  padding: 0 32px 0 32px;
  outline: none;
  transition: 0.18s;
}
.search-box input:focus {
  border-color: var(--accent);
  width: 260px;
}
.kbd {
  position: absolute;
  right: 9px;
  font-size: 11px;
  color: var(--muted);
  border: 1px solid var(--line2);
  border-radius: 4px;
  padding: 0 5px;
  pointer-events: none;
  background: var(--card);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--line2);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted2);
}

@media (max-width: 1023px) {
  .topbar {
    padding: 0 12px;
    height: 54px;
  }
  .topnav {
    display: none;
  }
  .search-box {
    margin-left: auto;
  }
  .search-box input {
    width: 46px;
    padding: 0 0 0 34px;
    cursor: pointer;
  }
  .search-box input:focus {
    width: calc(100vw - 110px);
  }
  .kbd {
    display: none;
  }
}
</style>
