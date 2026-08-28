<template>
  <div class="min-h-[calc(100vh-80px)] w-full flex bg-[var(--bg-primary)] overflow-hidden">
    <!-- Left Side: Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
      <div class="w-full max-w-[420px] animate-[fadeInUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        
        <header class="mb-10">
          <div class="w-14 h-14 rounded-[1rem] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
            <ShieldCheck v-if="step === '2fa'" :size="28" class="text-indigo-500" stroke-width="2.5" />
            <BookOpen v-else :size="28" class="text-indigo-500" stroke-width="2.5" />
          </div>
          <h2 class="text-[2.25rem] font-black text-[var(--text-primary)] tracking-tight mb-2">
            {{ step === '2fa' ? 'Two-Factor Auth' : localeStore.t('welcomeBack') }}
          </h2>
          <p class="text-[1.05rem] font-medium text-[var(--text-muted)]">
            {{ step === '2fa' ? 'Enter the 6-digit code from your authenticator app.' : localeStore.t('signInAccount') }}
          </p>
        </header>

        <form v-if="step === 'login'" @submit.prevent="handleLogin" class="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
          <div class="group">
            <label class="block text-[0.72rem] font-black uppercase tracking-widest mb-2.5 text-[var(--text-secondary)] ml-1">Student ID / Username / Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors duration-300">
                <Mail :size="20" stroke-width="2.5" />
              </div>
              <input v-model="email" type="text" placeholder="e.g. DUC2024...." required class="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-[var(--text-primary)] text-[1.05rem] rounded-[16px] pl-12 pr-4 py-4 focus:outline-none focus:border-indigo-500 hover:border-indigo-500/50 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-[var(--text-muted)]/50 font-bold" />
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

          <div v-if="authStore.error" class="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold p-4 rounded-[14px] text-[0.9rem] animate-in slide-in-from-top-2">
            <AlertCircle :size="20" stroke-width="2.5" class="shrink-0" /> {{ authStore.error }}
          </div>

          <button type="submit" class="w-full mt-4 bg-[var(--text-primary)] hover:bg-indigo-600 hover:scale-[1.01] active:scale-[0.98] text-[var(--bg-primary)] hover:text-white font-black text-[1.05rem] py-4.5 rounded-[16px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center justify-center gap-2.5 group" :disabled="authStore.loading">
            <LogIn v-if="!authStore.loading" :size="22" stroke-width="2.5" class="transition-transform duration-300 group-hover:translate-x-1" />
            <div v-else class="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin"></div>
            {{ authStore.loading ? localeStore.t('signingIn') : localeStore.t('signIn') }}
          </button>
        </form>

        <form v-else-if="step === '2fa'" @submit.prevent="handleVerify2FA" class="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
          <div class="group">
            <label class="block text-[0.72rem] font-black uppercase tracking-widest mb-2.5 text-[var(--text-secondary)] ml-1">Authentication Code</label>
            <OTPInput v-model="otpCode" />
          </div>

          <div v-if="authStore.error" class="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold p-4 rounded-[14px] text-[0.9rem] animate-in slide-in-from-top-2">
            <AlertCircle :size="20" stroke-width="2.5" class="shrink-0" /> {{ authStore.error }}
          </div>

          <div class="flex gap-3 mt-4">
            <button type="button" @click="step = 'login'; authStore.error = ''" class="w-1/3 bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black text-[1.05rem] py-4.5 rounded-[16px] transition-all duration-300 flex items-center justify-center disabled:opacity-50" :disabled="authStore.loading">
              Back
            </button>
            <button type="submit" class="flex-1 bg-[var(--text-primary)] hover:bg-indigo-600 hover:scale-[1.01] active:scale-[0.98] text-[var(--bg-primary)] hover:text-white font-black text-[1.05rem] py-4.5 rounded-[16px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center justify-center gap-2.5 group" :disabled="authStore.loading">
              <div v-if="authStore.loading" class="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span v-else>Verify</span>
            </button>
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
          DUC<span class="text-transparent bg-clip-text [background-image:var(--accent-gradient)]">Library</span>
        </h3>
        <p class="text-[1.1rem] font-bold text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
          Access thousands of academic resources, technical books, and literature anywhere, anytime.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useRouter, useRoute } from 'vue-router';
import OTPInput from '../components/OTPInput.vue';
import { BookOpen, Mail, Lock, LogIn, User, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const router = useRouter();
const route = useRoute();

const step = ref('login');
const tempToken = ref('');
const otpCode = ref('');

const email = ref('');
const password = ref('');
const showPassword = ref(false);

async function handleLogin() {
  try {
    const res = await authStore.loginUser(email.value, password.value);
    if (res && res.require2FA) {
      tempToken.value = res.tempToken;
      step.value = '2fa';
      authStore.error = '';
      return;
    }
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    // handled by store
  }
}

async function handleVerify2FA() {
  try {
    const res = await authStore.verify2FALogin(tempToken.value, otpCode.value, 'user');
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    // handled by store
  }
}
</script>


