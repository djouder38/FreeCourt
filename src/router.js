import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./pages/Home.vue') },
  { path: '/court/:id', name: 'court', component: () => import('./pages/CourtDetail.vue') },
  { path: '/add', name: 'add', component: () => import('./pages/AddCourt.vue') },
  { path: '/profile', name: 'profile', component: () => import('./pages/Profile.vue') },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('./pages/NotFound.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
