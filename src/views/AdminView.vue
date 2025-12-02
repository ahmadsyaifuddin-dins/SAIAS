<template>
  <div class="p-6 bg-gray-900 min-h-screen text-white">
    <div class="max-w-7xl mx-auto">
      
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold text-blue-400 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Admin Dashboard
        </h1>

        <router-link 
          to="/" 
          class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
          Kembali ke Chat
        </router-link>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 opacity-70">
        <svg class="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-sm text-gray-400">Mengambil data intelijen...</p>
      </div>

      <div v-else class="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-400">
            <thead class="bg-gray-700/50 text-gray-200 uppercase tracking-wider text-xs border-b border-gray-600">
              <tr>
                <th class="px-6 py-4 font-semibold">Email User</th>
                <th class="px-6 py-4 font-semibold">Bergabung</th>
                <th class="px-6 py-4 font-semibold">Terakhir Login</th>
                <th class="px-6 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-700/40 transition-colors">
                <td class="px-6 py-4 font-medium text-white flex items-center gap-3">                        
                  <img 
                    v-if="user.avatar_url" 
                    :src="user.avatar_url" 
                    alt="Avatar"
                    class="w-9 h-9 rounded-full object-cover border border-gray-600 shadow-sm"
                  />

                  <div 
                    v-else 
                    class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-blue-400"
                  >
                    {{ user.email.charAt(0).toUpperCase() }}
                  </div>
              
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-200">{{ user.email }}</span>

                    <span v-if="user.email === 'dinsdev.10@gmail.com'" class="text-[10px] text-blue-400 font-bold tracking-wide">
                      ADMIN / YOU
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">{{ formatDate(user.created_at) }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span :class="['w-2 h-2 rounded-full', isOnlineRecently(user.last_login) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-500']"></span>
                    <span :class="isOnlineRecently(user.last_login) ? 'text-emerald-400' : 'text-gray-500'">
                      {{ formatDate(user.last_login) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <button 
                    @click="viewUserChats(user)"
                    class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    Pantau Chat
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="selectedUser" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" @click.self="selectedUser = null">
        <div class="bg-gray-800 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col border border-gray-700 shadow-2xl overflow-hidden animate-fade-in-up">
          
          <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-700 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div>
                <h3 class="font-bold text-white text-sm">Log Aktivitas</h3>
                <p class="text-xs text-blue-400">{{ selectedUser.email }}</p>
              </div>
            </div>
            <button @click="selectedUser = null" class="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900/30">
            <div v-if="chatLogs.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"></path></svg>
              <p class="italic">Belum ada riwayat chat untuk user ini.</p>
            </div>

            <div v-for="log in chatLogs" :key="log.id" class="flex flex-col gap-1 group">
               <small class="text-[10px] text-gray-600 text-center mb-1 font-mono">{{ formatDate(log.created_at) }}</small>
               
               <div :class="[
                 'p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm relative',
                 log.role === 'user' 
                  ? 'bg-blue-600/20 text-blue-100 self-end rounded-tr-sm border border-blue-500/20' 
                  : 'bg-gray-700/50 text-gray-200 self-start rounded-tl-sm border border-gray-600/30'
               ]">
                 <span :class="['absolute -top-3 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', 
                    log.role === 'user' ? 'right-0 text-blue-400 bg-gray-900' : 'left-0 text-gray-400 bg-gray-900']">
                    {{ log.role }}
                 </span>
                 
                 {{ log.content }}
               </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const users = ref([])
const loading = ref(true)
const selectedUser = ref(null)
const chatLogs = ref([])

// Format tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

// Cek online (24 jam terakhir)
const isOnlineRecently = (dateString) => {
  if (!dateString) return false
  const diff = new Date() - new Date(dateString)
  return diff < 86400000 
}

// 1. Fetch Users
const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('last_login', { ascending: false })
    
    if (error) throw error
    users.value = data
  } catch (error) {
    console.error('Gagal ambil data user:', error.message)
    alert('Akses Admin Ditolak.')
  } finally {
    loading.value = false
  }
}

// 2. Fetch Chat Logs (Menggunakan tabel 'messages' dan kolom 'content')
const viewUserChats = async (user) => {
  selectedUser.value = user
  chatLogs.value = [] 
  
  const { data, error } = await supabase
    .from('messages') // SUDAH DIPERBAIKI: Menggunakan tabel 'messages'
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!error) chatLogs.value = data
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Sedikit animasi agar modal muncul halus */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
</style>