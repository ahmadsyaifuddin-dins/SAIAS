<script>
  import { userInput, sendMessage, isLoading, error } from '../stores.js';
  
  let textareaElement;
  
  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!$isLoading && $userInput.trim()) {
        sendMessage();
      }
    }
  }
  
  function autoResize() {
    if (textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.height = Math.min(textareaElement.scrollHeight, 120) + 'px';
    }
  }
  
  $: if ($userInput && textareaElement) {
    autoResize();
  }
  
  // Clear error after user starts typing
  $: if ($userInput && $error) {
    error.set(null);
  }
</script>

<div class="p-4">
  {#if $error}
    <div class="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-red-300 text-sm">{$error}</p>
      </div>
    </div>
  {/if}
  
  <div class="flex gap-3 items-end">
    <div class="flex-1 relative">
      <textarea
        bind:this={textareaElement}
        bind:value={$userInput}
        on:keydown={handleKeydown}
        on:input={autoResize}
        placeholder="Ketik pesan Anda di sini... (Enter untuk kirim, Shift+Enter untuk baris baru)"
        disabled={$isLoading}
        class="w-full p-4 bg-gray-700/70 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style="min-height: 56px; max-height: 120px;"
        rows="1"
      ></textarea>
      
      <!-- Character count for long messages -->
      {#if $userInput.length > 100}
        <div class="absolute bottom-2 right-2 text-xs text-gray-500">
          {$userInput.length}/2000
        </div>
      {/if}
    </div>
    
    <button
      on:click={sendMessage}
      disabled={$isLoading || !$userInput.trim()}
      class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center min-w-[56px]"
    >
      {#if $isLoading}
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      {:else}
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      {/if}
    </button>
  </div>
  
  <!-- Quick suggestions when input is empty -->
  {#if !$userInput.trim() && !$isLoading}
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        on:click={() => userInput.set('Siapa Ahmad Syaifuddin?')}
        class="text-xs px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500/50 rounded-full transition-all duration-200 text-gray-300 hover:text-white"
      >
        Siapa Ahmad Syaifuddin?
      </button>
      <button
        on:click={() => userInput.set('Apa yang bisa kamu bantu?')}
        class="text-xs px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500/50 rounded-full transition-all duration-200 text-gray-300 hover:text-white"
      >
        Apa yang bisa kamu bantu?
      </button>
      <button
        on:click={() => userInput.set('Bagaimana cara kerja AI?')}
        class="text-xs px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500/50 rounded-full transition-all duration-200 text-gray-300 hover:text-white"
      >
        Bagaimana cara kerja AI?
      </button>
    </div>
  {/if}
</div>