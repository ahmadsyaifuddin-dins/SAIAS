<script setup>
import { ref, onMounted } from 'vue';
import { useAlert, useConfirm } from '../lib/useAlert';

const emit = defineEmits(['close', 'clearHistory']);
const apiKey = ref('');
const selectedModel = ref(''); // Nanti diisi otomatis
const isSaved = ref(false);
const isLoadingModels = ref(false);

// Daftar Model Cadangan (Kalau API Error)
const fallbackModels = [
  { id: 'llama-3.3-70b-versatile', id: 'llama-3.3-70b-versatile' },
  { id: 'llama-3.1-8b-instant', id: 'llama-3.1-8b-instant' },
];

const models = ref([]); // List Model Dinamis

// Fungsi Fetch Model dari Backend
const fetchModels = async () => {
  isLoadingModels.value = true;
  try {
    // Cek apakah user punya key sendiri di localstorage
    const storedKey = localStorage.getItem('user_groq_key');
    
    // Siapkan Header (Kalau ada key user, kirim. Kalau gak, backend pakai default)
    const headers = {};
    if (storedKey) {
      headers['Authorization'] = `Bearer ${storedKey}`;
    }

    const res = await fetch('/api/models', { headers });
    const json = await res.json();

    if (json.data && Array.isArray(json.data)) {
      // Sukses! Pakai data dari Groq
      models.value = json.data.map(m => ({
        id: m.id,
        name: m.id // Groq cuma kasih ID, kita pakai ID sebagai nama juga
      }));
    } else {
      throw new Error("Format data salah");
    }
  } catch (err) {
    console.error("Gagal ambil model, pakai fallback:", err);
    models.value = fallbackModels; // Pakai cadangan kalau gagal
  } finally {
    isLoadingModels.value = false;
  }
};

onMounted(async () => {
  // 1. Load Key User
  const storedKey = localStorage.getItem('user_groq_key');
  if (storedKey) apiKey.value = storedKey;

  // 2. Ambil Daftar Model Terbaru
  await fetchModels();

  // 3. Set Model Terpilih
  const storedModel = localStorage.getItem('user_groq_model');
  // Cek apakah model yang disimpan masih ada di daftar baru?
  const isModelExist = models.value.find(m => m.id === storedModel);
  
  if (storedModel && isModelExist) {
    selectedModel.value = storedModel;
  } else {
    // Kalau tidak ada/belum set, pilih yang pertama (biasanya Llama 3.3)
    selectedModel.value = models.value[0]?.id || 'llama-3.3-70b-versatile';
  }
});

const saveSettings = () => {
  localStorage.setItem('user_groq_model', selectedModel.value);

  if (apiKey.value.trim()) {
    localStorage.setItem('user_groq_key', apiKey.value.trim());
  } else {
    localStorage.removeItem('user_groq_key');
  }

  isSaved.value = true;
  useAlert("Pengaturan Disimpan", "Model AI dan API Key berhasil diperbarui.", "success");
  setTimeout(() => (isSaved.value = false), 2000);
  
  // Refresh list model lagi (siapa tahu user baru input key, jadi punya akses ke model lebih banyak)
  fetchModels();
};

const handleClear = async () => {
  const ok = await useConfirm(
    "Hapus Semua?", 
    "Yakin ingin menghapus SELURUH riwayat percakapan? Tindakan ini tidak bisa dibatalkan.", 
    "error"
  );
  if (ok) emit('clearHistory');
};
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
    <div class="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl overflow-hidden transform scale-100">
      
      <div class="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900/50">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Pengaturan
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-1 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
            <span>Pilih Model Otak AI</span>
            <span v-if="isLoadingModels" class="text-emerald-400 animate-pulse text-xs">Mengupdate daftar...</span>
          </label>
          
          <div class="relative">
            <select 
              v-model="selectedModel"
              :disabled="isLoadingModels"
              class="w-full appearance-none bg-gray-900 border border-gray-600 rounded-lg pl-3 pr-10 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer disabled:opacity-50"
            >
              <option v-for="model in models" :key="model.id" :value="model.id">
                {{ model.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">Daftar ini diambil langsung dari server Groq secara real-time.</p>
        </div>

        <hr class="border-gray-700">

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">API Key Groq (Personal)</label>
          <div class="relative mb-2">
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
            @click="saveSettings"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-900/20"
          >
            {{ isSaved ? '✓ Tersimpan' : 'Simpan Perubahan' }}
          </button>
        </div>

        <hr class="border-gray-700">

        <div>
          <button 
            @click="handleClear"
            class="w-full flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl transition text-sm group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:text-red-300"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Hapus Semua Riwayat Chat
          </button>
        </div>

      </div>
    </div>
  </div>
</template>