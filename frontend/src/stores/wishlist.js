import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export const useWishlistStore = defineStore('wishlist', () => {
  const initialData = JSON.parse(localStorage.getItem('duc_wishlist') || '[]');
  const cleanedData = Array.isArray(initialData) ? initialData.filter(id => id != null).map(String) : [];
  const wishlistIds = ref(cleanedData);

  function saveToStorage() {
    localStorage.setItem('duc_wishlist', JSON.stringify(wishlistIds.value));
  }

  async function fetchMyWishlist() {
    const authStore = useAuthStore();
    if (!authStore.token) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/wishlists/my`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        wishlistIds.value = data.map(String);
        saveToStorage();
      }
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    }
  }

  function isInWishlist(bookId) {
    if (!bookId) return false;
    return wishlistIds.value.includes(String(bookId));
  }

  async function toggleWishlist(bookId) {
    if (!bookId) return false;
    const idStr = String(bookId);
    const index = wishlistIds.value.indexOf(idStr);
    const isAdded = index === -1;

    // Optimistic UI update
    if (!isAdded) {
      wishlistIds.value.splice(index, 1);
    } else {
      wishlistIds.value.push(idStr);
    }
    saveToStorage();

    // Background sync
    const authStore = useAuthStore();
    if (authStore.token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/wishlists/toggle`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}` 
          },
          body: JSON.stringify({ book_id: idStr })
        });
      } catch (err) {
        console.error('Failed to sync wishlist to server', err);
        // Optionally revert local state if failed, but usually it's fine
      }
    }

    return isAdded;
  }

  const wishlistCount = computed(() => wishlistIds.value.length);

  // --- Admin Trends Caching ---
  const popularBooks = ref([]);
  
  async function fetchPopularBooks(force = false) {
    const authStore = useAuthStore();
    if (!authStore.isAdmin) return;
    
    // If not forcing and we already have data, skip fetching to act as a cache
    if (!force && popularBooks.value.length > 0) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/wishlists/popular`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      if (res.ok) {
        popularBooks.value = await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch popular wishlists', err);
    }
  }

  return {
    wishlistIds,
    isInWishlist,
    toggleWishlist,
    fetchMyWishlist,
    wishlistCount,
    popularBooks,
    fetchPopularBooks
  };
});
