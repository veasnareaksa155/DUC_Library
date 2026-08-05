<template>
  <div class="home-container">
    <!-- Featured Books Hero Slider Banner -->
    <section v-if="featuredBooks.length > 0" class="featured-slider-section">
      <div 
        class="slider-viewport"
        :class="{ dragging: isDragging }"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @touchstart="handleSliderTouchStart"
        @touchend="handleSliderTouchEnd"
      >
        <div 
          class="slider-track" 
          :style="{ transform: `translateX(-${currentSlideIndex * 100}%)` }"
        >
          <div 
            v-for="(slide, idx) in featuredBooks" 
            :key="slide.id" 
            class="slider-card"
          >
            <div class="slide-image-wrapper">
              <img :src="getLibraryBg(idx)" :alt="slide.title" class="slide-bg-img" />
              <div class="slide-overlay-gradient"></div>
            </div>
            
            <div class="slide-content">
              <span class="slide-badge"><Sparkles :size="13" /> Featured Book #{{ idx + 1 }}</span>
              <h2 class="slide-title">{{ slide.title }}</h2>

              <div class="slide-actions">
                <button @click="openReaderModal(slide)" class="btn btn-primary btn-sm">
                  <BookOpenCheck :size="16" /> Read Book
                </button>
                <button @click="openBorrowModal(slide)" class="btn btn-secondary btn-sm" :disabled="slide.copies_available <= 0">
                  <BookmarkPlus :size="16" /> Borrow
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider Arrow Controls -->
        <button @click="prevSlide" class="slider-arrow prev-arrow" title="Previous Slide">
          <ChevronLeft :size="20" />
        </button>
        <button @click="nextSlide" class="slider-arrow next-arrow" title="Next Slide">
          <ChevronRight :size="20" />
        </button>

        <!-- Slider Indicators -->
        <div class="slider-dots">
          <span 
            v-for="(_, idx) in featuredBooks" 
            :key="idx"
            @click="goToSlide(idx)"
            class="dot"
            :class="{ active: currentSlideIndex === idx }"
          ></span>
        </div>
      </div>
    </section>

    <!-- Trending / Popular Books Horizontal Shelf ("កំពុងពេញនិយម") -->
    <section v-if="featuredBooks.length > 0" class="trending-shelf-section">
      <div class="shelf-header">
        <h3 class="shelf-title">កំពុងពេញនិយម</h3>
        <span class="shelf-badge">Popular</span>
      </div>

      <div class="shelf-scroll-row">
        <div 
          v-for="book in featuredBooks" 
          :key="'shelf-' + book.id" 
          class="shelf-card"
          @click="openReaderModal(book)"
        >
          <div class="shelf-cover-wrapper">
            <img :src="book.cover_url || fallbackCover" :alt="book.title" class="shelf-cover-img" />
            <div class="shelf-badge-tag" :class="{ 'out-of-stock': book.copies_available <= 0 }">
              {{ book.copies_available > 0 ? `${book.copies_available} left` : 'Out' }}
            </div>
          </div>
          <h4 class="shelf-book-title">{{ book.title }}</h4>
        </div>
      </div>
    </section>

    <!-- Top Mini App Header & Spotlight Live Search Bar -->
    <section class="home-top-bar">
      <!-- Spotlight Search Bar Container -->
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

        <!-- Live Quick Search Dropdown Results -->
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

      <!-- Category Filter Pills & Stock Checkbox -->
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

    <!-- Success / Info Alert Notification -->
    <div v-if="toastMessage" class="toast-alert glass-panel">
      <CheckCircle2 :size="20" class="text-success" />
      <span>{{ toastMessage }}</span>
      <button @click="toastMessage = ''" class="btn-close-toast"><X :size="16" /></button>
    </div>

    <!-- Books Catalog Grid -->
    <section class="catalog-section">
      <div class="catalog-header-row">
        <div class="catalog-title-group">
          <h3 class="catalog-heading">{{ booksStore.selectedCategory === 'wishlist' ? 'My Saved Wishlist' : localeStore.t('catalog') }}</h3>
          <span class="catalog-count-badge" v-if="!booksStore.loading">{{ displayedBooks.length }} books</span>
        </div>
      </div>
      <div v-if="booksStore.loading" class="loading-state">
        <Loader2 :size="36" class="spin" />
        <p>Loading library catalog...</p>
      </div>

      <div v-else-if="displayedBooks.length === 0" class="empty-state glass-panel">
        <Heart v-if="booksStore.selectedCategory === 'wishlist'" :size="48" color="#ef4444" />
        <BookX v-else :size="48" class="text-muted" />
        <h3>{{ booksStore.selectedCategory === 'wishlist' ? 'Your Wishlist is Empty' : 'No books found' }}</h3>
        <p>{{ booksStore.selectedCategory === 'wishlist' ? 'Click the heart icon on any book card to save it to your wishlist.' : 'Try searching for a different keyword or select another category.' }}</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useWishlistStore } from '../stores/wishlist';
