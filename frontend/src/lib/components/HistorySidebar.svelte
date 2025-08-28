<script>
    import { conversations, activeConversationId, startNewChat, selectConversation } from '../stores.js';
</script>

<div class="w-80 bg-gray-800/70 backdrop-blur-md h-full flex flex-col border-r border-gray-600/50 shadow-xl">
    <!-- Header Sidebar -->
    <div class="p-4 border-b border-gray-600/50 bg-gray-700/50">
        <button 
            on:click={startNewChat} 
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Percakapan Baru
        </button>
    </div>
    
    <!-- List Conversations -->
    <div class="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700/50">
        {#if $conversations.length === 0}
            <div class="p-6 text-center text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p class="text-sm font-medium">Belum ada riwayat percakapan</p>
                <p class="text-xs mt-2 text-gray-500">Mulai chat baru untuk menyimpan percakapan</p>
                
                <!-- Hint untuk user -->
                <div class="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p class="text-xs text-blue-400">💡 Tips: Semua chat akan otomatis tersimpan setelah Anda mengirim pesan</p>
                </div>
            </div>
        {:else}
            <div class="p-3 space-y-2">
                {#each $conversations as convo (convo.id)}
                    <button 
                        on:click={() => selectConversation(convo.id)}
                        class="w-full text-left p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-500/50 group relative backdrop-blur-sm"
                        class:bg-gradient-to-r={$activeConversationId === convo.id}
                        class:from-blue-600={$activeConversationId === convo.id}
                        class:to-blue-700={$activeConversationId === convo.id}
                        class:shadow-lg={$activeConversationId === convo.id}
                        class:hover:bg-gray-700={$activeConversationId !== convo.id}
                        class:bg-gray-700={$activeConversationId !== convo.id}
                    >
                        <div class="flex items-start gap-3">
                            <!-- Chat Icon -->
                            <div class="mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                            </div>
                            
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-sm leading-5 mb-1"
                                   class:text-white={$activeConversationId === convo.id}
                                   class:text-gray-200={$activeConversationId !== convo.id}>
                                    {convo.title || "Percakapan tanpa judul"}
                                </p>
                                <div class="flex items-center gap-2 text-xs"
                                     class:text-blue-200={$activeConversationId === convo.id}
                                     class:text-gray-400={$activeConversationId !== convo.id}>
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    {new Date(convo.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Hover indicator -->
                        {#if $activeConversationId !== convo.id}
                            <div class="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform origin-center"></div>
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
    
    <!-- Footer Sidebar -->
    <div class="p-4 border-t border-gray-600/50 bg-gray-700/50">
        <div class="text-xs text-gray-400 text-center">
            {$conversations.length} percakapan tersimpan
        </div>
    </div>
</div>

<style>
    /* Custom scrollbar untuk Firefox dan Webkit */
    .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
    }
    
    .scrollbar-thin::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 3px;
    }
    
    .scrollbar-thin::-webkit-scrollbar-thumb {
        background: #6b7280;
        border-radius: 3px;
    }
    
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
    }
</style>