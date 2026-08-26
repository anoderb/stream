<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStreams } from '../composables/useStreams'
import { useGuard } from '../composables/useGuard'
import { isBlocked } from '../composables/useGuard'
import { slugify, fmtTime, statusOf, LABEL_SHORT } from '../services/api'

const router = useRouter()
const route = useRoute()
const { rows, findMatchBySlug } = useStreams()
const guard = useGuard()

const match = ref(null)
const activeIdx = ref(0)
const frameUrl = ref('')
const saved = ref(new Set(JSON.parse(localStorage.getItem('nobaryu-saved') || '[]')))
const toast = ref('')

const servers = computed(() => match.value?.iframes || [])

const otherMatches = computed(() => {
  if (!match.value) return []
  const sameCat = rows.value
    .filter(m => m.category === match.value.category && m !== match.value && m.iframes?.length)
    .slice(0, 4)
  if (sameCat.length >= 4) return sameCat
  const rest = rows.value
    .filter(m => m !== match.value && m.iframes?.length && !sameCat.includes(m))
    .slice(0, 4 - sameCat.length)
  return [...sameCat, ...rest]
})

const isSaved = computed(() => match.value && saved.value.has(slugify(match.value.tag)))

function setServer(i, remember = true) {
  const s = servers.value[i]
  if (!s) return
  if (isBlocked(s.url)) {
    toast.value = 'Server ini tidak tersedia. Coba yang lain.'
    return
  }
  activeIdx.value = i
  frameUrl.value = s.url
  if (remember) {
    try {
      const prefs = JSON.parse(localStorage.getItem('nobaryu-server-prefs') || '{}')
      prefs[slugify(match.value.tag)] = i
      localStorage.setItem('nobaryu-server-prefs', JSON.stringify(prefs))
    } catch { /* noop */ }
  }
}

function toggleSave() {
  const slug = slugify(match.value.tag)
  const next = new Set(saved.value)
  if (next.has(slug)) next.delete(slug)
  else next.add(slug)
  saved.value = next
  localStorage.setItem('nobaryu-saved', JSON.stringify([...next]))
  toast.value = next.has(slug) ? 'Disimpan' : 'Dihapus dari simpanan'
}

function goWatch(m) {
  router.push('/watch/' + slugify(m.tag) + '-' + rows.value.indexOf(m))
}

function loadMatch() {
  const m = findMatchBySlug(route.params.slug)
  if (!m) {
    match.value = null
    return
  }
  match.value = m
  // pilih server dari preferensi / HD-FHD pertama
  const serversArr = m.iframes || []
  const prefs = JSON.parse(localStorage.getItem('nobaryu-server-prefs') || '{}')
  const fav = prefs[slugify(m.tag)]
  let idx = 0
  if (fav != null && serversArr[fav]) idx = fav
  else {
    const hdIdx = serversArr.findIndex(s => /fhd|1080/i.test(s.server || ''))
    idx = hdIdx >= 0 ? hdIdx : 0
  }
  setServer(idx, false)
  guard.activate()
}

watch(() => route.params.slug, loadMatch)
onMounted(loadMatch)
onUnmounted(() => guard.deactivate())

setTimeout(() => (toast.value = ''), 3000)
</script>

