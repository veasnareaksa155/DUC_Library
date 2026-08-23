<template>
  <div class="w-full max-w-7xl mx-auto py-5 px-6 pb-12 max-sm:px-3 max-sm:py-3 max-sm:pb-16">
    <!-- Featured Books Hero Slider Banner (Swiper) -->
    <section v-if="booksStore.loading" class="relative mb-6 w-full h-[320px] rounded-[var(--radius-xl)] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.4)] bg-[var(--bg-card)] border border-[var(--border-color)] animate-pulse max-lg:h-[250px] max-sm:h-[210px] max-[440px]:h-[205px]">
      <div class="absolute inset-0 bg-slate-800/50"></div>
    </section>
    <section v-else-if="featuredBooks.length > 0" class="relative mb-6 rounded-[var(--radius-xl)] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
      <Swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 4500, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :navigation="true"
        class="w-full h-[320px] bg-slate-900 max-lg:h-[250px] max-sm:h-[210px] max-[440px]:h-[205px] custom-swiper"
      >
        <SwiperSlide v-for="(slide, idx) in featuredBooks" :key="slide.id">
          <div class="relative w-full h-full flex items-center overflow-hidden">
            <div class="absolute inset-0">
              <img :src="getLibraryBg(idx)" :alt="slide.title" class="w-full h-full object-cover brightness-60 contrast-110 scale-105" />
              <div class="absolute inset-0 bg-gradient-to-r from-slate-900/[0.95] via-slate-900/75 to-slate-900/30"></div>
            </div>
            
            <div class="relative z-[2] py-[3rem] px-[4.5rem] pt-[2.5rem] max-w-[900px] w-full text-slate-50 max-lg:px-[3.6rem] max-lg:py-[2.4rem] max-lg:pt-[1.6rem] max-lg:max-w-[680px] max-sm:px-12 max-sm:py-8 max-sm:pt-4 max-[440px]:px-[2.6rem] max-[440px]:py-[1.8rem] max-[440px]:pt-[0.85rem]">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/[0.35] border border-indigo-200/50 text-indigo-100 text-[0.78rem] font-bold mb-2.5 max-sm:text-[0.68rem] max-sm:px-2 max-sm:py-1 max-sm:mb-1.5"><Sparkles :size="13" /> Featured Book #{{ idx + 1 }}</span>
              <h2 class="text-white text-[1.7rem] font-extrabold leading-[1.55] py-0.5 mb-1 line-clamp-2 max-lg:text-[1.45rem] max-sm:text-[1.12rem] max-sm:leading-relaxed max-sm:mb-1 max-[440px]:text-[1.05rem]">{{ slide.title }}</h2>

              <div class="flex gap-3 max-sm:gap-2 mt-4">
                <button @click="openReaderModal(slide)" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-4 py-2 text-sm px-5 py-2 text-[0.88rem] max-sm:px-3 max-sm:py-1.5 max-sm:text-[0.78rem]">
                  <BookOpenCheck :size="16" /> Read Book
                </button>
                <button @click="openBorrowModal(slide)" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm px-5 py-2 text-[0.88rem] bg-white/[0.18] border border-white/40 text-white backdrop-blur-md hover:bg-white/30 hover:text-white disabled:opacity-50 max-sm:px-3 max-sm:py-1.5 max-sm:text-[0.78rem]" :disabled="slide.copies_available <= 0">
                  <BookmarkPlus :size="16" /> Borrow
                </button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>

    <!-- Trending / Popular Books Horizontal Shelf ("កំពុងពេញនិយម") -->
    <section v-if="booksStore.loading" class="mt-6 mb-7">
      <div class="flex items-center gap-2.5 mb-3.5">
        <div class="h-6 w-32 bg-slate-800/60 rounded animate-pulse"></div>
      </div>
      <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        <div v-for="i in 6" :key="'skeleton-shelf-' + i" class="group flex-shrink-0 w-[130px] cursor-pointer transition-transform duration-250 ease-out hover:-translate-y-1">
          <div class="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-slate-800/50 mb-2 animate-pulse"></div>
          <div class="h-3 w-3/4 bg-slate-800/60 rounded mt-2 animate-pulse"></div>
          <div class="h-3 w-1/2 bg-slate-800/60 rounded mt-1 animate-pulse"></div>
        </div>
      </div>
    </section>
    <section v-else-if="featuredBooks.length > 0" class="mt-6 mb-7">
      <div class="flex items-center gap-2.5 mb-3.5">
        <h3 class="text-[1.15rem] font-extrabold text-[var(--text-primary)]">កំពុងពេញនិយម</h3>
        <span class="text-[0.7rem] font-bold text-purple-500 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full uppercase">Popular</span>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        <div 
          v-for="book in featuredBooks" 
          :key="'shelf-' + book.id" 
          class="group flex-shrink-0 w-[130px] cursor-pointer transition-transform duration-250 ease-out hover:-translate-y-1"
          @click="openReaderModal(book)"
        >
          <div class="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-slate-800 mb-2">
            <img :src="book.cover_url || fallbackCover" :alt="book.title" class="w-full h-full object-cover transition-transform duration-350 ease-out group-hover:scale-105" />
            <div class="absolute bottom-1.5 right-1.5 text-[0.65rem] font-bold bg-emerald-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full" :class="{ 'out-of-stock': book.copies_available <= 0 }">
              {{ book.copies_available > 0 ? `${book.copies_available} left` : 'Out' }}
            </div>
          </div>
          <h4 class="text-[0.82rem] font-bold text-[var(--text-primary)] leading-snug line-clamp-2 pt-1">{{ book.title }}</h4>
        </div>
      </div>
    </section>

    <!-- Search & Filter Controls Section -->
    <section class="mb-10 mt-8">
      <!-- Minimal Search Input -->
      <div class="relative w-full max-w-2xl mb-8 mx-auto">
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

    <!-- Books Catalog Grid -->
    <section class="catalog-section">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h3 class="text-xl font-bold text-[var(--text-primary)] tracking-tight">{{ booksStore.selectedCategory === 'wishlist' ? 'My Saved Wishlist' : localeStore.t('catalog') }}</h3>
          <span class="text-[0.75rem] font-semibold text-[var(--text-secondary)] bg-[var(--bg-card-hover)] px-2.5 py-1 rounded-md border border-[var(--border-color)]" v-if="!booksStore.loading">{{ displayedBooks.length }} books</span>
        </div>
      </div>
      <div v-if="booksStore.loading" class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 max-sm:grid-cols-2 max-sm:gap-3">
        <BookSkeleton v-for="i in 12" :key="i" />
      </div>

      <div v-else-if="displayedBooks.length === 0" class="flex flex-col items-center justify-center text-center p-14 text-[var(--text-muted)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <Heart v-if="booksStore.selectedCategory === 'wishlist'" :size="48" color="#ef4444" class="mb-3" />
        <BookX v-else :size="48" class="text-muted mb-3" />
        <h3 class="text-lg font-bold mb-1">{{ booksStore.selectedCategory === 'wishlist' ? 'Your Wishlist is Empty' : 'No books found' }}</h3>
        <p>{{ booksStore.selectedCategory === 'wishlist' ? 'Click the heart icon on any book card to save it to your wishlist.' : 'Try searching for a different keyword or select another category.' }}</p>
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
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { 
  Sparkles, Search, X, CheckCircle2, Loader2, BookX, Heart, Bell, Globe,
  ChevronLeft, ChevronRight, BookOpenCheck, BookmarkPlus 
} from 'lucide-vue-next';

