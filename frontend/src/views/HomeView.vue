<template>
  <div class="w-full max-w-7xl mx-auto py-5 px-6 pb-12 max-sm:px-3 max-sm:py-3 max-sm:pb-16">
    <!-- Featured Books Hero Slider Banner (Swiper) -->
    <section v-if="booksStore.loading" class="relative mb-10 w-full h-[540px] sm:h-[400px] lg:h-[480px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-[var(--border-color)] bg-[var(--bg-card)] animate-pulse flex items-center justify-center p-8 max-sm:p-4">
      <div class="w-full h-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-8 sm:gap-10">
        <!-- Text Skeleton -->
        <div class="flex-1 w-full max-w-[600px] flex flex-col items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 order-2 sm:order-1">
          <div class="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          <div class="h-12 sm:h-16 w-full max-w-[450px] bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div class="h-10 sm:h-12 w-[80%] max-w-[350px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          
          <!-- Buttons skeleton -->
          <div class="flex gap-4 mt-2 sm:mt-4 w-full sm:w-auto justify-center sm:justify-start">
            <div class="h-11 sm:h-12 w-32 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div class="h-11 sm:h-12 w-32 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          </div>
        </div>

        <!-- Cover Skeleton -->
        <div class="w-[140px] sm:w-[180px] lg:w-[260px] aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-2xl sm:rounded-3xl shrink-0 order-1 sm:order-2"></div>
      </div>
    </section>
    <section v-else-if="featuredBooks.length > 0" class="relative mb-10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[var(--border-color)]">
      <Swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        :navigation="true"
        class="w-full h-[540px] sm:h-[400px] lg:h-[480px] bg-slate-900 custom-swiper"
      >
        <SwiperSlide v-for="(slide, idx) in featuredBooks" :key="slide.id" class="h-full">
          <div class="relative w-full h-full flex items-center justify-center overflow-hidden py-4 sm:py-0">
            <!-- Background Image -->
            <div class="absolute inset-0">
              <img :src="getLibraryBg(idx)" :alt="slide.title" class="w-full h-full object-cover brightness-50 blur-md scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/70 to-black/20 sm:to-transparent"></div>
            </div>
            
            <div class="relative z-10 flex flex-col sm:flex-row items-center justify-center sm:justify-between w-full h-full px-5 sm:px-8 lg:px-20 max-w-7xl mx-auto gap-5 sm:gap-8">
              
              <!-- Left Content (Text) -->
              <div class="flex-1 max-w-[600px] flex flex-col items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 z-20 order-2 sm:order-1 w-full">
                <span class="inline-flex w-fit items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-indigo-500/30 shadow-sm">
                  <Award :size="12" class="sm:w-3.5 sm:h-3.5" /> {{ localeStore.t('featured') }}
                </span>
                <h2 class="text-white text-[1.4rem] sm:text-4xl lg:text-5xl font-extrabold leading-[1.6] drop-shadow-lg line-clamp-2 sm:line-clamp-3 sm:py-2 max-sm:px-2 max-sm:mb-1">
                  {{ slide.title }}
                </h2>
                <p class="text-gray-300 text-[0.8rem] sm:text-sm lg:text-base leading-[1.6] line-clamp-2 sm:line-clamp-3 max-w-[500px] max-sm:px-4">
                  {{ slide.description || localeStore.t('featuredDesc') }}
                </p>

                <div class="flex flex-row items-center justify-center sm:justify-start gap-3 mt-2 sm:mt-4 w-full sm:w-auto max-sm:px-4">
                  <button @click="openReaderModal(slide)" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-2.5 sm:py-3 bg-white text-black rounded-full font-bold text-[13px] sm:text-base hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-none cursor-pointer">
                    <BookOpenCheck :size="16" class="sm:w-4 sm:h-4" /> {{ localeStore.t('readNow') }}
                  </button>
                  <button @click="openBorrowModal(slide)" class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-7 py-2.5 sm:py-3 bg-black/40 border border-gray-400 text-white rounded-full font-bold text-[13px] sm:text-base backdrop-blur-md hover:bg-black/60 hover:border-white transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50" :disabled="slide.copies_available <= 0">
                    <BookmarkPlus :size="16" class="sm:w-4 sm:h-4" /> {{ localeStore.t('borrow') }}
                  </button>
                </div>
              </div>

              <!-- Right Content (Book Cover - Top on Mobile) -->
              <div class="relative w-[130px] sm:w-[160px] md:w-[200px] lg:w-[260px] aspect-[3/4] shrink-0 transform rotate-0 sm:rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 group cursor-pointer order-1 sm:order-2" @click="openReaderModal(slide)">
                <!-- Ambient Glow -->
                <div class="absolute inset-0 bg-indigo-500/40 blur-2xl sm:blur-3xl rounded-xl sm:rounded-3xl -z-10 group-hover:bg-indigo-400/60 transition-colors duration-500"></div>
                <img :src="slide.cover_url || fallbackCover" class="w-full h-full object-cover rounded-lg sm:rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10" />
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>



    <!-- Search & Filter Controls Section -->
    <section class="mb-10 mt-8">
      <!-- Minimal Search Input -->
      <div class="relative w-full max-w-2xl mb-8 mx-auto">
        <div class="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] shadow-sm transition-all duration-200" :class="{ 'ring-2 ring-indigo-500/20 border-indigo-500': isSearchFocused || booksStore.searchQuery }">
          <Search :size="18" class="text-[var(--text-secondary)] shrink-0 cursor-pointer" :class="{ 'text-indigo-500': isSearchFocused || booksStore.searchQuery }" @click="() => searchInputRef?.focus()" />
          <input 
            ref="searchInputRef"
            v-model="booksStore.searchQuery"
            @focus="isSearchFocused = true"
            @blur="handleSearchBlur"
            @input="handleSearch"
            type="text" 
            :placeholder="localeStore.t('searchPlaceholder')"
            class="flex-1 bg-transparent border-none outline-none text-[0.95rem] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <span class="text-[0.7rem] font-bold text-[var(--text-muted)] bg-[var(--bg-card-hover)] px-2 py-1 rounded border border-[var(--border-color)]">Ctrl K</span>
          <button v-if="booksStore.searchQuery" @click="clearSearch" class="bg-transparent border-none text-[var(--text-secondary)] cursor-pointer p-1 hover:text-[var(--text-primary)] flex items-center" title="Clear Search">
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Categories & Controls Row -->
      <div class="flex flex-col gap-2.5 w-full">
        <!-- Tier 1: Parent Catalogs Bar -->
        <div class="flex items-center justify-between gap-4 w-full">
          <div class="flex items-center gap-2 flex-1 min-w-0 max-sm:w-full">
            <button @click="scrollCategories('left')" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer shrink-0 z-[2] transition-colors" title="Scroll Left">
              <ChevronLeft :size="16" />
            </button>

            <div 
              class="flex items-center gap-2 overflow-x-auto overflow-y-hidden py-1 scroll-smooth flex-1 min-w-0 scrollbar-none" 
              ref="categoryScrollRef"
              @wheel.prevent="handleCategoryWheel"
            >
              <!-- All Books -->
              <button 
                @click="selectCategory('all')" 
                class="px-4 py-1.5 rounded-lg text-[0.85rem] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 max-sm:max-w-[160px] max-sm:truncate max-sm:px-3 max-sm:text-xs"
                :class="booksStore.selectedCategory === 'all' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm border-transparent' : 'bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'"
              >
                {{ localeStore.t('allCategories') }}
              </button>

              <!-- Parent Categories -->
              <button 
                v-for="parent in rootCategories" 
                :key="parent.id"
                @click="selectParentCategory(parent.id)"
                class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[0.85rem] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 max-sm:max-w-[180px] max-sm:truncate max-sm:px-3 max-sm:text-xs"
                :class="activeParentCategory?.id === parent.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm border-transparent' : 'bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'"
              >
                <span :style="(localeStore.currentLang === 'km' && parent.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">
                  {{ (localeStore.currentLang === 'km' && parent.name_km) ? parent.name_km : parent.name }}
                </span>
                <span class="opacity-60 text-[0.78rem]">({{ parent.total_book_count ?? parent.book_count ?? 0 }})</span>
                <ChevronDown v-if="booksStore.categories.some(c => String(c.parent_id) === String(parent.id))" :size="13" class="opacity-70 transition-transform duration-200" :class="activeParentCategory?.id === parent.id ? 'rotate-180' : ''" />
              </button>
            </div>

            <button @click="scrollCategories('right')" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer shrink-0 z-[2] transition-colors" title="Scroll Right">
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>

        <!-- Cascading Sub-Catalogs Bars (Supports Sub, Sub-in-Sub, Sub-in-Sub-in-Sub, etc.) -->
        <transition-group
          tag="div"
          class="flex flex-col gap-2 w-full"
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2 scale-98"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 -translate-y-2 scale-98"
        >
          <div
            v-for="tier in subCategoryTiers"
            :key="'tier-' + tier.parent.id"
            class="flex items-center gap-2 w-full pl-2 sm:pl-3 py-2 px-2.5 rounded-xl border transition-all duration-200 shadow-sm"
            :class="[
              tier.level === 1 ? 'bg-slate-500/5 dark:bg-slate-500/10 border-[var(--border-color)]/60' :
              tier.level === 2 ? 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 sm:ml-3' :
              'bg-pink-500/5 dark:bg-pink-500/10 border-pink-500/20 sm:ml-6'
            ]"
          >
            <!-- Label -->
            <div
              class="flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-wider shrink-0 pl-1"
              :class="tier.level === 1 ? 'text-[var(--accent-primary)]' : tier.level === 2 ? 'text-purple-600 dark:text-purple-400' : 'text-pink-600 dark:text-pink-400'"
            >
              <CornerDownRight :size="13" stroke-width="2.5" />
              <span class="hidden sm:inline">
                {{ tier.level === 1 ? 'Sub-Catalogs:' : `Sub of ${(localeStore.currentLang === 'km' && tier.parent.name_km) ? tier.parent.name_km : tier.parent.name}:` }}
              </span>
            </div>

            <!-- Scroll Left -->
            <button
              @click="scrollTier(tier.parent.id, 'left')"
              class="inline-flex items-center justify-center w-7 h-7 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer shrink-0 transition-colors"
              title="Scroll Left"
            >
              <ChevronLeft :size="14" />
            </button>

            <!-- Scrollable list -->
            <div
              class="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden py-0.5 scroll-smooth flex-1 min-w-0 scrollbar-none"
              :ref="el => setTierScrollRef(tier.parent.id, el)"
              @wheel.prevent="e => handleTierWheel(tier.parent.id, e)"
            >
              <!-- "All in Parent" pill -->
              <button
                @click="selectCategory(tier.parent.id)"
                class="px-3 py-1 rounded-lg text-[0.8rem] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200"
                :class="tier.selectedChildId === 'all_in_parent' ? (tier.level === 1 ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-purple-600 text-white font-bold shadow-sm') : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'"
              >
                {{ localeStore.currentLang === 'km' ? 'ទាំងអស់ក្នុង ' + (tier.parent.name_km || tier.parent.name) : 'All in ' + tier.parent.name }}
                <span class="opacity-70 text-[0.75rem] ml-1">({{ tier.parent.total_book_count ?? tier.parent.book_count ?? 0 }})</span>
              </button>

              <!-- Individual Sub-categories -->
              <button
                v-for="sub in tier.children"
                :key="sub.id"
                @click="selectCategory(sub.id)"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.8rem] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200"
                :class="tier.selectedChildId === sub.id ? (tier.level === 1 ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-purple-600 text-white font-bold shadow-sm') : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'"
              >
                <span :style="(localeStore.currentLang === 'km' && sub.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''">
                  {{ (localeStore.currentLang === 'km' && sub.name_km) ? sub.name_km : sub.name }}
                </span>
                <span class="opacity-70 text-[0.75rem]">({{ sub.total_book_count ?? sub.book_count ?? 0 }})</span>
                <span v-if="hasChildren(sub.id)" class="text-[0.68rem] px-1.5 py-0.2 rounded-full font-bold ml-0.5" :class="tier.selectedChildId === sub.id ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-500'">
                  {{ getChildrenCount(sub.id) }} sub ▾
                </span>
              </button>
            </div>

            <!-- Scroll Right -->
            <button
              @click="scrollTier(tier.parent.id, 'right')"
              class="inline-flex items-center justify-center w-7 h-7 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer shrink-0 transition-colors"
              title="Scroll Right"
            >
              <ChevronRight :size="14" />
            </button>
          </div>
        </transition-group>
      </div>
    </section>

    <!-- Books Catalog Grid -->
    <section class="catalog-section">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div v-if="activeCategoryChain.length > 0" class="flex items-center flex-wrap gap-2">
            <template v-for="(cat, idx) in activeCategoryChain" :key="cat.id">
              <span v-if="idx > 0" class="text-[var(--text-muted)] select-none">›</span>
              <button
                @click="selectCategory(cat.id)"
                class="bg-transparent border-none p-0 cursor-pointer transition-colors"
                :class="idx === activeCategoryChain.length - 1 ? 'text-[var(--accent-primary)] font-extrabold text-[1.2rem]' : 'text-[var(--text-primary)] hover:text-indigo-500 font-bold text-[1.1rem]'"
                :style="(localeStore.currentLang === 'km' && cat.name_km) ? 'font-family: \'Siemreab\', sans-serif;' : ''"
              >
                {{ (localeStore.currentLang === 'km' && cat.name_km) ? cat.name_km : cat.name }}
              </button>
            </template>
          </div>
          <h3 v-else class="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {{ booksStore.selectedCategory === 'wishlist' ? localeStore.t('mySavedWishlist') : localeStore.t('catalog') }}
          </h3>
          <span class="text-[0.75rem] font-semibold text-[var(--text-secondary)] bg-[var(--bg-card-hover)] px-2.5 py-1 rounded-md border border-[var(--border-color)]" v-if="!booksStore.loading">
            {{ displayedBooks.length }} {{ localeStore.t('books') }}
          </span>
          <button v-if="activeCategoryChain.length > 0" @click="selectCategory('all')" class="text-[0.78rem] text-indigo-500 hover:underline font-semibold ml-1 cursor-pointer">
            {{ localeStore.currentLang === 'km' ? 'បង្ហាញទាំងអស់' : 'View All' }}
          </button>
        </div>
      </div>
      <div v-if="booksStore.loading" class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 max-sm:grid-cols-2 max-sm:gap-4 xl:grid-cols-5">
        <BookSkeleton v-for="i in 12" :key="i" />
      </div>

      <div v-else-if="displayedBooks.length === 0" class="flex flex-col items-center justify-center text-center p-14 text-[var(--text-muted)]">
        <Heart v-if="booksStore.selectedCategory === 'wishlist'" :size="48" color="#ef4444" class="mb-3" />
        <BookX v-else :size="48" class="text-[var(--text-muted)] mb-3" />
        <h3 class="text-lg font-bold text-[var(--text-primary)] mb-1">{{ booksStore.selectedCategory === 'wishlist' ? localeStore.t('emptyWishlist') : localeStore.t('noBooksFound') }}</h3>
        <p class="text-[var(--text-secondary)]">{{ booksStore.selectedCategory === 'wishlist' ? localeStore.t('emptyWishlistSub') : localeStore.t('noBooksSub') }}</p>
        <button @click="resetFilters" class="inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 ease-out active:scale-95 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-indigo-500 hover:-translate-y-px px-4 py-2 text-sm mt-4">{{ localeStore.t('resetFilters') }}</button>
      </div>

      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 max-sm:grid-cols-2 max-sm:gap-4 xl:grid-cols-5">
        <BookCard 
          v-for="book in paginatedBooks" 
          :key="book.id" 
          :book="book"
          @read="openReaderModal"
          @borrow="openBorrowModal"
          @toast="showToast"
        />
      </div>

      <!-- Smart Pagination Controls -->
      <div v-if="totalPages > 1 && !booksStore.loading" class="mt-14 flex flex-col items-center justify-center gap-4">
        <div class="flex items-center gap-2">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
            title="Previous Page"
          >
            <ChevronLeft :size="18" />
          </button>
          
          <div class="flex items-center gap-1">
            <template v-for="(page, index) in visiblePages" :key="index">
              <span v-if="page === '...'" class="w-6 text-center text-[var(--text-muted)] select-none font-bold">...</span>
              <button 
                v-else
                @click="goToPage(page)"
                class="flex items-center justify-center w-9 h-9 rounded-md text-[0.85rem] font-bold transition-colors cursor-pointer border"
                :class="currentPage === page ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-color)]'"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
            title="Next Page"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
        <div class="text-[0.85rem] text-[var(--text-secondary)] font-medium">
          {{ localeStore.t('showing') }} <strong class="text-[var(--text-primary)]">{{ (currentPage - 1) * itemsPerPage + 1 }}</strong> {{ localeStore.t('to') }} <strong class="text-[var(--text-primary)]">{{ Math.min(currentPage * itemsPerPage, displayedBooks.length) }}</strong> {{ localeStore.t('of') }} <strong class="text-[var(--text-primary)]">{{ displayedBooks.length }}</strong> {{ localeStore.t('entries') }}
        </div>
      </div>
    </section>

    <!-- Reader Modal -->
    <ReaderModal 
      :is-open="isReaderOpen" 
      :book="selectedBook" 
      @close="isReaderOpen = false"
      @borrow="openBorrowFromReader"
    />

    <!-- Borrow Modal -->
    <BorrowModal 
      :is-open="isBorrowOpen" 
      :book="selectedBook" 
      @close="isBorrowOpen = false"
      @success="handleBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useWishlistStore } from '../stores/wishlist';