import { useRouter } from 'vue-router';
import BookCard from '../components/BookCard.vue';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { 
  Sparkles, Search, X, CheckCircle2, Loader2, BookX, Heart, Bell, Globe,
  ChevronLeft, ChevronRight, BookOpenCheck, BookmarkPlus 
} from 'lucide-vue-next';

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

// Featured Slider State
const currentSlideIndex = ref(0);
let sliderTimer = null;
let touchStartX = 0;
let touchEndX = 0;

const featuredBooks = computed(() => {
  if (!booksStore.books || booksStore.books.length === 0) return [];
  const manualFeatured = booksStore.books.filter(b => b.is_featured === 1 || b.is_featured === true);
  if (manualFeatured.length > 0) {
    return manualFeatured;
  }
  return booksStore.books.slice(0, 5);
});

let searchTimeout;

onMounted(() => {
  booksStore.selectedCategory = 'all';
  booksStore.fetchCategories();
  booksStore.fetchBooks();
  startSliderAutoPlay();
});

onUnmounted(() => {
  stopSliderAutoPlay();
});

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
}

function startSliderAutoPlay() {
  stopSliderAutoPlay();
  sliderTimer = setInterval(() => {
    nextSlide();
  }, 4500);
}

function stopSliderAutoPlay() {
  if (sliderTimer) {
    clearInterval(sliderTimer);
    sliderTimer = null;
  }
}

function nextSlide() {
  if (featuredBooks.value.length === 0) return;
  currentSlideIndex.value = (currentSlideIndex.value + 1) % featuredBooks.value.length;
}

function prevSlide() {
  if (featuredBooks.value.length === 0) return;
  currentSlideIndex.value = (currentSlideIndex.value - 1 + featuredBooks.value.length) % featuredBooks.value.length;
}

function goToSlide(idx) {
  currentSlideIndex.value = idx;
  startSliderAutoPlay();
}

const isDragging = ref(false);
let startX = 0;
let dragOccurred = false;

function handleMouseDown(e) {
  if (e.target.closest('button') || e.target.closest('.dot')) return;
  isDragging.value = true;
  dragOccurred = false;
  startX = e.clientX;
}

function handleMouseMove(e) {
  if (!isDragging.value) return;
  if (Math.abs(e.clientX - startX) > 8) {
    dragOccurred = true;
  }
}

function handleMouseUp(e) {
  if (!isDragging.value) return;
  isDragging.value = false;
  
  const diff = startX - e.clientX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
    startSliderAutoPlay();
  } else if (!dragOccurred) {
    const viewport = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - viewport.left;
    if (clickX > viewport.width / 2) {
      nextSlide();
    } else {
      prevSlide();
    }
    startSliderAutoPlay();
  }
}

function handleMouseLeave() {
  isDragging.value = false;
}

function handleSliderTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleSliderTouchEnd(e) {
  touchEndX = e.changedTouches[0].clientX;
  if (touchStartX - touchEndX > 40) {
    nextSlide();
    startSliderAutoPlay();
  } else if (touchEndX - touchStartX > 40) {
    prevSlide();
    startSliderAutoPlay();
  }
}

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

function handleBorrowSuccess(msg) {
  toastMessage.value = msg || 'Book borrowing request submitted successfully!';
  booksStore.fetchBooks();
  setTimeout(() => {
    toastMessage.value = '';
  }, 5000);
}
</script>

<style scoped>
.home-container {
  max-width: 1560px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem 3rem;
}

/* Mobile Mini App Header */
.mobile-mini-app-header {
  display: none;
}

@media (max-width: 768px) {
  .mobile-mini-app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.25rem 0.75rem;
    margin-bottom: 0.5rem;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .mobile-logo-img {
    height: 32px;
    filter: drop-shadow(0 2px 8px rgba(99, 102, 241, 0.4));
  }

  .mobile-app-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
  }

  .mobile-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .mobile-lang-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.65rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }

  .mobile-icon-badge {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    cursor: pointer;
  }

  .badge-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 6px #ef4444;
  }
}

/* Trending Shelf Section ("កំពុងពេញនិយម") */
.trending-shelf-section {
  margin-top: 1.5rem;
  margin-bottom: 1.75rem;
}

.shelf-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.85rem;
}

.shelf-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
}

.shelf-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.shelf-scroll-row {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.shelf-card {
  flex: 0 0 130px;
  cursor: pointer;
  transition: transform 0.25s var(--spring-ease);
}

.shelf-card:hover {
  transform: translateY(-4px);
}

.shelf-cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  background: #1e293b;
  margin-bottom: 0.45rem;
}

.shelf-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.shelf-card:hover .shelf-cover-img {
  transform: scale(1.06);
}

.shelf-badge-tag {
  position: absolute;
  bottom: 6px;
  right: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.9);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
}

.shelf-badge-tag.out-of-stock {
  background: rgba(239, 68, 68, 0.9);
}

.shelf-book-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Featured Slider Section */
.featured-slider-section {
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.slider-viewport {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: #0f172a;
  cursor: grab;
  user-select: none;
}

.slider-viewport.dragging {
  cursor: grabbing;
}

.slider-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.slider-card {
  min-width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.slide-image-wrapper {
  position: absolute;
  inset: 0;
}

.slide-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6) contrast(1.1);
  transform: scale(1.05);
  transition: transform 0.6s ease;
}

.slide-overlay-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(15, 23, 42, 0.3) 100%);
}

.slide-content {
  position: relative;
  z-index: 2;
  padding: 2.5rem 4.5rem 3rem 4.5rem;
  max-width: 900px;
  width: 100%;
  color: #f8fafc;
}

.slide-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.35);
  border: 1px solid rgba(165, 180, 252, 0.5);
  color: #e0e7ff !important;
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
}

.slide-title {
  color: #ffffff !important;
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1.55;
  padding: 0.15rem 0;
  margin-bottom: 0.3rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-author {
  font-size: 0.92rem;
  color: #38bdf8 !important;
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.slide-desc {
  font-size: 0.88rem;
  color: #cbd5e1 !important;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-actions {
  display: flex;
  gap: 0.75rem;
}

.slide-actions .btn {
  padding: 0.55rem 1.25rem;
  font-size: 0.88rem;
}

.slide-actions .btn-secondary {
  background: rgba(255, 255, 255, 0.18) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  color: #ffffff !important;
  backdrop-filter: blur(12px);
}

.slide-actions .btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider-arrow:hover {
  background: rgba(99, 102, 241, 0.85);
  border-color: transparent;
  transform: translateY(-50%) scale(1.08);
}

.prev-arrow {
  left: 16px;
}

.next-arrow {
  right: 16px;
}

.slider-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 0.45rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  width: 22px;
  background: #38bdf8;
}

/* Home Top Bar & Spotlight Search */
.home-top-bar {
  margin-bottom: 1.5rem;
}

.spotlight-search-container {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto 1.25rem;
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
  transition: transform 0.3s var(--spring-ease);
}

.search-box-pill.focused .search-icon {
  transform: scale(1.12);
  color: #6366f1;
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
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-color);
  padding: 0.2rem 0.55rem;
  border-radius: 8px;
  letter-spacing: 0.04em;
  user-select: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.btn-clear {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-clear:hover {
  color: var(--text-primary);
}

/* Live Search Dropdown */
.live-search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-highlight);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  padding: 0.5rem 0;
}

