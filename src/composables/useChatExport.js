// src/composables/useChatExport.js
import { ref } from 'vue';
import { useAlert } from '../lib/useAlert';

export function useChatExport() {
  const showExportMenu = ref(false);

  // Helper: Download File
  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    useAlert("Berhasil", `Chat berhasil diexport ke ${filename}`, "success");
  };

  // 1. Export Markdown
  const exportToMarkdown = (chatHistory, title) => {
    if (!chatHistory.length) return;
    
    let content = `# Riwayat Chat SAIAS\n\n`;
    content += `**Topik:** ${title}\n`;
    content += `**Tanggal:** ${new Date().toLocaleString('id-ID')}\n\n---\n\n`;

    chatHistory.forEach(msg => {
      const role = msg.role === 'user' ? '🧑‍💻 User' : '🤖 SAIAS';
      content += `### ${role}:\n${msg.content}\n\n`;
    });

    downloadFile(content, 'saias-chat.md', 'text/markdown');
    showExportMenu.value = false;
  };

  // 2. Export HTML
  const exportToHTML = (chatHistory, title) => {
    if (!chatHistory.length) return;
    
    // Pecah string tag penutup agar tidak error di Vue Compiler
    let html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"><` + `/script>
        <style>
          body { background-color: #111827; color: #f3f4f6; font-family: sans-serif; }
          .prose pre { background: #1f2937; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
          .prose code { background: rgba(255,255,255,0.1); padding: 0.2rem; border-radius: 0.2rem; }
        <` + `/style>
      <` + `/head>
      <body class="p-8 max-w-3xl mx-auto">
        <div class="mb-8 border-b border-gray-700 pb-4">
          <h1 class="text-2xl font-bold text-emerald-400">SAIAS Export</h1>
          <p class="text-gray-400 text-sm">${new Date().toLocaleString('id-ID')}</p>
          <p class="text-white mt-2 font-medium">${title}</p>
        </div>
        <div class="space-y-6">
    `;

    chatHistory.forEach(msg => {
      const isUser = msg.role === 'user';
      const align = isUser ? 'justify-end' : 'justify-start';
      const bg = isUser ? 'bg-emerald-600' : 'bg-gray-800 border border-gray-700';
      
      html += `
        <div class="flex w-full ${align}">
          <div class="max-w-[85%] px-4 py-3 rounded-2xl ${bg}">
            <p class="text-xs text-gray-400 mb-1 font-bold">${isUser ? 'You' : 'SAIAS'}</p>
            <div class="prose text-sm leading-relaxed whitespace-pre-wrap">${msg.content}</div>
          </div>
        </div>
      `;
    });

    html += `</div></body></html>`;
    downloadFile(html, 'saias-chat.html', 'text/html');
    showExportMenu.value = false;
  };

  return {
    showExportMenu,
    exportToMarkdown,
    exportToHTML
  };
}