import { useToastStore } from '../stores/toast';
import { useRouter } from 'vue-router';
import BookCard from '../components/BookCard.vue';
import BookSkeleton from '../components/BookSkeleton.vue';
import ReaderModal from '../components/ReaderModal.vue';
import BorrowModal from '../components/BorrowModal.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { 
  Award, Search, X, CheckCircle2, Loader2, BookX, Heart, Bell, Globe,
  ChevronLeft, ChevronRight, ChevronDown, CornerDownRight, BookOpenCheck, BookmarkPlus 
} from 'lucide-vue-next';

const swiperModules = [Autoplay, Pagination, Navigation];
const booksStore = useBooksStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const wishlistStore = useWishlistStore();
const toastStore = useToastStore();
const router = useRouter();

const displayedBooks = computed(() => {
  if (booksStore.selectedCategory === 'wishlist') {
    return booksStore.books.filter(b => wishlistStore.isInWishlist(b.id));
  }
  return booksStore.books;
});

const currentPage = ref(1);
const itemsPerPage = 15;

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(displayedBooks.value.length / itemsPerPage));
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 1; // Number of pages to show before and after current
  
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  const range = [];
  const rangeWithDots = [];
  let l;
  
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  
  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }
  
  return rangeWithDots;
});

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    const section = document.querySelector('.catalog-section');
    if (section) {
      // scroll to just above the catalog section (accounting for sticky header if any)
      const y = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return displayedBooks.value.slice(start, end);
});

