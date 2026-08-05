<template>
  <div class="charts-section-grid">
    <!-- Bar Chart: Monthly Activity Trends -->
    <div class="chart-card glass-panel">
      <div class="chart-header">
        <div>
          <h3>Monthly Borrowing & Return Trends</h3>
          <p class="chart-subtitle">Annual borrowing activity breakdown (2026)</p>
        </div>
        <div class="chart-legend">
          <span class="legend-item"><span class="dot dot-indigo"></span> Borrowed</span>
          <span class="legend-item"><span class="dot dot-emerald"></span> Returned</span>
        </div>
      </div>

      <div class="bar-chart-wrapper">
        <svg viewBox="0 0 500 180" class="bar-chart-svg">
          <!-- Horizontal Grid lines -->
          <line x1="30" y1="30" x2="480" y2="30" class="chart-grid-line" />
          <line x1="30" y1="75" x2="480" y2="75" class="chart-grid-line" />
          <line x1="30" y1="120" x2="480" y2="120" class="chart-grid-line" />
          <line x1="30" y1="150" x2="480" y2="150" class="chart-axis-line" />

          <!-- Monthly Bar Groups (Jan to Dec) -->
          <g v-for="(m, i) in monthlyData" :key="i" :transform="`translate(${45 + i * 36}, 0)`">
            <!-- Borrowed Bar -->
            <rect 
              :x="0" 
              :y="150 - (m.borrowed ? Math.max(8, (m.borrowed / (maxVal || 1)) * 120) : 0)" 
              width="11" 
              :height="m.borrowed ? Math.max(8, (m.borrowed / (maxVal || 1)) * 120) : 0" 
              rx="3"
              class="bar-rect bar-borrowed"
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
              class="bar-rect bar-returned"
            >
              <title>{{ m.month }}: {{ m.returned }} Returned</title>
            </rect>

            <!-- Month Label -->
            <text :x="11" y="168" text-anchor="middle" class="bar-label">{{ m.month }}</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- Doughnut Chart & Category Breakdown -->
    <div class="chart-card glass-panel">
      <div class="chart-header">
        <div>
          <h3>Borrowing Status Distribution</h3>
          <p class="chart-subtitle">Real-time status metrics of all requests</p>
        </div>
      </div>

      <div class="status-donut-wrapper">
        <div class="donut-svg-container">
          <svg viewBox="0 0 100 100" class="donut-svg">
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
              class="donut-segment"
            />
            <!-- Returned Arc -->
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="#10b981" 
              stroke-width="12" 
              :stroke-dasharray="`${statusPercent.returned * 2.38} 238`"
              :stroke-dashoffset="`-${statusPercent.approved * 2.38}`"
              class="donut-segment"
            />
            <!-- Pending Arc -->
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="#f59e0b" 
              stroke-width="12" 
              :stroke-dasharray="`${statusPercent.pending * 2.38} 238`"
              :stroke-dashoffset="`-${(statusPercent.approved + statusPercent.returned) * 2.38}`"
              class="donut-segment"
            />
          </svg>
          <div class="donut-center-text">
            <span class="donut-total">{{ totalCount }}</span>
            <span class="donut-label">Total</span>
          </div>
        </div>

        <div class="donut-legend-list">
          <div class="legend-row">
            <span class="dot dot-blue"></span>
            <span class="legend-name">Approved</span>
            <span class="legend-val">{{ stats?.active_borrowings || 0 }}</span>
          </div>

          <div class="legend-row">
            <span class="dot dot-amber"></span>
            <span class="legend-name">Pending</span>
            <span class="legend-val">{{ stats?.pending_requests || 0 }}</span>
          </div>

          <div class="legend-row">
            <span class="dot dot-emerald"></span>
            <span class="legend-name">Returned</span>
            <span class="legend-val">{{ returnedCount }}</span>
          </div>

          <div class="legend-row">
            <span class="dot dot-rose"></span>
            <span class="legend-name">Overdue</span>
            <span class="legend-val">{{ stats?.overdue_count || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Unified Single Live & Periodic Library Analytics Card -->
    <div class="chart-card glass-panel full-width-card mt-4">
      <div class="chart-header flex-between flex-wrap gap-3">
        <div>
          <h3 class="flex-heading">
            <span class="live-pulse-dot"></span> Live & Periodic Library Analytics
          </h3>
          <p class="chart-subtitle">Real-time student readers online & official activity reports for {{ currentPeriodName }}</p>
        </div>

        <div class="report-filter-group">
          <div class="live-count-pill mr-2">
            🟢 <strong>{{ stats?.active_readers_count || 0 }}</strong> Online Now
          </div>

          <button 
            @click="fetchReport('1day')" 
            class="report-tab-btn" 
            :class="{ active: currentPeriod === '1day' }"
          >
            Today (1 Day)
          </button>
          <button 
            @click="fetchReport('1week')" 
            class="report-tab-btn" 
            :class="{ active: currentPeriod === '1week' }"
          >
            This Week (7 Days)
          </button>
          <button 
            @click="fetchReport('1month')" 
            class="report-tab-btn" 
            :class="{ active: currentPeriod === '1month' }"
          >
            This Month (30 Days)
          </button>
          <button 
            @click="fetchReport('all')" 
            class="report-tab-btn" 
            :class="{ active: currentPeriod === 'all' }"
          >
            All Time
          </button>

          <button @click="printOfficialReport" class="btn btn-primary btn-sm export-report-btn">
            🖨️ Export / Print Report
          </button>
        </div>
      </div>

      <div v-if="reportLoading" class="loading-report-box">
        <Loader2 :size="24" class="spin" /> Generating {{ currentPeriodName }} Analytics Report...
      </div>

      <div v-else-if="reportData" class="report-summary-grid">
        <!-- Report Metrics Summary Row -->
        <div class="report-kpi-row">
          <div class="report-mini-kpi">
            <span class="mini-kpi-val">{{ reportData.total_reads }}</span>
            <span class="mini-kpi-lbl">Total Borrowing Activity</span>
          </div>
          <div class="report-mini-kpi">
            <span class="mini-kpi-val">{{ reportData.borrowings_summary?.total_borrowings || 0 }}</span>
            <span class="mini-kpi-lbl">Physical Borrowings</span>
          </div>
          <div class="report-mini-kpi">
            <span class="mini-kpi-val text-emerald">{{ reportData.borrowings_summary?.total_returned || 0 }}</span>
            <span class="mini-kpi-lbl">Books Returned</span>
          </div>
          <div class="report-mini-kpi">
            <span class="mini-kpi-val text-purple">{{ stats?.active_readers_count || 0 }}</span>
            <span class="mini-kpi-lbl">Live Active Readers Online</span>
          </div>
        </div>

        <div class="report-details-grid">
          <!-- Left Column: Current Active Readers & Top Student Borrowers -->
          <div class="report-col-group">
            <!-- 1. Current Active Readers (Right Now) -->
            <div class="report-col mb-4">
              <h4 class="col-title">🟢 Current Active Readers (Right Now)</h4>
              <div v-if="!stats?.active_readers_detail || stats.active_readers_detail.length === 0" class="empty-analytics-box">
                <p class="text-muted">No students are currently reading online right now.</p>
              </div>
              <div v-else class="active-readers-list">
                <div v-for="item in stats.active_readers_detail" :key="item.session_db_id || item.session_id" class="reader-row">
                  <div class="user-avatar-sm">
                    <img v-if="item.profile_photo" :src="item.profile_photo" class="avatar-img-sm" />
                    <span v-else>{{ (item.user_name || 'G').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="reader-book-info">
                    <div class="reader-user-name">
                      {{ item.name_khmer || item.user_name || 'Guest Student' }}
                      <span v-if="item.student_id" class="student-id-pill">{{ item.student_id }}</span>
                      <span v-if="item.dorm_room" class="room-pill-sm">Room {{ item.dorm_room }}</span>
                    </div>
                    <div class="reader-book-title-sub">📖 Reading: <strong>{{ item.book_title }}</strong></div>
                    <div class="reader-status-badge">
                      <span class="live-pulse-dot small"></span> Active Online Now
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Top Active Student Borrowers -->
            <div class="report-col">
              <h4 class="col-title">🏆 Top Active Student Borrowers ({{ reportData.period_name }})</h4>
              <div v-if="!reportData.top_readers || reportData.top_readers.length === 0" class="empty-analytics-box">
                <p class="text-muted">No borrowing activity recorded for {{ reportData.period_name }}.</p>
              </div>
              <div v-else class="top-readers-list">
                <div v-for="(r, idx) in reportData.top_readers" :key="r.id" class="top-reader-item">
                  <span class="rank-badge">#{{ idx + 1 }}</span>
                  <div class="user-avatar-sm">
                    <img v-if="r.profile_photo" :src="r.profile_photo" class="avatar-img-sm" />
                    <span v-else>{{ (r.name || 'S').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="reader-details">
                    <div class="reader-name-title">{{ r.name_khmer || r.name }}</div>
                    <div class="reader-sub-info font-mono">{{ r.student_id || r.email }}</div>
                  </div>
                  <div class="sessions-badge">
                    📖 <strong>{{ r.read_sessions }}</strong> Activity
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Top Popular Books -->
          <div class="report-col-group">
            <div class="report-col h-100">
              <h4 class="col-title">🔥 Top Popular Books ({{ reportData.period_name }})</h4>
              <div v-if="!reportData.top_books || reportData.top_books.length === 0" class="empty-analytics-box">
                <p class="text-muted">No book borrowing activity recorded for {{ reportData.period_name }}.</p>
              </div>
              <div v-else class="top-books-report-list">
                <div v-for="(b, idx) in reportData.top_books" :key="b.id" class="top-book-item">
                  <span class="rank-badge">#{{ idx + 1 }}</span>
                  <img :src="b.cover_url || fallbackCover" class="top-book-cover-sm" />
                  <div class="top-book-details">
                    <div class="top-book-name">{{ b.title }}</div>
                    <div class="top-book-cat">{{ b.category_name || 'General' }}</div>
                  </div>
                  <div class="period-reads-badge">
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
import { useAuthStore } from '../stores/auth';
import { Loader2 } from 'lucide-vue-next';
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
    const res = await fetch(`/api/admin/reading-reports?period=${period}`, {
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
.charts-section-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.chart-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.chart-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
}

.chart-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.chart-legend {
  display: flex;
  gap: 0.85rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.dot-indigo { background: #6366f1; }
.dot-emerald { background: #10b981; }
.dot-blue { background: #3b82f6; }
.dot-amber { background: #f59e0b; }
.dot-rose { background: #ef4444; }

.bar-chart-wrapper {
  width: 100%;
  height: 200px;
}

.bar-chart-svg {
  width: 100%;
  height: 100%;
}

.chart-grid-line {
  stroke: rgba(125, 125, 125, 0.12);
  stroke-dasharray: 4 4;
}

.chart-axis-line {
  stroke: var(--border-color);
  stroke-width: 1.5;
}

.bar-rect {
  transition: height 0.6s var(--spring-ease), y 0.6s var(--spring-ease), opacity 0.2s ease;
}

.bar-borrowed {
  fill: url(#borrowedGradient);
  fill: #6366f1;
}

.bar-returned {
  fill: #10b981;
}

.bar-rect:hover {
  opacity: 0.85;
  cursor: pointer;
}

.bar-label {
  font-size: 10px;
  fill: var(--text-muted);
  font-weight: 600;
}

.status-donut-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: auto 0;
}

.donut-svg-container {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-segment {
  transition: stroke-dasharray 0.8s var(--spring-ease), stroke-dashoffset 0.8s var(--spring-ease);
}

.donut-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}

.donut-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.donut-legend-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.legend-name {
  color: var(--text-secondary);
  flex: 1;
}

.legend-val {
  font-weight: 700;
  color: var(--text-primary);
}

@media (max-width: 1024px) {
  .charts-section-grid {
    grid-template-columns: 1fr;
  }
}

.full-width-card {
  grid-column: 1 / -1;
}

.flex-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.live-count-pill {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.readers-analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

.col-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.empty-analytics-box {
  background: rgba(125, 125, 125, 0.05);
  padding: 2rem;
  border-radius: var(--radius-md);
  text-align: center;
}

.active-readers-list, .top-books-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reader-row, .top-book-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(125, 125, 125, 0.06);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.reader-book-cover, .top-book-cover {
  width: 38px;
  height: 52px;
  object-fit: cover;
  border-radius: 4px;
}

.reader-book-info, .top-book-info {
  flex: 1;
}

.reader-book-title, .top-book-title {
  font-size: 0.9rem;
  font-weight: 700;
}

.reader-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #10b981;
  font-weight: 600;
  margin-top: 0.2rem;
}

.rank-num {
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent-primary);
  min-width: 28px;
}

.top-book-meta {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.reads-count-badge {
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-primary);
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.live-pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-ring 1.8s infinite;
  display: inline-block;
}

.live-pulse-dot.small {
  width: 6px;
  height: 6px;
}

.user-avatar-sm {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img-sm {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reader-user-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.student-id-pill {
  background: rgba(99, 102, 241, 0.18);
  color: #818cf8;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.room-pill-sm {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.reader-book-title-sub {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.report-filter-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.report-tab-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background: rgba(125, 125, 125, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-tab-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
}

.report-tab-btn.active {
  background: var(--accent-gradient);
  color: white;
  border-color: transparent;
}

.export-report-btn {
  margin-left: 0.5rem;
  font-weight: 700;
}

.loading-report-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--text-muted);
}

.report-summary-grid {
  margin-top: 1.5rem;
}

.report-kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.report-mini-kpi {
  background: rgba(125, 125, 125, 0.06);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mini-kpi-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--accent-primary);
}

.mini-kpi-lbl {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-top: 0.2rem;
}

.report-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.report-col {
  background: rgba(125, 125, 125, 0.03);
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.top-readers-list, .top-books-report-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 1rem;
}

.top-reader-item, .top-book-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  background: rgba(125, 125, 125, 0.05);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.rank-badge {
  font-weight: 800;
  color: var(--accent-primary);
  min-width: 24px;
}

.reader-details, .top-book-details {
  flex: 1;
}

.reader-name-title, .top-book-name {
  font-size: 0.88rem;
  font-weight: 700;
}

.reader-sub-info, .top-book-cat {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.sessions-badge, .period-reads-badge {
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-primary);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.top-book-cover-sm {
  width: 32px;
  height: 44px;
  object-fit: cover;
  border-radius: 4px;
}

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
