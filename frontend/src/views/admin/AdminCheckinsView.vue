<template>
<main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none print:w-full print:p-0 print:m-0 print:block">
      <header class="mb-10 flex flex-col gap-2 print:hidden">
        <div class="flex items-center gap-3 text-indigo-500 mb-1">
          <MapPin :size="28" class="p-1.5 bg-indigo-500/10 rounded-lg shadow-sm" />
          <h1 class="text-[2.2rem] font-extrabold tracking-tight">Check-Ins <span class="text-transparent bg-clip-text [background-image:var(--accent-gradient)]">Management</span></h1>
        </div>
        <p class="text-[0.95rem] text-[var(--text-secondary)] max-w-2xl leading-relaxed">View and monitor library check-ins from students and members.</p>
      </header>

      <!-- Print Header (Hidden on screen, shown on print) -->
      <div class="hidden print:flex flex-row items-start w-full mb-10 pb-4 relative">
        <!-- Left Side: DUC -->
        <div class="flex flex-col items-center min-w-[280px]">
          <img src="/duc-logo.png" alt="DUC Logo" class="h-[95px] w-auto mb-3" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
          <span class="text-[1.1rem] text-black" style="font-family: 'Khmer OS Muol Light', 'Moul', serif;">សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</span>
          <span class="text-[1.05rem] text-black mt-1.5" style="font-family: 'Khmer OS Muol Light', 'Moul', serif;">បណ្ណាល័យសិក្សា</span>
        </div>
        
        <!-- Center: Nation -->
        <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pt-1">
          <span class="text-[1.4rem] text-black tracking-wide" style="font-family: 'Khmer OS Muol Light', 'Moul', serif;">ព្រះរាជាណាចក្រកម្ពុជា</span>
          <span class="text-[1.2rem] text-black tracking-widest mt-2" style="font-family: 'Khmer OS Muol Light', 'Moul', serif; z-index: 2;">ជាតិ សាសនា ព្រះមហាក្សត្រ</span>
          <img src="/khmer-ornament.png" alt="Tact" class="h-[60px] opacity-90" style="margin-top: -15px; transform: rotate(-1deg); z-index: 1;" />
        </div>
      </div>

      <!-- Report Title (Print Only) -->
      <div class="hidden print:flex flex-col items-center justify-center w-full mb-6 mt-4">
        <h2 class="text-[1.3rem] text-black tracking-wide" style="font-family: 'Khmer OS Muol Light', 'Moul', serif;">របាយការណ៍សិស្សចូលក្នុងបណ្ណាល័យ</h2>
        <p class="text-[1rem] text-black mt-2 font-bold">ការបរិច្ឆេទ៖ {{ reportDateText }}</p>
      </div>

      <div class="bg-[var(--bg-card)] border-[var(--border-color)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 mt-10 print:mt-0 print:border-none print:shadow-none print:rounded-none print:block print:overflow-visible">
        <!-- Header & Filters -->
        <div class="p-5 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-6 flex-wrap print:hidden">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex gap-1.5 p-1.5 bg-gray-500/5 rounded-xl border border-[var(--border-color)]/50 shadow-inner overflow-x-auto max-w-full">
              <button 
                v-for="filter in ['all', 'today']" 
                :key="filter"
                @click="activeFilter = filter"
                class="relative px-5 py-2 rounded-lg text-[0.82rem] font-bold tracking-wide transition-all duration-300 capitalize overflow-hidden group whitespace-nowrap shrink-0"
                :class="activeFilter === filter ? 'text-white shadow-md [background:var(--accent-gradient)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-500/10'"
              >
                {{ filter }}
              </button>
            </div>
            
            <!-- Custom Premium Dropdowns -->
            <div class="flex items-center gap-3">
              <!-- Full screen overlay for click-outside -->
              <div v-if="yearDropdownOpen || monthDropdownOpen" @click="yearDropdownOpen = false; monthDropdownOpen = false" class="fixed inset-0 z-40"></div>

              <!-- Year Custom Dropdown -->
              <div class="relative z-50">
                <div @click="yearDropdownOpen = !yearDropdownOpen" class="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[0.88rem] font-bold rounded-[12px] px-3.5 py-2.5 cursor-pointer hover:border-indigo-300 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-[120px]" :class="{'ring-4 ring-indigo-500/10 border-indigo-500': yearDropdownOpen}">
                  <div class="flex items-center gap-2.5">
                    <CalendarDays :size="16" class="text-indigo-500" />
                    <span>{{ selectedYear || 'Select Year' }}</span>
                  </div>
                  <ChevronDown :size="16" class="text-[var(--text-muted)] transition-transform duration-300 ml-2" :class="{'rotate-180': yearDropdownOpen}" />
                </div>
                
                <!-- Dropdown Menu -->
                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <div v-if="yearDropdownOpen" class="absolute top-[calc(100%+8px)] left-0 w-full min-w-[140px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-1.5 overflow-hidden origin-top">
                    <div @click="selectYear(''); yearDropdownOpen = false" class="px-4 py-2.5 text-[0.85rem] font-medium text-[var(--text-muted)] hover:bg-gray-500/10 cursor-pointer transition-colors">Clear Year</div>
                    <div v-for="year in availableYears" :key="year" @click="selectYear(year); yearDropdownOpen = false" class="px-4 py-2.5 text-[0.88rem] font-bold text-[var(--text-primary)] hover:bg-indigo-500/10 hover:text-indigo-500 cursor-pointer transition-colors" :class="{'bg-indigo-500/10 text-indigo-500': selectedYear === year}">
                      {{ year }}
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Month Custom Dropdown -->
              <div class="relative z-50">
                <div @click="selectedYear ? monthDropdownOpen = !monthDropdownOpen : null" class="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[0.88rem] font-bold rounded-[12px] px-4 py-2.5 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-[140px]" :class="[!selectedYear ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300', monthDropdownOpen ? 'ring-4 ring-indigo-500/10 border-indigo-500' : '']">
                  <span>{{ getMonthLabel(selectedMonth) || 'All Months' }}</span>
                  <ChevronDown :size="16" class="text-[var(--text-muted)] transition-transform duration-300 ml-2" :class="{'rotate-180': monthDropdownOpen}" />
                </div>
                
                <!-- Dropdown Menu -->
                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <div v-if="monthDropdownOpen" class="absolute top-[calc(100%+8px)] left-0 w-full min-w-[140px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-1.5 overflow-hidden origin-top">
                    <div @click="selectMonth(''); monthDropdownOpen = false" class="px-4 py-2.5 text-[0.85rem] font-medium text-[var(--text-muted)] hover:bg-gray-500/10 cursor-pointer transition-colors">All Months</div>
                    <div v-for="month in availableMonths" :key="month.value" @click="selectMonth(month.value); monthDropdownOpen = false" class="px-4 py-2.5 text-[0.88rem] font-bold text-[var(--text-primary)] hover:bg-indigo-500/10 hover:text-indigo-500 cursor-pointer transition-colors" :class="{'bg-indigo-500/10 text-indigo-500': selectedMonth === month.value}">
                      {{ month.label }}
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="text-[0.85rem] font-semibold text-[var(--text-muted)] bg-gray-500/5 px-4 py-2 rounded-lg border border-[var(--border-color)]/50">
              Showing <span class="text-[var(--text-primary)]">{{ filteredCheckins.length }}</span> check-ins
            </div>
            
            <button @click="printReport" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-[0.85rem] transition-colors shadow-sm cursor-pointer">
              <Printer :size="16" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        <!-- Premium Glassmorphic Skeleton Loader -->
        <div v-if="loading && checkins.length === 0" class="animate-pulse w-full overflow-x-auto print:overflow-visible">
          <table class="w-full text-left border-collapse min-w-[900px] print:min-w-0 opacity-70">
            <thead>
              <tr>
                <th v-for="i in 4" :key="'th-'+i" class="px-6 py-4 bg-gray-500/5 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-24"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="'tr-'+i">
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-full bg-[var(--border-color)] shrink-0"></div>
                    <div class="flex flex-col gap-2">
                      <div class="h-4 bg-[var(--border-color)] rounded w-32"></div>
                      <div class="h-3 bg-[var(--border-color)] rounded w-24"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-28"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-32"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)] text-center">
                  <div class="h-6 bg-[var(--border-color)] rounded-full w-20 mx-auto"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="overflow-x-auto print:overflow-visible">
          <table class="w-full text-left border-collapse min-w-[900px] print:min-w-0">
            <thead>
              <tr class="bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-extrabold uppercase tracking-wider">
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Member / Student</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Major</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Class</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap print:hidden">Date & Time</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] text-center whitespace-nowrap">Total Check-Ins</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap print:hidden">Location (Lat, Lng)</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] text-center whitespace-nowrap print:hidden">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              <tr v-for="item in (isPrinting ? filteredCheckins : paginatedCheckins)" :key="item.id || item.checkin_time" class="group hover:bg-gray-500/5 transition-colors duration-200 print:break-inside-avoid">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-full bg-[var(--border-color)] overflow-hidden flex items-center justify-center font-bold text-[1.1rem] shadow-sm shrink-0">
                      <img v-if="item.user_photo" :src="item.user_photo" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full [background-image:var(--accent-gradient)] text-white flex items-center justify-center">
                        {{ item.user_name?.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-extrabold text-[0.95rem] text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{{ item.user_name }}</span>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[0.75rem] text-[var(--text-muted)] font-medium print:hidden">{{ item.user_email }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="item.user_major" class="text-[0.7rem] font-bold tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded uppercase">{{ item.user_major }}</span>
                  <span v-else class="text-[0.75rem] text-[var(--text-muted)] italic">N/A</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="item.user_class" class="text-[0.75rem] font-bold text-[var(--text-primary)] px-2 py-1 bg-gray-500/10 rounded uppercase">{{ item.user_class }}</span>
                  <span v-else class="text-[0.75rem] text-[var(--text-muted)] italic">-</span>
                </td>
                <td class="px-6 py-4 print:hidden">
                  <div class="flex flex-col gap-1.5 text-[0.85rem]">
                    <span class="font-semibold text-[var(--text-primary)]">{{ formatDate(item.checkin_time) }}</span>
                    <span class="text-[var(--text-muted)] font-medium">{{ formatTime(item.checkin_time) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full font-bold text-[0.8rem] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {{ item.total_checkins }}
                  </span>
                </td>
                <td class="px-6 py-4 print:hidden">
                  <div class="flex items-center gap-2">
                    <MapPin :size="14" class="text-indigo-500" />
                    <span class="font-medium text-[0.85rem] text-[var(--text-secondary)]">{{ formatLocation(item.lat, item.lng) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center align-middle print:hidden">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm" :class="item.status === 'success' ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700-returned' : (item.status.includes('fail') ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700-rejected' : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700-pending')">
                    {{ item.status === 'success' ? 'Successful' : item.status }}
                  </span>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="paginatedCheckins.length === 0 && !loading">
                <td colspan="4" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center justify-center opacity-80">
                    <div class="w-20 h-20 rounded-full bg-gray-500/10 flex items-center justify-center mb-4 border border-[var(--border-color)] text-[var(--text-muted)]">
                      <MapPin :size="32" />
                    </div>
                    <div class="flex flex-col gap-1 text-[var(--text-muted)] mb-6">
                      <p class="font-extrabold text-[1.1rem] text-[var(--text-primary)]">No check-ins found</p>
                      <p class="text-[0.88rem] max-w-sm mx-auto leading-relaxed">There are currently no check-in records matching your filter.</p>
                    </div>
                    <button v-if="activeFilter !== 'all'" @click="activeFilter = 'all'" class="mt-2 text-indigo-500 text-[0.85rem] font-bold hover:underline">View All Check-Ins</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Nav Bar -->
        <div v-if="totalPages > 1" class="flex justify-between items-center p-6 border-t border-[var(--border-color)] print:hidden">
          <div class="text-[0.85rem] text-[var(--text-muted)] font-medium">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredCheckins.length) }} of {{ filteredCheckins.length }} check-ins
          </div>

          <div class="flex items-center gap-1.5">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/5 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft :size="16" />
            </button>

            <!-- Smart Page Numbers -->
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] flex items-center justify-center text-[0.85rem] font-bold transition-all duration-200 cursor-pointer"
              :class="currentPage === page ? 'text-white shadow-md [background:var(--accent-gradient)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-gray-500/10 hover:text-[var(--text-primary)]'"
            >
              {{ page }}
            </button>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/5 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </main>
</template>

<style scoped>
@media print {
  body { background: white !important; color: black !important; }
  .bg-\[var\(--bg-card\)\] { background: transparent !important; box-shadow: none !important; border: none !important; }
  table { width: 100% !important; border-collapse: collapse !important; }
  th, td { border-bottom: 1px solid #ddd !important; padding: 12px 8px !important; }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { MapPin, ChevronLeft, ChevronRight, CalendarDays, ChevronDown, Printer } from 'lucide-vue-next';

const authStore = useAuthStore();
const toastStore = useToastStore();

const checkins = ref([]);
const loading = ref(false);
const activeFilter = ref('all');

const selectedYear = ref('');
const selectedMonth = ref('');

const yearDropdownOpen = ref(false);
const monthDropdownOpen = ref(false);

const selectYear = (year) => {
  selectedYear.value = year;
};

const selectMonth = (month) => {
  selectedMonth.value = month;
};

const isPrinting = ref(false);

const printReport = async () => {
  isPrinting.value = true;
  await nextTick();
  setTimeout(() => {
    window.print();
    isPrinting.value = false;
  }, 150);
};

const getMonthLabel = (val) => {
  if (val === '') return '';
  const match = availableMonths.value.find(m => m.value === val);
  return match ? match.label : '';
};

const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const toKhmerNumeral = (num) => String(num).split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('');

const reportDateText = computed(() => {
  if (activeFilter.value === 'all') {
    return 'ទាំងអស់';
  } else if (activeFilter.value === 'today') {
    return 'ថ្ងៃនេះ';
  } else if (activeFilter.value === 'custom') {
    if (selectedYear.value && selectedMonth.value !== '') {
      return `ខែ${khmerMonths[selectedMonth.value]} ឆ្នាំ${toKhmerNumeral(selectedYear.value)}`;
    } else if (selectedYear.value) {
      return `ឆ្នាំ${toKhmerNumeral(selectedYear.value)}`;
    }
  }
  return '';
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const handleRefresh = () => {
  fetchCheckins();
};

onMounted(() => {
  fetchCheckins();
  window.addEventListener('refresh-admin-checkins', handleRefresh);
});

onUnmounted(() => {
  window.removeEventListener('refresh-admin-checkins', handleRefresh);
});

async function fetchCheckins() {
  if (checkins.value.length === 0) {
    try {
      const cached = localStorage.getItem('library_admin_checkins_cache');
      if (cached) checkins.value = JSON.parse(cached);
    } catch (e) {
      console.warn('Failed to parse cached checkins', e);
    }
  }

  if (checkins.value.length === 0) {
    loading.value = true;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/checkins`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch check-ins');
    }
    
    const data = await res.json();
    checkins.value = data;
    localStorage.setItem('library_admin_checkins_cache', JSON.stringify(data));
  } catch (err) {
    if (checkins.value.length === 0) {
      toastStore.show(err.message, { type: 'error', title: 'Error' });
    }
  } finally {
    loading.value = false;
  }
}

const availableYears = computed(() => {
  const years = new Set(checkins.value.map(c => new Date(c.checkin_time).getFullYear()));
  return Array.from(years).filter(y => !isNaN(y)).sort((a, b) => b - a);
});

const availableMonths = computed(() => {
  if (!selectedYear.value) return [];
  const checkinsInYear = checkins.value.filter(c => new Date(c.checkin_time).getFullYear() == selectedYear.value);
  const months = new Set(checkinsInYear.map(c => new Date(c.checkin_time).getMonth()));
  return Array.from(months).filter(m => !isNaN(m)).sort((a, b) => a - b).map(m => ({
    value: m,
    label: new Date(2000, m, 1).toLocaleString('default', { month: 'long' })
  }));
});

watch(selectedYear, (newVal) => {
  selectedMonth.value = '';
  if (newVal) {
    activeFilter.value = 'custom';
  } else if (activeFilter.value === 'custom') {
    activeFilter.value = 'all';
  }
});

watch(selectedMonth, (newVal) => {
  if (newVal !== '') {
    activeFilter.value = 'custom';
  }
});

watch(activeFilter, (newVal) => {
  currentPage.value = 1;
  if (newVal !== 'custom') {
    selectedYear.value = '';
    selectedMonth.value = '';
  }
});

const filteredCheckins = computed(() => {
  let list = checkins.value;
  
  if (activeFilter.value === 'today') {
    const todayStr = new Date().toISOString().split('T')[0];
    list = list.filter(c => c.checkin_time && c.checkin_time.startsWith(todayStr));
  } else if (activeFilter.value === 'custom') {
    list = list.filter(c => {
      if (!c.checkin_time) return false;
      const d = new Date(c.checkin_time);
      if (isNaN(d.getTime())) return false;
      
      const yearMatch = selectedYear.value ? d.getFullYear() == selectedYear.value : true;
      const monthMatch = selectedMonth.value !== '' ? d.getMonth() == selectedMonth.value : true;
      
      return yearMatch && monthMatch;
    });
  }
  
  // Remove duplicates to show only the most recent check-in per student, and count totals
  const uniqueUsers = new Map();
  for (const c of list) {
    const key = c.user_email || c.user_name || c.id;
    const existing = uniqueUsers.get(key);
    if (!existing) {
      uniqueUsers.set(key, { ...c, total_checkins: 1 });
    } else {
      const updated = new Date(c.checkin_time) > new Date(existing.checkin_time)
        ? { ...c, total_checkins: existing.total_checkins + 1 }
        : { ...existing, total_checkins: existing.total_checkins + 1 };
      uniqueUsers.set(key, updated);
    }
  }
  
  return Array.from(uniqueUsers.values()).sort((a, b) => new Date(b.checkin_time) - new Date(a.checkin_time));
});

const totalPages = computed(() => Math.ceil(filteredCheckins.value.length / itemsPerPage.value) || 1);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const paginatedCheckins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCheckins.value.slice(start, start + itemsPerPage.value);
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatLocation(lat, lng) {
  if (lat == null || lng == null) return 'Unknown';
  return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
}
</script>
