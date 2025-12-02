<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase, signOut } from '../lib/supabase';
import { useAlert, useConfirm } from '../lib/useAlert';
import { useChatExport } from '../composables/useChatExport';

import ChatHeader from '../components/ChatHeader.vue';
import ChatWelcome from '../components/ChatWelcome.vue';
import ChatBubble from '../components/ChatBubble.vue';
import ChatInput from '../components/ChatInput.vue';
import SettingsModal from '../components/SettingsModal.vue';
import ProjectModal from '../components/ProjectModal.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import Sidebar from '../components/Sidebar.vue';
import CustomAlert from '../components/CustomAlert.vue';
import { projectIcons } from '../lib/projectIcons';

const route = useRoute();
const router = useRouter();

// State
const session = ref(null);
const user = ref(null);
const isAuthChecking = ref(true);
const isLoading = ref(false);
const showSettings = ref(false);
const showProjectModal = ref(false);
const editingProject = ref(null);
const isSidebarOpen = ref(false);

const conversations = ref([]);
const currentConversationId = ref(null);
const chatHistory = ref([]);
const chatContainer = ref(null);

// State Projects
const projects = ref([]);
const activeProjectId = ref(null); // Null = Semua Chat

const { showExportMenu, exportToMarkdown, exportToHTML } = useChatExport();

const currentChatTitle = computed(() => {
  return conversations.value.find(c => c.id === currentConversationId.value)?.title || '';
});

// Data Header (Return object: title, icon, isSvg)
const headerData = computed(() => {
  // A. Jika sedang membuka Project (Project Aktif)
  if (activeProjectId.value) {
    const proj = projects.value.find(p => p.id === activeProjectId.value);
    if (proj) {
      const iconData = projectIcons[proj.icon]; // Cek di library
      return {
        title: proj.name, // Nama Project
        icon: iconData ? iconData.path : proj.icon, // Path SVG atau Emoji
        isSvg: !!iconData // True jika SVG
      };
    }
  }
  
  // B. Jika sedang membuka Chat Biasa (History)
  if (currentChatTitle.value) {
    return {
      title: currentChatTitle.value, // Nama Chat
      icon: null,
      isSvg: false
    };
  }

  // C. Default (Halaman Awal)
  return {
    title: '', // Kosongkan biar rapi
    icon: null,
    isSvg: false
  };
});

// Judul di Header (Tampilkan nama project kalau lagi aktif)
const headerTitle = computed(() => {
  if (activeProjectId.value) {
    const proj = projects.value.find(p => p.id === activeProjectId.value);
    return proj ? `${projectIcons[proj.icon].path} ${proj.name}` : 'SAIAS v2';
  }
  return currentChatTitle.value || 'SAIAS v2';
});

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};

// --- LOGIC PROJECTS ---
const loadProjects = async () => {
  if (!user.value) return;
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  projects.value = data || [];
};

const handleCreateProject = async (projData) => {
  const { error } = await supabase.from('projects').insert({
    user_id: user.value.id,
    ...projData
  });
  if (!error) {
    useAlert("Sukses", "Project berhasil dibuat!", "success");
    showProjectModal.value = false;
    loadProjects();
  } else {
    useAlert("Gagal", "Tidak bisa membuat project.", "error");
  }
};

const handleSelectProject = (projectId) => {
  activeProjectId.value = projectId;
  // Reset chat view ke layar awal
  currentConversationId.value = null;
  chatHistory.value = [];
  router.push('/'); 
  // Reload list chat sesuai project
  loadConversations();
};

const handleDeleteProject = async (id) => {
  const ok = await useConfirm("Hapus Project?", "Semua chat di dalamnya akan ikut terhapus!", "error");
  if (ok) {
    await supabase.from('projects').delete().eq('id', id);
    if (activeProjectId.value === id) activeProjectId.value = null;
    loadProjects();
    loadConversations();
  }
};

// --- LOGIC BUKA MODAL ---

// 1. Buka Modal Buat Baru
const openCreateModal = () => {
  editingProject.value = null; // Kosongkan data edit
  showProjectModal.value = true;
};

// 2. Buka Modal Edit
const openEditModal = (proj) => {
  editingProject.value = proj; // Isi data lama
  showProjectModal.value = true;
};

// 3. Handle Submit (Bisa Create atau Update)
const handleSaveProject = async (formData) => {
  if (editingProject.value) {
    // --- MODE UPDATE ---
    const { error } = await supabase
      .from('projects')
      .update(formData)
      .eq('id', editingProject.value.id);

    if (!error) {
      useAlert("Sukses", "Project berhasil diperbarui!", "success");
      showProjectModal.value = false;
      loadProjects(); // Refresh list project di sidebar
      // Jika project yg diedit adalah yg sedang aktif, reload namanya di header
      if (activeProjectId.value === editingProject.value.id) {
        // Otomatis terupdate karena kita reload loadProjects()
      }
    } else {
      useAlert("Gagal", "Gagal mengupdate project.", "error");
    }
  } else {
    // --- MODE CREATE ---
    const { error } = await supabase
      .from('projects')
      .insert({
        user_id: user.value.id,
        ...formData
      });

    if (!error) {
      useAlert("Sukses", "Project berhasil dibuat!", "success");
      showProjectModal.value = false;
      loadProjects();
    } else {
      useAlert("Gagal", "Tidak bisa membuat project.", "error");
    }
  }
};

