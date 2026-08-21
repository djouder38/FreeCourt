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
import { distanceMeters } from '../services/geo.js'

export const useCourtsStore = defineStore('courts', {
  state: () => ({
    courts: [],
    selectedId: null,
    loading: false,
    error: null,
    filters: { surface: null, condition: null, traffic: null },
    // Position de l utilisateur, une fois qu il l a autorisee.
    userPosition: null,
  }),

  getters: {
    // Les terrains, augmentes de leur distance quand on sait ou est l utilisateur.
    withDistance(state) {
      const from = state.userPosition
      return state.courts.map((c) => ({
        ...c,
        distance: from ? distanceMeters(from, { lat: c.lat, lng: c.lng }) : null,
      }))
    },

    filtered(state) {
      return state.courts.filter(
        (c) =>
          (!state.filters.surface || c.surface === state.filters.surface) &&
          (!state.filters.condition || c.condition === state.filters.condition) &&
          (!state.filters.traffic || c.traffic === state.filters.traffic),
      )
    },
    // Ce que le joueur veut voir en arrivant : les plus proches d abord.
    nearby() {
      if (!this.userPosition) return []
      return [...this.filtered]
        .map((c) => ({ ...c, distance: distanceMeters(this.userPosition, { lat: c.lat, lng: c.lng }) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 12)
    },

    // On cherche dans les terrains VISIBLES : afficher la fiche d un terrain
    // que le filtre courant exclut serait incoherent.
    selected(state) {
      return this.filtered.find((c) => c.id === state.selectedId) ?? null
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

    setUserPosition(pos) {
      this.userPosition = pos
    },

    select(id) {
      this.selectedId = id
    },
  },
})
