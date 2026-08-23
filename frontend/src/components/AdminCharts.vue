<template>
  <div class="grid grid-cols-[1.6fr_1fr] max-lg:grid-cols-1 gap-5 mb-8">
    <!-- Bar Chart: Monthly Activity Trends -->
    <div class="p-6 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h3 class="text-[1.1rem] font-bold">Monthly Borrowing & Return Trends</h3>
          <p class="text-[0.8rem] text-[var(--text-muted)]">Annual borrowing activity breakdown (2026)</p>
        </div>
        <div class="flex gap-[0.85rem] text-[0.8rem] text-[var(--text-secondary)]">
          <span class="flex items-center gap-[0.35rem] font-semibold"><span class="w-[9px] h-[9px] rounded-full inline-block bg-indigo-500"></span> Borrowed</span>
          <span class="flex items-center gap-[0.35rem] font-semibold"><span class="w-[9px] h-[9px] rounded-full inline-block bg-emerald-500"></span> Returned</span>
        </div>
      </div>

      <div class="w-full h-[200px]">
        <svg viewBox="0 0 500 180" class="w-full h-full">
          <!-- Horizontal Grid lines -->
          <line x1="30" y1="30" x2="480" y2="30" class="stroke-[rgba(125,125,125,0.12)] [stroke-dasharray:4_4]" />
          <line x1="30" y1="75" x2="480" y2="75" class="stroke-[rgba(125,125,125,0.12)] [stroke-dasharray:4_4]" />
          <line x1="30" y1="120" x2="480" y2="120" class="stroke-[rgba(125,125,125,0.12)] [stroke-dasharray:4_4]" />
          <line x1="30" y1="150" x2="480" y2="150" class="stroke-[var(--border-color)] stroke-[1.5]" />

          <!-- Monthly Bar Groups (Jan to Dec) -->
          <g v-for="(m, i) in monthlyData" :key="i" :transform="`translate(${45 + i * 36}, 0)`">
            <!-- Borrowed Bar -->
            <rect 
              :x="0" 
              :y="150 - (m.borrowed ? Math.max(8, (m.borrowed / (maxVal || 1)) * 120) : 0)" 
              width="11" 
              :height="m.borrowed ? Math.max(8, (m.borrowed / (maxVal || 1)) * 120) : 0" 
              rx="3"
              class="transition-all duration-500 ease-[var(--spring-ease)] hover:opacity-85 hover:cursor-pointer fill-indigo-500"
            >
              <title>{{ m.month }}: {{ m.borrowed }} Borrowed</title>
            </rect>

            <!-- Returned Bar -->
            <rect 
              :x="13" 
              :y="150 - (m.returned ? Math.max(8, (m.returned / (maxVal || 1)) * 120) : 0)" 
              width="11" 
              :height="m.returned ? Math.max(8, (m.returned / (maxVal || 1)) * 120) : 0" 
              rx="3"
              class="transition-all duration-500 ease-[var(--spring-ease)] hover:opacity-85 hover:cursor-pointer fill-emerald-500"
            >
              <title>{{ m.month }}: {{ m.returned }} Returned</title>
            </rect>

            <!-- Month Label -->
            <text :x="11" y="168" text-anchor="middle" class="text-[10px] fill-[var(--text-muted)] font-semibold">{{ m.month }}</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- Doughnut Chart & Category Breakdown -->
    <div class="p-6 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <div class="flex justify-between items-start mb-5">
        <div>
          <h3 class="text-[1.1rem] font-bold">Borrowing Status Distribution</h3>
          <p class="text-[0.8rem] text-[var(--text-muted)]">Real-time status metrics of all requests</p>
        </div>
      </div>

      <div class="flex items-center gap-6 my-auto">
        <div class="relative w-[120px] h-[120px] shrink-0">
          <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="rgba(125,125,125,0.1)" 
              stroke-width="12" 
            />
            <!-- Approved Arc -->
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="#3b82f6" 
              stroke-width="12" 
              :stroke-dasharray="`${statusPercent.approved * 2.38} 238`"
              stroke-dashoffset="0"
              class="transition-all duration-700 ease-[var(--spring-ease)]"
            />
            <!-- Returned Arc -->
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="#10b981" 
              stroke-width="12" 
              :stroke-dasharray="`${statusPercent.returned * 2.38} 238`"
              :stroke-dashoffset="`-${statusPercent.approved * 2.38}`"
              class="transition-all duration-700 ease-[var(--spring-ease)]"
            />
            <!-- Pending Arc -->
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="#f59e0b" 
              stroke-width="12" 
              :stroke-dasharray="`${statusPercent.pending * 2.38} 238`"
              :stroke-dashoffset="`-${(statusPercent.approved + statusPercent.returned) * 2.38}`"
              class="transition-all duration-700 ease-[var(--spring-ease)]"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[1.4rem] font-extrabold leading-none">{{ totalCount }}</span>
            <span class="text-[0.7rem] text-[var(--text-muted)] uppercase">Total</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 flex-1">
          <div class="flex items-center gap-2 text-[0.85rem]">
            <span class="w-[9px] h-[9px] rounded-full inline-block bg-blue-500"></span>
            <span class="text-[var(--text-secondary)] flex-1">Approved</span>
            <span class="font-bold text-[var(--text-primary)]">{{ stats?.active_borrowings || 0 }}</span>
          </div>

          <div class="flex items-center gap-2 text-[0.85rem]">
            <span class="w-[9px] h-[9px] rounded-full inline-block bg-amber-500"></span>
            <span class="text-[var(--text-secondary)] flex-1">Pending</span>
            <span class="font-bold text-[var(--text-primary)]">{{ stats?.pending_requests || 0 }}</span>
          </div>

          <div class="flex items-center gap-2 text-[0.85rem]">
            <span class="w-[9px] h-[9px] rounded-full inline-block bg-emerald-500"></span>
            <span class="text-[var(--text-secondary)] flex-1">Returned</span>
            <span class="font-bold text-[var(--text-primary)]">{{ returnedCount }}</span>
          </div>

          <div class="flex items-center gap-2 text-[0.85rem]">
            <span class="w-[9px] h-[9px] rounded-full inline-block bg-rose-500"></span>
            <span class="text-[var(--text-secondary)] flex-1">Overdue</span>
            <span class="font-bold text-[var(--text-primary)]">{{ stats?.overdue_count || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Unified Single Live & Periodic Library Analytics Card -->
    <div class="p-6 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm col-span-full mt-4">
      <div class="flex justify-between items-start mb-5 flex-wrap gap-3">
        <div>
          <h3 class="flex items-center gap-2 text-[1.1rem] font-bold">
            <span class="w-[10px] h-[10px] rounded-full bg-emerald-500 inline-block animate-[pulse-ring_1.8s_infinite]"></span> Live & Periodic Library Analytics
          </h3>
          <p class="text-[0.8rem] text-[var(--text-muted)]">Real-time student readers online & official activity reports for {{ currentPeriodName }}</p>
        </div>

        <div class="flex items-center gap-[0.4rem] flex-wrap">
          <div class="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-[0.85rem] py-[0.35rem] rounded-full text-[0.85rem] font-bold mr-2">
            🟢 <strong>{{ stats?.active_readers_count || 0 }}</strong> Online Now
          </div>

          <button 
            @click="fetchReport('1day')" 
            class="px-[0.75rem] py-[0.35rem] rounded-full bg-[rgba(125,125,125,0.1)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400" 
            :class="{ '!bg-gradient-to-r !from-indigo-500 !to-indigo-600 !text-white !border-transparent shadow-sm': currentPeriod === '1day' }"
          >
            Today (1 Day)
          </button>
          <button 
            @click="fetchReport('1week')" 
            class="px-[0.75rem] py-[0.35rem] rounded-full bg-[rgba(125,125,125,0.1)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400" 
            :class="{ '!bg-gradient-to-r !from-indigo-500 !to-indigo-600 !text-white !border-transparent shadow-sm': currentPeriod === '1week' }"
          >
            This Week (7 Days)
          </button>
          <button 
            @click="fetchReport('1month')" 
            class="px-[0.75rem] py-[0.35rem] rounded-full bg-[rgba(125,125,125,0.1)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400" 
            :class="{ '!bg-gradient-to-r !from-indigo-500 !to-indigo-600 !text-white !border-transparent shadow-sm': currentPeriod === '1month' }"
          >
            This Month (30 Days)
          </button>
          <button 
            @click="fetchReport('all')" 
            class="px-[0.75rem] py-[0.35rem] rounded-full bg-[rgba(125,125,125,0.1)] border border-[var(--border-color)] text-[var(--text-secondary)] text-[0.8rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400" 
            :class="{ '!bg-gradient-to-r !from-indigo-500 !to-indigo-600 !text-white !border-transparent shadow-sm': currentPeriod === 'all' }"
          >
            All Time
          </button>

          <button @click="printOfficialReport" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md px-4 py-2 text-sm ml-2 font-bold">
            🖨️ Export / Print Report
          </button>
        </div>
      </div>

      <div v-if="reportLoading" class="flex items-center justify-center gap-3 p-12 text-[var(--text-muted)]">
        <Loader2 :size="24" class="animate-spin" /> Generating {{ currentPeriodName }} Analytics Report...
      </div>

      <div v-else-if="reportData" class="mt-6">
        <!-- Report Metrics Summary Row -->
        <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-6">
          <div class="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white/5 border border-[var(--border-color)] hover:border-indigo-500/30 transition-all duration-300">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
              <Activity :size="24" stroke-width="2.5" />
            </div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none text-[var(--text-primary)]">{{ reportData.total_reads }}</span>
              <span class="text-[0.78rem] text-[var(--text-muted)] font-semibold mt-1">Total Borrowing Activity</span>
            </div>
          </div>

          <div class="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white/5 border border-[var(--border-color)] hover:border-blue-500/30 transition-all duration-300">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <BookCopy :size="24" stroke-width="2.5" />
            </div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none text-[var(--text-primary)]">{{ reportData.borrowings_summary?.total_borrowings || 0 }}</span>
              <span class="text-[0.78rem] text-[var(--text-muted)] font-semibold mt-1">Physical Borrowings</span>
            </div>
          </div>

          <div class="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white/5 border border-[var(--border-color)] hover:border-emerald-500/30 transition-all duration-300">
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
              <ArrowDownToLine :size="24" stroke-width="2.5" />
            </div>
            <div class="flex flex-col">
              <span class="text-[1.75rem] font-extrabold leading-none text-emerald-500">{{ reportData.borrowings_summary?.total_returned || 0 }}</span>
              <span class="text-[0.78rem] text-[var(--text-muted)] font-semibold mt-1">Books Returned</span>
            </div>
          </div>

          <div class="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm bg-white/5 border border-[var(--border-color)] hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
            <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 blur-[20px] rounded-full pointer-events-none"></div>
            <div class="w-12 h-12 rounded-[14px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 shadow-md relative z-10">
              <Users :size="24" stroke-width="2.5" />
            </div>
            <div class="flex flex-col relative z-10">
              <span class="text-[1.75rem] font-extrabold leading-none text-purple-500 flex items-center gap-2">
                {{ stats?.active_readers_count || 0 }}
                <span v-if="stats?.active_readers_count > 0" class="w-[8px] h-[8px] rounded-full bg-emerald-500 inline-block animate-[pulse-ring_1.8s_infinite] mb-2"></span>
              </span>
              <span class="text-[0.78rem] text-[var(--text-muted)] font-semibold mt-1">Live Active Readers Online</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          <!-- Left Column: Current Active Readers & Top Student Borrowers -->
          <div>
            <!-- 1. Current Active Readers (Right Now) -->
            <div class="bg-[rgba(125,125,125,0.03)] p-5 rounded-[var(--radius-md)] border border-[var(--border-color)] mb-4">
              <h4 class="text-[0.95rem] font-bold mb-4 text-[var(--text-primary)]">🟢 Current Active Readers (Right Now)</h4>
              <div v-if="!stats?.active_readers_detail || stats.active_readers_detail.length === 0" class="bg-[rgba(125,125,125,0.05)] p-8 rounded-[var(--radius-md)] text-center">
                <p class="text-[var(--text-muted)]">No students are currently reading online right now.</p>
              </div>
              <div v-else class="flex flex-col gap-3">
                <div v-for="item in stats.active_readers_detail" :key="item.session_db_id || item.session_id" class="flex items-center gap-4 px-4 py-3 bg-[rgba(125,125,125,0.06)] border border-[var(--border-color)] rounded-[var(--radius-md)]">
                  <div class="w-[38px] h-[38px] rounded-full bg-[var(--accent-gradient)] text-white flex items-center justify-center font-bold text-[0.95rem] overflow-hidden shrink-0">
                    <img v-if="item.profile_photo" :src="item.profile_photo" class="w-full h-full object-cover" />
                    <span v-else>{{ (item.user_name || 'G').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="text-[0.92rem] font-bold text-[var(--text-primary)] flex items-center gap-[0.4rem] flex-wrap">
                      {{ item.name_khmer || item.user_name || 'Guest Student' }}
                      <span v-if="item.student_id" class="bg-indigo-500/18 text-indigo-400 px-2 py-[0.1rem] rounded-full text-[0.72rem] font-bold">{{ item.student_id }}</span>
                      <span v-if="item.dorm_room" class="bg-emerald-500/15 text-emerald-500 px-2 py-[0.1rem] rounded-full text-[0.72rem] font-bold">Room {{ item.dorm_room }}</span>
                    </div>
                    <div class="text-[0.82rem] text-[var(--text-secondary)] mt-[0.15rem]">📖 Reading: <strong>{{ item.book_title }}</strong></div>
                    <div class="inline-flex items-center gap-[0.35rem] text-[0.78rem] text-emerald-500 font-semibold mt-1">
                      <span class="w-[6px] h-[6px] rounded-full bg-emerald-500 inline-block animate-[pulse-ring_1.8s_infinite]"></span> Active Online Now
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Top Active Student Borrowers -->
            <div class="bg-[rgba(125,125,125,0.03)] p-5 rounded-[var(--radius-md)] border border-[var(--border-color)]">
              <h4 class="text-[0.95rem] font-bold mb-4 text-[var(--text-primary)]">🏆 Top Active Student Borrowers ({{ reportData.period_name }})</h4>
              <div v-if="!reportData.top_readers || reportData.top_readers.length === 0" class="bg-[rgba(125,125,125,0.05)] p-8 rounded-[var(--radius-md)] text-center">
                <p class="text-[var(--text-muted)]">No borrowing activity recorded for {{ reportData.period_name }}.</p>
              </div>
              <div v-else class="flex flex-col gap-[0.65rem] mt-4">
                <div v-for="(r, idx) in reportData.top_readers" :key="r.id" class="flex items-center gap-3 px-[0.85rem] py-[0.65rem] bg-[rgba(125,125,125,0.05)] rounded-[var(--radius-sm)] border border-[var(--border-color)]">
                  <span class="font-extrabold text-[var(--accent-primary)] min-w-[24px]">#{{ idx + 1 }}</span>
                  <div class="w-[38px] h-[38px] rounded-full bg-[var(--accent-gradient)] text-white flex items-center justify-center font-bold text-[0.95rem] overflow-hidden shrink-0">
                    <img v-if="r.profile_photo" :src="r.profile_photo" class="w-full h-full object-cover" />
                    <span v-else>{{ (r.name || 'S').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1">
                    <div class="text-[0.88rem] font-bold">{{ r.name_khmer || r.name }}</div>
                    <div class="text-[0.75rem] text-[var(--text-muted)] font-mono">{{ r.student_id || r.email }}</div>
                  </div>
                  <div class="bg-indigo-500/12 text-[var(--accent-primary)] px-[0.65rem] py-[0.25rem] rounded-full text-[0.78rem] font-bold">
                    📖 <strong>{{ r.read_sessions }}</strong> Activity
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Top Popular Books -->
          <div>
            <div class="bg-[rgba(125,125,125,0.03)] p-5 rounded-[var(--radius-md)] border border-[var(--border-color)] h-full">
              <h4 class="text-[0.95rem] font-bold mb-4 text-[var(--text-primary)]">🔥 Top Popular Books ({{ reportData.period_name }})</h4>
              <div v-if="!reportData.top_books || reportData.top_books.length === 0" class="bg-[rgba(125,125,125,0.05)] p-8 rounded-[var(--radius-md)] text-center">
                <p class="text-[var(--text-muted)]">No book borrowing activity recorded for {{ reportData.period_name }}.</p>
              </div>
              <div v-else class="flex flex-col gap-[0.65rem] mt-4">
                <div v-for="(b, idx) in reportData.top_books" :key="b.id" class="flex items-center gap-3 px-[0.85rem] py-[0.65rem] bg-[rgba(125,125,125,0.05)] rounded-[var(--radius-sm)] border border-[var(--border-color)]">
                  <span class="font-extrabold text-[var(--accent-primary)] min-w-[24px]">#{{ idx + 1 }}</span>
                  <img :src="b.cover_url || fallbackCover" class="w-[32px] h-[44px] object-cover rounded" />
                  <div class="flex-1">
                    <div class="text-[0.88rem] font-bold">{{ b.title }}</div>
                    <div class="text-[0.75rem] text-[var(--text-muted)]">{{ b.category_name || 'General' }}</div>
                  </div>
                  <div class="bg-indigo-500/12 text-[var(--accent-primary)] px-[0.65rem] py-[0.25rem] rounded-full text-[0.78rem] font-bold">
                    👁️ <strong>{{ b.period_reads }}</strong> Activity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Official Printable Report Modal -->
    <OfficialReportModal 
      :is-open="isReportModalOpen" 
      :period="currentPeriod" 
      :report-data="reportData" 
      @close="isReportModalOpen = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Loader2, Printer, CheckCircle, Search, Clock, FileText, Download, TrendingUp, RefreshCw, Activity, BookCopy, ArrowDownToLine, Users } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import OfficialReportModal from './OfficialReportModal.vue';

const props = defineProps({
  stats: Object
});

const authStore = useAuthStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const currentPeriod = ref('1day');
const reportLoading = ref(false);
const reportData = ref(null);
const isReportModalOpen = ref(false);

const currentPeriodName = computed(() => {
  if (currentPeriod.value === '1day') return 'Today (1 Day)';
  if (currentPeriod.value === '1week') return 'This Week (7 Days)';
  if (currentPeriod.value === '1month') return 'This Month (30 Days)';
  return 'All Time';
});

async function fetchReport(period = '1day') {
  currentPeriod.value = period;
  reportLoading.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/reading-reports?period=${period}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      reportData.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch reading report:', err);
  } finally {
    reportLoading.value = false;
  }
}

function printOfficialReport() {
  isReportModalOpen.value = true;
}

onMounted(() => {
  fetchReport('1day');
});

const monthlyData = computed(() => {
  if (props.stats?.monthly_trends && props.stats.monthly_trends.length === 12) {
    return props.stats.monthly_trends;
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(m => ({ month: m, borrowed: 0, returned: 0 }));
});

const maxVal = computed(() => {
  let max = 1;
  monthlyData.value.forEach(m => {
    if (m.borrowed > max) max = m.borrowed;
    if (m.returned > max) max = m.returned;
  });
  return max;
});

const returnedCount = computed(() => {
  if (props.stats?.returned_count !== undefined) {
    return props.stats.returned_count;
  }
  if (!props.stats?.recent_activity) return 0;
  return props.stats.recent_activity.filter(a => a.status === 'returned').length || 0;
});

const totalCount = computed(() => {
  const s = props.stats;
  if (!s) return 0;
  if (s.total_borrowings_count !== undefined) return s.total_borrowings_count;
  return (s.active_borrowings || 0) + (s.pending_requests || 0) + returnedCount.value + (s.overdue_count || 0);
});

const statusPercent = computed(() => {
  const tot = totalCount.value || 1;
  const s = props.stats || {};
  return {
    approved: Math.round(((s.active_borrowings || 0) / tot) * 100),
    pending: Math.round(((s.pending_requests || 0) / tot) * 100),
    returned: Math.round((returnedCount.value / tot) * 100),
    overdue: Math.round(((s.overdue_count || 0) / tot) * 100)
  };
});
</script>

<style scoped>
@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
</style>
