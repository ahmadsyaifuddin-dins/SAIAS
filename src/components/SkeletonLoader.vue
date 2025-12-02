<template>
  <div class="flex flex-col h-screen bg-gray-900 overflow-hidden animate-pulse">
    
    <header class="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gray-800"></div>
        <div class="space-y-2">
          <div class="h-4 w-24 bg-gray-800 rounded"></div>
          <div class="h-2 w-16 bg-gray-800 rounded"></div>
        </div>
      </div>
      <div class="flex gap-2">
        <div class="w-8 h-8 bg-gray-800 rounded-lg"></div>
        <div class="w-16 h-8 bg-gray-800 rounded-lg"></div>
      </div>
    </header>

    <main class="flex-1 p-6 space-y-8 overflow-hidden">
      
      <div class="flex justify-start w-full animate-pulse delay-75">
        <div class="w-[60%] h-24 bg-gray-800 rounded-2xl rounded-bl-sm"></div>
      </div>

      <div class="flex justify-end w-full animate-pulse delay-100">
        <div class="w-[40%] h-16 bg-gray-800/50 rounded-2xl rounded-br-sm"></div>
      </div>

      <div class="flex justify-start w-full animate-pulse delay-150">
        <div class="w-[75%] h-32 bg-gray-800 rounded-2xl rounded-bl-sm"></div>
      </div>

    </main>

    <footer class="p-4 border-t border-gray-800">
      <div class="w-full h-12 bg-gray-800 rounded-xl"></div>
    </footer>

  </div>
</template>