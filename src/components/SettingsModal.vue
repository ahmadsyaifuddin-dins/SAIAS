<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['close', 'clearHistory']);
const apiKey = ref('');
const isSaved = ref(false);

onMounted(() => {
  const storedKey = localStorage.getItem('user_groq_key');
  if (storedKey) apiKey.value = storedKey;
});

const saveKey = () => {
  if (apiKey.value.trim()) {
    localStorage.setItem('user_groq_key', apiKey.value.trim());
    isSaved.value = true;
    setTimeout(() => (isSaved.value = false), 2000);
  } else {
    localStorage.removeItem('user_groq_key');
    apiKey.value = '';
    alert('API Key dihapus. Anda sekarang menggunakan kuota default SAIAS.');
  }
};

const handleClear = () => {
  if (confirm('Yakin ingin menghapus semua riwayat percakapan? Ini tidak bisa dibatalkan.')) {
    emit('clearHistory');
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
    <div class="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl overflow-hidden transform scale-100">
      
      <div class="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900/50">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Pengaturan
        </h2>
        
        <button @click="$emit('close')" class="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-1 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">API Key Groq (Personal)</label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
              <input 
                v-model="apiKey"
                type="password" 
                placeholder="gsk_..." 
                class="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
            <button 
              @click="saveKey"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-900/20"
            >
              {{ isSaved ? '✓ Saved' : 'Simpan' }}
            </button>
          </div>
        </div>

        <div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-xs text-gray-400 space-y-2">
          <div class="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <p>
              Dapatkan API Key gratis di 
              <a href="https://console.groq.com/keys" target="_blank" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">console.groq.com</a>. 
              Key Anda hanya disimpan di browser ini (Local Storage).
            </p>
          </div>
        </div>

        <hr class="border-gray-700">

        <div>
          <h3 class="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Zona Bahaya
          </h3>
          <button 
            @click="handleClear"
            class="w-full flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl transition text-sm group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:text-red-300">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Hapus Semua Riwayat Chat
          </button>
        </div>

      </div>
    </div>
  </div>
</template>