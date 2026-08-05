<template>
  <div class="auth-container">
    <div class="auth-card glass-panel">
      <header class="auth-header">
        <div class="logo-circle">
          <BookOpen :size="28" />
        </div>
        <h2>{{ localeStore.t('welcomeBack') }}</h2>
        <p>{{ localeStore.t('signInAccount') }}</p>
      </header>

      <!-- Google Sheet Student Quick Demo Logins -->
      <div class="demo-presets">
        <span class="demo-label">Google Sheet Student Demo Logins:</span>
        <div class="demo-buttons-grid">
          <button @click="fillStudent('DUC2024-0060')" class="btn-demo">
            <User :size="13" /> DUC2024-0060 (KEUN DAVANN)
          </button>
          <button @click="fillStudent('DUC2024-0072')" class="btn-demo">
            <User :size="13" /> DUC2024-0072 (KEM KOSAL)
          </button>
          <button @click="fillStudent('admin')" class="btn-demo admin-demo">
            <ShieldCheck :size="13" /> Admin (admin@duc.com)
          </button>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Student ID / Username / Email</label>
          <div class="input-icon-wrapper">
            <Mail :size="18" class="input-icon" />
            <input v-model="email" type="text" placeholder="e.g. DUC2024-0060 or KEUN DAVANN" required />
          </div>
        </div>

        <div class="form-group">
          <label>Password (Default: Student ID)</label>
          <div class="input-icon-wrapper">
            <Lock :size="18" class="input-icon" />
            <input v-model="password" type="password" placeholder="••••••••" required />
          </div>
        </div>

        <div v-if="authStore.error" class="error-box">
          <AlertCircle :size="16" /> {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="authStore.loading">
          <LogIn :size="18" />
          {{ authStore.loading ? localeStore.t('signingIn') : localeStore.t('signIn') }}
        </button>
      </form>

      <footer class="auth-footer">
        <p>{{ localeStore.t('noAccount') }} <router-link to="/register" class="link-highlight">{{ localeStore.t('registerNow') }}</router-link></p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useRouter, useRoute } from 'vue-router';
import { BookOpen, Mail, Lock, LogIn, User, ShieldCheck, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');

function fillStudent(studentId) {
  if (studentId === 'admin') {
    email.value = 'admin@duc.com';
    password.value = 'admin123';
  } else {
    email.value = studentId;
    password.value = studentId; // Default password is Student ID
  }
}

async function handleLogin() {
  try {
    const res = await authStore.login(email.value, password.value);
    const redirectPath = route.query.redirect || (res.user.role === 'admin' ? '/admin' : '/');
    router.push(redirectPath);
  } catch (err) {
    // handled by store
  }
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-circle {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: var(--accent-glow);
}

.auth-header h2 {
  font-size: 1.6rem;
  font-weight: 700;
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.demo-presets {
  background: rgba(125, 125, 125, 0.06);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
}

.demo-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  text-align: center;
}

.demo-buttons-grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.btn-demo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-demo:hover {
  background: rgba(99, 102, 241, 0.25);
  transform: translateX(3px);
}

.admin-demo {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
}

.admin-demo:hover {
  background: rgba(139, 92, 246, 0.3);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text-secondary);
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
}

.input-icon-wrapper input {
  width: 100%;
  padding-left: 2.75rem;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--danger-bg);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.w-full {
  width: 100%;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.link-highlight {
  color: var(--accent-primary);
  font-weight: 600;
}
.link-highlight:hover {
  text-decoration: underline;
}
</style>
