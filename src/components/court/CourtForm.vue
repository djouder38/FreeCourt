<script setup>
import { reactive, ref } from 'vue'
import { SURFACE_LABELS, CONDITION_LABELS, TRAFFIC_LABELS } from '../../services/labels.js'
import Icon from '../ui/Icon.vue'

// Formulaire ajout/édition : sélecteurs visuels, nom obligatoire.
const props = defineProps({
  initial: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const form = reactive({
  name: props.initial?.name ?? '',
  surface: props.initial?.surface ?? null,
  condition: props.initial?.condition ?? null,
  traffic: props.initial?.traffic ?? null,
  description: props.initial?.description ?? '',
})

const nameError = ref(null)

function toggle(field, value) {
  form[field] = form[field] === value ? null : value
}

function submit() {
  if (!form.name.trim()) {
    nameError.value = 'Donne un nom à ton terrain.'
    return
  }
  nameError.value = null
  emit('submit', { ...form, name: form.name.trim(), description: form.description.trim() || null })
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <div>
      <label class="mb-1.5 block text-sm font-semibold" for="court-name">Nom du terrain *</label>
      <input
        id="court-name"
        v-model="form.name"
        type="text"
        placeholder="Ex : Playground des Glacis"
        class="w-full rounded-xl border border-edge bg-surface px-4 py-3 outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
      />
      <p v-if="nameError" class="mt-1 text-xs text-bad-soft">{{ nameError }}</p>
    </div>

    <fieldset>
      <legend class="mb-1.5 text-sm font-semibold">Surface</legend>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="(cfg, key) in SURFACE_LABELS"
          :key="key"
          type="button"
          class="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition"
          :class="form.surface === key ? 'border-accent bg-accent/15' : 'border-edge bg-card'"
          @click="toggle('surface', key)"
        >
          <Icon :name="cfg.icon" :size="18" />{{ cfg.label }}
        </button>
      </div>
    </fieldset>

    <fieldset>
      <legend class="mb-1.5 text-sm font-semibold">État</legend>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="(cfg, key) in CONDITION_LABELS"
          :key="key"
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition"
          :class="form.condition === key ? 'border-accent bg-accent/15' : 'border-edge bg-card'"
          @click="toggle('condition', key)"
        >
          <Icon :name="cfg.icon" :size="18" />{{ cfg.label }}
        </button>
      </div>
    </fieldset>

    <fieldset>
      <legend class="mb-1.5 text-sm font-semibold">Fréquentation</legend>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="(cfg, key) in TRAFFIC_LABELS"
          :key="key"
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition"
          :class="form.traffic === key ? 'border-accent bg-accent/15' : 'border-edge bg-card'"
          @click="toggle('traffic', key)"
        >
          <span class="text-base">{{ cfg.icon }}</span>{{ cfg.label }}
        </button>
      </div>
    </fieldset>

    <div>
      <label class="mb-1.5 block text-sm font-semibold" for="court-desc">Description (optionnel)</label>
      <textarea
        id="court-desc"
        v-model="form.description"
        rows="3"
        placeholder="Ambiance, accès, horaires sympas…"
        class="w-full rounded-xl border border-edge bg-surface px-4 py-3 outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
      ></textarea>
    </div>

    <button
      type="submit"
      :disabled="submitting"
      class="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 font-bold uppercase tracking-wide text-court shadow-lg shadow-accent/25 disabled:opacity-50"
    >
      <Icon name="ball" :size="18" />
      {{ submitting ? 'Ajout en cours…' : 'Ajouter le terrain' }}
    </button>
  </form>
</template>
