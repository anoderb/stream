<script setup>
// ===== Sidebar rail (desktop) — 48px, navigasi ikon-only =====
import { useRoute } from 'vue-router'

const route = useRoute()

const NAV = [
  { to: '/', label: 'Beranda', icon: 'M3 12l9-9 9 9M9 21V12h6v9' },
  { to: '/live', label: 'Live Sekarang', icon: 'M18 8a6 6 0 1 0 0 11M14 14l5-3m-5 3l5 3', live: true },
  { to: '/jadwal', label: 'Jadwal', icon: 'M8 2v4M16 2v4M3 9h18M5 4h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z' },
  { to: '/highlights', label: 'Highlights', icon: 'M8 14l-3 3m0-3l3 3M5 6l13-2m-4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm2 1l5 1m-2 3l5 1' },
  { to: '/liga', label: 'Liga', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
]
</script>

<template>
  <aside class="rail" aria-label="Navigasi utama">
    <router-link to="/" class="rail-logo" title="Beranda">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13H10l-1.5 9L19 9h-6.5L13 2z"/></svg>
    </router-link>

    <nav class="rail-nav">
      <router-link
        v-for="n in NAV"
        :key="n.to"
        :to="n.to"
        class="rail-btn"
        :class="{ active: route.path === n.to }"
        :title="n.label"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path :d="n.icon" />
          <circle v-if="n.live" cx="20" cy="6" r="1.6" fill="currentColor" stroke="none" class="pulse-dot" />
        </svg>
      </router-link>
    </nav>

    <div class="rail-foot">
      <router-link to="/akun" class="rail-btn" :class="{ active: route.path === '/akun' }" title="Akun">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
      </router-link>
    </div>
  </aside>
</template>

<style scoped>
.rail {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  border-right: 1px solid var(--line);
  background: var(--bg2);
  z-index: 40;
}
.rail-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--accent);
  color: #080b12;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.rail-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rail-foot {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rail-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted2);
  transition: 0.15s;
}
.rail-btn:hover {
  background: var(--surface);
  color: var(--text);
}
.rail-btn.active {
  background: var(--accent);
  color: #080b12;
}

@media (max-width: 1023px) {
  .rail {
    display: none;
  }
}
</style>
