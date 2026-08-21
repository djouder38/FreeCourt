<script setup>
import { ref } from 'vue'
import { useCourtsStore } from '../../stores/courts.js'
import Icon from '../ui/Icon.vue'

// Avis : note 1-5 étoiles + texte, vote "utile" sur chaque avis.
const props = defineProps({
  court: { type: Object, required: true },
})
const emit = defineEmits(['posted'])

const courtsStore = useCourtsStore()
const rating = ref(0)
const hover = ref(0)
const text = ref('')
const submitting = ref(false)
const error = ref(null)
const votedIds = ref(new Set())

async function submit() {
  if (rating.value === 0) {
    error.value = 'Choisis une note.'
    return
  }
  submitting.value = true
  error.value = null
  try {
    await courtsStore.addReview(props.court.id, rating.value, text.value.trim())
    rating.value = 0
    text.value = ''
    emit('posted')
  } catch (err) {
    console.error(err)
    error.value = "L'avis n'a pas pu être posté."
  } finally {
    submitting.value = false
  }
}

async function vote(review) {
  if (votedIds.value.has(review.id)) return
  votedIds.value.add(review.id)
  review.helpful_count += 1
  try {
    await courtsStore.voteHelpful(review.id)
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <section>
    <h3 class="mb-2 font-display text-xl tracking-wide">Avis</h3>

    <div class="mb-4 rounded-2xl border border-edge bg-card p-4">
      <div class="mb-2 flex text-2xl">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="grid h-11 w-11 place-items-center transition"
          :class="(hover || rating) >= n ? 'text-gold' : 'text-txt-soft'"
          :aria-label="`${n} étoiles`"
          @mouseenter="hover = n"
          @mouseleave="hover = 0"
          @click="rating = n"
        >
          ★
        </button>
      </div>
      <textarea
        v-model="text"
        rows="2"
        placeholder="Ton avis sur ce terrain… (optionnel)"
        class="mb-2 w-full rounded-xl border border-edge bg-surface px-3 py-2 text-sm outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
      ></textarea>
      <button
        type="button"
        :disabled="submitting"
        class="min-h-11 rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-accent disabled:opacity-50"
        @click="submit"
      >
        {{ submitting ? 'Envoi…' : 'Poster' }}
      </button>
      <p v-if="error" class="mt-2 text-xs text-bad-soft">{{ error }}</p>
    </div>

    <ul v-if="court.reviews?.length" class="space-y-3">
      <li v-for="review in court.reviews" :key="review.id" class="rounded-2xl border border-edge bg-card p-4">
        <p class="mb-1 text-gold">{{ '★'.repeat(review.rating) }}<span class="text-edge">{{ '★'.repeat(5 - review.rating) }}</span></p>
        <p v-if="review.text" class="mb-2 text-sm leading-relaxed">{{ review.text }}</p>
        <button
          type="button"
          class="-mx-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-semibold text-txt-soft hover:text-txt"
          :class="{ 'text-accent-text': votedIds.has(review.id) }"
          @click="vote(review)"
        >
          <Icon name="thumb" :size="14" /> Utile ({{ review.helpful_count }})
        </button>
      </li>
    </ul>
    <p v-else class="text-sm text-txt-soft">Aucun avis pour l'instant.</p>
  </section>
</template>
