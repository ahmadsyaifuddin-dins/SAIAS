import './app.css' // Jika ada file ini, biarkan. Jika tidak, baris ini bisa dihapus.
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app