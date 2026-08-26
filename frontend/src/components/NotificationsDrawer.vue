<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
        <div 
          v-if="notifStore.isDrawerOpen" 
          class="fixed inset-0 z-[99999] bg-slate-900/40 dark:bg-[#0b0f19]/70 backdrop-blur-md flex justify-end max-sm:items-stretch" 
          @click.self="notifStore.closeDrawer"
        >
          <div class="w-full max-w-[420px] max-sm:max-w-[340px] max-sm:w-[88vw] h-full bg-[var(--bg-primary)]/95 backdrop-blur-2xl border-l border-[var(--border-color)] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] notif-drawer-content overflow-hidden relative">
            <!-- Ambient glow effects -->
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div class="absolute top-1/3 -left-20 w-60 h-60 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <!-- Drawer Header -->
            <header class="px-6 pt-8 pb-5 flex items-start justify-between border-b border-[var(--border-color)]/50 relative z-10">
              <div class="drawer-title-group">
                <div class="flex items-center gap-3 mb-1.5">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Bell :size="18" class="animate-pulse-slow" />
                  </div>
                  <h3 class="text-[1.3rem] font-extrabold text-[var(--text-primary)] m-0 tracking-tight">Notifications</h3>
                  <Transition name="scale-fade">
                    <span v-if="notifStore.unreadCount > 0" class="flex items-center justify-center text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white tracking-wide shadow-md shadow-indigo-500/20">
                      {{ notifStore.unreadCount }} New
                    </span>
                  </Transition>
                </div>
                <p class="text-[0.85rem] font-medium text-[var(--text-secondary)] m-0 leading-tight">Announcements & borrowing updates</p>
              </div>
  
              <button @click="notifStore.closeDrawer" class="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] p-1.5 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:text-[var(--text-primary)] hover:border-indigo-500/30 hover:shadow-sm" title="Close">
                <X :size="18" />
              </button>
            </header>
  
            <!-- Drawer Actions Sub-bar -->
            <div v-if="notifStore.notifications.length > 0" class="flex items-center justify-between px-6 py-3 bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)]/50 relative z-10 backdrop-blur-sm">
              <button 
                @click="handleMarkAllRead" 
                class="bg-indigo-500/10 border border-indigo-500/20 inline-flex items-center gap-2 text-[0.8rem] font-bold cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-indigo-500 text-indigo-600 dark:text-indigo-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed group"
                :disabled="isMarkingAllRead"
              >
                <Loader2 v-if="isMarkingAllRead" :size="14" class="animate-spin" />
                <CheckCheck v-else :size="14" class="transition-transform group-hover:scale-110" /> 
                <span v-if="isMarkingAllRead">Marking...</span>
                <span v-else>Mark all read</span>
              </button>
              <button 
                @click="handleClearAll" 
                class="bg-transparent border border-transparent inline-flex items-center gap-2 text-[0.8rem] font-bold cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 text-[var(--text-muted)] disabled:opacity-50 disabled:cursor-not-allowed group"
                :disabled="isClearingAll"
              >
                <Loader2 v-if="isClearingAll" :size="14" class="animate-spin text-[var(--text-muted)]" />
                <Trash2 v-else :size="14" class="transition-transform group-hover:scale-110" /> 
                <span v-if="isClearingAll">Clearing...</span>
                <span v-else>Clear all</span>
              </button>
            </div>
  
            <!-- Notifications List Body -->
            <div class="flex-1 overflow-y-auto p-5 relative z-10 custom-scrollbar">
              <!-- Empty State -->
              <div v-if="notifStore.notifications.length === 0" key="empty-state" class="text-center py-20 px-6 text-[var(--text-muted)] w-full absolute inset-0 m-auto h-fit transition-all duration-300 flex flex-col items-center justify-center">
                <div class="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div class="absolute inset-0 bg-gray-500/5 rounded-full animate-ping opacity-20"></div>
                  <div class="absolute inset-2 bg-gray-500/10 rounded-full"></div>
                  <BellOff :size="28" class="text-[var(--text-muted)] relative z-10" />
                </div>
                <h4 class="text-[1.1rem] font-extrabold text-[var(--text-primary)] mb-2">No Notifications</h4>
                <p class="text-[0.9rem] font-medium leading-relaxed max-w-[200px]">You're all caught up! Check back later for updates.</p>
              </div>

              <!-- Notification Items -->
              <TransitionGroup name="notif-list" tag="div" class="flex flex-col gap-3 relative w-full min-h-[300px]">
                <div 
                  v-for="item in notifStore.notifications" 
                  :key="item.id"
                  class="group flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 relative overflow-hidden"
                  :class="[
                    !item.read ? 'border-indigo-500/30 dark:border-indigo-500/40 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-500/5' : 'border-[var(--border-color)] hover:border-indigo-500/20'
                  ]"
                  @click="notifStore.markAsRead(item.id)"
                >
                  <div v-if="!item.read" class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>

                  <!-- Status Icon -->
                  <div class="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300" :class="getIconWrapperClass(item)">
                    <component :is="getIcon(item)" :size="18" :class="getIconColorClass(item)" />
                  </div>

                  <div class="flex-1 min-w-0 pb-1">
                    <div class="flex justify-between items-start gap-2 mb-1.5">
                      <h4 class="text-[0.95rem] font-bold leading-tight flex items-center gap-2 m-0" :class="!item.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'">
                        {{ item.title }}
                        <span v-if="!item.read" class="relative flex h-2 w-2 flex-shrink-0">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="getDotColor(item)"></span>
                          <span class="relative inline-flex rounded-full h-2 w-2" :class="getDotColor(item, true)"></span>
                        </span>
                      </h4>
                      <span class="text-[0.7rem] font-bold text-[var(--text-muted)] whitespace-nowrap pt-0.5 tracking-wide">{{ formatTime(item.timestamp) }}</span>
                    </div>
                    
                    <p class="text-[0.85rem] font-medium text-[var(--text-secondary)] leading-relaxed m-0 pr-6">{{ item.message }}</p>
                  </div>

                  <!-- Delete Button (Reveals on hover) -->
                  <button 
                    @click.stop="handleRemove(item.id)" 
                    class="absolute right-3 bottom-3 bg-[var(--bg-card)] backdrop-blur-sm border border-[var(--border-color)] text-[var(--text-muted)] cursor-pointer p-1.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-sm disabled:opacity-50"
                    title="Remove"
                    :disabled="deletingId === item.id"
                  >
                    <Loader2 v-if="deletingId === item.id" :size="14" class="animate-spin text-rose-500" />
                    <Trash2 v-else :size="14" />
                  </button>
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
import { Bell, BellOff, X, CheckCheck, Trash2, Loader2, Info, CheckCircle2, XCircle, AlertCircle, BookOpen } from 'lucide-vue-next';

