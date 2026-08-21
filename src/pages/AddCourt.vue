<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourtsStore } from '../stores/courts.js'
import { useToast } from '../composables/useToast.js'
import CourtForm from '../components/court/CourtForm.vue'
import Mascot from '../components/ui/Mascot.vue'
import Icon from '../components/ui/Icon.vue'
import { t } from '../i18n/index.js'

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
    toast.show(t('toast.courtAdded'))
    router.push('/')
  } catch (err) {
    console.error(err)
    error.value = t('form.failed')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 pb-28 pt-4 lg:pb-8">
    <button class="-mx-2 mb-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-txt-soft hover:text-txt" @click="router.back()">
      <Icon name="back" :size="16" /> {{ t('nav.back') }}
    </button>

    <div v-if="!position" class="flex flex-col items-center gap-4 py-16 text-center">
      <Mascot mood="sad" />
      <p class="text-txt-soft">{{ t('form.needPin') }}</p>
      <button class="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-bold uppercase tracking-wide text-on-accent" @click="router.push('/')">
        {{ t('nav.backToMap') }}
      </button>
    </div>

    <template v-else>
      <h1 class="mb-1 font-display text-4xl tracking-wide">{{ t('form.newCourt') }}</h1>
      <p class="mb-6 text-sm text-txt-soft">
        <Icon name="pin" :size="14" class="mr-1 inline align-text-bottom" />{{ t('form.position', { lat: position.lat.toFixed(5), lng: position.lng.toFixed(5) }) }}
      </p>
      <CourtForm :submitting="submitting" @submit="onSubmit" />
      <p v-if="error" class="mt-3 text-sm text-bad-soft">{{ error }}</p>
    </template>
  </div>
</template>
