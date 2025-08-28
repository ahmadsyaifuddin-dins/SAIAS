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
  
  <div class="w-full max-w-4xl h-[80vh] bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-700">
    <div class="p-4 bg-gray-700 rounded-t-2xl border-b border-gray-600">
      <h3 class="font-semibold text-lg">Chat dengan SAIAS</h3>
      <p class="text-gray-400 text-sm">AI Assistant oleh Ahmad Syaifuddin</p>
    </div>
    
    <div class="flex-grow p-4 overflow-y-auto space-y-4" bind:this={messagesContainer}>
      {#if $messages.length === 0 && !$isLoading}
        <div class="text-center text-gray-400 mt-8">
          <p>👋 Mulai percakapan dengan mengirim pesan!</p>
          <p class="text-sm mt-2">Coba tanya: "Siapa Ahmad Syaifuddin?"</p>
        </div>
      {/if}
      
      {#each $messages as msg, index (msg.id || msg.created_at || index)}
        <MessageBubble message={msg} />
      {/each}
      
      {#if $isLoading}
         <div class="flex justify-start">
            <div class="bg-gray-700 text-gray-200 p-3 rounded-xl">
              <div class="flex items-center space-x-2">
                <div class="animate-pulse flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
      {/if}
    </div>
    
    <ChatInput />
  </div>
  