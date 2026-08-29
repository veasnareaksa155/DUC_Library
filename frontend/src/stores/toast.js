import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const isVisible = ref(false);
  const message = ref('');
  const title = ref('');
  const type = ref('success'); // 'success' | 'wishlist-add' | 'wishlist-remove' | 'info' | 'error'
  let timer = null;

  function show(msg, options = {}) {
    if (timer) clearTimeout(timer);
    message.value = msg;
    type.value = options.type || 'success';
    title.value = options.title || (type.value === 'error' ? 'Error' : 'Success!');
    isVisible.value = true;

    timer = setTimeout(() => {
      isVisible.value = false;
    }, options.duration || 3200);
  }

  function showWishlist(bookTitle, isAdded) {
    show(
      isAdded 
        ? `"${bookTitle}" has been saved to your collection.` 
        : `"${bookTitle}" was removed from your collection.`,
      {
        title: isAdded ? 'Saved to Collection' : 'Removed from Collection',
        type: isAdded ? 'wishlist-add' : 'wishlist-remove',
        duration: 3000
      }
    );
  }

  function showSuccess(msg, customTitle = 'Action Complete') {
    show(msg, { title: customTitle, type: 'success', duration: 3000 });
  }

  function showError(msg, customTitle = 'Error') {
    show(msg, { title: customTitle, type: 'error', duration: 4000 });
  }

  function hide() {
    isVisible.value = false;
    if (timer) clearTimeout(timer);
  }

  return {
    isVisible,
    message,
    title,
    type,
    show,
    showWishlist,
    showSuccess,
    showError,
    hide
  };
});
