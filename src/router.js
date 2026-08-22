import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./pages/Home.vue') },
  { path: '/court/:id', name: 'court', component: () => import('./pages/CourtDetail.vue') },
  { path: '/add', name: 'add', component: () => import('./pages/AddCourt.vue') },
  { path: '/profile', name: 'profile', component: () => import('./pages/Profile.vue') },
  { path: '/decouvrir', name: 'welcome', component: () => import('./pages/Welcome.vue') },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('./pages/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Au tout premier lancement, on explique le concept avant de montrer la
// carte. Une seule fois : ensuite l'app s'ouvre sur les terrains, ce qui est
// la promesse du produit.
const SEEN_KEY = 'freecourt:welcomeSeen'

router.beforeEach((to) => {
  if (to.name !== 'home') return true
  try {
    if (localStorage.getItem(SEEN_KEY)) return true
  } catch {
    return true // stockage indisponible : on ne bloque jamais l'entree
  }
  return { name: 'welcome' }
})

export default router
