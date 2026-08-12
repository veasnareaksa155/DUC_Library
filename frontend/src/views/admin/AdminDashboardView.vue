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
          <router-link to="/admin/books" class="btn btn-primary btn-sm">
            <Plus :size="16" /> {{ localeStore.t('addNewBook') }}
          </router-link>
        </div>
      </header>

      <!-- Premium Glassmorphic Skeleton Loader -->
      <div v-if="borrowingsStore.loading && !borrowingsStore.dashboardStats" class="animate-pulse">
        <!-- KPI Skeleton Grid -->
        <section class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-8">
          <div v-for="i in 6" :key="'kpi-skel-'+i" class="flex items-center gap-5 p-5 glass-panel opacity-70">
            <div class="w-12 h-12 rounded-[14px] bg-[var(--border-color)]"></div>
            <div class="flex flex-col gap-2 flex-1">
              <div class="h-7 bg-[var(--border-color)] rounded-md w-1/2"></div>
              <div class="h-3 bg-[var(--border-color)] rounded-md w-3/4"></div>
            </div>
          </div>
        </section>

        <!-- Chart Skeleton -->
        <div class="glass-panel p-6 h-[300px] mb-8 opacity-70 flex flex-col gap-4">
          <div class="h-6 bg-[var(--border-color)] rounded-md w-1/4"></div>
          <div class="flex-1 border-b border-[var(--border-color)] flex items-end gap-2 pb-4">
            <div v-for="i in 12" :key="'bar-'+i" class="flex-1 bg-[var(--border-color)] rounded-t-md" :style="{ height: `${Math.random() * 60 + 20}%` }"></div>
          </div>
        </div>

        <!-- Table Skeleton -->
        <section class="p-7 glass-panel mt-8 opacity-70">
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
          <div class="flex items-center gap-5 p-5 glass-panel">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600"><BookOpen :size="24" /></div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none">{{ stats.total_books }}</span>
              <span class="text-[0.78rem] text-[var(--text-secondary)] mt-1">{{ localeStore.t('totalBooks') }}</span>
            </div>
          </div>

          <div class="flex items-center gap-5 p-5 glass-panel">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-blue-500 to-blue-600"><Users :size="24" /></div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none">{{ stats.total_users }}</span>
              <span class="text-[0.78rem] text-[var(--text-secondary)] mt-1">{{ localeStore.t('registeredMembers') }}</span>
            </div>
          </div>

          <div class="flex items-center gap-5 p-5 glass-panel">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600"><BookmarkCheck :size="24" /></div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none">{{ stats.active_borrowings }}</span>
              <span class="text-[0.78rem] text-[var(--text-secondary)] mt-1">{{ localeStore.t('currentlyBorrowed') }}</span>
            </div>
          </div>

          <div class="flex items-center gap-5 p-5 glass-panel">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-amber-500 to-amber-600"><Clock :size="24" /></div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none">{{ stats.pending_requests }}</span>
              <span class="text-[0.78rem] text-[var(--text-secondary)] mt-1">{{ localeStore.t('pendingRequests') }}</span>
            </div>
          </div>

          <div class="flex items-center gap-5 p-5 glass-panel">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-rose-500 to-rose-600"><AlertTriangle :size="24" /></div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none">{{ stats.overdue_count }}</span>
              <span class="text-[0.78rem] text-[var(--text-secondary)] mt-1">{{ localeStore.t('overdueBooks') }}</span>
            </div>
          </div>

          <div class="flex items-center gap-5 p-5 glass-panel">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-teal-500 to-teal-600"><Eye :size="24" /></div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none highlight-live">{{ stats.active_readers_count || 0 }}</span>
              <span class="text-[0.78rem] text-[var(--text-secondary)] mt-1">Active Readers Online</span>
            </div>
          </div>
        </section>

        <!-- Visual Analytics Charts -->
        <AdminCharts :stats="stats" />

        <!-- Recent Activity Feed -->
        <section class="p-7 glass-panel mt-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-[1.2rem] font-extrabold flex items-center gap-2">
              <Activity :size="20" class="text-indigo-500" stroke-width="2.5" /> 
              {{ localeStore.t('recentRequests') || 'Recent Activity Feed' }}
            </h3>
            <router-link to="/admin/borrowings" class="text-[0.88rem] text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1 transition-all group">
              {{ localeStore.t('viewAllRequests') || 'View All Requests' }} <ArrowRight :size="14" class="group-hover:translate-x-1 transition-transform" />
            </router-link>
          </div>

          <div class="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-color)]">
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
                    <span class="badge" :class="`badge-${item.status}`">{{ localeStore.t(item.status) || item.status }}</span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <router-link to="/admin/borrowings" class="btn btn-sm bg-gray-500/5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/30 transition-all font-bold px-4">
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


