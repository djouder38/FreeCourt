import { computed, ref } from 'vue'

// Trois états : 'auto' suit le réglage du téléphone, 'light' et 'dark' forcent.
// Le clair est le défaut quand le système ne dit rien : FreeCourt s'utilise
// dehors en plein jour, et une carte sombre au soleil est illisible.
const STORAGE_KEY = 'freecourt:theme'
const MODES = ['auto', 'light', 'dark']

const mode = ref(read())
const systemDark = ref(false)

function read() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(saved) ? saved : 'auto'
  } catch {
    return 'auto'
  }
}

// Le thème réellement appliqué, une fois 'auto' résolu.
const resolved = computed(() => {
  if (mode.value === 'auto') return systemDark.value ? 'dark' : 'light'
  return mode.value
})

function apply() {
  document.documentElement.dataset.theme = resolved.value
  document.documentElement.style.colorScheme = resolved.value
}

let mounted = false

export function useTheme() {
  function mount() {
    if (mounted || typeof window === 'undefined') return
    mounted = true
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = query.matches
    query.addEventListener('change', (e) => {
      systemDark.value = e.matches
      apply()
    })
    apply()
  }

  function set(next) {
    if (!MODES.includes(next)) return
    mode.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* navigation privée : le thème vaut pour la session */
    }
    apply()
  }

  return { mode, resolved, set, mount, MODES }
}
