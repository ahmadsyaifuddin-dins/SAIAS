<script>
    import { session, backendConnected, handleLogout } from '../stores.js';
  </script>
  
  <header class="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-10">
    <div class="flex items-center">
      <h1 class="text-2xl font-bold tracking-wider">SAIAS</h1>
      {#if $session && $backendConnected}
        <span class="ml-3 text-xs bg-green-600 text-white px-2 py-1 rounded-full">Online</span>
      {:else if $session && !$backendConnected}
        <span class="ml-3 text-xs bg-red-600 text-white px-2 py-1 rounded-full animate-pulse">Offline</span>
      {/if}
    </div>
    
    {#if $session}
      <div class="flex items-center">
        <span class="text-gray-400 mr-4 hidden sm:block text-sm">{$session.user.email}</span>
        <button on:click={handleLogout} class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm">
          Logout
        </button>
      </div>
    {/if}
  </header>
  