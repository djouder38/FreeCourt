<script setup>
// Bally, la mascotte : un ballon avec des yeux et des petits bras.
defineProps({
  mood: { type: String, default: 'happy' }, // happy | sad
  size: { type: Number, default: 96 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <!-- bras -->
    <path d="M14 62 Q2 54 8 42" stroke="#FF6B2B" stroke-width="6" stroke-linecap="round" />
    <path d="M106 62 Q118 54 112 42" stroke="#FF6B2B" stroke-width="6" stroke-linecap="round" />
    <!-- ballon -->
    <circle cx="60" cy="60" r="46" fill="#FF6B2B" stroke="#C94F1E" stroke-width="3" />
    <path d="M14 60 H106" stroke="#1a1a1a" stroke-width="3" />
    <path d="M60 14 V106" stroke="#1a1a1a" stroke-width="3" />
    <path d="M25 27 Q60 60 25 93" stroke="#1a1a1a" stroke-width="3" fill="none" />
    <path d="M95 27 Q60 60 95 93" stroke="#1a1a1a" stroke-width="3" fill="none" />
    <!-- yeux -->
    <circle cx="45" cy="50" r="7" fill="#fff" />
    <circle cx="75" cy="50" r="7" fill="#fff" />
    <circle cx="46.5" cy="51.5" r="3" fill="#1a1a1a" />
    <circle cx="76.5" cy="51.5" r="3" fill="#1a1a1a" />
    <!-- bouche -->
    <path
      v-if="mood === 'happy'"
      d="M48 72 Q60 82 72 72"
      stroke="#1a1a1a"
      stroke-width="3.5"
      stroke-linecap="round"
      fill="none"
    />
    <path
      v-else
      d="M48 78 Q60 68 72 78"
      stroke="#1a1a1a"
      stroke-width="3.5"
      stroke-linecap="round"
      fill="none"
    />
  </svg>
</template>
