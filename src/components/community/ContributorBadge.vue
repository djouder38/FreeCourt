<script setup>
import { computed } from 'vue'
import { STATUS_LEVELS } from '../../stores/user.js'
import Icon from '../ui/Icon.vue'

// Badge Rookie → Legend d'un contributeur.
const props = defineProps({
  status: { type: String, default: 'rookie' },
})

const STYLE = {
  rookie: 'border-edge bg-card text-txt-soft',
  regular: 'border-ok/50 bg-ok/10 text-ok',
  baller: 'border-accent/60 bg-accent/10 text-accent-text',
  legend: 'border-gold/60 bg-gold/10 text-gold',
}

const level = computed(() => STATUS_LEVELS.find((l) => l.key === props.status))
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider"
    :class="STYLE[status]"
  >
    <Icon name="medal" :size="14" />
    {{ level?.label ?? status }}
  </span>
</template>
