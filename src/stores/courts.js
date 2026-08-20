import { defineStore } from 'pinia'
import {
  fetchCourtsWithRelations,
  fetchCourtDetail,
  insertCourt,
  insertReview,
  insertValidation,
  voteHelpful,
  uploadCourtPhoto,
} from '../services/supabase.js'

export const useCourtsStore = defineStore('courts', {
  state: () => ({
    courts: [],
    selectedId: null,
    loading: false,
    error: null,
    filters: { surface: null, condition: null, traffic: null },
  }),

  getters: {
    filtered(state) {
      return state.courts.filter(
        (c) =>
          (!state.filters.surface || c.surface === state.filters.surface) &&
          (!state.filters.condition || c.condition === state.filters.condition) &&
          (!state.filters.traffic || c.traffic === state.filters.traffic),
      )
    },
    selected(state) {
      return state.courts.find((c) => c.id === state.selectedId) ?? null
    },
    hasActiveFilters(state) {
      return Boolean(state.filters.surface || state.filters.condition || state.filters.traffic)
    },
  },

  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        this.courts = await fetchCourtsWithRelations()
      } catch (e) {
        this.error = 'Impossible de charger les terrains.'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async loadDetail(id) {
      return fetchCourtDetail(id)
    },

    async addCourt(payload) {
      const created = await insertCourt(payload)
      this.courts.push({ ...created, photos: [], rating_avg: null, rating_count: 0 })
      return created
    },

    async addReview(courtId, rating, text) {
      await insertReview(courtId, rating, text)
      await this.load()
    },

    async validate(courtId, type, note) {
      await insertValidation(courtId, type, note)
      await this.load()
    },

    async voteHelpful(reviewId) {
      await voteHelpful(reviewId)
    },

    async addPhoto(courtId, file) {
      return uploadCourtPhoto(courtId, file)
    },

    select(id) {
      this.selectedId = id
    },
  },
})
