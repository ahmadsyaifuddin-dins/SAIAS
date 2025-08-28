<script>
  import { session, backendConnected, error } from './lib/stores.js';
  import Header from './lib/components/Header.svelte';
  import Login from './lib/components/Login.svelte';
  import ChatWindow from './lib/components/ChatWindow.svelte';
  import HistorySidebar from './lib/components/HistorySidebar.svelte';
</script>

<svelte:head>
  <title>SAIAS by Ahmad Syaifuddin</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            gray: {
              750: '#3f4654',
              850: '#1a202c',
              950: '#0f1419'
            }
          },
          backdropBlur: {
            xs: '2px',
          }
        }
      }
    }
  </script>
</svelte:head>

<div class="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white h-screen flex flex-col font-sans overflow-hidden">
  <Header />

  <main class="flex-1 flex overflow-hidden min-h-0">
    {#if !$session}
      <!-- Login Screen -->
      <div class="flex-1 flex items-center justify-center p-4">
        <Login />
      </div>
    {:else if !$backendConnected}
      <!-- Loading/Connection Screen -->
      <div class="flex-1 flex items-center justify-center p-4">
        <div class="text-center bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-600/50 max-w-md w-full">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 class="text-2xl font-bold mb-4">Menghubungkan ke Backend...</h2>
          {#if $error}
            <div class="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
              <p class="text-red-300 text-sm">{$error}</p>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Main Chat Interface -->
      <div class="flex flex-1 h-full min-h-0">
        <!-- Sidebar -->
        <div class="flex-shrink-0">
          <HistorySidebar />
        </div>
        
        <!-- Chat Area - Full height integrated -->
        <div class="flex-1 flex flex-col min-w-0 bg-gray-800/20 backdrop-blur-sm">
          <!-- Chat Header -->
          <div class="flex-shrink-0 p-6 border-b border-gray-600/50 bg-gray-700/30 backdrop-blur-sm">
            <h3 class="font-semibold text-xl text-white">Chat dengan SAIAS</h3>
            <p class="text-gray-300 text-sm mt-1">AI Assistant oleh Ahmad Syaifuddin</p>
          </div>
          
          <!-- Chat Content - This is the scrollable area -->
          <div class="flex-1 flex flex-col min-h-0">
            <ChatWindow />
          </div>
        </div>
      </div>
    {/if}
  </main>
  
  <footer class="flex-shrink-0 text-center p-4 text-gray-400 text-sm border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
    <p>&copy; 2024 SAIAS by Ahmad Syaifuddin.</p>
  </footer>
</div>

<style>
  /* Pastikan html dan body menggunakan full height */
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  :global(#app) {
    height: 100vh;
  }
  
  /* Custom scrollbar untuk webkit browsers */
  :global(.scrollbar-custom) {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  :global(.scrollbar-custom::-webkit-scrollbar) {
    width: 8px;
  }
  
  :global(.scrollbar-custom::-webkit-scrollbar-track) {
    background: rgba(55, 65, 81, 0.3);
    border-radius: 4px;
  }
  
  :global(.scrollbar-custom::-webkit-scrollbar-thumb) {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  
  :global(.scrollbar-custom::-webkit-scrollbar-thumb:hover) {
    background: rgba(156, 163, 175, 0.7);
  }
  
  /* Smooth scrolling */
  :global(*) {
    scroll-behavior: smooth;
  }
  
  /* Tambahan untuk memastikan layout responsif */
  @media (max-width: 768px) {
    :global(.w-80) {
      width: 16rem;
    }
  }
  
  @media (max-width: 640px) {
    :global(.w-80) {
      width: 14rem;
    }
  }
</style>