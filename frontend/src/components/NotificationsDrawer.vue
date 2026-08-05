<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div 
        v-if="notifStore.isDrawerOpen" 
        class="drawer-backdrop" 
        @click.self="notifStore.closeDrawer"
      >
        <div class="notif-drawer-content glass-panel">
          <!-- Drawer Mobile Drag Handle -->
          <div class="mobile-drag-handle">
            <span class="handle-bar"></span>
          </div>

          <!-- Drawer Header -->
          <header class="drawer-header">
            <div class="drawer-title-group">
              <div class="title-badge-row">
                <Bell :size="20" class="notif-bell-icon" />
                <h3 class="drawer-title">Notifications</h3>
                <span v-if="notifStore.unreadCount > 0" class="unread-pill">
                  {{ notifStore.unreadCount }} new
                </span>
              </div>
              <p class="drawer-subtitle">DUC Library announcements & borrowing updates</p>
            </div>

            <button @click="notifStore.closeDrawer" class="btn-close-drawer" title="Close">
              <X :size="20" />
            </button>
          </header>

          <!-- Drawer Actions Sub-bar -->
          <div v-if="notifStore.notifications.length > 0" class="drawer-actions-bar">
            <button @click="notifStore.markAllAsRead" class="action-btn text-accent">
              <CheckCheck :size="15" /> Mark all read
            </button>
            <button @click="notifStore.clearAll" class="action-btn text-muted">
              <Trash2 :size="15" /> Clear all
            </button>
          </div>

          <!-- Notifications List Body -->
          <div class="drawer-body">
            <!-- Empty State -->
            <div v-if="notifStore.notifications.length === 0" class="empty-notif-state">
              <div class="empty-bell-circle">
                <BellOff :size="40" class="text-muted" />
              </div>
              <h4>No Notifications</h4>
              <p>You're all caught up! Borrowing updates and library announcements will appear here.</p>
            </div>

            <!-- Notification Items -->
            <div v-else class="notif-items-list">
              <div 
                v-for="item in notifStore.notifications" 
                :key="item.id"
                class="notif-card"
                :class="{ unread: !item.read }"
                @click="notifStore.markAsRead(item.id)"
              >
                <div class="notif-card-header">
                  <div class="icon-title-group">
                    <span class="type-icon-dot" :class="item.type || 'info'"></span>
                    <h4 class="notif-card-title">{{ item.title }}</h4>
                  </div>
                  <span class="notif-time">{{ item.time }}</span>
                </div>

                <p class="notif-card-msg">{{ item.message }}</p>

                <div class="notif-card-footer">
                  <span v-if="!item.read" class="unread-indicator">● New</span>
                  <button 
                    @click.stop="notifStore.removeNotification(item.id)" 
                    class="btn-remove-item"
                    title="Remove"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useNotificationsStore } from '../stores/notifications';
import { Bell, BellOff, X, CheckCheck, Trash2 } from 'lucide-vue-next';

const notifStore = useNotificationsStore();
</script>

<style scoped>
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(11, 15, 25, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: flex-end;
}

.notif-drawer-content {
  width: 100%;
  max-width: 420px;
  height: 100%;
  background: var(--bg-secondary);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
}

.mobile-drag-handle {
  display: none;
}

.drawer-header {
  padding: 1.25rem 1.5rem 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.title-badge-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.notif-bell-icon {
  color: var(--accent-primary, #6366f1);
}

.drawer-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary) !important;
  margin: 0;
}

.unread-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.drawer-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted) !important;
  margin: 0.25rem 0 0 0;
}

.btn-close-drawer {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.3rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close-drawer:hover {
  color: var(--text-primary);
  background: rgba(125, 125, 125, 0.15);
}

.drawer-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.5rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.action-btn {
  background: transparent;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

.action-btn:hover {
  opacity: 0.8;
}

.text-accent { color: var(--accent-primary, #6366f1); }
.text-muted { color: var(--text-muted); }

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  background: var(--bg-primary);
}

.empty-notif-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  color: var(--text-muted);
}

.empty-bell-circle {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-notif-state h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.empty-notif-state p {
  font-size: 0.82rem;
  line-height: 1.45;
}

.notif-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notif-card {
  padding: 0.9rem 1rem;
  border-radius: var(--radius-md, 12px);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.notif-card.unread {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.35);
}

.notif-card:hover {
  border-color: var(--border-highlight);
}

.notif-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.icon-title-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1;
}

.type-icon-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-icon-dot.info { background: #6366f1; box-shadow: 0 0 8px #6366f1; }
.type-icon-dot.featured { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
.type-icon-dot.system { background: #10b981; box-shadow: 0 0 8px #10b981; }

.notif-card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary) !important;
  margin: 0;
  line-height: 1.35;
}

.notif-time {
  font-size: 0.7rem;
  color: var(--text-muted) !important;
  white-space: nowrap;
  flex-shrink: 0;
}

.notif-card-msg {
  font-size: 0.8rem;
  color: var(--text-secondary) !important;
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
}

.notif-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.unread-indicator {
  font-size: 0.68rem;
  font-weight: 700;
  color: #818cf8;
}

.btn-remove-item {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  margin-left: auto;
  transition: color 0.2s ease;
}

.btn-remove-item:hover {
  color: #f87171;
}

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

/* Mobile Right-Side Drawer Style */
@media (max-width: 640px) {
  .drawer-backdrop {
    align-items: stretch;
    justify-content: flex-end;
  }

  .notif-drawer-content {
    width: 88vw;
    max-width: 340px;
    height: 100%;
    border-left: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0;
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
  }

  .mobile-drag-handle {
    display: none;
  }
}
</style>
