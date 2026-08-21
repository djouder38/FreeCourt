import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import './style.css'
import { mountI18n } from './i18n/index.js'

mountI18n()

createApp(App).use(createPinia()).use(router).mount('#app')
