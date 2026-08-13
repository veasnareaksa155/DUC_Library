<template>
  <div class="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-[var(--bg-primary)] to-[var(--bg-primary)] relative overflow-hidden">
    <!-- Decorative background blobs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-[460px] relative z-10 animate-[fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
      <div class="px-10 py-12 max-sm:px-6 max-sm:py-10 rounded-[2rem] bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-color)] shadow-[var(--shadow-panel)] transition-all duration-300">
        <header class="text-center mb-8">
          <div class="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center mx-auto mb-5 shadow-[0_8px_20px_rgba(99,102,241,0.4)] transform hover:scale-105 transition-transform duration-300">
            <BookOpen :size="32" stroke-width="2.5" />
          </div>
          <h2 class="text-[1.85rem] font-extrabold text-[var(--text-primary)] tracking-tight mb-2">{{ localeStore.t('welcomeBack') }}</h2>
          <p class="text-[0.95rem] font-medium text-[var(--text-muted)]">{{ localeStore.t('signInAccount') }}</p>
        </header>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div>
            <label class="block text-[0.8rem] font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">Student ID / Username / Email</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors duration-300">
                <Mail :size="18" stroke-width="2.5" />
              </div>
              <input v-model="email" type="text" placeholder="e.g. DUC2024...." required class="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-[0.95rem] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm placeholder:text-[var(--text-muted)]/70 font-medium" />
            </div>
          </div>

          <div>
            <label class="block text-[0.8rem] font-bold uppercase tracking-wider mb-2 text-[var(--text-secondary)]">Password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors duration-300">
                <Lock :size="18" stroke-width="2.5" />
              </div>
              <input v-model="password" type="password" placeholder="••••••••" required class="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-[0.95rem] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm placeholder:text-[var(--text-muted)]/70 font-medium" />
            </div>
          </div>

          <div v-if="authStore.error" class="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-500 font-bold p-3.5 rounded-xl text-[0.88rem] mt-1">
            <AlertCircle :size="18" stroke-width="2.5" /> {{ authStore.error }}
          </div>

          <button type="submit" class="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-[1.05rem] py-3.5 rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_25px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2" :disabled="authStore.loading">
            <LogIn :size="20" stroke-width="2.5" class="transition-transform duration-300" :class="{ 'translate-x-1': !authStore.loading }" />
            {{ authStore.loading ? localeStore.t('signingIn') : localeStore.t('signIn') }}
          </button>
        </form>

        <footer class="text-center mt-8 text-[0.92rem] font-medium text-[var(--text-secondary)] pt-6 border-t border-[var(--border-color)]">
          <p class="m-0">{{ localeStore.t('noAccount') }} <router-link to="/register" class="text-indigo-500 dark:text-indigo-400 font-extrabold hover:text-indigo-600 dark:hover:text-indigo-300 hover:underline transition-colors">{{ localeStore.t('registerNow') }}</router-link></p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useRouter, useRoute } from 'vue-router';
import { BookOpen, Mail, Lock, LogIn, User, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');



async function handleLogin() {
  try {
    const res = await authStore.loginUser(email.value, password.value);
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    // handled by store
  }
}
</script>


