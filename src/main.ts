import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './css/main.css'
import './css/animations.css'

import App from './App.vue'
import router from './router'

// Automatically register the PWA service worker
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin)

app.mount('#app')
