<template>
  <div class="auth-container">
    <div class="auth-card glass-panel">
      <header class="auth-header">
        <div class="logo-circle">
          <UserPlus :size="28" />
        </div>
        <h2>Create Account</h2>
        <p>Join DUC Library to borrow and read online</p>
      </header>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Full Name</label>
          <div class="input-icon-wrapper">
            <User :size="18" class="input-icon" />
            <input v-model="name" type="text" placeholder="John Doe" required />
          </div>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <div class="input-icon-wrapper">
            <Mail :size="18" class="input-icon" />
            <input v-model="email" type="email" placeholder="john@example.com" required />
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-icon-wrapper">
            <Lock :size="18" class="input-icon" />
            <input v-model="password" type="password" placeholder="••••••••" required minlength="6" />
          </div>
        </div>

        <div v-if="authStore.error" class="error-box">
          <AlertCircle :size="16" /> {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary w-full" :disabled="authStore.loading">
          <UserCheck :size="18" />
          {{ authStore.loading ? 'Creating Account...' : 'Register' }}
        </button>
      </form>

      <footer class="auth-footer">
        <p>Already have an account? <router-link to="/login" class="link-highlight">Sign in</router-link></p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { UserPlus, User, Mail, Lock, UserCheck, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');

async function handleRegister() {
  try {
    await authStore.register(name.value, email.value, password.value);
    router.push('/');
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
  max-width: 440px;
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
  color: #fca5a5;
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
