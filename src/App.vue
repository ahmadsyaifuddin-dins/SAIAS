<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { supabase, signOut } from './lib/supabase'; 
import AuthView from './views/AuthView.vue';
import ChatBubble from './components/ChatBubble.vue';
import ChatInput from './components/ChatInput.vue';
import SettingsModal from './components/SettingsModal.vue';
import SkeletonLoader from './components/SkeletonLoader.vue';

const session = ref(null);
const user = ref(null);
const chatHistory = ref([]);
const isLoading = ref(false);
const showSettings = ref(false);

const isAuthChecking = ref(true);

const chatContainer = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const loadMessages = async () => {
  if (!user.value) return;
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (!error) {
    chatHistory.value = data || [];
    scrollToBottom();
  }
};

onMounted(() => {
  // Cek sesi saat ini
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    user.value = data.session?.user;
    if (user.value) loadMessages();
    
    // PENTING: Matikan loading setelah pengecekan selesai
    isAuthChecking.value = false;
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session;
    user.value = _session?.user;
    if (user.value) loadMessages();
  });
});

const handleLogout = async () => {
  await signOut();
  chatHistory.value = [];
};

const clearAllHistory = async () => {
  if (!user.value) return;
  const { error } = await supabase.from('messages').delete().eq('user_id', user.value.id);
  if (!error) {
    chatHistory.value = [];
    showSettings.value = false;
  }
};

const handleNewMessage = async (userMsg) => {
  // ... Logic Kirim Pesan (Sama seperti sebelumnya) ...
  if (!user.value) return;

  const { error: errUser } = await supabase.from('messages').insert({
    user_id: user.value.id,
    role: 'user',
    content: userMsg
  });
  
  if (errUser) { alert("Gagal menyimpan pesan!"); return; }

  chatHistory.value.push({ role: 'user', content: userMsg });
  scrollToBottom();
  isLoading.value = true;

  try {
    const recentHistory = chatHistory.value.slice(-10);
    // Sanitizing Data (PENTING: Hapus created_at sebelum kirim ke Groq)
    const cleanHistory = recentHistory.map(msg => ({ role: msg.role, content: msg.content }));
    const userApiKey = localStorage.getItem('user_groq_key'); 

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, history: cleanHistory, apiKey: userApiKey }),
    });

    const data = await response.json();
    const aiReply = data.reply || 'Maaf, error server.';

    const { error: errAI } = await supabase.from('messages').insert({
      user_id: user.value.id,
      role: 'assistant',
      content: aiReply
    });

    if (!errAI) {
      chatHistory.value.push({ role: 'assistant', content: aiReply });
      scrollToBottom();
    }
  } catch (error) {
    console.error(error);
    chatHistory.value.push({ role: 'assistant', content: 'Gagal koneksi.' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<template>
  <SkeletonLoader v-if="isAuthChecking" />

  <AuthView v-else-if="!session" />

  <div v-else class="flex flex-col h-screen bg-gray-900 text-gray-100">
    
    <header class="px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10 flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
          S
        </div>
        <div>
          <h1 class="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent leading-none">
            SAIAS v2
          </h1>
          <p class="text-[10px] text-gray-500 font-medium tracking-wide">
            {{ user?.user_metadata?.full_name || 'User' }}
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <button 
          @click="showSettings = true"
          class="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition duration-200 group"
          title="Pengaturan"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-90 transition-transform duration-500">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        
        <button 
          @click="handleLogout"
          class="flex items-center gap-2 text-xs font-medium bg-gray-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 px-3 py-1.5 rounded-lg border border-gray-700 transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span class="hidden md:inline">Keluar</span>
        </button>
      </div>
    </header>

    <main ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar scroll-smooth">
      <div v-if="chatHistory.length === 0" class="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
        <div class="bg-gray-800 p-4 rounded-full mb-4">
          <img src="/vite.svg" alt="Logo" class="w-10 h-10 opacity-50 grayscale">
        </div>
        <p class="font-medium">Mulai percakapan baru...</p>
      </div>

      <ChatBubble v-for="(msg, index) in chatHistory" :key="index" :message="msg" />

      <div v-if="isLoading" class="flex justify-start animate-pulse">
        <div class="bg-gray-800 px-4 py-2 rounded-2xl text-xs text-emerald-400 font-mono flex items-center gap-2">
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
          SAIAS mengetik...
        </div>
      </div>
    </main>

    <footer class="p-4 bg-gray-900 border-t border-gray-800">
      <ChatInput :isLoading="isLoading" @submit="handleNewMessage" />
    </footer>

    <SettingsModal 
      v-if="showSettings" 
      @close="showSettings = false"
      @clearHistory="clearAllHistory"
    />
  </div>
</template>

<style>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #4B5563; }
</style>