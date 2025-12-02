import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Key belum disetting di .env!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- TAMBAHAN BARU ---

// Fungsi Login Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Nanti kalau sudah deploy, ganti jadi URL Vercel
      redirectTo: window.location.origin // Otomatis deteksi localhost:3000
    }
  })
  if (error) console.error("Login Error:", error)
}

// Fungsi Logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error("Logout Error:", error)
}