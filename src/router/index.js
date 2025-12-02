import { createRouter, createWebHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';
import AuthView from '../views/AuthView.vue';
import AdminView from '../views/AdminView.vue'; // <--- IMPORT INI
import { supabase } from '../lib/supabase';

const routes = [
  { path: '/login', component: AuthView },
  { path: '/', component: ChatView, meta: { requiresAuth: true } },
  { path: '/c/:id', component: ChatView, meta: { requiresAuth: true } },
  // Rute Admin Baru
  { 
    path: '/admin', 
    component: AdminView, 
    meta: { requiresAuth: true, requiresAdmin: true } // Tambah flag requiresAdmin
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

  // 2. Cek Admin Khusus (Logic baru disini)
  if (to.meta.requiresAdmin) {
    // Ganti email ini sesuai email admin kamu yang terdaftar di Supabase
    if (user?.email !== 'dinsdev.10@gmail.com') {
      alert("⚠️ AKSES DITOLAK: Anda bukan Admin!");
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