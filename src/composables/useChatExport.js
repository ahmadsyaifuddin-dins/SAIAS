import { ref } from 'vue';
import { useAlert } from '../lib/useAlert';
import { marked } from 'marked'; // <--- 1. Import library Markdown parser

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

  // 1. Export Markdown (Tetap sama, karena memang butuh mentahnya)
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

  // 2. Export HTML (Sekarang Render Markdown!)
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
          /* Base Dark Mode */
          body { background-color: #111827; color: #f3f4f6; font-family: sans-serif; }
          
          /* Styling Markdown hasil render */
          .prose h1, .prose h2, .prose h3 { color: #34d399; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
          .prose h1 { font-size: 1.5rem; }
          .prose h2 { font-size: 1.25rem; }
          .prose h3 { font-size: 1.1rem; }
          
          .prose p { margin-bottom: 0.8rem; line-height: 1.6; }
          
          .prose strong { color: #a7f3d0; font-weight: bold; }
          
          .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
          .prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
          
          .prose pre { background: #0f172a; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; border: 1px solid #374151; margin: 1rem 0; }
          .prose code { font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.1rem 0.3rem; border-radius: 0.2rem; color: #e5e7eb; }
          .prose pre code { background: transparent; padding: 0; color: inherit; }
          
          .prose blockquote { border-left: 4px solid #34d399; padding-left: 1rem; color: #9ca3af; font-style: italic; }
          .prose hr { border-color: #374151; margin: 1.5rem 0; }
          
          .prose a { color: #34d399; text-decoration: underline; }
        <` + `/style>
      <` + `/head>
      <body class="p-8 max-w-3xl mx-auto">
        <div class="mb-8 border-b border-gray-700 pb-4">
          <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">SAIAS Export</h1>
          <p class="text-gray-400 text-sm mt-1">${new Date().toLocaleString('id-ID')}</p>
          <p class="text-white mt-4 font-medium text-lg border-l-4 border-emerald-500 pl-3">${title}</p>
        </div>
        <div class="space-y-8">
    `;

    chatHistory.forEach(msg => {
      const isUser = msg.role === 'user';
      const align = isUser ? 'justify-end' : 'justify-start';
      // User bubble lebih solid, AI bubble lebih gelap
      const bg = isUser ? 'bg-emerald-600/90 text-white' : 'bg-gray-800 border border-gray-700 text-gray-200';
      
      // 2. PARSE MARKDOWN DISINI
      // Mengubah **bold** jadi <strong>bold</strong>, dll.
      const renderedContent = marked.parse(msg.content);

      html += `
        <div class="flex w-full ${align}">
          <div class="max-w-[90%] px-5 py-4 rounded-2xl ${bg} shadow-lg">
            <p class="text-xs uppercase tracking-wider opacity-70 mb-2 font-bold flex items-center gap-2">
              ${isUser ? '👤 You' : '🤖 SAIAS'}
            </p>
            <div class="prose text-sm leading-relaxed">${renderedContent}</div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div class="mt-12 text-center text-gray-500 text-xs border-t border-gray-800 pt-4">
          Exported from SAIAS v2.9.0 • Personal AI Assistant
        </div>
      </body>
      </html>`;

    downloadFile(html, 'saias-chat.html', 'text/html');
    showExportMenu.value = false;
  };

  return {
    showExportMenu,
    exportToMarkdown,
    exportToHTML
  };
}