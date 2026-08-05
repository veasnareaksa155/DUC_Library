<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="close">
      <div class="modal-content glass-panel modal-lg profile-modal-content">
        <header class="modal-header">
          <div>
            <h2>My Student Profile</h2>
            <p class="header-subtext">Official student academic records are verified and locked. You may update your profile photo.</p>
          </div>
          <button @click="close" class="btn-close"><X :size="20" /></button>
        </header>

        <div v-if="user" class="profile-card-body">
          <!-- Notice Banner -->
          <div v-if="!user.student_id" class="sheet-notice-banner">
            <Info :size="20" class="info-icon" />
            <div>
              <strong>Logging in as an Imported Student?</strong>
              <p>If your account was imported from Google Sheet, log in with your <strong>Student ID</strong> (e.g. <code>DUC2024-0060</code>) as username and password to access your verified profile!</p>
            </div>
          </div>

          <!-- Header Hero Banner with Photo Upload -->
          <div class="profile-hero-card">
            <div class="avatar-upload-wrapper" @click="triggerPhotoSelect" title="Click to Change Profile Photo">
              <div class="profile-avatar-lg">
                <img v-if="user.profile_photo" :src="user.profile_photo" class="avatar-img-lg" alt="Profile Photo" />
                <span v-else>{{ (user.name_latin || user.name || 'S').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="avatar-overlay">
                <Camera :size="20" />
              </div>
            </div>

            <div class="profile-hero-info">
              <div class="profile-title-row">
                <h3 class="profile-name">{{ user.name_latin || user.name }}</h3>
                <span class="student-id-badge lg">{{ user.student_id || 'STUDENT' }}</span>
                <span v-if="user.dorm_room" class="room-pill lg">Room {{ user.dorm_room }}</span>
              </div>
              <div v-if="user.name_khmer" class="profile-khmer-name">ឈ្មោះខ្មែរ: {{ user.name_khmer }}</div>
              <div class="profile-email font-mono">{{ user.email }}</div>
            </div>

            <button @click="triggerPhotoSelect" class="btn btn-secondary btn-sm edit-photo-btn" :disabled="uploading">
              <Camera :size="14" /> {{ uploading ? 'Uploading...' : 'Change Photo' }}
            </button>
            <input type="file" ref="fileInputRef" accept="image/*" @change="onPhotoSelected" style="display: none" />
          </div>

          <div v-if="photoMessage" class="success-box mb-3">{{ photoMessage }}</div>
          <div v-if="photoError" class="error-box mb-3">{{ photoError }}</div>

          <!-- View Profile Details Grid Mode (Read-Only Verified Records) -->
          <div class="profile-sections-grid">
            <!-- Academic Information (Locked Official Record) -->
            <div class="profile-section-box">
              <div class="section-title-row">
                <h4 class="section-title"><GraduationCap :size="18" /> Academic Info</h4>
                <span class="lock-badge" title="Official Google Sheet Record - Read Only"><Lock :size="12" /> Verified</span>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Major (ជំនាញ):</span>
                  <span class="info-val highlight">{{ user.major || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Degree Level (កម្រិត):</span>
                  <span class="info-val">{{ user.degree_level || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Class Code (ថ្នាក់រៀន):</span>
                  <span class="info-val font-mono">{{ user.class_code || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status (ស្ថានភាព):</span>
                  <span class="info-val status-pill">{{ user.academic_status || 'Active Student' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Academic Year (ឆ្នាំទី):</span>
                  <span class="info-val">{{ user.academic_year || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Generation (ជំនាន់):</span>
                  <span class="info-val">{{ user.generation || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">BacII Grade / Year:</span>
                  <span class="info-val">
                    <template v-if="user.grade || user.exam_year">
                      Grade {{ user.grade || '-' }} ({{ user.exam_year || '-' }})
                    </template>
                    <template v-else>N/A</template>
                  </span>
                </div>
              </div>
            </div>

            <!-- Personal & Contact Info (Read-Only Official Record) -->
            <div class="profile-section-box">
              <div class="section-title-row">
                <h4 class="section-title"><UserCheck :size="18" /> Personal & Contact Info</h4>
                <span class="lock-badge" title="Official Google Sheet Record - Read Only"><Lock :size="12" /> Verified</span>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Gender (ភេទ):</span>
                  <span class="info-val">{{ user.gender || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date of Birth (កំណើត):</span>
                  <span class="info-val">{{ user.date_of_birth || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Birth Province (ខេត្ត/ក្រុង):</span>
                  <span class="info-val">{{ user.province || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">High School (វិទ្យាល័យ):</span>
                  <span class="info-val">{{ user.high_school || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Personal Phone (ទូរស័ព្ទ):</span>
                  <span class="info-val font-mono highlight">{{ user.phone || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Telegram (តេឡេក្រាម):</span>
                  <a v-if="user.telegram" :href="user.telegram.startsWith('http') ? user.telegram : 'https://' + user.telegram" target="_blank" class="telegram-link">
                    {{ user.telegram }}
                  </a>
                  <span v-else class="info-val">N/A</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Guardian Phone (អាណាព្យាបាល):</span>
                  <span class="info-val font-mono">{{ user.guardian_phone || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer class="modal-footer mt-4">
          <button @click="close" class="btn btn-primary">Close Profile</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { X, GraduationCap, UserCheck, Info, Camera, Lock } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const authStore = useAuthStore();

const user = computed(() => authStore.user);

const fileInputRef = ref(null);
const uploading = ref(false);
const photoMessage = ref('');
const photoError = ref('');

function triggerPhotoSelect() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

function compressAndResizeImage(file, maxWidth = 400, maxHeight = 400, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function onPhotoSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    photoError.value = 'Image file size must be less than 10MB.';
    return;
  }

  uploading.value = true;
  photoMessage.value = '';
  photoError.value = '';

  try {
    const compressedDataUrl = await compressAndResizeImage(file, 400, 400, 0.75);

    const res = await fetch('/api/auth/profile-photo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ profile_photo: compressedDataUrl })
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = {};
    }

    if (!res.ok) throw new Error(data.message || `Server error (${res.status})`);

    photoMessage.value = 'Profile photo updated successfully!';
    authStore.user = data.user;
    localStorage.setItem('duc_user', JSON.stringify(data.user));

    setTimeout(() => {
      photoMessage.value = '';
    }, 2500);
  } catch (err) {
    console.error('Photo upload error:', err);
    photoError.value = err.message || 'Failed to upload profile photo.';
  } finally {
    uploading.value = false;
  }
}

function close() {
  photoMessage.value = '';
  photoError.value = '';
  emit('close');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1.5rem;
  box-sizing: border-box;
}

.profile-modal-content {
  max-width: 780px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 1.75rem;
  box-sizing: border-box;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  color: var(--text-primary);
  margin: auto;
}

.avatar-upload-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar-upload-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.lock-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.25);
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-sm);
  font-size: 0.74rem;
  font-weight: 600;
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
  overflow: hidden;
}

.avatar-img-lg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
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

.student-id-badge.lg {
  font-size: 0.9rem;
  font-family: monospace;
  background: var(--accent-gradient);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 700;
}

.room-pill.lg {
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
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

.telegram-link {
  font-size: 0.78rem;
  color: var(--accent-primary);
  text-decoration: underline;
}

.status-pill {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.78rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.header-subtext {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.sheet-notice-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  color: var(--text-primary);
}

.sheet-notice-banner .info-icon {
  color: #6366f1;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.sheet-notice-banner p {
  margin-top: 0.25rem;
  margin-bottom: 0;
  line-height: 1.4;
  color: var(--text-secondary);
}

.edit-btn {
  margin-left: auto;
  align-self: flex-start;
}

.form-sections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  margin-bottom: 0.85rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
}

.success-box {
  padding: 0.75rem 1rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
}

.error-box {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
}
</style>
