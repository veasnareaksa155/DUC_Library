import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export const useBooksStore = defineStore('books', () => {
  const masterBooks = ref([]);
  const categories = ref([]);
  const currentBook = ref(null);
  const loading = ref(false);
  const error = ref('');

  // Filters
  const searchQuery = ref('');
  const selectedCategory = ref('all');
  const availableOnly = ref(false);

  const authStore = useAuthStore();

  // Ultra-fast instant client-side filtering for 60fps buttery smooth UI
  const books = computed(() => {
    let result = masterBooks.value;

    if (selectedCategory.value && selectedCategory.value !== 'all' && selectedCategory.value !== 'wishlist') {
      const catId = String(selectedCategory.value);
      result = result.filter(b => String(b.category_id) === catId);
    }

    if (availableOnly.value) {
      result = result.filter(b => b.copies_available > 0);
    }

    if (searchQuery.value && searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(b => 
        (b.title && String(b.title).toLowerCase().includes(q)) ||
        (b.author && String(b.author).toLowerCase().includes(q)) ||
        (b.isbn && String(b.isbn).toLowerCase().includes(q)) ||
        (b.description && String(b.description).toLowerCase().includes(q))
      );
    }

    return result;
  });

  async function fetchCategories() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/categories`);
      const data = await res.json();
      if (res.ok) {
        categories.value = data;
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }

  async function fetchBooks(forceLoader = false) {
    if (masterBooks.value.length === 0 || forceLoader) {
      loading.value = true;
    }
    error.value = '';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load books');

      masterBooks.value = data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchBookById(id) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Book not found');
      currentBook.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function addBook(bookData) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify(bookData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add book');
    await fetchBooks(true);
    return data;
  }

  async function updateBook(id, bookData) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify(bookData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update book');
    await fetchBooks(true);
    return data;
  }

  async function deleteBook(id) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete book');
    await fetchBooks(true);
    return data;
  }

  return {
    masterBooks,
    books,
    categories,
    currentBook,
    loading,
    error,
    searchQuery,
    selectedCategory,
    availableOnly,
    fetchCategories,
    fetchBooks,
    fetchBookById,
    addBook,
    updateBook,
    deleteBook
  };
});
