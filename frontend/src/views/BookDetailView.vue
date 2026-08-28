<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-10">
    <button @click="router.back()" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm mb-6 cursor-pointer">
      <ArrowLeft :size="16" /> Back to Catalog
    </button>

    <div v-if="loading" class="p-10 max-sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm animate-pulse">
      <div class="grid grid-cols-[280px_1fr] gap-10 max-md:grid-cols-1 max-sm:gap-6">
        <!-- Skeleton Image -->
        <div>
          <div class="w-full aspect-[3/4] bg-[var(--border-color)] rounded-[var(--radius-lg)] shadow-sm"></div>
        </div>

        <!-- Skeleton Content -->
        <div class="flex flex-col">
          <!-- Category -->
          <div class="h-4 w-32 bg-[var(--border-color)] rounded mb-4"></div>
          
          <!-- Title -->
          <div class="h-10 w-full max-w-lg bg-[var(--border-color)] rounded mb-3"></div>
          <div class="h-10 w-3/4 max-w-md bg-[var(--border-color)] rounded mb-6"></div>
          
          <!-- Author -->
          <div class="h-5 w-48 bg-[var(--border-color)] rounded mb-8"></div>

          <!-- Metadata row -->
          <div class="flex gap-6 mb-6 pb-6 border-b border-[var(--border-color)] max-sm:flex-col max-sm:gap-3">
            <div class="h-4 w-32 bg-[var(--border-color)] rounded"></div>
            <div class="h-4 w-24 bg-[var(--border-color)] rounded"></div>
            <div class="h-4 w-36 bg-[var(--border-color)] rounded"></div>
          </div>

          <!-- Availability Badge -->
          <div class="h-[52px] w-full max-w-md bg-[var(--border-color)] rounded-[var(--radius-md)] mb-8"></div>

          <!-- Synopsis Title -->
          <div class="h-6 w-48 bg-[var(--border-color)] rounded mb-4"></div>
          
          <!-- Synopsis Lines -->
          <div class="space-y-3 mb-10">
            <div class="h-4 w-full bg-[var(--border-color)] rounded"></div>
            <div class="h-4 w-full bg-[var(--border-color)] rounded"></div>
            <div class="h-4 w-5/6 bg-[var(--border-color)] rounded"></div>
            <div class="h-4 w-4/6 bg-[var(--border-color)] rounded"></div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 max-sm:flex-col">
            <div class="h-[44px] w-44 max-sm:w-full bg-[var(--border-color)] rounded-md"></div>
            <div class="h-[44px] w-40 max-sm:w-full bg-[var(--border-color)] rounded-md"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="book" class="p-10 max-sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm transition-colors duration-300">
      <div class="grid grid-cols-[280px_1fr] gap-10 max-md:grid-cols-1 max-sm:gap-6">
        <div>
          <img :src="book.cover_url || fallbackCover" :alt="book.title" class="w-full rounded-[var(--radius-lg)] shadow-[0_12px_30px_rgba(0,0,0,0.4)]" />
        </div>

        <div>
          <span class="inline-block text-[0.8rem] font-bold text-indigo-500 uppercase tracking-[0.05em] mb-2">{{ book.category_name || 'General' }}</span>
          <h1 class="text-[2.2rem] font-extrabold leading-[1.2] mb-1.5 max-sm:text-[1.8rem] text-[var(--text-primary)]">{{ book.title }}</h1>
          <p class="text-[1.1rem] text-[var(--text-secondary)] font-semibold mb-5">by <span class="text-indigo-500">{{ book.author }}</span></p>

          <div class="flex gap-6 text-[0.88rem] text-[var(--text-secondary)] mb-5 pb-5 border-b border-[var(--border-color)] max-sm:flex-col max-sm:gap-2">
            <span>Publisher: <strong class="text-[var(--text-primary)]">{{ book.publisher || 'N/A' }}</strong></span>
            <span>Year: <strong class="text-[var(--text-primary)]">{{ book.publish_year || 'N/A' }}</strong></span>
            <span>ISBN: <strong class="text-[var(--text-primary)]">{{ book.isbn || 'N/A' }}</strong></span>
          </div>

          <div class="flex items-center gap-2.5 py-3 px-5 rounded-[var(--radius-md)] font-semibold text-[0.9rem] mb-6 border" :class="book.copies_available <= 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'">
            <PackageCheck :size="18" />
            <span>{{ book.copies_available > 0 ? `${book.copies_available} of ${book.copies_total} physical copies available` : 'Currently Out of Stock' }}</span>
          </div>

          <div class="mb-8">
            <h3 class="text-[1.1rem] font-bold mb-2 text-[var(--text-primary)]">Synopsis & Description</h3>
            <p class="text-[var(--text-secondary)] leading-[1.7]">{{ book.description || 'No description provided.' }}</p>
          </div>

          <div class="flex gap-4 max-sm:grid max-sm:grid-cols-2 max-sm:gap-3 mt-4">
            <button @click="handleRead" class="max-sm:col-span-2 inline-flex items-center justify-center gap-2.5 font-bold rounded-xl transition-all duration-300 ease-out active:scale-[0.98] bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 px-6 py-3.5 text-[0.95rem] cursor-pointer">
              <BookOpen :size="20" /> Read Digital Book
            </button>
            <button 
              @click="openBorrow" 
              class="inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ease-out bg-[var(--bg-card)] text-[var(--text-primary)] border-2 border-[var(--border-color)] shadow-sm px-5 py-3.5 text-[0.95rem] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--bg-card)] disabled:hover:translate-y-0 disabled:active:scale-100 [&:not(:disabled)]:active:scale-[0.98] [&:not(:disabled)]:hover:border-indigo-500 [&:not(:disabled)]:hover:text-indigo-500 [&:not(:disabled)]:hover:-translate-y-0.5"
              :disabled="book.copies_available <= 0"
            >
              <BookmarkPlus :size="20" /> <span class="max-sm:hidden">Borrow Physical Copy</span><span class="hidden max-sm:inline">Borrow</span>
            </button>
            <button 
              @click="handleWishlistToggle" 
              class="inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ease-out active:scale-[0.98] bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:border-pink-500 hover:text-pink-500 hover:bg-pink-500/5 hover:-translate-y-0.5 px-5 py-3.5 text-[0.95rem] cursor-pointer"
              :class="{ 'text-pink-500 border-pink-500/50 bg-pink-500/10 shadow-[0_4px_15px_rgba(236,72,153,0.15)]': isSaved }"
            >
              <Heart :size="20" :fill="isSaved ? 'currentColor' : 'none'" :class="{ 'scale-110': isSaved }" class="transition-transform duration-300" /> 
              <span>Wishlist <span class="font-black tabular-nums">({{ book.wishlist_count || 0 }})</span></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reader Modal -->
    <ReaderModal 
      :is-open="isReaderOpen" 
      :book="book" 
      @close="isReaderOpen = false"
      @borrow="openBorrowFromReader"
    />

    <!-- Borrow Modal -->
    <BorrowModal 
      :is-open="isBorrowOpen" 
      :book="book" 
      @close="isBorrowOpen = false"
      @success="handleBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useWishlistStore } from '../stores/wishlist';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { ArrowLeft, Loader2, PackageCheck, BookOpen, BookmarkPlus, Heart } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const booksStore = useBooksStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const wishlistStore = useWishlistStore();

const book = computed(() => booksStore.currentBook);
const isSaved = computed(() => book.value ? wishlistStore.isInWishlist(book.value.id) : false);

async function handleWishlistToggle() {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to add to wishlist!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  const added = await wishlistStore.toggleWishlist(book.value.id);
  toastStore.showWishlist(book.value.title, added);
}
const loading = ref(true);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const fetchBook = async () => {
  try {
    await booksStore.fetchBookById(route.params.id);
  } catch (err) {
    console.error('Failed to load book:', err);
    toastStore.show('This book is no longer available in the catalog.', { type: 'error', title: 'Book Removed' });
    router.replace('/');
  }
};

onMounted(async () => {
  await fetchBook();
  loading.value = false;
  window.addEventListener('catalog_updated', fetchBook);
});

onUnmounted(() => {
  window.removeEventListener('catalog_updated', fetchBook);
});

function handleRead() {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to read books!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  router.push(`/read/${book.value.id}`);
}

function openBorrow() {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to borrow books!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  isBorrowOpen.value = true;
}

function openBorrowFromReader() {
  isReaderOpen.value = false;
  openBorrow();
}

function handleBorrowSuccess(msg) {
  fetchBook();
}
</script>

