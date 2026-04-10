import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { createHead } from '@unhead/vue'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createHead())
app.use(createPinia())
app.mount('#app')
