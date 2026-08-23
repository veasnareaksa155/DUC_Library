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
        <!-- Metrics KPI Grid -->
        <section class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-8">
          <div class="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[0.8rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{{ localeStore.t('totalBooks') }}</span>
              <div class="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                <BookOpen :size="16" stroke-width="2" />
              </div>
            </div>
            <span class="text-[2rem] font-extrabold text-[var(--text-primary)] leading-none">{{ stats.total_books }}</span>
          </div>

          <div class="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[0.8rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{{ localeStore.t('registeredMembers') }}</span>
              <div class="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
                <Users :size="16" stroke-width="2" />
              </div>
            </div>
            <span class="text-[2rem] font-extrabold text-[var(--text-primary)] leading-none">{{ stats.total_users }}</span>
          </div>

          <div class="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[0.8rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{{ localeStore.t('currentlyBorrowed') }}</span>
              <div class="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                <BookmarkCheck :size="16" stroke-width="2" />
              </div>
            </div>
            <span class="text-[2rem] font-extrabold text-[var(--text-primary)] leading-none">{{ stats.active_borrowings }}</span>
          </div>

          <div class="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[0.8rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{{ localeStore.t('pendingRequests') }}</span>
              <div class="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-500/20">
                <Clock :size="16" stroke-width="2" />
              </div>
            </div>
            <span class="text-[2rem] font-extrabold text-[var(--text-primary)] leading-none">{{ stats.pending_requests }}</span>
          </div>

          <div class="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[0.8rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{{ localeStore.t('overdueBooks') }}</span>
              <div class="w-8 h-8 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-500/20">
                <AlertTriangle :size="16" stroke-width="2" />
              </div>
            </div>
            <span class="text-[2rem] font-extrabold text-[var(--text-primary)] leading-none">{{ stats.overdue_count }}</span>
          </div>

          <div class="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[0.8rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Active Readers Online</span>
              <div class="w-8 h-8 rounded-md bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-500/20">
                <Eye :size="16" stroke-width="2" />
              </div>
            </div>
            <span class="text-[2rem] font-extrabold text-[var(--text-primary)] leading-none highlight-live">{{ stats.active_readers_count || 0 }}</span>
          </div>
        </section>

        <!-- Visual Analytics Charts -->
        <AdminCharts :stats="stats" />

        <!-- Recent Activity Feed -->
        <section class="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm mt-8">
          <div class="flex justify-between items-center mb-6 border-b border-[var(--border-color)] pb-4">
            <h3 class="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {{ localeStore.t('recentRequests') || 'Recent Activity Feed' }}
            </h3>
            <router-link to="/admin/borrowings" class="text-[0.85rem] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-all group bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-md">
              {{ localeStore.t('viewAllRequests') || 'View All Requests' }} <ArrowRight :size="14" class="group-hover:translate-x-0.5 transition-transform" />
            </router-link>
          </div>

          <div class="overflow-x-auto rounded-md border border-[var(--border-color)]">
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
                <tr v-for="item in stats.recent_activity" :key="item.id" class="hover:bg-gray-500/5 transition-colors duration-200 group">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-[0.9rem] shrink-0 border border-indigo-500/20">
                        {{ (item.user_name || 'G').charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-extrabold text-[var(--text-primary)] text-[0.92rem]">{{ item.user_name }}</span>
                        <span class="text-[0.75rem] text-[var(--text-muted)] font-medium">{{ item.user_email }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-[0.92rem] font-bold text-[var(--text-primary)] max-w-[250px] truncate" :title="item.book_title">
                    {{ item.book_title }}
                  </td>
                  <td class="px-5 py-4 text-[0.88rem] text-[var(--text-secondary)] font-medium">{{ formatDate(item.borrow_date) }}</td>
                  <td class="px-5 py-4 text-[0.88rem] text-[var(--text-secondary)] font-medium">{{ formatDate(item.due_date) }}</td>
                  <td class="px-5 py-4">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700" :class="`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700-${item.status}`">{{ localeStore.t(item.status) || item.status }}</span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <router-link to="/admin/borrowings" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/30 transition-all font-bold px-4">
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
import { computed, onMounted } from 'vue';
import { useBorrowingsStore } from '../../stores/borrowings';
import { useLocaleStore } from '../../stores/locale';
import AdminSidebar from '../../components/AdminSidebar.vue';
import AdminCharts from '../../components/AdminCharts.vue';
import { ShieldCheck, Plus, BookOpen, Users, BookmarkCheck, Clock, AlertTriangle, Loader2, Eye, Activity, ArrowRight } from 'lucide-vue-next';

const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();

const stats = computed(() => borrowingsStore.dashboardStats);

onMounted(() => {
  borrowingsStore.fetchAdminDashboardStats();
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>


