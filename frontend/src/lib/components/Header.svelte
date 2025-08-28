<script>
  import { session, backendConnected, handleLogout } from '../stores.js';
</script>

<header class="bg-gray-800/70 backdrop-blur-md border-b border-gray-600/50 p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
<div class="flex items-center">
  <div class="flex items-center gap-3">
    <!-- Logo/Icon -->
    <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    </div>
    
    <div>
      <h1 class="text-2xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">SAIAS</h1>
      <p class="text-xs text-gray-400 -mt-1">AI Assistant</p>
    </div>
  </div>
  
  {#if $session && $backendConnected}
    <div class="ml-4 flex items-center gap-2">
      <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">Online</span>
    </div>
  {:else if $session && !$backendConnected}
    <div class="ml-4 flex items-center gap-2">
      <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
      <span class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">Connecting...</span>
    </div>
  {/if}
</div>

{#if $session}
  <div class="flex items-center gap-4">
    <div class="hidden sm:flex items-center gap-2">
      <div class="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
        <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <div class="text-right">
        <p class="text-gray-300 text-sm font-medium">{$session.user.email}</p>
        <p class="text-gray-500 text-xs">Logged in</p>
      </div>
    </div>
    
    <button 
      on:click={handleLogout} 
      class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      <span class="hidden sm:inline">Logout</span>
    </button>
  </div>
{/if}
</header>