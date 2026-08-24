<template>
  <div class="min-h-screen w-full flex bg-[var(--bg-primary)] overflow-hidden">
    <!-- Left Side: Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
      <div class="w-full max-w-[420px] animate-[fadeInUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        
        <header class="mb-10 text-center lg:text-left">
          <div class="w-14 h-14 rounded-[1rem] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300 mx-auto lg:mx-0">
            <ShieldCheck :size="28" class="text-indigo-500" stroke-width="2.5" />
          </div>
          <h2 class="text-[2.25rem] font-black text-[var(--text-primary)] tracking-tight mb-2">Admin Portal</h2>
          <p class="text-[1.05rem] font-medium text-[var(--text-muted)]">Sign in to manage the library system</p>
        </header>

        <form @submit.prevent="handleAdminLogin" class="flex flex-col gap-6">
          <div class="group">
            <label class="block text-[0.72rem] font-black uppercase tracking-widest mb-2.5 text-[var(--text-secondary)] ml-1">Admin Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors duration-300">
                <User :size="20" stroke-width="2.5" />
              </div>
              <input v-model="email" type="text" placeholder="admin" required class="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-[var(--text-primary)] text-[1.05rem] rounded-[16px] pl-12 pr-4 py-4 focus:outline-none focus:border-indigo-500 hover:border-indigo-500/50 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-[var(--text-muted)]/50 font-bold" />
            </div>
          </div>

          <div class="group">
            <div class="flex justify-between items-center mb-2.5 ml-1">
              <label class="block text-[0.72rem] font-black uppercase tracking-widest text-[var(--text-secondary)]">Password</label>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors duration-300">
                <Lock :size="20" stroke-width="2.5" />
              </div>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-[var(--text-primary)] text-[1.05rem] rounded-[16px] pl-12 pr-12 py-4 focus:outline-none focus:border-indigo-500 hover:border-indigo-500/50 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-[var(--text-muted)]/50 font-bold" />
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-indigo-500 transition-colors duration-300">
                <Eye v-if="!showPassword" :size="20" stroke-width="2.5" />
                <EyeOff v-else :size="20" stroke-width="2.5" />
              </button>
            </div>
          </div>

          <div v-if="localError || authStore.error" class="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold p-4 rounded-[14px] text-[0.9rem] animate-in slide-in-from-top-2">
            <AlertCircle :size="20" stroke-width="2.5" class="shrink-0" /> {{ localError || authStore.error }}
          </div>

          <button type="submit" class="w-full mt-4 bg-[var(--text-primary)] hover:bg-indigo-600 hover:scale-[1.01] active:scale-[0.98] text-[var(--bg-primary)] hover:text-white font-black text-[1.05rem] py-4.5 rounded-[16px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center justify-center gap-2.5 group" :disabled="authStore.loading">
            <LogIn v-if="!authStore.loading" :size="22" stroke-width="2.5" class="transition-transform duration-300 group-hover:translate-x-1" />
            <div v-else class="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin"></div>
            {{ authStore.loading ? 'Authenticating...' : 'Sign In as Admin' }}
          </button>
          
          <div class="text-center mt-2">
            <router-link to="/" class="text-[0.85rem] font-bold text-[var(--text-secondary)] hover:text-indigo-500 transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft :size="16" stroke-width="2.5" /> Return to Library
            </router-link>
          </div>
        </form>
      </div>
    </div>

    <!-- Right Side: Graphic/Branding Banner -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-[var(--bg-card)] border-l border-[var(--border-color)] overflow-hidden items-center justify-center p-8">
      <!-- Mesh Gradient Background -->
      <div class="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-500/5 to-transparent"></div>
      <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[var(--bg-card)] to-transparent z-10 pointer-events-none"></div>
      
      <!-- Abstract floating shapes -->
      <div class="absolute top-[15%] left-[25%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>

      <!-- Glassmorphic Hero Card -->
      <div class="relative z-20 w-full max-w-[480px] p-12 rounded-[2.5rem] bg-white/5 dark:bg-[#1e1e2d]/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col items-center text-center transform hover:scale-[1.02] transition-transform duration-700 ease-out">
        <div class="w-28 h-28 rounded-3xl bg-white p-4 shadow-2xl mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          <img src="/duc-logo.png" alt="DUC Logo" class="w-full h-full object-contain" />
        </div>
        <h3 class="text-[2.5rem] font-black text-[var(--text-primary)] tracking-tight leading-tight mb-4">
          DUC<span class="text-transparent bg-clip-text [background-image:var(--accent-gradient)]">Admin</span>
        </h3>
        <p class="text-[1.1rem] font-bold text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
          Secure portal to manage library resources, approve borrowings, and oversee the catalog.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { ShieldCheck, User, Lock, LogIn, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const localError = ref('');

async function handleAdminLogin() {
  localError.value = '';
  try {
    const res = await authStore.loginAdmin(email.value, password.value);
    
    // Security check: Ensure the logged in user is actually an admin
    if (res.user.role !== 'admin') {
      authStore.logout();
      localError.value = 'Access Denied: You do not have administrator privileges.';
      return;
    }

    const redirectPath = route.query.redirect || '/admin';
    router.push(redirectPath);
  } catch (err) {
    // Error is handled by store (authStore.error)
  }
}
</script>
