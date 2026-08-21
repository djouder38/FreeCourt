<script setup>
import { ref, computed } from 'vue'

// Bottom sheet mobile : 2 crans (40% / 90%), swipe sur le handle, fermeture
// par swipe vers le bas depuis le cran bas.
const emit = defineEmits(['close'])

const expanded = ref(false)
const dragOffset = ref(0)
let dragStartY = null

// Hauteur fixe + translation : animer `height` force un recalcul de layout
// a chaque frame, la ou `transform` reste sur le compositeur.
// Replie = 90dvh translates de 50dvh vers le bas, soit 40dvh visibles.
const COLLAPSED_OFFSET_DVH = 50

const heightStyle = computed(() => {
  const base = expanded.value ? 0 : COLLAPSED_OFFSET_DVH
  const drag = Math.max(dragOffset.value, 0)
  return {
    height: '90dvh',
    transform: `translateY(calc(${base}dvh + ${drag}px))`,
    transition: dragStartY === null ? 'transform 0.25s ease' : 'none',
  }
})

function onTouchStart(e) {
  dragStartY = e.touches ? e.touches[0].clientY : e.clientY
}

function onTouchMove(e) {
  if (dragStartY === null) return
  const y = e.touches ? e.touches[0].clientY : e.clientY
  dragOffset.value = y - dragStartY
}

function onTouchEnd() {
  const delta = dragOffset.value
  dragStartY = null
  dragOffset.value = 0
  if (delta < -60) expanded.value = true
  else if (delta > 60) {
    if (expanded.value) expanded.value = false
    else emit('close')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-40" @click.self="emit('close')">
    <div
      class="absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl border-t border-edge bg-surface shadow-[var(--shadow-raised)]"
      :style="heightStyle"
    >
      <div
        class="flex shrink-0 cursor-grab justify-center py-4 touch-none"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onTouchStart"
        @mousemove="onTouchMove"
        @mouseup="onTouchEnd"
        @mouseleave="dragStartY !== null && onTouchEnd()"
      >
        <div class="h-1.5 w-12 rounded-full bg-txt-soft"></div>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <slot />
      </div>
    </div>
  </div>
</template>
