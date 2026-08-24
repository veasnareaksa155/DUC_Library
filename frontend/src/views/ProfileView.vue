<template>
  <div class="max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-24 min-h-screen">
    
    <!-- Hero Header with Mesh Gradient & Glassmorphism -->
    <div class="relative rounded-[2rem] overflow-hidden mb-12 bg-[#090b14] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5">
      <!-- Animated Glowing Orbs -->
      <div class="absolute top-[-30%] left-[-10%] w-[60%] h-[160%] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-[-30%] right-[-10%] w-[50%] h-[140%] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div class="absolute top-[10%] right-[20%] w-[40%] h-[100%] bg-blue-500/15 blur-[90px] rounded-full pointer-events-none"></div>
      
      <!-- Noise Texture -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      <div class="relative px-4 py-8 md:px-8 md:py-16 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 bg-black/5 backdrop-blur-sm">
        
        <!-- Profile Avatar Container -->
        <div class="relative group cursor-pointer shrink-0 z-10 mt-2" @click="triggerPhotoSelect" title="Click to Change Profile Photo">
          <div class="w-28 h-28 md:w-44 md:h-44 rounded-full bg-white/10 p-1.5 md:p-2 ring-4 ring-white/20 ring-offset-4 ring-offset-transparent shadow-2xl transition-all duration-500 group-hover:ring-white/40 group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div class="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center relative shadow-inner">
              <img v-if="user?.profile_photo" :src="user.profile_photo" class="w-full h-full object-cover" alt="Profile Photo" />
              <span v-else class="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500">{{ (user?.name_latin || user?.name || 'S').charAt(0).toUpperCase() }}</span>
              
              <!-- Hover Overlay -->
              <div v-if="!uploading" class="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Camera :size="32" class="text-white mb-1.5 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" />
                <span class="text-white text-[0.7rem] font-bold tracking-widest uppercase opacity-90">Change</span>
              </div>

              <!-- Uploading Animation Overlay -->
              <div v-if="uploading" class="absolute inset-0 bg-[#090b14]/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <div class="relative w-8 h-8 md:w-10 md:h-10 mb-1.5 md:mb-2">
                  <div class="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div class="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span class="text-indigo-400 text-[0.6rem] md:text-[0.65rem] font-black tracking-widest uppercase animate-pulse">Saving</span>
              </div>
            </div>
          </div>
          <!-- Decorative Glow -->
          <div class="absolute inset-0 rounded-full bg-white/20 blur-3xl -z-10 group-hover:bg-white/40 transition-colors duration-500 scale-150"></div>
        </div>

        <!-- Profile Details -->
        <div class="flex-1 text-center md:text-left z-10 flex flex-col justify-center h-full pt-2">
          <div class="flex flex-col md:flex-row md:items-center gap-4 mb-3 justify-center md:justify-start">
            <h2 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md text-center md:text-left">{{ user?.name_latin || user?.name }}</h2>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm backdrop-blur-md" 
                  :class="authStore.isAdmin ? 'bg-amber-400/20 border-amber-400/50 text-amber-100' : 'bg-white/20 border-white/30 text-white'">
              {{ authStore.isAdmin ? 'Administrator' : (user?.student_id || 'Student') }}
            </span>
          </div>
          
          <div v-if="user?.name_khmer" class="text-xl text-indigo-50 font-semibold mb-6 drop-shadow-sm opacity-90">{{ user.name_khmer }}</div>
          
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-white font-medium">
            <span class="flex items-center gap-2 bg-black/20 hover:bg-black/30 transition-colors px-4 py-2 rounded-xl backdrop-blur-md shadow-sm border border-white/5"><Mail :size="16" class="opacity-70"/> {{ user?.email }}</span>
            <span v-if="user?.dorm_room && !authStore.isAdmin" class="flex items-center gap-2 bg-black/20 hover:bg-black/30 transition-colors px-4 py-2 rounded-xl backdrop-blur-md shadow-sm border border-white/5"><DoorOpen :size="16" class="opacity-70"/> Room {{ user.dorm_room }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Alerts -->
    <div v-if="!user?.student_id && !authStore.isAdmin" class="flex items-start gap-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl mb-8 shadow-sm transition-all">
      <div class="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
        <Info :size="24" />
      </div>
      <div>
        <h4 class="text-base font-bold text-indigo-900 dark:text-indigo-300 mb-1">Imported Student Account</h4>
        <p class="text-sm text-indigo-700 dark:text-indigo-400/80 leading-relaxed m-0">If your account was imported from Google Sheet, log in with your <strong>Student ID</strong> (e.g. <code>DUC2024-0060</code>) as username and password to access your verified profile!</p>
      </div>
    </div>

    <input type="file" ref="fileInputRef" accept="image/*" @change="onPhotoSelected" class="hidden" />

    <!-- Info Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8" v-if="user">
      
      <!-- Academic Information Card (Student) -->
      <div v-if="!authStore.isAdmin" class="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-300 group">
        <div class="flex justify-between items-center mb-8 pb-5 border-b border-[var(--border-color)]">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <GraduationCap :size="24" class="text-white" />
            </div>
            <h4 class="text-xl font-extrabold text-[var(--text-primary)] m-0 tracking-tight">Academic Info</h4>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20"><Lock :size="14" /> Verified</span>
        </div>
        
        <div class="space-y-4">
          <div v-for="(val, label) in {
            'Major (ជំនាញ)': user.major,
            'Degree Level': user.degree_level,
            'Class Code': user.class_code,
            'Status': user.status || 'Active Student',
            'Academic Year': user.academic_year,
            'Generation': user.generation,
            'BacII Grade': user.bac2_grade ? `Grade ${user.bac2_grade}` : null
          }" :key="label" class="flex justify-between items-center group/item hover:bg-[var(--bg-secondary)] -mx-4 px-4 py-3 rounded-2xl transition-colors">
            <span class="text-[0.95rem] text-[var(--text-muted)] font-medium">{{ label }}</span>
            <span class="font-bold text-[var(--text-primary)] text-right">{{ val || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Admin Details Card -->
      <div v-else class="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-300 group">
        <div class="flex justify-between items-center mb-8 pb-5 border-b border-[var(--border-color)]">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <ShieldCheck :size="24" class="text-white" />
            </div>
            <h4 class="text-xl font-extrabold text-[var(--text-primary)] m-0 tracking-tight">Admin Details</h4>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-500/20"><Lock :size="14" /> Unrestricted</span>
        </div>
        
        <div class="space-y-4">
           <div class="flex justify-between items-center -mx-4 px-4 py-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors"><span class="text-[0.95rem] text-[var(--text-muted)] font-medium">Role Level</span><span class="font-bold text-[var(--text-primary)] text-right">System Administrator</span></div>
           <div class="flex justify-between items-center -mx-4 px-4 py-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors"><span class="text-[0.95rem] text-[var(--text-muted)] font-medium">Permissions</span><span class="font-bold text-[var(--text-primary)] text-right">Full Access</span></div>
           <div class="flex justify-between items-center -mx-4 px-4 py-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors"><span class="text-[0.95rem] text-[var(--text-muted)] font-medium">Account Created</span><span class="font-bold text-[var(--text-primary)] text-right">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }}</span></div>
        </div>
      </div>

      <!-- Personal Info Card -->
      <div class="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-300 group">
        <div class="flex justify-between items-center mb-8 pb-5 border-b border-[var(--border-color)]">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <UserCheck :size="24" class="text-white" />
            </div>
            <h4 class="text-xl font-extrabold text-[var(--text-primary)] m-0 tracking-tight">Personal Info</h4>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20"><Lock :size="14" /> Verified</span>
        </div>
        
        <div class="space-y-4">
          <div v-for="(val, label) in {
            'Gender (ភេទ)': user.gender,
            'Date of Birth': user.dob,
            'Birth Province': user.pob,
            'High School': user.high_school,
            'Personal Phone': user.phone,
            'Guardian Phone': user.guardian_phone
          }" :key="label" class="flex justify-between items-center group/item hover:bg-[var(--bg-secondary)] -mx-4 px-4 py-3 rounded-2xl transition-colors">
            <span class="text-[0.95rem] text-[var(--text-muted)] font-medium">{{ label }}</span>
            <span class="font-bold text-[var(--text-primary)] text-right" :class="label.includes('Phone') ? 'font-mono' : ''">{{ val || 'N/A' }}</span>
          </div>

          <div class="flex justify-between items-center group/item hover:bg-[var(--bg-secondary)] -mx-4 px-4 py-3 rounded-2xl transition-colors">
            <span class="text-[0.95rem] text-[var(--text-muted)] font-medium">Telegram</span>
            <a v-if="user.telegram" :href="user.telegram.startsWith('http') ? user.telegram : 'https://' + user.telegram" target="_blank" class="font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-right no-underline hover:underline transition-colors flex items-center gap-1">
              {{ user.telegram }}
            </a>
            <span v-else class="font-bold text-[var(--text-primary)] text-right">N/A</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { GraduationCap, UserCheck, Info, Camera, Lock, ShieldCheck, Mail, DoorOpen, CheckCircle, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const toastStore = useToastStore();
const user = computed(() => authStore.user);

const fileInputRef = ref(null);
const uploading = ref(false);

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

    if (res.ok) {
      if (data.user) {
        authStore.userData = { ...authStore.userData, profile_photo: data.user.profile_photo };
        localStorage.setItem('duc_user', JSON.stringify(authStore.userData));
      }
      toastStore.show('Profile photo updated successfully!', { type: 'success', title: 'Photo Updated' });
    } else {
      throw new Error(data.message || 'Failed to update photo');
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    toastStore.show(error.message || 'Failed to upload photo', { type: 'error', title: 'Upload Failed' });
  } finally {
    uploading.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
}
</script>
