<script setup>
import { alertState, handleConfirm, handleCancel } from '../lib/useAlert';

// Ikon-ikon SVG berdasarkan tipe alert
const getIcon = () => {
  switch (alertState.type) {
    case 'success':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    case 'error':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    default: // info
      return `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
};
</script>

<template>
  <Transition name="fade">
    <div v-if="alertState.isOpen" class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      
      <Transition name="scale">
        <div v-if="alertState.isOpen" class="bg-gray-800 border border-gray-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform">
          
          <div class="p-6 text-center">
            <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gray-900/50 mb-4 border border-gray-700" v-html="getIcon()"></div>
            
            <h3 class="text-xl font-bold text-white mb-2">{{ alertState.title }}</h3>
            <p class="text-gray-400 text-sm leading-relaxed mb-6">{{ alertState.message }}</p>
            
            <div class="flex gap-3 justify-center">
              <button 
                v-if="alertState.isConfirm"
                @click="handleCancel"
                class="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm font-medium"
              >
                Batal
              </button>

              <button 
                @click="handleConfirm"
                class="px-6 py-2.5 rounded-xl text-white font-medium shadow-lg transition text-sm flex-1"
                :class="{
                  'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20': alertState.type === 'success',
                  'bg-red-600 hover:bg-red-700 shadow-red-900/20': alertState.type === 'error',
                  'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20': alertState.type === 'warning',
                  'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20': alertState.type === 'info',
                }"
              >
                {{ alertState.isConfirm ? 'Ya, Lanjutkan' : 'Oke' }}
              </button>
            </div>
          </div>

        </div>
      </Transition>

    </div>
  </Transition>
</template>

<style scoped>
/* Animasi Fade untuk Overlay */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Animasi Scale (Zoom In/Out) untuk Modal */
.scale-enter-active, .scale-leave-active { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.9) translateY(10px); }
</style>