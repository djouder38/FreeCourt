<script setup>
const props = defineProps({
  status: { type: String, required: true }, // draft | validated | flagged
})

const CONFIG = {
  draft: { label: 'À vérifier', classes: 'bg-warn/15 text-warn border-warn/40' },
  validated: { label: 'Validé', classes: 'bg-ok/15 text-ok border-ok/40' },
  flagged: { label: 'Signalé', classes: 'bg-bad/15 text-bad-soft border-bad-soft/40' },
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
    :class="CONFIG[status]?.classes"
  >
    {{ CONFIG[status]?.label ?? status }}
  </span>
</template>
