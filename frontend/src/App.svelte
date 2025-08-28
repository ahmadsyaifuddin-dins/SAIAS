<script>
  import { session, backendConnected, error } from './lib/stores.js';
  import Header from './lib/components/Header.svelte';
  import Login from './lib/components/Login.svelte';
  import ChatWindow from './lib/components/ChatWindow.svelte';
</script>

<svelte:head>
  <title>SAIAS by Ahmad Syaifuddin</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</svelte:head>

<div class="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
  <Header />

  <main class="flex-grow flex items-center justify-center p-4">
    {#if !$session}
      <Login />
    {:else if !$backendConnected}
      <div class="text-center bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 class="text-2xl font-bold mb-4">Menghubungkan ke Backend...</h2>
        {#if $error}
          <div class="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg">
            <p class="text-red-300 text-sm">{$error}</p>
          </div>
        {/if}
      </div>
    {:else}
      <ChatWindow />
    {/if}
  </main>
  
  <footer class="text-center p-4 text-gray-500 text-sm border-t border-gray-800">
    <p>&copy; 2024 SAIAS by Ahmad Syaifuddin.</p>
  </footer>
</div>
