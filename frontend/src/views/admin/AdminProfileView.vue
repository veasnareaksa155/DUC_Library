<template>
  <div class="flex items-start min-h-screen w-full">
    <!-- Left Admin Sidebar -->
    <AdminSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 w-[calc(100%-280px)] max-w-none">
      <ProfileView />
    </main>
  </div>
</template>

<script setup>
import AdminSidebar from '../../components/AdminSidebar.vue';
import ProfileView from '../ProfileView.vue';
</script>
