import { reactive } from 'vue'

// Toast global minimaliste (avec mascotte) — un seul à la fois.
const state = reactive({ message: null, visible: false })
let timer = null

export function useToast() {
  function show(message, duration = 3200) {
    state.message = message
    state.visible = true
    clearTimeout(timer)
    timer = setTimeout(() => (state.visible = false), duration)
  }
  return { state, show }
}
