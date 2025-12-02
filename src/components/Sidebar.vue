<script setup>
import { computed, ref, nextTick } from 'vue';
import { projectIcons } from '../lib/projectIcons';

// Terima props dari Parent (ChatView.vue)
const props = defineProps({
  isOpen: Boolean,
  conversations: Array,
  currentId: String,
  user: Object,
  projects: Array,
  activeProjectId: String
});

const emit = defineEmits([
  'toggle', 
  'selectChat', 
  'newChat', 
  'deleteChat', 
  'logout', 
  'pinChat', 
  'renameChat',
  'createProject',
  'selectProject',
  'deleteProject',
  'editProject',
]);

// --- STATE EDIT JUDUL ---
const editingId = ref(null);
const editTitle = ref('');
const editInputRef = ref(null);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return 'Hari Ini';
  if (diffDays <= 2) return 'Kemarin';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// --- LOGIC USER PROFILE ---
const userInitial = computed(() => {
  const name = props.user?.user_metadata?.full_name || props.user?.email || '?';
  return name.charAt(0).toUpperCase();
});

const avatarUrl = computed(() => {
  return props.user?.user_metadata?.avatar_url;
});

const displayName = computed(() => {
  return props.user?.user_metadata?.full_name || props.user?.email?.split('@')[0] || 'User';
});

// --- LOGIC FUNGSI EDIT & SAVE ---
const startEditing = (chat) => {
  editingId.value = chat.id;
  editTitle.value = chat.title;
  nextTick(() => {
    if (editInputRef.value && editInputRef.value[0]) {
      editInputRef.value[0].focus();
    }
  });
};

const saveTitle = (id) => {
  if (editingId.value === id && editTitle.value.trim()) {
    emit('renameChat', id, editTitle.value.trim());
  }
  cancelEditing();
};

const cancelEditing = () => {
  editingId.value = null;
  editTitle.value = '';
};
</script>

<template>
  <div 
    v-if="isOpen" 
    @click="$emit('toggle')"
    class="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
  ></div>

  <aside 
    class="fixed inset-y-0 left-0 z-30 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static'"
  >
    
    <div class="p-3 border-b border-gray-800 space-y-2 bg-gray-900">
      <button 
        @click="$emit('newChat')"
        class="w-full flex items-center gap-3 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-lg shadow-emerald-900/20 text-sm font-semibold group"
      >
        <div class="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
        Percakapan Baru
      </button>

      <div class="flex justify-between items-center px-1 mt-4 pt-2">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Projects</span>
        <button 
          @click="$emit('createProject')" 
          class="text-gray-400 hover:text-emerald-400 p-1 rounded hover:bg-gray-800 transition" 
          title="Buat Project Baru"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div class="space-y-0.5 max-h-32 overflow-y-auto custom-scrollbar">
        
        <button 
          @click="$emit('selectProject', null)"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          :class="!activeProjectId ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'"
        >
          Semua Chat
        </button>

        <div 
          v-for="proj in projects" 
          :key="proj.id"
          @click="$emit('selectProject', proj.id)"
          class="group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          :class="activeProjectId === proj.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'"
        >
          <div class="flex items-center gap-2 truncate">
            <span v-if="projectIcons[proj.icon]" class="text-emerald-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="projectIcons[proj.icon].path"></svg>
            </span>
            <span v-else>{{ proj.icon }}</span>
            
            <span class="truncate max-w-[140px]">{{ proj.name }}</span>
          </div>
          
          <div class="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            
            <button 
              @click.stop="$emit('editProject', proj)"
              class="text-gray-500 hover:text-blue-400 p-1 rounded hover:bg-gray-700/50 mr-1"
              title="Edit Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
            
            <button 
              @click.stop="$emit('deleteProject', proj.id)"
              class="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-700/50"
              title="Hapus Project"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar px-3 pt-4 space-y-1">
      <div class="px-2 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        Riwayat
      </div>
      
      <div v-if="conversations.length === 0" class="text-center text-gray-600 text-xs mt-8 italic">
        {{ activeProjectId ? 'Folder project ini kosong.' : 'Belum ada riwayat chat.' }}
      </div>

      <div 
        v-for="chat in conversations" 
        :key="chat.id"
        class="group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent"
        :class="[
          currentId === chat.id ? 'bg-gray-800 text-white border-gray-700' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200',
          chat.is_pinned ? 'bg-gray-800/30 border-emerald-900/30' : ''
        ]"
        @click="$emit('selectChat', chat.id)"
      >
        <div class="shrink-0">
          <svg v-if="chat.is_pinned" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 -rotate-45"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-70"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>

        <div v-if="editingId !== chat.id" class="flex-1 min-w-0 overflow-hidden">
          <p class="truncate text-sm font-medium">{{ chat.title }}</p>
          <p class="text-[10px] opacity-60 mt-0.5">{{ formatDate(chat.created_at) }}</p>
        </div>

        <input 
          v-else
          ref="editInputRef"
          v-model="editTitle"
          @click.stop
          @keydown.enter="saveTitle(chat.id)"
          @blur="saveTitle(chat.id)"
          @keydown.esc="cancelEditing"
          class="flex-1 bg-gray-900 border border-emerald-500 rounded px-2 py-1 text-sm text-white focus:outline-none min-w-0"
        />

        <div v-if="editingId !== chat.id" class="flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button @click.stop="$emit('pinChat', chat)" class="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded transition" :title="chat.is_pinned ? 'Unpin' : 'Pin Chat'">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
          </button>
          <button @click.stop="startEditing(chat)" class="p-1.5 hover:bg-blue-500/20 hover:text-blue-400 rounded transition" title="Ganti Nama">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          </button>
          <button @click.stop="$emit('deleteChat', chat.id)" class="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition" title="Hapus">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="user?.email === 'dinsdev.10@gmail.com'" class="px-4 pt-2 pb-2 mt-auto border-t border-gray-800">
      <router-link 
        to="/admin" 
        class="flex items-center gap-3 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded-lg transition border border-red-800/50 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span class="text-xs font-bold tracking-wide uppercase">Admin Panel</span>
      </router-link>
    </div>

    <div class="p-4 border-t border-gray-800 bg-gray-900/95">
      <div class="flex items-center gap-3 p-2 rounded-xl bg-gray-800 border border-gray-700">
        
        <img 
          v-if="avatarUrl" 
          :src="avatarUrl" 
          alt="Avatar"
          class="w-8 h-8 rounded-lg object-cover border border-gray-600 bg-gray-700"
        />
        
        <div 
          v-else
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm"
        >
          {{ userInitial }}
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate leading-none mb-0.5">
            {{ displayName }}
          </p>
          <p class="text-[10px] text-emerald-400 font-medium">Online</p>
        </div>

        <button 
          @click="$emit('logout')"
          class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          title="Keluar / Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>

      </div>
    </div>
  </aside>
</template>