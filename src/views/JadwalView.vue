<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStreams } from '../composables/useStreams'
import { slugify, fmtTime, statusOf } from '../services/api'

const router = useRouter()
const { rows, loading } = useStreams()

// Group by hari (WIB) — upcoming & live & ended dengan tanggal
const groups = computed(() => {
  const map = {}
  for (const m of rows.value) {
    const d = fmtDay(m.kickoff)
    ;(map[d] = map[d] || []).push(m)
  }
  return Object.entries(map)
})

function fmtDay(t) {
  if (!t) return 'Tanpa jadwal'
  const d = new Date(t.replace(' ', 'T') + '+07:00')
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  if (sameDay) return 'Hari Ini'
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}

function goWatch(m) {
  router.push('/watch/' + m.slug)
}
</script>

<template>
  <div class="page-inner">
    <div class="page-head">
      <h1>Jadwal</h1>
      <span class="page-count">{{ rows.length }} event</span>
    </div>

    <div v-if="loading" class="skeleton" style="height: 200px" />
    <div v-else-if="!groups.length" class="state-msg"><p>Tidak ada jadwal.</p></div>

    <div v-else class="day-group" v-for="[day, list] in groups" :key="day">
      <h2 class="day-title">{{ day }}</h2>
      <div class="match-list">
        <button
          v-for="(m, i) in list"
          :key="'j-' + slugify(m.tag) + '-' + i"
          class="match-row"
          @click="goWatch(m)"
        >
          <span class="m-time">{{ fmtTime(m.kickoff) }}</span>
          <span class="m-tag">{{ m.tag }}</span>
          <span class="m-league">{{ m.league || '—' }}</span>
          <span class="m-badge" :class="statusOf(m)">
            {{ statusOf(m) === 'live' ? 'LIVE' : statusOf(m) === 'upcoming' ? 'JADWAL' : 'SELESAI' }}
          </span>
        </button>
      </div>
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
.day-group { margin-bottom: 22px; }
.day-title {
  font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
  color: var(--muted2); text-transform: uppercase; letter-spacing: 0.04em;
  padding: 10px 0 8px; border-bottom: 1px solid var(--line);
}
.match-list { display: flex; flex-direction: column; }
.match-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 4px; border-bottom: 1px solid var(--line);
  text-align: left; transition: 0.15s;
}
.match-row:hover { background: var(--surface); padding-left: 12px; }
.m-time { font-size: 12px; color: var(--muted2); width: 92px; flex-shrink: 0; }
.m-tag { flex: 1; font-weight: 600; font-size: 14px; }
.m-league { font-size: 12px; color: var(--muted); width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m-badge {
  font-size: 9px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 6px;
}
.m-badge.live { background: var(--live-dim); color: var(--live); }
.m-badge.upcoming { background: var(--upcoming-dim); color: var(--upcoming); }
.m-badge.ended { background: var(--surface); color: var(--muted); }
.state-msg {
  text-align: center; padding: 60px 20px; color: var(--muted);
  border: 1px dashed var(--line2); border-radius: var(--radius); background: var(--surface);
}
@media (max-width: 640px) {
  .m-league { display: none; }
  .m-time { width: 74px; }
}
</style>
