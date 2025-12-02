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
    icon: iconKey.value,
    custom_instruction: customInstruction.value
  });
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm">
      
      <div class="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden transform transition-all">
        
        <div class="px-5 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 shrink-0">
          <h3 class="text-lg font-bold text-white">
            {{ projectToEdit ? 'Edit Project' : 'Buat Project Baru' }}
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          
          <div>
            <label class="block text-sm text-gray-400 mb-2 font-medium">Pilih Ikon</label>
            <div class="grid grid-cols-5 sm:grid-cols-8 gap-2">
              <button 
                v-for="(data, key) in projectIcons" 
                :key="key"
                @click="iconKey = key"
                class="aspect-square rounded-xl flex items-center justify-center transition border relative group"
                :class="iconKey === key ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-gray-200'"
                :title="data.label"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="data.path"></svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1.5 font-medium">Nama Project <span class="text-red-400">*</span></label>
            <input 
              v-model="name" 
              type="text" 
              placeholder="Contoh: Skripsi Bab 1" 
              class="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-600 transition"
            >
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-1.5 font-medium">Deskripsi (Opsional)</label>
            <textarea 
              v-model="description" 
              rows="2" 
              placeholder="Catatan singkat tentang project ini..." 
              class="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none resize-none placeholder-gray-600 transition"
            ></textarea>
          </div>

          <div class="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
            <label class="block text-sm text-emerald-400 mb-2 font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>
              Instruksi Khusus (System Prompt)
            </label>
            <textarea 
              v-model="customInstruction" 
              rows="3" 
              placeholder="Contoh: 'Jawab dengan gaya formal akademik' atau 'Kamu adalah Senior Programmer yang galak'." 
              class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none resize-none placeholder-gray-600 transition leading-relaxed"
            ></textarea>
            <p class="text-[10px] text-gray-500 mt-2 italic">
              AI akan mengikuti instruksi ini secara otomatis di dalam project ini.
            </p>
          </div>

        </div>

        <div class="px-5 py-4 bg-gray-900/50 flex justify-end gap-3 border-t border-gray-700 shrink-0">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 text-sm font-medium transition"
          >
            Batal
          </button>
          <button 
            @click="handleSubmit" 
            :disabled="!name.trim()"
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition transform active:scale-95 flex items-center gap-2"
          >
            {{ projectToEdit ? 'Simpan' : 'Buat Project' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Animasi Pop-up yang halus */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>