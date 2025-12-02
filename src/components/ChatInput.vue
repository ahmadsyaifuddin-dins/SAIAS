<script setup>
import { ref, nextTick } from 'vue';

const emit = defineEmits(['submit']);
const props = defineProps({
  isLoading: Boolean
});

const text = ref('');
const textareaRef = ref(null);

// Fungsi untuk menyesuaikan tinggi textarea secara otomatis
const adjustHeight = () => {
  const el = textareaRef.value;
  if (el) {
    el.style.height = 'auto'; // Reset dulu biar bisa mengecil
    el.style.height = el.scrollHeight + 'px'; // Set tinggi sesuai konten
  }
};

const handleSubmit = () => {
  if (!text.value.trim() || props.isLoading) return;
  
  emit('submit', text.value);
  text.value = '';
  
  // Reset tinggi textarea ke semula
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  });
};

const handleEnter = (e) => {
  // Jika di HP, Enter biasanya buat baris baru.
  // Tapi di Desktop: Enter = Kirim, Shift+Enter = Baris Baru
  if (!e.shiftKey) {
    e.preventDefault(); // Cegah bikin baris baru
    handleSubmit();
  }
};
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-2 bg-gray-800 rounded-xl border border-gray-700 shadow-lg flex gap-2 items-end">
    <textarea 
      ref="textareaRef"
      v-model="text"
      @input="adjustHeight"
      @keydown.enter="handleEnter"
      rows="1"
      :placeholder="isLoading ? 'Tunggu sebentar...' : 'Ketik pesan... (Shift+Enter untuk baris baru)'"
      :disabled="isLoading"
      class="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500 disabled:opacity-50 resize-none max-h-40 overflow-y-auto custom-scrollbar leading-relaxed"
    ></textarea>
    
    <button 
      @click="handleSubmit"
      :disabled="isLoading || !text.trim()"
      class="mb-1 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </div>
</template>