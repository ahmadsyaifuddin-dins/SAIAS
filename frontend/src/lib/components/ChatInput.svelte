<script>
    import { userInput, isLoading, error, sendMessage } from '../stores.js';
  
    function handleKeyPress(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }
  </script>
  
  <div class="p-4 bg-gray-900/50 border-t border-gray-700 rounded-b-2xl">
    {#if $error}
      <div class="mb-3 p-3 bg-red-900/50 border border-red-600 rounded-lg">
        <p class="text-red-300 text-sm">{$error}</p>
      </div>
    {/if}
    
    <form on:submit|preventDefault={sendMessage} class="flex items-end space-x-3">
      <textarea
        bind:value={$userInput}
        on:keydown={handleKeyPress}
        placeholder="Ketik pesan Anda..."
        class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
        rows="1"
        disabled={$isLoading}
      ></textarea>
      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg"
        disabled={$isLoading || !$userInput.trim()}
      >
        Kirim
      </button>
    </form>
  </div>
  