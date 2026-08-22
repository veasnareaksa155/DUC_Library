import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useWishlistStore = defineStore('wishlist', () => {
  const initialData = JSON.parse(localStorage.getItem('duc_wishlist') || '[]');
  const cleanedData = Array.isArray(initialData) ? initialData.filter(id => id != null).map(String) : [];
  const wishlistIds = ref(cleanedData);

  function saveToStorage() {
    localStorage.setItem('duc_wishlist', JSON.stringify(wishlistIds.value));
  }

  function isInWishlist(bookId) {
    if (!bookId) return false;
    return wishlistIds.value.includes(String(bookId));
  }

  function toggleWishlist(bookId) {
    if (!bookId) return false;
    const idStr = String(bookId);
    const index = wishlistIds.value.indexOf(idStr);

    if (index > -1) {
      wishlistIds.value.splice(index, 1);
      saveToStorage();
      return false; // Removed
    } else {
      wishlistIds.value.push(idStr);
      saveToStorage();
      return true; // Added
    }
  }

  const wishlistCount = computed(() => wishlistIds.value.length);

  return {
    wishlistIds,
    isInWishlist,
    toggleWishlist,
    wishlistCount
  };
});