const swiperModules = [Autoplay, Pagination, Navigation];
const booksStore = useBooksStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const wishlistStore = useWishlistStore();
const router = useRouter();

const displayedBooks = computed(() => {
  if (booksStore.selectedCategory === 'wishlist') {
    return booksStore.books.filter(b => wishlistStore.isInWishlist(b.id));
  }
  return booksStore.books;
});

const currentPage = ref(1);
const itemsPerPage = 12;

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(displayedBooks.value.length / itemsPerPage));
});

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
    const section = document.querySelector('.catalog-section');
    if (section) {
      // scroll to just above the catalog section (accounting for sticky header if any)
      const y = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return displayedBooks.value.slice(start, end);
});

watch(() => [booksStore.selectedCategory, booksStore.searchQuery], () => {
  currentPage.value = 1;
});

function showToast(msg) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 4000);
}

const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

// Curated atmospheric & aesthetic library architecture background photos for the featured banner card
const libraryBgs = [
  'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80'
];

function getLibraryBg(idx) {
  return libraryBgs[idx % libraryBgs.length];
}
const selectedBook = ref(null);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);
const toastMessage = ref('');

// Category Scroll Control
const categoryScrollRef = ref(null);

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

// Spotlight Search State
const isSearchFocused = ref(false);

const featuredBooks = computed(() => {
  if (!booksStore.masterBooks || booksStore.masterBooks.length === 0) return [];
  const manualFeatured = booksStore.masterBooks.filter(b => b.is_featured === 1 || b.is_featured === true);
  if (manualFeatured.length > 0) {
    return manualFeatured;
  }
  return booksStore.masterBooks.slice(0, 5);
});

let searchTimeout;

const searchInputRef = ref(null);

function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInputRef.value) {
      searchInputRef.value.focus();
    }
  }
}

onMounted(() => {
  booksStore.selectedCategory = 'all';
  booksStore.fetchCategories();
  booksStore.fetchBooks();
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
}

function handleSearch() {
  // Search is handled instantly via client-side computed property
}

function clearSearch() {
  booksStore.searchQuery = '';
  booksStore.fetchBooks();
}

function selectCategory(catId) {
  booksStore.selectedCategory = catId;
  booksStore.fetchBooks();
}

function resetFilters() {
  booksStore.searchQuery = '';
  booksStore.selectedCategory = 'all';
  booksStore.availableOnly = false;
  booksStore.fetchBooks();
}

function openReaderModal(book) {
  router.push(`/read/${book.id}`);
}

function openBorrowModal(book) {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/' } });
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
