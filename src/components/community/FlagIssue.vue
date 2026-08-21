<script setup>
import { ref } from 'vue'
import { useCourtsStore } from '../../stores/courts.js'
import { useToast } from '../../composables/useToast.js'

// Signalement d'un problème sur un terrain (n'existe plus, infos fausses…).
const props = defineProps({
  court: { type: Object, required: true },
})
const emit = defineEmits(['close', 'flagged'])

const courtsStore = useCourtsStore()
const toast = useToast()
const note = ref('')
const submitting = ref(false)
const error = ref(null)

async function submit() {
  if (!note.value.trim()) {
    error.value = 'Décris le problème en quelques mots.'
    return
  }
  submitting.value = true
  error.value = null
  try {
    await courtsStore.validate(props.court.id, 'flag_issue', note.value.trim())
    toast.show('Signalement envoyé. On va regarder ça.')
    emit('flagged')
  } catch (err) {
    console.error(err)
    error.value = 'Le signalement a échoué.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-txt/60 p-4" @click.self="emit('close')">
    <div class="w-full max-w-sm rounded-2xl border border-edge bg-surface p-5">
      <h3 class="mb-3 font-display text-2xl tracking-wide">Signaler un problème</h3>
      <textarea
        v-model="note"
        rows="3"
        placeholder="Ex : le terrain n'existe plus, les paniers ont été retirés…"
        class="mb-3 w-full rounded-xl border border-edge bg-card px-3 py-2 text-sm outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
      ></textarea>
      <p v-if="error" class="mb-2 text-xs text-bad-soft">{{ error }}</p>
      <div class="flex justify-end gap-2">
        <button class="rounded-full border border-edge px-4 py-2 text-sm font-semibold" @click="emit('close')">
          Annuler
        </button>
        <button
          :disabled="submitting"
          class="rounded-full bg-bad text-on-accent px-4 py-2 text-sm font-bold uppercase disabled:opacity-50"
          @click="submit"
        >
          {{ submitting ? 'Envoi…' : 'Signaler' }}
        </button>
      </div>
    </div>
  </div>
</template>
