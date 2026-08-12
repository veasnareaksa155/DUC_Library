<template>
  <div class="flex flex-col min-h-screen w-screen overflow-hidden transition-colors duration-350 ease-in-out" :class="themeMode === 'theme-dark' ? 'bg-[#0b0f19] text-slate-50' : themeMode === 'theme-sepia' ? 'bg-[#f2e3c6] text-[#3b2a1a]' : 'bg-slate-200 text-slate-900'">
    <!-- Top Reading Header Navigation Bar -->
    <header class="h-[60px] px-5 flex items-center justify-between bg-slate-900 border-b border-white/10 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-slate-50 max-sm:h-[52px] max-sm:px-2.5 gap-4">
      <div class="flex items-center gap-3.5 min-w-0 flex-1">
        <button @click="goBack" class="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 border border-white/15 text-slate-50 text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-indigo-500/25 hover:border-indigo-500" title="Back to Book Catalog">
          <ArrowLeft :size="16" /> <span>{{ localeStore.t('back') || 'Back' }}</span>
        </button>

        <div class="flex items-center gap-3 min-w-0">
          <span class="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[0.72rem] font-bold hidden lg:flex max-w-[120px] xl:max-w-[180px] truncate flex-shrink-0" :title="book?.category_name">{{ book?.category_name || 'General' }}</span>
          
          <div class="flex flex-col min-w-0 flex-1">
            <h1 class="text-[0.95rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px] m-0 max-sm:max-w-[120px] max-sm:text-[0.85rem]" :title="book?.title">{{ book?.title || 'Loading Book...' }}</h1>
            <span class="text-[0.75rem] text-slate-400 truncate">by {{ book?.author || 'DUC Library' }}</span>
          </div>

          <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[0.72rem] font-semibold flex-shrink-0 whitespace-nowrap" title="People reading this book online right now">
            <span class="w-[7px] h-[7px] flex-shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-[pulse_1.8s_infinite]"></span>
            <span class="hidden lg:inline-block">{{ activeReadersCount }} reading now</span>
            <span class="lg:hidden">{{ activeReadersCount }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
        <!-- Theme Mode Switcher Dropdown -->
        <div class="relative flex items-center gap-2" title="Reading Background Theme">
          <span class="text-[0.75rem] text-slate-400 hidden xl:inline-block">Theme:</span>
          
          <button 
            @click="isThemeDropdownOpen = !isThemeDropdownOpen"
            @blur="setTimeout(() => isThemeDropdownOpen = false, 200)"
            class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-full bg-white/10 border border-white/15 text-slate-50 text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-white/20"
          >
            <Moon v-if="themeMode === 'theme-dark'" :size="14" />
            <Coffee v-else-if="themeMode === 'theme-sepia'" :size="14" />
            <Sun v-else :size="14" />
            
            <span class="btn-label hidden sm:inline-block">
              {{ themeMode === 'theme-dark' ? 'Dark' : themeMode === 'theme-sepia' ? 'Sepia' : 'Light' }}
            </span>
            <ChevronDown :size="14" class="text-slate-400 transition-transform duration-200" :class="isThemeDropdownOpen ? 'rotate-180' : ''" />
          </button>

          <!-- Dropdown Menu -->
          <div 
            v-show="isThemeDropdownOpen" 
            class="absolute top-full right-0 mt-2 w-36 bg-slate-800 border border-white/15 rounded-xl shadow-xl overflow-hidden z-[100] flex flex-col py-1 animate-in fade-in slide-in-from-top-2"
          >
            <button 
              @click="themeMode = 'theme-dark'; isThemeDropdownOpen = false" 
              class="flex items-center gap-2 px-4 py-2.5 text-[0.8rem] font-semibold cursor-pointer transition-colors duration-200 text-left border-none"
              :class="themeMode === 'theme-dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-transparent text-slate-300 hover:bg-white/5'"
            >
              <Moon :size="14" /> Dark
            </button>
            <button 
              @click="themeMode = 'theme-sepia'; isThemeDropdownOpen = false" 
              class="flex items-center gap-2 px-4 py-2.5 text-[0.8rem] font-semibold cursor-pointer transition-colors duration-200 text-left border-none"
              :class="themeMode === 'theme-sepia' ? 'bg-amber-500/20 text-amber-300' : 'bg-transparent text-slate-300 hover:bg-white/5'"
            >
              <Coffee :size="14" /> Sepia
            </button>
            <button 
              @click="themeMode = 'theme-light'; isThemeDropdownOpen = false" 
              class="flex items-center gap-2 px-4 py-2.5 text-[0.8rem] font-semibold cursor-pointer transition-colors duration-200 text-left border-none"
              :class="themeMode === 'theme-light' ? 'bg-sky-500/20 text-sky-300' : 'bg-transparent text-slate-300 hover:bg-white/5'"
            >
              <Sun :size="14" /> Light
            </button>
          </div>
        </div>

        <!-- Fullscreen Toggle Button -->
        <button @click="toggleFullscreen" class="w-[34px] h-[34px] rounded-full bg-white/10 border border-white/15 text-slate-50 flex items-center justify-center cursor-pointer" title="Toggle Fullscreen">
          <Maximize2 v-if="!isFullscreen" :size="16" />
          <Minimize2 v-else :size="16" />
        </button>

        <!-- Borrow Book Action Button -->
        <button v-if="book" @click="openBorrowModal" class="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-none text-white text-[0.8rem] font-bold cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
          <BookmarkPlus :size="16" /> <span class="hidden lg:inline-block">Borrow Physical Copy</span>
        </button>
      </div>
    </header>

    <!-- Main Fullscreen Reading Area -->
    <main class="flex-1 relative overflow-hidden flex flex-col" ref="mainAreaRef">
      <!-- Loading State -->
      <div v-if="loading || pdfLoading" class="flex flex-col items-center justify-center gap-4 h-[calc(100vh-60px)] text-slate-400">
        <Loader2 :size="48" class="animate-spin text-indigo-500" />
        <p>Loading Digital PDF Reader...</p>
      </div>

      <!-- Continuous Multi-Page PDF Canvas Reader View -->
      <div 
        v-else-if="book?.pdf_url && viewMode === 'ebook'" 
        class="w-full h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden relative flex flex-col items-center px-4 pb-24 pt-6 max-sm:px-1 max-sm:pb-22 max-sm:pt-3"
        ref="pdfScrollContainerRef"
        @scroll="onPdfScroll"
      >
        <div class="flex flex-col items-center gap-7 w-full max-w-full">
          <div 
            v-for="pageNum in totalPdfPages" 
            :key="pageNum"
            :id="`pdf-page-${pageNum}`"
            class="relative rounded-[var(--radius-md)] shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-colors duration-300" 
            :class="themeMode === 'theme-dark' ? 'bg-slate-900' : 'bg-white'"
          >
            <canvas :ref="el => setCanvasRef(el, pageNum)" class="block max-w-full h-auto"></canvas>
            <div v-if="!renderedPagesSet.has(pageNum)" class="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-indigo-500">
              <Loader2 :size="32" class="animate-spin" />
            </div>
            <div class="text-center p-1.5 text-[0.72rem] text-slate-400 bg-slate-900/80">Page {{ pageNum }} of {{ totalPdfPages }}</div>
          </div>
        </div>

        <!-- Floating Reader Dock -->
        <div class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[99] flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.5)] text-slate-50 max-sm:bottom-2.5 max-sm:px-2.5 max-sm:py-1.5 max-sm:gap-1.5">
          <button @click="scrollToPage(currentPageNum - 1)" :disabled="currentPageNum <= 1" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-50 text-[0.78rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" title="Previous Page">
            <ChevronLeft :size="18" /> <span class="max-sm:hidden">Prev</span>
          </button>

          <div class="flex items-center gap-1.5 text-[0.8rem] text-slate-400">
            <span>Page</span>
            <input 
              type="text" 
              inputmode="numeric"
              pattern="[0-9]*"
              v-model.number="currentPageNum" 
              @change="scrollToPage(currentPageNum)" 
              class="w-14 px-1 text-center bg-white/10 border border-white/15 rounded-md text-slate-50 text-[0.85rem] font-bold py-1 outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            />
            <span>of {{ totalPdfPages }}</span>
          </div>

          <div class="flex items-center gap-1.5 px-2 border-l border-r border-white/10">
            <button @click="zoomOut" class="bg-transparent border-none text-slate-400 cursor-pointer hover:text-slate-200" title="Zoom Out"><ZoomOut :size="16" /></button>
            <span @click="resetZoom" class="text-[0.75rem] font-bold text-sky-400 cursor-pointer" title="Reset Zoom">{{ Math.round(pdfScale * 100) }}%</span>
            <button @click="zoomIn" class="bg-transparent border-none text-slate-400 cursor-pointer hover:text-slate-200" title="Zoom In"><ZoomIn :size="16" /></button>
          </div>

          <button @click="scrollToPage(currentPageNum + 1)" :disabled="currentPageNum >= totalPdfPages" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-50 text-[0.78rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-indigo-500 to-purple-500 border-none" title="Next Page">
            <span class="max-sm:hidden">Next</span> <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <!-- Original Raw PDF Iframe View Fallback -->
      <div v-else-if="book?.pdf_url && viewMode === 'raw'" class="w-full h-[calc(100vh-60px)]">
        <iframe 
          :src="pdfUrlFormatted" 
          class="w-full h-full border-none" 
          title="Digital PDF Reader"
        ></iframe>
      </div>

      <!-- Premium Physical Book Information Notice -->
      <div v-else class="flex items-center justify-center p-8 h-full relative overflow-hidden" :class="themeMode === 'theme-dark' ? 'bg-[#050811]' : themeMode === 'theme-light' ? 'bg-slate-50' : 'bg-[#eadeb5]'">
        
        <!-- Background Blur Effect using Book Cover -->
        <div v-if="book?.cover_url" class="absolute inset-0 z-0 opacity-20 blur-[100px] scale-110 pointer-events-none transition-all duration-1000" :style="`background: url(${book.cover_url}) center/cover no-repeat;`"></div>

        <div class="relative z-10 w-full max-w-[850px] flex max-md:flex-col items-center gap-12 p-10 rounded-[2.5rem] border transition-all duration-300"
             :class="themeMode === 'theme-dark' ? 'bg-slate-900/60 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)]' : themeMode === 'theme-light' ? 'bg-white/70 border-slate-200 shadow-[0_30px_60px_rgba(0,0,0,0.1)]' : 'bg-[#f5ebd2]/70 border-[#d1bd8e] shadow-[0_30px_60px_rgba(100,80,50,0.15)]'" style="backdrop-filter: blur(20px);">
          
          <!-- Book Cover with 3D Float Effect -->
          <div class="relative shrink-0 perspective-1000 max-md:mt-4">
            <div class="w-[220px] h-[320px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-book-float group relative border border-white/10">
              <img v-if="book?.cover_url" :src="book.cover_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Book Cover" />
              <div v-else class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <BookOpen :size="64" class="opacity-50" />
              </div>
              <!-- Glare effect -->
              <div class="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none mix-blend-overlay"></div>
            </div>
            <!-- Ground Shadow -->
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[180px] h-[12px] bg-black/40 rounded-[100%] blur-md animate-shadow-pulse"></div>
          </div>

          <div class="flex-1 text-center md:text-left flex flex-col items-center md:items-start w-full">
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-5" :class="themeMode === 'theme-dark' ? 'bg-white/10 text-slate-300 border border-white/10' : 'bg-slate-200 text-slate-700 border border-slate-300'">
              <Library :size="14" />
              <span class="text-[0.75rem] font-bold tracking-wider uppercase">Physical Collection</span>
            </div>
            
            <h2 class="text-[2.5rem] font-extrabold mb-3 leading-tight max-sm:text-[2rem]" :class="themeMode === 'theme-dark' ? 'text-white' : 'text-slate-900'">
              {{ book?.title }}
            </h2>
            
            <p class="text-[1.05rem] leading-relaxed mb-8 max-w-[450px]" :class="themeMode === 'theme-dark' ? 'text-slate-400' : 'text-slate-600'">
              This is a premium physical book in our library. Reserve your copy online and pick it up from the front desk today!
            </p>

            <div class="w-full h-[1px] mb-8" :class="themeMode === 'theme-dark' ? 'bg-gradient-to-r from-transparent via-white/15 to-transparent md:via-white/15 md:to-transparent' : 'bg-gradient-to-r from-transparent via-slate-300 to-transparent md:via-slate-300 md:to-transparent'"></div>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 w-full mb-8">
              <div class="flex items-center gap-4 px-5 py-3.5 rounded-2xl border" :class="themeMode === 'theme-dark' ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'">
                <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="book?.copies_available > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'">
                  <PackageCheck v-if="book?.copies_available > 0" :size="24" />
                  <PackageX v-else :size="24" />
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-[0.75rem] font-bold uppercase tracking-wider" :class="themeMode === 'theme-dark' ? 'text-slate-500' : 'text-slate-500'">Status</span>
                  <span class="text-[1.2rem] font-extrabold" :class="book?.copies_available > 0 ? 'text-emerald-500' : 'text-rose-500'">
                    {{ book?.copies_available > 0 ? 'Available' : 'Out of Stock' }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center gap-4 px-5 py-3.5 rounded-2xl border" :class="themeMode === 'theme-dark' ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'">
                <div class="flex flex-col text-left">
                  <span class="text-[0.75rem] font-bold uppercase tracking-wider" :class="themeMode === 'theme-dark' ? 'text-slate-500' : 'text-slate-500'">Copies Left</span>
                  <span class="text-[1.2rem] font-extrabold" :class="themeMode === 'theme-dark' ? 'text-slate-200' : 'text-slate-800'">
                    {{ book?.copies_available || 0 }} <span class="text-slate-500 text-[1rem] font-semibold">/ {{ book?.copies_total || 0 }}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap justify-center md:justify-start gap-4 w-full">
              <button @click="goBack" class="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1" :class="themeMode === 'theme-dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'">
                <ArrowLeft :size="18" /> Go Back
              </button>
              <button @click="openBorrowModal" :disabled="book?.copies_available <= 0" class="flex-[2] sm:flex-none flex justify-center items-center gap-2 px-8 py-4 rounded-xl text-white font-bold transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_20px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none" style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);">
                <BookmarkPlus :size="18" /> Reserve Physical Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Borrow Request Modal -->
    <BorrowModal 
      :is-open="isBorrowOpen" 
      :book="book" 
      @close="isBorrowOpen = false"
      @success="handleBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import BorrowModal from '../components/BorrowModal.vue';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Moon, Coffee, Sun, 
  Maximize2, Minimize2, BookmarkPlus, Loader2, BookOpen, 
  PackageCheck, PackageX, Library, ZoomIn, ZoomOut, ChevronDown 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const booksStore = useBooksStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();

const book = ref(null);
const loading = ref(true);
const viewMode = ref('ebook');
const themeMode = ref('theme-dark');
const isThemeDropdownOpen = ref(false);
const isFullscreen = ref(false);
const isBorrowOpen = ref(false);
const mainAreaRef = ref(null);

// Continuous Multi-Page PDF State
const pdfDoc = shallowRef(null);
const currentPageNum = ref(1);
const totalPdfPages = ref(0);
const pdfScale = ref(1.25);
const pdfLoading = ref(false);
const pdfError = ref(null);
const canvasRefsMap = new Map();
const renderedPagesSet = ref(new Set());
const pdfScrollContainerRef = ref(null);

let sessionId = sessionStorage.getItem('reader_session_id');
if (!sessionId) {
  sessionId = 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
  sessionStorage.setItem('reader_session_id', sessionId);
}
const activeReadersCount = ref(1);
let heartbeatTimer = null;

const pdfUrlFormatted = computed(() => {
  if (!book.value?.pdf_url) return '';
  const url = book.value.pdf_url;
  if (url.includes('#')) return url;
  return `${url}#toolbar=1&navpanes=0&view=FitH`;
});

function setCanvasRef(el, pageNum) {
  if (el) {
    canvasRefsMap.set(pageNum, el);
  } else {
    canvasRefsMap.delete(pageNum);
  }
}

function loadPdfJsScript() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

async function renderPdfPageByNumber(pageNum) {
  if (!pdfDoc.value || pageNum < 1 || pageNum > totalPdfPages.value) return;
  if (renderedPagesSet.value.has(pageNum)) return;

  const canvas = canvasRefsMap.get(pageNum);
  if (!canvas) return;

  try {
    const page = await pdfDoc.value.getPage(pageNum);
    const context = canvas.getContext('2d');
    
    let scale = pdfScale.value;
    if (window.innerWidth <= 640) {
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      scale = Math.min(1.5, (window.innerWidth - 24) / unscaledViewport.width);
    }

    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + 'px';
    canvas.style.height = Math.floor(viewport.height) + 'px';

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    renderedPagesSet.value.add(pageNum);
  } catch (err) {
    console.error(`PDF page ${pageNum} render error:`, err);
  }
}

async function renderAllPdfPagesSequential() {
  if (!pdfDoc.value) return;
  renderedPagesSet.value.clear();
  
  // Render first 3 pages immediately
  for (let i = 1; i <= Math.min(3, totalPdfPages.value); i++) {
    await renderPdfPageByNumber(i);
  }
  
  // Progressively render remaining pages
  for (let i = 4; i <= totalPdfPages.value; i++) {
    renderPdfPageByNumber(i);
  }
}

function onPdfScroll() {
  if (!pdfDoc.value || totalPdfPages.value === 0) return;
  
  for (let pageNum = 1; pageNum <= totalPdfPages.value; pageNum++) {
    const pageEl = document.getElementById(`pdf-page-${pageNum}`);
    if (pageEl) {
      const rect = pageEl.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 3) {
        currentPageNum.value = pageNum;
        renderPdfPageByNumber(pageNum);
        if (pageNum + 1 <= totalPdfPages.value) {
          renderPdfPageByNumber(pageNum + 1);
        }
        break;
      }
    }
  }
}

function scrollToPage(targetPage) {
  if (targetPage < 1 || targetPage > totalPdfPages.value) return;
  currentPageNum.value = targetPage;
  const pageEl = document.getElementById(`pdf-page-${targetPage}`);
  if (pageEl) {
    pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderPdfPageByNumber(targetPage);
  }
}

async function zoomIn() {
  if (pdfScale.value < 2.5) {
    pdfScale.value = parseFloat((pdfScale.value + 0.15).toFixed(2));
    renderedPagesSet.value.clear();
    await nextTick();
    renderAllPdfPagesSequential();
  }
}

async function zoomOut() {
  if (pdfScale.value > 0.6) {
    pdfScale.value = parseFloat((pdfScale.value - 0.15).toFixed(2));
    renderedPagesSet.value.clear();
    await nextTick();
    renderAllPdfPagesSequential();
  }
}

async function resetZoom() {
  pdfScale.value = 1.25;
  renderedPagesSet.value.clear();
  await nextTick();
  renderAllPdfPagesSequential();
}

async function initPdfReader(url) {
  if (!url) return;
  pdfLoading.value = true;
  pdfError.value = null;
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('PDF.js canvas render timeout')), 5000)
  );

  try {
    const pdfjs = await loadPdfJsScript();
    const loadingTask = pdfjs.getDocument({
      url: url,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true
    });
    
    pdfDoc.value = await Promise.race([loadingTask.promise, timeoutPromise]);
    totalPdfPages.value = pdfDoc.value.numPages;
    currentPageNum.value = 1;

    pdfLoading.value = false;
    await nextTick();
    await renderAllPdfPagesSequential();
  } catch (err) {
    console.warn('PDF.js loading error, falling back to raw iframe:', err);
    pdfError.value = err.message || 'Failed to render PDF canvas';
    viewMode.value = 'raw';
  } finally {
    pdfLoading.value = false;
  }
}

