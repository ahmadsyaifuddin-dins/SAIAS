<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase, signOut } from '../lib/supabase';
import { useAlert, useConfirm } from '../lib/useAlert'; // Import Alert Logic

import ChatBubble from '../components/ChatBubble.vue';
import ChatInput from '../components/ChatInput.vue';
import SettingsModal from '../components/SettingsModal.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import Sidebar from '../components/Sidebar.vue';
import CustomAlert from '../components/CustomAlert.vue'; // Import Alert UI

const route = useRoute();
const router = useRouter();

// State
const session = ref(null);
const user = ref(null);
const isAuthChecking = ref(true);
const isLoading = ref(false);
const showSettings = ref(false);
const isSidebarOpen = ref(false);

const conversations = ref([]);
const currentConversationId = ref(null);
const chatHistory = ref([]);
const chatContainer = ref(null);

// DAFTAR SARAN CHAT
const suggestionPrompts = [
  "Siapa penciptamu?", "Bagaimana kamu dibuat?", "Teknologi apa yang kamu gunakan?",
  "Jelaskan apa itu Laravel", "Tips coding agar rapi"
];

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};

// LOAD LIST SIDEBAR
const loadConversations = async () => {
  if (!user.value) return;
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false });
  if (!error) conversations.value = data || [];
};

// LOAD PESAN (Berdasarkan ID)
const loadMessages = async (conversationId) => {
  if (!user.value) return;
  isLoading.value = true;
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (!error) {
    chatHistory.value = data || [];
    currentConversationId.value = conversationId;
    isSidebarOpen.value = false;
    scrollToBottom();
  }
  isLoading.value = false;
};

// HANDLER: KLIK CHAT DI SIDEBAR -> GANTI URL
const selectChat = (id) => {
  router.push(`/c/${id}`); 
};

// HANDLER: NEW CHAT -> GANTI URL KE HOME
const handleNewChat = () => {
  router.push('/');
};

// HANDLER: DELETE CHAT
const handleDeleteChat = async (id) => {
  const isConfirmed = await useConfirm("Hapus Percakapan?", "Riwayat ini akan dihapus dari tampilan.", "warning");
  if (!isConfirmed) return;

  const { error } = await supabase.from('conversations').update({ is_deleted: true }).eq('id', id);
  if (!error) {
    useAlert("Berhasil", "Percakapan dihapus.", "success");
    await loadConversations();
    if (currentConversationId.value === id) router.push('/'); 
  } else {
    useAlert("Gagal", "Terjadi kesalahan.", "error");
  }
};

// LOGOUT
const handleLogout = async () => {
  const isConfirmed = await useConfirm("Konfirmasi Keluar", "Yakin ingin logout?", "warning");
  if (isConfirmed) {
    await signOut();
    router.push('/login');
  }
};

// SETUP & WATCHER
onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    user.value = data.session?.user;
    
    if (user.value) {
      loadConversations();
      if (route.params.id) {
        loadMessages(route.params.id);
      }
    } else {
      router.push('/login'); 
    }
    isAuthChecking.value = false;
  });
});

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadMessages(newId);
  } else {
    currentConversationId.value = null;
    chatHistory.value = [];
  }
});

