<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SidebarRail from './components/shell/SidebarRail.vue'
import TopBar from './components/shell/TopBar.vue'
import BottomNav from './components/shell/BottomNav.vue'
import PlayerSheet from './components/PlayerSheet.vue'
import Toast from './components/Toast.vue'
import { playerStore } from './stores/player'
import { useGuard } from './composables/useGuard'

const router = useRouter()
const toastEl = ref(null)
const toast = msg => toastEl.value?.show(msg)

const guard = useGuard()
const theme = ref(localStorage.getItem('nobaryu-theme') || 'dark')
document.documentElement.dataset.theme = theme.value

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('nobaryu-theme', theme.value)
}

function openMatchFromStore(m) {
  // dipanggil dari EventCard via router ke /watch — handled di WatchView
  router.push({ path: '/watch/' + encodeURIComponent(m.slug) })
}

function closePlayer() {
  playerStore.open = false
  playerStore.match = null
  playerStore.frameUrl = ''
  playerStore.activeIdx = 0
  guard.deactivate()
}

function selectServer(i) {
  const m = playerStore.match
  if (!m) return
  const s = m.iframes?.[i]
  if (!s) return
  playerStore.activeIdx = i
  playerStore.frameUrl = s.url
}
</script>

<template>
  <div class="app-shell">
    <!-- Desktop sidebar -->
    <SidebarRail />

    <!-- Main column -->
    <div class="main-col">
      <!-- Desktop topbar -->
      <TopBar v-model:theme="theme" @toggle-theme="toggleTheme" @toast="toast" />

      <!-- Page content -->
      <main class="page">
        <router-view />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <BottomNav />
  </div>

  <!-- Global player modal (mobile bottom sheet / desktop centered) -->
  <PlayerSheet
    :open="playerStore.open"
    :match="playerStore.match"
    :active-idx="playerStore.activeIdx"
    :frame-url="playerStore.frameUrl"
    @close="closePlayer()"
    @select="selectServer"
  />

  <Toast ref="toastEl" />
</template>

<style>
.app-shell {
  min-height: 100vh;
}
.main-col {
  margin-left: 52px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.page {
  flex: 1;
  padding: 0 20px 40px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}
@media (max-width: 1023px) {
  .main-col {
    margin-left: 0;
  }
  .page {
    padding: 0 12px calc(58px + env(safe-area-inset-bottom, 0px) + 16px);
  }
}
</style>
