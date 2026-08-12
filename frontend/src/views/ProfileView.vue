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
      <div v-if="!user.student_id && !authStore.isAdmin" class="flex items-start gap-4 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-8 text-[var(--text-primary)]">
        <Info :size="24" class="text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong>Imported Student Account?</strong>
          <p class="mt-1.5 mb-0 text-sm text-[var(--text-secondary)] leading-relaxed">If your account was imported from Google Sheet, log in with your <strong>Student ID</strong> (e.g. <code>DUC2024-0060</code>) as username and password to access your verified profile!</p>
        </div>
      </div>

      <!-- Header Hero Banner with Photo Upload -->
      <div class="flex flex-col md:flex-row md:items-center gap-7 p-9 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-3xl mb-8 relative overflow-hidden before:content-[''] before:absolute before:-top-1/2 before:-right-[20%] before:w-[300px] before:h-[300px] before:bg-radial-[circle] before:from-indigo-500/15 before:to-transparent before:rounded-full before:-z-10 before:pointer-events-none text-center md:text-left">
        <div class="relative cursor-pointer z-10 group mx-auto md:mx-0" @click="triggerPhotoSelect" title="Click to Change Profile Photo">
          <div class="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-extrabold text-4xl flex items-center justify-center shadow-[0_8px_25px_rgba(99,102,241,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)] overflow-hidden border-4 border-[var(--bg-card)] transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/40">
            <img v-if="user.profile_photo" :src="user.profile_photo" class="w-full h-full rounded-full object-cover" alt="Profile Photo" />
            <span v-else>{{ (user.name_latin || user.name || 'S').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <Camera :size="24" />
          </div>
        </div>

        <div class="flex-1 z-10">
          <div class="flex items-center justify-center md:justify-start gap-4 flex-wrap mb-2">
            <h3 class="text-2xl font-extrabold text-[var(--text-primary)] m-0 tracking-tight">{{ user.name_latin || user.name }}</h3>
            <span class="text-sm font-mono bg-gradient-to-br text-white px-3.5 py-1 rounded-full font-bold shadow-[0_4px_12px_rgba(99,102,241,0.3)]" :class="authStore.isAdmin ? 'from-amber-500 to-orange-500 shadow-[0_4px_12px_rgba(245,158,11,0.3)]' : 'from-indigo-500 to-violet-500'">{{ authStore.isAdmin ? 'ADMINISTRATOR' : (user.student_id || 'STUDENT') }}</span>
            <span v-if="user.dorm_room && !authStore.isAdmin" class="text-sm font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 px-3.5 py-1 rounded-full">Room {{ user.dorm_room }}</span>
          </div>
          <div v-if="user.name_khmer" class="text-lg text-[var(--text-secondary)] mb-1">ឈ្មោះខ្មែរ: {{ user.name_khmer }}</div>
          <div class="text-[0.95rem] text-[var(--text-muted)] font-mono">{{ user.email }}</div>
        </div>

        <button @click="triggerPhotoSelect" class="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center w-full md:w-auto gap-2 cursor-pointer transition-all duration-200 z-10 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-500 hover:-translate-y-[2px] mt-4 md:mt-0" :disabled="uploading">
          <Camera :size="16" /> {{ uploading ? 'Uploading...' : 'Change Photo' }}
        </button>
        <input type="file" ref="fileInputRef" accept="image/*" @change="onPhotoSelected" class="hidden" />
      </div>

      <div v-if="photoMessage" class="px-5 py-3.5 rounded-xl font-semibold mb-5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">{{ photoMessage }}</div>
      <div v-if="photoError" class="px-5 py-3.5 rounded-xl font-semibold mb-5 bg-red-500/15 text-red-500 border border-red-500/30">{{ photoError }}</div>

      <!-- View Profile Details Grid Mode (Read-Only Verified Records) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Admin Specific Information -->
        <div v-if="authStore.isAdmin" class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-7 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-[3px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-amber-500/30">
          <div class="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-[var(--border-color)]">
            <h4 class="text-[1.15rem] font-bold text-[var(--text-primary)] flex items-center gap-2.5 m-0"><ShieldCheck :size="20" class="text-amber-500" /> Admin Details</h4>
            <span class="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold" title="System Administrator"><Lock :size="14" /> Unrestricted</span>
          </div>
          <div class="flex flex-col gap-4.5">
            <div class="flex justify-between items-center text-[0.95rem]">
              <span class="text-[var(--text-muted)] font-medium">Role Level</span>
              <span class="font-semibold text-amber-500 text-right bg-amber-500/15 px-2.5 py-1 rounded-md text-[0.85rem] border border-amber-500/30">System Administrator</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Permissions</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">Full Access (Read/Write)</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Dashboard Access</span>
              <span class="font-semibold text-[var(--text-primary)] text-right text-emerald-500">Granted</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Library Management</span>
              <span class="font-semibold text-[var(--text-primary)] text-right text-emerald-500">Granted</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Account Created</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Academic Information (Locked Official Record - Student Only) -->
        <div v-else class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-7 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-[3px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-indigo-500/30">
          <div class="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-[var(--border-color)]">
            <h4 class="text-[1.15rem] font-bold text-[var(--text-primary)] flex items-center gap-2.5 m-0"><GraduationCap :size="20" class="text-indigo-400" /> Academic Info</h4>
            <span class="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold" title="Official Record - Read Only"><Lock :size="14" /> Verified</span>
          </div>
          <div class="flex flex-col gap-4.5">
            <div class="flex justify-between items-center text-[0.95rem]">
              <span class="text-[var(--text-muted)] font-medium">Major (ជំនាញ)</span>
              <span class="font-semibold text-indigo-500 text-right">{{ user.major || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Degree Level</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.degree_level || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Class Code</span>
              <span class="font-semibold text-[var(--text-primary)] text-right font-mono text-[0.9rem]">{{ user.class_code || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Status</span>
              <span class="font-semibold text-emerald-500 text-right bg-emerald-500/15 px-2.5 py-1 rounded-md text-[0.85rem] border border-emerald-500/30">{{ user.status || 'Active Student' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Academic Year</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.academic_year || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Generation</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.generation || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
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
        <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-7 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-[3px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-indigo-500/30">
          <div class="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-[var(--border-color)]">
            <h4 class="text-[1.15rem] font-bold text-[var(--text-primary)] flex items-center gap-2.5 m-0"><UserCheck :size="20" class="text-indigo-400" /> Personal Info</h4>
            <span class="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold" title="Official Record - Read Only"><Lock :size="14" /> Verified</span>
          </div>
          <div class="flex flex-col gap-4.5">
            <div class="flex justify-between items-center text-[0.95rem]">
              <span class="text-[var(--text-muted)] font-medium">Gender (ភេទ)</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.gender || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Date of Birth</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.dob || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Birth Province</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.pob || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">High School</span>
              <span class="font-semibold text-[var(--text-primary)] text-right">{{ user.high_school || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Personal Phone</span>
              <span class="font-semibold text-indigo-500 text-right font-mono text-[0.9rem]">{{ user.phone || 'N/A' }}</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Telegram</span>
              <a v-if="user.telegram" :href="user.telegram.startsWith('http') ? user.telegram : 'https://' + user.telegram" target="_blank" class="font-semibold text-blue-500 text-right no-underline hover:text-blue-400 hover:underline transition-colors duration-200">
                {{ user.telegram }}
              </a>
              <span v-else class="font-semibold text-[var(--text-primary)] text-right">N/A</span>
            </div>
            <div class="flex justify-between items-center text-[0.95rem] mt-[1.1rem]">
              <span class="text-[var(--text-muted)] font-medium">Guardian Phone</span>
              <span class="font-semibold text-[var(--text-primary)] text-right font-mono text-[0.9rem]">{{ user.guardian_phone || 'N/A' }}</span>
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


