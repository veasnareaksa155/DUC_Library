<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-10">
    <header class="mb-8">
      <div>
        <h1 class="text-[2.2rem] font-extrabold text-[var(--text-primary)] mb-1">{{ localeStore.t('myBorrowingsTitle') }}</h1>
        <p class="text-[var(--text-secondary)]">{{ localeStore.t('myBorrowingsSubtitle') }}</p>
      </div>
    </header>

    <!-- Tab Filters -->
    <div v-if="borrowingsStore.myBorrowings.length > 0 && !borrowingsStore.loading" class="flex items-center gap-2 mb-8 overflow-x-auto hide-scrollbar w-full pb-1">
      <button @click="setTab('all')" class="px-4 py-1.5 rounded-md text-[0.85rem] font-medium transition-colors border whitespace-nowrap cursor-pointer shrink-0" :class="activeTab === 'all' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'">All Borrowings</button>
      <button @click="setTab('active')" class="px-4 py-1.5 rounded-md text-[0.85rem] font-medium transition-colors border whitespace-nowrap cursor-pointer shrink-0" :class="activeTab === 'active' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'">Active</button>
      <button @click="setTab('returned')" class="px-4 py-1.5 rounded-md text-[0.85rem] font-medium transition-colors border whitespace-nowrap cursor-pointer shrink-0" :class="activeTab === 'returned' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'">Returned</button>
      <button @click="setTab('rejected')" class="px-4 py-1.5 rounded-md text-[0.85rem] font-medium transition-colors border whitespace-nowrap cursor-pointer shrink-0" :class="activeTab === 'rejected' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'">Rejected</button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="borrowingsStore.loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="n in 4" :key="n" class="flex gap-5 p-5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] shadow-sm max-sm:p-4 max-sm:gap-4">
        <!-- Skeleton Cover -->
        <div class="w-[90px] h-[130px] max-sm:w-[75px] max-sm:h-[110px] bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse shrink-0"></div>
        
        <div class="flex-1 flex flex-col min-w-0">
          <div class="flex justify-between items-start mb-3">
            <div class="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div class="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
          </div>
          <div class="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
          <div class="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-5"></div>
          
          <!-- Skeleton Due Date -->
          <div class="flex items-center gap-2 mb-4">
            <div class="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            <div class="w-28 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          
          <!-- Skeleton Buttons -->
          <div class="flex gap-3 mt-auto pt-2">
            <div class="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
            <div class="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="filteredBorrowings.length === 0" class="text-center p-16 text-[var(--text-muted)] border border-[var(--border-color)] bg-[var(--bg-card)] rounded-lg shadow-sm">
      <BookmarkX :size="48" class="text-[var(--text-muted)] mx-auto mb-3" />
      <h3 class="text-lg font-bold mb-1 text-[var(--text-primary)]">{{ borrowingsStore.myBorrowings.length === 0 ? localeStore.t('noActiveBorrowings') : 'No Books Found' }}</h3>
      <p class="text-[0.9rem]">{{ borrowingsStore.myBorrowings.length === 0 ? localeStore.t('noActiveBorrowingsSub') : 'No books match the current filter.' }}</p>
      
      <button v-if="activeTab !== 'all' && borrowingsStore.myBorrowings.length > 0" @click="setTab('all')" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-4 py-2 text-sm mt-4">
        View All Borrowings
      </button>
      <router-link v-else to="/" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-4 py-2 text-sm mt-4">
        <Library :size="16" /> {{ localeStore.t('browseCatalog') }}
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="item in paginatedBorrowings" :key="item.id" class="group flex gap-5 p-5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 max-sm:p-4 max-sm:gap-4 relative overflow-hidden">
        
        <!-- Book Cover -->
        <div class="relative shrink-0 self-start">
          <img :src="item.book_cover || fallbackCover" :alt="item.book_title" class="w-[90px] h-[130px] max-sm:w-[75px] max-sm:h-[110px] object-contain rounded-md border border-[var(--border-color)] bg-[var(--bg-input)]" />
        </div>
        
        <div class="flex-1 flex flex-col relative z-10 min-w-0">
          <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
            <!-- Status Badge -->
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider rounded border" :class="[
              item.status === 'returned' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 
              item.status === 'approved' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400' : 
              'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
            ]">
              <span class="w-1.5 h-1.5 rounded-full" :class="[
                item.status === 'returned' ? 'bg-emerald-500' : 
                item.status === 'approved' ? 'bg-indigo-500' : 
                'bg-amber-500'
              ]"></span>
              {{ localeStore.t(item.status) || item.status }}
            </span>
            <span class="text-[0.7rem] font-semibold text-[var(--text-muted)] mt-1 tracking-tight">REQ: {{ formatDate(item.borrow_date) }}</span>
          </div>

          <h3 class="text-[1.05rem] font-bold text-[var(--text-primary)] py-1 leading-normal pb-1.5 truncate">{{ item.book_title }}</h3>
          <p class="text-[0.85rem] font-medium text-[var(--text-secondary)] mb-4 truncate">by {{ item.book_author }}</p>

          <!-- Minimal Due Date -->
          <div class="flex items-center gap-2 mb-4">
            <Calendar :size="15" class="text-[var(--text-muted)] shrink-0" />
            <div class="flex items-baseline gap-2">
              <span class="text-[0.75rem] font-bold uppercase tracking-wide text-[var(--text-muted)]">{{ localeStore.t('dueDate') || 'Due:' }}</span>
              <span class="text-[0.85rem] font-semibold text-[var(--text-primary)]">{{ formatDate(item.due_date) }}</span>
            </div>
          </div>

          <div v-if="item.admin_notes" class="flex items-start gap-2 text-[0.8rem] text-amber-600 dark:text-amber-400 bg-amber-500/5 px-3 py-2 rounded-md mb-4 border border-amber-500/20">
            <Info :size="14" class="shrink-0 mt-0.5" /> <span><strong class="font-bold">Note:</strong> {{ item.admin_notes }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-auto pt-2">
            <button 
              @click="router.push(`/read/${item.book_id}`)" 
              class="flex-1 flex items-center justify-center gap-2 h-9 bg-transparent border border-[var(--border-color)] text-[var(--text-primary)] rounded-md text-[0.8rem] font-bold hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer">
              <BookOpen :size="15" /> {{ localeStore.t('read') }}
            </button>

            <button 
              v-if="item.status === 'approved'"
              @click="handleReturn(item.id)" 
              class="flex-1 flex items-center justify-center gap-2 h-9 bg-[var(--text-primary)] text-[var(--bg-primary)] border-none rounded-md text-[0.8rem] font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              :disabled="actionLoading === item.id"
            >
              <RotateCcw :size="15" :class="{ 'animate-spin': actionLoading === item.id }" /> 
              {{ actionLoading === item.id ? localeStore.t('returning') : localeStore.t('returnBook') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination -->
    <!-- Pagination -->
    <div v-if="totalPages > 1 && !borrowingsStore.loading" class="flex justify-center items-center gap-2 mt-12 mb-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="w-9 h-9 rounded-md flex items-center justify-center bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors">
        <ChevronLeft :size="18" />
      </button>

      <div class="flex items-center gap-1">
        <button v-for="page in totalPages" :key="page" @click="setPage(page)" class="w-9 h-9 rounded-md flex items-center justify-center text-[0.85rem] font-bold transition-colors cursor-pointer border" :class="currentPage === page ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color)]'">
          {{ page }}
        </button>
      </div>

      <button @click="nextPage" :disabled="currentPage === totalPages" class="w-9 h-9 rounded-md flex items-center justify-center bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors">
        <ChevronRight :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBorrowingsStore } from '../stores/borrowings';
import { useLocaleStore } from '../stores/locale';
import { Loader2, BookmarkX, Library, Calendar, Info, BookOpen, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const router = useRouter();
const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const actionLoading = ref(null);

// Pagination & Filtering state
const activeTab = ref('all');
const currentPage = ref(1);
const itemsPerPage = 6;

const filteredBorrowings = computed(() => {
  let list = borrowingsStore.myBorrowings;
  if (activeTab.value === 'active') {
    return list.filter(b => b.status === 'pending' || b.status === 'approved');
  }
  if (activeTab.value === 'returned') {
    return list.filter(b => b.status === 'returned');
  }
  if (activeTab.value === 'rejected') {
    return list.filter(b => b.status === 'rejected');
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredBorrowings.value.length / itemsPerPage) || 1);

const paginatedBorrowings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredBorrowings.value.slice(start, start + itemsPerPage);
});

function setTab(tab) {
  activeTab.value = tab;
  currentPage.value = 1;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function setPage(page) {
  currentPage.value = page;
}

onMounted(() => {
  borrowingsStore.fetchMyBorrowings();
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function handleReturn(borrowingId) {
  actionLoading.value = borrowingId;
  try {
    await borrowingsStore.returnBook(borrowingId);
  } catch (err) {
    alert(err.message || 'Failed to return book');
  } finally {
    actionLoading.value = null;
  }
}
</script>

