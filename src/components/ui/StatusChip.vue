<script setup>
import { t } from '../../i18n/index.js'

const props = defineProps({
  status: { type: String, required: true }, // draft | validated | flagged
})

const CONFIG = {
  draft: { key: 'status.draft', classes: 'bg-warn/15 text-warn border-warn/40' },
  validated: { key: 'status.validated', classes: 'bg-ok/15 text-ok border-ok/40' },
  flagged: { key: 'status.flagged', classes: 'bg-bad/15 text-bad-soft border-bad-soft/40' },
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
