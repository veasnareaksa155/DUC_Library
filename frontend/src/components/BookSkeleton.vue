<template>
  <div class="flex flex-col h-full rounded-[var(--radius-xl,20px)] overflow-hidden bg-[var(--bg-card,rgba(30,41,59,0.7))] border border-[var(--border-color,rgba(255,255,255,0.08))] shadow-[0_8px_24px_rgba(0,0,0,0.12)] animate-pulse max-sm:rounded-[10px] max-sm:shadow-[0_3px_10px_rgba(0,0,0,0.08)]">
    <!-- Image Skeleton -->
    <div class="w-full h-[210px] bg-slate-800/60 max-sm:aspect-[3/4] max-sm:h-auto"></div>
    
    <!-- Content Skeleton -->
    <div class="p-4 pb-[1.1rem] flex flex-col flex-1 max-sm:px-1.5 max-sm:py-[0.35rem] max-sm:pb-[0.45rem]">
      <!-- Title Lines -->
      <div class="h-4 bg-slate-800/70 rounded w-3/4 mb-2 max-sm:h-2.5 max-sm:mb-1"></div>
      <div class="h-4 bg-slate-800/70 rounded w-1/2 mb-auto max-sm:h-2.5"></div>
      
      <!-- Buttons Row -->
      <div class="flex items-center gap-2.5 mt-4 max-sm:gap-1 max-sm:mt-2">
        <!-- Read Button Skeleton -->
        <div class="flex-1 h-[36px] rounded-full bg-slate-800/60 max-sm:h-[26px]"></div>
        <!-- Bookmark Button Skeleton -->
        <div class="w-[36px] h-[36px] rounded-full bg-slate-800/60 max-sm:w-[26px] max-sm:h-[26px] shrink-0"></div>
      </div>
    </div>
  </div>
</template>
