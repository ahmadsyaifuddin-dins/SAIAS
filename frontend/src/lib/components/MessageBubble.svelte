<script>
  export let message;
  
  let copied = false;

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      copied = true;
      setTimeout(() => copied = false, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copied = true;
      setTimeout(() => copied = false, 2000);
    });
  }
  
  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
</script>

<!-- User Message -->
{#if message.user_text}
<div class="flex justify-end items-start gap-2 group">
  <div class="flex flex-col items-end max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]">
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl rounded-br-md shadow-lg backdrop-blur-sm border border-blue-400/20">
      <p class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{message.user_text}</p>
    </div>
    
    <!-- Timestamp and actions -->
    <div class="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button 
        on:click={() => copyToClipboard(message.user_text)}
        class="text-xs text-gray-400 hover:text-gray-300 p-1 rounded transition-colors"
        title="Copy message"
      >
        {#if copied}
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        {:else}
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        {/if}
      </button>
      {#if message.created_at}
        <span class="text-xs text-gray-500">{formatTimestamp(message.created_at)}</span>
      {/if}
    </div>
  </div>
  
  <!-- User Avatar -->
  <div class="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mt-1">
    U
  </div>
</div>
{/if}

<!-- AI Response -->
{#if message.ai_response}
<div class="flex justify-start items-start gap-2 group">
  <!-- AI Avatar -->
  <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mt-1">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
    </svg>
  </div>
  
  <div class="flex flex-col items-start max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]">
    <div class="bg-gray-700/70 backdrop-blur-sm text-gray-100 p-4 rounded-2xl rounded-bl-md shadow-lg border border-gray-600/30">
      {#if message.ai_response.includes('```')}
        {@const parts = message.ai_response.split('```')}
        {#each parts as part, i}
          {#if i % 2 === 0}
            <p class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{part}</p>
          {:else}
            {@const lines = part.split('\n')}
            {@const language = lines[0]?.toLowerCase() || 'code'}
            {@const codeContent = lines.slice(1).join('\n')}
            
            <div class="bg-gray-900/80 backdrop-blur-sm rounded-lg my-3 overflow-hidden border border-gray-600/50">
              <div class="flex justify-between items-center text-xs text-gray-300 px-4 py-2 bg-gray-800/80 backdrop-blur-sm">
                <div class="flex items-center gap-2">
                  <div class="flex gap-1">
                    <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <span class="font-medium">{language}</span>
                </div>
                <button 
                  on:click={() => copyToClipboard(codeContent)}
                  class="hover:text-white transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700/50"
                  title="Copy code"
                >
                  {#if copied}
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span>Copied!</span>
                  {:else}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    <span>Copy</span>
                  {/if}
                </button>
              </div>
              <div class="overflow-x-auto">
                <pre class="p-4 text-sm text-gray-200 leading-relaxed"><code class="language-{language}">{codeContent}</code></pre>
              </div>
            </div>
          {/if}
        {/each}
      {:else}
        <p class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{message.ai_response}</p>
      {/if}
    </div>
    
    <!-- Timestamp and actions -->
    <div class="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button 
        on:click={() => copyToClipboard(message.ai_response)}
        class="text-xs text-gray-400 hover:text-gray-300 p-1 rounded transition-colors"
        title="Copy response"
      >
        {#if copied}
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        {:else}
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        {/if}
      </button>
      {#if message.created_at}
        <span class="text-xs text-gray-500">{formatTimestamp(message.created_at)}</span>
      {/if}
      <div class="flex items-center gap-1 text-xs text-gray-500">
        <span>SAIAS</span>
      </div>
    </div>
  </div>
</div>
{/if}