const notifStore = useNotificationsStore();

const deletingId = ref(null);
const isClearingAll = ref(false);
const isMarkingAllRead = ref(false);

async function handleRemove(id) {
  if (deletingId.value) return;
  deletingId.value = id;
  await notifStore.removeNotification(id);
  deletingId.value = null;
}

async function handleClearAll() {
  if (isClearingAll.value) return;
  isClearingAll.value = true;
  await notifStore.clearAll();
  isClearingAll.value = false;
}

async function handleMarkAllRead() {
  if (isMarkingAllRead.value) return;
  isMarkingAllRead.value = true;
  await notifStore.markAllAsRead();
  isMarkingAllRead.value = false;
}

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

// Visual mapping helpers
function getIcon(item) {
  const t = (item.title || '').toLowerCase();
  if (t.includes('approved') || t.includes('success')) return CheckCircle2;
  if (t.includes('declined') || t.includes('rejected') || t.includes('failed')) return XCircle;
  if (t.includes('request') || t.includes('book')) return BookOpen;
  if (t.includes('alert') || t.includes('warning')) return AlertCircle;
  return Info;
}

function getIconColorClass(item) {
  const t = (item.title || '').toLowerCase();
  if (t.includes('approved') || t.includes('success')) return 'text-emerald-500';
  if (t.includes('declined') || t.includes('rejected') || t.includes('failed')) return 'text-rose-500';
  if (t.includes('request') || t.includes('book')) return 'text-indigo-500';
  if (t.includes('alert') || t.includes('warning')) return 'text-amber-500';
  return 'text-blue-500';
}

function getIconWrapperClass(item) {
  const t = (item.title || '').toLowerCase();
  if (t.includes('approved') || t.includes('success')) return 'bg-emerald-500/10 border-emerald-500/20';
  if (t.includes('declined') || t.includes('rejected') || t.includes('failed')) return 'bg-rose-500/10 border-rose-500/20';
  if (t.includes('request') || t.includes('book')) return 'bg-indigo-500/10 border-indigo-500/20';
  if (t.includes('alert') || t.includes('warning')) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-blue-500/10 border-blue-500/20';
}

function getDotColor(item, solid = false) {
  const t = (item.title || '').toLowerCase();
  if (t.includes('approved') || t.includes('success')) return solid ? 'bg-emerald-500' : 'bg-emerald-400';
  if (t.includes('declined') || t.includes('rejected') || t.includes('failed')) return solid ? 'bg-rose-500' : 'bg-rose-400';
  if (t.includes('request') || t.includes('book')) return solid ? 'bg-indigo-500' : 'bg-indigo-400';
  if (t.includes('alert') || t.includes('warning')) return solid ? 'bg-amber-500' : 'bg-amber-400';
  return solid ? 'bg-blue-500' : 'bg-blue-400';
}
</script>

<style scoped>
/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.4s ease;
}

.drawer-fade-enter-active .notif-drawer-content,
.drawer-fade-leave-active .notif-drawer-content {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
