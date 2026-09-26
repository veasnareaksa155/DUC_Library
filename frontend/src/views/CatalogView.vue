<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-6 max-sm:px-2 max-sm:pb-20 max-sm:pt-3">
    <!-- Header -->
    <header class="mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{{ localeStore.t('catalog') }} Collection</h1>
        <p class="text-[0.95rem] text-[var(--text-secondary)]">{{ localeStore.t('catalogSubtitle') || 'Browse and filter the complete DUC University Library collection.' }}</p>
      </div>
    </header>

    <!-- Search & Filter Controls Section -->
    <section class="mb-10">
      <!-- Minimal Search Input -->
      <div class="relative w-full max-w-2xl mx-auto mb-8">
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
      <div class="flex flex-col gap-2.5 w-full">
        <!-- Tier 1: Parent Catalogs Bar -->
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
              <!-- All Books -->
              <button 
                @click="selectCategory('all')" 
                class="px-4 py-1.5 rounded-lg text-[0.85rem] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 max-sm:max-w-[160px] max-sm:truncate max-sm:px-3 max-sm:text-xs"
                :class="booksStore.selectedCategory === 'all' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm border-transparent' : 'bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'"
              >
                {{ localeStore.t('allCategories') }}
              </button>

              <!-- Parent Categories -->
              <button 
                v-for="parent in rootCategories" 
                :key="parent.id"
                @click="selectParentCategory(parent.id)"
                class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[0.85rem] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 max-sm:max-w-[180px] max-sm:truncate max-sm:px-3 max-sm:text-xs"
                :class="activeParentCategory?.id === parent.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm border-transparent' : 'bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'"
              >
                <span :style="(localeStore.currentLang === 'km' && parent.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">
                  {{ (localeStore.currentLang === 'km' && parent.name_km) ? parent.name_km : parent.name }}
                </span>
                <span class="opacity-60 text-[0.78rem]">({{ parent.total_book_count ?? parent.book_count ?? 0 }})</span>
                <ChevronDown v-if="booksStore.categories.some(c => String(c.parent_id) === String(parent.id))" :size="13" class="opacity-70 transition-transform duration-200" :class="activeParentCategory?.id === parent.id ? 'rotate-180' : ''" />
              </button>
            </div>

            <button @click="scrollCategories('right')" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer shrink-0 z-[2] transition-colors" title="Scroll Right">
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>

        <!-- Tier 2: Sub-Catalogs Bar (Appears when active parent has sub-categories) -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2 scale-98"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 -translate-y-2 scale-98"
        >
          <div v-if="activeParentCategory && activeParentSubcategories.length > 0" class="flex items-center gap-2 w-full pl-2 sm:pl-3 py-2 px-2.5 rounded-xl bg-slate-500/5 dark:bg-slate-500/10 border border-[var(--border-color)]/60">
            <div class="flex items-center gap-1.5 text-[0.78rem] font-bold text-[var(--accent-primary)] uppercase tracking-wider shrink-0 pl-1">
              <CornerDownRight :size="14" stroke-width="2.5" />
              <span class="hidden sm:inline">Sub-Catalogs:</span>
            </div>

            <button @click="scrollSubCategories('left')" class="inline-flex items-center justify-center w-7 h-7 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer shrink-0 transition-colors" title="Scroll Left">
              <ChevronLeft :size="14" />
            </button>

            <div 
              class="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden py-0.5 scroll-smooth flex-1 min-w-0 scrollbar-none" 
              ref="subCategoryScrollRef"
              @wheel.prevent="handleSubCategoryWheel"
            >
              <!-- "All in Parent" button -->
              <button 
                @click="selectCategory(activeParentCategory.id)" 
                class="px-3 py-1 rounded-lg text-[0.8rem] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200"
                :class="booksStore.selectedCategory === activeParentCategory.id ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'"
              >
                {{ localeStore.currentLang === 'km' ? 'ទាំងអស់ក្នុង ' + (activeParentCategory.name_km || activeParentCategory.name) : 'All in ' + activeParentCategory.name }} 
                <span class="opacity-70 text-[0.75rem] ml-1">({{ activeParentCategory.total_book_count ?? activeParentCategory.book_count ?? 0 }})</span>
              </button>

              <!-- Individual Sub-categories -->
              <button 
                v-for="sub in activeParentSubcategories" 
                :key="sub.id"
                @click="selectCategory(sub.id)"
                class="px-3 py-1 rounded-lg text-[0.8rem] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200"
                :class="booksStore.selectedCategory === sub.id ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'"
              >
                <span :style="(localeStore.currentLang === 'km' && sub.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">
                  {{ (localeStore.currentLang === 'km' && sub.name_km) ? sub.name_km : sub.name }}
                </span>
                <span class="opacity-70 text-[0.75rem] ml-1">({{ sub.total_book_count ?? sub.book_count ?? 0 }})</span>
              </button>
            </div>

            <button @click="scrollSubCategories('right')" class="inline-flex items-center justify-center w-7 h-7 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer shrink-0 transition-colors" title="Scroll Right">
              <ChevronRight :size="14" />
            </button>
          </div>
        </transition>
      </div>
    </section>

    <!-- Books Catalog Grid Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {{ activeParentCategory ? ((localeStore.currentLang === 'km' && activeParentCategory.name_km) ? activeParentCategory.name_km : activeParentCategory.name) : localeStore.t('allCatalogBooks') }}
            </h3>
            <div v-if="activeSubCategory" class="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold text-[1.1rem]">
              <ChevronRight :size="16" class="text-[var(--text-muted)]" />
              <span :style="(localeStore.currentLang === 'km' && activeSubCategory.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">
                {{ (localeStore.currentLang === 'km' && activeSubCategory.name_km) ? activeSubCategory.name_km : activeSubCategory.name }}
              </span>
            </div>
          </div>
          <span class="text-[0.75rem] font-semibold text-[var(--text-secondary)] bg-[var(--bg-card-hover)] px-2.5 py-1 rounded-md border border-[var(--border-color)]" v-if="!booksStore.loading">
            {{ displayedBooks.length }} {{ localeStore.t('booksAvailable') || 'books available' }}
          </span>
          <button v-if="activeParentCategory" @click="selectCategory('all')" class="text-[0.78rem] text-indigo-500 hover:underline font-semibold ml-1 cursor-pointer">
            {{ localeStore.currentLang === 'km' ? 'បង្ហាញទាំងអស់' : 'View All' }}
          </button>
        </div>
      </div>

      <div v-if="booksStore.loading" class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 max-sm:grid-cols-2 max-sm:gap-4 xl:grid-cols-5">
        <BookSkeleton v-for="i in 12" :key="i" />
      </div>

      <div v-else-if="displayedBooks.length === 0" class="flex flex-col items-center justify-center text-center p-14 text-[var(--text-muted)]">
        <BookX :size="48" class="text-[var(--text-muted)] mb-3" />
        <h3 class="text-lg font-bold text-[var(--text-primary)] mb-1">{{ localeStore.t('noBooksFound') }}</h3>
        <p class="text-[var(--text-secondary)]">{{ localeStore.t('noBooksSub') }}</p>
        <button @click="resetFilters" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm mt-4">{{ localeStore.t('resetFilters') }}</button>
      </div>

      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 max-sm:grid-cols-2 max-sm:gap-4 xl:grid-cols-5">
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
          {{ localeStore.t('showing') }} <strong class="text-[var(--text-primary)]">{{ (currentPage - 1) * itemsPerPage + 1 }}</strong> {{ localeStore.t('to') }} <strong class="text-[var(--text-primary)]">{{ Math.min(currentPage * itemsPerPage, displayedBooks.length) }}</strong> {{ localeStore.t('of') }} <strong class="text-[var(--text-primary)]">{{ displayedBooks.length }}</strong> {{ localeStore.t('entries') }}
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
  ChevronLeft, ChevronRight, ChevronDown, CornerDownRight 
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
const itemsPerPage = ref(15);

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

