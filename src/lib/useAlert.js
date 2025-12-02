import { reactive } from 'vue';

// State Global untuk Alert
export const alertState = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'info', // 'success', 'error', 'warning', 'info'
  isConfirm: false, // Apakah ini konfirmasi (Yes/No) atau cuma Alert (OK)
  resolvePromise: null, // Untuk menangani async/await pada confirm
});

// Fungsi Reset State
const resetAlert = () => {
  alertState.isOpen = false;
  alertState.title = '';
  alertState.message = '';
  alertState.type = 'info';
  alertState.isConfirm = false;
  alertState.resolvePromise = null;
};

// 1. Fungsi Pengganti alert() biasa
export const useAlert = (title, message, type = 'info') => {
  alertState.title = title;
  alertState.message = message;
  alertState.type = type;
  alertState.isConfirm = false;
  alertState.isOpen = true;
  
  // Return promise biar bisa di-await (opsional)
  return new Promise((resolve) => {
    alertState.resolvePromise = resolve;
  });
};

// 2. Fungsi Pengganti confirm()
// Cara pakainya nanti: if (await useConfirm('Judul', 'Pesan')) { ... }
export const useConfirm = (title, message, type = 'warning') => {
  alertState.title = title;
  alertState.message = message;
  alertState.type = type;
  alertState.isConfirm = true;
  alertState.isOpen = true;

  return new Promise((resolve) => {
    alertState.resolvePromise = resolve;
  });
};

// Fungsi Internal untuk tombol di UI
export const handleConfirm = () => {
  if (alertState.resolvePromise) alertState.resolvePromise(true);
  resetAlert();
};

export const handleCancel = () => {
  if (alertState.resolvePromise) alertState.resolvePromise(false);
  resetAlert();
};