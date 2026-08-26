import { reactive } from 'vue'

// ===== Player global store: dipakai sidebar/nav + match center ====
// Kontrol modal player dari mana saja tanpa bikin banyak instance composable.

export const playerStore = reactive({
  open: false,
  match: null,
  activeIdx: 0,
  frameUrl: '',
  guardActive: false,
})
