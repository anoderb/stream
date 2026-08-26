<script setup>
import { ref } from 'vue'

// ===== Toast: snackbar bottom-center =====
const visible = ref(false)
const msg = ref('')
let timer = null

function show(text, ms = 2400) {
  msg.value = text
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, ms)
}

defineExpose({ show })
</script>

<template>
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none transition-all duration-300 rounded-full px-5 py-2.5 text-[13px] font-bold whitespace-nowrap"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
    style="background: var(--text); color: var(--bg)"
  >
    {{ msg }}
  </div>
</template>
