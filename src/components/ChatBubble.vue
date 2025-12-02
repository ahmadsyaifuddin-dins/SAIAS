<script setup>
import { computed, ref, onMounted, onUpdated } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const bubbleRef = ref(null);

// Konversi Markdown ke HTML
const formattedContent = computed(() => {
  return marked.parse(props.message.content);
});

// --- LOGIKA TOMBOL COPY ---
const addCopyButtons = () => {
  if (!bubbleRef.value) return;

  // Cari semua blok kode (pre) di dalam bubble ini
  const preBlocks = bubbleRef.value.querySelectorAll('pre');

  preBlocks.forEach((pre) => {
    // Cek kalau tombol sudah ada (biar gak double)
    if (pre.parentNode.classList.contains('code-wrapper')) return;

    // 1. Buat Wrapper (Bungkus) biar tombol bisa diposisikan absolute
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper relative group';
    
    // Pindahkan <pre> ke dalam wrapper
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // 2. Buat Tombol Copy
    const button = document.createElement('button');
    button.className = 'absolute top-2 right-2 p-1.5 rounded bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
    `;
    button.title = "Salin Kode";

    // 3. Logic Klik Salin
    button.addEventListener('click', () => {
      const codeText = pre.innerText; // Ambil teks kode
      navigator.clipboard.writeText(codeText); // Salin ke clipboard

      // Efek Feedback (Ganti Icon Checklist)
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      
      // Balikin icon setelah 2 detik
      setTimeout(() => {
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      }, 2000);
    });

    wrapper.appendChild(button);
  });
};

// Jalankan fungsi saat komponen dipasang atau diupdate
onMounted(addCopyButtons);
onUpdated(addCopyButtons);
</script>

<template>
  <div class="flex w-full mb-4" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <div 
      ref="bubbleRef"
      class="max-w-[90%] md:max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden"
      :class="[
        message.role === 'user' 
          ? 'bg-emerald-600 text-white rounded-br-sm' 
          : 'bg-gray-700 text-gray-100 rounded-bl-sm border border-gray-600'
      ]"
    >
      <div class="markdown-body" v-html="formattedContent"></div>
    </div>
  </div>
</template>

<style>
/* CSS Markdown (Sama kayak sebelumnya + Sedikit perbaikan Pre) */
.markdown-body p { margin-bottom: 0.75em; }
.markdown-body p:last-child { margin-bottom: 0; }

.markdown-body pre {
  background-color: #111827 !important; /* Hitam pekat */
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #374151;
  font-family: monospace;
  position: relative; /* Penting buat tombol copy absolute */
}

.markdown-body code {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
  color: #e5e7eb;
}

.markdown-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75em; }
.markdown-body ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75em; }
.markdown-body strong { font-weight: 700; color: #a7f3d0; }
.markdown-body a { color: #34d399; text-decoration: underline; }
</style>