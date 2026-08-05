<template>
  <div class="admin-layout-wrapper">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="admin-main-content">
      <header class="admin-header">
        <div>
          <h1 class="page-title">{{ localeStore.t('users') }} <span class="text-gradient">Directory</span></h1>
          <p class="page-subtitle">View all registered student accounts, sync live data from Google Sheet, or manage roles.</p>
        </div>

        <button @click="openSyncModal" class="btn btn-primary">
          <FileSpreadsheet :size="18" /> Sync Google Sheet
        </button>
      </header>

      <div class="glass-panel main-panel">
        <div class="search-filter-bar">
          <div class="search-input">
            <Search :size="18" class="icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by Student ID, Name, Room, Major, or Phone..." 
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Student ID & Room</th>
                <th>Student Name</th>
                <th>Major & Class</th>
                <th>Phone & Telegram</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in paginatedUsers" :key="u.id">
                <td>
                  <div class="student-id-cell">
                    <span class="student-id-badge">{{ u.student_id || 'DUC-USER' }}</span>
                    <span v-if="u.dorm_room" class="room-pill">Room {{ u.dorm_room }}</span>
                  </div>
                </td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-sm">
                      <img v-if="u.profile_photo" :src="u.profile_photo" class="avatar-img-sm" alt="Student Photo" />
                      <span v-else>{{ (u.name_latin || u.name || 'S').charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <div class="user-name-latin">{{ u.name_latin || u.name }}</div>
                      <div v-if="u.name_khmer" class="user-name-khmer">{{ u.name_khmer }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div v-if="u.major" class="major-text">{{ u.major }}</div>
                  <div v-if="u.class_code" class="class-subtext">{{ u.class_code }} ({{ u.degree_level || 'Degree' }})</div>
                  <div v-else-if="!u.major" class="text-muted">General Account</div>
                </td>
                <td>
                  <div v-if="u.phone" class="phone-text font-mono">{{ u.phone }}</div>
                  <a v-if="u.telegram" :href="u.telegram.startsWith('http') ? u.telegram : 'https://' + u.telegram" target="_blank" class="telegram-link">
                    {{ u.telegram }}
                  </a>
                </td>
                <td>{{ formatDate(u.created_at) }}</td>
                <td>
                  <button @click="openProfileModal(u)" class="btn btn-secondary btn-sm">
                    <User :size="14" /> Profile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div v-if="filteredUsers.length > 0" class="pagination-bar">
          <div class="pagination-info">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of {{ filteredUsers.length }} students
          </div>

          <div class="pagination-controls">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="btn-page"
            >
              <ChevronLeft :size="16" />
            </button>

            <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="btn-page"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Student Profile Card Modal -->
      <div v-if="isProfileModalOpen" class="modal-backdrop" @click.self="isProfileModalOpen = false">
        <div class="modal-content glass-panel modal-lg profile-modal-content">
          <header class="modal-header">
            <h2>Student Full Profile Card</h2>
            <button @click="isProfileModalOpen = false" class="btn-close"><X :size="20" /></button>
          </header>

          <div v-if="selectedStudent" class="profile-card-body">
            <!-- Header Hero Banner -->
            <div class="profile-hero-card">
              <div class="profile-avatar-lg">
                <img v-if="selectedStudent.profile_photo" :src="selectedStudent.profile_photo" class="avatar-img-lg" alt="Student Avatar" />
                <span v-else>{{ (selectedStudent.name_latin || selectedStudent.name || 'S').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="profile-hero-info">
                <div class="profile-title-row">
                  <h3 class="profile-name">{{ selectedStudent.name_latin || selectedStudent.name }}</h3>
                  <span class="student-id-badge lg">{{ selectedStudent.student_id || 'N/A' }}</span>
                  <span v-if="selectedStudent.dorm_room" class="room-pill lg">Room {{ selectedStudent.dorm_room }}</span>
                </div>
                <div v-if="selectedStudent.name_khmer" class="profile-khmer-name">ឈ្មោះខ្មែរ: {{ selectedStudent.name_khmer }}</div>
                <div class="profile-email font-mono">{{ selectedStudent.email }}</div>
              </div>
            </div>

            <!-- Profile Details Grid -->
            <div class="profile-sections-grid">
              <!-- Academic Information -->
              <div class="profile-section-box">
                <h4 class="section-title"><GraduationCap :size="18" /> Academic Info</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Major (ជំនាញ):</span>
                    <span class="info-val highlight">{{ selectedStudent.major || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Degree Level (កម្រិត):</span>
                    <span class="info-val">{{ selectedStudent.degree_level || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Class Code (ថ្នាក់រៀន):</span>
                    <span class="info-val font-mono">{{ selectedStudent.class_code || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Status (ស្ថានភាព):</span>
                    <span class="info-val status-pill">{{ selectedStudent.academic_status || 'Active Student' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Academic Year (ឆ្នាំទី):</span>
                    <span class="info-val">{{ selectedStudent.academic_year || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Generation (ជំនាន់):</span>
                    <span class="info-val">{{ selectedStudent.generation || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">BacII Grade / Year:</span>
                    <span class="info-val">
                      <template v-if="selectedStudent.grade || selectedStudent.exam_year">
                        Grade {{ selectedStudent.grade || '-' }} ({{ selectedStudent.exam_year || '-' }})
                      </template>
                      <template v-else>N/A</template>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Personal & Contact Info -->
              <div class="profile-section-box">
                <h4 class="section-title"><UserCheck :size="18" /> Personal & Contact Info</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Gender (ភេទ):</span>
                    <span class="info-val">{{ selectedStudent.gender || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Date of Birth (កំណើត):</span>
                    <span class="info-val">{{ selectedStudent.date_of_birth || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Birth Province (ខេត្ត/ក្រុង):</span>
                    <span class="info-val">{{ selectedStudent.province || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">High School (វិទ្យាល័យ):</span>
                    <span class="info-val">{{ selectedStudent.high_school || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Personal Phone (ទូរស័ព្ទ):</span>
                    <span class="info-val font-mono highlight">{{ selectedStudent.phone || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Telegram (តេឡេក្រាម):</span>
                    <a v-if="selectedStudent.telegram" :href="selectedStudent.telegram.startsWith('http') ? selectedStudent.telegram : 'https://' + selectedStudent.telegram" target="_blank" class="telegram-link">
                      {{ selectedStudent.telegram }}
                    </a>
                    <span v-else class="info-val">N/A</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Guardian Phone (អាណាព្យាបាល):</span>
                    <span class="info-val font-mono">{{ selectedStudent.guardian_phone || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="modal-footer mt-4">
            <button @click="isProfileModalOpen = false" class="btn btn-primary">Close Profile</button>
          </footer>
        </div>
      </div>

      <!-- Sync Google Sheet Modal -->
      <div v-if="isSyncModalOpen" class="modal-backdrop" @click.self="isSyncModalOpen = false">
        <div class="modal-content glass-panel">
          <header class="modal-header">
            <h2>Sync Users from Google Sheet</h2>
            <button @click="isSyncModalOpen = false" class="btn-close"><X :size="20" /></button>
          </header>

          <div class="modal-body">
            <p class="modal-desc">
              To keep your Google Sheet <strong>Private</strong>, share your Google Sheet with the Service Account Email address below:
            </p>

            <div v-if="serviceAccountEmail" class="service-email-box">
              <span class="label">Service Account Email to Invite:</span>
              <div class="email-copy-row">
                <code>{{ serviceAccountEmail }}</code>
                <button @click="copyEmail" class="btn btn-secondary btn-sm">Copy</button>
              </div>
              <small class="help-text">Open Google Sheet -> Share -> Paste this email -> Viewer access -> Done</small>
            </div>

            <div v-else class="service-email-box warning-box">
              <span class="label">⚠️ Credentials File Required:</span>
              <small class="help-text">Download JSON Key from Google Console -> save as <code>backend/google-credentials.json</code> -> restart server.</small>
            </div>

            <div class="form-group mt-3">
              <label>Google Spreadsheet ID</label>
              <input 
                v-model="spreadsheetId" 
                type="text" 
                placeholder="e.g. 1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU" 
              />
              <small class="help-text">Found in your Google Sheet URL between <code>/d/</code> and <code>/edit</code></small>
            </div>

            <div v-if="syncMessage" class="success-box">
              <CheckCircle :size="16" /> {{ syncMessage }}
            </div>

            <div v-if="syncError" class="error-box">
              <AlertCircle :size="16" /> {{ syncError }}
            </div>
          </div>

          <footer class="modal-footer">
            <button @click="isSyncModalOpen = false" class="btn btn-secondary">Cancel</button>
            <button @click="handleSync" class="btn btn-primary" :disabled="syncing">
              <RefreshCw :size="16" :class="{ spin: syncing }" />
              {{ syncing ? 'Syncing...' : 'Sync Students Now' }}
            </button>
          </footer>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useLocaleStore } from '../../stores/locale';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { FileSpreadsheet, X, RefreshCw, AlertCircle, CheckCircle, Search, User, UserCheck, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const users = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(15);

const isSyncModalOpen = ref(false);
const spreadsheetId = ref('1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU');
const serviceAccountEmail = ref('');
const syncing = ref(false);
const syncMessage = ref('');
const syncError = ref('');

const isProfileModalOpen = ref(false);
const selectedStudent = ref(null);

async function openProfileModal(student) {
  selectedStudent.value = student;
  isProfileModalOpen.value = true;
  try {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const allUsers = await res.json();
      users.value = allUsers;
      const updated = allUsers.find(u => u.id === student.id);
      if (updated) {
        selectedStudent.value = updated;
      }
    }
  } catch (err) {
    console.error('Failed to fetch updated profile:', err);
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;
  const q = searchQuery.value.toLowerCase().trim();
  return users.value.filter(u => 
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.name_khmer && u.name_khmer.toLowerCase().includes(q)) ||
    (u.name_latin && u.name_latin.toLowerCase().includes(q)) ||
    (u.student_id && u.student_id.toLowerCase().includes(q)) ||
    (u.dorm_room && u.dorm_room.toLowerCase().includes(q)) ||
    (u.major && u.major.toLowerCase().includes(q)) ||
    (u.phone && u.phone.includes(q))
  );
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value) || 1);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredUsers.value.slice(start, start + itemsPerPage.value);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  fetchUsers();
  fetchServiceAccount();
});

async function fetchServiceAccount() {
  try {
    const res = await fetch('/api/auth/service-account');
    const data = await res.json();
    if (res.ok && data.service_account_email) {
      serviceAccountEmail.value = data.service_account_email;
    }
  } catch (err) {
    console.error('Failed to fetch service account email:', err);
  }
}

function copyEmail() {
  if (serviceAccountEmail.value) {
    navigator.clipboard.writeText(serviceAccountEmail.value);
    alert('Copied Service Account Email to clipboard!');
  }
}

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      users.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch users:', err);
  } finally {
    loading.value = false;
  }
}

function openSyncModal() {
  syncMessage.value = '';
  syncError.value = '';
  isSyncModalOpen.value = true;
}

async function handleSync() {
  syncing.value = true;
  syncMessage.value = '';
  syncError.value = '';

  try {
    const res = await fetch('/api/auth/sync-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ spreadsheet_id: spreadsheetId.value })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Sync failed');

    syncMessage.value = data.message;
    await fetchUsers();
  } catch (err) {
    syncError.value = err.message || 'Failed to sync Google Sheet data.';
  } finally {
    syncing.value = false;
  }
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.search-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 450px;
}

.search-input .icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 2;
}

.search-input input {
  width: 100%;
  padding-left: 2.6rem;
  height: 42px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-input input:focus {
  border-color: var(--accent-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
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

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.font-mono {
  font-family: monospace;
  color: var(--text-secondary);
}

.modal-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.service-email-box {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.service-email-box.warning-box {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.service-email-box .label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.email-copy-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.email-copy-row code {
  flex: 1;
  background: var(--bg-primary);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--accent-primary);
  word-break: break-all;
  border: 1px solid var(--border-color);
}

.mt-3 {
  margin-top: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.form-group input {
  width: 100%;
}

.help-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: block;
  margin-top: 0.25rem;
}

.success-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  font-size: 0.88rem;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-radius: var(--radius-md);
  margin-top: 1rem;
  font-size: 0.88rem;
}

.student-id-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-id-badge {
  font-family: monospace;
  font-weight: 700;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 0.88rem;
}

.student-id-badge.lg {
  font-size: 1.1rem;
  background: var(--accent-gradient);
  color: white;
  -webkit-text-fill-color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.room-pill {
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  width: fit-content;
}

.room-pill.lg {
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-sm {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  overflow: hidden;
}

.avatar-img-sm {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-img-lg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-name-latin {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.92rem;
}

.user-name-khmer {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.major-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.88rem;
}

.class-subtext {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.phone-text {
  font-weight: 600;
  font-size: 0.85rem;
}

.telegram-link {
  font-size: 0.78rem;
  color: var(--accent-primary);
  text-decoration: underline;
  display: block;
}

.profile-modal-content {
  max-width: 780px;
}

.profile-hero-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.profile-avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  font-weight: 800;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
}

.profile-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.profile-name {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.profile-khmer-name {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.profile-email {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.profile-sections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.profile-section-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.info-label {
  color: var(--text-muted);
}

.info-val {
  font-weight: 600;
  color: var(--text-primary);
}

.info-val.highlight {
  color: var(--accent-primary);
}

.status-pill {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.78rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.profile-modal-content {
  max-width: 780px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.75rem;
  box-sizing: border-box;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 640px) {
  .profile-sections-grid {
    grid-template-columns: 1fr;
  }
}
</style>
