<script setup>
import { computed } from 'vue'
import { fmtTime } from '../services/api'

const props = defineProps({
  open: { type: Boolean, default: false },
  match: { type: Object, default: null },
  activeIdx: { type: Number, default: 0 },
  frameUrl: { type: String, default: '' },
})

const emit = defineEmits(['close', 'select'])

const servers = computed(() => (props.match ? props.match.iframes || [] : []))

// NOTE: sandbox TIDAK dipakai — provider stream (streams.esportex.site) nolak
// "SANDBOX IFRAME NOT ALLOWED" kalau diberi sandbox. Pertahanan anti-judol
// di-handle sepenuhnya oleh redirect guard JS (useGuard.js) yang aktif
// selama player terbuka + blocklist terpusat saat setFrame.
</script>

<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="modal-overlay"
        @click.self="emit('close')"
      >
        <!-- Sheet: mobile bottom, desktop centered -->
        <div class="player-sheet">
          <!-- Header -->
          <div class="player-head">
            <div class="min-w-0">
              <div class="player-title truncate">{{ match?.tag || '—' }}</div>
              <div class="player-sub truncate">{{ match ? `${match.league || ''} · ${fmtTime(match.kickoff)}` : '—' }}</div>
            </div>
            <button class="player-close" aria-label="Tutup" @click="emit('close')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Frame -->
          <div class="frame-wrap">
            <iframe
              :key="frameUrl"
              :src="frameUrl || 'about:blank'"
              title="Streaming Player"
              allowfullscreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
              referrerpolicy="strict-origin-when-cross-origin"
              frameborder="0"
            />
          </div>

          <!-- Footer: pilih server -->
          <div class="player-foot safe-bottom">
            <div class="server-label">Pilih Server</div>
            <div class="server-tabs">
              <button
                v-for="(s, i) in servers"
                :key="i"
                class="server-tab"
                :class="{ active: i === activeIdx }"
                @click="emit('select', i)"
              >
                {{ s.server || `Server ${i + 1}` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(2px);
}
.player-sheet {
  width: min(960px, 100%);
  background: var(--card2);
  border: 1px solid var(--line2);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
}
.player-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--card);
}
.player-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.02em;
}
.player-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}
.player-close {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid var(--line2);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted2);
  flex-shrink: 0;
  transition: 0.15s;
}
.player-close:hover {
  border-color: var(--live);
  color: var(--live);
}
.frame-wrap {
  aspect-ratio: 16/9;
  background: #000;
}
.frame-wrap iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
.player-foot {
  padding: 12px 16px;
  border-top: 1px solid var(--line);
  background: var(--card);
}
.server-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 8px;
}
.server-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.server-tab {
  padding: 7px 13px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--line2);
  background: var(--surface);
  color: var(--muted2);
  transition: 0.15s;
}
.server-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #080b12;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== mobile: bottom sheet penuh ===== */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .player-sheet {
    width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 92vh;
    overflow-y: auto;
  }
  .frame-wrap {
    aspect-ratio: 16/10;
  }
}
</style>
