<template>
  <div class="max-w-[1280px] mx-auto px-6 pb-16 pt-10">
    <header class="mb-8">
      <div>
        <h1 class="text-[2.2rem] font-extrabold text-[var(--text-primary)] mb-1">{{ localeStore.t('myBorrowingsTitle') }}</h1>
        <p class="text-[var(--text-secondary)]">{{ localeStore.t('myBorrowingsSubtitle') }}</p>
      </div>
    </header>

    <!-- Tab Filters -->
    <div v-if="borrowingsStore.myBorrowings.length > 0 && !borrowingsStore.loading" class="flex items-center gap-1.5 mb-6 bg-gray-500/5 p-1.5 rounded-xl w-fit max-sm:w-full max-sm:overflow-x-auto hide-scrollbar border border-[var(--border-color)]/50 shadow-sm">
      <button @click="setTab('all')" class="px-5 py-2 rounded-lg text-[0.85rem] font-bold transition-all duration-300 border border-transparent whitespace-nowrap" :class="activeTab === 'all' ? 'text-white shadow-md [background:var(--accent-gradient)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-500/10'">All Borrowings</button>
      <button @click="setTab('active')" class="px-5 py-2 rounded-lg text-[0.85rem] font-bold transition-all duration-300 border border-transparent whitespace-nowrap" :class="activeTab === 'active' ? 'text-white shadow-md [background:var(--accent-gradient)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-500/10'">Active</button>
      <button @click="setTab('returned')" class="px-5 py-2 rounded-lg text-[0.85rem] font-bold transition-all duration-300 border border-transparent whitespace-nowrap" :class="activeTab === 'returned' ? 'text-white shadow-md [background:var(--accent-gradient)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-500/10'">Returned</button>
    </div>

    <div v-if="borrowingsStore.loading" class="text-center p-16 text-[var(--text-muted)]">
      <Loader2 :size="36" class="animate-spin mx-auto mb-2" />
      <p>Loading your borrowing records...</p>
    </div>

    <div v-else-if="filteredBorrowings.length === 0" class="text-center p-16 text-[var(--text-muted)] glass-panel">
      <BookmarkX :size="48" class="text-muted mx-auto mb-2" />
      <h3 class="text-lg font-bold mb-1">{{ borrowingsStore.myBorrowings.length === 0 ? localeStore.t('noActiveBorrowings') : 'No Books Found' }}</h3>
      <p>{{ borrowingsStore.myBorrowings.length === 0 ? localeStore.t('noActiveBorrowingsSub') : 'No books match the current filter.' }}</p>
      
      <button v-if="activeTab !== 'all' && borrowingsStore.myBorrowings.length > 0" @click="setTab('all')" class="btn btn-primary btn-sm mt-4">
        View All Borrowings
      </button>
      <router-link v-else to="/" class="btn btn-primary btn-sm mt-4">
        <Library :size="16" /> {{ localeStore.t('browseCatalog') }}
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
      <div v-for="item in paginatedBorrowings" :key="item.id" class="group relative flex gap-5 p-5 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300 overflow-hidden max-sm:p-4 max-sm:gap-4 glass-panel">
        
        <!-- Decorative background glow -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

        <div class="relative shrink-0 self-start">
          <img :src="item.book_cover || fallbackCover" :alt="item.book_title" class="w-[96px] h-[140px] max-sm:w-[84px] max-sm:h-[120px] object-cover rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300 z-10 relative border border-[var(--border-color)]" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-20"></div>
        </div>
        
        <div class="flex-1 flex flex-col relative z-10">
          <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
            <span class="px-2.5 py-1 text-[0.68rem] font-bold tracking-wider uppercase rounded-md shadow-sm border" :class="[
              item.status === 'returned' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
              item.status === 'approved' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' : 
              'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
            ]">
              {{ localeStore.t(item.status) || item.status }}
            </span>
            <span class="text-[0.7rem] font-semibold text-slate-400 mt-1">{{ localeStore.t('requested') || 'Req:' }} {{ formatDate(item.borrow_date) }}</span>
          </div>

          <h3 class="text-[1.1rem] font-bold text-[var(--text-primary)] leading-normal mb-1 pb-1 line-clamp-2 max-sm:text-[1rem]">{{ item.book_title }}</h3>
          <p class="text-[0.85rem] font-medium text-indigo-500 mb-3">by {{ item.book_author }}</p>

          <div class="flex items-center gap-2.5 text-[0.85rem] text-[var(--text-secondary)] mb-4 bg-gray-500/5 p-2.5 rounded-xl border border-[var(--border-color)]/50">
            <div class="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center shadow-sm shrink-0 border border-[var(--border-color)]/50">
              <Calendar :size="16" class="text-indigo-500" />
            </div>
            <div class="flex flex-col">
              <span class="text-[0.65rem] uppercase font-bold tracking-wider text-[var(--text-muted)]">{{ localeStore.t('dueDate') || 'Due Date' }}</span>
              <strong class="text-[var(--text-primary)]">{{ formatDate(item.due_date) }}</strong>
            </div>
          </div>

          <div v-if="item.admin_notes" class="flex items-center gap-1.5 text-[0.82rem] text-amber-500 bg-amber-500/10 px-3 py-2 rounded-xl mb-4 border border-amber-500/20 shadow-sm">
            <Info :size="16" class="shrink-0" /> <span class="font-medium">Note:</span> {{ item.admin_notes }}
          </div>

          <div class="flex gap-2.5 mt-auto max-sm:mt-2">
            <button 
              @click="router.push(`/read/${item.book_id}`)" 
              class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-[0.85rem] font-bold shadow-sm hover:bg-gray-500/10 transition-all duration-200 active:scale-95">
              <BookOpen :size="16" class="text-indigo-500" /> {{ localeStore.t('read') }}
            </button>

            <button 
              v-if="item.status === 'approved'"
              @click="handleReturn(item.id)" 
              class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-[0.85rem] font-bold shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              :disabled="actionLoading === item.id"
            >
              <RotateCcw :size="16" :class="{ 'animate-spin': actionLoading === item.id }" /> 
              {{ actionLoading === item.id ? localeStore.t('returning') : localeStore.t('returnBook') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination -->
    <div v-if="totalPages > 1 && !borrowingsStore.loading" class="flex justify-center items-center gap-2 mt-12 mb-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm transition-all hover:bg-gray-500/10 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronLeft :size="18" />
      </button>

      <div class="flex items-center gap-1.5 px-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full h-10 shadow-sm max-sm:hidden">
        <button v-for="page in totalPages" :key="page" @click="setPage(page)" class="w-8 h-8 rounded-full flex items-center justify-center text-[0.85rem] font-bold transition-all" :class="currentPage === page ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:bg-gray-500/10'">
          {{ page }}
        </button>
      </div>
      <div class="hidden max-sm:flex items-center px-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full h-10 shadow-sm text-sm font-bold text-[var(--text-primary)]">
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <button @click="nextPage" :disabled="currentPage === totalPages" class="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm transition-all hover:bg-gray-500/10 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
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