watch(() => [booksStore.selectedCategory, booksStore.searchQuery], () => {
  currentPage.value = 1;
});

function showToast(msg) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 4000);
}

const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

// Curated atmospheric & aesthetic library architecture background photos for the featured banner card
const libraryBgs = [
  'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80'
];

function getLibraryBg(idx) {
  return libraryBgs[idx % libraryBgs.length];
}
const selectedBook = ref(null);
const isReaderOpen = ref(false);
const isBorrowOpen = ref(false);
const toastMessage = ref('');

// Category Scroll Control
const categoryScrollRef = ref(null);
const tierScrollRefs = reactive({});

function setTierScrollRef(parentId, el) {
  if (el) tierScrollRefs[parentId] = el;
}

function scrollTier(parentId, direction) {
  const el = tierScrollRefs[parentId];
  if (!el) return;
  const scrollAmount = direction === 'left' ? -220 : 220;
  el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function handleTierWheel(parentId, e) {
  const el = tierScrollRefs[parentId];
  if (el && e.deltaY !== 0) {
    el.scrollLeft += e.deltaY;
  }
}

function hasChildren(catId) {
  return booksStore.categories.some(c => String(c.parent_id) === String(catId));
}

function getChildrenCount(catId) {
  return booksStore.categories.filter(c => String(c.parent_id) === String(catId)).length;
}

// Hierarchical Category Navigation
const rootCategories = computed(() => {
  return booksStore.categories.filter(c => !c.parent_id);
});

// Full active category chain from root to selected item
const activeCategoryChain = computed(() => {
  if (!booksStore.selectedCategory || booksStore.selectedCategory === 'all' || booksStore.selectedCategory === 'wishlist') {
    return [];
  }
  const chain = [];
  let curr = booksStore.categories.find(c => String(c.id) === String(booksStore.selectedCategory));
  while (curr) {
    chain.unshift(curr);
    if (!curr.parent_id) break;
    curr = booksStore.categories.find(c => String(c.id) === String(curr.parent_id));
  }
  return chain;
});

const activeParentCategory = computed(() => {
  return activeCategoryChain.value[0] || null;
});

// Dynamic cascading tiers: for each category in the active chain that has children, display a tier
const subCategoryTiers = computed(() => {
  const tiers = [];
  for (let i = 0; i < activeCategoryChain.value.length; i++) {
    const parentCat = activeCategoryChain.value[i];
    const children = booksStore.categories.filter(c => String(c.parent_id) === String(parentCat.id));
    if (children.length > 0) {
      const nextActive = activeCategoryChain.value[i + 1];
      const isParentItselfSelected = String(booksStore.selectedCategory) === String(parentCat.id);

      tiers.push({
        parent: parentCat,
        level: i + 1,
        children: children,
        selectedChildId: nextActive ? nextActive.id : (isParentItselfSelected ? 'all_in_parent' : null)
      });
    }
  }
  return tiers;
});

function selectParentCategory(parentId) {
  booksStore.selectedCategory = parentId;
  currentPage.value = 1;
  booksStore.fetchBooks();
}

function scrollCategories(direction) {
  if (!categoryScrollRef.value) return;
  const scrollAmount = direction === 'left' ? -220 : 220;
  categoryScrollRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function handleCategoryWheel(e) {
  if (categoryScrollRef.value && e.deltaY !== 0) {
    categoryScrollRef.value.scrollLeft += e.deltaY;
  }
}



// Spotlight Search State
const isSearchFocused = ref(false);

const featuredBooks = computed(() => {
  if (!booksStore.masterBooks || booksStore.masterBooks.length === 0) return [];
  const manualFeatured = booksStore.masterBooks.filter(b => b.is_featured === 1 || b.is_featured === true);
  if (manualFeatured.length > 0) {
    return manualFeatured;
  }
  return booksStore.masterBooks.slice(0, 5);
});

let searchTimeout;

const searchInputRef = ref(null);

function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInputRef.value) {
      searchInputRef.value.focus();
    }
  }
}

