<script setup>
import { useRouter } from 'vue-router'
import { useStreams } from '../composables/useStreams'
import { slugify } from '../services/api'
import EventCard from '../components/EventCard.vue'

const router = useRouter()
const { upcomingRows, loading } = useStreams()

function goWatch(m) {
  router.push('/watch/' + slugify(m.tag) + '-' + upcomingRows.value.indexOf(m))
}
</script>

<template>
  <div class="page-inner">
    <div class="page-head">
      <h1>Akan Datang</h1>
      <span class="page-count">{{ upcomingRows.length }} event</span>
    </div>

    <div v-if="loading" class="event-grid">
      <div v-for="n in 4" :key="n" class="skeleton" style="height: 280px" />
    </div>
    <div v-else-if="!upcomingRows.length" class="state-msg">
      <p>Tidak ada jadwal upcoming.</p>
    </div>
    <div v-else class="event-grid">
      <EventCard
        v-for="(m, i) in upcomingRows"
        :key="'up-' + slugify(m.tag) + '-' + i"
        :match="m"
        :index="upcomingRows.indexOf(m)"
        @open="goWatch"
      />
    </div>
  </div>
</template>

<style scoped>
.page-inner { padding-top: 20px; }
.page-head {
  display: flex; align-items: baseline; justify-content: space-between;
  padding: 6px 0 14px;
}
.page-head h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; }
.page-count { font-size: 12px; color: var(--muted2); font-weight: 500; }
.event-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px;
}
.state-msg {
  text-align: center; padding: 60px 20px; color: var(--muted);
  border: 1px dashed var(--line2); border-radius: var(--radius); background: var(--surface);
}
@media (max-width: 640px) {
  .event-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
}
</style>
