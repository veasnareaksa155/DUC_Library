<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-10">
    <button @click="router.back()" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm mb-6">
      <ArrowLeft :size="16" /> Back to Catalog
    </button>

    <div v-if="loading" class="p-10 max-sm:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate-pulse">
      <div class="grid grid-cols-[280px_1fr] gap-10 max-md:grid-cols-1 max-sm:gap-6">
        <!-- Skeleton Image -->
        <div>
          <div class="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-[var(--radius-lg)] shadow-sm"></div>
        </div>

        <!-- Skeleton Content -->
        <div class="flex flex-col">
          <!-- Category -->
          <div class="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          
          <!-- Title -->
          <div class="h-10 w-full max-w-lg bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
          <div class="h-10 w-3/4 max-w-md bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
          
          <!-- Author -->
          <div class="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8"></div>

          <!-- Metadata row -->
          <div class="flex gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800 max-sm:flex-col max-sm:gap-3">
            <div class="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div class="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div class="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>

          <!-- Availability Badge -->
          <div class="h-[52px] w-full max-w-md bg-gray-200 dark:bg-gray-800 rounded-[var(--radius-md)] mb-8"></div>

          <!-- Synopsis Title -->
          <div class="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          
          <!-- Synopsis Lines -->
          <div class="space-y-3 mb-10">
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div class="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div class="h-4 w-4/6 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 max-sm:flex-col">
            <div class="h-[44px] w-44 max-sm:w-full bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            <div class="h-[44px] w-40 max-sm:w-full bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="book" class="p-10 max-sm:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <div class="grid grid-cols-[280px_1fr] gap-10 max-md:grid-cols-1 max-sm:gap-6">
        <div>
          <img :src="book.cover_url || fallbackCover" :alt="book.title" class="w-full rounded-[var(--radius-lg)] shadow-[0_12px_30px_rgba(0,0,0,0.4)]" />
        </div>

        <div>
          <span class="inline-block text-[0.8rem] font-bold text-purple-400 uppercase tracking-[0.05em] mb-2">{{ book.category_name || 'General' }}</span>
          <h1 class="text-[2.2rem] font-extrabold leading-[1.2] mb-1.5 max-sm:text-[1.8rem] text-[var(--text-primary)]">{{ book.title }}</h1>
          <p class="text-[1.1rem] text-[var(--accent-primary)] font-semibold mb-5">by {{ book.author }}</p>

          <div class="flex gap-6 text-[0.88rem] text-[var(--text-secondary)] mb-5 pb-5 border-b border-[var(--border-color)] max-sm:flex-col max-sm:gap-2">
            <span>Publisher: <strong>{{ book.publisher || 'N/A' }}</strong></span>
            <span>Year: <strong>{{ book.publish_year || 'N/A' }}</strong></span>
            <span>ISBN: <strong>{{ book.isbn || 'N/A' }}</strong></span>
          </div>

          <div class="flex items-center gap-2.5 py-3 px-5 rounded-[var(--radius-md)] font-semibold text-[0.9rem] mb-6 border" :class="book.copies_available <= 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'">
            <PackageCheck :size="18" />
            <span>{{ book.copies_available > 0 ? `${book.copies_available} of ${book.copies_total} physical copies available` : 'Currently Out of Stock' }}</span>
          </div>

          <div class="mb-8">
            <h3 class="text-[1.1rem] font-bold mb-2 text-[var(--text-primary)]">Synopsis & Description</h3>
            <p class="text-[var(--text-secondary)] leading-[1.7]">{{ book.description || 'No description provided.' }}</p>
          </div>

          <div class="flex gap-4 max-sm:flex-col max-sm:gap-3">
            <button @click="handleRead" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-5 py-2.5 text-sm">
              <BookOpen :size="18" /> Read Digital Book
            </button>
            <button 
              @click="openBorrow" 
              class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-5 py-2.5 text-sm"
              :disabled="book.copies_available <= 0"
            >
              <BookmarkPlus :size="18" /> Borrow Book
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { ArrowLeft, Loader2, PackageCheck, BookOpen, BookmarkPlus } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const booksStore = useBooksStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const book = ref(null);
const loading = ref(true);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

onMounted(async () => {
  try {
    book.value = await booksStore.fetchBookById(route.params.id);
  } catch (err) {
    console.error('Failed to load book:', err);
  } finally {
    loading.value = false;
  }
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
  alert(msg);
  booksStore.fetchBookById(route.params.id).then(res => book.value = res);
}
</script>

