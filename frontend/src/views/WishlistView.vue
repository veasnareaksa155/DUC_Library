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
        <!-- Premium Header Banner -->
        <div class="relative overflow-hidden mb-10 p-8 rounded-[var(--radius-xl,20px)] bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent border border-red-500/10 backdrop-blur-md shadow-[0_8px_32px_rgba(239,68,68,0.05)] max-sm:p-5 max-sm:mb-6 max-sm:rounded-2xl">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="flex items-center gap-5 max-sm:gap-3">
              <div class="w-16 h-16 max-sm:w-12 max-sm:h-12 rounded-[1.25rem] max-sm:rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(239,68,68,0.4)] transform hover:scale-105 transition-transform duration-300">
                <Heart :size="28" class="fill-white drop-shadow-md max-sm:scale-75" />
              </div>
              <div>
                <h1 class="text-[2rem] max-sm:text-[1.5rem] font-extrabold text-[var(--text-primary)] leading-tight tracking-tight mb-1">My Collection</h1>
                <p class="text-[0.95rem] max-sm:text-[0.85rem] font-medium text-[var(--text-muted)] flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span>
                  {{ wishlistBooks.length }} {{ wishlistBooks.length === 1 ? 'saved book' : 'saved books' }}
                </p>
              </div>
            </div>
            <button @click="clearAllWishlist" class="inline-flex items-center gap-2.5 px-6 py-3 max-sm:px-4 max-sm:py-2.5 max-sm:w-full max-sm:justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold cursor-pointer transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-[0_8px_25px_rgba(239,68,68,0.35)] hover:-translate-y-0.5 group">
              <Trash2 :size="18" class="group-hover:animate-bounce" /> 
              <span>Clear Collection</span>
            </button>
          </div>
        </div>

        <!-- Wishlist Books Grid (Using standard BookCard component) -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-sm:gap-3">
          <BookCard 
            v-for="book in wishlistBooks" 
            :key="book.id" 
            :book="book" 
            @read="openReaderModal" 
            @borrow="openBorrowModal"
          />
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
import BookCard from '../components/BookCard.vue';
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


