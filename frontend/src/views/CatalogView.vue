<template>
  <div class="catalog-page-container">
    <!-- Header -->
    <header class="catalog-page-header">
      <div class="header-text">
        <h1 class="page-title">{{ localeStore.t('catalog') }} <span class="text-gradient">Collection</span></h1>
        <p class="page-subtitle">Browse and filter the complete DUC University Library collection.</p>
      </div>
    </header>

    <!-- Search & Filter Controls Section -->
    <section class="search-filter-section">
      <!-- Spotlight Search Input -->
      <div class="spotlight-search-container">
        <div class="search-box-pill" :class="{ focused: isSearchFocused || booksStore.searchQuery }">
          <Search :size="19" class="search-icon" />
          <input 
            v-model="booksStore.searchQuery"
            @focus="isSearchFocused = true"
            @blur="handleSearchBlur"
            @input="handleSearch"
            type="text" 
            :placeholder="localeStore.t('searchPlaceholder')"
          />
          <span class="search-shortcut-hint">Ctrl + K</span>
          <button v-if="booksStore.searchQuery" @click="clearSearch" class="btn-clear" title="Clear Search">
            <X :size="16" />
          </button>
        </div>

        <!-- Live Quick Search Dropdown -->
        <transition name="fade">
          <div v-if="isSearchFocused && booksStore.searchQuery" class="live-search-dropdown glass-panel">
            <div v-if="booksStore.books.length > 0" class="live-results-list">
              <div class="live-results-header">
                <span>Found {{ booksStore.books.length }} matching books</span>
              </div>
              <div 
                v-for="book in booksStore.books.slice(0, 4)" 
                :key="book.id"
                @mousedown="openReaderModal(book)"
                class="live-result-item"
              >
                <img :src="book.cover_url || fallbackCover" :alt="book.title" class="live-thumb" />
                <div class="live-info">
                  <h4 class="live-title">{{ book.title }}</h4>
                </div>
                <button class="live-read-btn btn btn-primary btn-sm">Read</button>
              </div>
            </div>
            <div v-else class="live-empty-state">
              <BookX :size="24" class="text-muted" />
              <span>No books matching "{{ booksStore.searchQuery }}"</span>
            </div>
          </div>
        </transition>
      </div>

      <!-- Categories & Controls Row -->
      <div class="filter-controls-row">
        <div class="category-scroll-container">
          <button @click="scrollCategories('left')" class="cat-nav-btn cat-nav-left" title="Scroll Left">
            <ChevronLeft :size="16" />
          </button>

          <div 
            class="category-scroll" 
            ref="categoryScrollRef"
            @wheel.prevent="handleCategoryWheel"
          >
            <button 
              @click="selectCategory('all')" 
              class="cat-chip"
              :class="{ active: booksStore.selectedCategory === 'all' }"
            >
              {{ localeStore.t('allCategories') }}
            </button>
            <button 
              v-for="cat in booksStore.categories" 
              :key="cat.id"
              @click="selectCategory(cat.id)"
              class="cat-chip"
              :class="{ active: booksStore.selectedCategory === cat.id }"
            >
              {{ cat.name }} ({{ cat.book_count || 0 }})
            </button>
          </div>

          <button @click="scrollCategories('right')" class="cat-nav-btn cat-nav-right" title="Scroll Right">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </section>

    <!-- Success Toast Notification -->
    <div v-if="toastMessage" class="toast-alert glass-panel">
      <CheckCircle2 :size="20" class="text-success" />
      <span>{{ toastMessage }}</span>
      <button @click="toastMessage = ''" class="btn-close-toast"><X :size="16" /></button>
    </div>

    <!-- Books Catalog Grid Section -->
    <section class="catalog-section">
      <div class="catalog-header-row">
        <div class="catalog-title-group">
          <h3 class="catalog-heading">All Catalog Books</h3>
          <span class="catalog-count-badge" v-if="!booksStore.loading">{{ displayedBooks.length }} books available</span>
        </div>
      </div>

      <div v-if="booksStore.loading" class="loading-state">
        <Loader2 :size="36" class="spin" />
        <p>Loading library catalog...</p>
      </div>

      <div v-else-if="displayedBooks.length === 0" class="empty-state glass-panel">
        <BookX :size="48" class="text-muted" />
        <h3>No books found</h3>
        <p>Try searching for a different keyword or select another category.</p>
        <button @click="resetFilters" class="btn btn-secondary btn-sm mt-3">Reset Filters</button>
      </div>

      <div v-else class="books-grid">
        <BookCard 
          v-for="book in displayedBooks" 
          :key="book.id" 
          :book="book"
          @read="openReaderModal"
          @borrow="openBorrowModal"
          @toast="showToast"
        />
      </div>
    </section>

    <!-- Reader Modal -->
    <ReaderModal 
      :is-open="isReaderOpen" 
      :book="selectedBook" 
      @close="isReaderOpen = false"
      @borrow="openBorrowFromReader"
    />

    <!-- Borrow Modal -->
    <BorrowModal 
      :is-open="isBorrowOpen" 
      :book="selectedBook" 
      @close="isBorrowOpen = false"
      @success="handleBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useWishlistStore } from '../stores/wishlist';
