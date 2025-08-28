<script>
  import { onMount, tick } from 'svelte';
  import { messages, isLoading } from '../stores.js';
  import MessageBubble from './MessageBubble.svelte';
  import ChatInput from './ChatInput.svelte';

  let messagesContainer;

  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    }
  }

  $: if ($messages) {
    scrollToBottom();
  }
</script>

<!-- Remove the redundant wrapper and header since it's now in App.svelte -->
<div class="flex flex-col h-full">
<!-- Messages Area -->
<div class="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" bind:this={messagesContainer}>
  {#if $messages.length === 0 && !$isLoading}
    <div class="text-center text-gray-400 mt-16">
      <div class="mb-6">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </div>
      <h4 class="text-xl font-semibold mb-2 text-gray-300">👋 Mulai percakapan dengan mengirim pesan!</h4>
      <p class="text-sm text-gray-400">Coba tanya: "Siapa Ahmad Syaifuddin?"</p>
      
      <!-- Welcome suggestions -->
      <div class="mt-8 space-y-3 max-w-md mx-auto">
        <div class="text-left">
          <p class="text-xs text-gray-500 mb-2">Contoh pertanyaan:</p>
          <div class="space-y-2">
            <div class="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-sm text-gray-300 cursor-pointer hover:bg-gray-700/70 transition-all">
              "Apa yang bisa kamu bantu?"
            </div>
            <div class="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-sm text-gray-300 cursor-pointer hover:bg-gray-700/70 transition-all">
              "Ceritakan tentang Ahmad Syaifuddin"
            </div>
            <div class="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-sm text-gray-300 cursor-pointer hover:bg-gray-700/70 transition-all">
              "Bagaimana cara kerja AI?"
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  {#each $messages as msg, index (msg.id || msg.created_at || index)}
    <MessageBubble message={msg} />
  {/each}
  
  {#if $isLoading}
     <div class="flex justify-start">
        <div class="bg-gray-700/70 backdrop-blur-sm text-gray-200 p-4 rounded-2xl border border-gray-600/50">
          <div class="flex items-center space-x-3">
            <div class="animate-pulse flex space-x-1">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            </div>
            <span class="text-sm text-gray-400">SAIAS sedang mengetik...</span>
          </div>
        </div>
      </div>
  {/if}
</div>

<!-- Chat Input -->
<div class="border-t border-gray-600/50 bg-gray-700/30 backdrop-blur-sm">
  <ChatInput />
</div>
</div>

<style>
/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.5);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.7);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}
</style>