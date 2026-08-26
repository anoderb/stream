<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStreams } from '../composables/useStreams'
import { CATS, slugify } from '../services/api'
import CategoryPills from '../components/CategoryPills.vue'
import EventCard from '../components/EventCard.vue'

const router = useRouter()

const {
  rows, cat, q, loading, error, updating, lastUpdate, stats,
  filtered, liveRows, upcomingRows, endedRows, load,
} = useStreams()

const sections = computed(() => {
  const out = []
  if (liveRows.value.length) out.push({ key: 'live', title: 'Sedang Live', list: liveRows.value, emoji: '🔴' })
  if (upcomingRows.value.length) out.push({ key: 'upcoming', title: 'Akan Datang', list: upcomingRows.value, emoji: '🕐' })
  if (endedRows.value.length) out.push({ key: 'ended', title: 'Selesai', list: endedRows.value, emoji: '✓' })
  return out
})

function goWatch(m) {
  const slug = slugify(m.tag) + '-' + rows.value.indexOf(m)
  router.push('/watch/' + slug)
}
</script>

<template>
  <div>
    <!-- HERO BANNER + Ilustrasi -->
    <section class="hero-banner">
      <div class="hero-copy">
        <div class="hero-eyebrow"><span class="pulse-dot"></span> STREAMING OLAHRAGA LIVE</div>
        <h1>Nonton Bareng, <em>Gampang.</em></h1>
        <p>Pilih event, pilih server, langsung tonton. Gratis, ringan, tanpa ribet.</p>
        <div class="hero-stats">
          <span class="hstat"><b>{{ stats.live }}</b> LIVE</span>
          <span class="hstat"><b>{{ stats.upcoming }}</b> UPCOMING</span>
          <span class="hstat"><b>{{ stats.total }}</b> EVENTS</span>
        </div>
      </div>
      <div class="hero-art">
        <img src="/assets/hero-neon.png" alt="Ilustrasi olahraga" />
      </div>
    </section>

    <!-- SEARCH (mobile only) + meta -->
    <div class="toolbar">
      <div class="toolbar-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="q" placeholder="Cari match, liga, olahraga..." autocomplete="off" />
      </div>
      <div class="meta-bar">
        <template v-if="loading">Mengambil data...</template>
        <template v-else-if="updating">Menyegarkan...</template>
        <template v-else>{{ lastUpdate ? `Update ${lastUpdate.toLocaleTimeString('id-ID')} · ${rows.length} event` : 'Siap' }}</template>
      </div>
    </div>

    <!-- CATEGORIES -->
    <CategoryPills :items="CATS" :active="cat" @select="cat = $event" />

    <!-- GRID -->
    <section class="grid-section">
      <!-- Skeleton -->
      <div v-if="loading" class="event-grid">
        <div v-for="n in 6" :key="n" class="skeleton" style="height: 280px" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-msg">
        <p>Gagal memuat data. <button class="retry-link" @click="load(true)">Coba lagi →</button></p>
      </div>

      <!-- Kosong -->
      <div v-else-if="!filtered.length" class="state-msg">
        <p>Tidak ada event yang cocok.</p>
      </div>

      <!-- Sections -->
      <template v-else>
        <div v-for="sec in sections" :key="sec.key" class="grid-block">
          <div class="grid-head">
            <h2>{{ sec.emoji }} {{ sec.title }}</h2>
            <span class="grid-count">{{ sec.list.length }} event</span>
          </div>
          <div class="event-grid">
            <EventCard
              v-for="(m, i) in sec.list"
              :key="slugify(m.tag) + '-' + i"
              :match="m"
              :index="rows.indexOf(m)"
              @open="goWatch"
            />
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.hero-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-radius: 20px;
  padding: 28px 32px;
  margin-top: 18px;
  border: 1px solid var(--line);
  background:
    radial-gradient(1200px 260px at 80% -10%, var(--accent-dim), transparent 55%),
    linear-gradient(120deg, var(--bg2), var(--card) 70%);
  overflow: hidden;
  position: relative;
}
.hero-copy {
  max-width: 460px;
  position: relative;
  z-index: 2;
}
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--muted2);
  margin-bottom: 12px;
}
.hero-eyebrow .pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--live);
  box-shadow: 0 0 8px var(--live);
}
.hero-copy h1 {
  font-family: 'Syne', sans-serif;
  font-weight: 900;
  font-size: clamp(28px, 4vw, 42px);
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.hero-copy h1 em {
  font-style: normal;
  color: var(--accent);
}
.hero-copy p {
  color: var(--muted);
  font-size: 14.5px;
  margin-top: 8px;
  max-width: 400px;
}
.hero-stats {
  display: flex;
  gap: 18px;
  margin-top: 18px;
}
.hstat {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted2);
  letter-spacing: 0.05em;
}
.hstat b {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  color: var(--text);
  margin-right: 3px;
}
.hero-art {
  flex-shrink: 0;
  width: 42%;
  max-width: 340px;
  position: relative;
  z-index: 1;
}
.hero-art img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4));
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 0 6px;
}
.toolbar-search {
  flex: 1;
  position: relative;
  max-width: 420px;
  display: flex;
  align-items: center;
}
.toolbar-search svg {
  position: absolute;
  left: 13px;
  color: var(--muted);
  pointer-events: none;
}
.toolbar-search input {
  flex: 1;
  height: 42px;
  border-radius: 11px;
  border: 1px solid var(--line2);
  background: var(--card);
  color: var(--text);
  font-size: 14px;
  padding: 0 14px 0 40px;
  outline: none;
  transition: 0.18s;
}
.toolbar-search input:focus {
  border-color: var(--accent);
}
.meta-bar {
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
  white-space: nowrap;
}
.grid-section {
  padding-top: 4px;
}
.grid-block {
  margin-bottom: 8px;
}
.grid-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 20px 0 10px;
}
.grid-head h2 {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -0.02em;
}
.grid-count {
  font-size: 12px;
  color: var(--muted2);
  font-weight: 500;
}
.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 14px;
}
.state-msg {
  text-align: center;
  padding: 50px 20px;
  color: var(--muted);
  border: 1px dashed var(--line2);
  border-radius: var(--radius);
  background: var(--surface);
}
.retry-link {
  color: var(--accent);
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
}

@media (max-width: 640px) {
  .hero-banner {
    flex-direction: column-reverse;
    padding: 20px;
    text-align: left;
  }
  .hero-art {
    width: 70%;
    max-width: 220px;
  }
  .hero-copy h1 {
    font-size: 26px;
  }
  .hero-stats {
    gap: 14px;
    flex-wrap: wrap;
  }
  .event-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .meta-bar {
    font-size: 11px;
  }
}
</style>
