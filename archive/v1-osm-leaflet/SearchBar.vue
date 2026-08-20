<script setup>
import { ref } from 'vue'
import { searchPlace } from '../lib/geocode.js'

const emit = defineEmits(['goto'])

const query = ref('')
const results = ref([])
const searching = ref(false)
const error = ref(null)

async function submit() {
  const q = query.value.trim()
  if (!q) return
  searching.value = true
  error.value = null
  try {
    results.value = await searchPlace(q)
    if (results.value.length === 0) error.value = 'Aucun lieu trouvé.'
  } catch {
    error.value = 'Recherche indisponible, réessaie.'
  } finally {
    searching.value = false
  }
}

function pick(place) {
  results.value = []
  query.value = ''
  emit('goto', place)
}
</script>

<template>
  <div class="search">
    <form class="search__form" @submit.prevent="submit">
      <input
        v-model="query"
        class="search__input"
        type="search"
        placeholder="Chercher une ville…"
        aria-label="Chercher une ville"
      />
      <button class="search__btn" type="submit" :disabled="searching">
        {{ searching ? '…' : 'OK' }}
      </button>
    </form>
    <ul v-if="results.length" class="search__results">
      <li v-for="place in results" :key="place.label">
        <button @click="pick(place)">{{ place.label }}</button>
      </li>
    </ul>
    <p v-if="error" class="search__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  width: min(340px, 60vw);
}

.search__form {
  display: flex;
  gap: 6px;
}

.search__input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font: inherit;
  min-width: 0;
}

.search__btn {
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: var(--orange);
  color: #fff;
  font-weight: 700;
}

.search__results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: var(--paper);
  border-radius: 8px;
  box-shadow: var(--shadow);
  max-height: 260px;
  overflow-y: auto;
}

.search__results button {
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
}

.search__results button:hover {
  background: #f5f5f4;
}

.search__error {
  position: absolute;
  top: calc(100% + 6px);
  margin: 0;
  background: var(--paper);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 8px 12px;
  font-size: 13px;
  color: var(--muted);
}
</style>
