import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

const pinia = createPinia()
const app = createApp(App)
Sentry.init({
  app,
  dsn: 'https://9e3e8612896df9a285289f199a13ad2e@o4511460292231168.ingest.us.sentry.io/4511460299505664',
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: 1.0,
})

app.use(pinia)
app.use(router)
app.mount('#app')

