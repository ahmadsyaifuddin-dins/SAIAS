import { writable, get } from 'svelte/store';
import { createClient } from '@supabase/supabase-js';

// --- Konfigurasi ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Writable Stores (State Aplikasi) ---
export const session = writable(null);
export const messages = writable([]);
export const userInput = writable('');
export const isLoading = writable(false);
export const error = writable(null);
export const backendConnected = writable(false);

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
      loadHistory();
    } else {
      throw new Error('Backend tidak sehat.');
    }
  } catch (e) {
    backendConnected.set(false);
    error.set(`Tidak dapat terhubung ke backend. Pastikan URL di .env.local sudah benar dan Colab berjalan. Error: ${e.message}`);
  }
}

export async function handleGoogleLogin() {
  await supabase.auth.signInWithOAuth({ provider: 'google' });
}

export async function handleLogout() {
  await supabase.auth.signOut();
}

export async function loadHistory() {
  const currentSession = get(session);
  if (!currentSession || !get(backendConnected)) return;
  try {
    const response = await fetch(`${BACKEND_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${currentSession.access_token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    messages.set(Array.isArray(data) ? data : []);
  } catch (e) {
    error.set('Gagal memuat riwayat: ' + e.message);
  }
}

async function streamMessage(aiResponse) {
  let displayedText = '';
  const words = aiResponse.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    displayedText += (i > 0 ? ' ' : '') + words[i];
    messages.update(currentMessages => {
      currentMessages[currentMessages.length - 1].ai_response = displayedText;
      return currentMessages;
    });
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export async function sendMessage() {
  const currentInput = get(userInput);
  const currentSession = get(session);
  if (!currentInput.trim() || !currentSession || !get(backendConnected)) return;

  messages.update(m => [...m, { user_text: currentInput, created_at: new Date().toISOString() }]);
  userInput.set('');
  isLoading.set(true);

  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentSession.access_token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ message: currentInput })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Gagal mengirim pesan');
    }

    const data = await response.json();
    
    messages.update(m => [...m, { ai_response: '', created_at: new Date().toISOString() }]);
    isLoading.set(false);
    streamMessage(data.response);

  } catch (e) {
    error.set('Error mengirim pesan: ' + e.message);
    messages.update(m => m.filter(msg => msg.user_text !== currentInput));
    isLoading.set(false);
  }
}

// --- Inisialisasi Otentikasi ---
supabase.auth.getSession().then(({ data }) => {
  session.set(data.session);
  if (data.session) checkBackendConnection();
});

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.set(newSession);
  if (newSession) {
    checkBackendConnection();
  } else {
    messages.set([]);
    backendConnected.set(false);
  }
});
