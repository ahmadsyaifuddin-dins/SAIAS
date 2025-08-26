<script>
  import { onMount } from 'svelte';
  import { createClient } from '@supabase/supabase-js';

  // --- Konfigurasi ---
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // --- State Aplikasi ---
  let session = null;
  let messages = [];
  let userInput = '';
  let isLoading = false;
  let error = null;

  // --- Lifecycle & Autentikasi ---
  onMount(() => {
    supabase.auth.getSession().then(({ data }) => {
      session = data.session;
      if (session) {
        loadHistory();
      }
    });

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session = newSession;
      if (session) {
        loadHistory();
      } else {
        messages = [];
      }
    });
  });

  // --- Fungsi-fungsi ---
  async function handleGoogleLogin() {
    error = null;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (e) {
      error = 'Gagal login dengan Google: ' + e.message;
    }
  }

  async function handleLogout() {
    error = null;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      error = 'Gagal logout: ' + e.message;
    }
  }

  async function loadHistory() {
    if (!session) return;
    isLoading = true;
    error = null;
    try {
      const response = await fetch(`${BACKEND_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Gagal memuat riwayat');
      }
      messages = await response.json();
    } catch (e) {
      error = e.message;
    } finally {
      isLoading = false;
    }
  }

  async function sendMessage() {
    if (!userInput.trim() || !session) return;
    
    const userMessage = { user_text: userInput, from: 'user' };
    messages = [...messages, userMessage];
    const currentInput = userInput;
    userInput = '';
    isLoading = true;
    error = null;

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: currentInput })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Gagal mengirim pesan');
      }

      await loadHistory();

    } catch (e) {
      error = e.message;
      messages = messages.filter(m => m !== userMessage);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>SAIAS by Ahmad Syaifuddin</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</svelte:head>

<!-- PERUBAHAN: Latar belakang gradien gelap -->
<div class="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
  
  <!-- PERUBAHAN: Header dengan border bawah yang halus -->
  <header class="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-10">
    <h1 class="text-2xl font-bold tracking-wider">SAIAS</h1>
    {#if session}
      <div class="flex items-center">
        <span class="text-gray-400 mr-4 hidden sm:block">{session.user.email}</span>
        <button on:click={handleLogout} class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          Logout
        </button>
      </div>
    {/if}
  </header>

  <main class="flex-grow flex items-center justify-center p-4">
    {#if !session}
      <!-- PERUBAHAN: Kartu login dengan gaya dark mode -->
      <div class="text-center bg-gray-800 p-12 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
        <h2 class="text-4xl font-bold mb-4">Selamat Datang!</h2>
        <p class="text-gray-400 mb-8">Login dengan Google untuk memulai percakapan cerdas.</p>
        
        <!-- PERUBAHAN: Tombol dengan gradien dan efek hover -->
        <button 
          on:click={handleGoogleLogin} 
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto w-full"
        >
          <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.76 21.35,11.1 21.35,11.1V11.1Z" /></svg>
          Login dengan Google
        </button>

        {#if error}
          <p class="text-red-400 mt-4">{error}</p>
        {/if}
      </div>
    {:else}
      <!-- Tampilan Chat dengan gaya dark mode -->
      <div class="w-full max-w-3xl h-[80vh] bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-700">
        <div class="flex-grow p-4 overflow-y-auto">
          {#each messages as msg (msg.id || Math.random())}
            {#if msg.user_text}
              <div class="flex justify-end mb-3">
                <div class="bg-blue-600 text-white p-3 rounded-lg max-w-xs lg:max-w-md">
                  <p>{msg.user_text}</p>
                </div>
              </div>
            {/if}
            {#if msg.ai_response}
              <div class="flex justify-start mb-3">
                <div class="bg-gray-700 text-gray-200 p-3 rounded-lg max-w-xs lg:max-w-md">
                  <p>{msg.ai_response}</p>
                </div>
              </div>
            {/if}
          {/each}
          {#if isLoading}
             <div class="flex justify-start mb-3">
                <div class="bg-gray-700 text-gray-200 p-3 rounded-lg">
                  <span class="animate-pulse">...</span>
                </div>
              </div>
          {/if}
        </div>
        
        <div class="p-4 bg-gray-900/50 border-t border-gray-700">
           {#if error}
            <p class="text-red-400 text-center mb-2">{error}</p>
          {/if}
          <form on:submit|preventDefault={sendMessage} class="flex items-center">
            <input
              bind:value={userInput}
              type="text"
              placeholder="Ketik pesan Anda..."
              class="flex-grow bg-gray-700 border border-gray-600 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg transition duration-300 disabled:bg-blue-400"
              disabled={isLoading}
            >
              Kirim
            </button>
          </form>
        </div>
      </div>
    {/if}
  </main>
</div>
