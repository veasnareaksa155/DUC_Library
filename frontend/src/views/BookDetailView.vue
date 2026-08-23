<template>
  <div class="max-w-[1100px] mx-auto px-6 pb-16 pt-10">
    <button @click="router.back()" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm mb-6">
      <ArrowLeft :size="16" /> Back to Catalog
    </button>

    <div v-if="loading" class="text-center p-16 text-[var(--text-muted)]">
      <Loader2 :size="36" class="animate-spin mx-auto mb-2" />
      <p>Loading book details...</p>
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
            <button @click="router.push(`/read/${book.id}`)" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-5 py-2.5 text-sm">
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
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { ArrowLeft, Loader2, PackageCheck, BookOpen, BookmarkPlus } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const booksStore = useBooksStore();
const authStore = useAuthStore();

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

function openBorrow() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
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

