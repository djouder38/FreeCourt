<script setup>
// Jeu d'icônes FreeCourt, toutes dessinées sur la même grille 24×24, trait 2,
// bouts arrondis, en currentColor. Un seul fichier pour garantir une main
// unique : une icône ajoutée ailleurs se verrait immédiatement.
const ICONS = {
  // — Identité
  ball: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M3 12h18"/><path d="M5.6 5.6C9 9 9 15 5.6 18.4"/><path d="M18.4 5.6C15 9 15 15 18.4 18.4"/>',

  // — Navigation & chrome
  pin: '<path d="M12 21c4.5-4.7 7-8.1 7-11a7 7 0 1 0-14 0c0 2.9 2.5 6.3 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  filters:
    '<path d="M4 6h4"/><circle cx="10" cy="6" r="2"/><path d="M12 6h8"/><path d="M4 12h9"/><circle cx="15" cy="12" r="2"/><path d="M17 12h3"/><path d="M4 18h3"/><circle cx="9" cy="18" r="2"/><path d="M11 18h9"/>',
  route: '<path d="m3 11 19-9-9 19-2-8-8-2z"/>',
  close: '<path d="m6 6 12 12"/><path d="M18 6 6 18"/>',
  back: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  camera:
    '<path d="M4 8.5h3L8.5 6h7L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',

  // — Communauté
  star: '<path d="m12 3 2.7 5.5 6 .9-4.35 4.2 1.03 6L12 16.8l-5.38 2.8 1.03-6L3.3 9.4l6-.9z"/>',
  thumb:
    '<path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/><path d="m7 10 4-7a2 2 0 0 1 3 1.8V9h4.5a2 2 0 0 1 2 2.3l-1.2 7a2 2 0 0 1-2 1.7H7"/>',
  check: '<path d="m4 12.5 5.5 5.5L20 6"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.8 2.8L16 9.5"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4.5h11l-1.8 4 1.8 4H5"/>',
  medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.6 10 6 2.5h12L15.4 10"/>',

  // — Fréquentation
  moon: '<path d="M20.5 14.8A8.6 8.6 0 0 1 9.2 3.5a8.6 8.6 0 1 0 11.3 11.3z"/>',
  flame:
    '<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4-4-5.4-4-9.4 0 0-2.6 1.4-2.6 4.6 0 1.4-1.4 1.8-1.4 1.8s-1.2-1-1.2-2.6c0 0-2.8 2.4-2.8 5.6C6 18.6 8.4 21 12 21z"/>',

  // — Revêtements : le même cadre de terrain, une texture différente dedans
  concrete: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M3 12h18"/><path d="M9 6v6"/><path d="M15 12v6"/>',
  wood: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M3 10h18"/><path d="M3 14h18"/><path d="M11 6v4"/><path d="M7 10v4"/><path d="M14 14v4"/>',
  synthetic: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M12 6v12"/><circle cx="12" cy="12" r="2.5"/>',
  sand: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M3.5 14.5c3-3 5.5-3 8.5 0s5.5 3 8.5 0"/>',

  // — États
  half: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.4h.01"/>',
}

defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  filled: { type: Boolean, default: false },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    class="shrink-0"
    v-html="ICONS[name]"
  />
</template>
