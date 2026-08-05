<template>
  <div class="admin-layout-wrapper">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="admin-main-content">
      <header class="admin-header">
        <div>
          <span class="admin-badge"><ShieldCheck :size="14" /> {{ localeStore.t('adminPortal') }}</span>
          <h1 class="page-title">{{ localeStore.t('overviewTitle') }}</h1>
          <p class="page-subtitle">{{ localeStore.t('overviewSubtitle') }}</p>
        </div>
        <div class="header-actions">
          <router-link to="/admin/books" class="btn btn-primary btn-sm">
            <Plus :size="16" /> {{ localeStore.t('addNewBook') }}
          </router-link>
        </div>
      </header>

      <div v-if="borrowingsStore.loading && !borrowingsStore.dashboardStats" class="loading-state">
        <Loader2 :size="36" class="spin" />
        <p>Loading analytics data...</p>
      </div>

      <template v-else-if="stats">
        <!-- Metrics KPI Grid -->
        <section class="kpi-grid">
          <div class="kpi-card glass-panel">
            <div class="kpi-icon icon-indigo"><BookOpen :size="24" /></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ stats.total_books }}</span>
              <span class="kpi-label">{{ localeStore.t('totalBooks') }}</span>
            </div>
          </div>

          <div class="kpi-card glass-panel">
            <div class="kpi-icon icon-blue"><Users :size="24" /></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ stats.total_users }}</span>
              <span class="kpi-label">{{ localeStore.t('registeredMembers') }}</span>
            </div>
          </div>

          <div class="kpi-card glass-panel">
            <div class="kpi-icon icon-emerald"><BookmarkCheck :size="24" /></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ stats.active_borrowings }}</span>
              <span class="kpi-label">{{ localeStore.t('currentlyBorrowed') }}</span>
            </div>
          </div>

          <div class="kpi-card glass-panel">
            <div class="kpi-icon icon-amber"><Clock :size="24" /></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ stats.pending_requests }}</span>
              <span class="kpi-label">{{ localeStore.t('pendingRequests') }}</span>
            </div>
          </div>

          <div class="kpi-card glass-panel">
            <div class="kpi-icon icon-rose"><AlertTriangle :size="24" /></div>
            <div class="kpi-data">
              <span class="kpi-value">{{ stats.overdue_count }}</span>
              <span class="kpi-label">{{ localeStore.t('overdueBooks') }}</span>
            </div>
          </div>

          <div class="kpi-card glass-panel">
            <div class="kpi-icon icon-teal"><Eye :size="24" /></div>
            <div class="kpi-data">
              <span class="kpi-value highlight-live">{{ stats.active_readers_count || 0 }}</span>
              <span class="kpi-label">Active Readers Online</span>
            </div>
          </div>
        </section>

        <!-- Visual Analytics Charts -->
        <AdminCharts :stats="stats" />

        <!-- Recent Activity Feed -->
        <section class="activity-section glass-panel">
          <div class="section-header">
            <h3>{{ localeStore.t('recentRequests') }}</h3>
            <router-link to="/admin/borrowings" class="link-more">{{ localeStore.t('viewAllRequests') }}</router-link>
          </div>

          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>{{ localeStore.t('member') }}</th>
                  <th>{{ localeStore.t('bookTitle') }}</th>
                  <th>{{ localeStore.t('requestedDate') }}</th>
                  <th>{{ localeStore.t('dueDate') }}</th>
                  <th>{{ localeStore.t('status') }}</th>
                  <th>{{ localeStore.t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in stats.recent_activity" :key="item.id">
                  <td>
                    <div class="user-cell">
                      <span class="user-name">{{ item.user_name }}</span>
                      <span class="user-email">{{ item.user_email }}</span>
                    </div>
                  </td>
                  <td class="font-semibold">{{ item.book_title }}</td>
                  <td>{{ formatDate(item.borrow_date) }}</td>
                  <td>{{ formatDate(item.due_date) }}</td>
                  <td>
                    <span class="badge" :class="`badge-${item.status}`">{{ localeStore.t(item.status) || item.status }}</span>
                  </td>
                  <td>
                    <router-link to="/admin/borrowings" class="btn btn-secondary btn-sm">
                      {{ localeStore.t('manage') }}
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
import { ShieldCheck, Plus, BookOpen, Users, BookmarkCheck, Clock, AlertTriangle, Loader2, Eye } from 'lucide-vue-next';

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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #8b5cf6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
}

.page-subtitle {
  color: var(--text-secondary);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.icon-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.icon-emerald { background: linear-gradient(135deg, #10b981, #059669); }
.icon-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.icon-rose { background: linear-gradient(135deg, #f43f5e, #e11d48); }

.kpi-data {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
}

.kpi-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.activity-section {
  padding: 1.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
}

.link-more {
  font-size: 0.88rem;
  color: var(--accent-primary);
  font-weight: 600;
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
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.font-semibold {
  font-weight: 600;
  color: var(--text-primary);
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

.loading-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}
</style>
