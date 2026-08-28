<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="close"></div>
    
    <!-- Modal -->
    <div class="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300">
      
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
        <h2 class="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Settings :size="22" />
          Account Settings
        </h2>
        <button @click="close" class="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
          <X :size="20" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto">
        <div class="mb-8">
          <h3 class="text-[0.95rem] font-bold text-[var(--text-primary)] mb-1">Active Sessions</h3>
          <p class="text-[0.85rem] text-[var(--text-secondary)] mb-4">
            Manage the devices that are currently logged into your account.
          </p>

          <div v-if="loading" class="flex justify-center p-8">
            <Loader2 class="animate-spin text-indigo-500" :size="32" />
          </div>
          
          <div v-else-if="authStore.sessions.length === 0" class="text-center p-8 text-[var(--text-muted)] border border-dashed border-[var(--border-color)] rounded-xl">
            No active sessions found.
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="session in authStore.sessions" 
              :key="session.id"
              class="flex items-start gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/30 transition-colors"
            >
              <!-- Device Icon -->
              <div class="w-12 h-12 shrink-0 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Laptop v-if="session.device_type === 'desktop'" :size="24" />
                <Smartphone v-else-if="session.device_type === 'mobile'" :size="24" />
                <Monitor v-else :size="24" />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-bold text-[0.95rem] text-[var(--text-primary)] truncate">
                    {{ session.device_name || session.os || 'Unknown Device' }}
                  </h4>
                  <span v-if="session.id === currentSessionId" class="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Current Session
                  </span>
                </div>
                <div class="text-[0.8rem] text-[var(--text-secondary)] space-y-0.5">
                  <p class="truncate">{{ session.os || 'Unknown OS' }} &middot; {{ session.browser || 'Unknown Browser' }}</p>
                  <p class="truncate">IP: {{ session.ip_address || 'Unknown IP' }} &middot; {{ session.location || 'Unknown Location' }}</p>
                  <p class="truncate">Logged in: {{ new Date(session.created_at).toLocaleString() }}</p>
                </div>
              </div>

              <!-- Action -->
              <div class="shrink-0 flex items-center h-full pt-1" v-if="session.id !== currentSessionId">
                <button 
                  @click="terminate(session.id)"
                  :disabled="terminatingId === session.id"
                  class="text-[0.75rem] font-bold px-3 py-1.5 rounded-lg border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <span v-if="terminatingId === session.id">
                    <Loader2 :size="14" class="animate-spin" /> Terminating...
                  </span>
                  <span v-else>Terminate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import { Settings, X, Loader2, Laptop, Smartphone, Monitor } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();
const loading = ref(false);
const terminatingId = ref(null);

const currentSessionId = computed(() => {
  if (!authStore.token) return null;
  try {
    const decoded = jwtDecode(authStore.token);
    return decoded.session_id;
  } catch (e) {
    return null;
  }
});

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    loading.value = true;
    await authStore.fetchSessions();
    loading.value = false;
  }
});

function close() {
  emit('close');
}

async function terminate(id) {
  terminatingId.value = id;
  const success = await authStore.terminateSession(id);
  if (success) {
    toastStore.show('Session terminated successfully.', { type: 'success' });
    if (id === currentSessionId.value) {
      close();
      authStore.logout();
      router.push('/login');
    }
  } else {
    toastStore.show('Failed to terminate session.', { type: 'error' });
  }
  terminatingId.value = null;
}
</script>