onMounted(() => {
  booksStore.selectedCategory = 'all';
  booksStore.fetchCategories();
  booksStore.fetchBooks();
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
}

function handleSearch() {
  // Search is handled instantly via client-side computed property
}

function clearSearch() {
  booksStore.searchQuery = '';
  booksStore.fetchBooks();
}

function selectCategory(catId) {
  booksStore.selectedCategory = catId;
  booksStore.fetchBooks();
}

function resetFilters() {
  booksStore.searchQuery = '';
  booksStore.selectedCategory = 'all';
  booksStore.availableOnly = false;
  booksStore.fetchBooks();
}

function openReaderModal(book) {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to read books!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  router.push(`/read/${book.id}`);
}

function openBorrowModal(book) {
  if (!authStore.isAuthenticated) {
    toastStore.show('Login is required to borrow books!', { type: 'error', title: 'Authentication Required' });
    return;
  }
  selectedBook.value = book;
  isBorrowOpen.value = true;
}

function openBorrowFromReader(book) {
  isReaderOpen.value = false;
  openBorrowModal(book);
}

function handleBorrowSuccess() {
  booksStore.fetchBooks();
}
</script>

<style scoped>
/* Swiper Premium Customization */
.custom-swiper {
  --swiper-theme-color: #ffffff;
  /* Change this to transparent so the default font-icon is invisible */
  --swiper-navigation-color: transparent; 
  --swiper-navigation-size: 18px;
}

/* Custom Navigation Arrows */
.custom-swiper :deep(.swiper-button-next),
.custom-swiper :deep(.swiper-button-prev) {
  width: 44px;
  height: 44px;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
  margin: 0 10px;
  background-size: 18px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.custom-swiper :deep(.swiper-button-next) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E");
}

.custom-swiper :deep(.swiper-button-prev) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 18l-6-6 6-6'/%3E%3C/svg%3E");
}

.custom-swiper :deep(.swiper-button-next):hover,
.custom-swiper :deep(.swiper-button-prev):hover {
  background-color: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}

/* Hide Default Swiper Icons Completely */
/* Use double colons (::after) and force empty content */
.custom-swiper :deep(.swiper-button-next::after),
.custom-swiper :deep(.swiper-button-prev::after) {
  content: '' !important;
  display: none !important;
}

/* Custom Pagination Dots */
.custom-swiper :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  opacity: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 6px !important;
}

.custom-swiper :deep(.swiper-pagination-bullet-active) {
  width: 32px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.custom-swiper :deep(.swiper-pagination-bullets) {
  bottom: 20px !important;
}

/* Hide navigation arrows on mobile */
@media (max-width: 768px) {
  .custom-swiper :deep(.swiper-button-next),
  .custom-swiper :deep(.swiper-button-prev) {
    display: none !important;
  }
}
</style>