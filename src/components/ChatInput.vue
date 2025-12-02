<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);

// PERBAIKAN DISINI:
// Kita tampung defineProps ke dalam variabel 'props'
const props = defineProps({
  isLoading: Boolean
});

const text = ref('');

const handleSubmit = () => {
  // Panggilnya harus pakai 'props.isLoading', bukan 'isLoading' saja
  if (!text.value.trim() || props.isLoading) return;
  
  emit('submit', text.value);
  text.value = '';
};
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-2 bg-gray-800 rounded-xl border border-gray-700 shadow-lg flex gap-2 items-center">
    <input 
      v-model="text"
      @keyup.enter="handleSubmit"
      type="text" 
      :placeholder="isLoading ? 'Tunggu sebentar...' : 'Ketik pesan untuk SAIAS...'"
      :disabled="isLoading"
      class="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none placeholder-gray-500 disabled:opacity-50"
    />
    
    <button 
      @click="handleSubmit"
      :disabled="isLoading || !text.trim()"
      class="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </div>
</template>