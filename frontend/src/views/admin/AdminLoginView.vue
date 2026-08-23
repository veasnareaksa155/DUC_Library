<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-body)] relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="w-full max-w-[420px] px-8 py-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm border border-[var(--border-color)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative z-10">
      <header class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center mx-auto mb-5 shadow-[0_4px_20px_rgba(99,102,241,0.4)]">
          <ShieldCheck :size="32" stroke-width="2.5" />
        </div>
        <h2 class="text-[1.7rem] font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Admin Portal</h2>
        <p class="text-[var(--text-secondary)] text-[0.95rem]">Sign in to manage the library system</p>
      </header>

      <form @submit.prevent="handleAdminLogin" class="auth-form flex flex-col gap-5">
        <div>
          <label class="block text-[0.85rem] font-bold mb-2 text-[var(--text-secondary)] uppercase tracking-wider">Admin Email</label>
          <div class="relative flex items-center">
            <Mail :size="18" class="absolute left-4 text-[var(--text-muted)]" />
            <input v-model="email" type="email" placeholder="admin@duc.com" required class="w-full pl-11 py-3 bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors text-[var(--text-primary)]" />
          </div>
        </div>

        <div>
          <label class="block text-[0.85rem] font-bold mb-2 text-[var(--text-secondary)] uppercase tracking-wider">Password</label>
          <div class="relative flex items-center">
            <Lock :size="18" class="absolute left-4 text-[var(--text-muted)]" />
            <input v-model="password" type="password" placeholder="••••••••" required class="w-full pl-11 py-3 bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors text-[var(--text-primary)]" />
          </div>
        </div>

        <div v-if="localError || authStore.error" class="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-xl text-[0.85rem] mt-2 font-medium">
          <AlertCircle :size="18" class="shrink-0 mt-0.5" /> 
          <span class="leading-relaxed">{{ localError || authStore.error }}</span>
        </div>

        <button type="submit" class="w-full mt-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all duration-200 hover:-translate-y-px active:scale-[0.98] flex items-center justify-center gap-2" :disabled="authStore.loading">
          <LogIn v-if="!authStore.loading" :size="18" />
          <Loader2 v-else :size="18" class="animate-spin" />
          {{ authStore.loading ? 'Authenticating...' : 'Sign In as Admin' }}
        </button>

        <div class="text-center mt-2">
          <router-link to="/" class="text-[0.85rem] font-semibold text-[var(--text-secondary)] hover:text-indigo-500 transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft :size="14" /> Return to Library
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Loader2, ArrowLeft } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
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
