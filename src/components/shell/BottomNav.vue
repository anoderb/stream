<script setup>
// ===== Bottom nav (mobile) — 5 tab mirror referensi =====
import { useRoute } from 'vue-router'

const route = useRoute()

const TABS = [
  { to: '/', label: 'Beranda', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { to: '/jadwal', label: 'Jadwal', icon: 'M8 2v4M16 2v4M3 9h18M5 4h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z' },
  { to: '/live', label: 'Live', icon: 'M18 8a6 6 0 1 0 0 11M6 6a6 6 0 0 0 0 11M12 4l10 3-4 9-9 2 3-14z', dot: true },
  { to: '/upcoming', label: 'Upcoming', icon: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { to: '/akun', label: 'Akun', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6' },
]
</script>

<template>
  <nav class="bottom-nav" aria-label="Navigasi mobile">
    <router-link
      v-for="t in TABS"
      :key="t.to"
      :to="t.to"
      class="bn-item"
      :class="{ active: route.path === t.to }"
    >
      <span class="bn-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="t.icon" /></svg>
        <span v-if="t.dot" class="bn-dot" />
      </span>
      <span class="bn-label">{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg2) 92%, transparent);
  backdrop-filter: blur(16px);
  z-index: 40;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.bn-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-top: 6px;
  color: var(--muted2);
  transition: 0.15s;
}
.bn-item.active {
  color: var(--accent);
}
.bn-icon {
  position: relative;
}
.bn-dot {
  position: absolute;
  top: -2px;
  right: -4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--live);
  box-shadow: 0 0 6px var(--live);
}
.bn-label {
  font-size: 10px;
  font-weight: 600;
}
@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}
</style>
