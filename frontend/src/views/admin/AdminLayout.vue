<template>
  <div class="flex items-start min-h-screen w-full bg-[var(--bg-primary)]">
    <!-- Left Admin Sidebar - Stays fixed and mounted across all admin routes -->
    <AdminSidebar />

    <!-- Main Content Area - Transitions between nested routes -->
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import AdminSidebar from '../../components/AdminSidebar.vue';
</script>
