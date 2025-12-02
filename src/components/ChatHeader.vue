<script setup>
defineProps({
  title: String,
  icon: String, // <--- Prop Baru: Bisa berupa teks emoji atau SVG path
  isSvg: Boolean, // <--- Prop Baru: Penanda apakah ini SVG atau bukan
  showExportButton: Boolean,
  showExportMenu: Boolean
});

const emit = defineEmits([
  'toggleSidebar', 
  'toggleSettings', 
  'toggleExportMenu', 
  'exportMarkdown', 
  'exportHTML'
]);
</script>

<template>
  <header class="px-4 py-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur flex justify-between items-center z-10">
    <div class="flex items-center gap-3">
      <button 
        @click="$emit('toggleSidebar')"
        class="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      
      <div class="overflow-hidden">
        <h1 class="font-bold text-emerald-400 text-lg leading-tight">SAIAS v2.9.0</h1>
        
        <div v-if="title" class="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
          <span v-if="isSvg" class="text-emerald-500 shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="icon"></svg>
          </span>
          <span v-else-if="icon">{{ icon }}</span>
          
          <p class="truncate max-w-[150px] md:max-w-xs">{{ title }}</p>
        </div>
      </div>
    </div>

    <div class="flex gap-2 relative">
      <div v-if="showExportButton" class="relative">
        <button 
          @click="$emit('toggleExportMenu')"
          class="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition"
          title="Export Chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>

        <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <button @click="$emit('exportMarkdown')" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Markdown (.md)
          </button>
          <button @click="$emit('exportHTML')" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 border-t border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            HTML Cantik
          </button>
        </div>
        <div v-if="showExportMenu" @click="$emit('toggleExportMenu')" class="fixed inset-0 z-40"></div>
      </div>

      <button @click="$emit('toggleSettings')" class="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg border border-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>
    </div>
  </header>
</template>