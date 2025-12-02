import { createRouter, createWebHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';
import AuthView from '../views/AuthView.vue';
import { supabase } from '../lib/supabase';

const routes = [
  { path: '/login', component: AuthView },
  { path: '/', component: ChatView, meta: { requiresAuth: true } },
  { path: '/c/:id', component: ChatView, meta: { requiresAuth: true } } // Rute Dinamis
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Pelindung Rute (Navigation Guard)
router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession();
  const isLoggedIn = !!data.session;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    next('/'); // Kalau udah login, gak boleh ke halaman login lagi
  } else {
    next();
  }
});

export default router;