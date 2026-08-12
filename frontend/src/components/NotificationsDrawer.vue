<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
        <div 
          v-if="notifStore.isDrawerOpen" 
          class="fixed inset-0 z-[99999] bg-[#0b0f19]/65 backdrop-blur-[8px] flex justify-end max-sm:items-stretch" 
          @click.self="notifStore.closeDrawer"
        >
          <div class="w-full max-w-[420px] max-sm:max-w-[340px] max-sm:w-[88vw] h-full bg-[var(--bg-secondary)] backdrop-blur-[24px] border-l border-[var(--border-color)] flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.3)] max-sm:shadow-[-10px_0_40px_rgba(0,0,0,0.5)] notif-drawer-content glass-panel">
            <!-- Drawer Mobile Drag Handle -->
            <div class="hidden">
              <span class="handle-bar"></span>
            </div>
  
            <!-- Drawer Header -->
            <header class="px-6 pt-5 pb-4 flex items-start justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div class="drawer-title-group">
                <div class="flex items-center gap-2">
                  <Bell :size="20" class="text-[var(--accent-primary)]" />
                  <h3 class="text-[1.15rem] font-extrabold text-[var(--text-primary)] m-0">Notifications</h3>
                  <span v-if="notifStore.unreadCount > 0" class="text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-500">
                    {{ notifStore.unreadCount }} new
                  </span>
                </div>
                <p class="text-[0.78rem] text-[var(--text-muted)] m-0 mt-1">DUC Library announcements & borrowing updates</p>
              </div>
  
              <button @click="notifStore.closeDrawer" class="bg-transparent border-none text-[var(--text-muted)] p-1 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-[var(--text-primary)] hover:bg-gray-500/15" title="Close">
                <X :size="20" />
              </button>
            </header>
  
            <!-- Drawer Actions Sub-bar -->
            <div v-if="notifStore.notifications.length > 0" class="flex items-center justify-between px-6 py-2.5 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
              <button @click="notifStore.markAllAsRead" class="bg-transparent border-none inline-flex items-center gap-1.5 text-[0.78rem] font-semibold cursor-pointer px-1.5 py-1 rounded transition-opacity duration-200 hover:opacity-80 text-[var(--accent-primary)]">
                <CheckCheck :size="15" /> Mark all read
              </button>
              <button @click="notifStore.clearAll" class="bg-transparent border-none inline-flex items-center gap-1.5 text-[0.78rem] font-semibold cursor-pointer px-1.5 py-1 rounded transition-opacity duration-200 hover:opacity-80 text-[var(--text-muted)]">
                <Trash2 :size="15" /> Clear all
              </button>
            </div>
  
            <!-- Notifications List Body -->
            <div class="flex-1 overflow-y-auto p-5 bg-[var(--bg-primary)]">
              <!-- Notification Items & Empty State -->
              <TransitionGroup name="notif-list" tag="div" class="flex flex-col gap-3 relative w-full min-h-[300px]">
                
                <!-- Empty State -->
                <div v-if="notifStore.notifications.length === 0" key="empty-state" class="text-center py-14 px-6 text-[var(--text-muted)] w-full absolute inset-0 m-auto h-fit transition-all duration-300">
                  <div class="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
                    <BellOff :size="40" class="text-[var(--text-muted)]" />
                  </div>
                  <h4 class="text-[1.1rem] font-bold text-[var(--text-primary)] mb-1.5">No Notifications</h4>
                  <p class="text-[0.82rem] leading-relaxed">You're all caught up! Borrowing updates and library announcements will appear here.</p>
                </div>

                <!-- Notification Items -->
                <div 
                  v-for="item in notifStore.notifications" 
                  :key="item.id"
                  class="px-4 py-3.5 rounded-[var(--radius-md)] bg-[var(--bg-card)] border border-[var(--border-color)] cursor-pointer transition-all duration-200 relative shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-[var(--border-highlight)]"
                  :class="{ 'bg-indigo-500/10 border-indigo-500/35': !item.read }"
                  @click="notifStore.markAsRead(item.id)"
                >
                  <div class="flex items-start justify-between gap-2 mb-1.5">
                    <div class="flex items-center gap-2 flex-1">
                      <span class="w-2 h-2 rounded-full shrink-0" :class="{
                        'bg-indigo-500 shadow-[0_0_8px_#6366f1]': !item.type || item.type === 'info',
                        'bg-amber-500 shadow-[0_0_8px_#f59e0b]': item.type === 'featured',
                        'bg-emerald-500 shadow-[0_0_8px_#10b981]': item.type === 'system'
                      }"></span>
                      <h4 class="text-[0.88rem] font-bold text-[var(--text-primary)] m-0 leading-[1.35]">{{ item.title }}</h4>
                    </div>
                    <span class="text-[0.7rem] text-[var(--text-muted)] whitespace-nowrap shrink-0">{{ formatTime(item.timestamp) }}</span>
                  </div>
  
                  <p class="text-[0.8rem] text-[var(--text-secondary)] leading-[1.4] m-0 mb-2">{{ item.message }}</p>
  
                  <div class="flex items-center justify-between">
                    <span v-if="!item.read" class="text-[0.68rem] font-bold text-indigo-400">● New</span>
                    <button 
                      @click.stop="notifStore.removeNotification(item.id)" 
                      class="bg-transparent border-none text-[var(--text-muted)] cursor-pointer p-1 rounded ml-auto transition-colors duration-200 hover:text-red-400"
                      title="Remove"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotificationsStore } from '../stores/notifications';
import { Bell, BellOff, X, CheckCheck, Trash2 } from 'lucide-vue-next';

const notifStore = useNotificationsStore();

const now = ref(Date.now());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function formatTime(timestamp) {
  if (!timestamp) return 'Just now';
  const diff = Math.max(0, now.value - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
</script>

<style scoped>
/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-active .notif-drawer-content,
.drawer-fade-leave-active .notif-drawer-content {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.drawer-fade-enter-from {
  opacity: 0;
}

.drawer-fade-enter-from .notif-drawer-content {
  transform: translateX(100%);
}

.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-fade-leave-to .notif-drawer-content {
  transform: translateX(100%);
}

/* Notification List Animations */
.notif-list-move,
.notif-list-enter-active,
.notif-list-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.notif-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.notif-list-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.notif-list-leave-active {
  position: absolute;
  left: 0;
  right: 0;
}
</style>