<template>
  <div v-if="!match" class="state-msg">
    <p>Pertandingan tidak ditemukan.</p>
    <button class="retry-link" @click="router.push('/')">← Kembali ke Beranda</button>
  </div>

  <div v-else class="watch-grid">
    <!-- KOLOM KIRI: player + info -->
    <div class="left-col">
      <!-- Video player -->
      <div class="player-card">
        <div class="frame-wrap">
          <iframe
            :key="frameUrl"
            :src="frameUrl || 'about:blank'"
            :title="match.tag"
            allowfullscreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
            referrerpolicy="strict-origin-when-cross-origin"
            frameborder="0"
          />
        </div>
        <div class="player-badges">
          <span class="hd-badge">{{ servers[activeIdx]?.server || 'Server' }}</span>
        </div>
      </div>

      <!-- Match header -->
      <div class="match-head">
        <div class="match-league">{{ (match.league || 'Unknown League').toUpperCase() }}</div>
        <h1 class="match-title">{{ match.tag }}</h1>

        <div class="match-actions">
          <!-- Simpan (tombol Tonton dihapus — video langsung play di player) -->
          <div class="act-buttons">
            <button class="btn-ghost" @click="toggleSave">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :fill="isSaved ? 'currentColor' : 'none'"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              {{ isSaved ? 'Tersimpan' : 'Simpan' }}
            </button>
          </div>

          <!-- Info panel -->
          <div class="info-panel">
            <div class="info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z"/></svg>
              <span>Kompetisi<b>{{ match.league || '—' }}</b></span>
            </div>
            <div class="info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Tanggal<b>{{ fmtTime(match.kickoff) }}</b></span>
            </div>
            <div class="info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Status<b class="st" :class="statusOf(match)">{{ statusOf(match) === 'live' ? 'LIVE' : statusOf(match) === 'upcoming' ? 'Jadwal' : 'Selesai' }}</b></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tentang + Kualitas -->
      <div class="detail-cards">
        <div class="detail-card">
          <h3>Tentang Pertandingan</h3>
          <p>Pertandingan {{ match.category === 'football' ? 'sepak bola' : LABEL_SHORT[match.category]?.toLowerCase() || 'olahraga' }} seru di ajang {{ match.league || 'kompetisi' }} — {{ match.tag }}. Pilih server sesuai kualitas yang kamu mau dan langsung tonton, gratis.</p>
        </div>
        <div class="detail-card">
          <h3>Pilih Server / Channel</h3>
          <div class="channel-list">
            <button
              v-for="(s, i) in servers"
              :key="i"
              class="channel-btn"
              :class="{ active: activeIdx === i }"
              @click="setServer(i)"
            >
              {{ s.server || `Channel ${i + 1}` }}
            </button>
            <p v-if="!servers.length" class="channel-none">Belum ada server tersedia.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- KOLOM KANAN: Pertandingan lainnya + premium -->
    <div class="right-col">
      <div class="side-card">
        <div class="side-head">
          <h3>Pertandingan Lainnya</h3>
          <button class="link-more" @click="router.push('/live')">Lihat semua →</button>
        </div>
        <div class="side-list">
          <button v-for="(m, i) in otherMatches" :key="'o' + i" class="side-match" @click="goWatch(m)">
            <div class="side-art">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/><line x1="16" y1="8" x2="8" y2="16"/></svg>
              <span v-if="statusOf(m) === 'live'" class="side-live">LIVE</span>
            </div>
            <div class="side-info">
              <div class="side-league">{{ (m.league || 'League').toUpperCase() }}</div>
              <div class="side-tag">{{ m.tag }}</div>
              <button class="side-play" @click.stop="goWatch(m)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Tonton
              </button>
            </div>
          </button>
        </div>
      </div>

      <!-- Premium -->
      <div class="premium-card">
        <div class="premium-copy">
          <h3>Nonton Tanpa Gangguan</h3>
          <p>Upgrade Premium untuk kualitas terbaik dan tanpa iklan.</p>
          <button>👑 Upgrade Premium</button>
        </div>
        <div class="premium-art">
          <svg viewBox="0 0 24 24" fill="var(--accent)"><path d="M13 2 4.5 13H10l-1.5 9L19 9h-6.5L13 2z"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.watch-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  padding-top: 18px;
  align-items: start;
}
.left-col { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.right-col { display: flex; flex-direction: column; gap: 16px; }

/* PLAYER */
.player-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--line2);
  background: #000;
  box-shadow: var(--shadow);
}
.frame-wrap { aspect-ratio: 16/9; }
.frame-wrap iframe { width: 100%; height: 100%; border: 0; display: block; }
.player-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}
.hd-badge {
  background: rgba(8, 11, 18, 0.6);
  color: var(--accent);
  border: 1px solid rgba(232, 255, 71, 0.4);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  backdrop-filter: blur(6px);
}

