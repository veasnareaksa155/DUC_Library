<template>
<main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none relative print:w-full print:px-0 print:py-0 print:pb-0">
      <!-- Decorative Background Glow -->
      <div class="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10 print:hidden"></div>
      
      <header class="mb-10 flex flex-col gap-3 relative z-10 print:hidden">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ClipboardList :size="20" />
          </div>
          <h1 class="text-[2.2rem] font-extrabold tracking-tight text-[var(--text-primary)]">Requests Management</h1>
        </div>
        <p class="text-[1rem] text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">Approve student book requests, record returns, or reject pending applications with a streamlined process.</p>
      </header>

      <!-- Print Header (Hidden on screen, visible on print) -->
      <div class="hidden print:flex w-full mb-8 flex-col text-black">
        <div class="flex justify-between items-start w-full">
          <!-- Left: Logo & Uni Name -->
          <div class="flex flex-col items-center w-[250px] text-center">
            <img src="/duc-logo.png" alt="DUC Logo" class="w-[80px] h-[80px] object-contain mb-2" />
            <span class="text-[16px]" style="font-family: 'Moul', serif;">សាកលវិទ្យាល័យឌីជីថលកម្ពុជា</span>
            <span class="text-[16px]" style="font-family: 'Moul', serif;">បណ្ណាល័យសិក្សា</span>
          </div>

          <!-- Center: Kingdom & Nation Religion King -->
          <div class="flex flex-col items-center flex-1 mt-2">
            <span class="text-[19px]" style="font-family: 'Moul', serif;">ព្រះរាជាណាចក្រកម្ពុជា</span>
            <span class="text-[18px] mt-1" style="z-index: 2; font-family: 'Moul', serif;">ជាតិ សាសនា ព្រះមហាក្សត្រ</span>
            <img src="/khmer-ornament.png" alt="line" style="transform: rotate(-1deg); z-index: 1; margin-top: -20px;" class="h-[60px] mt-4 opacity-80" />
            
            <div class="mt-12 flex flex-col items-center">
              <span class="text-[16px]" style="font-family: 'Moul', serif;">របាយការណ៍ខ្ចីសៀវភៅ</span>
              <span class="text-[15px] mt-3 font-bold" style="font-family: 'Siemreap', sans-serif;">កាលបរិច្ឆេទ ៖ {{ printDateText }}</span>
            </div>
          </div>
          
          <!-- Right: Spacer for balance -->
          <div class="w-[250px]"></div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col transition-all duration-300 relative z-10 print:shadow-none print:border-none print:bg-transparent">
        
        <!-- Header & Filters -->
        <div class="p-5 sm:px-8 sm:py-6 border-b border-[var(--border-color)]/50 flex items-center justify-between gap-6 flex-wrap relative print:hidden">
          <!-- Segmented Control for Tabs -->
          <div class="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto max-w-full shadow-inner border border-slate-200/50 dark:border-slate-700/50">
            <button 
              v-for="tab in ['all', 'pending', 'approved', 'returned', 'rejected']" 
              :key="tab"
              @click="activeFilter = tab"
              class="relative px-6 py-2.5 rounded-lg text-[0.85rem] font-bold tracking-wide transition-all duration-300 capitalize overflow-hidden group whitespace-nowrap shrink-0 flex items-center gap-2"
              :class="activeFilter === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-[0_2px_10px_rgba(0,0,0,0.05)]' : 'text-slate-500 dark:text-slate-400 hover:text-[var(--text-primary)] hover:bg-slate-200/50 dark:hover:bg-slate-700/50'"
            >
              {{ tab }}
              <!-- Notification Badge for Pending -->
              <span v-if="tab === 'pending' && pendingCount > 0" class="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[0.65rem] font-bold shadow-sm transition-all duration-300" :class="activeFilter === 'pending' ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-red-500 text-white shadow-red-500/30'">
                {{ pendingCount }}
              </span>
            </button>
          </div>
          
          <div class="flex items-center gap-4 flex-wrap">
            <!-- Search Input -->
            <div class="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]/50 shadow-sm transition-all duration-300 flex items-center h-[38px] hover:border-indigo-300 dark:hover:border-indigo-500/50 min-w-[220px]">
              <div class="pl-3 pr-2 text-[var(--text-muted)] flex items-center justify-center">
                <Search :size="16" />
              </div>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search name, email, book..." 
                class="bg-transparent border-none outline-none text-[0.85rem] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full py-1.5 h-full"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="pr-3 text-[var(--text-muted)] hover:text-rose-500 flex items-center justify-center h-full">
                <X :size="14" />
              </button>
            </div>

            <!-- All / Today Toggle -->
            <div class="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <button @click="dateMode = 'all'" :class="dateMode === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'" class="px-5 py-1.5 rounded-lg text-[0.85rem] font-bold transition-all duration-300 ease-out min-w-[70px]">All</button>
              <button @click="dateMode = 'today'" :class="dateMode === 'today' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'" class="px-5 py-1.5 rounded-lg text-[0.85rem] font-bold transition-all duration-300 ease-out min-w-[70px]">Today</button>
            </div>

            <!-- Year Dropdown -->
            <div class="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]/50 shadow-sm transition-all duration-300 flex items-center h-[38px]" :class="dateMode === 'today' ? 'opacity-40 pointer-events-none' : 'hover:border-indigo-300 dark:hover:border-indigo-500/50'">
              <div class="pl-3 pr-1 text-indigo-500 flex items-center justify-center">
                <Calendar :size="16" stroke-width="2.5" />
              </div>
              <select v-model="selectedYear" class="appearance-none bg-transparent py-1.5 pr-8 pl-1 text-[0.85rem] font-bold text-[var(--text-primary)] cursor-pointer outline-none h-full" :disabled="dateMode === 'today'">
                <option value="all">Select Year</option>
                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                <ChevronDown :size="16" />
              </div>
            </div>

            <!-- Month Dropdown -->
            <div class="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-[var(--border-color)]/50 shadow-sm transition-all duration-300 flex items-center h-[38px]" :class="(dateMode === 'today' || selectedYear === 'all') ? 'opacity-40 pointer-events-none' : 'hover:border-indigo-300 dark:hover:border-indigo-500/50'">
              <select v-model="selectedMonth" class="appearance-none bg-transparent py-1.5 pl-4 pr-8 text-[0.85rem] font-bold text-[var(--text-primary)] cursor-pointer outline-none h-full min-w-[110px]" :disabled="dateMode === 'today' || selectedYear === 'all'">
                <option value="all">All Months</option>
                <option v-for="month in availableMonths" :key="month.value" :value="month.value">{{ month.label }}</option>
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                <ChevronDown :size="16" />
              </div>
            </div>

            <!-- Print / PDF Button -->
            <button @click="printTable" class="inline-flex items-center gap-2 bg-slate-800 text-white dark:bg-slate-700 dark:text-slate-100 px-4 py-2 rounded-xl text-[0.85rem] font-bold shadow-sm hover:bg-slate-900 dark:hover:bg-slate-600 hover:shadow-md transition-all duration-300 hover:-translate-y-px h-[38px] print:hidden ml-2">
              <Printer :size="15" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <!-- Premium Glassmorphic Skeleton Loader -->
        <div v-if="borrowingsStore.loading && filteredBorrowings.length === 0" class="animate-pulse w-full overflow-x-auto p-4">
          <div class="flex flex-col gap-3">
            <div v-for="i in 5" :key="'sk-'+i" class="h-24 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
          </div>
        </div>

        <div v-else class="overflow-x-auto p-4 print:p-0 print:overflow-visible">
          <table class="w-full text-left min-w-[950px] print-clean-table" style="font-family: 'Siemreap', sans-serif;">
            <thead class="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 print:bg-slate-100">
              <tr class="text-slate-600 dark:text-slate-300 text-[0.85rem] tracking-wider uppercase print:text-black print:text-[13px] print:font-bold">
                <th class="px-6 py-4 whitespace-nowrap pl-8 rounded-l-xl font-normal print:rounded-none">ឈ្មោះសិស្ស / និស្សិត</th>
                <th class="px-6 py-4 whitespace-nowrap text-center font-normal">ភេទ</th>
                <th class="px-6 py-4 whitespace-nowrap font-normal">ជំនាញ</th>
                <th class="px-6 py-4 font-normal print:w-[35%]">សៀវភៅដែលបានខ្ចី</th>
                <th class="px-6 py-4 whitespace-nowrap font-normal">កាលបរិច្ឆេទ</th>
                <th class="px-6 py-4 text-center whitespace-nowrap font-normal">ស្ថានភាព</th>
                <th class="px-6 py-4 text-right whitespace-nowrap pr-8 rounded-r-xl font-normal print:hidden">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody class="mt-2 text-[var(--text-primary)] print:mt-0">
              <tr v-for="item in paginatedBorrowings" :key="item.id" class="group bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_-6px_rgba(79,70,229,0.12)] hover:-translate-y-[2px] transition-all duration-300 rounded-2xl relative print:border-none print:shadow-none print:rounded-none print:bg-transparent print:break-inside-avoid print:even:bg-slate-50 print:-translate-y-0" :class="{'print:hidden': item.status === 'rejected'}">
                <td class="px-6 py-5 rounded-l-xl print:rounded-none print:align-top">
                  <div class="flex items-center gap-4">
                    <div class="relative print:hidden">
                      <div class="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-300"></div>
                      <div class="relative w-11 h-11 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-[1rem] border-2 border-white dark:border-slate-800 shrink-0 overflow-hidden text-indigo-600 dark:text-indigo-300">
                        <img v-if="item.profile_photo" :src="item.profile_photo" class="w-full h-full object-cover" />
                        <span v-else>{{ (item.user_name_khmer || item.user_name)?.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-extrabold text-[0.95rem] text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors print:text-black print:text-[13px] print:font-bold">{{ item.user_name_khmer || item.user_name }}</span>
                      <span class="text-[0.8rem] text-[var(--text-muted)] font-medium print:hidden">{{ item.user_email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center whitespace-nowrap" style="font-family: 'Khmer OS Battambang', sans-serif;">
                  <span v-if="item.user_gender === 'M' || item.user_gender?.toUpperCase() === 'MALE' || item.user_gender === 'ប្រុស'" class="text-[0.8rem] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded">ប្រុស</span>
                  <span v-else-if="item.user_gender === 'F' || item.user_gender?.toUpperCase() === 'FEMALE' || item.user_gender === 'ស្រី'" class="text-[0.8rem] font-bold text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400 px-2.5 py-1 rounded">ស្រី</span>
                  <span v-else class="text-[0.75rem] text-[var(--text-muted)] italic">N/A</span>
                </td>
                <td class="px-6 py-5">
                  <span class="font-bold text-[0.85rem] text-[var(--text-primary)] print:text-black print:text-[12px]">{{ item.user_major || 'N/A' }}</span>
                </td>
                <td class="px-6 py-5 print:align-top">
                  <div class="flex flex-col max-w-[280px] print:max-w-none">
                    <span class="font-bold text-[0.95rem] text-[var(--text-primary)] truncate print:whitespace-normal print:text-black print:text-[13px]" :title="item.book_title">{{ item.book_title }}</span>
                    <span class="text-[0.8rem] text-indigo-500 dark:text-indigo-400 font-bold truncate mt-1 bg-indigo-50 dark:bg-indigo-500/10 w-fit px-2 py-0.5 rounded-md print:bg-transparent print:px-0 print:text-slate-500 print:font-medium print:mt-1 print:whitespace-normal">{{ item.book_author }}</span>
                  </div>
                </td>
                <td class="px-6 py-5 print:align-top">
                  <div class="flex flex-col gap-2 print:gap-1.5" style="font-family: 'Khmer OS Battambang', sans-serif;">
                    <div class="flex items-center gap-2 text-[0.82rem] print:text-[12px]">
                      <span class="text-[var(--text-muted)] font-bold w-12 shrink-0 print:text-slate-500">ថ្ងៃខ្ចី៖</span>
                      <span class="font-semibold text-[var(--text-primary)] print:text-black">{{ formatDate(item.borrow_date) }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-[0.82rem] print:text-[12px]">
                      <span class="text-[var(--text-muted)] font-bold w-12 shrink-0 print:text-slate-500">ថ្ងៃសង៖</span>
                      <span class="font-bold print:!shadow-none" :class="isOverdue(item.due_date, item.status) ? 'text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20' : 'text-[var(--text-primary)]'" style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">{{ formatDate(item.due_date) }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center align-middle print:align-top">
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.75rem] font-extrabold uppercase tracking-wider border transition-colors shadow-sm print:!shadow-none print:px-2 print:py-0.5 print:text-[11px] print:rounded-md print:font-bold" :class="getStatusBadgeClass(item.status)" style="font-family: 'Khmer OS Battambang', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                    <span class="w-1.5 h-1.5 rounded-full print:hidden" :class="getStatusDotClass(item.status)"></span>
                    {{ getStatusKhmer(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right align-middle rounded-r-xl print:hidden">
                  <div class="flex justify-end gap-2.5">
                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'approved', item)" 
                      class="w-9 h-9 inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:-translate-y-1 border border-emerald-200 dark:border-emerald-500/20 hover:border-transparent group/btn"
                      :class="loadingActionId === item.id && loadingActionType === 'approved' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Approve Request"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'approved'" :size="16" class="animate-spin" />
                      <Check v-else :size="18" stroke-width="3" class="group-hover/btn:scale-110 transition-transform" />
                    </button>

                    <button 
                      v-if="item.status === 'pending'"
                      @click="updateStatus(item.id, 'rejected', item)" 
                      class="w-9 h-9 inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_4px_15px_rgba(244,63,94,0.4)] hover:-translate-y-1 border border-rose-200 dark:border-rose-500/20 hover:border-transparent group/btn"
                      :class="loadingActionId === item.id && loadingActionType === 'rejected' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Reject Request"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'rejected'" :size="16" class="animate-spin" />
                      <X v-else :size="18" stroke-width="3" class="group-hover/btn:scale-110 transition-transform" />
                    </button>

                    <button 
                      v-if="item.status === 'approved'"
                      @click="updateStatus(item.id, 'returned', item)" 
                      class="inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-[0_4px_12px_rgba(79,70,229,0.1)] hover:-translate-y-0.5 px-4 py-2 text-[0.85rem] dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                      :class="loadingActionId === item.id && loadingActionType === 'returned' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'returned'" :size="15" class="animate-spin" />
                      <RotateCcw v-else :size="15" /> 
                      <span>{{ loadingActionId === item.id && loadingActionType === 'returned' ? 'Processing...' : 'Mark Returned' }}</span>
                    </button>

                    <button 
                      v-if="item.status !== 'returned' && item.status !== 'rejected'"
                      @click="sendDueReminder(item)" 
                      class="w-9 h-9 inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 ease-out active:scale-95 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white hover:shadow-[0_4px_15px_rgba(79,70,229,0.4)] hover:-translate-y-1 border border-slate-200 dark:border-slate-600 hover:border-transparent group/btn"
                      :class="loadingActionId === item.id && loadingActionType === 'reminder' ? 'opacity-70 cursor-not-allowed' : ''"
                      :disabled="loadingActionId === item.id"
                      title="Send Due Date Reminder"
                    >
                      <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'reminder'" :size="15" class="animate-spin" />
                      <BellRing v-else :size="15" class="group-hover/btn:-rotate-12 transition-transform" /> 
                    </button>

                    <div v-if="item.status === 'returned' || item.status === 'rejected'" class="flex items-center justify-end gap-3">
                      <span class="text-[0.75rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Check :size="14" /> Closed
                      </span>
                      <button 
                        @click="deleteRequest(item)" 
                        class="w-9 h-9 inline-flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-300 hover:-translate-y-1 group/btn border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30"
                        :class="loadingActionId === item.id && loadingActionType === 'delete' ? 'cursor-not-allowed' : ''"
                        :disabled="loadingActionId === item.id"
                        title="Delete Record"
                      >
                        <Loader2 v-if="loadingActionId === item.id && loadingActionType === 'delete'" :size="16" class="animate-spin" />
                        <Trash2 v-else :size="16" stroke-width="2" class="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="paginatedBorrowings.length === 0">
                <td colspan="7" class="px-6 py-28 text-center border-none bg-transparent">
                  <div class="flex flex-col items-center justify-center text-[var(--text-muted)] gap-6">
                    <div class="relative w-24 h-24 flex items-center justify-center">
                      <div class="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-50"></div>
                      <div class="absolute inset-4 bg-indigo-500/20 rounded-full"></div>
                      <ClipboardList :size="48" stroke-width="1.5" class="text-indigo-500 relative z-10" />
                    </div>
                    <div class="flex flex-col gap-2">
                      <p class="font-extrabold text-[1.2rem] text-[var(--text-primary)]">No {{ activeFilter !== 'all' ? activeFilter : '' }} requests</p>
                      <p class="text-[0.95rem] max-w-sm mx-auto leading-relaxed">Your queue is completely clear. Any new borrowing requests will magically appear right here.</p>
                    </div>
                    <button v-if="activeFilter !== 'all'" @click="activeFilter = 'all'" class="mt-4 px-6 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition-colors shadow-sm">View All Requests</button>
                  </div>
                </td>
              </tr>
            </tbody>
            

          </table>
        </div>
        
        <!-- Print Summary Box -->
        <div class="hidden print:flex w-full justify-end mt-10 mb-4">
          <div class="flex flex-col min-w-[380px] border border-slate-300 rounded-lg overflow-hidden" style="font-family: 'Outfit', 'Kantumruy Pro', sans-serif; page-break-inside: avoid;">
            <div class="flex justify-between items-center w-full px-5 py-3 border-b border-slate-200 bg-white">
              <span class="text-slate-600 font-bold text-[12px]">សរុបសៀវភៅដែលបានសង (Returned)</span>
              <span class="text-[14px] font-extrabold text-slate-800">{{ printTotalReturned }}</span>
            </div>
            <div class="flex justify-between items-center w-full px-5 py-3 border-b border-slate-200 bg-white">
              <span class="text-slate-600 font-bold text-[12px]">សរុបសៀវភៅមិនទាន់សង (Not Returned)</span>
              <span class="text-[14px] font-extrabold text-slate-800">{{ printTotalNotReturned }}</span>
            </div>
            <div class="flex justify-between items-center w-full px-5 py-3.5 bg-slate-800 text-white" style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <span class="font-extrabold uppercase tracking-wide text-[13px]">សរុបសៀវភៅទាំងអស់ (Total Borrowed)</span>
              <span class="text-[16px] font-black">{{ printTotalBorrowed }}</span>
            </div>
          </div>
        </div>

        <!-- Print Footer / Signature Block (Hidden except when printing) -->
        <div class="hidden print:flex flex-col items-end mt-12 pr-12 text-[16px] text-black print:text-black" style="font-family: 'Siemreap', sans-serif; page-break-inside: avoid;">
          <div class="mb-2">{{ currentLunarDate }}</div>
          <div class="mb-8">កំពង់ស្ពឺ {{ currentGregorianDate }}</div>
          <div class="mr-6">អ្នកធ្វើរបាយការណ៍</div>
        </div>

        <!-- Pagination Nav Bar -->
        <div v-if="totalPages > 1" class="flex justify-between items-center px-8 py-5 border-t border-[var(--border-color)]/50 bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-md print:hidden">
          <div class="text-[0.85rem] text-[var(--text-muted)] font-medium">
            Showing <span class="font-bold text-[var(--text-primary)]">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="font-bold text-[var(--text-primary)]">{{ Math.min(currentPage * itemsPerPage, filteredBorrowings.length) }}</span> of <span class="font-bold text-[var(--text-primary)]">{{ filteredBorrowings.length }}</span>
          </div>

          <div class="flex items-center gap-3">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="w-[36px] h-[36px] rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[var(--text-primary)] flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer hover:not(:disabled):bg-indigo-500 hover:not(:disabled):text-white hover:not(:disabled):border-transparent hover:not(:disabled):shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:not(:disabled):-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft :size="18" />
            </button>

            <span class="text-[0.85rem] font-bold text-[var(--text-primary)] bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="w-[36px] h-[36px] rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[var(--text-primary)] flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer hover:not(:disabled):bg-indigo-500 hover:not(:disabled):text-white hover:not(:disabled):border-transparent hover:not(:disabled):shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:not(:disabled):-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { toKhmerLunarDate } from 'khmer-chhankitek-calendar';
import { useBorrowingsStore } from '../../stores/borrowings';
import { useLocaleStore } from '../../stores/locale';
import { useToastStore } from '../../stores/toast';
import { useConfirmStore } from '../../stores/confirm';
import { sendPhoneAndDrawerNotification } from '../../services/notificationService';
import { Check, X, RotateCcw, BellRing, ClipboardList, Loader2, ChevronLeft, ChevronRight, Trash2, ChevronDown, Calendar, Printer, Search } from 'lucide-vue-next';

const borrowingsStore = useBorrowingsStore();
const localeStore = useLocaleStore();
const toastStore = useToastStore();
const confirmStore = useConfirmStore();
const activeFilter = ref('all');
const dateMode = ref('all');
const selectedYear = ref('all');
const selectedMonth = ref('all');
const searchQuery = ref('');

const currentDate = new Date();
const khmerDateInfo = toKhmerLunarDate(currentDate);
const currentLunarDate = computed(() => khmerDateInfo.lunarDateText.replace('ពុទ្ធសករាជ', 'ព.ស'));
const currentGregorianDate = computed(() => khmerDateInfo.gregorianDateText);

const availableYears = computed(() => {
  const years = new Set();
  borrowingsStore.adminBorrowings.forEach(b => {
    if (b.borrow_date) years.add(b.borrow_date.substring(0, 4));
  });
  return Array.from(years).sort((a, b) => b - a);
});

const allMonthsMap = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December'
};

const availableMonths = computed(() => {
  if (selectedYear.value === 'all') return [];
  
  const monthsSet = new Set();
  borrowingsStore.adminBorrowings.forEach(b => {
    if (b.borrow_date && b.borrow_date.substring(0, 4) === selectedYear.value) {
      monthsSet.add(b.borrow_date.substring(5, 7));
    }
  });
  
  return Array.from(monthsSet).sort().map(m => ({
    value: m,
    label: allMonthsMap[m]
  }));
});

const printDateText = computed(() => {
  const monthMapKhmer = {
    '01': 'មករា', '02': 'កុម្ភៈ', '03': 'មីនា', '04': 'មេសា',
    '05': 'ឧសភា', '06': 'មិថុនា', '07': 'កក្កដា', '08': 'សីហា',
    '09': 'កញ្ញា', '10': 'តុលា', '11': 'វិច្ឆិកា', '12': 'ធ្នូ'
  };

  if (dateMode.value === 'today') {
    const today = new Date();
    const day = today.getDate();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `ថ្ងៃទី ${day} ខែ ${monthMapKhmer[month]} ឆ្នាំ ${year}`;
  } else if (dateMode.value === 'all') {
    if (selectedYear.value === 'all') {
      return 'ទាំងអស់';
    } else {
      let text = `ឆ្នាំ ${selectedYear.value}`;
      if (selectedMonth.value !== 'all') {
        text += ` ខែ ${monthMapKhmer[selectedMonth.value]}`;
      }
      return text;
    }
  }
  return 'ទាំងអស់';
});

onMounted(() => {
  borrowingsStore.fetchAdminBorrowings();
});

const filteredBorrowings = computed(() => {
  let result = borrowingsStore.adminBorrowings;

  // 0. Search Filter
  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(b => {
      const nameMatch = b.user_name ? String(b.user_name).toLowerCase().includes(q) : false;
      const emailMatch = b.user_email ? String(b.user_email).toLowerCase().includes(q) : false;
      const titleMatch = b.book_title ? String(b.book_title).toLowerCase().includes(q) : false;
      return nameMatch || emailMatch || titleMatch;
    });
  }
  
  // 1. Status Filter
  if (activeFilter.value !== 'all') {
    result = result.filter(b => b.status === activeFilter.value);
  }
  
  // 2. Date Filter
  if (dateMode.value === 'today') {
    const now = new Date();
    // Use local timezone to prevent UTC day shift bugs
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const todayStr = today.toISOString().split('T')[0];

    result = result.filter(b => {
      if (!b.borrow_date) return false;
      const bDate = b.borrow_date.substring(0, 10);
      return bDate === todayStr;
    });
  } else {
    if (selectedYear.value !== 'all') {
      result = result.filter(b => b.borrow_date && b.borrow_date.substring(0, 4) === selectedYear.value);
      if (selectedMonth.value !== 'all') {
        result = result.filter(b => b.borrow_date && b.borrow_date.substring(5, 7) === selectedMonth.value);
      }
    }
  }
  
  return result;
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

function printTable() {
  const originalLimit = itemsPerPage.value;
  itemsPerPage.value = 9999;
  // Wait for the DOM to render all rows before opening print dialog
  setTimeout(() => {
    window.print();
    itemsPerPage.value = originalLimit;
  }, 300);
}

watch(dateMode, (newMode) => {
  if (newMode === 'today') {
    selectedYear.value = 'all';
    selectedMonth.value = 'all';
  }
  currentPage.value = 1;
});

watch([selectedYear, selectedMonth, activeFilter, searchQuery], () => {
  if (selectedYear.value === 'all') {
    selectedMonth.value = 'all';
  }
  currentPage.value = 1;
});

const totalPages = computed(() => Math.ceil(filteredBorrowings.value.length / itemsPerPage.value) || 1);

const paginatedBorrowings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredBorrowings.value.slice(start, start + itemsPerPage.value);
});

const printTotalReturned = computed(() => paginatedBorrowings.value.filter(b => b.status === 'returned').length);
const printTotalNotReturned = computed(() => paginatedBorrowings.value.filter(b => b.status === 'approved' || b.status === 'pending').length);
const printTotalBorrowed = computed(() => paginatedBorrowings.value.filter(b => b.status !== 'rejected').length);

const pendingCount = computed(() => {
  return borrowingsStore.adminBorrowings.filter(b => b.status === 'pending').length;
});

const loadingActionId = ref(null);
const loadingActionType = ref(null);

async function updateStatus(id, newStatus, item) {
  if (loadingActionId.value) return;
  loadingActionId.value = id;
  loadingActionType.value = newStatus;

  try {
    await borrowingsStore.updateBorrowStatus(id, newStatus);
    
    // Show toast immediately for fast UX feedback!
    if (newStatus === 'approved' && item) {
      sendPhoneAndDrawerNotification({
        title: 'Borrow Request Approved! 📚',
        message: `Your borrowing request for "${item.book_title}" has been approved! Please pick up your copy at DUC Library.`,
        type: 'system',
        target_user_id: item.user_id
      });
      toastStore.showSuccess(`Approved & notified student phone! 📱`, `Request Approved`);
    } else if (newStatus === 'returned' && item) {
      toastStore.showSuccess(`Marked "${item.book_title}" as returned!`, `Book Returned`);
    } else if (newStatus === 'rejected' && item) {
      toastStore.showSuccess(`Request for "${item.book_title}" was rejected.`, `Request Rejected`);
    }

    // Now reload the table and dashboard stats concurrently
    await Promise.all([
      borrowingsStore.fetchAdminBorrowings(),
      borrowingsStore.fetchAdminDashboardStats()
    ]);
  } catch (err) {
    toastStore.show(err.message || 'Failed to update request status.', { type: 'error', title: 'Error' });
  } finally {
    loadingActionId.value = null;
    loadingActionType.value = null;
  }
}

async function sendDueReminder(item) {
  if (loadingActionId.value) return;
  loadingActionId.value = item.id;
  loadingActionType.value = 'reminder';

  try {
    sendPhoneAndDrawerNotification({
      title: 'Due Date Return Reminder ⏰',
      message: `Reminder for ${item.user_name}: The book "${item.book_title}" is due for return to the DUC Library resource center.`,
      type: 'system',
      target_user_id: item.user_id
    });
    toastStore.showSuccess(`Sent due date reminder notification to ${item.user_name}! 📱`, `Reminder Sent`);
  } catch (err) {
    toastStore.show('Failed to send reminder notification.', { type: 'error', title: 'Error' });
  } finally {
    loadingActionId.value = null;
    loadingActionType.value = null;
  }
}

async function deleteRequest(item) {
  if (loadingActionId.value) return;
  
  const bookTitle = item.book_title;
  const userName = item.user_name;

  const confirmed = await confirmStore.showConfirm({
    title: 'Delete Record',
    message: `Are you sure you want to delete the record for "${bookTitle}" requested by ${userName}? This action cannot be undone.`,
    confirmText: 'Delete',
    type: 'danger'
  });

  if (!confirmed) return;
  
  loadingActionId.value = item.id;
  loadingActionType.value = 'delete';

  try {
    await borrowingsStore.deleteBorrowing(item.id);
    toastStore.showSuccess(`Deleted record for "${bookTitle}"`, `Record Deleted`);
  } catch (err) {
    toastStore.show(err.message || 'Failed to delete request.', { type: 'error', title: 'Error' });
  } finally {
    loadingActionId.value = null;
    loadingActionType.value = null;
  }
}

function formatDate(dateStr) {
  if (!dateStr || String(dateStr).trim() === '' || dateStr === 'null' || dateStr === 'undefined') return 'TBD';
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'TBD';

  // Jan 1, 1970 is the Unix Epoch. This happens when an empty date or '0' is parsed by the backend database
  if (d.getFullYear() <= 1970) return 'TBD';

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const getStatusKhmer = (status) => {
  const map = {
    'pending': 'កំពុងរង់ចាំ',
    'approved': 'បានអនុម័ត',
    'returned': 'បានសង',
    'rejected': 'បានបដិសេធ'
  };
  return map[status] || status.toUpperCase();
};

function isOverdue(dueDate, status) {
  if (status === 'returned' || status === 'rejected' || !dueDate) return false;
  
  const d = new Date(dueDate);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return false;
  
  return d < new Date();
}

function getStatusBadgeClass(status) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    approved: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    returned: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
  };
  return map[status] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
}

function getStatusDotClass(status) {
  const map = {
    pending: 'bg-amber-500',
    approved: 'bg-indigo-500',
    returned: 'bg-emerald-500',
    rejected: 'bg-rose-500'
  };
  return map[status] || 'bg-slate-400';
}
</script>

<style scoped>
table {
  border-collapse: separate !important;
  border-spacing: 0 8px !important;
}

@media print {
  @page {
    margin: 15mm;
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font-family: sans-serif;
      font-size: 10px;
    }
  }
  
  table {
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
    color: #0f172a !important;
    vertical-align: middle !important;
    font-family: 'Kantumruy Pro', 'Siemreap', sans-serif !important;
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
    background-color: #f8fafc !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
