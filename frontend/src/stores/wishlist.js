import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useWishlistStore = defineStore('wishlist', () => {
  const wishlistIds = ref(JSON.parse(localStorage.getItem('duc_wishlist') || '[]'));

  function saveToStorage() {
    localStorage.setItem('duc_wishlist', JSON.stringify(wishlistIds.value));
  }

  function isInWishlist(bookId) {
    if (!bookId) return false;
    return wishlistIds.value.includes(Number(bookId)) || wishlistIds.value.includes(String(bookId));
  }

  function toggleWishlist(bookId) {
    if (!bookId) return false;
    const idNum = Number(bookId);
    const index = wishlistIds.value.indexOf(idNum);

    if (index > -1) {
      wishlistIds.value.splice(index, 1);
      saveToStorage();
      return false; // Removed
    } else {
      wishlistIds.value.push(idNum);
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
