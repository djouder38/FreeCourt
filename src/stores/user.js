import { defineStore } from 'pinia'
import { t } from '../i18n/index.js'

// Statuts contributeurs (spec) : seuils de score et quotas d'ajout.
// Les noms de statut (Rookie, Baller, Legend) sont du vocabulaire basket :
// ils ne se traduisent pas. Les quotas, si.
export const STATUS_LEVELS = [
  { key: 'rookie', label: 'Rookie', minScore: 0, quotaKey: 'quota.rookie' },
  { key: 'regular', label: 'Regular', minScore: 50, quotaKey: 'quota.regular' },
  { key: 'baller', label: 'Baller', minScore: 200, quotaKey: 'quota.baller' },
  { key: 'legend', label: 'Legend', minScore: 500, quotaKey: 'quota.legend' },
]

const SESSION_KEY = 'freecourt:session'

// ⚠️ Accès de développement, PAS une sécurité.
// Tout ce qui vit dans le front est public : les variables VITE_* sont
// inlinées dans le bundle au build, donc ce couple identifiant/code est
// lisible par quiconque ouvre les sources de la page. Il sert à basculer
// l'interface en mode connecté pour travailler, rien d'autre.
// La vraie barrière viendra de Supabase Auth + des RLS côté base, où le
// secret ne quitte jamais le serveur. Voir ROADMAP.md (v1 — Auth).
const DEV_ID = import.meta.env.VITE_ADMIN_ID
const DEV_CODE = import.meta.env.VITE_ADMIN_CODE

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    session: readSession(),
    profile: readSession()?.profile ?? null,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.session),
    isAdmin: (state) => state.profile?.role === 'admin',
    status: (state) => state.profile?.status ?? null,
  },

  actions: {
    // Connexion locale de développement. À remplacer par supabase.auth
    // (magic link ou OAuth) quand l'auth réelle arrive.
    login(id, code) {
      this.error = null

      if (!DEV_ID || !DEV_CODE) {
        this.error = t('profile.noDevAccess')
        return false
      }
      if (id?.trim() !== DEV_ID || code !== DEV_CODE) {
        this.error = t('profile.wrongCredentials')
        return false
      }

      const profile = {
        pseudo: DEV_ID,
        role: 'admin',
        status: 'legend',
        contribution_score: 0,
        courts_added: 0,
        validations_done: 0,
      }
      this.session = { profile, startedAt: new Date().toISOString() }
      this.profile = profile
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.session))
      } catch {
        /* navigation privée : la session vaut pour l'onglet */
      }
      return true
    },

    logout() {
      this.session = null
      this.profile = null
      this.error = null
      try {
        localStorage.removeItem(SESSION_KEY)
      } catch {
        /* rien à nettoyer */
      }
    },
  },
})
