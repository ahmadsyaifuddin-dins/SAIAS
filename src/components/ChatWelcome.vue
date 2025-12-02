<script setup>
const suggestionPrompts = [
  "Siapa penciptamu?", "Bagaimana kamu dibuat?", "Teknologi apa yang kamu gunakan?",
  "Jelaskan apa itu Laravel", "Tips coding agar rapi"
];

const emit = defineEmits(['suggestionClick']);
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center p-4 overflow-y-auto">
    
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
        @click="$emit('suggestionClick', text)"
        class="px-3 py-2.5 md:px-4 md:py-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 hover:border-emerald-500/50 rounded-lg md:rounded-xl text-xs md:text-sm text-gray-300 hover:text-white text-left transition-all duration-200 group flex justify-between items-center active:scale-[0.98]"
      >
        <span class="truncate pr-2">{{ text }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity transform translate-x-[-5px] group-hover:translate-x-0"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>
    </div>
  </div>
</template>