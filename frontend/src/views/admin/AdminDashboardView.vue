<template>
  <div class="flex items-start min-h-screen w-full">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 py-6 px-8 pb-16 w-[calc(100%-280px)] max-w-none">
      <header class="flex justify-between items-end mb-8">
        <div>
          <span class="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-[#8b5cf6] uppercase tracking-[0.05em] mb-1.5"><ShieldCheck :size="14" /> {{ localeStore.t('adminPortal') }}</span>
          <h1 class="text-[2.2rem] font-extrabold">{{ localeStore.t('overviewTitle') }}</h1>
          <p class="text-[var(--text-secondary)]">{{ localeStore.t('overviewSubtitle') }}</p>
        </div>
        <div class="header-actions">
          <router-link to="/admin/books" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[0.85rem] font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Plus :size="16" stroke-width="2" /> {{ localeStore.t('addNewBook') }}
          </router-link>
        </div>
      </header>

      <!-- Premium Glassmorphic Skeleton Loader -->
      <div v-if="borrowingsStore.loading && !borrowingsStore.dashboardStats" class="animate-pulse">
        <!-- KPI Skeleton Grid -->
        <section class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-8">
          <div v-for="i in 6" :key="'kpi-skel-'+i" class="flex items-center gap-5 p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm opacity-70">
            <div class="w-12 h-12 rounded-[14px] bg-[var(--border-color)]"></div>
            <div class="flex flex-col gap-2 flex-1">
              <div class="h-7 bg-[var(--border-color)] rounded-md w-1/2"></div>
              <div class="h-3 bg-[var(--border-color)] rounded-md w-3/4"></div>
            </div>
          </div>
        </section>

        <!-- Chart Skeleton -->
        <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm p-6 h-[300px] mb-8 opacity-70 flex flex-col gap-4">
          <div class="h-6 bg-[var(--border-color)] rounded-md w-1/4"></div>
          <div class="flex-1 border-b border-[var(--border-color)] flex items-end gap-2 pb-4">
            <div v-for="i in 12" :key="'bar-'+i" class="flex-1 bg-[var(--border-color)] rounded-t-md" :style="{ height: `${Math.random() * 60 + 20}%` }"></div>
          </div>
        </div>

        <!-- Table Skeleton -->
        <section class="p-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm mt-8 opacity-70">
          <div class="h-6 bg-[var(--border-color)] rounded-md w-1/4 mb-5"></div>
          <div class="flex flex-col gap-3">
            <div class="h-10 bg-[var(--border-color)] rounded-md w-full"></div>
            <div v-for="i in 4" :key="'row-'+i" class="h-14 bg-[var(--border-color)] rounded-md w-full opacity-50"></div>
          </div>
        </section>
      </div>

      <template v-else-if="stats">
        <!-- Premium Metrics KPI Grid -->
        <section class="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-10">
          <!-- Total Books -->
          <div class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
            <div class="flex items-start justify-between mb-4 relative z-10">
              <span class="text-[0.75rem] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.08em] mt-2">{{ localeStore.t('totalBooks') }}</span>
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/20 dark:to-indigo-500/5 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-500/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <BookOpen :size="22" stroke-width="2.5" />
              </div>
            </div>
            <span class="text-[2.5rem] font-black text-[var(--text-primary)] tracking-tight leading-none relative z-10">{{ stats.total_books }}</span>
          </div>

          <!-- Registered Members -->
          <div class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500"></div>
            <div class="flex items-start justify-between mb-4 relative z-10">
              <span class="text-[0.75rem] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.08em] mt-2">{{ localeStore.t('registeredMembers') }}</span>
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/20 dark:to-blue-500/5 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-500/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Users :size="22" stroke-width="2.5" />
              </div>
            </div>
            <span class="text-[2.5rem] font-black text-[var(--text-primary)] tracking-tight leading-none relative z-10">{{ stats.total_users }}</span>
          </div>

          <!-- Currently Borrowed -->
          <div class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
            <div class="flex items-start justify-between mb-4 relative z-10">
              <span class="text-[0.75rem] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.08em] mt-2">{{ localeStore.t('currentlyBorrowed') }}</span>
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/5 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-500/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <BookmarkCheck :size="22" stroke-width="2.5" />
              </div>
            </div>
            <span class="text-[2.5rem] font-black text-[var(--text-primary)] tracking-tight leading-none relative z-10">{{ stats.active_borrowings }}</span>
          </div>

          <!-- Pending Requests -->
          <div class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-500"></div>
            <div class="flex items-start justify-between mb-4 relative z-10">
              <span class="text-[0.75rem] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.08em] mt-2">{{ localeStore.t('pendingRequests') }}</span>
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/20 dark:to-amber-500/5 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-500/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Clock :size="22" stroke-width="2.5" />
              </div>
            </div>
            <span class="text-[2.5rem] font-black text-[var(--text-primary)] tracking-tight leading-none relative z-10">{{ stats.pending_requests }}</span>
          </div>

          <!-- Overdue Books -->
          <div class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors duration-500"></div>
            <div class="flex items-start justify-between mb-4 relative z-10">
              <span class="text-[0.75rem] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.08em] mt-2">{{ localeStore.t('overdueBooks') }}</span>
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/20 dark:to-rose-500/5 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-500/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <AlertTriangle :size="22" stroke-width="2.5" />
              </div>
            </div>
            <span class="text-[2.5rem] font-black text-rose-500 dark:text-rose-400 tracking-tight leading-none relative z-10">{{ stats.overdue_count }}</span>
          </div>

          <!-- Active Readers Online -->
          <div class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-colors duration-500"></div>
            <div class="flex items-start justify-between mb-4 relative z-10">
              <span class="text-[0.75rem] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.08em] mt-2">Active Readers</span>
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-500/20 dark:to-teal-500/5 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50 dark:border-teal-500/30 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <Eye :size="22" stroke-width="2.5" />
              </div>
            </div>
            <div class="flex items-center gap-3 relative z-10">
              <span class="text-[2.5rem] font-black text-[var(--text-primary)] tracking-tight leading-none">{{ liveReadersCount }}</span>
              <span class="flex h-3 w-3 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
            </div>
          </div>
        </section>

        <!-- Visual Analytics Charts -->
        <AdminCharts :stats="stats" />

        <!-- Recent Activity Feed -->
        <section class="p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-10">
          <div class="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-4">
            <h3 class="text-[1.3rem] font-extrabold text-[var(--text-primary)] tracking-tight">
              {{ localeStore.t('recentRequests') || 'Recent Activity Feed' }}
            </h3>
            <router-link to="/admin/borrowings" class="text-[0.85rem] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 transition-all group bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-lg">
              {{ localeStore.t('viewAllRequests') || 'View All Requests' }} <ArrowRight :size="16" class="group-hover:translate-x-1 transition-transform" />
            </router-link>
          </div>

          <div class="overflow-x-auto rounded-xl border border-[var(--border-color)]">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th class="px-5 py-4 bg-gray-500/5 text-[var(--text-muted)] font-extrabold uppercase text-[0.72rem] tracking-wider border-b border-[var(--border-color)]">{{ localeStore.t('member') }}</th>
                  <th class="px-5 py-4 bg-gray-500/5 text-[var(--text-muted)] font-extrabold uppercase text-[0.72rem] tracking-wider border-b border-[var(--border-color)]">{{ localeStore.t('bookTitle') }}</th>
                  <th class="px-5 py-4 bg-gray-500/5 text-[var(--text-muted)] font-extrabold uppercase text-[0.72rem] tracking-wider border-b border-[var(--border-color)]">{{ localeStore.t('requestedDate') }}</th>
                  <th class="px-5 py-4 bg-gray-500/5 text-[var(--text-muted)] font-extrabold uppercase text-[0.72rem] tracking-wider border-b border-[var(--border-color)]">{{ localeStore.t('dueDate') }}</th>
                  <th class="px-5 py-4 bg-gray-500/5 text-[var(--text-muted)] font-extrabold uppercase text-[0.72rem] tracking-wider border-b border-[var(--border-color)]">{{ localeStore.t('status') }}</th>
                  <th class="px-5 py-4 bg-gray-500/5 text-[var(--text-muted)] font-extrabold uppercase text-[0.72rem] tracking-wider border-b border-[var(--border-color)] text-right">{{ localeStore.t('action') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border-color)]">
                <tr v-for="item in stats.recent_activity" :key="item.id" class="hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition-all duration-200 group border-b border-[var(--border-color)] last:border-0">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black text-[1rem] shrink-0 border border-indigo-200/50 dark:border-indigo-500/20 shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative">
                        <img v-if="item.profile_photo" :src="item.profile_photo" class="w-full h-full object-cover" />
                        <template v-else>{{ (item.user_name || 'G').charAt(0).toUpperCase() }}</template>
                      </div>
                      <div class="flex flex-col">
                        <span class="font-extrabold text-[var(--text-primary)] text-[0.95rem] tracking-tight">{{ item.user_name }}</span>
                        <span class="text-[0.75rem] text-[var(--text-muted)] font-medium">{{ item.user_email }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="text-[0.95rem] font-bold text-[var(--text-primary)] max-w-[280px] truncate" :title="item.book_title">
                      {{ item.book_title }}
                    </div>
                  </td>
                  <td class="px-5 py-4 text-[0.85rem] text-[var(--text-secondary)] font-semibold">{{ formatDate(item.borrow_date) }}</td>
                  <td class="px-5 py-4 text-[0.85rem] text-[var(--text-secondary)] font-semibold">{{ formatDate(item.due_date) }}</td>
                  <td class="px-5 py-4">
                    <span :class="getStatusClass(item.status)" class="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[0.7rem] font-extrabold uppercase tracking-widest border">
                      {{ localeStore.t(item.status) || item.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <router-link to="/admin/borrowings" class="inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 ease-out active:scale-95 px-4 py-2 text-[0.8rem] bg-white dark:bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 border border-[var(--border-color)] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:-translate-y-px shadow-sm">
                      {{ localeStore.t('manage') || 'Manage' }}
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useBorrowingsStore } from '../../stores/borrowings';
import { useAuthStore } from '../../stores/auth';
import { useLocaleStore } from '../../stores/locale';
import AdminSidebar from '../../components/AdminSidebar.vue';
import AdminCharts from '../../components/AdminCharts.vue';
import { ShieldCheck, Plus, BookOpen, Users, BookmarkCheck, Clock, AlertTriangle, Loader2, Eye, Activity, ArrowRight } from 'lucide-vue-next';

const borrowingsStore = useBorrowingsStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();

const stats = computed(() => borrowingsStore.dashboardStats);
const liveReadersCount = ref(0);
let liveTimer = null;

async function fetchLiveReaders() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/digital-reads/live`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      liveReadersCount.value = data.length;
    }
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  borrowingsStore.fetchAdminDashboardStats();
  fetchLiveReaders();
  liveTimer = setInterval(fetchLiveReaders, 25000);
});

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer);
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'returned': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    case 'approved': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'overdue': return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    default: return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20';
  }
}
</script>


