<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
        <div 
          v-if="notifStore.isDrawerOpen" 
          class="fixed inset-0 z-[99999] bg-[#0b0f19]/65 backdrop-blur-[8px] flex justify-end max-sm:items-stretch" 
          @click.self="notifStore.closeDrawer"
        >
          <div class="w-full max-w-[420px] max-sm:max-w-[340px] max-sm:w-[88vw] h-full bg-[var(--bg-primary)] border-l border-[var(--border-color)] flex flex-col shadow-2xl notif-drawer-content overflow-hidden">
            <!-- Drawer Mobile Drag Handle -->
            <div class="hidden">
              <span class="handle-bar"></span>
            </div>
  
            <!-- Drawer Header -->
            <header class="px-5 pt-5 pb-4 flex items-start justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
              <div class="drawer-title-group">
                <div class="flex items-center gap-2 mb-1">
                  <Bell :size="18" class="text-[var(--text-primary)]" />
                  <h3 class="text-[1.05rem] font-bold text-[var(--text-primary)] m-0">Notifications</h3>
                  <span v-if="notifStore.unreadCount > 0" class="text-[0.65rem] font-bold px-1.5 py-0.5 rounded bg-[var(--text-primary)] text-[var(--bg-primary)] tracking-wide">
                    {{ notifStore.unreadCount }} New
                  </span>
                </div>
                <p class="text-[0.8rem] text-[var(--text-secondary)] m-0 leading-tight">Announcements & borrowing updates</p>
              </div>
  
              <button @click="notifStore.closeDrawer" class="bg-transparent border-none text-[var(--text-muted)] p-1 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-[var(--text-primary)] hover:bg-gray-500/15" title="Close">
                <X :size="20" />
              </button>
            </header>
  
            <!-- Drawer Actions Sub-bar -->
            <div v-if="notifStore.notifications.length > 0" class="flex items-center justify-between px-6 py-2.5 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
              <button 
                @click="handleMarkAllRead" 
                class="bg-transparent border-none inline-flex items-center gap-1.5 text-[0.78rem] font-semibold cursor-pointer px-1.5 py-1 rounded transition-opacity duration-200 hover:opacity-80 text-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isMarkingAllRead"
              >
                <Loader2 v-if="isMarkingAllRead" :size="15" class="animate-spin text-[var(--accent-primary)]" />
                <CheckCheck v-else :size="15" /> 
                <span v-if="isMarkingAllRead">Marking...</span>
                <span v-else>Mark all read</span>
              </button>
              <button 
                @click="handleClearAll" 
                class="bg-transparent border-none inline-flex items-center gap-1.5 text-[0.78rem] font-semibold cursor-pointer px-1.5 py-1 rounded transition-opacity duration-200 hover:opacity-80 text-[var(--text-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isClearingAll"
              >
                <Loader2 v-if="isClearingAll" :size="15" class="animate-spin text-[var(--text-muted)]" />
                <Trash2 v-else :size="15" /> 
                <span v-if="isClearingAll">Clearing...</span>
                <span v-else>Clear all</span>
              </button>
            </div>
  
            <!-- Notifications List Body -->
            <div class="flex-1 overflow-y-auto p-4 bg-[var(--bg-primary)] custom-scrollbar">
              <!-- Notification Items & Empty State -->
              <TransitionGroup name="notif-list" tag="div" class="flex flex-col gap-2 relative w-full min-h-[300px]">
                
                <!-- Empty State -->
                <div v-if="notifStore.notifications.length === 0" key="empty-state" class="text-center py-16 px-6 text-[var(--text-muted)] w-full absolute inset-0 m-auto h-fit transition-all duration-300">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
                    <BellOff :size="24" class="text-[var(--text-muted)]" />
                  </div>
                  <h4 class="text-[0.95rem] font-bold text-[var(--text-primary)] mb-1">No Notifications</h4>
                  <p class="text-[0.85rem] leading-relaxed">You're all caught up!</p>
                </div>

                <!-- Notification Items -->
                <div 
                  v-for="item in notifStore.notifications" 
                  :key="item.id"
                  class="px-4 py-3 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)] relative"
                  @click="notifStore.markAsRead(item.id)"
                >
                  <div v-if="!item.read" class="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-l-md"></div>

                  <div class="flex items-start justify-between gap-2 mb-1">
                    <div class="flex items-center gap-2 flex-1">
                      <h4 class="text-[0.9rem] font-bold text-[var(--text-primary)] m-0 leading-tight" :class="!item.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'">{{ item.title }}</h4>
                    </div>
                    <span class="text-[0.7rem] font-semibold text-[var(--text-muted)] whitespace-nowrap shrink-0">{{ formatTime(item.timestamp) }}</span>
                  </div>
  
                  <p class="text-[0.8rem] text-[var(--text-secondary)] leading-snug m-0 mb-2">{{ item.message }}</p>
  
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-[0.7rem] font-bold uppercase tracking-wider text-indigo-500">{{ !item.read ? 'New' : '' }}</span>
                    <button 
                      @click.stop="handleRemove(item.id)" 
                      class="bg-transparent border-none text-[var(--text-muted)] cursor-pointer p-1 -mr-1 rounded-md transition-colors hover:bg-[var(--bg-primary)] hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove"
                      :disabled="deletingId === item.id"
                    >
                      <Loader2 v-if="deletingId === item.id" :size="14" class="animate-spin text-red-500" />
                      <Trash2 v-else :size="14" />
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
import { Bell, BellOff, X, CheckCheck, Trash2, Loader2 } from 'lucide-vue-next';

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
