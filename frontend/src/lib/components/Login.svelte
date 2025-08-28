<script>
    import { error, handleGoogleLogin } from '../stores.js';
  </script>
  
  <div class="text-center bg-gray-800 p-12 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
    <h2 class="text-4xl font-bold mb-4">Selamat Datang!</h2>
    <p class="text-gray-400 mb-8">Login dengan Google untuk memulai percakapan cerdas dengan SAIAS.</p>
    
    <button 
      on:click={handleGoogleLogin} 
      class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto w-full"
    >
      <!-- SVG Google Icon -->
      <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.76 21.35,11.1 21.35,11.1V11.1Z" /></svg>
      Login dengan Google
    </button>
  
    {#if $error}
      <div class="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg">
        <p class="text-red-300 text-sm">{$error}</p>
      </div>
    {/if}
  </div>
  