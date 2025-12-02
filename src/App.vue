<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { supabase, signOut } from './lib/supabase'; 
import AuthView from './views/AuthView.vue';
import ChatBubble from './components/ChatBubble.vue';
import ChatInput from './components/ChatInput.vue';
import SettingsModal from './components/SettingsModal.vue';
import SkeletonLoader from './components/SkeletonLoader.vue';
import Sidebar from './components/Sidebar.vue'; 
import CustomAlert from './components/CustomAlert.vue';
import { useAlert, useConfirm } from './lib/useAlert';

// --- STATE USER & UI ---
const session = ref(null);
const user = ref(null);
const isAuthChecking = ref(true);
const isLoading = ref(false);
const showSettings = ref(false);
const isSidebarOpen = ref(false); // Untuk Mobile

// --- STATE CHAT ---
const conversations = ref([]);        // Daftar List Judul Chat
const currentConversationId = ref(null); // ID Chat yang aktif (Null = Mode New Chat)
const chatHistory = ref([]);          // Isi pesan chat aktif

const chatContainer = ref(null);

// Scroll ke bawah otomatis
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// --- LOGIC 1: LOAD DAFTAR PERCAKAPAN (SIDEBAR) ---
const loadConversations = async () => {
  if (!user.value) return;
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('is_deleted', false) // (Filter Soft Delete)
    .order('updated_at', { ascending: false });

  if (!error) conversations.value = data || [];
};

// --- LOGIC 2: LOAD ISI PESAN (SAAT KLIK JUDUL CHAT) ---
const loadMessages = async (conversationId) => {
  if (!user.value) return;
  isLoading.value = true;
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId) // Filter berdasarkan ID Chat
    .order('created_at', { ascending: true });

  if (!error) {
    chatHistory.value = data || [];
    currentConversationId.value = conversationId;
    isSidebarOpen.value = false; // Tutup sidebar di HP setelah pilih
    scrollToBottom();
  }
  isLoading.value = false;
};

// --- LOGIC 3: BUAT CHAT BARU (MODE RESET) ---
const handleNewChat = () => {
  currentConversationId.value = null; // Null artinya belum disimpan ke DB
  chatHistory.value = [];             // Layar bersih
  isSidebarOpen.value = false;        // Tutup sidebar
};

// --- LOGIC 4: HAPUS CHAT ---
const handleDeleteChat = async (id) => {

  const isConfirmed = await useConfirm(
    "Hapus Percakapan?", 
    "Riwayat chat ini akan dihapus dari tampilan Anda. Anda tidak bisa melihatnya lagi.", 
    "warning"
  );

  if (!isConfirmed) return;

  // Kita CUMA UPDATE statusnya jadi true, BUKAN DELETE permanen
  const { error } = await supabase
    .from('conversations')
    .update({ is_deleted: true }) 
    .eq('id', id);

  if (error) {
    console.error("Gagal hapus chat:", error);
    useAlert("Gagal", "Terjadi kesalahan saat menghapus percakapan.", "error");
  } else {
    await loadConversations();
    if (currentConversationId.value === id) {
      handleNewChat();
    }
    // ALERT SUKSES
    useAlert("Berhasil", "Percakapan telah dihapus.", "success");
  }
};

// --- SETUP AWAL ---
onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    user.value = data.session?.user;
    if (user.value) loadConversations(); // Load sidebar saja dulu
    isAuthChecking.value = false;
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session;
    user.value = _session?.user;
    if (user.value) {
      loadConversations();
    } else {
      chatHistory.value = [];
      conversations.value = [];
    }
  });
});

const suggestionPrompts = [
  "Siapa penciptamu?",
  "Bagaimana kamu dibuat?",
  "Teknologi apa yang kamu gunakan?",
  "Jelaskan apa itu Laravel",
  "Tips coding agar rapi"
];

const handleLogout = async () => {
  // 1. Tampilkan Konfirmasi Dulu
  const isConfirmed = await useConfirm(
    "Konfirmasi Keluar",
    "Apakah Anda yakin ingin keluar dari akun SAIAS?",
    "warning" // Pakai warna kuning biar user aware
  );

  // Jika user pilih "Batal", stop proses logout
  if (!isConfirmed) return;

  // 2. Proses Logout
  await signOut();

  // 3. Reset State (Bersihkan data di layar)
  chatHistory.value = [];
  conversations.value = [];
  currentConversationId.value = null;

  // 4. Kasih pesan sukses (Opsional, biar sopan)
  useAlert("Sampai Jumpa!", "Anda berhasil logout.", "success");
};

