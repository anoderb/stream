<script setup>
import { computed } from 'vue'
import { LABEL_SHORT, statusOf, fmtTime, relTime, slugify } from '../services/api'

const props = defineProps({
  match: { type: Object, required: true },
  index: { type: Number, required: true },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['open'])

const st = computed(() => statusOf(props.match))
const can = computed(() => (props.match.iframes || []).length > 0)
const serverCount = computed(() => (props.match.iframes || []).length)
const slug = computed(() => slugify(props.match.tag) + '-' + props.index)

const badge = computed(() => {
  if (st.value === 'live')
    return '<span class="badge-live">LIVE</span>'
  if (st.value === 'upcoming')
    return '<span class="badge-upcoming">JADWAL</span>'
  return '<span class="badge-ended">SELESAI</span>'
})

const rel = computed(() => relTime(props.match))
</script>

<template>
  <article
    class="event-card"
    :data-slug="slug"
    :class="{ 'cursor-pointer': can }"
    @click="can && emit('open', match)"
  >
    <!-- Poster -->
    <div class="card-poster">
      <img
        v-if="match.poster"
        :src="match.poster"
        loading="lazy"
        :alt="match.tag"
        class="poster-img"
        @error="$event.target.style.display = 'none'"
      />
      <div class="poster-placeholder" :class="{ show: !match.poster }">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      </div>
      <div class="badge-row">
        <span class="badge badge-cat">{{ LABEL_SHORT[match.category] || match.category }}</span>
        <span v-html="badge" />
      </div>
      <span v-if="st === 'upcoming'" class="upcoming-tag">{{ rel }}</span>
    </div>

    <!-- Body -->
    <div class="card-body">
      <div class="card-league">{{ match.league || 'Unknown League' }}</div>
      <h3 class="card-title">{{ match.tag }}</h3>
      <div class="card-meta">
        <span class="card-meta-time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ fmtTime(match.kickoff) }}
        </span>
        <span class="card-meta-servers">
          <span class="server-dots">
            <span v-for="i in Math.min(serverCount, 5)" :key="i" class="server-dot active" />
          </span>
          {{ serverCount }} server
        </span>
      </div>
      <button
        class="watch-btn"
        :class="can ? 'can-watch' : 'no-server'"
        :disabled="!can"
        @click.stop="can && emit('open', match)"
      >
        <template v-if="can">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {{ st === 'ended' ? 'Tonton Ulang' : 'Tonton Sekarang' }}
        </template>
        <template v-else>Belum tersedia</template>
      </button>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
  position: relative;
}
.event-card:hover {
  border-color: var(--line2);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.card-poster {
  position: relative;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, var(--bg2), #1a2038);
  overflow: hidden;
}
.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}
.card-poster::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 13, 22, 0.8), transparent 55%);
}
.poster-placeholder {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  opacity: 0.4;
}
.poster-placeholder.show {
  display: flex;
}
.badge-row {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
  z-index: 2;
}
.badge {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge-cat {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
}
.badge-live {
  background: var(--live-dim);
  border: 1px solid var(--live);
  color: var(--live);
  backdrop-filter: blur(6px);
  animation: pulse-dot 1.6s ease-in-out infinite;
}
.badge-upcoming {
  background: var(--upcoming-dim);
  border: 1px solid var(--upcoming);
  color: var(--upcoming);
  backdrop-filter: blur(6px);
}
.badge-ended {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--muted);
  backdrop-filter: blur(6px);
}
.upcoming-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 2;
  font-size: 11px;
  font-weight: 600;
  color: var(--upcoming);
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(245, 166, 35, 0.35);
  padding: 3px 8px;
  border-radius: 6px;
  backdrop-filter: blur(6px);
}
.card-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.card-league {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.card-title {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 15px;
  line-height: 1.3;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}
.card-meta-time {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--muted2);
}
.card-meta-servers {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--muted);
}
.server-dots {
  display: flex;
  gap: 3px;
}
.server-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}
.server-dot.active {
  background: var(--accent);
}
.watch-btn {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: 0.15s;
}
.watch-btn.can-watch {
  background: var(--accent);
  color: #080b12;
}
.watch-btn.can-watch:hover {
  opacity: 0.88;
}
.watch-btn.no-server {
  background: var(--surface);
  color: var(--muted2);
  border: 1px solid var(--line);
  cursor: default;
}
</style>