async function sendReadingPing(isInitial = false) {
  if (!book.value?.id) return;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/books/${book.value.id}/read-ping`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ session_id: sessionId })
    });
    if (res.ok) {
      const data = await res.json();
      activeReadersCount.value = data.active_readers_count || 1;
    }
  } catch (err) {
    console.error('Reading heartbeat ping error:', err);
  }
}

async function sendReadingLeave() {
  if (!book.value?.id || !sessionId) return;
  try {
    const url = `${import.meta.env.VITE_API_URL || ''}/api/books/${book.value.id}/read-leave`;
    const data = JSON.stringify({ session_id: sessionId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
    } else {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true
      });
    }
  } catch (err) {
    console.error('Reading leave error:', err);
  }
}

const handleBeforeUnload = () => {
  sendReadingLeave();
};

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  try {
    const bookId = route.params.id;
    book.value = await booksStore.fetchBookById(bookId);
    if (book.value?.id) {
      await sendReadingPing(true);
      heartbeatTimer = setInterval(() => sendReadingPing(false), 25000);
      
      if (book.value.pdf_url) {
        initPdfReader(book.value.pdf_url);
      }
    }
  } catch (err) {
    console.error('Failed to load book for reading:', err);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  sendReadingLeave();
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}

function openBorrowModal() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  isBorrowOpen.value = true;
}

function handleBorrowSuccess(msg) {
  isBorrowOpen.value = false;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen error:', err);
    });
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    isFullscreen.value = false;
  }
}
</script>

<style scoped>
@keyframes book-float {
  0%, 100% { transform: translateY(0) rotateX(5deg) rotateY(-5deg); }
  50% { transform: translateY(-15px) rotateX(12deg) rotateY(-8deg); }
}
@keyframes shadow-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.4; }
  50% { transform: translateX(-50%) scale(0.85); opacity: 0.2; }
}
.animate-book-float {
  animation: book-float 6s ease-in-out infinite;
}
.animate-shadow-pulse {
  animation: shadow-pulse 6s ease-in-out infinite;
}
.perspective-1000 {
  perspective: 1000px;
}
</style>
