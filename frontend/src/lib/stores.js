import { writable, get } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';

// --- Konfigurasi ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- PENAMBAHAN BARU: Logika untuk localStorage ---
const CHAT_HISTORY_KEY = 'saias_chat_history';
const initialMessages = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]');

// --- Writable Stores (State Aplikasi) ---
export const session = writable(null);
export const messages = writable(initialMessages); // Load initial messages dari localStorage
export const conversations = writable([]);
export const activeConversationId = writable(null); // ID percakapan yang sedang aktif
export const userInput = writable('');
export const isLoading = writable(false);
export const error = writable(null);
export const backendConnected = writable(false);

// --- PENAMBAHAN BARU: Simpan otomatis ke localStorage setiap kali messages berubah ---
messages.subscribe(value => {
  // Hanya simpan jika ada sesi login
  if (get(session)) {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(value));
  }
});

export async function loadConversations() {
  const currentSession = get(session);
  if (!currentSession) return;
  
  try {
      const response = await fetch(`${BACKEND_URL}/conversations`, {
          headers: {
              'Authorization': `Bearer ${currentSession.access_token}`,
              'ngrok-skip-browser-warning': 'true'
          }
      });
      
      if (!response.ok) {
        // Jika endpoint tidak ada (404), set conversations kosong tanpa error
        if (response.status === 404) {
          conversations.set([]);
          console.log('Conversations endpoint not available, using empty list');
          return;
        }
        throw new Error(`Failed to load conversations: ${response.status}`);
      }
      
      const data = await response.json();
      conversations.set(Array.isArray(data) ? data : []);
      console.log(`Loaded ${Array.isArray(data) ? data.length : 0} conversations`);
      
  } catch (e) {
      // Jangan set error untuk network issues dengan conversations
      if (e.message.includes('404') || e.message.includes('fetch')) {
        console.warn('Conversations feature not available:', e.message);
      } else {
        console.error('Error loading conversations:', e.message);
      }
      conversations.set([]);
  }
}

export async function selectConversation(id) {
  activeConversationId.set(id);
  messages.set([]); // Kosongkan pesan saat berpindah
  isLoading.set(true);
  const currentSession = get(session);
  try {
      const response = await fetch(`${BACKEND_URL}/conversations/${id}`, {
          headers: {
              'Authorization': `Bearer ${currentSession.access_token}`,
              'ngrok-skip-browser-warning': 'true'
          }
      });
      if (!response.ok) {
        if (response.status === 404) {
          error.set('Percakapan tidak ditemukan atau endpoint tidak tersedia');
          return;
        }
        throw new Error('Gagal memuat pesan');
      }
      const data = await response.json();
      messages.set(Array.isArray(data) ? data : []);
  } catch (e) {
      error.set(e.message);
  } finally {
      isLoading.set(false);
  }
}

export function startNewChat() {
  activeConversationId.set(null);
  messages.set([]);
  userInput.set('');
  error.set(null); // Reset error saat memulai chat baru
}

// --- Fungsi Inti ---

export async function checkBackendConnection() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (data.status === 'healthy') {
      backendConnected.set(true);
      await loadHistory(); // Muat riwayat terbaru setelah konek
      // Coba load conversations, tapi jangan error jika tidak ada
      try {
        await loadConversations();
      } catch (e) {
        console.log('Conversations feature not available:', e.message);
      }
    } else {
      throw new Error('Backend tidak sehat.');
    }
  } catch (e) {
    backendConnected.set(false);
    error.set(`Tidak dapat terhubung ke backend. Menampilkan riwayat dari cache. Error: ${e.message}`);
  }
}

export async function handleGoogleLogin() {
  await supabase.auth.signInWithOAuth({ provider: 'google' });
}

export async function handleLogout() {
  // --- PENAMBAHAN BARU: Hapus riwayat dari localStorage saat logout ---
  localStorage.removeItem(CHAT_HISTORY_KEY);
  messages.set([]);
  conversations.set([]);
  activeConversationId.set(null);
  await supabase.auth.signOut();
}

export async function loadHistory() {
  const currentSession = get(session);
  if (!currentSession || !get(backendConnected)) return;
  
  // Jika ada active conversation, jangan load history umum
  if (get(activeConversationId)) return;
  
  try {
    const response = await fetch(`${BACKEND_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${currentSession.access_token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    messages.set(Array.isArray(data) ? data : []); // Ini akan otomatis update localStorage juga
  } catch (e) {
    error.set('Gagal memuat riwayat terbaru: ' + e.message);
  }
}

// Fungsi helper untuk streaming effect (opsional)
async function streamMessage(aiResponse) {
  let displayedText = '';
  const words = aiResponse.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    displayedText += (i > 0 ? ' ' : '') + words[i];
    messages.update(currentMessages => {
      // Pastikan ada pesan AI untuk diupdate
      if (currentMessages.length > 0) {
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (!lastMessage.ai_response || lastMessage.ai_response === '') {
          lastMessage.ai_response = displayedText;
        }
      }
      return [...currentMessages];
    });
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

export async function sendMessage() {
  const currentInput = get(userInput);
  const currentSession = get(session);
  if (!currentInput.trim() || !currentSession || !get(backendConnected)) return;

  // Buat pesan optimistik untuk UI
  const optimisticMessage = { 
    user_text: currentInput, 
    ai_response: '', // Placeholder untuk AI response
    created_at: new Date().toISOString() 
  };

  messages.update(m => [...m, optimisticMessage]);
  userInput.set('');
  isLoading.set(true);
  error.set(null);

  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentSession.access_token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ 
        message: currentInput,
        conversation_id: get(activeConversationId) // Kirim conversation_id jika ada
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Gagal mengirim pesan');
    }

    const data = await response.json();
    
    // Update pesan dengan response dari server
    messages.update(currentMessages => {
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage.user_text === currentInput) {
        lastMessage.ai_response = data.ai_response || data.response || '';
        lastMessage.id = data.id;
        lastMessage.created_at = data.created_at || lastMessage.created_at;
      }
      return [...currentMessages];
    });

    // Jika ini chat baru dan sekarang ada conversation_id, update activeConversationId
    if (!get(activeConversationId) && data.conversation_id) {
      activeConversationId.set(data.conversation_id);
      // Reload conversations list untuk menampilkan chat baru
      await loadConversations();
    }

    // Optional: Tambahkan streaming effect
    if (data.ai_response || data.response) {
      await streamMessage(data.ai_response || data.response);
    }

  } catch (e) {
    error.set('Error mengirim pesan: ' + e.message);
    // Hapus pesan optimistik jika gagal
    messages.update(m => m.filter(msg => 
      !(msg.user_text === currentInput && msg.ai_response === '')
    ));
  } finally {
    isLoading.set(false);
  }
}

// --- Inisialisasi Otentikasi ---
supabase.auth.getSession().then(({ data }) => {
  session.set(data.session);
  if (data.session) {
    checkBackendConnection();
  } else {
    // Jika tidak ada sesi, pastikan localStorage juga bersih
    localStorage.removeItem(CHAT_HISTORY_KEY);
    messages.set([]);
    conversations.set([]);
    activeConversationId.set(null);
  }
});

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.set(newSession);
  if (newSession) {
    checkBackendConnection();
  } else {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    messages.set([]);
    conversations.set([]);
    activeConversationId.set(null);
    backendConnected.set(false);
  }
});