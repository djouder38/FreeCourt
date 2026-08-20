<script setup>
import { ref } from 'vue'
import { useCourtsStore } from '../../stores/courts.js'

// Galerie 3 photos max + upload vers Supabase Storage.
const props = defineProps({
  court: { type: Object, required: true },
})
const emit = defineEmits(['uploaded'])

const courtsStore = useCourtsStore()
const uploading = ref(false)
const error = ref(null)
const fileInput = ref(null)

async function onFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Choisis une image.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image trop lourde (5 Mo max).'
    return
  }
  uploading.value = true
  error.value = null
  try {
    await courtsStore.addPhoto(props.court.id, file)
    emit('uploaded')
  } catch (err) {
    console.error(err)
    error.value = "L'upload a échoué, réessaie."
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <section>
    <h3 class="mb-2 font-display text-xl tracking-wide">Photos</h3>
    <div class="flex gap-2 overflow-x-auto">
      <img
        v-for="photo in court.photos.slice(0, 3)"
        :key="photo.id"
        :src="photo.url"
        loading="lazy"
        alt=""
        class="h-28 w-40 shrink-0 rounded-xl border border-edge object-cover"
      />
      <button
        v-if="court.photos.length < 3"
        type="button"
        :disabled="uploading"
        class="grid h-28 w-40 shrink-0 place-items-center rounded-xl border border-dashed border-edge bg-surface text-sm font-semibold text-txt-soft disabled:opacity-50"
        @click="fileInput.click()"
      >
        {{ uploading ? 'Envoi…' : '+ Ajouter' }}
      </button>
    </div>
    <p v-if="court.photos.length === 0 && !uploading" class="mt-2 text-xs text-txt-soft">
      Aucune photo pour l'instant (3 max par terrain).
    </p>
    <p v-if="error" class="mt-2 text-xs text-bad">{{ error }}</p>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
  </section>
</template>
