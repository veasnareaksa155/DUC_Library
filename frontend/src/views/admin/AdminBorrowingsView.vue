<template>
  <div class="flex items-start min-h-screen w-full">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none">
      <header class="mb-10 flex flex-col gap-2">
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-[2.2rem] font-extrabold tracking-tight text-[var(--text-primary)]">{{ localeStore.t('requests') }} Management</h1>
        </div>
        <p class="text-[0.95rem] text-[var(--text-secondary)] max-w-2xl leading-relaxed">Approve student book requests, record returns, or reject pending applications with a streamlined process.</p>
      </header>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-all duration-300">
        <!-- Header & Filters -->
        <div class="p-5 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-6 flex-wrap">
          <div class="flex gap-2 p-1 bg-[var(--bg-primary)] rounded-md border border-[var(--border-color)] overflow-x-auto max-w-full shadow-sm">
            <button 
              v-for="tab in ['all', 'pending', 'approved', 'returned', 'rejected']" 
              :key="tab"
              @click="activeFilter = tab"
              class="relative px-5 py-2 rounded-md text-[0.85rem] font-bold tracking-wide transition-all duration-300 capitalize overflow-hidden group whitespace-nowrap shrink-0 flex items-center gap-2"
              :class="activeFilter === tab ? 'bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-500/5 border border-transparent'"
            >
              {{ tab }}
              <!-- Notification Badge for Pending -->
              <span v-if="tab === 'pending' && pendingCount > 0" class="px-1.5 py-0.5 rounded-md text-[0.65rem] font-bold" :class="activeFilter === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'bg-red-500/10 text-red-500'">{{ pendingCount }}</span>
            </button>
          </div>
          
          <div class="text-[0.85rem] font-semibold text-[var(--text-muted)] bg-gray-500/5 px-4 py-2 rounded-lg border border-[var(--border-color)]/50">
            Showing <span class="text-[var(--text-primary)]">{{ filteredBorrowings.length }}</span> requests
          </div>
        </div>

        <!-- Premium Glassmorphic Skeleton Loader -->
        <div v-if="borrowingsStore.loading && filteredBorrowings.length === 0" class="animate-pulse w-full overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[900px] opacity-70">
            <thead>
              <tr>
                <th v-for="i in 5" :key="'th-'+i" class="px-6 py-4 bg-gray-500/5 border-b border-[var(--border-color)]">
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
                  <div class="flex flex-col gap-2">
                    <div class="h-4 bg-[var(--border-color)] rounded w-40"></div>
                    <div class="h-3 bg-[var(--border-color)] rounded w-24"></div>
                  </div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="flex flex-col gap-2">
                    <div class="h-4 bg-[var(--border-color)] rounded w-32"></div>
                    <div class="h-4 bg-[var(--border-color)] rounded w-28"></div>
                  </div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)] text-center">
                  <div class="h-6 bg-[var(--border-color)] rounded-full w-20 mx-auto"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)] text-right">
                  <div class="flex justify-end gap-2.5">
                    <div class="h-8 bg-[var(--border-color)] rounded w-16"></div>
                    <div class="h-8 bg-[var(--border-color)] rounded w-24"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[0.7rem] font-bold uppercase tracking-[0.1em] border-b border-[var(--border-color)]">
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Member / Student</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] w-[30%]">Requested Book</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap">Dates</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] text-center whitespace-nowrap">Status</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              <tr v-for="item in paginatedBorrowings" :key="item.id" class="group hover:bg-gray-500/5 transition-colors duration-200">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm dark:text-indigo-400 flex items-center justify-center font-bold text-[0.95rem] border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                      {{ item.user_name?.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-extrabold text-[0.95rem] text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{{ item.user_name }}</span>
                      <span class="text-[0.8rem] text-[var(--text-muted)] font-medium">{{ item.user_email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col max-w-[280px]">
                    <span class="font-bold text-[0.95rem] text-[var(--text-primary)] truncate" :title="item.book_title">{{ item.book_title }}</span>
                    <span class="text-[0.8rem] text-indigo-500 font-bold truncate mt-0.5">{{ item.book_author }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1.5">
                    <div class="flex items-center gap-2 text-[0.82rem]">
                      <span class="text-[var(--text-muted)] font-bold w-12 shrink-0">Req:</span>
                      <span class="font-semibold text-[var(--text-primary)]">{{ formatDate(item.borrow_date) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-[0.82rem]">
                      <span class="text-[var(--text-muted)] font-bold w-12 shrink-0">Due:</span>
                      <span class="font-bold" :class="isOverdue(item.due_date, item.status) ? 'text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md' : 'text-[var(--text-primary)]'">{{ formatDate(item.due_date) }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center align-middle">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wider border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-colors" :class="getStatusBadgeClass(item.status)">{{ localeStore.t(item.status) || item.status.toUpperCase() }}</span>
                </td>
                <td class="px-6 py-4 text-right align-middle">
                  <div class="flex justify-end gap-2.5">
                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'approved', item)" 
                      class="inline-flex items-center justify-center font-bold rounded-lg transition-all duration-300 ease-out active:scale-95 bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 px-3 py-2 text-[0.8rem]"
                      :class="loadingActionId === item.id && loadingActionType === 'approved' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Approve Request"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'approved'" :size="16" class="animate-spin" />
                      <Check v-else :size="16" stroke-width="3" />
                    </button>

                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'rejected', item)" 
                      class="inline-flex items-center justify-center font-bold rounded-lg transition-all duration-300 ease-out active:scale-95 bg-red-100/50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 px-3 py-2 text-[0.8rem]"
                      :class="loadingActionId === item.id && loadingActionType === 'rejected' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Reject Request"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'rejected'" :size="16" class="animate-spin" />
                      <X v-else :size="16" stroke-width="3" />
                    </button>

                    <button 
                      v-if="item.status === 'approved'"
                      @click="updateStatus(item.id, 'returned', item)" 
                      class="inline-flex items-center justify-center gap-1.5 font-bold rounded-lg transition-all duration-300 ease-out active:scale-95 bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 px-4 py-2 text-[0.85rem]"
                      :class="loadingActionId === item.id && loadingActionType === 'returned' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'returned'" :size="15" class="animate-spin" />
                      <RotateCcw v-else :size="15" /> 
                      <span class="max-xl:hidden">{{ loadingActionId === item.id && loadingActionType === 'returned' ? 'Processing...' : 'Return' }}</span>
                    </button>

                    <button 
                      v-if="item.status !== 'returned' && item.status !== 'rejected'"
                      @click="sendDueReminder(item)" 
                      class="inline-flex items-center justify-center gap-1.5 font-bold rounded-lg transition-all duration-300 ease-out active:scale-95 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-600 hover:text-white hover:border-transparent hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 px-3 py-2 text-[0.8rem]"
                      :class="loadingActionId === item.id && loadingActionType === 'reminder' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Send Due Date & Return Notification to Phone"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'reminder'" :size="15" class="animate-spin" />
                      <BellRing v-else :size="15" /> 
                      <span class="max-xl:hidden">{{ loadingActionId === item.id && loadingActionType === 'reminder' ? 'Sending...' : 'Reminder' }}</span>
                    </button>

                    <div v-if="item.status === 'returned' || item.status === 'rejected'" class="flex items-center justify-end gap-2">
                      <span class="text-[0.75rem] font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 py-1 bg-[var(--bg-primary)] rounded-md border border-[var(--border-color)] flex items-center gap-1.5 shadow-sm">
                        <Check :size="14" /> Closed
                      </span>
                      <button 
                        @click="deleteRequest(item)" 
                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                        :class="loadingActionId === item.id && loadingActionType === 'delete' ? 'cursor-not-allowed' : ''"
                        :disabled="loadingActionId === item.id"
                        title="Delete Request Record"
                      >
                        <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'delete'" :size="16" class="animate-spin" />
                        <Trash2 v-else :size="16" stroke-width="2" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="paginatedBorrowings.length === 0">
                <td colspan="5" class="px-6 py-20 text-center bg-gray-500/5">
                  <div class="flex flex-col items-center justify-center text-[var(--text-muted)] gap-4">
                    <div class="w-20 h-20 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
                      <ClipboardList :size="36" class="opacity-50 text-indigo-400" />
                    </div>
                    <div class="flex flex-col gap-1">
                      <p class="font-extrabold text-[1.1rem] text-[var(--text-primary)]">No {{ activeFilter !== 'all' ? activeFilter : '' }} requests found</p>
                      <p class="text-[0.88rem] max-w-sm mx-auto leading-relaxed">There are currently no borrowing records matching your selected filter criteria. Check back later.</p>
                    </div>
                    <button v-if="activeFilter !== 'all'" @click="activeFilter = 'all'" class="mt-2 text-indigo-500 text-[0.85rem] font-bold hover:underline">View All Requests</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Nav Bar -->
        <div v-if="totalPages > 1" class="flex justify-between items-center p-6 border-t border-[var(--border-color)]">
          <div class="text-[0.85rem] text-[var(--text-muted)] font-medium">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredBorrowings.length) }} of {{ filteredBorrowings.length }} requests
          </div>

          <div class="flex items-center gap-3">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/10 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft :size="16" />
            </button>

            <span class="text-[0.85rem] font-bold text-[var(--text-primary)]">Page {{ currentPage }} of {{ totalPages }}</span>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/10 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBorrowingsStore } from '../../stores/borrowings';
import { useLocaleStore } from '../../stores/locale';
import { useToastStore } from '../../stores/toast';
import { useConfirmStore } from '../../stores/confirm';
import { sendPhoneAndDrawerNotification } from '../../services/notificationService';
import AdminSidebar from '../../components/AdminSidebar.vue';
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
    rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
  };
  return map[status] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20';
}
</script>