.live-results-header {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
}

.live-result-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.live-result-item:hover {
  background: rgba(99, 102, 241, 0.15);
}

.live-thumb {
  width: 36px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}

.live-info {
  flex: 1;
  overflow: hidden;
}

.live-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.live-author {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.live-read-btn {
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
}

.live-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.5rem 1rem;
  color: var(--text-muted);
  font-size: 0.88rem;
}

/* Filter Row & Category Pills */
.filter-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.category-scroll-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.35rem;
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
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg-card, rgba(30, 41, 59, 0.8));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  color: var(--text-primary);
  cursor: pointer;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.cat-nav-btn:hover {
  background: var(--accent-primary, #6366f1);
  color: #ffffff;
  border-color: transparent;
  transform: scale(1.08);
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
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.cat-chip:hover:not(.active) {
  background: rgba(99, 102, 241, 0.12);
  color: var(--text-primary);
  border-color: rgba(99, 102, 241, 0.3);
}

.cat-chip.active {
  background: var(--accent-gradient);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.cat-chip-wishlist {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.cat-chip-wishlist.active {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
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
  letter-spacing: -0.01em;
}

.catalog-count-badge {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--accent-primary, #6366f1);
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

@media (max-width: 1024px) {
  .slider-viewport {
    height: 250px;
  }
  .slide-content {
    padding: 1.6rem 3.6rem 2.4rem 3.6rem;
    max-width: 680px;
  }
  .slide-title {
    font-size: 1.45rem;
  }
  .slide-desc {
    font-size: 0.84rem;
  }
}

@media (max-width: 640px) {
  .home-container {
    padding: 0.75rem 0.75rem 4rem;
  }
  .slider-viewport {
    height: 210px;
  }
  .slide-content {
    padding: 1rem 3rem 2rem 3rem;
  }
  .slide-title {
    font-size: 1.12rem;
    line-height: 1.5;
    padding: 0.1rem 0;
    margin-bottom: 0.25rem;
  }
  .slide-author {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
  .slide-badge {
    font-size: 0.68rem;
    padding: 0.2rem 0.55rem;
    margin-bottom: 0.35rem;
  }
  .slide-desc {
    display: none;
  }
  .slide-actions {
    gap: 0.5rem;
  }
  .slide-actions .btn {
    padding: 0.35rem 0.75rem;
    font-size: 0.78rem;
  }
  .slider-arrow {
    width: 32px;
    height: 32px;
  }
  .prev-arrow {
    left: 8px;
  }
  .next-arrow {
    right: 8px;
  }
  .slider-dots {
    bottom: 8px;
  }
  .spotlight-search-container {
    margin-bottom: 0.85rem;
  }
  .search-box-pill {
    padding: 0.4rem 0.95rem;
  }
  .category-scroll-container {
    width: 100%;
  }
  .cat-nav-btn {
    width: 26px;
    height: 26px;
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

@media (max-width: 440px) {
  .slider-viewport {
    height: 205px;
  }
  .slide-content {
    padding: 0.85rem 2.6rem 1.8rem 2.6rem;
  }
  .slide-title {
    font-size: 1.05rem;
  }
  .slider-arrow {
    width: 28px;
    height: 28px;
  }
  .prev-arrow {
    left: 5px;
  }
  .next-arrow {
    right: 5px;
  }
}
</style>
