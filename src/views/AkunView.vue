<script setup>
// Akun — UI singkat, tanpa sistem auth (frontend-only placeholder)
import { ref, computed } from 'vue'
import { useStreams } from '../composables/useStreams'

const { stats } = useStreams()
const saved = ref(new Set(JSON.parse(localStorage.getItem('nobaryu-saved') || '[]')))
</script>

<template>
  <div class="page-inner">
    <div class="page-head">
      <h1>Akun</h1>
    </div>

    <div class="profile-card">
      <div class="avatar-big">K</div>
      <div>
        <div class="profile-name">Tamu</div>
        <div class="profile-sub">Belum masuk · statistik ditampilkan lokal</div>
      </div>
    </div>

    <div class="stats-mini">
      <div class="mini"><b>{{ stats.live }}</b><span>Live</span></div>
      <div class="mini"><b>{{ stats.upcoming }}</b><span>Upcoming</span></div>
      <div class="mini"><b>{{ saved.size }}</b><span>Disimpan</span></div>
    </div>

    <div class="note">
      Fitur akun penuh (login, riwayat, preferensi) belum tersedia di versi ini.
    </div>
  </div>
</template>

<style scoped>
.page-inner { padding-top: 20px; }
.page-head { padding: 6px 0 14px; }
.page-head h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; }
.profile-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 18px;
}
.avatar-big {
  width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
  background: var(--accent); color: #080b12; font-weight: 900; font-size: 22px;
  display: flex; align-items: center; justify-content: center;
}
.profile-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; }
.profile-sub { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
.stats-mini { display: flex; gap: 10px; margin-top: 14px; }
.mini {
  flex: 1; background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-sm);
  padding: 14px; display: flex; flex-direction: column; gap: 2px;
}
.mini b { font-family: 'Syne', sans-serif; font-size: 22px; }
.mini span { font-size: 11px; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.05em; }
.note {
  margin-top: 16px; font-size: 12.5px; color: var(--muted);
  border: 1px dashed var(--line2); border-radius: var(--radius-sm);
  padding: 12px 14px; background: var(--surface);
}
</style>
