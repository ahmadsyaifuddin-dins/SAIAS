<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase, signOut } from '../lib/supabase';
import { useAlert, useConfirm } from '../lib/useAlert';
import { useChatExport } from '../composables/useChatExport'; // Import Composable

// Import UI Components
import ChatHeader from '../components/ChatHeader.vue';
import ChatWelcome from '../components/ChatWelcome.vue';
import ChatBubble from '../components/ChatBubble.vue';
import ChatInput from '../components/ChatInput.vue';
import SettingsModal from '../components/SettingsModal.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import Sidebar from '../components/Sidebar.vue';
import CustomAlert from '../components/CustomAlert.vue';

const route = useRoute();
const router = useRouter();

// State Dasar
const session = ref(null);
const user = ref(null);
const isAuthChecking = ref(true);
const isLoading = ref(false);
const showSettings = ref(false);
const isSidebarOpen = ref(false);

// State Chat
const conversations = ref([]);
const currentConversationId = ref(null);
const chatHistory = ref([]);
const chatContainer = ref(null);

// Gunakan Composable Export
const { showExportMenu, exportToMarkdown, exportToHTML } = useChatExport();

const currentChatTitle = computed(() => {
  return conversations.value.find(c => c.id === currentConversationId.value)?.title || '';
});

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};

// --- LOGIC DATA (Conversations & Messages) ---

const loadConversations = async () => {
  if (!user.value) return;
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false });
  if (!error) conversations.value = data || [];
};

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

// --- HANDLERS (Actions) ---

const selectChat = (id) => router.push(`/c/${id}`);
const handleNewChat = () => router.push('/');

const handleDeleteChat = async (id) => {
  const isConfirmed = await useConfirm("Hapus Percakapan?", "Riwayat ini akan dihapus.", "warning");
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

const handleLogout = async () => {
  const isConfirmed = await useConfirm("Konfirmasi Keluar", "Yakin ingin logout?", "warning");
  if (isConfirmed) {
    await signOut();
    router.push('/login');
  }
};

const handleExportMarkdown = () => exportToMarkdown(chatHistory.value, currentChatTitle.value);
const handleExportHTML = () => exportToHTML(chatHistory.value, currentChatTitle.value);

// --- MAIN CHAT LOGIC (Send & Stream) ---
const handleNewMessage = async (userMsg) => {
  if (!user.value) return;

  // 1. Buat Chat Baru jika belum ada ID
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

  // 2. Simpan Pesan User
  const { error: errUser } = await supabase.from('messages').insert({
    user_id: user.value.id,
    conversation_id: currentConversationId.value,
    role: 'user',
    content: userMsg
  });
  if (errUser) return;

  chatHistory.value.push({ role: 'user', content: userMsg });
  scrollToBottom();
  isLoading.value = true;

  try {
    const recentHistory = chatHistory.value.slice(-10);
    const cleanHistory = recentHistory.map(msg => ({ role: msg.role, content: msg.content }));
    const userApiKey = localStorage.getItem('user_groq_key'); 
    const userModel = localStorage.getItem('user_groq_model');

    // 3. Fetch Stream API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, history: cleanHistory, apiKey: userApiKey, model: userModel }),
    });

    if (!response.ok) throw new Error('Network error');

    const aiMessageIndex = chatHistory.value.push({ role: 'assistant', content: '' }) - 1;
    let fullAiResponse = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkText = decoder.decode(value, { stream: true });
      fullAiResponse += chunkText;
      chatHistory.value[aiMessageIndex].content = fullAiResponse;
      scrollToBottom();
    }

    // 4. Simpan Pesan AI
    await supabase.from('messages').insert({
      user_id: user.value.id,
      conversation_id: currentConversationId.value,
      role: 'assistant',
      content: fullAiResponse
    });
    
    await supabase.from('conversations').update({ updated_at: new Date() }).eq('id', currentConversationId.value);
    loadConversations();
  } catch (e) {
    console.error(e);
    chatHistory.value.push({ role: 'assistant', content: 'Gagal terhubung ke AI.' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

// --- LIFECYCLE ---
onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    user.value = data.session?.user;
    if (user.value) {
      loadConversations();
      if (route.params.id) loadMessages(route.params.id);
    } else {
      router.push('/login');
    }
    isAuthChecking.value = false;
  });
});

watch(() => route.params.id, (newId) => {
  if (newId) loadMessages(newId);
  else {
    currentConversationId.value = null;
    chatHistory.value = [];
  }
});
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
      
      <ChatHeader 
        :title="currentChatTitle"
        :showExportButton="chatHistory.length > 0"
        :showExportMenu="showExportMenu"
        @toggleSidebar="isSidebarOpen = !isSidebarOpen"
        @toggleSettings="showSettings = true"
        @toggleExportMenu="showExportMenu = !showExportMenu"
        @exportMarkdown="handleExportMarkdown"
        @exportHTML="handleExportHTML"
      />

      <main ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        
        <ChatWelcome 
          v-if="chatHistory.length === 0"
          @suggestionClick="handleNewMessage"
        />

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