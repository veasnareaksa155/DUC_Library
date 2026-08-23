<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-6 max-sm:px-2 max-sm:pb-20 max-sm:pt-3">

    <!-- Notification Toast -->
    <div v-if="toastMessage" class="flex items-center gap-3 px-4 py-3 mb-6 bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <CheckCircle2 :size="20" class="text-success" />
      <span>{{ toastMessage }}</span>
      <button @click="toastMessage = ''" class="ml-auto bg-transparent border-none text-inherit cursor-pointer p-1"><X :size="16" /></button>
    </div>

    <!-- Main Content Section -->
    <main>
      <!-- Professional Header (Always Visible) -->
      <div class="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-color)] pb-6 max-sm:mb-6 max-sm:pb-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bookmark :size="18" />
            </div>
            <h1 class="text-[1.75rem] max-sm:text-[1.5rem] font-bold text-[var(--text-primary)] tracking-tight">My Collection</h1>
          </div>
          <p class="text-[0.9rem] text-[var(--text-secondary)]">
            <template v-if="booksStore.loading">Loading your collection...</template>
            <template v-else>You have {{ wishlistBooks.length }} saved {{ wishlistBooks.length === 1 ? 'book' : 'books' }}</template>
          </p>
        </div>
        
        <button @click="clearAllWishlist" :disabled="booksStore.loading || wishlistBooks.length === 0" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[0.85rem] font-medium text-[var(--text-secondary)] hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
          <Trash2 :size="15" class="transition-transform group-hover:scale-110" /> 
          <span>Clear Collection</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="booksStore.loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-sm:gap-3">
        <BookSkeleton v-for="n in 10" :key="n" />
      </div>

      <!-- Empty State -->
      <div v-else-if="wishlistBooks.length === 0" class="max-w-[540px] mx-auto my-16 p-12 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-[var(--border-color)] shadow-sm text-center">
        <div class="w-16 h-16 mx-auto mb-6 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Bookmark :size="32" class="text-gray-400" />
        </div>
        <h2 class="text-[1.25rem] font-bold text-[var(--text-primary)] mb-2">Your collection is empty</h2>
        <p class="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-8">
          You haven't saved any books yet. Explore the catalog and bookmark books to read later.
        </p>
        <router-link to="/catalog" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
          <BookOpen :size="16" /> Browse Catalog
        </router-link>
      </div>

      <!-- Wishlist Books Grid (Using standard BookCard component) -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-sm:gap-3">
        <BookCard 
          v-for="book in wishlistBooks" 
          :key="book.id" 
          :book="book" 
          @read="openReaderModal" 
          @borrow="openBorrowModal"
        />
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
import BookSkeleton from '../components/BookSkeleton.vue';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { 
  Heart, Bookmark, BookOpen, BookOpenCheck, BookmarkPlus, 
  Trash2, Loader2, CheckCircle2, X 
} from 'lucide-vue-next';

import { useToastStore } from '../stores/toast';
import { useConfirmStore } from '../stores/confirm';

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

async function clearAllWishlist() {
  const confirmStore = useConfirmStore();
  const confirmed = await confirmStore.showConfirm({
    title: 'Clear Collection',
    message: 'Are you sure you want to remove all books from your collection? This action cannot be undone.',
    confirmText: 'Clear All',
    type: 'danger'
  });

  if (confirmed) {
    wishlistStore.wishlistIds = [];
    wishlistStore.saveWishlist();
    toastStore.showSuccess('Your collection has been cleared.', 'Collection Cleared');
  }
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


