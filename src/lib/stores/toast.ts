import { writable } from 'svelte/store';

// 원본 시스템과 동일한 토스트 상태 구조
export const toast = writable({
  message: '',
  type: 'info',
  visible: false
});

// 원본 toastStore.js와 정확히 동일한 showToast 함수
export function showToast(message = '알림', type = 'info') {
  toast.set({ message, type, visible: true });

  return new Promise(resolve => {
    setTimeout(() => {
      toast.update(t => ({ ...t, visible: false }));
      resolve();
    }, 1000);
  });
}