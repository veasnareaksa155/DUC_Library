<template>
  <main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none print:w-full print:p-0 print:m-0 print:block overflow-x-hidden">
    <header class="mb-12 flex flex-col gap-2 relative">
      <div class="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/20 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div class="flex items-center gap-3 text-pink-500 mb-1 z-10 relative">
        <Heart :size="30" class="p-2 bg-pink-500/10 rounded-xl shadow-[0_4px_20px_rgba(236,72,153,0.2)] border border-pink-500/20" />
        <h1 class="text-[2.5rem] font-extrabold tracking-tight text-[var(--text-primary)]">Wishlist <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Trends</span></h1>
      </div>
      <p class="text-[1rem] text-[var(--text-secondary)] max-w-2xl leading-relaxed z-10 relative font-medium">Discover which books are the most popular among students in real-time.</p>
    </header>

    <!-- Skeletal Loading State -->
    <div v-if="loading && wishlistStore.popularBooks.length === 0" class="flex flex-col gap-10">
      <!-- Podium Skeleton -->
      <div class="flex justify-center items-end h-[350px] gap-6 px-10">
        <!-- Rank 2 Skeleton -->
        <div class="w-64 h-[250px] bg-[var(--bg-card)] rounded-t-3xl animate-pulse"></div>
        <!-- Rank 1 Skeleton -->
        <div class="w-72 h-[320px] bg-[var(--bg-card)] rounded-t-3xl animate-pulse -translate-y-4"></div>
        <!-- Rank 3 Skeleton -->
        <div class="w-64 h-[200px] bg-[var(--bg-card)] rounded-t-3xl animate-pulse"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="wishlistStore.popularBooks.length === 0" class="w-full py-20 flex flex-col items-center justify-center text-center bg-[var(--bg-card)]/50 backdrop-blur-md rounded-3xl border border-[var(--border-color)] shadow-sm">
      <div class="w-24 h-24 bg-gray-500/5 rounded-full flex items-center justify-center mb-6 border border-[var(--border-color)]">
        <HeartOff :size="40" class="text-[var(--text-muted)]" />
      </div>
      <h3 class="text-[1.5rem] font-extrabold text-[var(--text-primary)] mb-2">No Wishlist Data Yet</h3>
      <p class="text-[1rem] text-[var(--text-secondary)] max-w-md">Students haven't added any books to their wishlists. Data will appear here in real-time once they start saving their favorite books.</p>
    </div>

    <!-- Data Loaded State -->
    <div v-else class="flex flex-col gap-14">
      
      <!-- Top 3 Podium -->
      <div v-if="top3.length > 0" class="relative flex flex-col md:flex-row justify-center items-end gap-6 pb-6 w-full max-w-6xl mx-auto min-h-[420px]">
        <!-- Podium Background Glow -->
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-gradient-to-t from-pink-500/20 to-transparent blur-[60px] rounded-full pointer-events-none z-0"></div>

        <!-- Render order: 2, 1, 3 for visual hierarchy (Silver, Gold, Bronze) -->
        
        <!-- Rank 2 (Silver) -->
        <div v-if="top3[1]" class="relative z-10 w-full md:w-[30%] max-w-[320px] h-[320px] bg-gradient-to-b from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[3px] border-slate-300 dark:border-slate-600 flex flex-col items-center text-center transform transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] group">
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full border-4 border-[var(--bg-primary)] flex items-center justify-center text-white font-black text-xl shadow-lg z-20">2</div>
          <div class="w-32 h-44 rounded-xl overflow-hidden shadow-2xl -mt-12 mb-5 border-4 border-white dark:border-slate-700 bg-white group-hover:scale-105 transition-transform duration-500">
            <img v-if="top3[1].cover_url" :src="top3[1].cover_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><BookOpen class="text-slate-400"/></div>
          </div>
          <h3 class="font-extrabold text-[1.2rem] text-[var(--text-primary)] leading-tight line-clamp-2 mb-2">{{ top3[1].title }}</h3>
          <div class="mt-auto flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[0.85rem] font-bold text-slate-600 dark:text-slate-300">
            <Heart :size="14" class="fill-slate-400 text-slate-400" />
            <span>{{ top3[1].wishlist_count }} Saves</span>
          </div>
        </div>

        <!-- Rank 1 (Gold) -->
        <div v-if="top3[0]" class="relative z-20 w-full md:w-[35%] max-w-[360px] h-[400px] bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/40 dark:to-slate-900 rounded-[3rem] p-6 shadow-[0_30px_60px_rgba(245,158,11,0.15)] border-[4px] border-amber-400 flex flex-col items-center text-center transform transition-all duration-500 hover:-translate-y-6 hover:shadow-[0_40px_80px_rgba(245,158,11,0.25)] group mb-4 md:mb-0">
          <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-400/20 blur-[40px] rounded-full pointer-events-none"></div>
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full border-4 border-[var(--bg-primary)] flex items-center justify-center text-white font-black text-3xl shadow-xl z-20">1</div>
          <div class="w-40 h-56 rounded-2xl overflow-hidden shadow-2xl -mt-14 mb-6 border-[6px] border-white dark:border-amber-500/20 bg-white group-hover:scale-105 transition-transform duration-500 relative">
            <img v-if="top3[0].cover_url" :src="top3[0].cover_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><BookOpen class="text-amber-400"/></div>
            <!-- Crown icon -->
            <div class="absolute -top-2 -right-2 text-amber-400 text-2xl drop-shadow-md rotate-[15deg]">👑</div>
          </div>
          <h3 class="font-extrabold text-[1.4rem] text-[var(--text-primary)] leading-tight line-clamp-2 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500">{{ top3[0].title }}</h3>
          <p class="text-[0.9rem] font-bold text-[var(--text-secondary)] mb-4 truncate w-full">{{ top3[0].author }}</p>
          <div class="mt-auto flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2 rounded-full text-[0.95rem] font-black text-white shadow-md">
            <Heart :size="16" class="fill-white" />
            <span>{{ top3[0].wishlist_count }} Saves</span>
          </div>
        </div>

        <!-- Rank 3 (Bronze) -->
        <div v-if="top3[2]" class="relative z-10 w-full md:w-[30%] max-w-[320px] h-[300px] bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/30 dark:to-slate-900 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[3px] border-orange-300 dark:border-orange-700/50 flex flex-col items-center text-center transform transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)] group">
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-4 border-[var(--bg-primary)] flex items-center justify-center text-white font-black text-xl shadow-lg z-20">3</div>
          <div class="w-32 h-44 rounded-xl overflow-hidden shadow-2xl -mt-12 mb-4 border-4 border-white dark:border-orange-800/40 bg-white group-hover:scale-105 transition-transform duration-500">
            <img v-if="top3[2].cover_url" :src="top3[2].cover_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><BookOpen class="text-orange-400"/></div>
          </div>
          <h3 class="font-extrabold text-[1.1rem] text-[var(--text-primary)] leading-tight line-clamp-2 mb-2">{{ top3[2].title }}</h3>
          <div class="mt-auto flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/30 px-4 py-1.5 rounded-full text-[0.85rem] font-bold text-orange-600 dark:text-orange-400">
            <Heart :size="14" class="fill-orange-400 text-orange-400" />
            <span>{{ top3[2].wishlist_count }} Saves</span>
          </div>
        </div>

      </div>

      <!-- Comprehensive Table of All Trending Books -->
      <div v-if="wishlistStore.popularBooks.length > 0" class="mt-8 bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        <h2 class="text-xl font-extrabold text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <span class="bg-[var(--bg-primary)] px-4 py-1.5 rounded-full border border-[var(--border-color)] text-[0.9rem]">All Trending Books</span>
          <div class="h-px bg-gradient-to-r from-[var(--border-color)] to-transparent flex-1"></div>
        </h2>
        
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr class="border-b border-[var(--border-color)] text-[0.75rem] font-black tracking-wider text-[var(--text-muted)] uppercase">
                <th class="pb-4 px-4 w-24 text-center cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none group/sort" @click="sortAscending = !sortAscending">
                  <div class="flex items-center justify-center gap-1.5">
                    <span>Rank</span>
                    <ArrowUp v-if="sortAscending" :size="14" class="text-pink-500 transition-transform" />
                    <ArrowDown v-else :size="14" class="text-pink-500 transition-transform" />
                  </div>
                </th>
                <th class="pb-4 px-4">Book Details</th>
                <th class="pb-4 px-4">Category</th>
                <th class="pb-4 px-4">Recent Users</th>
                <th class="pb-4 px-4 text-right">Total Saves</th>
              </tr>
            </thead>
            <tbody class="text-[0.9rem]">
              <tr v-for="(book, index) in paginatedBooks" :key="book.id" class="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-primary)]/50 transition-colors group">
                <!-- Rank -->
                <td class="py-4 px-4 text-center">
                  <div class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] font-bold text-[0.9rem] text-[var(--text-secondary)] group-hover:border-pink-500/30 group-hover:text-pink-500 transition-colors">
                    {{ book.rank }}
                  </div>
                </td>
                
                <!-- Book Details -->
                <td class="py-4 px-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-16 rounded-md overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm shrink-0">
                      <img v-if="book.cover_url" :src="book.cover_url" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-[var(--text-muted)]"><BookOpen :size="16" /></div>
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="font-extrabold text-[var(--text-primary)] group-hover:text-pink-500 transition-colors truncate max-w-[300px]">{{ book.title }}</span>
                      <span class="font-medium text-[var(--text-muted)] text-[0.8rem] truncate max-w-[300px]">by {{ book.author }}</span>
                    </div>
                  </div>
                </td>
                
                <!-- Category -->
                <td class="py-4 px-4">
                  <span class="text-[0.7rem] font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md uppercase border border-slate-200 dark:border-slate-700">{{ book.category_name }}</span>
                </td>

                <!-- Recent Users -->
                <td class="py-4 px-4">
                  <div class="flex items-center gap-2">
                    <div class="flex -space-x-1.5">
                      <div v-for="user in book.recent_users?.slice(0, 3) || []" :key="user.id" class="w-6 h-6 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--bg-card)] overflow-hidden shadow-sm" :title="user.name">
                        <img v-if="user.photo" :src="user.photo" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full [background-image:var(--accent-gradient)] text-white flex items-center justify-center text-[0.55rem] font-bold">
                          {{ user.name?.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                    </div>
                    <span v-if="book.wishlist_count > 3" class="text-[0.7rem] font-bold text-[var(--text-muted)]">
                      +{{ book.wishlist_count - 3 }}
                    </span>
                    <span v-else-if="!book.recent_users || book.recent_users.length === 0" class="text-[0.8rem] text-[var(--text-muted)]">-</span>
                  </div>
                </td>

                <!-- Total Saves -->
                <td class="py-4 px-4 text-right">
                  <div class="inline-flex items-center gap-1.5 bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 px-3 py-1.5 rounded-full shadow-sm group-hover:shadow-[0_4px_12px_rgba(236,72,153,0.15)] transition-shadow">
                    <Heart :size="14" class="fill-pink-500 text-pink-500" />
                    <span class="text-[0.85rem] font-bold text-pink-600 dark:text-pink-400">{{ book.wishlist_count }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between border-t border-[var(--border-color)]/50 pt-6">
          <div class="text-[0.85rem] font-bold text-[var(--text-muted)]">
            Showing <span class="text-[var(--text-primary)]">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="text-[var(--text-primary)]">{{ Math.min(currentPage * itemsPerPage, wishlistStore.popularBooks.length) }}</span> of <span class="text-[var(--text-primary)]">{{ wishlistStore.popularBooks.length }}</span> entries
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-bold text-[0.85rem] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div class="flex items-center gap-1">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'w-8 h-8 rounded-lg font-bold text-[0.85rem] transition-colors flex items-center justify-center',
                  currentPage === page 
                    ? 'bg-pink-500 text-white shadow-md' 
                    : 'bg-transparent text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] font-bold text-[0.85rem] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useWishlistStore } from '../../stores/wishlist';
import { Heart, HeartOff, BookOpen, ArrowUp, ArrowDown } from 'lucide-vue-next';

const wishlistStore = useWishlistStore();
const loading = ref(true);

const currentPage = ref(1);
const itemsPerPage = 10;
const sortAscending = ref(true);

const sortedBooks = computed(() => {
  const booksWithRank = wishlistStore.popularBooks.map((book, idx) => ({
    ...book,
    rank: idx + 1
  }));
  
  if (!sortAscending.value) {
    return [...booksWithRank].reverse();
  }
  return booksWithRank;
});

const totalPages = computed(() => {
  return Math.ceil(sortedBooks.value.length / itemsPerPage) || 1;
});

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedBooks.value.slice(start, end);
});

const top3 = computed(() => {
  return wishlistStore.popularBooks.slice(0, 3);
});

onMounted(async () => {
  // Fetch from store, taking advantage of caching. We force refresh if it's completely empty just in case.
  await wishlistStore.fetchPopularBooks(wishlistStore.popularBooks.length === 0);
  loading.value = false;
});
</script>
