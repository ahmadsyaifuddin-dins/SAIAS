import { createRouter, createWebHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';
import AuthView from '../views/AuthView.vue';
import AdminView from '../views/AdminView.vue';
import { supabase } from '../lib/supabase';
// Import useAlert
import { useAlert } from '../lib/useAlert'; 

const routes = [
  { path: '/login', component: AuthView },
  { path: '/', component: ChatView, meta: { requiresAuth: true } },
  { path: '/c/:id', component: ChatView, meta: { requiresAuth: true } },
  { 
    path: '/admin', 
    component: AdminView, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  const user = session?.user;

  // 1. Cek Auth Dasar
  if (to.meta.requiresAuth && !session) {
    next('/login');
    return;
  }

  // 2. Cek Admin Khusus (Logic diperbaiki disini)
  if (to.meta.requiresAdmin) {
    if (user?.email !== 'dinsdev.10@gmail.com') {
      
      // Parameter: (Judul, Pesan, Tipe)
      useAlert(
        'AKSES DITOLAK ⛔', 
        'Hayo ngapainnn... Halaman ini adalah area terlarang! Identitas anda telah dicatat.', 
        'error' // <-- Ini yang bikin jadi warna merah/danger
      );
      
      next('/'); // Tendang balik ke home
      return;
    }
  }

  // 3. Redirect Login jika sudah login
  if (to.path === '/login' && session) {
    next('/');
    return;
  }

  next();
});

export default router;