// Hierarchical Category Navigation
const subCategoryScrollRef = ref(null);

const rootCategories = computed(() => {
  return booksStore.categories.filter(c => !c.parent_id);
});

const activeParentCategory = computed(() => {
  if (!booksStore.selectedCategory || booksStore.selectedCategory === 'all' || booksStore.selectedCategory === 'wishlist') {
    return null;
  }
  let curr = booksStore.categories.find(c => String(c.id) === String(booksStore.selectedCategory));
  while (curr && curr.parent_id) {
    curr = booksStore.categories.find(c => String(c.id) === String(curr.parent_id));
  }
  return curr || null;
});

const activeParentSubcategories = computed(() => {
  if (!activeParentCategory.value) return [];
  return booksStore.categories.filter(c => String(c.parent_id) === String(activeParentCategory.value.id));
});

const activeSubCategory = computed(() => {
  if (!booksStore.selectedCategory || booksStore.selectedCategory === 'all' || booksStore.selectedCategory === 'wishlist') {
    return null;
  }
  if (activeParentCategory.value && String(booksStore.selectedCategory) === String(activeParentCategory.value.id)) {
    return null;
  }
  return booksStore.categories.find(c => String(c.id) === String(booksStore.selectedCategory)) || null;
});

function selectParentCategory(parentId) {
  booksStore.selectedCategory = parentId;
  booksStore.fetchBooks();
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

function scrollSubCategories(direction) {
  if (!subCategoryScrollRef.value) return;
  const scrollAmount = direction === 'left' ? -220 : 220;
  subCategoryScrollRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function handleSubCategoryWheel(e) {
  if (subCategoryScrollRef.value && e.deltaY !== 0) {
    subCategoryScrollRef.value.scrollLeft += e.deltaY;
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


