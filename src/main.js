import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // Import Router

const app = createApp(App)
app.use(router) // Gunakan Router
app.mount('#app')