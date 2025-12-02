<script setup>
import { computed } from 'vue';

// Terima props dari App.vue
const props = defineProps({
  isOpen: Boolean,
  conversations: Array,
  currentId: String,
  user: Object
});

const emit = defineEmits(['toggle', 'selectChat', 'newChat', 'deleteChat', 'logout']);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return 'Hari Ini';
  if (diffDays <= 2) return 'Kemarin';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// 1. Ambil Inisial (Fallback kalau gak ada foto)
const userInitial = computed(() => {
  const name = props.user?.user_metadata?.full_name || props.user?.email || '?';
  return name.charAt(0).toUpperCase();
});

// 2. Ambil Foto Profil dari Google
const avatarUrl = computed(() => {
  return props.user?.user_metadata?.avatar_url;
});

// 3. Ambil Nama User
const displayName = computed(() => {
  return props.user?.user_metadata?.full_name || props.user?.email?.split('@')[0] || 'User';
});
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
    <div class="p-4">
      <button 
        @click="$emit('newChat')"
        class="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-lg shadow-emerald-900/20 group"
      >
        <div class="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
        <span class="font-semibold text-sm">Percakapan Baru</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
      <div v-if="conversations.length === 0" class="text-center text-gray-500 text-xs mt-10">
        Belum ada riwayat chat.
      </div>

      <div 
        v-for="chat in conversations" 
        :key="chat.id"
        class="group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200"
        :class="currentId === chat.id ? 'bg-gray-800 text-white border border-gray-700' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'"
        @click="$emit('selectChat', chat.id)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 opacity-70"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"></path></svg>
        <div class="flex-1 min-w-0 overflow-hidden">
          <p class="truncate text-sm font-medium">{{ chat.title }}</p>
          <p class="text-[10px] opacity-60 mt-0.5">{{ formatDate(chat.created_at) }}</p>
        </div>
        <button 
          @click.stop="$emit('deleteChat', chat.id)"
          class="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition text-gray-500"
          title="Hapus chat ini"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
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