// --- LOGIC CHAT ---

// Load Chat (Updated with Project Filter)
const loadConversations = async () => {
  if (!user.value) return;
  
  let query = supabase
    .from('conversations')
    .select('*')
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  // Filter by Project
  if (activeProjectId.value) {
    query = query.eq('project_id', activeProjectId.value);
  } else {
    // Opsional: Kalau di "Semua Chat" mau sembunyikan chat project, pakai .is('project_id', null)
    // Tapi biasanya "Semua Chat" menampilkan semuanya.
  }

  const { data } = await query;
  conversations.value = data || [];
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

// --- ACTIONS ---

const selectChat = (id) => router.push(`/c/${id}`);
const handleNewChat = () => {
  currentConversationId.value = null;
  chatHistory.value = [];
  router.push('/');
};

const handleDeleteChat = async (id) => {
  const isConfirmed = await useConfirm("Hapus Percakapan?", "Riwayat ini akan dihapus.", "warning");
  if (!isConfirmed) return;
  const { error } = await supabase.from('conversations').update({ is_deleted: true }).eq('id', id);
  if (!error) {
    useAlert("Berhasil", "Percakapan dihapus.", "success");
    loadConversations();
    if (currentConversationId.value === id) handleNewChat();
  }
};

const handlePinChat = async (chat) => {
  chat.is_pinned = !chat.is_pinned;
  await supabase.from('conversations').update({ is_pinned: chat.is_pinned }).eq('id', chat.id);
  loadConversations();
};

const handleRenameChat = async (id, newTitle) => {
  await supabase.from('conversations').update({ title: newTitle }).eq('id', id);
  loadConversations();
};

const handleLogout = async () => {
  const isConfirmed = await useConfirm("Konfirmasi Keluar", "Yakin ingin logout?", "warning");
  if (isConfirmed) { await signOut(); router.push('/login'); }
};

const handleExportMarkdown = () => exportToMarkdown(chatHistory.value, currentChatTitle.value);
const handleExportHTML = () => exportToHTML(chatHistory.value, currentChatTitle.value);

// --- KIRIM PESAN ---
const handleNewMessage = async (userMsg) => {
  if (!user.value) return;

  // 1. CHAT BARU
  if (!currentConversationId.value) {
    const title = userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg;
    
    // Insert dengan Project ID (Kalau ada)
    const { data: newChat, error } = await supabase
      .from('conversations')
      .insert({ 
        user_id: user.value.id, 
        title: title,
        project_id: activeProjectId.value // <--- PENTING
      })
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

    // CEK CUSTOM INSTRUCTION PROJECT
    let systemInstruction = null;
    if (activeProjectId.value) {
      const proj = projects.value.find(p => p.id === activeProjectId.value);
      if (proj && proj.custom_instruction) {
        systemInstruction = proj.custom_instruction;
      }
    }

    // Kalau ada custom instruction, kita selipkan ke body request (Opsional, perlu update backend api/chat.js kalau mau support ini)
    // Untuk sekarang kita biarkan AI default dulu, tapi struktur sudah siap.

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
      fullAiResponse += decoder.decode(value, { stream: true });
      chatHistory.value[aiMessageIndex].content = fullAiResponse;
      scrollToBottom();
    }

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
      loadProjects(); // <--- Load Project
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
      :projects="projects"
      :activeProjectId="activeProjectId"
      @toggle="isSidebarOpen = !isSidebarOpen"
      @newChat="handleNewChat"
      @selectChat="selectChat" 
      @deleteChat="handleDeleteChat"
      @logout="handleLogout"
      @pinChat="handlePinChat"
      @renameChat="handleRenameChat"
      @createProject="openCreateModal"      
      @editProject="openEditModal"          
      @selectProject="handleSelectProject"
      @deleteProject="handleDeleteProject"
    />

    <div class="flex-1 flex flex-col h-full relative w-full">
      
      <ChatHeader 
        :title="headerData.title"
        :icon="headerData.icon"
        :isSvg="headerData.isSvg"
        :showExportButton="chatHistory.length > 0"
        :showExportMenu="showExportMenu"
        @toggleSidebar="isSidebarOpen = !isSidebarOpen"
        @toggleSettings="showSettings = true"
        @toggleExportMenu="showExportMenu = !showExportMenu"
        @exportMarkdown="handleExportMarkdown"
        @exportHTML="handleExportHTML"
      />

      <main ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        <ChatWelcome v-if="chatHistory.length === 0" @suggestionClick="handleNewMessage" />
        <ChatBubble v-for="(msg, index) in chatHistory" :key="index" :message="msg" />
        <div v-if="isLoading" class="flex justify-start animate-pulse">
           <div class="bg-gray-800 px-4 py-2 rounded-2xl text-xs text-emerald-400 font-mono flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span> Mengetik...
          </div>
        </div>
      </main>

      <footer class="p-4 bg-gray-900 border-t border-gray-800">
        <ChatInput :isLoading="isLoading" @submit="handleNewMessage" />
      </footer>

      <SettingsModal v-if="showSettings" @close="showSettings = false" @clearHistory="() => {}" />
      <ProjectModal 
        :isOpen="showProjectModal" 
        :projectToEdit="editingProject"       
        @close="showProjectModal = false" 
        @submit="handleSaveProject"           
      />
      
    </div>
  </div>
</template>