<script setup>
import { t } from '../../i18n/index.js'

const props = defineProps({
  status: { type: String, required: true }, // draft | validated | flagged
})

const CONFIG = {
  draft: { key: 'status.draft', classes: 'bg-warn text-on-accent border-warn' },
  validated: { key: 'status.validated', classes: 'bg-ok text-on-accent border-ok' },
  flagged: { key: 'status.flagged', classes: 'bg-bad text-on-accent border-bad' },
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
    :class="CONFIG[status]?.classes"
  >
    {{ CONFIG[status] ? t(CONFIG[status].key) : status }}
  </span>
</template>
