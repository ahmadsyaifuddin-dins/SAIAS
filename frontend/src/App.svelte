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
  let backendConnected = false;

  // --- Lifecycle & Autentikasi ---
  onMount(() => {
    supabase.auth.getSession().then(({ data }) => {
      session = data.session;
      if (session) {
        checkBackendConnection();
      }
    });

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session = newSession;
      if (session) {
        checkBackendConnection();
      } else {
        messages = [];
        backendConnected = false;
      }
    });
  });

  // --- Fungsi untuk test koneksi backend ---
  async function checkBackendConnection() {
    try {
      console.log('Testing backend connection to:', BACKEND_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout
      
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
          'User-Agent': 'SAIAS-Frontend/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Cek content type dulu
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      
      if (response.ok) {
        // Pastikan response adalah JSON, bukan HTML
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Backend response:', data);
          backendConnected = true;
          loadHistory();
        } else {
          // Jika dapat HTML (ngrok warning page), coba akses langsung
          const text = await response.text();
          if (text.includes('ngrok') && text.includes('Visit Site')) {
            throw new Error('Ngrok warning page detected. Silakan akses URL backend di browser dulu untuk bypass warning, kemudian refresh halaman ini.');
          } else {
            throw new Error('Backend mengembalikan HTML alih-alih JSON. Periksa konfigurasi backend.');
          }
        }
      } else {
        throw new Error(`Backend returned status: ${response.status}`);
      }
    } catch (e) {
      console.error('Backend connection failed:', e);
      backendConnected = false;
      
      // Error message yang lebih helpful
      if (e.message.includes('ngrok warning')) {
        error = `${e.message}`;
      } else if (e.name === 'AbortError') {
        error = `Timeout connecting to backend. Backend mungkin lambat atau tidak responsif.`;
      } else {
        error = `Tidak dapat terhubung ke backend: ${e.message}`;
      }
    }
  }

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
    if (!session || !backendConnected) return;
    
    isLoading = true;
    error = null;
    
    try {
      console.log('Loading history from:', `${BACKEND_URL}/history`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${BACKEND_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning
          'User-Agent': 'SAIAS-Frontend/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('History response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('History response headers:', contentType);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('History error response:', errorText);
        
        // Handle ngrok warning page
        if (errorText.includes('ngrok') && errorText.includes('Visit Site')) {
          throw new Error('Ngrok warning page. Silakan buka URL backend di browser terlebih dahulu.');
        }
        
        // Cek apakah ini HTML error page
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
          throw new Error('Backend mengembalikan halaman error HTML. Periksa URL backend.');
        }
        
        try {
          const errData = JSON.parse(errorText);
          throw new Error(errData.detail || `HTTP ${response.status}: Gagal memuat riwayat`);
        } catch (parseError) {
          throw new Error(`Backend error (${response.status}): ${errorText.substring(0, 100)}`);
        }
      }
      
      const responseText = await response.text();
      console.log('Raw history response:', responseText.substring(0, 200));
      
      if (!responseText) {
        messages = [];
        return;
      }
      
      // Pastikan response adalah JSON
      if (!contentType || !contentType.includes('application/json')) {
        if (responseText.includes('ngrok') && responseText.includes('Visit Site')) {
          throw new Error('Ngrok warning page terdeteksi. Silakan akses URL backend di browser dulu.');
        }
        throw new Error('Backend tidak mengembalikan JSON response');
      }
      
      const data = JSON.parse(responseText);
      messages = Array.isArray(data) ? data : [];
      
    } catch (e) {
      if (e.name === 'AbortError') {
        error = 'Request timeout - backend mungkin lambat atau tidak responsif';
      } else {
        error = 'Error memuat riwayat: ' + e.message;
      }
      console.error('Load history error:', e);
    } finally {
      isLoading = false;
    }
  }

  async function sendMessage() {
    if (!userInput.trim() || !session || !backendConnected) return;
    
    const userMessage = { 
      user_text: userInput, 
      ai_response: null,
      from: 'user',
      temp_id: Date.now() // ID sementara untuk tracking
    };
    
    messages = [...messages, userMessage];
    const currentInput = userInput;
    userInput = '';
    isLoading = true;
    error = null;

    try {
      console.log('Sending message to:', `${BACKEND_URL}/chat`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout
      
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning
          'User-Agent': 'SAIAS-Frontend/1.0'
        },
        body: JSON.stringify({ message: currentInput }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('Chat response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      console.log('Chat response content-type:', contentType);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Chat error response:', responseText);
        
        // Handle ngrok warning page
        if (responseText.includes('ngrok') && responseText.includes('Visit Site')) {
          throw new Error('Ngrok warning page. Silakan buka URL backend di tab browser baru terlebih dahulu.');
        }
        
        // Cek apakah ini HTML error page
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
          throw new Error('Backend mengembalikan halaman error HTML. Periksa konfigurasi CORS atau URL backend.');
        }
        
        try {
          const errData = JSON.parse(responseText);
          throw new Error(errData.detail || `HTTP ${response.status}: Gagal mengirim pesan`);
        } catch (parseError) {
          throw new Error(`Backend error (${response.status}): ${responseText.substring(0, 100)}`);
        }
      }

      // Parse JSON response
      const responseText = await response.text();
      console.log('Raw chat response:', responseText.substring(0, 200));
      
      if (!responseText) {
        throw new Error('Backend mengembalikan response kosong');
      }
      
      // Pastikan response adalah JSON
      if (!contentType || !contentType.includes('application/json')) {
        if (responseText.includes('ngrok') && responseText.includes('Visit Site')) {
          throw new Error('Ngrok warning page terdeteksi. Silakan akses URL backend di browser terlebih dahulu.');
        }
        throw new Error('Backend tidak mengembalikan JSON response');
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.response) {
        throw new Error('Backend tidak mengembalikan response yang valid');
      }
      
      // Update message dengan respons AI
      const aiMessage = {
        user_text: currentInput,
        ai_response: data.response,
        created_at: new Date().toISOString()
      };
      
      // Replace temporary message dengan yang lengkap
      messages = messages.filter(m => m.temp_id !== userMessage.temp_id);
      messages = [...messages, aiMessage];

    } catch (e) {
      if (e.name === 'AbortError') {
        error = 'Request timeout - backend mungkin lambat atau overload';
      } else {
        error = 'Error mengirim pesan: ' + e.message;
      }
      
      console.error('Send message error:', e);
      
      // Hapus pesan user jika gagal
      messages = messages.filter(m => m.temp_id !== userMessage.temp_id);
      
      // Restore input jika gagal
      userInput = currentInput;
      
    } finally {
      isLoading = false;
    }
  }

  // Fungsi untuk handle Enter key
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
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
    <div class="flex items-center">
      <h1 class="text-2xl font-bold tracking-wider">SAIAS</h1>
      {#if session && backendConnected}
        <span class="ml-3 text-xs bg-green-600 text-white px-2 py-1 rounded-full">Online</span>
      {:else if session && !backendConnected}
        <span class="ml-3 text-xs bg-red-600 text-white px-2 py-1 rounded-full">Backend Offline</span>
      {/if}
    </div>
    
    {#if session}
      <div class="flex items-center">
        <span class="text-gray-400 mr-4 hidden sm:block text-sm">{session.user.email}</span>
        <button 
          on:click={handleLogout} 
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
        >
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
        <p class="text-gray-400 mb-8">Login dengan Google untuk memulai percakapan cerdas dengan SAIAS.</p>
        
        <!-- PERUBAHAN: Tombol dengan gradien dan efek hover -->
        <button 
          on:click={handleGoogleLogin} 
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto w-full"
        >
          <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.76 21.35,11.1 21.35,11.1V11.1Z" />
          </svg>
          Login dengan Google
        </button>

        {#if error}
          <div class="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg">
            <p class="text-red-300 text-sm">{error}</p>
          </div>
        {/if}
      </div>
      
    {:else if !backendConnected}
      <!-- Status koneksi backend -->
      <div class="text-center bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 class="text-2xl font-bold mb-4">Menghubungkan ke Backend...</h2>
        <p class="text-gray-400 mb-4">Sedang mencoba terhubung ke:</p>
        <code class="bg-gray-700 px-3 py-1 rounded text-sm break-all">{BACKEND_URL}</code>
        
        <button 
          on:click={checkBackendConnection}
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-full"
        >
          Coba Lagi
        </button>
        
        {#if error}
          <div class="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg">
            <p class="text-red-300 text-sm">{error}</p>
            
            {#if error.includes('ngrok warning')}
              <div class="mt-3 p-2 bg-blue-900/50 border border-blue-500 rounded text-xs">
                <p class="text-blue-300 font-semibold mb-2">🔧 Cara mengatasi ngrok warning:</p>
                <ol class="list-decimal list-inside text-blue-200 space-y-1">
                  <li>Buka URL backend ini di tab baru: <br/>
                    <a href="{BACKEND_URL}" target="_blank" class="text-blue-400 underline break-all">{BACKEND_URL}</a>
                  </li>
                  <li>Klik "Visit Site" di halaman ngrok</li>
                  <li>Kembali ke halaman ini dan klik "Coba Lagi"</li>
                </ol>
              </div>
            {/if}
            
            <button 
              on:click={() => error = null}
              class="text-xs text-red-400 hover:text-red-200 mt-2 underline"
            >
              Tutup
            </button>
          </div>
        {/if}
      </div>
      
    {:else}
      <!-- Tampilan Chat dengan gaya dark mode -->
      <div class="w-full max-w-4xl h-[80vh] bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-700">
        
        <!-- Chat Header -->
        <div class="p-4 bg-gray-700 rounded-t-2xl border-b border-gray-600">
          <h3 class="font-semibold text-lg">Chat dengan SAIAS</h3>
          <p class="text-gray-400 text-sm">AI Assistant oleh Ahmad Syaifuddin</p>
        </div>
        
        <!-- Messages Area -->
        <div class="flex-grow p-4 overflow-y-auto space-y-4" id="messages-container">
          {#if messages.length === 0 && !isLoading}
            <div class="text-center text-gray-400 mt-8">
              <p>👋 Mulai percakapan dengan mengirim pesan!</p>
              <p class="text-sm mt-2">Coba tanya: "Siapa Ahmad Syaifuddin?"</p>
            </div>
          {/if}
          
          {#each messages as msg, index (msg.id || index)}
            {#if msg.user_text}
              <div class="flex justify-end">
                <div class="bg-blue-600 text-white p-3 rounded-xl max-w-xs lg:max-w-md shadow-lg">
                  <p class="whitespace-pre-wrap">{msg.user_text}</p>
                  {#if msg.created_at}
                    <p class="text-xs text-blue-200 mt-1 opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  {/if}
                </div>
              </div>
            {/if}
            
            {#if msg.ai_response}
              <div class="flex justify-start">
                <div class="bg-gray-700 text-gray-200 p-3 rounded-xl max-w-xs lg:max-w-md shadow-lg">
                  <p class="whitespace-pre-wrap">{msg.ai_response}</p>
                  {#if msg.created_at}
                    <p class="text-xs text-gray-400 mt-1 opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
          
          {#if isLoading}
             <div class="flex justify-start">
                <div class="bg-gray-700 text-gray-200 p-3 rounded-xl">
                  <div class="flex items-center space-x-2">
                    <div class="animate-pulse flex space-x-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <span class="text-sm">SAIAS sedang mengetik...</span>
                  </div>
                </div>
              </div>
          {/if}
        </div>
        
        <!-- Input Area -->
        <div class="p-4 bg-gray-900/50 border-t border-gray-700 rounded-b-2xl">
          {#if error}
            <div class="mb-3 p-3 bg-red-900/50 border border-red-600 rounded-lg">
              <p class="text-red-300 text-sm">{error}</p>
              <button 
                on:click={() => error = null}
                class="text-xs text-red-400 hover:text-red-200 mt-1 underline"
              >
                Tutup
              </button>
            </div>
          {/if}
          
          <form on:submit|preventDefault={sendMessage} class="flex items-end space-x-3">
            <div class="flex-grow">
              <textarea
                bind:value={userInput}
                on:keydown={handleKeyPress}
                placeholder="Ketik pesan Anda... (Enter untuk kirim)"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                rows="1"
                disabled={isLoading}
                maxlength="1000"
              ></textarea>
            </div>
            
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg"
              disabled={isLoading || !userInput.trim()}
            >
              {#if isLoading}
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {:else}
                Kirim
              {/if}
            </button>
          </form>
          
          <div class="mt-2 flex justify-between text-xs text-gray-400">
            <span>Backend: {backendConnected ? 'Connected' : 'Disconnected'}</span>
            <span>{userInput.length}/1000</span>
          </div>
        </div>
      </div>
    {/if}
  </main>
  
  <!-- Footer -->
  <footer class="text-center p-4 text-gray-500 text-sm border-t border-gray-800">
    <p>&copy; 2024 SAIAS by Ahmad Syaifuddin. Powered by AI & Supabase.</p>
  </footer>
</div>