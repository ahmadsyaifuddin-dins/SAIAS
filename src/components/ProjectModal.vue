<script setup>
import { ref, watch } from 'vue';
import { projectIcons } from '../lib/projectIcons';

const props = defineProps({
  isOpen: Boolean,
  projectToEdit: Object
});

const emit = defineEmits(['close', 'submit']);

const name = ref('');
const description = ref('');
const iconKey = ref('folder');
const customInstruction = ref('');

// Reset atau Isi Data saat Modal Dibuka
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.projectToEdit) {
      name.value = props.projectToEdit.name;
      description.value = props.projectToEdit.description || '';
      // Cek apakah icon lama itu SVG Key atau Emoji lama?
      // Kalau ada di library, pakai key. Kalau tidak, default ke folder.
      const oldIcon = props.projectToEdit.icon;
      iconKey.value = projectIcons[oldIcon] ? oldIcon : 'folder'; 
      customInstruction.value = props.projectToEdit.custom_instruction || '';
    } else {
      name.value = '';
      description.value = '';
      iconKey.value = 'folder';
      customInstruction.value = '';
    }
  }
});

const handleSubmit = () => {
  if (!name.value.trim()) return;
  
  emit('submit', {
    name: name.value,
    description: description.value,
    icon: iconKey.value, // Kirim key (misal 'folder') ke database
    custom_instruction: customInstruction.value
  });
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div class="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden transform transition-all">
      
      <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
        <h3 class="text-lg font-bold text-white">
          {{ projectToEdit ? 'Edit Project' : 'Buat Project Baru' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">✕</button>
      </div>

      <div class="p-6 space-y-5">
        
        <div>
          <label class="block text-sm text-gray-400 mb-2">Pilih Ikon</label>
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
            <button 
              v-for="(data, key) in projectIcons" 
              :key="key"
              @click="iconKey = key"
              class="w-10 h-10 rounded-lg flex items-center justify-center transition border relative group"
              :class="iconKey === key ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-gray-200'"
              :title="data.label"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="data.path"></svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Nama Project</label>
          <input v-model="name" type="text" placeholder="Misal: Skripsi Bab 1" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none placeholder-gray-600 transition">
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Deskripsi (Opsional)</label>
          <textarea v-model="description" rows="2" placeholder="Project ini tentang..." class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none resize-none placeholder-gray-600 transition"></textarea>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1 flex items-center gap-2">
            Instruksi Khusus
            <span class="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">System Prompt</span>
          </label>
          <textarea v-model="customInstruction" rows="3" placeholder="Contoh: Kamu adalah dosen pembimbing yang teliti. Koreksi grammar saya." class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none resize-none placeholder-gray-600 transition"></textarea>
        </div>

      </div>

      <div class="px-6 py-4 bg-gray-900/50 flex justify-end gap-3 border-t border-gray-700">
        <button @click="$emit('close')" class="px-4 py-2 text-gray-300 hover:text-white text-sm">Batal</button>
        <button 
          @click="handleSubmit" 
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-900/20 transition transform active:scale-95"
        >
          {{ projectToEdit ? 'Simpan Perubahan' : 'Buat Project' }}
        </button>
      </div>

    </div>
  </div>
</template>