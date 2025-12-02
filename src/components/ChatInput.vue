<script setup>
import { ref, nextTick, computed } from 'vue';

const emit = defineEmits(['submit']);
const props = defineProps({
  isLoading: Boolean
});

const text = ref('');
const textareaRef = ref(null);

// Placeholder responsif (Simpel di HP, Detail di Desktop)
// Kita pakai logika sederhana: Kalau layar kecil, teks pendek.
const placeholderText = computed(() => {
  return window.innerWidth < 768 
    ? 'Ketik pesan...' 
    : 'Ketik pesan... (Shift+Enter untuk baris baru)';
});

const adjustHeight = () => {
  const el = textareaRef.value;
  if (el) {
    el.style.height = 'auto'; 
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'; // Max tinggi biar gak menuhin layar
  }
};

const handleSubmit = () => {
  if (!text.value.trim() || props.isLoading) return;
  emit('submit', text.value);
  text.value = '';
  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto';
  });
};

const handleEnter = (e) => {
  if (!e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-1.5 md:p-2 bg-gray-800 rounded-xl md:rounded-2xl border border-gray-700 shadow-lg flex gap-2 items-end transition-all duration-200 focus-within:ring-1 focus-within:ring-emerald-500/50">
    
    <textarea 
      ref="textareaRef"
      v-model="text"
      @input="adjustHeight"
      @keydown.enter="handleEnter"
      rows="1"
      :placeholder="placeholderText"
      :disabled="isLoading"
      class="flex-1 bg-transparent text-white px-3 py-2.5 md:px-4 md:py-3 text-[15px] md:text-base focus:outline-none placeholder-gray-500 disabled:opacity-50 resize-none max-h-32 md:max-h-40 overflow-y-auto custom-scrollbar leading-relaxed"
      style="min-height: 44px;" 
    ></textarea>
    
    <button 
      @click="handleSubmit"
      :disabled="isLoading || !text.trim()"
      class="mb-1 md:mb-1.5 bg-emerald-600 hover:bg-emerald-500 text-white p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 active:scale-95 flex-shrink-0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </div>
</template>