// --- LOGIC UTAMA: KIRIM PESAN ---
const handleNewMessage = async (userMsg) => {
  if (!user.value) return;

  // A. SKENARIO: CHAT BARU (Belum punya ID)
  if (!currentConversationId.value) {
    // 1. Buat Judul Otomatis (Ambil 30 karakter pertama)
    const title = userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg;
    
    // 2. Simpan ke tabel 'conversations'
    const { data: newChat, error: errChat } = await supabase
      .from('conversations')
      .insert({ user_id: user.value.id, title: title })
      .select()
      .single();

    if (errChat) { console.error(errChat); return; }
    
    // 3. Set ID aktif ke chat yang baru dibuat
    currentConversationId.value = newChat.id;
    // 4. Refresh sidebar biar judulnya muncul
    await loadConversations(); 
  }

  // B. SIMPAN PESAN USER KE DB
  const { error: errUser } = await supabase.from('messages').insert({
    user_id: user.value.id,
    conversation_id: currentConversationId.value, // Wajib ada ID sekarang
    role: 'user',
    content: userMsg
  });
  
  if (errUser) { useAlert("Gagal", "Terjadi kesalahan saat mengirim pesan.", "error"); return; }

  // Update UI
  chatHistory.value.push({ role: 'user', content: userMsg });
  scrollToBottom();
  isLoading.value = true;

  try {
    // C. PERSIAPAN KIRIM KE AI
    // Sanitizing: Ambil role & content saja, buang ID/created_at
    const recentHistory = chatHistory.value.slice(-10);
    const cleanHistory = recentHistory.map(msg => ({ role: msg.role, content: msg.content }));
    const userApiKey = localStorage.getItem('user_groq_key'); 
    const userModel = localStorage.getItem('user_groq_model');
    // D. FETCH BACKEND
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, history: cleanHistory, apiKey: userApiKey, model: userModel }),
    });

    const data = await response.json();
    const aiReply = data.reply || 'Maaf, error server.';

    // E. SIMPAN JAWABAN AI KE DB
    const { error: errAI } = await supabase.from('messages').insert({
      user_id: user.value.id,
      conversation_id: currentConversationId.value,
      role: 'assistant',
      content: aiReply
    });

    if (!errAI) {
      chatHistory.value.push({ role: 'assistant', content: aiReply });
      scrollToBottom();
    }

    // F. UPDATE WAKTU 'UPDATED_AT' DI CONVERSATION (Biar naik ke paling atas di sidebar)
    await supabase
      .from('conversations')
      .update({ updated_at: new Date() })
      .eq('id', currentConversationId.value);
    
    loadConversations(); // Refresh urutan sidebar

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
  <CustomAlert />
  <SkeletonLoader v-if="isAuthChecking" />

  <AuthView v-else-if="!session" />

  <div v-else class="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
    
    <Sidebar 
      :isOpen="isSidebarOpen"
      :conversations="conversations"
      :currentId="currentConversationId?.toString()"
      :user="user"
      @toggle="isSidebarOpen = !isSidebarOpen"
      @newChat="handleNewChat"
      @selectChat="loadMessages"
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
            <h1 class="font-bold text-emerald-400 text-lg leading-tight">SAIAS v2</h1>
            <p v-if="currentConversationId" class="text-[10px] text-gray-500 truncate max-w-[150px] md:max-w-xs">
              {{ conversations.find(c => c.id === currentConversationId)?.title || 'Percakapan' }}
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="showSettings = true" class="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
        </div>
      </header>

      <main ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        <div v-if="chatHistory.length === 0" class="h-full flex flex-col items-center justify-center text-gray-600 p-4">
          
          <div class="flex flex-col items-center mb-8 opacity-60">
            <div class="bg-gray-800 p-4 rounded-full mb-4 animate-bounce">
              <img src="/vite.svg" alt="Logo" class="w-10 h-10 opacity-50 grayscale">
            </div>
            <p class="font-medium text-lg">Mulai Topik Baru</p>
            <p class="text-sm">Pilih topik di bawah atau ketik pesanmu...</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            <button 
              v-for="(text, index) in suggestionPrompts" 
              :key="index"
              @click="handleNewMessage(text)"
              class="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-500/50 rounded-xl text-sm text-gray-300 hover:text-white text-left transition-all duration-200 group flex justify-between items-center"
            >
              <span>{{ text }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity transform translate-x-[-5px] group-hover:translate-x-0"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
        @clearHistory="() => {} /* Hapus function ini nanti kalau mau dibuat clear per chat */"
      />
      
    </div>
  </div>
</template>