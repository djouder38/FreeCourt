<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourtsStore } from '../stores/courts.js'
import { useToast } from '../composables/useToast.js'
import CourtForm from '../components/court/CourtForm.vue'
import Mascot from '../components/ui/Mascot.vue'
import Icon from '../components/ui/Icon.vue'

const route = useRoute()
const router = useRouter()
const courtsStore = useCourtsStore()
const toast = useToast()

const submitting = ref(false)
const error = ref(null)

const position = computed(() => {
  const lat = parseFloat(route.query.lat)
  const lng = parseFloat(route.query.lng)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
})

async function onSubmit(form) {
  submitting.value = true
  error.value = null
  try {
    await courtsStore.addCourt({ ...form, lat: position.value.lat, lng: position.value.lng })
    toast.show('Terrain ajouté ! La communauté va le valider.')
    router.push('/')
  } catch (err) {
    console.error(err)
    error.value = "L'ajout a échoué, réessaie."
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 pb-28 pt-4 lg:pb-8">
    <button class="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-txt-soft hover:text-white" @click="router.back()">
      <Icon name="back" :size="16" /> Retour
    </button>

    <div v-if="!position" class="flex flex-col items-center gap-4 py-16 text-center">
      <Mascot mood="sad" />
      <p class="text-txt-soft">Commence par placer ton pin sur la carte.</p>
      <button class="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-bold uppercase tracking-wide text-court" @click="router.push('/')">
        Retour à la carte
      </button>
    </div>

    <template v-else>
      <h1 class="mb-1 font-display text-4xl tracking-wide">Nouveau terrain</h1>
      <p class="mb-6 text-sm text-txt-soft">
        <Icon name="pin" :size="14" class="mr-1 inline align-text-bottom" />{{ position.lat.toFixed(5) }},
        {{ position.lng.toFixed(5) }} — il sera « à vérifier »
        jusqu'à 5 validations de la communauté.
      </p>
      <CourtForm :submitting="submitting" @submit="onSubmit" />
      <p v-if="error" class="mt-3 text-sm text-bad-soft">{{ error }}</p>
    </template>
  </div>
</template>
