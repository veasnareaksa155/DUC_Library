<template>
  <div class="flex items-start min-h-screen w-full">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 py-6 px-8 pb-16 w-[calc(100%-280px)] max-w-none">
      <header class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-[2.2rem] font-extrabold">{{ localeStore.t('users') }} <span class="text-gradient">Directory</span></h1>
          <p class="text-[var(--text-secondary)]">View all registered student accounts, sync live data from Google Sheet, or manage roles.</p>
        </div>

        <button @click="openSyncModal" class="btn btn-primary">
          <FileSpreadsheet :size="18" /> Sync Google Sheet
        </button>
      </header>

      <div class="p-6 glass-panel">
        <div class="flex justify-between items-center mb-5">
          <div class="relative flex items-center w-full max-w-[450px]">
            <Search :size="18" class="absolute left-3.5 text-[var(--text-muted)] pointer-events-none z-10" />
            <input 
              v-model="searchQuery" 
              type="text" 
              class="w-full pl-[2.6rem] h-[42px] rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[0.9rem] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-[3px] focus:ring-indigo-500/20"
              placeholder="Search by Student ID, Name, Room, Major, or Phone..." 
            />
          </div>
        </div>

        <!-- Premium Glassmorphic Skeleton Loader -->
        <div v-if="loading && users.length === 0" class="animate-pulse w-full overflow-x-auto">
          <table class="w-full border-collapse text-left opacity-70">
            <thead>
              <tr>
                <th v-for="i in 6" :key="'th-'+i" class="px-4 py-3.5 bg-gray-500/5 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-24"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="'tr-'+i">
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="flex flex-col gap-2">
                    <div class="h-4 bg-[var(--border-color)] rounded w-28"></div>
                    <div class="h-4 bg-[var(--border-color)] rounded-full w-16"></div>
                  </div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="flex items-center gap-3">
                    <div class="w-[38px] h-[38px] rounded-full bg-[var(--border-color)] shrink-0"></div>
                    <div class="flex flex-col gap-2">
                      <div class="h-4 bg-[var(--border-color)] rounded w-32"></div>
                      <div class="h-3 bg-[var(--border-color)] rounded w-24"></div>
                    </div>
                  </div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="flex flex-col gap-2">
                    <div class="h-4 bg-[var(--border-color)] rounded w-40"></div>
                    <div class="h-3 bg-[var(--border-color)] rounded w-20"></div>
                  </div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="flex flex-col gap-2">
                    <div class="h-4 bg-[var(--border-color)] rounded w-24"></div>
                    <div class="h-3 bg-[var(--border-color)] rounded w-28"></div>
                  </div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-24"></div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)]">
                  <div class="h-8 bg-[var(--border-color)] rounded w-24"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr>
                <th class="px-4 py-3.5 bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-bold uppercase border-b border-[var(--border-color)]">Student ID & Room</th>
                <th class="px-4 py-3.5 bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-bold uppercase border-b border-[var(--border-color)]">Student Name</th>
                <th class="px-4 py-3.5 bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-bold uppercase border-b border-[var(--border-color)]">Major & Class</th>
                <th class="px-4 py-3.5 bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-bold uppercase border-b border-[var(--border-color)]">Phone & Telegram</th>
                <th class="px-4 py-3.5 bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-bold uppercase border-b border-[var(--border-color)]">Joined Date</th>
                <th class="px-4 py-3.5 bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-bold uppercase border-b border-[var(--border-color)]">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredUsers.length === 0" class="w-full">
                <td colspan="6" class="p-8 text-center text-[var(--text-muted)] text-[0.95rem]">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <Search :size="32" class="opacity-20 mb-2 mx-auto" />
                    <span>No students found matching your search.</span>
                  </div>
                </td>
              </tr>
              <tr v-for="u in paginatedUsers" :key="u.id">
                <td class="p-4 border-b border-[var(--border-color)] text-[0.9rem]">
                  <div class="flex flex-col gap-1">
                    <span class="font-mono font-bold bg-[var(--accent-gradient)] text-transparent bg-clip-text text-[0.88rem]">{{ u.student_id || 'DUC-USER' }}</span>
                    <span v-if="u.dorm_room" class="text-[0.75rem] font-semibold bg-indigo-500/12 text-indigo-500 px-2 py-0.5 rounded-full w-fit">Room {{ u.dorm_room }}</span>
                  </div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)] text-[0.9rem]">
                  <div class="flex items-center gap-3">
                    <div class="w-[38px] h-[38px] rounded-full bg-[var(--accent-gradient)] text-white font-bold flex items-center justify-center text-[1rem] overflow-hidden">
                      <img v-if="u.profile_photo" :src="u.profile_photo" class="w-full h-full rounded-full object-cover" alt="Student Photo" />
                      <span v-else>{{ (u.name_latin || u.name || 'S').charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <div class="font-bold text-[var(--text-primary)] text-[0.92rem]">{{ u.name_latin || u.name }}</div>
                      <div v-if="u.name_khmer" class="text-[0.8rem] text-[var(--text-secondary)]">{{ u.name_khmer }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)] text-[0.9rem]">
                  <div v-if="u.major" class="font-semibold text-[var(--text-primary)] text-[0.88rem]">{{ u.major }}</div>
                  <div v-if="u.class_code" class="text-[0.78rem] text-[var(--text-muted)]">{{ u.class_code }} ({{ u.degree_level || 'Degree' }})</div>
                  <div v-else-if="!u.major" class="text-muted">General Account</div>
                </td>
                <td class="p-4 border-b border-[var(--border-color)] text-[0.9rem]">
                  <div v-if="u.phone" class="font-semibold text-[0.85rem] font-mono">{{ u.phone }}</div>
                  <a v-if="u.telegram" :href="u.telegram.startsWith('http') ? u.telegram : 'https://' + u.telegram" target="_blank" class="text-[0.78rem] text-[var(--accent-primary)] underline block">
                    {{ u.telegram }}
                  </a>
                </td>
                <td class="p-4 border-b border-[var(--border-color)] text-[0.9rem]">{{ formatDate(u.created_at) }}</td>
                <td class="p-4 border-b border-[var(--border-color)] text-[0.9rem]">
                  <button @click="openProfileModal(u)" class="btn btn-secondary btn-sm">
                    <User :size="14" /> Profile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div v-if="filteredUsers.length > 0" class="flex justify-between items-center pt-5 mt-4 border-t border-[var(--border-color)]">
          <div class="text-[0.85rem] text-[var(--text-muted)] font-medium">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of {{ filteredUsers.length }} students
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

      <!-- Student Profile Card Modal -->
      <div v-if="isProfileModalOpen" class="fixed inset-0 bg-black/75 backdrop-blur-[8px] flex items-center justify-center z-[1000] p-6" @click.self="isProfileModalOpen = false">
        <div class="max-w-[780px] w-full max-h-[90vh] overflow-y-auto p-7 box-border rounded-[var(--radius-xl)] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[var(--shadow-xl)]">
          <header class="flex justify-between items-center mb-5">
            <h2>Student Full Profile Card</h2>
            <button @click="isProfileModalOpen = false" class="bg-transparent border-none text-[var(--text-muted)] cursor-pointer hover:text-slate-200"><X :size="20" /></button>
          </header>

          <div v-if="selectedStudent">
            <!-- Header Hero Banner -->
            <div class="flex items-center gap-5 p-5 bg-white/5 border border-[var(--border-color)] rounded-[var(--radius-lg)] mb-6">
              <div class="w-[72px] h-[72px] rounded-full bg-[var(--accent-gradient)] text-white font-extrabold text-[2rem] flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.35)]">
                <img v-if="selectedStudent.profile_photo" :src="selectedStudent.profile_photo" class="w-full h-full rounded-full object-cover" alt="Student Avatar" />
                <span v-else>{{ (selectedStudent.name_latin || selectedStudent.name || 'S').charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h3 class="text-[1.35rem] font-extrabold text-[var(--text-primary)] m-0">{{ selectedStudent.name_latin || selectedStudent.name }}</h3>
                  <span class="text-[1.1rem] bg-[var(--accent-gradient)] text-white px-3 py-1 rounded-full font-mono font-bold">{{ selectedStudent.student_id || 'N/A' }}</span>
                  <span v-if="selectedStudent.dorm_room" class="text-[0.85rem] px-3 py-1 font-semibold bg-indigo-500/12 text-indigo-500 rounded-full w-fit">Room {{ selectedStudent.dorm_room }}</span>
                </div>
                <div v-if="selectedStudent.name_khmer" class="text-[0.95rem] text-[var(--text-secondary)] mt-1">ឈ្មោះខ្មែរ: {{ selectedStudent.name_khmer }}</div>
                <div class="text-[0.85rem] text-[var(--text-muted)] mt-1 font-mono">{{ selectedStudent.email }}</div>
              </div>
            </div>

            <!-- Profile Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Academic Information -->
              <div class="bg-white/5 border border-[var(--border-color)] rounded-[var(--radius-md)] p-5">
                <h4 class="text-[1rem] font-bold text-[var(--accent-primary)] flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-color)]"><GraduationCap :size="18" /> Academic Info</h4>
                <div class="flex flex-col gap-2.5">
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Major (ជំនាញ):</span>
                    <span class="font-semibold text-[var(--accent-primary)]">{{ selectedStudent.major || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Degree Level (កម្រិត):</span>
                    <span class="font-semibold text-[var(--text-primary)]">{{ selectedStudent.degree_level || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Class Code (ថ្នាក់រៀន):</span>
                    <span class="font-semibold text-[var(--text-primary)] font-mono">{{ selectedStudent.class_code || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Status (ស្ថានភាព):</span>
                    <span class="font-semibold text-[var(--text-primary)] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full text-[0.78rem]">{{ selectedStudent.academic_status || 'Active Student' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Academic Year (ឆ្នាំទី):</span>
                    <span class="font-semibold text-[var(--text-primary)]">{{ selectedStudent.academic_year || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Generation (ជំនាន់):</span>
                    <span class="font-semibold text-[var(--text-primary)]">{{ selectedStudent.generation || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">BacII Grade / Year:</span>
                    <span class="font-semibold text-[var(--text-primary)]">
                      <template v-if="selectedStudent.grade || selectedStudent.exam_year">
                        Grade {{ selectedStudent.grade || '-' }} ({{ selectedStudent.exam_year || '-' }})
                      </template>
                      <template v-else>N/A</template>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Personal & Contact Info -->
              <div class="bg-white/5 border border-[var(--border-color)] rounded-[var(--radius-md)] p-5">
                <h4 class="text-[1rem] font-bold text-[var(--accent-primary)] flex items-center gap-2 mb-4 pb-2 border-b border-[var(--border-color)]"><UserCheck :size="18" /> Personal & Contact Info</h4>
                <div class="flex flex-col gap-2.5">
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Gender (ភេទ):</span>
                    <span class="font-semibold text-[var(--text-primary)]">{{ selectedStudent.gender || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Date of Birth (កំណើត):</span>
                    <span class="font-semibold text-[var(--text-primary)]">{{ selectedStudent.date_of_birth || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Birth Province (ខេត្ត/ក្រុង):</span>
                    <span class="font-semibold text-[var(--text-primary)]">{{ selectedStudent.province || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">High School (វិទ្យាល័យ):</span>
                    <span class="font-semibold text-[var(--text-primary)]">{{ selectedStudent.high_school || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Personal Phone (ទូរស័ព្ទ):</span>
                    <span class="font-semibold text-[var(--accent-primary)] font-mono">{{ selectedStudent.phone || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Telegram (តេឡេក្រាម):</span>
                    <a v-if="selectedStudent.telegram" :href="selectedStudent.telegram.startsWith('http') ? selectedStudent.telegram : 'https://' + selectedStudent.telegram" target="_blank" class="text-[0.78rem] text-[var(--accent-primary)] underline block">
                      {{ selectedStudent.telegram }}
                    </a>
                    <span v-else class="font-semibold text-[var(--text-primary)]">N/A</span>
                  </div>
                  <div class="flex justify-between items-center text-[0.85rem]">
                    <span class="text-[var(--text-muted)]">Guardian Phone (អាណាព្យាបាល):</span>
                    <span class="font-semibold text-[var(--text-primary)] font-mono">{{ selectedStudent.guardian_phone || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="flex justify-end items-center gap-3 mt-6 pt-5 border-t border-[var(--border-color)]">
            <button @click="isProfileModalOpen = false" class="btn btn-primary">Close Profile</button>
          </footer>
        </div>
      </div>

      <!-- Sync Google Sheet Modal -->
      <div v-if="isSyncModalOpen" class="fixed inset-0 bg-black/75 backdrop-blur-[8px] flex items-center justify-center z-[1000] p-6" @click.self="isSyncModalOpen = false">
        <div class="modal-content glass-panel">
          <header class="flex justify-between items-center mb-5">
            <h2>Sync Users from Google Sheet</h2>
            <button @click="isSyncModalOpen = false" class="bg-transparent border-none text-[var(--text-muted)] cursor-pointer hover:text-slate-200"><X :size="20" /></button>
          </header>

          <div class="modal-body">
            <p class="text-[0.9rem] text-[var(--text-secondary)] mb-5 leading-relaxed">
              To keep your Google Sheet <strong>Private</strong>, share your Google Sheet with the Service Account Email address below:
            </p>

            <div v-if="serviceAccountEmail" class="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-[var(--radius-md)] mb-4">
              <span class="block text-[0.8rem] font-bold text-[var(--text-primary)] mb-1.5">Service Account Email to Invite:</span>
              <div class="flex items-center gap-2 mb-1.5">
                <code class="flex-1 bg-[var(--bg-primary)] px-3 py-1.5 rounded-[var(--radius-sm)] font-mono text-[0.85rem] text-[var(--accent-primary)] break-all border border-[var(--border-color)]">{{ serviceAccountEmail }}</code>
                <button @click="copyEmail" class="btn btn-secondary btn-sm">Copy</button>
              </div>
              <small class="text-[0.78rem] text-[var(--text-muted)] block mt-1">Open Google Sheet -> Share -> Paste this email -> Viewer access -> Done</small>
            </div>

            <div v-else class="bg-amber-500/10 border border-amber-500/30 p-4 rounded-[var(--radius-md)] mb-4">
              <span class="block text-[0.8rem] font-bold text-[var(--text-primary)] mb-1.5">⚠️ Credentials File Required:</span>
              <small class="text-[0.78rem] text-[var(--text-muted)] block mt-1">Download JSON Key from Google Console -> save as <code>backend/google-credentials.json</code> -> restart server.</small>
            </div>

            <div class="mt-4">
              <label class="block text-[0.85rem] font-semibold mb-1.5">Google Spreadsheet ID</label>
              <input 
                v-model="spreadsheetId" 
                type="text" 
                class="w-full"
                placeholder="e.g. 1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU" 
              />
              <small class="text-[0.78rem] text-[var(--text-muted)] block mt-1">Found in your Google Sheet URL between <code>/d/</code> and <code>/edit</code></small>
            </div>

            <div v-if="syncMessage" class="flex items-center gap-2 px-4 py-3 bg-emerald-500/15 text-emerald-500 rounded-[var(--radius-md)] mt-4 text-[0.88rem]">
              <CheckCircle :size="16" /> {{ syncMessage }}
            </div>

            <div v-if="syncError" class="flex items-center gap-2 px-4 py-3 bg-red-500/15 text-red-500 rounded-[var(--radius-md)] mt-4 text-[0.88rem]">
              <AlertCircle :size="16" /> {{ syncError }}
            </div>
          </div>

          <footer class="flex justify-end items-center gap-3 mt-6 pt-5 border-t border-[var(--border-color)]">
            <button @click="isSyncModalOpen = false" class="btn btn-secondary">Cancel</button>
            <button @click="handleSync" class="btn btn-primary" :disabled="syncing">
              <RefreshCw :size="16" :class="{ 'animate-spin': syncing }" />
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
import { FileSpreadsheet, X, RefreshCw, AlertCircle, CheckCircle, Search, User, UserCheck, GraduationCap, ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next';

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
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/users`, {
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
  return users.value.filter(u => {
    const searchable = [
      u.name, u.name_khmer, u.name_latin, u.student_id, u.dorm_room, u.major, u.phone
    ].filter(Boolean).map(s => String(s).toLowerCase());
    return searchable.some(s => s.includes(q));
  });
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
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/service-account`);
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
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/users`, {
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
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/sync-sheet`, {
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


