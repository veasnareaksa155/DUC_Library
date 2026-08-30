<template>
<main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none print:w-full print:p-0 print:m-0 print:block">
      <header class="mb-10 flex flex-col gap-2 print:hidden relative">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div class="absolute top-10 right-20 w-60 h-60 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div class="flex items-center gap-3 text-indigo-500 mb-1 z-10 relative">
          <BookOpen :size="30" class="p-2 bg-indigo-500/10 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.2)] border border-indigo-500/20" />
          <h1 class="text-[2.5rem] font-extrabold tracking-tight text-[var(--text-primary)]">Digital Reads <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Monitor</span></h1>
        </div>
        <p class="text-[1rem] text-[var(--text-secondary)] max-w-2xl leading-relaxed z-10 relative font-medium">Real-time telemetry and historical analytics for digital reading sessions.</p>
      </header>

      <div class="hidden print:flex flex-row items-start w-full mb-10 pb-4 relative">
        <div class="flex flex-col items-center min-w-[280px]">
          <img src="/duc-logo.png" alt="DUC Logo" class="h-[95px] w-auto mb-3" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
          <span class="text-[16px] text-black" style="font-family: 'Moul', serif;">សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</span>
          <span class="text-[16px] text-black mt-1.5" style="font-family: 'Moul', serif;">បណ្ណាល័យសិក្សា</span>
        </div>
        <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pt-1">
          <span class="text-[19px] text-black tracking-wide" style="font-family: 'Moul', serif;">ព្រះរាជាណាចក្រកម្ពុជា</span>
          <span class="text-[18px] text-black tracking-widest mt-2" style="font-family: 'Moul', serif; z-index: 2;">ជាតិ សាសនា ព្រះមហាក្សត្រ</span>
          <img src="/khmer-ornament.png" alt="Tact" class="h-[60px] opacity-90" style="margin-top: -15px; transform: rotate(-1deg); z-index: 1;" />
        </div>
      </div>

      <div class="hidden print:flex flex-col items-center justify-center w-full mb-6 mt-4">
        <h2 class="text-[16px] text-black tracking-wide" style="font-family: 'Moul', serif;">របាយការណ៍សិស្សអានសៀវភៅឌីជីថល</h2>
        <p class="text-[1rem] text-black mt-2 font-bold">ការបរិច្ឆេទ៖ {{ printDateText }}</p>
      </div>



      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 print:hidden relative z-10">
        <div class="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
            <Activity :size="24" />
          </div>
          <div class="flex flex-col">
            <span class="text-[0.8rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Sessions</span>
            <span class="text-[1.8rem] font-black text-[var(--text-primary)] leading-tight">{{ historicalReads.length }}</span>
          </div>
        </div>
        <div class="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-[0_8px_30px_rgba(16,185,129,0.06)] flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/30 text-emerald-500 relative">
            <span class="absolute inline-flex h-full w-full rounded-2xl bg-emerald-400 opacity-20 animate-ping"></span>
            <Users :size="24" />
          </div>
          <div class="flex flex-col relative z-10">
            <span class="text-[0.8rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Now</span>
            <span class="text-[1.8rem] font-black text-[var(--text-primary)] leading-tight flex items-baseline gap-2">
              {{ borrowingsStore.dashboardStats?.active_readers_count || liveReads.length }} <span class="text-[0.85rem] font-medium text-emerald-500 tracking-normal">reading</span>
            </span>
          </div>
        </div>
        <div class="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center border border-purple-500/20 text-purple-500">
            <Clock :size="24" />
          </div>
          <div class="flex flex-col">
            <span class="text-[0.8rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Avg Duration</span>
            <span class="text-[1.8rem] font-black text-[var(--text-primary)] leading-tight">{{ formatDuration(averageDuration) }}</span>
          </div>
        </div>
      </div>

      <div class="mb-12 print:hidden relative z-10">
        <h2 class="text-[1.4rem] font-extrabold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
          <span class="relative flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          </span>
          Live Sessions
        </h2>
        
        <div v-if="liveReads.length === 0" class="bg-[var(--bg-card)]/50 backdrop-blur-md border border-dashed border-[var(--border-color)] rounded-[2rem] p-12 text-center shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)]">
          <div class="w-20 h-20 bg-gray-500/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)] text-[var(--text-muted)]">
            <MonitorOff :size="32" />
          </div>
          <p class="text-[1.1rem] font-bold text-[var(--text-primary)]">No active sessions</p>
          <p class="text-[0.95rem] text-[var(--text-muted)] mt-1">Students will appear here instantly when they open a digital book.</p>
        </div>
        
        <div v-else class="flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="live in paginatedLiveReads" :key="live.session_id" class="group bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.1)] hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden flex flex-col">
            <div class="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            
            <div class="flex items-center gap-4 mb-6">
              <div class="relative">
                <div class="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 scale-150"></div>
                <div class="absolute inset-0 bg-emerald-500 rounded-full animate-pulse opacity-30 scale-125 delay-150"></div>
                <div class="w-14 h-14 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--border-color)] overflow-hidden flex items-center justify-center font-bold text-[1.2rem] shrink-0 relative z-10 shadow-lg group-hover:border-indigo-500/50 transition-colors duration-300">
                  <img v-if="live.user_photo" :src="live.user_photo" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full [background-image:var(--accent-gradient)] text-white flex items-center justify-center">
                    {{ (live.user_name_khmer || live.user_name)?.charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span class="font-black text-[1.1rem] text-[var(--text-primary)] truncate" :style="live.user_name_khmer ? 'font-family: \'Kantumruy Pro\', sans-serif;' : ''">{{ live.user_name_khmer || live.user_name }}</span>
                <span class="text-[0.85rem] font-bold text-[var(--text-muted)] truncate flex items-center gap-2">
                  <template v-if="live.user_major">
                    <span class="text-indigo-500">{{ live.user_major }}</span>
                    <span class="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                  </template>
                  <template v-if="live.user_class">
                    <span>{{ live.user_class }}</span>
                    <span class="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                  </template>
                  <span :class="live.user_gender?.toUpperCase() === 'F' || live.user_gender === 'ស្រី' || live.user_gender?.toUpperCase() === 'FEMALE' ? 'text-pink-500' : 'text-blue-500'">
                    {{ live.user_gender === 'M' || live.user_gender?.toUpperCase() === 'MALE' ? 'ប្រុស' : (live.user_gender === 'F' || live.user_gender?.toUpperCase() === 'FEMALE' ? 'ស្រី' : (live.user_gender || 'N/A')) }}
                  </span>
                </span>
              </div>
            </div>
            
            <div class="bg-[var(--bg-primary)]/50 rounded-2xl p-4 border border-[var(--border-color)]/50 flex items-start gap-4 flex-1">
              <img v-if="live.book_cover" :src="live.book_cover" class="w-12 h-16 object-cover rounded-lg shadow-md shrink-0 border border-[var(--border-color)]" />
              <div v-else class="w-12 h-16 rounded-lg bg-gray-500/10 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                <BookOpen :size="20" />
              </div>
              <div class="flex flex-col flex-1 min-w-0 justify-between h-full">
                <div class="font-bold text-[0.95rem] text-[var(--text-primary)] leading-snug line-clamp-2" :title="live.book_title">{{ live.book_title }}</div>
                <div class="mt-2 flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <Timer :size="14" class="animate-pulse" />
                  <span class="text-[0.85rem] font-black tabular-nums tracking-wide">{{ formatLiveDuration(Math.max(0, Math.round((now - new Date(live.start_time).getTime()) / 1000))) }}</span>
                </div>
              </div>
            </div>
          </div>
          </div>
          
          <div v-if="liveTotalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--bg-card)]/50 backdrop-blur-md rounded-2xl p-4 border border-[var(--border-color)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div class="text-[0.85rem] text-[var(--text-muted)] font-bold tracking-wide uppercase">
              Showing <span class="text-[var(--text-primary)]">{{ (liveCurrentPage - 1) * liveItemsPerPage + 1 }}</span> to <span class="text-[var(--text-primary)]">{{ Math.min(liveCurrentPage * liveItemsPerPage, liveReads.length) }}</span> of {{ liveReads.length }}
            </div>
            <div class="flex items-center gap-2">
              <button @click="liveCurrentPage--" :disabled="liveCurrentPage === 1" class="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed hover:not(:disabled):border-indigo-500/50 hover:not(:disabled):text-indigo-500 shadow-sm"><ChevronLeft :size="18" /></button>
              <button v-for="page in liveVisiblePages" :key="page" @click="liveCurrentPage = page" class="w-9 h-9 rounded-xl flex items-center justify-center text-[0.9rem] font-black transition-all duration-300 cursor-pointer shadow-sm" :class="liveCurrentPage === page ? 'text-white [background:var(--accent-gradient)] border-transparent' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-indigo-500/30'">{{ page }}</button>
              <button @click="liveCurrentPage++" :disabled="liveCurrentPage >= liveTotalPages" class="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed hover:not(:disabled):border-indigo-500/50 hover:not(:disabled):text-indigo-500 shadow-sm"><ChevronRight :size="18" /></button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden relative z-10">
        <h2 class="text-[1.4rem] font-extrabold text-[var(--text-primary)] flex items-center gap-3">
          <History :size="24" class="text-indigo-500" />
          Reading History
        </h2>
        
        <div class="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
          
          <!-- Segmented Timeframe Toggle -->
          <div class="flex items-center p-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <button @click="filterTimeframe = 'All'" :class="filterTimeframe === 'All' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'" class="px-5 py-1.5 rounded-lg text-[0.85rem] font-extrabold transition-all duration-300">All</button>
            <button @click="filterTimeframe = 'Today'" :class="filterTimeframe === 'Today' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'" class="px-4 py-1.5 rounded-lg text-[0.85rem] font-extrabold transition-all duration-300">Today</button>
          </div>

          <!-- Select Year -->
          <div class="relative w-36">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
              <CalendarDays :size="16" />
            </div>
            <select v-model="selectedYear" @change="selectedMonth = 'all'" :disabled="filterTimeframe === 'Today'" class="w-full appearance-none bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] pl-9 pr-8 py-2.5 rounded-xl text-[0.85rem] font-extrabold transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="all">Select Year</option>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
          </div>

          <!-- Select Month -->
          <div class="relative w-32">
            <select v-model="selectedMonth" :disabled="filterTimeframe === 'Today' || selectedYear === 'all'" class="w-full appearance-none bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] pl-4 pr-8 py-2.5 rounded-xl text-[0.85rem] font-extrabold transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="all">All Months</option>
              <option v-for="month in availableMonthsForYear" :key="month.value" :value="month.value">{{ month.label }}</option>
            </select>
            <ChevronDown :size="14" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
          </div>

          <div class="relative flex-1 sm:w-64">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search :size="18" class="text-[var(--text-muted)]" />
            </div>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search student or book..." 
              class="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[0.9rem] font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          <button @click="printReport" class="flex items-center gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-2.5 rounded-xl font-bold text-[0.88rem] transition-all shadow-sm cursor-pointer whitespace-nowrap hover:border-indigo-500/30 hover:text-indigo-500">
            <Printer :size="18" />
            <span class="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>
      
      <div class="bg-[var(--bg-card)]/80 backdrop-blur-xl border-[var(--border-color)] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border rounded-[2rem] flex flex-col transition-all duration-300 print:mt-0 print:border-none print:shadow-none print:rounded-none print:block print:overflow-visible relative z-10 print:bg-transparent">
        
        <div v-if="loading && historicalReads.length === 0" class="w-full p-16 flex flex-col items-center justify-center text-[var(--text-muted)]">
          <Loader2 :size="36" class="animate-spin text-indigo-500 mb-4" />
          <p class="font-bold text-[1.1rem]">Loading analytics...</p>
        </div>

        <div v-else class="overflow-x-auto print:overflow-visible pb-4">
          <table class="w-full text-left min-w-[900px] print-clean-table" style="font-family: 'Siemreap', sans-serif;">
            <thead class="bg-[var(--bg-primary)] border-b border-[var(--border-color)] print:bg-slate-100">
              <tr class="text-[var(--text-muted)] text-[0.75rem] font-black uppercase tracking-[0.1em] border-b border-[var(--border-color)] print:text-black print:font-bold" style="font-family: 'Outfit', 'Kantumruy Pro', sans-serif; font-weight: 700;">
                <th class="px-8 py-5 whitespace-nowrap print:!text-[16px]">អត្តសញ្ញាណសិស្ស</th>
                <th class="px-6 py-5 whitespace-nowrap print:!text-[16px]">ភេទ</th>
                <th class="px-6 py-5 whitespace-nowrap print:!text-[16px]">ព័ត៌មានការសិក្សា</th>
                <th class="px-6 py-5 whitespace-nowrap w-1/3 print:!text-[16px]">សៀវភៅដែលបានអាន</th>
                <th class="px-6 py-5 whitespace-nowrap print:!text-[16px]">កាលបរិច្ឆេទ</th>
                <th class="px-8 py-5 whitespace-nowrap text-right cursor-pointer hover:bg-gray-500/5 transition-colors select-none group print:!text-[16px]" @click="toggleSortDuration">
                  <div class="flex items-center justify-end gap-2">
                    <span class="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity print:hidden">
                      <ChevronUp v-if="sortDurationDir === 'asc'" :size="14" class="text-indigo-500 font-bold" />
                      <ChevronDown v-else-if="sortDurationDir === 'desc'" :size="14" class="text-indigo-500 font-bold" />
                      <ArrowDownUp v-else :size="14" class="text-[var(--text-muted)]" />
                    </span>
                    <span>រយៈពេល</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]/50">
              <tr v-for="item in (isPrinting ? filteredReads : paginatedReads)" :key="item.id" class="group hover:bg-[var(--bg-primary)]/50 transition-colors duration-300 print:break-inside-avoid">
                <td class="px-8 py-4 print:py-2">
                  <div class="flex items-center gap-4">
                    <div class="w-11 h-11 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center font-bold text-[1.1rem] shadow-sm shrink-0 print:hidden">
                      <img v-if="item.user_photo" :src="item.user_photo" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full [background-image:var(--accent-gradient)] text-white flex items-center justify-center">
                        {{ (item.user_name_khmer || item.user_name)?.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-black text-[1rem] text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors print:!text-[15px] print:font-bold print:text-black">{{ item.user_name_khmer || item.user_name }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-[0.9rem] font-bold text-[var(--text-primary)] print:!text-[15px]" :class="item.user_gender?.toUpperCase() === 'F' || item.user_gender === 'ស្រី' || item.user_gender?.toUpperCase() === 'FEMALE' ? 'text-pink-500' : 'text-blue-500'">
                    {{ item.user_gender === 'M' || item.user_gender?.toUpperCase() === 'MALE' ? 'ប្រុស' : (item.user_gender === 'F' || item.user_gender?.toUpperCase() === 'FEMALE' ? 'ស្រី' : (item.user_gender || 'N/A')) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1.5">
                    <span v-if="item.user_major" class="text-[0.7rem] font-black tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase w-fit print:!text-[15px]">{{ item.user_major }}</span>
                    <span v-if="item.user_class" class="text-[0.75rem] font-bold text-[var(--text-secondary)] px-2 py-0.5 bg-gray-500/10 rounded-md uppercase w-fit print:!text-[15px]">{{ item.user_class }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-start gap-4">
                    <img v-if="item.book_cover" :src="item.book_cover" class="w-10 h-14 object-cover rounded-md shadow-sm shrink-0 border border-[var(--border-color)]" />
                    <div v-else class="w-10 h-14 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                      <BookOpen :size="16" />
                    </div>
                    <span class="font-bold text-[0.95rem] text-[var(--text-primary)] pt-1 leading-snug line-clamp-2 print:!text-[15px]">{{ item.book_title }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1 text-[0.88rem] print:!text-[15px]">
                    <span class="font-bold text-[var(--text-primary)]">{{ formatDate(item.start_time) }}</span>
                    <span class="text-[var(--text-muted)] font-medium text-[0.8rem] flex items-center gap-1.5 print:!text-[15px]"><Clock :size="12"/>{{ formatTime(item.start_time) }}</span>
                  </div>
                </td>
                <td class="px-8 py-4 text-right">
                  <span class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg font-black text-[0.88rem] border shadow-sm tracking-wide tabular-nums print:bg-transparent print:border-none print:shadow-none print:text-black print:p-0 print:!text-[15px]"
                        :class="getDurationBadgeClass(item.duration_seconds)">
                    {{ formatDuration(item.duration_seconds) }}
                  </span>
                </td>
              </tr>
              <tr v-if="paginatedReads.length === 0 && !loading">
                <td colspan="6" class="px-6 py-20 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="w-16 h-16 bg-gray-500/5 rounded-full flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] mb-4">
                      <Search :size="24" />
                    </div>
                    <p class="font-extrabold text-[1.2rem] text-[var(--text-primary)]">No reading logs found</p>
                    <p class="text-[0.95rem] text-[var(--text-muted)] mt-1 max-w-sm">Try adjusting your search criteria or wait for active sessions to finish.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Print Summary Box (Bottom) -->
        <div class="hidden print:flex w-full justify-end mt-6 mb-4 px-4">
          <div class="flex flex-col min-w-[500px] border border-slate-300 rounded-lg overflow-hidden" style="font-family: 'Outfit', 'Kantumruy Pro', sans-serif; page-break-inside: avoid;">
            <div class="flex justify-between items-center w-full px-5 py-3 border-b border-slate-200 bg-white">
              <div class="flex flex-col">
                <span class="text-slate-600 font-bold text-[12px]">រយៈពេលដែលអានយូរជាងគេ (Longest Reading Time)</span>
                <span v-if="printLongestReader" class="text-slate-500 text-[11px] mt-0.5">{{ printLongestReader.user_name }} ({{ printLongestReader.user_gender === 'M' ? 'ប្រុស' : printLongestReader.user_gender === 'F' ? 'ស្រី' : 'N/A' }}) - {{ printLongestReader.user_class }}</span>
                <span v-if="printLongestReader" class="text-slate-500 text-[10px]">{{ printLongestReader.book_title }}</span>
              </div>
              <span class="text-[14px] font-extrabold text-slate-800">{{ printLongestReader ? formatDuration(printLongestReader.duration_seconds) : '-' }}</span>
            </div>
            <div class="flex justify-between items-center w-full px-5 py-3 border-b border-slate-200 bg-white">
              <div class="flex flex-col">
                <span class="text-slate-600 font-bold text-[12px]">រយៈពេលដែលអានខ្លីជាងគេ (Shortest Reading Time)</span>
                <span v-if="printShortestReader" class="text-slate-500 text-[11px] mt-0.5">{{ printShortestReader.user_name }} ({{ printShortestReader.user_gender === 'M' ? 'ប្រុស' : printShortestReader.user_gender === 'F' ? 'ស្រី' : 'N/A' }}) - {{ printShortestReader.user_class }}</span>
                <span v-if="printShortestReader" class="text-slate-500 text-[10px]">{{ printShortestReader.book_title }}</span>
              </div>
              <span class="text-[14px] font-extrabold text-slate-800">{{ printShortestReader ? formatDuration(printShortestReader.duration_seconds) : '-' }}</span>
            </div>
            <div class="flex justify-between items-center w-full px-5 py-3.5 bg-slate-800 text-white" style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <span class="font-extrabold uppercase tracking-wide text-[13px]">ចំនួនសិស្សអានសរុប (Total Sessions)</span>
              <span class="text-[16px] font-black">{{ printTotalSessions }}</span>
            </div>
          </div>
        </div>

        <!-- Print Footer / Signature Block (Hidden except when printing) -->
        <div class="hidden print:flex w-full justify-between mt-12 px-12 text-[16px] text-black print:text-black" style="font-family: 'Siemreap', sans-serif; page-break-inside: avoid;">
          <div class="flex flex-col items-center justify-end">
            <div>អ្នកត្រួតពិនិត្យ</div>
          </div>
          <div class="flex flex-col items-center">
            <div class="mb-2">{{ currentLunarDate }}</div>
            <div class="mb-8">កំពង់ស្ពឺ {{ currentGregorianDate }}</div>
            <div>អ្នកធ្វើរបាយការណ៍</div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-[var(--border-color)] print:hidden">
          <div class="flex items-center gap-6">
            <div class="text-[0.85rem] text-[var(--text-muted)] font-bold tracking-wide uppercase">
              Showing <span class="text-[var(--text-primary)]">{{ filteredReads.length > 0 ? (currentPage - 1) * computedItemsPerPage + 1 : 0 }}</span> to <span class="text-[var(--text-primary)]">{{ Math.min(currentPage * computedItemsPerPage, filteredReads.length) }}</span> of {{ filteredReads.length }}
            </div>
            <div class="flex items-center gap-2 text-[0.85rem] font-bold text-[var(--text-muted)]">
              Rows:
              <select v-model="itemsPerPage" @change="currentPage = 1" class="bg-transparent border border-[var(--border-color)] rounded-lg px-2 py-1 text-[var(--text-primary)] font-black outline-none cursor-pointer hover:border-indigo-500/50 transition-colors">
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2" v-if="totalPages > 1">
            <button @click="currentPage--" :disabled="currentPage === 1" class="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed hover:not(:disabled):border-indigo-500/50 hover:not(:disabled):text-indigo-500 shadow-sm"><ChevronLeft :size="18" /></button>
            <button v-for="page in visiblePages" :key="page" @click="currentPage = page" class="w-9 h-9 rounded-xl flex items-center justify-center text-[0.9rem] font-black transition-all duration-300 cursor-pointer shadow-sm" :class="currentPage === page ? 'text-white [background:var(--accent-gradient)] border-transparent' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-indigo-500/30'">{{ page }}</button>
            <button @click="currentPage++" :disabled="currentPage >= totalPages" class="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed hover:not(:disabled):border-indigo-500/50 hover:not(:disabled):text-indigo-500 shadow-sm"><ChevronRight :size="18" /></button>
          </div>
        </div>
      </div>
    </main>
</template>

<style scoped>
@media print {
  @page {
    size: landscape;
    margin: 12mm;
    @bottom-right {
      content: "ទំព័រទី " counter(page) " នៃ " counter(pages);
      font-family: 'Siemreap', sans-serif !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      color: #4f46e5 !important;
    }
  }
  body { background: white !important; color: black !important; }
  .bg-\[var\(--bg-card\)\] { background: transparent !important; box-shadow: none !important; border: none !important; }
  
  /* Reset some default table print styles */
  table { 
    width: 100% !important; 
    border-collapse: collapse !important;
    border-spacing: 0 !important;
  }
  
  .print-clean-table {
    min-width: 0 !important;
    width: 100% !important;
    border-collapse: collapse !important;
    margin-top: 15px;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px !important;
    overflow: hidden;
  }
  
  .print-clean-table th,
  .print-clean-table td {
    border: 1px solid #cbd5e1 !important;
    padding: 10px 14px !important;
    color: #000000 !important;
    vertical-align: middle !important;
    font-family: 'Kantumruy Pro', 'Siemreap', sans-serif !important;
  }
  
  .print-clean-table td * {
    color: #000000 !important;
  }
  
  .print-clean-table th {
    background-color: #0f172a !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .print-clean-table tr {
    page-break-inside: avoid !important;
  }
  
  .print-clean-table tr:nth-child(even) {
    background-color: transparent !important;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { toKhmerLunarDate } from 'khmer-chhankitek-calendar';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import { useBorrowingsStore } from '../../stores/borrowings';
import { BookOpen, ChevronLeft, ChevronRight, Printer, Activity, Users, Clock, History, Search, Timer, Loader2, MonitorOff, ChevronDown, CalendarDays, ChevronUp, ArrowDownUp } from 'lucide-vue-next';

const authStore = useAuthStore();
const toastStore = useToastStore();
const borrowingsStore = useBorrowingsStore();

const historicalReads = ref([]);
const liveReads = ref([]);
const loading = ref(false);
const now = ref(Date.now());
const searchQuery = ref('');
const filterTimeframe = ref('All'); // 'All' | 'Today'
const selectedYear = ref('all');
const selectedMonth = ref('all');
const sortDurationDir = ref(null); // null, 'desc', 'asc'
let liveTimer = null;
let clockTimer = null;

const toggleSortDuration = () => {
  if (sortDurationDir.value === null) {
    sortDurationDir.value = 'desc'; // Highest duration first
  } else if (sortDurationDir.value === 'desc') {
    sortDurationDir.value = 'asc';
  } else {
    sortDurationDir.value = null; // Reset to default (date)
  }
};

const isPrinting = ref(false);

const printReport = async () => {
  isPrinting.value = true;
  await nextTick();
  setTimeout(() => {
    window.print();
    isPrinting.value = false;
  }, 150);
};

const currentPage = ref(1);
const itemsPerPage = ref(15);
const liveCurrentPage = ref(1);
const liveItemsPerPage = ref(12);

const handleRefresh = () => {
  fetchLiveReads();
  fetchHistoricalReads();
};

onMounted(() => {
  fetchHistoricalReads();
  fetchLiveReads();
  liveTimer = setInterval(() => {
    fetchLiveReads();
    fetchHistoricalReads();
  }, 10000); // Check live and historical readers every 10s
  clockTimer = setInterval(() => { now.value = Date.now(); }, 1000); // Update the real-time clock every 1s
  window.addEventListener('refresh-admin-digital-reads', handleRefresh);
});

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer);
  if (clockTimer) clearInterval(clockTimer);
  window.removeEventListener('refresh-admin-digital-reads', handleRefresh);
});

async function fetchHistoricalReads() {
  if (historicalReads.value.length === 0) {
    try {
      const cached = localStorage.getItem('library_admin_digital_reads_cache');
      if (cached) historicalReads.value = JSON.parse(cached);
    } catch (e) {
      console.warn('Failed to parse cached historical reads', e);
    }
  }

  if (historicalReads.value.length === 0) {
    loading.value = true;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/digital-reads`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      historicalReads.value = data;
      localStorage.setItem('library_admin_digital_reads_cache', JSON.stringify(data));
    }
  } catch (err) {
    if (historicalReads.value.length === 0) {
      console.error(err);
    }
  } finally {
    loading.value = false;
  }
}

async function fetchLiveReads() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/digital-reads/live`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      liveReads.value = await res.json();
      // Sync the global sidebar badge so it never gets out of sync with the main dashboard view
      if (!borrowingsStore.dashboardStats) {
        borrowingsStore.dashboardStats = { active_readers_count: liveReads.value.length };
      } else {
        borrowingsStore.dashboardStats.active_readers_count = liveReads.value.length;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

const averageDuration = computed(() => {
  if (historicalReads.value.length === 0) return 0;
  const total = historicalReads.value.reduce((acc, val) => acc + (val.duration_seconds || 0), 0);
  return Math.round(total / historicalReads.value.length);
});

const availableYears = computed(() => {
  const years = new Set();
  historicalReads.value.forEach(item => {
    if (item.start_time) years.add(new Date(item.start_time).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
});

const availableMonthsForYear = computed(() => {
  if (selectedYear.value === 'all') return [];
  const months = new Set();
  historicalReads.value.forEach(item => {
    if (item.start_time) {
      const d = new Date(item.start_time);
      if (d.getFullYear() === Number(selectedYear.value)) {
        const val = String(d.getMonth() + 1).padStart(2, '0');
        const label = d.toLocaleDateString('km-KH', { month: 'long' });
        months.add(JSON.stringify({ value: val, label }));
      }
    }
  });
  return Array.from(months).map(m => JSON.parse(m)).sort((a, b) => a.value.localeCompare(b.value));
});

const printDateText = computed(() => {
  const monthMapKhmer = {
    '01': 'មករា', '02': 'កុម្ភៈ', '03': 'មីនា', '04': 'មេសា',
    '05': 'ឧសភា', '06': 'មិថុនា', '07': 'កក្កដា', '08': 'សីហា',
    '09': 'កញ្ញា', '10': 'តុលា', '11': 'វិច្ឆិកា', '12': 'ធ្នូ'
  };

  const today = new Date();
  
  if (filterTimeframe.value === 'Today') {
    const d = today.getDate().toString().padStart(2, '0');
    const m = (today.getMonth() + 1).toString().padStart(2, '0');
    const y = today.getFullYear();
    return `ថ្ងៃទី${d} ខែ${monthMapKhmer[m]} ឆ្នាំ${y}`;
  } else if (selectedYear.value !== 'all') {
    if (selectedMonth.value !== 'all') {
      const mStr = String(parseInt(selectedMonth.value, 10) + 1).padStart(2, '0');
      return `ខែ${monthMapKhmer[mStr]} ឆ្នាំ${selectedYear.value}`;
    }
    return `ប្រចាំឆ្នាំ ${selectedYear.value}`;
  }
  return 'ទិន្នន័យទាំងអស់កន្លងមក';
});

const printTotalSessions = computed(() => filteredReads.value.length);

const currentDate = new Date();
const khmerDateInfo = toKhmerLunarDate(currentDate);
const currentLunarDate = computed(() => khmerDateInfo.lunarDateText.replace('ពុទ្ធសករាជ', 'ព.ស.'));
const currentGregorianDate = computed(() => khmerDateInfo.gregorianDateText);

const printLongestReader = computed(() => {
  if (filteredReads.value.length === 0) return null;
  return filteredReads.value.reduce((prev, current) => ((prev.duration_seconds || 0) > (current.duration_seconds || 0)) ? prev : current);
});

const printShortestReader = computed(() => {
  if (filteredReads.value.length === 0) return null;
  return filteredReads.value.reduce((prev, current) => ((prev.duration_seconds || 0) < (current.duration_seconds || 0)) ? prev : current);
});


const filteredReads = computed(() => {
  let result = historicalReads.value;
  
  if (filterTimeframe.value === 'Today') {
    const todayStr = new Date().toDateString();
    result = result.filter(item => item.start_time && new Date(item.start_time).toDateString() === todayStr);
  } else {
    if (selectedYear.value !== 'all') {
      result = result.filter(item => item.start_time && new Date(item.start_time).getFullYear() === Number(selectedYear.value));
      
      if (selectedMonth.value !== 'all') {
        result = result.filter(item => {
          if (!item.start_time) return false;
          const d = new Date(item.start_time);
          return String(d.getMonth() + 1).padStart(2, '0') === selectedMonth.value;
        });
      }
    }
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      (item.user_name && item.user_name.toLowerCase().includes(q)) ||
      (item.book_title && item.book_title.toLowerCase().includes(q)) ||
      (item.user_major && item.user_major.toLowerCase().includes(q))
    );
  }
  
  if (sortDurationDir.value === 'desc') {
    result.sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
  } else if (sortDurationDir.value === 'asc') {
    result.sort((a, b) => (a.duration_seconds || 0) - (b.duration_seconds || 0));
  } else {
    // Default sort by date
    result.sort((a, b) => new Date(b.end_time || b.start_time) - new Date(a.end_time || a.start_time));
  }
  
  return result;
});

const computedItemsPerPage = computed(() => {
  return itemsPerPage.value === 'All' ? Math.max(1, filteredReads.value.length) : itemsPerPage.value;
});

const totalPages = computed(() => Math.ceil(filteredReads.value.length / computedItemsPerPage.value) || 1);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const paginatedReads = computed(() => {
  const start = (currentPage.value - 1) * computedItemsPerPage.value;
  return filteredReads.value.slice(start, start + computedItemsPerPage.value);
});

const liveTotalPages = computed(() => Math.ceil(liveReads.value.length / liveItemsPerPage.value) || 1);

const liveVisiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, liveCurrentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(liveTotalPages.value, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const paginatedLiveReads = computed(() => {
  const start = (liveCurrentPage.value - 1) * liveItemsPerPage.value;
  return liveReads.value.slice(start, start + liveItemsPerPage.value);
});

watch(() => liveTotalPages.value, (newTotal) => {
  if (liveCurrentPage.value > newTotal) {
    liveCurrentPage.value = Math.max(1, newTotal);
  }
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatLiveDuration(seconds) {
  if (!seconds || seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  
  if (h > 0) return `${h}:${mStr}:${sStr}`;
  return `${mStr}:${sStr}`;
}

function getDurationBadgeClass(seconds) {
  if (seconds >= 3600) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  } else if (seconds >= 300) {
    return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
  }
  return 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]';
}
</script>
