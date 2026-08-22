<template>
  <div class="flex items-start min-h-screen w-full">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 py-8 px-10 pb-16 w-[calc(100%-280px)] max-w-none">
      <header class="mb-10">
        <h1 class="text-[2.2rem] font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">My Admin Profile</h1>
        <p class="text-[1.05rem] text-[var(--text-secondary)]">Manage your library administrator account and privileges.</p>
      </header>

      <!-- Banner Card -->
      <div class="flex flex-col md:flex-row md:items-center gap-7 p-9 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-[2rem] mb-10 max-w-[800px]">
        <div class="relative shrink-0 cursor-pointer group" @click="triggerPhotoSelect" title="Click to Change Profile Photo">
          <div class="w-[110px] h-[110px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-extrabold text-5xl flex items-center justify-center shadow-[0_8px_25px_rgba(99,102,241,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)] overflow-hidden border-[5px] border-[var(--bg-card)] transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/40">
            <img v-if="user?.profile_photo" :src="user.profile_photo" class="w-full h-full rounded-full object-cover" alt="Profile Photo" />
            <span v-else>{{ (user?.name_latin || user?.name || 'A').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <Camera :size="28" />
          </div>
        </div>

        <div class="flex-1">
          <div class="flex items-center gap-4 mb-2 flex-wrap">
            <h3 class="text-[1.8rem] font-extrabold text-[var(--text-primary)] m-0 tracking-tight">{{ user?.name_latin || user?.name || 'Admin DUC' }}</h3>
            <span class="text-[0.75rem] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
              ADMINISTRATOR
            </span>
          </div>
          <div class="text-[1rem] font-mono text-[var(--text-muted)]">{{ user?.email || 'admin@duc.com' }}</div>
        </div>

        <button @click="triggerPhotoSelect" class="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center w-full md:w-auto gap-2 cursor-pointer transition-all duration-200 z-10 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-500 hover:-translate-y-[2px] mt-4 md:mt-0" :disabled="uploading">
          <Camera :size="16" /> {{ uploading ? 'Uploading...' : 'Change Photo' }}
        </button>
        <input type="file" ref="fileInputRef" accept="image/*" @change="onPhotoSelected" class="hidden" />
      </div>

      <div v-if="photoMessage" class="px-6 py-4 rounded-xl font-semibold mb-8 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 max-w-[800px]">{{ photoMessage }}</div>
      <div v-if="photoError" class="px-6 py-4 rounded-xl font-semibold mb-8 bg-red-500/15 text-red-500 border border-red-500/30 max-w-[800px]">{{ photoError }}</div>


      <!-- Admin Details Card -->
      <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-9 shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-w-[800px] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-[2px]">
        <div class="flex items-center gap-3.5 mb-7 pb-7 border-b border-dashed border-[var(--border-color)]">
          <ShieldCheck :size="26" class="text-amber-500" stroke-width="2.5" />
          <h4 class="text-[1.3rem] font-extrabold text-[var(--text-primary)] m-0">Admin Details</h4>
        </div>
        
        <div class="flex flex-col gap-6">
          <div class="flex justify-between items-center text-[1rem]">
            <span class="text-[var(--text-muted)] font-semibold">Role Level</span>
            <span class="font-bold text-[var(--text-primary)] text-right">System Administrator</span>
          </div>
          <div class="flex justify-between items-center text-[1rem]">
            <span class="text-[var(--text-muted)] font-semibold">Permissions</span>
            <span class="font-bold text-[var(--text-primary)] text-right">Full Access (Read/Write)</span>
          </div>
          <div class="flex justify-between items-center text-[1rem]">
            <span class="text-[var(--text-muted)] font-semibold">Dashboard Access</span>
            <span class="font-bold text-[var(--text-primary)] text-right text-emerald-500">Granted</span>
          </div>
          <div class="flex justify-between items-center text-[1rem]">
            <span class="text-[var(--text-muted)] font-semibold">Library Management</span>
            <span class="font-bold text-[var(--text-primary)] text-right text-emerald-500">Granted</span>
          </div>
          <div class="flex justify-between items-center text-[1rem]">
            <span class="text-[var(--text-muted)] font-semibold">Account Created</span>
            <span class="font-bold text-[var(--text-primary)] text-right">{{ user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import AdminSidebar from '../../components/AdminSidebar.vue';
import { ShieldCheck, Camera } from 'lucide-vue-next';

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
    
    // Update local user state specifically for admin
    if (authStore.context === 'admin') {
       authStore.adminData = data.user;
       localStorage.setItem('duc_admin', JSON.stringify(data.user));
    } else {
       authStore.userData = data.user;
       localStorage.setItem('duc_user', JSON.stringify(data.user));
    }

    setTimeout(() => {
      photoMessage.value = '';
    }, 2500);
  } catch (err) {
    console.error('Photo upload error:', err);
    photoError.value = err.message || 'Failed to upload profile photo.';
  } finally {
    uploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}
</script>
