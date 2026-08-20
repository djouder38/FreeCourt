<script setup>
import { ref } from 'vue'
import { useCourtsStore } from '../../stores/courts.js'
import FlagIssue from './FlagIssue.vue'

// Validation communautaire : "le terrain existe", "les infos sont bonnes",
// ou signalement d'un problème. 5 validations => terrain verrouillé + validé.
const props = defineProps({
  court: { type: Object, required: true },
})
const emit = defineEmits(['validated'])

const courtsStore = useCourtsStore()
const done = ref(null)
const flagOpen = ref(false)
const error = ref(null)

async function validate(type) {
  error.value = null
  try {
    await courtsStore.validate(props.court.id, type)
    done.value = type
    emit('validated')
  } catch (err) {
    console.error(err)
    error.value = 'La validation a échoué, réessaie.'
  }
}
</script>

<template>
  <section class="rounded-2xl border border-edge bg-card p-4">
    <h3 class="mb-1 font-display text-xl tracking-wide">Valide ce terrain</h3>
    <p class="mb-3 text-xs text-txt-soft">
      {{ court.validation_count }}/5 validations — à 5, le terrain est verrouillé et certifié.
    </p>

    <p v-if="done" class="text-sm font-semibold text-ok">Merci pour le coup de main ! 🏀</p>
    <div v-else class="flex flex-wrap gap-2">
      <button
        class="rounded-full border border-ok/50 bg-ok/10 px-4 py-2 text-sm font-semibold text-ok"
        @click="validate('existence')"
      >
        ✅ Il existe
      </button>
      <button
        class="rounded-full border border-edge bg-surface px-4 py-2 text-sm font-semibold"
        @click="validate('info_correct')"
      >
        👌 Infos correctes
      </button>
      <button
        class="rounded-full border border-bad/50 bg-bad/10 px-4 py-2 text-sm font-semibold text-bad"
        @click="flagOpen = true"
      >
        🚩 Un problème
      </button>
    </div>
    <p v-if="error" class="mt-2 text-xs text-bad">{{ error }}</p>

    <FlagIssue
      v-if="flagOpen"
      :court="court"
      @close="flagOpen = false"
      @flagged="((done = 'flag'), (flagOpen = false), emit('validated'))"
    />
  </section>
</template>
