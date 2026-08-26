<template>
<main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none relative">
      <!-- Decorative Background Glow -->
      <div class="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10"></div>
      
      <header class="mb-10 flex flex-col gap-3 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ClipboardList :size="20" />
          </div>
          <h1 class="text-[2.2rem] font-extrabold tracking-tight text-[var(--text-primary)]">Requests Management</h1>
        </div>
        <p class="text-[1rem] text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">Approve student book requests, record returns, or reject pending applications with a streamlined process.</p>
      </header>

      <div class="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-all duration-300 relative z-10">
        
        <!-- Header & Filters -->
        <div class="p-5 sm:px-8 sm:py-6 border-b border-[var(--border-color)]/50 flex items-center justify-between gap-6 flex-wrap relative">
          <!-- Segmented Control for Tabs -->
          <div class="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto max-w-full shadow-inner border border-slate-200/50 dark:border-slate-700/50">
            <button 
              v-for="tab in ['all', 'pending', 'approved', 'returned', 'rejected']" 
              :key="tab"
              @click="activeFilter = tab"
              class="relative px-6 py-2.5 rounded-lg text-[0.85rem] font-bold tracking-wide transition-all duration-300 capitalize overflow-hidden group whitespace-nowrap shrink-0 flex items-center gap-2"
              :class="activeFilter === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-slate-500 dark:text-slate-400 hover:text-[var(--text-primary)] hover:bg-slate-200/50 dark:hover:bg-slate-700/50'"
            >
              {{ tab }}
              <!-- Notification Badge for Pending -->
              <span v-if="tab === 'pending' && pendingCount > 0" class="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[0.65rem] font-bold shadow-sm transition-all duration-300" :class="activeFilter === 'pending' ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-red-500 text-white shadow-red-500/30'">
                {{ pendingCount }}
              </span>
            </button>
          </div>
          
          <div class="text-[0.85rem] font-semibold text-[var(--text-muted)] bg-slate-50 dark:bg-slate-800/50 px-5 py-2.5 rounded-xl border border-[var(--border-color)]/50 shadow-sm flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            Showing <span class="text-[var(--text-primary)] font-bold">{{ filteredBorrowings.length }}</span> requests
          </div>
        </div>

        <!-- Premium Glassmorphic Skeleton Loader -->
        <div v-if="borrowingsStore.loading && filteredBorrowings.length === 0" class="animate-pulse w-full overflow-x-auto p-4">
          <div class="flex flex-col gap-3">
            <div v-for="i in 5" :key="'sk-'+i" class="h-24 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
          </div>
        </div>

        <div v-else class="overflow-x-auto p-4">
          <table class="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr class="text-slate-500 dark:text-slate-400 text-[0.7rem] font-extrabold uppercase tracking-[0.1em]">
                <th class="px-6 py-4 whitespace-nowrap pl-8 rounded-l-xl">Member / Student</th>
                <th class="px-6 py-4 w-[30%]">Requested Book</th>
                <th class="px-6 py-4 whitespace-nowrap">Dates</th>
                <th class="px-6 py-4 text-center whitespace-nowrap">Status</th>
                <th class="px-6 py-4 text-right whitespace-nowrap pr-8 rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody class="mt-2 text-[var(--text-primary)]">
              <tr v-for="item in paginatedBorrowings" :key="item.id" class="group bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.06)] transition-all duration-300 rounded-xl relative">
                <td class="px-6 py-5 rounded-l-xl">
                  <div class="flex items-center gap-4">
                    <div class="relative">
                      <div class="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-300"></div>
                      <div class="relative w-11 h-11 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-[1rem] border-2 border-white dark:border-slate-800 shrink-0 overflow-hidden text-indigo-600 dark:text-indigo-300">
                        <img v-if="item.profile_photo" :src="item.profile_photo" class="w-full h-full object-cover" />
                        <span v-else>{{ item.user_name?.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-extrabold text-[0.95rem] text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ item.user_name }}</span>
                      <span class="text-[0.8rem] text-[var(--text-muted)] font-medium">{{ item.user_email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col max-w-[280px]">
                    <span class="font-bold text-[0.95rem] text-[var(--text-primary)] truncate" :title="item.book_title">{{ item.book_title }}</span>
                    <span class="text-[0.8rem] text-indigo-500 dark:text-indigo-400 font-bold truncate mt-1 bg-indigo-50 dark:bg-indigo-500/10 w-fit px-2 py-0.5 rounded-md">{{ item.book_author }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2 text-[0.82rem]">
                      <span class="text-[var(--text-muted)] font-bold w-12 shrink-0">Req:</span>
                      <span class="font-semibold text-[var(--text-primary)]">{{ formatDate(item.borrow_date) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-[0.82rem]">
                      <span class="text-[var(--text-muted)] font-bold w-12 shrink-0">Due:</span>
                      <span class="font-bold" :class="isOverdue(item.due_date, item.status) ? 'text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20' : 'text-[var(--text-primary)]'">{{ formatDate(item.due_date) }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center align-middle">
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.75rem] font-extrabold uppercase tracking-wider border transition-colors shadow-sm" :class="getStatusBadgeClass(item.status)">
                    <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.status)"></span>
                    {{ localeStore.t(item.status) || item.status.toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right align-middle rounded-r-xl">
                  <div class="flex justify-end gap-2.5">
                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'approved', item)" 
                      class="w-9 h-9 inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:-translate-y-1 border border-emerald-200 dark:border-emerald-500/20 hover:border-transparent group/btn"
                      :class="loadingActionId === item.id && loadingActionType === 'approved' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Approve Request"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'approved'" :size="16" class="animate-spin" />
                      <Check v-else :size="18" stroke-width="3" class="group-hover/btn:scale-110 transition-transform" />
                    </button>

                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'rejected', item)" 
                      class="w-9 h-9 inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_4px_15px_rgba(244,63,94,0.4)] hover:-translate-y-1 border border-rose-200 dark:border-rose-500/20 hover:border-transparent group/btn"
                      :class="loadingActionId === item.id && loadingActionType === 'rejected' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Reject Request"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'rejected'" :size="16" class="animate-spin" />
                      <X v-else :size="18" stroke-width="3" class="group-hover/btn:scale-110 transition-transform" />
                    </button>

                    <button 
                      v-if="item.status === 'approved'"
                      @click="updateStatus(item.id, 'returned', item)" 
                      class="inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] hover:-translate-y-1 px-4 py-2 text-[0.85rem] border border-transparent"
                      :class="loadingActionId === item.id && loadingActionType === 'returned' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'returned'" :size="15" class="animate-spin" />
                      <RotateCcw v-else :size="15" /> 
                      <span>{{ loadingActionId === item.id && loadingActionType === 'returned' ? 'Processing...' : 'Mark Returned' }}</span>
                    </button>

                    <button 
                      v-if="item.status !== 'returned' && item.status !== 'rejected'"
                      @click="sendDueReminder(item)" 
                      class="w-9 h-9 inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white hover:shadow-[0_4px_15px_rgba(79,70,229,0.4)] hover:-translate-y-1 border border-slate-200 dark:border-slate-600 hover:border-transparent group/btn"
                      :class="loadingActionId === item.id && loadingActionType === 'reminder' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Send Due Date Reminder"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'reminder'" :size="15" class="animate-spin" />
                      <BellRing v-else :size="15" class="group-hover/btn:-rotate-12 transition-transform" /> 
                    </button>

                    <div v-if="item.status === 'returned' || item.status === 'rejected'" class="flex items-center justify-end gap-3">
                      <span class="text-[0.75rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Check :size="14" /> Closed
                      </span>
                      <button 
                        @click="deleteRequest(item)" 
                        class="w-9 h-9 inline-flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-300 hover:-translate-y-1 group/btn border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30"
                        :class="loadingActionId === item.id && loadingActionType === 'delete' ? 'cursor-not-allowed' : ''"
                        :disabled="loadingActionId === item.id"
                        title="Delete Record"
                      >
                        <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'delete'" :size="16" class="animate-spin" />
                        <Trash2 v-else :size="16" stroke-width="2" class="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="paginatedBorrowings.length === 0">
                <td colspan="5" class="px-6 py-28 text-center border-none bg-transparent">
                  <div class="flex flex-col items-center justify-center text-[var(--text-muted)] gap-6">
                    <div class="relative w-24 h-24 flex items-center justify-center">
                      <div class="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-50"></div>
                      <div class="absolute inset-4 bg-indigo-500/20 rounded-full"></div>
                      <ClipboardList :size="48" stroke-width="1.5" class="text-indigo-500 relative z-10" />
                    </div>
                    <div class="flex flex-col gap-2">
                      <p class="font-extrabold text-[1.2rem] text-[var(--text-primary)]">No {{ activeFilter !== 'all' ? activeFilter : '' }} requests</p>
                      <p class="text-[0.95rem] max-w-sm mx-auto leading-relaxed">Your queue is completely clear. Any new borrowing requests will magically appear right here.</p>
                    </div>
                    <button v-if="activeFilter !== 'all'" @click="activeFilter = 'all'" class="mt-4 px-6 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition-colors shadow-sm">View All Requests</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Nav Bar -->
        <div v-if="totalPages > 1" class="flex justify-between items-center px-8 py-5 border-t border-[var(--border-color)]/50 bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-md">
          <div class="text-[0.85rem] text-[var(--text-muted)] font-medium">
            Showing <span class="font-bold text-[var(--text-primary)]">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="font-bold text-[var(--text-primary)]">{{ Math.min(currentPage * itemsPerPage, filteredBorrowings.length) }}</span> of <span class="font-bold text-[var(--text-primary)]">{{ filteredBorrowings.length }}</span>
          </div>

          <div class="flex items-center gap-3">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="w-[36px] h-[36px] rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[var(--text-primary)] flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer hover:not(:disabled):bg-indigo-500 hover:not(:disabled):text-white hover:not(:disabled):border-transparent hover:not(:disabled):shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:not(:disabled):-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft :size="18" />
            </button>

            <span class="text-[0.85rem] font-bold text-[var(--text-primary)] bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="w-[36px] h-[36px] rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[var(--text-primary)] flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer hover:not(:disabled):bg-indigo-500 hover:not(:disabled):text-white hover:not(:disabled):border-transparent hover:not(:disabled):shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:not(:disabled):-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBorrowingsStore } from '../../stores/borrowings';
import { useLocaleStore } from '../../stores/locale';
import { useToastStore } from '../../stores/toast';
import { useConfirmStore } from '../../stores/confirm';
import { sendPhoneAndDrawerNotification } from '../../services/notificationService';
import { Check, X, RotateCcw, BellRing, ClipboardList, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-vue-next';

const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();
const confirmStore = useConfirmStore();
const activeFilter = ref('all');

onMounted(() => {
  borrowingsStore.fetchAdminBorrowings();
});

const filteredBorrowings = computed(() => {
  if (activeFilter.value === 'all') return borrowingsStore.adminBorrowings;
  return borrowingsStore.adminBorrowings.filter(b => b.status === activeFilter.value);
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

watch(activeFilter, () => {
  currentPage.value = 1;
});

const totalPages = computed(() => Math.ceil(filteredBorrowings.value.length / itemsPerPage.value) || 1);

const paginatedBorrowings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredBorrowings.value.slice(start, start + itemsPerPage.value);
});

const pendingCount = computed(() => {
  return borrowingsStore.adminBorrowings.filter(b => b.status === 'pending').length;
});

const loadingActionId = ref(null);
const loadingActionType = ref(null);

async function updateStatus(id, newStatus, item) {
  if (loadingActionId.value) return;
  loadingActionId.value = id;
  loadingActionType.value = newStatus;

  try {
    await borrowingsStore.updateBorrowStatus(id, newStatus);
    
    // Show toast immediately for fast UX feedback!
    if (newStatus === 'approved' && item) {
      sendPhoneAndDrawerNotification({
        title: 'Borrow Request Approved! 📚',
        message: `Your borrowing request for "${item.book_title}" has been approved! Please pick up your copy at DUC Library.`,
        type: 'system',
        target_user_id: item.user_id
      });
      toastStore.showSuccess(`Approved & notified student phone! 📱`, `Request Approved`);
    } else if (newStatus === 'returned' && item) {
      toastStore.showSuccess(`Marked "${item.book_title}" as returned!`, `Book Returned`);
    } else if (newStatus === 'rejected' && item) {
      toastStore.showSuccess(`Request for "${item.book_title}" was rejected.`, `Request Rejected`);
    }

    // Now reload the table and dashboard stats concurrently
    await Promise.all([
      borrowingsStore.fetchAdminBorrowings(),
      borrowingsStore.fetchAdminDashboardStats()
    ]);
  } catch (err) {
    toastStore.show(err.message || 'Failed to update request status.', { type: 'error', title: 'Error' });
  } finally {
    loadingActionId.value = null;
    loadingActionType.value = null;
  }
}

async function sendDueReminder(item) {
  if (loadingActionId.value) return;
  loadingActionId.value = item.id;
  loadingActionType.value = 'reminder';

  try {
    sendPhoneAndDrawerNotification({
      title: 'Due Date Return Reminder ⏰',
      message: `Reminder for ${item.user_name}: The book "${item.book_title}" is due for return to the DUC Library resource center.`,
      type: 'system',
      target_user_id: item.user_id
    });
    toastStore.showSuccess(`Sent due date reminder notification to ${item.user_name}! 📱`, `Reminder Sent`);
  } catch (err) {
    toastStore.show('Failed to send reminder notification.', { type: 'error', title: 'Error' });
  } finally {
    loadingActionId.value = null;
    loadingActionType.value = null;
  }
}

async function deleteRequest(item) {
  if (loadingActionId.value) return;
  
  const bookTitle = item.book_title;
  const userName = item.user_name;

  const confirmed = await confirmStore.showConfirm({
    title: 'Delete Record',
    message: `Are you sure you want to delete the record for "${bookTitle}" requested by ${userName}? This action cannot be undone.`,
    confirmText: 'Delete',
    type: 'danger'
  });

  if (!confirmed) return;
  
  loadingActionId.value = item.id;
  loadingActionType.value = 'delete';

  try {
    await borrowingsStore.deleteBorrowing(item.id);
    toastStore.showSuccess(`Deleted record for "${bookTitle}"`, `Record Deleted`);
  } catch (err) {
    toastStore.show(err.message || 'Failed to delete request.', { type: 'error', title: 'Error' });
  } finally {
    loadingActionId.value = null;
    loadingActionType.value = null;
  }
}

function formatDate(dateStr) {
  if (!dateStr || String(dateStr).trim() === '' || dateStr === 'null' || dateStr === 'undefined') return 'TBD';
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'TBD';

  // Jan 1, 1970 is the Unix Epoch. This happens when an empty date or '0' is parsed by the backend database
  if (d.getFullYear() <= 1970) return 'TBD';

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dueDate, status) {
  if (status === 'returned' || status === 'rejected' || !dueDate) return false;
  
  const d = new Date(dueDate);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return false;
  
  return d < new Date();
}

function getStatusBadgeClass(status) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    approved: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    returned: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
  };
  return map[status] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
}

function getStatusDotClass(status) {
  const map = {
    pending: 'bg-amber-500',
    approved: 'bg-indigo-500',
    returned: 'bg-emerald-500',
    rejected: 'bg-rose-500'
  };
  return map[status] || 'bg-slate-400';
}
</script>

<style scoped>
table {
  border-collapse: separate !important;
  border-spacing: 0 12px !important;
}
</style>