import { useRouter } from 'vue-router';
import BookCard from '../components/BookCard.vue';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { 
  Search, X, CheckCircle2, Loader2, BookX, Heart,
  ChevronLeft, ChevronRight 
} from 'lucide-vue-next';

const booksStore = useBooksStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const wishlistStore = useWishlistStore();
const router = useRouter();

const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const selectedBook = ref(null);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);
const toastMessage = ref('');
const isSearchFocused = ref(false);

const categoryScrollRef = ref(null);

const displayedBooks = computed(() => {
  return booksStore.books;
});

onMounted(() => {
  booksStore.fetchCategories();
  booksStore.fetchBooks();
});

let searchTimeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    booksStore.fetchBooks();
  }, 300);
}

function clearSearch() {
  booksStore.searchQuery = '';
  booksStore.fetchBooks();
}

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
}

function selectCategory(catId) {
  booksStore.selectedCategory = catId;
  booksStore.fetchBooks();
}

function toggleAvailableOnly() {
  booksStore.availableOnly = !booksStore.availableOnly;
  booksStore.fetchBooks();
}

function resetFilters() {
  booksStore.searchQuery = '';
  booksStore.selectedCategory = 'all';
  booksStore.availableOnly = false;
  booksStore.fetchBooks();
}

function scrollCategories(direction) {
  if (!categoryScrollRef.value) return;
  const scrollAmount = direction === 'left' ? -220 : 220;
  categoryScrollRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function handleCategoryWheel(e) {
  if (categoryScrollRef.value && e.deltaY !== 0) {
    categoryScrollRef.value.scrollLeft += e.deltaY;
  }
}

function showToast(msg) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 4000);
}

function openReaderModal(book) {
  router.push(`/read/${book.id}`);
}

function openBorrowModal(book) {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/catalog' } });
    return;
  }
  selectedBook.value = book;
  isBorrowOpen.value = true;
}

function openBorrowFromReader(book) {
  isReaderOpen.value = false;
  openBorrowModal(book);
}

function handleBorrowSuccess(msg) {
  toastMessage.value = msg || 'Book borrowing request submitted successfully!';
  booksStore.fetchBooks();
  setTimeout(() => {
    toastMessage.value = '';
  }, 5000);
}
</script>

<style scoped>
.catalog-page-container {
  max-width: 1560px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 4rem;
}

.catalog-page-header {
  margin-bottom: 1.75rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.search-filter-section {
  margin-bottom: 2rem;
}

.spotlight-search-container {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto 1.5rem;
}

.search-box-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.35rem;
  border-radius: 9999px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-box-pill.focused {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.25), 0 12px 35px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.search-icon {
  color: #818cf8;
  flex-shrink: 0;
}

.search-box-pill input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-primary);
  padding: 0.2rem 0;
}

.search-shortcut-hint {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(125, 125, 125, 0.12);
  border: 1px solid var(--border-color);
  padding: 0.2rem 0.55rem;
  border-radius: 8px;
}

.btn-clear {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.live-search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  padding: 0.5rem;
}

.live-results-header {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  padding: 0.5rem 0.75rem;
  text-transform: uppercase;
}

.live-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s ease;
}

.live-result-item:hover {
  background: rgba(99, 102, 241, 0.12);
}

.live-thumb {
  width: 36px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}

.live-info {
  flex: 1;
}

.live-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.live-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.filter-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.category-scroll-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.category-scroll {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.4rem 0.25rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex: 1;
  min-width: 0;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.cat-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  flex-shrink: 0;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

.cat-chip {
  padding: 0.45rem 0.95rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-chip.active {
  background: var(--accent-gradient);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.stock-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.95rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.stock-toggle-btn.active {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #34d399;
}

.toast-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  margin-bottom: 1.5rem;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  border-radius: var(--radius-md);
}

.btn-close-toast {
  margin-left: auto;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}

.catalog-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}

.catalog-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.catalog-heading {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
}

.catalog-count-badge {
  font-size: 0.76rem;
  font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.6rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3.5rem 1rem;
  color: var(--text-muted);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .catalog-page-container {
    padding: 0.75rem 0.5rem 5rem;
  }
  .page-title {
    font-size: 1.5rem;
  }
  .cat-chip {
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.35rem 0.7rem;
    font-size: 0.75rem;
  }
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }
}
</style>