// KIRIM PESAN
const handleNewMessage = async (userMsg) => {
  if (!user.value) return;

  // 1. LOGIC NEW CHAT (Sama seperti sebelumnya)
  if (!currentConversationId.value) {
    const title = userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg;
    const { data: newChat, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.value.id, title: title })
      .select().single();
      
    if (error) return;
    router.replace(`/c/${newChat.id}`);
    currentConversationId.value = newChat.id;
    await loadConversations();
  }

  // 2. SIMPAN PESAN USER KE DB
  const { error: errUser } = await supabase.from('messages').insert({
    user_id: user.value.id,
    conversation_id: currentConversationId.value,
    role: 'user',
    content: userMsg
  });
  if (errUser) return;

  // Update UI User
  chatHistory.value.push({ role: 'user', content: userMsg });
  scrollToBottom();
  isLoading.value = true;

  try {
    const recentHistory = chatHistory.value.slice(-10);
    const cleanHistory = recentHistory.map(msg => ({ role: msg.role, content: msg.content }));
    const userApiKey = localStorage.getItem('user_groq_key'); 
    const userModel = localStorage.getItem('user_groq_model');

    // 3. FETCH DENGAN STREAM READER
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, history: cleanHistory, apiKey: userApiKey, model: userModel }),
    });

    if (!response.ok) throw new Error('Network error');

    // SIAPKAN BUBBLE KOSONG UNTUK AI
    // Kita push dulu bubble kosong, nanti isinya kita update pelan-pelan
    const aiMessageIndex = chatHistory.value.push({ role: 'assistant', content: '' }) - 1;
    let fullAiResponse = ''; // Penampung teks lengkap

    // BACA STREAM
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode chunk (binary) ke text
      const chunkText = decoder.decode(value, { stream: true });
      
      // Update variabel penampung
      fullAiResponse += chunkText;
      
      // Update UI secara Real-time (Efek Mengetik)
      chatHistory.value[aiMessageIndex].content = fullAiResponse;
      
      // Scroll dikit-dikit biar ngikutin teks
      scrollToBottom();
    }

    // 4. STREAM SELESAI -> BARU SIMPAN KE DB
    await supabase.from('messages').insert({
      user_id: user.value.id,
      conversation_id: currentConversationId.value,
      role: 'assistant',
      content: fullAiResponse // Simpan teks utuh
    });
    
    // Update timestamp conversation
    await supabase.from('conversations').update({ updated_at: new Date() }).eq('id', currentConversationId.value);
    loadConversations();

  } catch (e) {
    console.error(e);
    chatHistory.value.push({ role: 'assistant', content: 'Maaf, terjadi kesalahan koneksi.' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<template>
  <CustomAlert />

  <SkeletonLoader v-if="isAuthChecking" />

  <div v-else class="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
    
    <Sidebar 
      :isOpen="isSidebarOpen"
      :conversations="conversations"
      :currentId="currentConversationId?.toString()"
      :user="user"
      @toggle="isSidebarOpen = !isSidebarOpen"
      @newChat="handleNewChat"
      @selectChat="selectChat" 
      @deleteChat="handleDeleteChat"
      @logout="handleLogout"
    />

    <div class="flex-1 flex flex-col h-full relative w-full">
      
      <header class="px-4 py-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur flex justify-between items-center z-10">
        <div class="flex items-center gap-3">
          <button 
            @click="isSidebarOpen = !isSidebarOpen"
            class="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div>
            <h1 class="font-bold text-emerald-400 text-lg leading-tight">SAIAS v2.2.0</h1>
            <p v-if="currentConversationId" class="text-[10px] text-gray-500 truncate max-w-[150px] md:max-w-xs">
              {{ conversations.find(c => c.id === currentConversationId)?.title || 'Percakapan' }}
            </p>
          </div>
        </div>
        <div>
          <button @click="showSettings = true" class="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
        </div>
      </header>

      <main ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        <div v-if="chatHistory.length === 0" class="h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
          
          <div class="flex flex-col items-center mb-6 md:mb-10 opacity-80 md:opacity-60 transition-all">
            
            <div class="bg-gray-800 p-3 md:p-4 rounded-2xl md:rounded-3xl mb-3 md:mb-4 animate-bounce shadow-xl shadow-emerald-200/10">
              <img src="/saias-new.png" alt="Logo" class="w-12 h-12 md:w-16 md:h-16 object-contain rounded-full">
            </div>
            
            <p class="font-bold text-lg md:text-xl text-white">Mulai Topik Baru</p>
            <p class="text-xs md:text-sm text-gray-400 mt-1">Pilih topik instan atau ketik pesanmu...</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 w-full max-w-2xl">
            <button 
              v-for="(text, index) in suggestionPrompts" 
              :key="index"
              @click="handleNewMessage(text)"
              class="px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 hover:border-emerald-500/50 rounded-lg md:rounded-xl text-xs md:text-sm text-gray-300 hover:text-white text-left transition-all duration-200 group flex justify-between items-center active:scale-[0.98]"
            >
              <span class="truncate pr-2">{{ text }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity transform translate-x-[-5px] group-hover:translate-x-0"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>

        <ChatBubble v-for="(msg, index) in chatHistory" :key="index" :message="msg" />

        <div v-if="isLoading" class="flex justify-start animate-pulse">
           <div class="bg-gray-800 px-4 py-2 rounded-2xl text-xs text-emerald-400 font-mono flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
            Mengetik...
          </div>
        </div>
      </main>

      <footer class="p-4 bg-gray-900 border-t border-gray-800">
        <ChatInput :isLoading="isLoading" @submit="handleNewMessage" />
      </footer>

      <SettingsModal 
        v-if="showSettings" 
        @close="showSettings = false"
        @clearHistory="() => {}"
      />
      
    </div>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #374151; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #4B5563; }
</style>