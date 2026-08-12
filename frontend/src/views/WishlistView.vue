<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-6 max-sm:px-2 max-sm:pb-20 max-sm:pt-3">

    <!-- Notification Toast -->
    <div v-if="toastMessage" class="flex items-center gap-3 px-4 py-3 mb-6 bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 rounded-md glass-panel">
      <CheckCircle2 :size="20" class="text-success" />
      <span>{{ toastMessage }}</span>
      <button @click="toastMessage = ''" class="ml-auto bg-transparent border-none text-inherit cursor-pointer p-1"><X :size="16" /></button>
    </div>

    <!-- Main Content Section -->
    <main>
      <!-- Loading State -->
      <div v-if="booksStore.loading" class="text-center p-16 text-[var(--text-muted)]">
        <Loader2 :size="36" class="animate-spin mx-auto mb-2" />
        <p>Loading your saved wishlist...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="wishlistBooks.length === 0" class="max-w-[540px] mx-auto my-12 p-14 rounded-[var(--radius-lg)] glass-panel text-center">
        <div class="w-[88px] h-[88px] mx-auto mb-6 rounded-full bg-red-500/12 border border-red-500/30 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.25)]">
          <Heart :size="48" color="#ef4444" />
        </div>
        <h2 class="text-[1.5rem] font-extrabold text-[var(--text-primary)] mb-2">Your Wishlist is Empty</h2>
        <p class="text-[0.92rem] text-[var(--text-secondary)] leading-[1.55] mb-6">
          You haven't saved any books to your wishlist yet. Explore the library catalog and tap the heart icon on any book to save it here!
        </p>
        <router-link to="/catalog" class="btn btn-primary btn-lg mt-3">
          <BookOpen :size="18" /> Browse Catalog Now
        </router-link>
      </div>

      <!-- Wishlist Books Grid -->
      <div v-else>
        <!-- Premium Header -->
        <div class="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-color)]/60">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner border border-red-500/20">
              <Heart :size="24" fill="currentColor" />
            </div>
            <div>
              <h1 class="text-[1.45rem] font-extrabold text-[var(--text-primary)] leading-tight m-0">My Collection</h1>
              <span class="text-[0.9rem] font-medium text-[var(--text-muted)]">{{ wishlistBooks.length }} saved items</span>
            </div>
          </div>
          <button @click="clearAllWishlist" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-red-500 text-[0.85rem] font-bold cursor-pointer shadow-sm transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_6px_20px_rgba(239,68,68,0.25)] hover:-translate-y-0.5 group">
            <Trash2 :size="16" class="group-hover:animate-bounce" /> <span class="max-sm:hidden">Clear All</span>
          </button>
        </div>

        <div class="flex flex-col gap-5">
          <div 
            v-for="book in wishlistBooks" 
            :key="book.id" 
            class="group relative flex flex-row items-center gap-5 p-4 rounded-[1.25rem] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(239,68,68,0.12)] hover:border-red-400/30 hover:-translate-y-1 max-sm:p-3 max-sm:gap-3"
          >
            <!-- Subtle Hover Gradient Background -->
            <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/[0.03] to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <!-- Left Thumbnail Cover -->
            <div class="relative w-[100px] h-[140px] shrink-0 rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800 shadow-[0_4px_15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-300 transform group-hover:scale-[1.02] max-sm:w-[80px] max-sm:h-[115px]" @click="openReaderModal(book)">
              <img :src="book.cover_url || fallbackCover" :alt="book.title" class="w-full h-full object-cover" loading="lazy" decoding="async" />
              <!-- Glass Badge -->
              <div class="absolute bottom-1.5 left-1.5 right-1.5 py-1 px-1.5 rounded-lg backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 text-white text-[0.65rem] font-bold text-center whitespace-nowrap overflow-hidden text-ellipsis shadow-sm transition-colors duration-300" :class="book.copies_available <= 0 ? 'bg-red-500/70' : 'bg-emerald-500/70'">
                {{ book.copies_available > 0 ? `${book.copies_available} In Stock` : 'Out of Stock' }}
              </div>
            </div>

            <!-- Center Book Meta Info & Actions -->
            <div class="flex-1 min-w-0 flex flex-col gap-2 py-1 relative z-10">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[0.65rem] font-extrabold uppercase tracking-wider border border-indigo-500/20 shadow-sm">{{ book.category_name || 'General' }}</span>
                <span class="text-[0.8rem] font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                  <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  by {{ book.author || 'DUC Library' }}
                </span>
              </div>

              <h3 class="text-[1.15rem] font-extrabold text-[var(--text-primary)] leading-snug cursor-pointer line-clamp-2 m-0 group-hover:text-indigo-500 transition-colors max-sm:text-[0.95rem]" @click="openReaderModal(book)">{{ book.title }}</h3>

              <div class="flex items-center gap-3 mt-2">
                <button @click="openReaderModal(book)" class="btn btn-primary btn-sm !px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 border-0">
                  <BookOpenCheck :size="15" /> Read Now
                </button>
                <button 
                  @click="openBorrowModal(book)" 
                  class="btn btn-secondary btn-sm !px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-800" 
                  :disabled="book.copies_available <= 0"
                >
                  <BookmarkPlus :size="15" /> Borrow
                </button>
              </div>
            </div>

            <!-- Right Remove Heart Action Button -->
            <div class="pl-4 pr-2 border-l border-[var(--border-color)]/60 shrink-0 self-stretch flex items-center justify-center max-sm:border-l-0 max-sm:pl-0 max-sm:pr-0 relative z-10">
              <button 
                @click.stop="removeFromWishlist(book)" 
                class="flex flex-col items-center justify-center gap-1.5 w-[75px] h-[75px] rounded-2xl bg-red-500/5 border border-transparent text-red-500 hover:bg-red-500 hover:border-red-400 hover:text-white hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:-translate-y-1 transition-all duration-300 max-sm:w-[45px] max-sm:h-[45px] max-sm:rounded-xl" 
                title="Remove from Wishlist"
              >
                <Heart :size="24" class="fill-current transition-transform duration-300 group-hover:scale-110" />
                <span class="text-[0.65rem] font-bold uppercase tracking-wider max-sm:hidden">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

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
import { useWishlistStore } from '../stores/wishlist';
import { useRouter } from 'vue-router';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { 
  Heart, Bookmark, BookOpen, BookOpenCheck, BookmarkPlus, 
  Trash2, Loader2, CheckCircle2, X 
} from 'lucide-vue-next';

import { useToastStore } from '../stores/toast';

const booksStore = useBooksStore();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const toastStore = useToastStore();
const router = useRouter();

const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const selectedBook = ref(null);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);

const wishlistBooks = computed(() => {
  return (booksStore.books || []).filter(b => wishlistStore.isInWishlist(b.id));
});

onMounted(() => {
  booksStore.fetchBooks();
});

function removeFromWishlist(book) {
  wishlistStore.toggleWishlist(book.id);
  toastStore.showWishlist(book.title, false);
}

function clearAllWishlist() {
  wishlistStore.wishlistIds = [];
  wishlistStore.saveWishlist();
  toastStore.showSuccess('Wishlist collection cleared! 💔', 'Cleared Wishlist');
}

function openReaderModal(book) {
  router.push(`/read/${book.id}`);
}

function openBorrowModal(book) {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/wishlist' } });
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
  toastMessage.value = msg || 'Borrowing request submitted successfully!';
  booksStore.fetchBooks();
}
</script>


