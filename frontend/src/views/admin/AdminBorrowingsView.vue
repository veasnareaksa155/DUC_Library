<template>
  <div class="admin-layout-wrapper">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="admin-main-content">
      <header class="admin-header">
        <div>
          <h1 class="page-title">{{ localeStore.t('requests') }} <span class="text-gradient">Management</span></h1>
          <p class="page-subtitle">Approve student book requests, record returns, or reject pending applications.</p>
        </div>
      </header>

      <div class="glass-panel main-panel">
        <!-- Status Tabs Filter -->
        <div class="tabs-row">
          <button 
            v-for="tab in ['all', 'pending', 'approved', 'returned', 'rejected']" 
            :key="tab"
            @click="activeFilter = tab"
            class="tab-pill"
            :class="{ active: activeFilter === tab }"
          >
            {{ tab.toUpperCase() }}
          </button>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Member / Student</th>
                <th>Requested Book</th>
                <th>Request Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredBorrowings" :key="item.id">
                <td>
                  <div class="user-cell">
                    <span class="user-name">{{ item.user_name }}</span>
                    <span class="user-email">{{ item.user_email }}</span>
                  </div>
                </td>
                <td>
                  <div class="font-semibold">{{ item.book_title }}</div>
                  <span class="author-sub">{{ item.book_author }}</span>
                </td>
                <td>{{ formatDate(item.borrow_date) }}</td>
                <td>{{ formatDate(item.due_date) }}</td>
                <td>
                  <span class="badge" :class="`badge-${item.status}`">{{ localeStore.t(item.status) || item.status }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'approved')" 
                      class="btn btn-success btn-sm"
                    >
                      <Check :size="14" /> Approve
                    </button>

                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'rejected')" 
                      class="btn btn-danger btn-sm"
                    >
                      <X :size="14" /> Reject
                    </button>

                    <button 
                      v-if="item.status === 'approved'"
                      @click="updateStatus(item.id, 'returned', item)" 
                      class="btn btn-primary btn-sm"
                    >
                      <RotateCcw :size="14" /> Mark Returned
                    </button>

                    <button 
                      @click="sendDueReminder(item)" 
                      class="btn btn-secondary btn-sm"
                      title="Send Due Date & Return Notification to Phone"
                    >
                      <BellRing :size="14" /> Send Reminder
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBorrowingsStore } from '../../stores/borrowings';
import { useLocaleStore } from '../../stores/locale';
import { useToastStore } from '../../stores/toast';
import { sendPhoneAndDrawerNotification } from '../../services/notificationService';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { Check, X, RotateCcw, BellRing } from 'lucide-vue-next';

const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();
const activeFilter = ref('all');

onMounted(() => {
  borrowingsStore.fetchAdminBorrowings();
});

const filteredBorrowings = computed(() => {
  if (activeFilter.value === 'all') return borrowingsStore.adminBorrowings;
  return borrowingsStore.adminBorrowings.filter(b => b.status === activeFilter.value);
});

async function updateStatus(id, newStatus, item) {
  try {
    await borrowingsStore.updateBorrowStatus(id, newStatus);
    await borrowingsStore.fetchAdminBorrowings();
    await borrowingsStore.fetchAdminDashboardStats();

    if (newStatus === 'approved' && item) {
      sendPhoneAndDrawerNotification({
        title: 'Borrow Request Approved! 📚',
        message: `Your borrowing request for "${item.book_title}" has been approved! Please pick up your copy at DUC Library.`,
        type: 'system'
      });
      toastStore.showSuccess(`Approved & notified student phone! 📱`, `Request Approved`);
    } else if (newStatus === 'returned' && item) {
      toastStore.showSuccess(`Marked "${item.book_title}" as returned!`, `Book Returned`);
    }
  } catch (err) {
    toastStore.show(err.message || 'Failed to update request status.', { type: 'error', title: 'Error' });
  }
}

function sendDueReminder(item) {
  sendPhoneAndDrawerNotification({
    title: 'Due Date Return Reminder ⏰',
    message: `Reminder for ${item.user_name}: The book "${item.book_title}" is due for return to the DUC Library resource center.`,
    type: 'system'
  });
  toastStore.showSuccess(`Sent due date reminder notification to ${item.user_name}! 📱`, `Reminder Sent`);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
.admin-layout-wrapper {
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
  width: 100%;
}

.admin-main-content {
  flex: 1;
  padding: 1.5rem 2rem 4rem;
  width: calc(100% - 280px);
  max-width: none !important;
}

.admin-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
}

.page-subtitle {
  color: var(--text-secondary);
}

.main-panel {
  padding: 1.5rem;
}

.tabs-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.tab-pill {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  color: var(--text-primary);
}

.tab-pill.active {
  background: var(--accent-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  padding: 0.85rem 1rem;
  background: rgba(125, 125, 125, 0.05);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.user-cell {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.font-semibold {
  font-weight: 600;
  color: var(--text-primary);
}

.author-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
}
</style>
