import { defineStore } from 'pinia'

// Statuts contributeurs (spec) : seuils de score et quotas d'ajout.
export const STATUS_LEVELS = [
  { key: 'rookie', label: 'Rookie', minScore: 0, quota: '2 terrains/semaine' },
  { key: 'regular', label: 'Regular', minScore: 50, quota: '5 terrains/semaine' },
  { key: 'baller', label: 'Baller', minScore: 200, quota: '10 terrains/semaine' },
  { key: 'legend', label: 'Legend', minScore: 500, quota: 'Illimité' },
]

// Auth volontairement NON implémentée pour l'instant (spec) :
// structure prête, méthodes placeholder.
export const useUserStore = defineStore('user', {
  state: () => ({
    session: null,
    profile: null,
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.session),
    status: (state) => state.profile?.status ?? null,
  },

  actions: {
    async login() {
      // TODO auth Google/email — branchée en v2.1
      console.info('[FreeCourt] Auth pas encore branchée.')
    },
    async logout() {
      this.session = null
      this.profile = null
    },
  },
})
