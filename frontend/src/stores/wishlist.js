import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';
import { useBooksStore } from './books';

export const useWishlistStore = defineStore('wishlist', () => {
  const initialData = JSON.parse(localStorage.getItem('duc_wishlist') || '[]');
  const cleanedData = Array.isArray(initialData) ? initialData.filter(id => id != null).map(String) : [];
  const wishlistIds = ref(cleanedData);

  function saveToStorage() {
    localStorage.setItem('duc_wishlist', JSON.stringify(wishlistIds.value));
  }

  function clearWishlist() {
    wishlistIds.value = [];
    localStorage.removeItem('duc_wishlist');
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
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return false;
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

    // Also update the book's global total wishlist_count instantly
    const booksStore = useBooksStore();
    const bookInStore = booksStore.masterBooks.find(b => String(b.id) === idStr);
    if (bookInStore) {
      if (!bookInStore.wishlist_count) bookInStore.wishlist_count = 0;
      bookInStore.wishlist_count += (isAdded ? 1 : -1);
      if (bookInStore.wishlist_count < 0) bookInStore.wishlist_count = 0;
    }
    
    if (booksStore.currentBook && String(booksStore.currentBook.id) === idStr) {
      if (!booksStore.currentBook.wishlist_count) booksStore.currentBook.wishlist_count = 0;
      booksStore.currentBook.wishlist_count += (isAdded ? 1 : -1);
      if (booksStore.currentBook.wishlist_count < 0) booksStore.currentBook.wishlist_count = 0;
    }

    // Background sync (fire and forget for instant UI)
    const authStore = useAuthStore();
    if (authStore.token) {
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/wishlists/toggle`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}` 
        },
        body: JSON.stringify({ book_id: idStr })
      }).catch(err => {
        console.error('Failed to sync wishlist to server', err);
      });
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
    fetchPopularBooks,
    clearWishlist
  };
});
