<script setup>
import { signInWithGoogle } from '../lib/supabase';
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 p-4">
    <div class="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-md text-center">
      <div class="mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-2">
          SAIAS v2.5.0
        </h1>
        <p class="text-gray-400 text-sm">Masuk untuk menyimpan riwayat percakapan</p>
      </div>

      <button 
        @click="signInWithGoogle"
        class="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-6 h-6">
        Lanjutkan dengan Google
      </button>

      <p class="mt-6 text-xs text-gray-500">
        Dengan masuk, Anda menyetujui untuk ngobrol santai bareng AI buatan Ahmad Syaifuddin.
      </p>
    </div>
  </div>
</template>