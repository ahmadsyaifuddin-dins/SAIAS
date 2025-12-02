<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

// Fungsi untuk mengubah teks Markdown (*) menjadi HTML (<b>)
// Kita gunakan computed agar efisien (hanya render ulang kalau pesan berubah)
const formattedContent = computed(() => {
  return marked.parse(props.message.content);
});
</script>

<template>
  <div class="flex w-full mb-4" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <div 
      class="max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden"
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
/* CSS MANUAL UNTUK MEMPERCANTIK HASIL MARKDOWN */
/* Karena kita pakai Tailwind, style bawaan HTML (h1, ul, code) di-reset. Kita harus style ulang. */

.markdown-body p {
  margin-bottom: 0.75em;
}
.markdown-body p:last-child {
  margin-bottom: 0;
}
/* Style untuk Code Block (Kodingan) */
.markdown-body pre {
  background-color: #111827; /* Gray 900 */
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #374151;
  font-family: monospace;
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
  color: #e5e7eb; /* Gray 200 */
}
/* Style untuk List */
.markdown-body ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75em;
}
.markdown-body ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.75em;
}
/* Style untuk Bold & Italic */
.markdown-body strong {
  font-weight: 700;
  color: #a7f3d0; /* Emerald 200 */
}
.markdown-body a {
  color: #34d399; /* Emerald 400 */
  text-decoration: underline;
}
</style>