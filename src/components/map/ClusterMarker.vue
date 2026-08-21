<script setup>
import { computed } from 'vue'

// Pastille de regroupement : plus la zone contient de terrains, plus le
// disque est gros. Cliquer dessus dézoome le groupe.
const props = defineProps({
  count: { type: Number, required: true },
})

const size = computed(() => {
  if (props.count >= 50) return 62
  if (props.count >= 20) return 54
  if (props.count >= 10) return 48
  return 44
})

const label = computed(() => (props.count > 999 ? '999+' : String(props.count)))
</script>

<template>
  <div
    class="fc-cluster grid cursor-pointer place-items-center rounded-full font-bold transition-transform"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <span class="text-sm leading-none">{{ label }}</span>
  </div>
</template>