/* MATCH HEAD */
.match-head { padding: 4px 4px 0; }
.match-league {
  font-size: 11px; font-weight: 600; color: var(--accent);
  text-transform: uppercase; letter-spacing: 0.07em;
  border: 1px solid var(--accent); border-radius: 6px;
  padding: 3px 9px; display: inline-block;
}
.match-title {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(20px, 2.6vw, 28px);
  letter-spacing: -0.02em; margin: 10px 0 4px;
}
.match-actions {
  display: flex; align-items: center; gap: 18px;
  margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line);
}
.act-buttons { display: flex; gap: 8px; }
.btn-primary {
  display: flex; align-items: center; gap: 7px;
  background: var(--accent); color: #080b12;
  font-weight: 700; font-size: 13.5px;
  padding: 10px 16px; border-radius: 10px;
  transition: 0.15s;
}
.btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
.btn-ghost {
  display: flex; align-items: center; gap: 7px;
  border: 1px solid var(--line2); background: var(--surface); color: var(--muted2);
  font-weight: 600; font-size: 13px; padding: 10px 14px; border-radius: 10px;
  transition: 0.15s;
}
.btn-ghost:hover { color: var(--accent); border-color: var(--accent); }
.info-panel {
  margin-left: auto;
  display: flex; flex-direction: column; gap: 7px;
  border-left: 1px solid var(--line);
  padding-left: 18px;
}
.info-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
.info-item svg { color: var(--muted2); }
.info-item b { display: block; color: var(--text); font-weight: 600; font-size: 12.5px; }
.info-item .st.live { color: var(--live); }

/* DETAIL CARDS */
.detail-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.detail-card {
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 16px;
}
.detail-card h3 {
  font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
  margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--muted2);
}
.detail-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }
.quality-list { display: flex; flex-direction: column; gap: 6px; }
.channel-list { display: flex; flex-direction: column; gap: 6px; }
.channel-btn {
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line2); background: var(--surface);
  color: var(--text); border-radius: 9px; padding: 10px 12px;
  font-size: 13px; font-weight: 600;
  transition: 0.15s;
}
.channel-btn:hover { border-color: var(--line2); color: var(--accent); }
.channel-btn.active { background: var(--accent); border-color: var(--accent); color: #080b12; }
.channel-none { font-size: 12px; color: var(--muted); }

/* RIGHT COL */
.side-card {
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  overflow: hidden;
}
.side-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid var(--line);
}
.side-head h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; }
.link-more { font-size: 12px; color: var(--accent); font-weight: 600; }
.side-list { display: flex; flex-direction: column; }
.side-match {
  display: flex; gap: 12px; padding: 12px 16px;
  border-bottom: 1px solid var(--line); text-align: left; transition: 0.15s;
}
.side-match:hover { background: var(--surface); }
.side-art {
  width: 52px; height: 52px; border-radius: 11px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--bg2), #1a2038);
  display: flex; align-items: center; justify-content: center; color: var(--muted);
  position: relative;
}
.side-live {
  position: absolute; top: 4px; right: 4px;
  font-size: 8px; font-weight: 800; color: #fff;
  background: var(--live); border-radius: 4px; padding: 1px 5px;
}
.side-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.side-league { font-size: 9.5px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.side-tag { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.side-play {
  margin-top: auto;
  align-self: flex-start; display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; color: var(--blue);
  background: var(--blue-dim); border-radius: 7px; padding: 4px 10px;
  border: 1px solid rgba(61, 127, 255, 0.25);
}
.side-play:hover { background: var(--blue); color: #fff; }

/* PREMIUM */
.premium-card {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  border-radius: var(--radius);
  padding: 18px;
  border: 1px solid rgba(232, 255, 71, 0.25);
  background:
    radial-gradient(220px 120px at 90% -10%, rgba(232, 255, 71, 0.25), transparent 60%),
    linear-gradient(135deg, #0d1a12, #101824);
  overflow: hidden; position: relative;
}
.premium-copy h3 { color: var(--accent); font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; }
.premium-copy p { color: var(--muted2); font-size: 12px; margin: 6px 0 12px; max-width: 220px; }
.premium-copy button {
  background: var(--accent); color: #080b12; font-weight: 700; font-size: 12.5px;
  padding: 8px 14px; border-radius: 9px;
}
.premium-art { flex-shrink: 0; }
.premium-art svg { width: 56px; height: 56px; filter: drop-shadow(0 0 14px var(--accent-glow)); }

.state-msg {
  text-align: center; padding: 60px 20px; color: var(--muted);
  border: 1px dashed var(--line2); border-radius: var(--radius); background: var(--surface);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.retry-link { color: var(--accent); font-weight: 700; background: none; border: none; cursor: pointer; }

@media (max-width: 1023px) {
  .watch-grid { grid-template-columns: 1fr; }
  .right-col { order: 2; }
  .match-head .match-actions { flex-direction: column; align-items: stretch; }
  .info-panel { margin-left: 0; border-left: 0; border-top: 1px solid var(--line); padding-top: 12px; }
  .detail-cards { grid-template-columns: 1fr; }
}
</style>
