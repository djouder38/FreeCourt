<script setup>
import { ref } from 'vue'
import { useCourtsStore } from '../../stores/courts.js'
import FlagIssue from './FlagIssue.vue'
import Icon from '../ui/Icon.vue'
import { t } from '../../i18n/index.js'
import { useToast } from '../../composables/useToast.js'

// Validation communautaire : "le terrain existe", "les infos sont bonnes",
// ou signalement d'un problème. 5 validations => le terrain passe en « validé ».
const props = defineProps({
  court: { type: Object, required: true },
})
const emit = defineEmits(['validated'])

const courtsStore = useCourtsStore()
const toast = useToast()
const done = ref(null)
const flagOpen = ref(false)
const error = ref(null)

async function validate(type) {
  error.value = null
  try {
    await courtsStore.validate(props.court.id, type)
    done.value = type
    toast.show(t('toast.validated'))
    emit('validated')
  } catch (err) {
    console.error(err)
    error.value = t('validation.failed')
  }
}
</script>

<template>
  <section class="rounded-2xl border border-edge bg-card p-4">
    <h3 class="mb-1 font-display text-xl tracking-wide">{{ t('validation.title') }}</h3>
    <p class="mb-3 text-xs text-txt-soft">
      {{ t('validation.counter', { count: court.validation_count }) }}
    </p>

    <p v-if="done" class="text-sm font-semibold text-ok">{{ t('validation.thanks') }}</p>
    <div v-else class="flex flex-wrap gap-2">
      <button
        class="inline-flex items-center gap-1.5 min-h-11 rounded-full border border-ok bg-surface px-4 py-2.5 text-sm font-semibold text-ok"
        @click="validate('existence')"
      >
        <Icon name="check" :size="16" /> {{ t('validation.exists') }}
      </button>
      <button
        class="inline-flex items-center gap-1.5 min-h-11 rounded-full border border-edge bg-surface px-4 py-2.5 text-sm font-semibold"
        @click="validate('info_correct')"
      >
        <Icon name="checkCircle" :size="16" /> {{ t('validation.infoCorrect') }}
      </button>
      <button
        class="inline-flex items-center gap-1.5 min-h-11 rounded-full border border-bad-soft bg-surface px-4 py-2.5 text-sm font-semibold text-bad-soft"
        @click="flagOpen = true"
      >
        <Icon name="flag" :size="16" /> {{ t('validation.problem') }}
      </button>
    </div>
    <p v-if="error" class="mt-2 text-xs text-bad-soft">{{ error }}</p>

    <FlagIssue
      v-if="flagOpen"
      :court="court"
      @close="flagOpen = false"
      @flagged="((done = 'flag'), (flagOpen = false), emit('validated'))"
    />
  </section>
</template>
