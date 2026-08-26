import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/live', name: 'live', component: () => import('../views/LiveView.vue') },
    { path: '/upcoming', name: 'upcoming', component: () => import('../views/UpcomingView.vue') },
    { path: '/jadwal', name: 'jadwal', component: () => import('../views/JadwalView.vue') },
    { path: '/highlights', name: 'highlights', component: () => import('../views/HighlightsView.vue') },
    { path: '/liga', name: 'liga', component: () => import('../views/LigaView.vue') },
    { path: '/akun', name: 'akun', component: () => import('../views/AkunView.vue') },
    { path: '/watch/:slug', name: 'watch', component: () => import('../views/WatchView.vue'), props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
