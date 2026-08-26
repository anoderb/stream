<script setup>
// Highlights — konten 3D/mock belum tersedia; tampilkan kosong-state rapi
</script>

<template>
  <div class="page-inner">
    <div class="page-head">
      <h1>Highlights</h1>
      <span class="page-count">Segera</span>
    </div>
    <div class="empty-card">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
      <p>Fitur highlights belum tersedia.</p>
      <p class="sub">Pantengin terus — konten cuplikan pertandingan bakal hadir di sini.</p>
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
.empty-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 70px 20px; color: var(--muted);
  border: 1px dashed var(--line2); border-radius: var(--radius); background: var(--surface);
  text-align: center;
}
.empty-card svg { opacity: 0.5; }
.empty-card p:first-of-type { font-weight: 600; color: var(--muted2); }
.empty-card .sub { font-size: 13px; max-width: 320px; }
</style>
