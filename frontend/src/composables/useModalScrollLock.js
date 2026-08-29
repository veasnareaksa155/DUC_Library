import { watch, onUnmounted } from 'vue';

let activeModals = 0;

export function useModalScrollLock(isOpenRef) {
  watch(isOpenRef, (isOpen) => {
    if (isOpen) {
      activeModals++;
      document.body.style.overflow = 'hidden';
    } else {
      activeModals = Math.max(0, activeModals - 1);
      if (activeModals === 0) {
        document.body.style.overflow = '';
      }
    }
  });

  onUnmounted(() => {
    if (isOpenRef.value) {
      activeModals = Math.max(0, activeModals - 1);
      if (activeModals === 0) {
        document.body.style.overflow = '';
      }
    }
  });
}
