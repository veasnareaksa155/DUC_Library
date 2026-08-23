<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-6 max-sm:px-2 max-sm:pb-20 max-sm:pt-3">
    <!-- Header -->
    <header class="mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{{ localeStore.t('catalog') }} Collection</h1>
        <p class="text-[0.95rem] text-[var(--text-secondary)]">Browse and filter the complete DUC University Library collection.</p>
      </div>
    </header>

    <!-- Search & Filter Controls Section -->
    <section class="mb-10">
      <!-- Minimal Search Input -->
      <div class="relative w-full max-w-2xl mb-8">
        <div class="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] shadow-sm transition-all duration-200" :class="{ 'ring-2 ring-indigo-500/20 border-indigo-500': isSearchFocused || booksStore.searchQuery }">
          <Search :size="18" class="text-[var(--text-secondary)] shrink-0 cursor-pointer" :class="{ 'text-indigo-500': isSearchFocused || booksStore.searchQuery }" @click="() => searchInputRef?.focus()" />
          <input 
            ref="searchInputRef"
            v-model="booksStore.searchQuery"
            @focus="isSearchFocused = true"
            @blur="handleSearchBlur"
            @input="handleSearch"
            type="text" 
            :placeholder="localeStore.t('searchPlaceholder')"
            class="flex-1 bg-transparent border-none outline-none text-[0.95rem] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <span class="text-[0.7rem] font-bold text-[var(--text-muted)] bg-[var(--bg-card-hover)] px-2 py-1 rounded border border-[var(--border-color)]">Ctrl K</span>
          <button v-if="booksStore.searchQuery" @click="clearSearch" class="bg-transparent border-none text-[var(--text-secondary)] cursor-pointer p-1 hover:text-[var(--text-primary)] flex items-center" title="Clear Search">
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Categories & Controls Row -->
      <div class="flex items-center justify-between gap-4 w-full">
        <div class="flex items-center gap-2 flex-1 min-w-0 max-sm:w-full">
          <button @click="scrollCategories('left')" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer shrink-0 z-[2] transition-colors" title="Scroll Left">
            <ChevronLeft :size="16" />
          </button>

          <div 
            class="flex items-center gap-2 overflow-x-auto overflow-y-hidden py-1 scroll-smooth flex-1 min-w-0 scrollbar-none" 
            ref="categoryScrollRef"
            @wheel.prevent="handleCategoryWheel"
          >
            <button 
              @click="selectCategory('all')" 
              class="px-4 py-1.5 rounded-md text-[0.85rem] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors max-sm:max-w-[160px] max-sm:truncate max-sm:px-3 max-sm:text-xs"
              :class="booksStore.selectedCategory === 'all' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'"
            >
              {{ localeStore.t('allCategories') }}
            </button>
            <button 
              v-for="cat in booksStore.categories" 
              :key="cat.id"
              @click="selectCategory(cat.id)"
              class="px-4 py-1.5 rounded-md text-[0.85rem] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors max-sm:max-w-[160px] max-sm:truncate max-sm:px-3 max-sm:text-xs"
              :class="booksStore.selectedCategory === cat.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'"
            >
              {{ cat.name }} <span class="opacity-60 ml-1">({{ cat.book_count || 0 }})</span>
            </button>
          </div>

          <button @click="scrollCategories('right')" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer shrink-0 z-[2] transition-colors" title="Scroll Right">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </section>


    <!-- Books Catalog Grid Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h3 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">All Catalog Books</h3>
          <span class="text-[0.75rem] font-semibold text-[var(--text-secondary)] bg-[var(--bg-card-hover)] px-2.5 py-1 rounded-md border border-[var(--border-color)]" v-if="!booksStore.loading">{{ displayedBooks.length }} books available</span>
        </div>
      </div>

      <div v-if="booksStore.loading" class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 max-sm:grid-cols-2 max-sm:gap-3">
        <BookSkeleton v-for="i in 12" :key="i" />
      </div>

      <div v-else-if="displayedBooks.length === 0" class="flex flex-col items-center justify-center text-center p-14 text-[var(--text-muted)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <BookX :size="48" class="text-muted mb-3" />
        <h3 class="text-lg font-bold mb-1">No books found</h3>
        <p>Try searching for a different keyword or select another category.</p>
        <button @click="resetFilters" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm mt-4">Reset Filters</button>
      </div>

      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 max-sm:grid-cols-2 max-sm:gap-3">
        <BookCard 
          v-for="book in paginatedBooks" 
          :key="book.id" 
          :book="book"
          @read="openReaderModal"
          @borrow="openBorrowModal"
          @toast="showToast"
        />
      </div>

      <!-- Smart Pagination Controls -->
      <div v-if="totalPages > 1 && !booksStore.loading" class="mt-14 flex flex-col items-center justify-center gap-4">
        <div class="flex items-center gap-2">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
            title="Previous Page"
          >
            <ChevronLeft :size="18" />
          </button>
          
          <div class="flex items-center gap-1">
            <template v-for="(page, index) in visiblePages" :key="index">
              <span v-if="page === '...'" class="w-6 text-center text-[var(--text-muted)] select-none font-bold">...</span>
              <button 
                v-else
                @click="goToPage(page)"
                class="flex items-center justify-center w-9 h-9 rounded-md text-[0.85rem] font-bold transition-colors cursor-pointer border"
                :class="currentPage === page ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color)]'"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
            title="Next Page"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
        <div class="text-[0.85rem] text-[var(--text-secondary)] font-medium">
          Showing <strong class="text-[var(--text-primary)]">{{ (currentPage - 1) * itemsPerPage + 1 }}</strong> to <strong class="text-[var(--text-primary)]">{{ Math.min(currentPage * itemsPerPage, displayedBooks.length) }}</strong> of <strong class="text-[var(--text-primary)]">{{ displayedBooks.length }}</strong> entries
        </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useWishlistStore } from '../stores/wishlist';
import { useRouter } from 'vue-router';
import BookCard from '../components/BookCard.vue';
import BookSkeleton from '../components/BookSkeleton.vue';
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
const searchInputRef = ref(null);

const displayedBooks = computed(() => {
  return booksStore.books;
});

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Computed for pagination
const totalPages = computed(() => Math.ceil(displayedBooks.value.length / itemsPerPage.value));

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return displayedBooks.value.slice(start, end);
});

// Smart page numbers calculation
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 1; // Number of pages to show before and after current
  
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  const range = [];
  const rangeWithDots = [];
  let l;
  
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  
  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  
  return rangeWithDots;
});

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Reset pagination on filters change
watch([() => booksStore.searchQuery, () => booksStore.selectedCategory, () => booksStore.availableOnly], () => {
  currentPage.value = 1;
});

function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInputRef.value) {
      searchInputRef.value.focus();
    }
  }
}

onMounted(() => {
  booksStore.fetchCategories();
  booksStore.fetchBooks();
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

let searchTimeout;
function handleSearch() {
  // Search is handled instantly via client-side computed property
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

function handleBorrowSuccess() {
  booksStore.fetchBooks();
}
</script>


