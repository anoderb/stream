<script setup>
import { LABEL } from '../services/api'

defineProps({
  items: { type: Array, required: true },
  active: { type: String, default: 'all' },
})

const emit = defineEmits(['select'])
</script>

<template>
  <!-- Category chips: horizontal scroll, hapus wrap biar mobile-friendly -->
  <nav class="flex gap-2 overflow-x-auto no-scrollbar px-1 pb-1 -mx-1" role="tablist" aria-label="Kategori olahraga">
    <button
      v-for="c in items"
      :key="c"
      role="tab"
      :aria-selected="active === c"
      class="shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
      :class="active === c
        ? 'border-[1.5px]'
        : 'border border-[var(--line2)] text-[var(--muted2)] hover:text-[var(--text)]'"
      :style="active === c
        ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#080b12' }
        : { background: 'var(--surface)' }"
      @click="emit('select', c)"
    >
      {{ LABEL[c] }}
    </button>
  </nav>
</template>
