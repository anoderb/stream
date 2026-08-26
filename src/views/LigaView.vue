<script setup>
import { useRouter } from 'vue-router'
import { useStreams } from '../composables/useStreams'
import { CATS, LABEL } from '../services/api'

const router = useRouter()
const { rows, byCategory } = useStreams()

// daftar kategori dgn count + event sample
function sampleOf(cat) {
  return rows.value.filter(m => m.category === cat).slice(0, 3)
}

function goCat(cat) {
  router.push('/?cat=' + cat)
}
</script>

<template>
  <div class="page-inner">
    <div class="page-head">
      <h1>Liga & Olahraga</h1>
      <span class="page-count">{{ rows.length }} event</span>
    </div>

    <div class="liga-grid">
      <div
        v-for="c in CATS.filter(x => x !== 'all')"
        :key="c"
        class="liga-card"
        @click="goCat(c)"
      >
        <div class="liga-head">
          <span class="liga-name">{{ LABEL[c] }}</span>
          <span class="liga-count">{{ byCategory[c] || 0 }}</span>
        </div>
        <div class="liga-events">
          <span v-for="(m, i) in sampleOf(c)" :key="'e' + i" class="liga-event">{{ m.tag }}</span>
          <span v-if="!sampleOf(c).length" class="liga-event muted">Belum ada event</span>
        </div>
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
.liga-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;
}
.liga-card {
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 16px; cursor: pointer; transition: 0.18s;
}
.liga-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.liga-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.liga-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; }
.liga-count {
  font-size: 11px; font-weight: 700; color: var(--accent);
  background: var(--accent-dim); border-radius: 999px; padding: 2px 9px;
}
.liga-events { display: flex; flex-direction: column; gap: 5px; }
.liga-event {
  font-size: 12px; color: var(--muted2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.liga-event.muted { color: var(--muted); }
</style>
