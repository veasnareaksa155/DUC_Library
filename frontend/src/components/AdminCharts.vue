<template>
  <div class="grid grid-cols-[1.6fr_1fr] max-lg:grid-cols-1 gap-5 mb-8">
    <!-- Bar Chart: Monthly Activity Trends -->
    <div class="p-6 flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
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
    <div class="p-6 flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
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
    <div class="p-6 flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] col-span-full mt-4">
      <div class="flex justify-between items-start mb-5 flex-wrap gap-3">
        <div>
          <h3 class="flex items-center gap-2 text-[1.1rem] font-bold">
            <Activity :size="18" class="text-indigo-500" /> Library Analytics
          </h3>
          <p class="text-[0.8rem] text-[var(--text-muted)]">Official activity reports for {{ currentPeriodName }}</p>
        </div>

        <div class="flex items-center gap-[0.4rem] flex-wrap">
          <!-- All / Today / Custom Toggle -->
          <div class="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-sm mr-2">
            <button @click="dateMode = 'all'" :class="dateMode === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'" class="px-4 py-1.5 rounded-lg text-[0.8rem] font-bold transition-all duration-300 ease-out min-w-[60px]">All Time</button>
            <button @click="dateMode = 'today'" :class="dateMode === 'today' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'" class="px-4 py-1.5 rounded-lg text-[0.8rem] font-bold transition-all duration-300 ease-out min-w-[60px]">Today</button>
            <button @click="dateMode = 'custom'" :class="dateMode === 'custom' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'" class="px-4 py-1.5 rounded-lg text-[0.8rem] font-bold transition-all duration-300 ease-out min-w-[60px]">Custom</button>
          </div>

          <!-- Year Dropdown -->
          <div class="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]/50 shadow-sm transition-all duration-300 flex items-center h-[34px]" :class="dateMode !== 'custom' ? 'opacity-40 pointer-events-none' : 'hover:border-indigo-300 dark:hover:border-indigo-500/50'">
            <div class="pl-3 pr-1 text-indigo-500 flex items-center justify-center">
              <Calendar :size="14" stroke-width="2.5" />
            </div>
            <select v-model="selectedYear" class="appearance-none bg-transparent py-1 pr-7 pl-1 text-[0.8rem] font-bold text-[var(--text-primary)] cursor-pointer outline-none h-full" :disabled="dateMode !== 'custom'">
              <option value="all">Select Year</option>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <ChevronDown :size="14" />
            </div>
          </div>

          <!-- Month Dropdown -->
          <div class="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]/50 shadow-sm transition-all duration-300 flex items-center h-[34px]" :class="(dateMode !== 'custom' || selectedYear === 'all') ? 'opacity-40 pointer-events-none' : 'hover:border-indigo-300 dark:hover:border-indigo-500/50'">
            <select v-model="selectedMonth" class="appearance-none bg-transparent py-1 pl-3 pr-7 text-[0.8rem] font-bold text-[var(--text-primary)] cursor-pointer outline-none h-full min-w-[100px]" :disabled="dateMode !== 'custom' || selectedYear === 'all'">
              <option value="all">All Months</option>
              <option v-for="month in availableMonths" :key="month.value" :value="month.value">{{ month.label }}</option>
            </select>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <ChevronDown :size="14" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="reportLoading" class="flex items-center justify-center gap-3 p-12 text-[var(--text-muted)]">
        <Loader2 :size="24" class="animate-spin" /> Generating {{ currentPeriodName }} Analytics Report...
      </div>

      <div v-else-if="reportData" class="mt-6">
        <!-- Report content begins below -->

        <div class="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          <!-- Left Column: Top Student Borrowers -->
          <div class="flex flex-col gap-6">
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


  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Loader2, Calendar, ChevronDown, Activity, BookCopy, ArrowDownToLine, Users } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useBorrowingsStore } from '../stores/borrowings';

const props = defineProps({
  stats: Object
});

const authStore = useAuthStore();
const borrowingsStore = useBorrowingsStore();
const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const dateMode = ref('today');
const selectedYear = ref('all');
const selectedMonth = ref('all');

const reportLoading = ref(false);
const reportData = ref(null);

const availableYears = computed(() => {
  const years = new Set();
  borrowingsStore.adminBorrowings.forEach(b => {
    if (b.borrow_date) {
      years.add(b.borrow_date.substring(0, 4));
    }
  });
  const sortedYears = Array.from(years).sort((a, b) => b - a);
  // Ensure we always have at least the current year if data is totally empty
  if (sortedYears.length === 0) {
    sortedYears.push(new Date().getFullYear().toString());
  }
  return sortedYears;
});

const allMonthsMap = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December'
};

const availableMonths = computed(() => {
  if (selectedYear.value === 'all') return [];
  
  const monthsSet = new Set();
  borrowingsStore.adminBorrowings.forEach(b => {
    if (b.borrow_date && b.borrow_date.substring(0, 4) === selectedYear.value) {
      monthsSet.add(b.borrow_date.substring(5, 7));
    }
  });
  
  return Array.from(monthsSet).sort().map(m => ({
    value: String(parseInt(m, 10) - 1), // Our old logic expects 0-11 for value
    label: allMonthsMap[m]
  }));
});

const currentPeriodName = computed(() => {
  if (dateMode.value === 'today') return 'Today';
  if (dateMode.value === 'all') return 'All Time';
  if (selectedYear.value !== 'all') {
    if (selectedMonth.value !== 'all') {
      // Find the month label manually instead of looking in an array
      const mStr = String(parseInt(selectedMonth.value, 10) + 1).padStart(2, '0');
      const m = allMonthsMap[mStr] || 'Unknown Month';
      return `${m} ${selectedYear.value}`;
    }
    return `Year ${selectedYear.value}`;
  }
  return 'Custom Period';
});

async function fetchReport() {
  reportLoading.value = true;
  try {
    let url = `${import.meta.env.VITE_API_URL || ''}/api/admin/reading-reports?period=${dateMode.value}`;
    if (dateMode.value === 'custom') {
      url += `&year=${selectedYear.value}&month=${selectedMonth.value}`;
    }
    const res = await fetch(url, {
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

watch([dateMode, selectedYear, selectedMonth], () => {
  if (dateMode.value !== 'custom') {
    selectedYear.value = 'all';
    selectedMonth.value = 'all';
  } else if (selectedYear.value === 'all') {
    selectedMonth.value = 'all';
  }
  fetchReport();
});

onMounted(() => {
  borrowingsStore.fetchAdminBorrowings();
  fetchReport();
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
