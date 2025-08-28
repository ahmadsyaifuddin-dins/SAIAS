<script>
    export let message;
  
    function copyToClipboard(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  </script>
  
  {#if message.user_text}
    <div class="flex justify-end">
      <div class="bg-blue-600 text-white p-3 rounded-xl max-w-xs lg:max-w-md shadow-lg">
        <p class="whitespace-pre-wrap">{message.user_text}</p>
      </div>
    </div>
  {/if}
  
  {#if message.ai_response}
    <div class="flex justify-start">
      <div class="bg-gray-700 text-gray-200 p-3 rounded-xl max-w-xs lg:max-w-md shadow-lg">
        {#if message.ai_response.includes('```')}
          {@const parts = message.ai_response.split('```')}
          {#each parts as part, i}
            {#if i % 2 === 0}
              <p class="whitespace-pre-wrap">{part}</p>
            {:else}
              <div class="bg-gray-900 rounded-lg my-2">
                <div class="flex justify-between items-center text-xs text-gray-400 px-4 py-2 bg-gray-800 rounded-t-lg">
                  <span>Code Block</span>
                  <button on:click={() => copyToClipboard(part)} class="hover:text-white transition">Copy</button>
                </div>
                <pre class="p-4 text-sm overflow-x-auto"><code>{part}</code></pre>
              </div>
            {/if}
          {/each}
        {:else}
          <p class="whitespace-pre-wrap">{message.ai_response}</p>
        {/if}
      </div>
    </div>
  {/if}
  