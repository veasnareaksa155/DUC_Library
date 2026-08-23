<template>
  <div class="flex flex-col h-full rounded-lg overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm animate-pulse">
    <!-- Image Skeleton -->
    <div class="w-full h-[220px] max-sm:h-[180px] bg-slate-200 dark:bg-slate-700 shrink-0"></div>
    
    <!-- Content Skeleton -->
    <div class="p-4 flex flex-col flex-1 max-sm:p-3">
      <!-- Category Line -->
      <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2.5 max-sm:h-2"></div>
      
      <!-- Title Lines -->
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1.5 max-sm:h-3"></div>
      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4 max-sm:h-3"></div>
      
      <!-- Buttons Row -->
      <div class="flex items-center gap-2 mt-auto">
        <!-- Read Button Skeleton -->
        <div class="flex-1 h-9 rounded-md bg-slate-200 dark:bg-slate-700"></div>
        <!-- Borrow Button Skeleton -->
        <div class="w-[85px] h-9 rounded-md bg-slate-200 dark:bg-slate-700 max-sm:w-9 shrink-0"></div>
      </div>
    </div>
  </div>
</template>
