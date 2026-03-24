import './assets/main.css'

import { createApp } from 'vue'
import naive from 'naive-ui'

import App from './App.vue'
import router from './router'
import { pinia } from './stores/pinia'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(naive)

app.mount('#app')
