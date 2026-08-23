<template>
  <div class="max-w-[1280px] mx-auto px-6 pt-8 pb-20">
    <header class="mb-8">
      <div>
        <h2 class="text-3xl font-extrabold text-[var(--text-primary)] m-0 mb-2 tracking-tight">{{ authStore.isAdmin ? 'My Admin Profile' : 'My Student Profile' }}</h2>
        <p class="text-base text-[var(--text-muted)] m-0 leading-relaxed">{{ authStore.isAdmin ? 'Manage your library administrator account and profile settings.' : 'Official student academic records are verified and locked. You may update your profile photo.' }}</p>
      </div>
    </header>

    <div v-if="user">
      <!-- Notice Banner -->
      <div v-if="!user.student_id && !authStore.isAdmin" class="flex items-start gap-4 p-4 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-r-md mb-8 text-[var(--text-primary)]">
        <Info :size="20" class="text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong class="text-sm">Imported Student Account?</strong>
          <p class="mt-1 mb-0 text-[0.85rem] text-[var(--text-secondary)] leading-relaxed">If your account was imported from Google Sheet, log in with your <strong>Student ID</strong> (e.g. <code>DUC2024-0060</code>) as username and password to access your verified profile!</p>
        </div>
      </div>

      <!-- Header Hero Banner with Photo Upload -->
      <div class="flex flex-col md:flex-row md:items-center gap-6 p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg mb-8 text-center md:text-left">
        <div class="relative cursor-pointer group mx-auto md:mx-0 shrink-0" @click="triggerPhotoSelect" title="Click to Change Profile Photo">
          <div class="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-3xl flex items-center justify-center overflow-hidden transition-colors group-hover:border-indigo-500">
            <img v-if="user.profile_photo" :src="user.profile_photo" class="w-full h-full rounded-full object-cover" alt="Profile Photo" />
            <span v-else>{{ (user.name_latin || user.name || 'S').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Camera :size="20" />
          </div>
        </div>

        <div class="flex-1">
          <div class="flex items-center justify-center md:justify-start gap-3 flex-wrap mb-1">
            <h3 class="text-xl font-bold text-[var(--text-primary)] m-0 tracking-tight">{{ user.name_latin || user.name }}</h3>
            <span class="text-xs font-mono px-2 py-0.5 rounded-md font-bold" :class="authStore.isAdmin ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-600 border border-indigo-500/30'">{{ authStore.isAdmin ? 'ADMINISTRATOR' : (user.student_id || 'STUDENT') }}</span>
            <span v-if="user.dorm_room && !authStore.isAdmin" class="text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] px-2 py-0.5 rounded-md">Room {{ user.dorm_room }}</span>
          </div>
          <div v-if="user.name_khmer" class="text-[0.95rem] text-[var(--text-secondary)] mb-1">ឈ្មោះខ្មែរ: {{ user.name_khmer }}</div>
          <div class="text-[0.85rem] text-[var(--text-muted)] font-mono">{{ user.email }}</div>
        </div>

        <button @click="triggerPhotoSelect" class="bg-transparent border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center w-full md:w-auto gap-2 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] mt-4 md:mt-0" :disabled="uploading">
          <Camera :size="16" /> {{ uploading ? 'Uploading...' : 'Change Photo' }}
        </button>
        <input type="file" ref="fileInputRef" accept="image/*" @change="onPhotoSelected" class="hidden" />
      </div>

      <div v-if="photoMessage" class="px-5 py-3.5 rounded-xl font-semibold mb-5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">{{ photoMessage }}</div>
      <div v-if="photoError" class="px-5 py-3.5 rounded-xl font-semibold mb-5 bg-red-500/15 text-red-500 border border-red-500/30">{{ photoError }}</div>

      <!-- View Profile Details Grid Mode (Read-Only Verified Records) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Admin Specific Information -->
        <div v-if="authStore.isAdmin" class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
          <div class="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border-color)]">
            <h4 class="text-[1rem] font-bold text-[var(--text-primary)] flex items-center gap-2 m-0"><ShieldCheck :size="18" class="text-[var(--text-muted)]" /> Admin Details</h4>
            <span class="inline-flex items-center gap-1 text-[var(--text-muted)] text-[0.7rem] font-bold uppercase tracking-wider" title="System Administrator"><Lock :size="12" /> Unrestricted</span>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Role Level</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">System Administrator</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Permissions</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">Full Access</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Dashboard Access</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">Granted</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Library Management</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">Granted</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Account Created</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Academic Information (Locked Official Record - Student Only) -->
        <div v-else class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
          <div class="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border-color)]">
            <h4 class="text-[1rem] font-bold text-[var(--text-primary)] flex items-center gap-2 m-0"><GraduationCap :size="18" class="text-[var(--text-muted)]" /> Academic Info</h4>
            <span class="inline-flex items-center gap-1 text-emerald-600 text-[0.7rem] font-bold uppercase tracking-wider" title="Official Record - Read Only"><Lock :size="12" /> Verified</span>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Major (ជំនាញ)</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.major || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Degree Level</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.degree_level || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Class Code</span>
              <span class="font-semibold text-[var(--text-primary)] text-right font-mono">{{ user.class_code || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Status</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.status || 'Active Student' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Academic Year</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.academic_year || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Generation</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.generation || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">BacII Grade</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">
                <template v-if="user.bac2_grade">
                  Grade {{ user.bac2_grade }}
                </template>
                <template v-else>N/A</template>
              </span>
            </div>
          </div>
        </div>

        <!-- Personal & Contact Info (Read-Only Official Record) -->
        <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
          <div class="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border-color)]">
            <h4 class="text-[1rem] font-bold text-[var(--text-primary)] flex items-center gap-2 m-0"><UserCheck :size="18" class="text-[var(--text-muted)]" /> Personal Info</h4>
            <span class="inline-flex items-center gap-1 text-emerald-600 text-[0.7rem] font-bold uppercase tracking-wider" title="Official Record - Read Only"><Lock :size="12" /> Verified</span>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Gender (ភេទ)</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.gender || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Date of Birth</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.dob || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Birth Province</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.pob || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">High School</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.high_school || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Personal Phone</span>
              <span class="font-semibold text-[var(--text-primary)] text-right font-mono">{{ user.phone || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Telegram</span>
              <a v-if="user.telegram" :href="user.telegram.startsWith('http') ? user.telegram : 'https://' + user.telegram" target="_blank" class="font-semibold text-indigo-600 text-right no-underline hover:underline transition-colors">
                {{ user.telegram }}
              </a>
              <span v-else class="font-semibold text-[var(--text-primary)] text-right">N/A</span>
            </div>
            <div class="flex justify-between items-center text-[0.85rem]">
              <span class="text-[var(--text-muted)] font-medium">Guardian Phone</span>
              <span class="font-semibold text-[var(--text-primary)] text-right font-mono">{{ user.guardian_phone || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { GraduationCap, UserCheck, Info, Camera, Lock, ShieldCheck } from 'lucide-vue-next';

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

    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/profile-photo`, {
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
</script>


