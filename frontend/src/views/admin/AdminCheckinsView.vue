<template>
<main class="flex-1 py-8 px-10 pb-20 w-[calc(100%-280px)] max-w-none print:w-full print:p-0 print:m-0 print:block">
      <header class="mb-10 flex flex-col gap-2 print:hidden">
        <div class="flex items-center gap-3 text-indigo-500 mb-1">
          <MapPin :size="28" class="p-1.5 bg-indigo-500/10 rounded-lg shadow-sm" />
          <h1 class="text-[2.2rem] font-extrabold tracking-tight">Check-Ins <span class="text-transparent bg-clip-text [background-image:var(--accent-gradient)]">Management</span></h1>
        </div>
        <p class="text-[0.95rem] text-[var(--text-secondary)] max-w-2xl leading-relaxed">View and monitor library check-ins from students and members.</p>
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
              <span class="text-[17px]" style="font-family: 'Moul', serif;">របាយការណ៍សិស្សចូលក្នុងបណ្ណាល័យ</span>
              <span class="text-[16px] mt-3 font-bold" style="font-family: 'Siemreap', sans-serif;">កាលបរិច្ឆេទ ៖ {{ reportDateText }}</span>
            </div>
          </div>
          
          <!-- Right: Spacer for balance -->
          <div class="w-[250px]"></div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] border-[var(--border-color)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 mt-10 print:mt-0 print:border-none print:shadow-none print:rounded-none print:block print:overflow-visible">
        <!-- Header & Filters -->
        <div class="p-5 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-6 flex-wrap print:hidden">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex gap-1.5 p-1.5 bg-gray-500/5 rounded-xl border border-[var(--border-color)]/50 shadow-inner overflow-x-auto max-w-full">
              <button 
                v-for="filter in ['all', 'today']" 
                :key="filter"
                @click="activeFilter = filter"
                class="relative px-5 py-2 rounded-lg text-[0.82rem] font-bold tracking-wide transition-all duration-300 capitalize overflow-hidden group whitespace-nowrap shrink-0"
                :class="activeFilter === filter ? 'text-white shadow-md [background:var(--accent-gradient)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-500/10'"
              >
                {{ filter }}
              </button>
            </div>
            
            <!-- Custom Premium Dropdowns -->
            <div class="flex items-center gap-3">
              <!-- Full screen overlay for click-outside -->
              <div v-if="yearDropdownOpen || monthDropdownOpen" @click="yearDropdownOpen = false; monthDropdownOpen = false" class="fixed inset-0 z-40"></div>

              <!-- Year Custom Dropdown -->
              <div class="relative z-50">
                <div @click="yearDropdownOpen = !yearDropdownOpen" class="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[0.88rem] font-bold rounded-[12px] px-3.5 py-2.5 cursor-pointer hover:border-indigo-300 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-[120px]" :class="{'ring-4 ring-indigo-500/10 border-indigo-500': yearDropdownOpen}">
                  <div class="flex items-center gap-2.5">
                    <CalendarDays :size="16" class="text-indigo-500" />
                    <span>{{ selectedYear || 'Select Year' }}</span>
                  </div>
                  <ChevronDown :size="16" class="text-[var(--text-muted)] transition-transform duration-300 ml-2" :class="{'rotate-180': yearDropdownOpen}" />
                </div>
                
                <!-- Dropdown Menu -->
                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <div v-if="yearDropdownOpen" class="absolute top-[calc(100%+8px)] left-0 w-full min-w-[140px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-1.5 overflow-hidden origin-top">
                    <div @click="selectYear(''); yearDropdownOpen = false" class="px-4 py-2.5 text-[0.85rem] font-medium text-[var(--text-muted)] hover:bg-gray-500/10 cursor-pointer transition-colors">Clear Year</div>
                    <div v-for="year in availableYears" :key="year" @click="selectYear(year); yearDropdownOpen = false" class="px-4 py-2.5 text-[0.88rem] font-bold text-[var(--text-primary)] hover:bg-indigo-500/10 hover:text-indigo-500 cursor-pointer transition-colors" :class="{'bg-indigo-500/10 text-indigo-500': selectedYear === year}">
                      {{ year }}
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Month Custom Dropdown -->
              <div class="relative z-50">
                <div @click="selectedYear ? monthDropdownOpen = !monthDropdownOpen : null" class="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[0.88rem] font-bold rounded-[12px] px-4 py-2.5 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-[140px]" :class="[!selectedYear ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300', monthDropdownOpen ? 'ring-4 ring-indigo-500/10 border-indigo-500' : '']">
                  <span>{{ getMonthLabel(selectedMonth) || 'All Months' }}</span>
                  <ChevronDown :size="16" class="text-[var(--text-muted)] transition-transform duration-300 ml-2" :class="{'rotate-180': monthDropdownOpen}" />
                </div>
                
                <!-- Dropdown Menu -->
                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                  <div v-if="monthDropdownOpen" class="absolute top-[calc(100%+8px)] left-0 w-full min-w-[140px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-1.5 overflow-hidden origin-top">
                    <div @click="selectMonth(''); monthDropdownOpen = false" class="px-4 py-2.5 text-[0.85rem] font-medium text-[var(--text-muted)] hover:bg-gray-500/10 cursor-pointer transition-colors">All Months</div>
                    <div v-for="month in availableMonths" :key="month.value" @click="selectMonth(month.value); monthDropdownOpen = false" class="px-4 py-2.5 text-[0.88rem] font-bold text-[var(--text-primary)] hover:bg-indigo-500/10 hover:text-indigo-500 cursor-pointer transition-colors" :class="{'bg-indigo-500/10 text-indigo-500': selectedMonth === month.value}">
                      {{ month.label }}
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="text-[0.85rem] font-semibold text-[var(--text-muted)] bg-gray-500/5 px-4 py-2 rounded-lg border border-[var(--border-color)]/50">
              Showing <span class="text-[var(--text-primary)]">{{ filteredCheckins.length }}</span> check-ins
            </div>
            
            <button @click="printReport" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-[0.85rem] transition-colors shadow-sm cursor-pointer">
              <Printer :size="16" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        <!-- Premium Glassmorphic Skeleton Loader -->
        <div v-if="loading && checkins.length === 0" class="animate-pulse w-full overflow-x-auto print:overflow-visible">
          <table class="w-full text-left border-collapse min-w-[900px] print:min-w-0 opacity-70">
            <thead>
              <tr>
                <th v-for="i in 8" :key="'th-'+i" class="px-6 py-4 bg-gray-500/5 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-24"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="'tr-'+i">
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-full bg-[var(--border-color)] shrink-0"></div>
                    <div class="flex flex-col gap-2">
                      <div class="h-4 bg-[var(--border-color)] rounded w-32"></div>
                      <div class="h-3 bg-[var(--border-color)] rounded w-24"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-16"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-28"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-32"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-24"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)] text-center">
                  <div class="h-6 bg-[var(--border-color)] rounded-full w-12 mx-auto"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)]">
                  <div class="h-4 bg-[var(--border-color)] rounded w-24"></div>
                </td>
                <td class="px-6 py-4 border-b border-[var(--border-color)] text-center">
                  <div class="h-6 bg-[var(--border-color)] rounded-lg w-20 mx-auto"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="overflow-x-auto print:overflow-visible">
          <table class="w-full text-left border-collapse min-w-[900px] print:min-w-0 print-clean-table" style="font-family: 'Siemreap', sans-serif;">
            <thead>
              <tr class="bg-gray-500/5 text-[var(--text-muted)] text-[0.75rem] font-bold tracking-wider">
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap print:!text-[16px]">ឈ្មោះសិស្ស / សមាជិក</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] text-center whitespace-nowrap print:!text-[16px]">ភេទ</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap print:!text-[16px]">ជំនាញ</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap print:!text-[16px]">ថ្នាក់</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap print:hidden">កាលបរិច្ឆេទ និង ម៉ោង</th>
                <th @click="toggleSort" class="px-6 py-4 border-b border-[var(--border-color)] text-center whitespace-nowrap cursor-pointer hover:bg-gray-500/10 transition-colors select-none group print:!text-[16px]">
                  <div class="flex items-center justify-center gap-2">
                    <span>ចំនួនចូលសរុប</span>
                    <span class="flex flex-col opacity-40 group-hover:opacity-100 transition-opacity print:hidden">
                      <ChevronUp v-if="sortCheckinsBy === 'total_asc'" :size="14" class="text-indigo-500 font-bold" />
                      <ChevronDown v-else-if="sortCheckinsBy === 'total_desc'" :size="14" class="text-indigo-500 font-bold" />
                      <ArrowDownUp v-else :size="14" class="text-[var(--text-muted)]" />
                    </span>
                  </div>
                </th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] whitespace-nowrap print:hidden">ទីតាំង</th>
                <th class="px-6 py-4 border-b border-[var(--border-color)] text-center whitespace-nowrap print:hidden">ស្ថានភាព</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border-color)]">
              <tr v-for="item in (isPrinting ? filteredCheckins : paginatedCheckins)" :key="item.unique_key" class="group hover:bg-gray-500/5 transition-colors duration-200 print:break-inside-avoid">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-full bg-[var(--border-color)] overflow-hidden flex items-center justify-center font-bold text-[1.1rem] shadow-sm shrink-0 print:hidden">
                      <img v-if="item.user_photo" :src="item.user_photo" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full [background-image:var(--accent-gradient)] text-white flex items-center justify-center">
                        {{ (item.user_name_khmer || item.user_name)?.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-extrabold text-[0.95rem] text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">{{ item.user_name_khmer || item.user_name }}</span>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[0.75rem] text-[var(--text-muted)] font-medium print:hidden">{{ item.user_email }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <span v-if="item.user_gender === 'M' || item.user_gender === 'Male' || item.user_gender === 'ប្រុស'" class="text-[0.8rem] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded print:text-[0.95rem]">ប្រុស</span>
                  <span v-else-if="item.user_gender === 'F' || item.user_gender === 'Female' || item.user_gender === 'ស្រី'" class="text-[0.8rem] font-bold text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400 px-2.5 py-1 rounded print:text-[0.95rem]">ស្រី</span>
                  <span v-else class="text-[0.75rem] text-[var(--text-muted)] italic print:text-[0.95rem]">N/A</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="item.user_major" class="text-[0.7rem] font-bold tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded uppercase print:text-[0.95rem]">{{ item.user_major }}</span>
                  <span v-else class="text-[0.75rem] text-[var(--text-muted)] italic print:text-[0.95rem]">N/A</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="item.user_class" class="text-[0.75rem] font-bold text-[var(--text-primary)] px-2 py-1 bg-gray-500/10 rounded uppercase print:text-[0.95rem]">{{ item.user_class }}</span>
                  <span v-else class="text-[0.75rem] text-[var(--text-muted)] italic print:text-[0.95rem]">-</span>
                </td>
                <td class="px-6 py-4 print:hidden">
                  <div class="flex flex-col gap-1.5 text-[0.85rem]">
                    <span class="font-semibold text-[var(--text-primary)]">{{ formatDate(item.checkin_time) }}</span>
                    <span class="text-[var(--text-muted)] font-medium">{{ formatTime(item.checkin_time) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full font-bold text-[0.8rem] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 print:text-[0.95rem]">
                    {{ item.total_checkins }}
                  </span>
                </td>
                <td class="px-6 py-4 print:hidden">
                  <div class="flex items-center gap-2">
                    <MapPin :size="14" class="text-indigo-500" />
                    <span class="font-medium text-[0.85rem] text-[var(--text-secondary)]">{{ formatLocation(item.lat, item.lng) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center align-middle print:hidden">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm" :class="item.status === 'success' ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700-returned' : (item.status.includes('fail') ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700-rejected' : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700-pending')">
                    {{ item.status === 'success' ? 'Successful' : item.status }}
                  </span>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr v-if="paginatedCheckins.length === 0 && !loading">
                <td colspan="8" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center justify-center opacity-80">
                    <div class="w-20 h-20 rounded-full bg-gray-500/10 flex items-center justify-center mb-4 border border-[var(--border-color)] text-[var(--text-muted)]">
                      <MapPin :size="32" />
                    </div>
                    <div class="flex flex-col gap-1 text-[var(--text-muted)] mb-6">
                      <p class="font-extrabold text-[1.1rem] text-[var(--text-primary)]">No check-ins found</p>
                      <p class="text-[0.88rem] max-w-sm mx-auto leading-relaxed">There are currently no check-in records matching your filter.</p>
                    </div>
                    <button v-if="activeFilter !== 'all'" @click="activeFilter = 'all'" class="mt-2 text-indigo-500 text-[0.85rem] font-bold hover:underline">View All Check-Ins</button>
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
              <span class="text-slate-600 font-bold text-[12px]">សរុបសិស្សដែលបានចូល (Total Users)</span>
              <span class="text-[14px] font-extrabold text-slate-800">{{ filteredCheckins.length }}</span>
            </div>
            <div class="flex justify-between items-center w-full px-5 py-3.5 bg-slate-800 text-white" style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
              <span class="font-extrabold uppercase tracking-wide text-[13px]">សរុបការចូលទាំងអស់ (Total Check-Ins)</span>
              <span class="text-[16px] font-black">{{ printTotalCheckins }}</span>
            </div>
          </div>
        </div>

        <!-- Print Footer / Signature Block (Hidden except when printing) -->
        <div class="hidden print:flex w-full justify-end mt-12 pr-12 text-[16px] text-black print:text-black" style="font-family: 'Siemreap', sans-serif; page-break-inside: avoid;">
          <div class="flex flex-col items-center">
            <div class="mb-2" style="font-family: 'Siemreap', sans-serif; page-break-inside: avoid;">{{ currentLunarDate }}</div>
            <div class="mb-8" style="font-family: 'Siemreap', sans-serif; page-break-inside: avoid;">កំពង់ស្ពឺ {{ currentGregorianDate }}</div>
            <div style="font-family: 'Siemreap', sans-serif; page-break-inside: avoid;">អ្នកធ្វើរបាយការណ៍</div>
          </div>
        </div>

        <!-- Pagination Nav Bar -->
        <div v-if="totalPages > 1" class="flex justify-between items-center p-6 border-t border-[var(--border-color)] print:hidden">
          <div class="text-[0.85rem] text-[var(--text-muted)] font-medium">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredCheckins.length) }} of {{ filteredCheckins.length }} check-ins
          </div>

          <div class="flex items-center gap-1.5">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/5 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft :size="16" />
            </button>

            <!-- Smart Page Numbers -->
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page"
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] flex items-center justify-center text-[0.85rem] font-bold transition-all duration-200 cursor-pointer"
              :class="currentPage === page ? 'text-white shadow-md [background:var(--accent-gradient)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-gray-500/10 hover:text-[var(--text-primary)]'"
            >
              {{ page }}
            </button>

            <button 
              @click="currentPage++" 
              :disabled="currentPage >= totalPages" 
              class="w-[34px] h-[34px] rounded-[var(--radius-md)] bg-gray-500/5 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:not(:disabled):bg-[var(--accent-gradient)] hover:not(:disabled):text-white hover:not(:disabled):border-transparent disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </main>
</template>

<style scoped>
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 15mm;
    @bottom-right {
      content: "ទំព័រទី " counter(page) " នៃ " counter(pages);
      font-family: 'Siemreap', sans-serif !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      color: #4f46e5 !important;
    }
  }

  body { 
    background: white !important; 
    color: black !important;
    font-family: 'Kantumruy Pro', 'Outfit', sans-serif !important; 
  }
  
  .bg-\[var\(--bg-card\)\] { background: transparent !important; box-shadow: none !important; border: none !important; }
  
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
    color: #000000 !important;
    vertical-align: middle !important;
    font-family: 'Siemreap', sans-serif !important;
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
import { MapPin, ChevronLeft, ChevronRight, CalendarDays, ChevronDown, ChevronUp, Printer, ArrowDownUp } from 'lucide-vue-next';

const authStore = useAuthStore();
const toastStore = useToastStore();

const checkins = ref([]);
const loading = ref(false);
const activeFilter = ref('all');

const currentDate = new Date();
const khmerDateInfo = toKhmerLunarDate(currentDate);
const currentLunarDate = computed(() => khmerDateInfo.lunarDateText.replace('ពុទ្ធសករាជ', 'ព.ស.'));
const currentGregorianDate = computed(() => khmerDateInfo.gregorianDateText);

const selectedYear = ref('');
const selectedMonth = ref('');

const yearDropdownOpen = ref(false);
const monthDropdownOpen = ref(false);
const sortCheckinsBy = ref('time_desc');

function toggleSort() {
  if (sortCheckinsBy.value === 'time_desc') sortCheckinsBy.value = 'total_desc';
  else if (sortCheckinsBy.value === 'total_desc') sortCheckinsBy.value = 'total_asc';
  else sortCheckinsBy.value = 'time_desc';
}

const selectYear = (year) => {
  selectedYear.value = year;
};

const selectMonth = (month) => {
  selectedMonth.value = month;
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

const getMonthLabel = (val) => {
  if (val === '') return '';
  const match = availableMonths.value.find(m => m.value === val);
  return match ? match.label : '';
};

const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const toKhmerNumeral = (num) => String(num).split('').map(d => ['០','១','២','៣','៤','៥','៦','៧','៨','៩'][d] || d).join('');

const reportDateText = computed(() => {
  if (activeFilter.value === 'all') {
    return 'ទាំងអស់';
  } else if (activeFilter.value === 'today') {
    const d = new Date();
    return `ថ្ងៃទី ${toKhmerNumeral(d.getDate())} ខែ${khmerMonths[d.getMonth()]} ឆ្នាំ${toKhmerNumeral(d.getFullYear())}`;
  } else if (activeFilter.value === 'custom') {
    if (selectedYear.value && selectedMonth.value !== '') {
      return `ខែ${khmerMonths[selectedMonth.value]} ឆ្នាំ${toKhmerNumeral(selectedYear.value)}`;
    } else if (selectedYear.value) {
      return `ឆ្នាំ${toKhmerNumeral(selectedYear.value)}`;
    }
  }
  return '';
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const handleRefresh = () => {
  fetchCheckins();
};

onMounted(() => {
  fetchCheckins();
  window.addEventListener('refresh-admin-checkins', handleRefresh);
});

onUnmounted(() => {
  window.removeEventListener('refresh-admin-checkins', handleRefresh);
});

async function fetchCheckins() {
  if (checkins.value.length === 0) {
    try {
      const cached = localStorage.getItem('library_admin_checkins_cache');
      if (cached) checkins.value = JSON.parse(cached);
    } catch (e) {
      console.warn('Failed to parse cached checkins', e);
    }
  }

  if (checkins.value.length === 0) {
    loading.value = true;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/checkins`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch check-ins');
    }
    
    const data = await res.json();
    checkins.value = data;
    localStorage.setItem('library_admin_checkins_cache', JSON.stringify(data));
  } catch (err) {
    if (checkins.value.length === 0) {
      toastStore.show(err.message, { type: 'error', title: 'Error' });
    }
  } finally {
    loading.value = false;
  }
}

const availableYears = computed(() => {
  const years = new Set(checkins.value.map(c => new Date(c.checkin_time).getFullYear()));
  return Array.from(years).filter(y => !isNaN(y)).sort((a, b) => b - a);
});

const availableMonths = computed(() => {
  if (!selectedYear.value) return [];
  const checkinsInYear = checkins.value.filter(c => new Date(c.checkin_time).getFullYear() == selectedYear.value);
  const months = new Set(checkinsInYear.map(c => new Date(c.checkin_time).getMonth()));
  return Array.from(months).filter(m => !isNaN(m)).sort((a, b) => a - b).map(m => ({
    value: m,
    label: new Date(2000, m, 1).toLocaleString('default', { month: 'long' })
  }));
});

watch(selectedYear, (newVal) => {
  selectedMonth.value = '';
  if (newVal) {
    activeFilter.value = 'custom';
  } else if (activeFilter.value === 'custom') {
    activeFilter.value = 'all';
  }
});

watch(selectedMonth, (newVal) => {
  if (newVal !== '') {
    activeFilter.value = 'custom';
  }
});

watch(activeFilter, (newVal) => {
  currentPage.value = 1;
  if (newVal !== 'custom') {
    selectedYear.value = '';
    selectedMonth.value = '';
  }
});

const filteredCheckins = computed(() => {
  let list = checkins.value;
  
  if (activeFilter.value === 'today') {
    const todayStr = new Date().toISOString().split('T')[0];
    list = list.filter(c => c.checkin_time && c.checkin_time.startsWith(todayStr));
  } else if (activeFilter.value === 'custom') {
    list = list.filter(c => {
      if (!c.checkin_time) return false;
      const d = new Date(c.checkin_time);
      if (isNaN(d.getTime())) return false;
      
      const yearMatch = selectedYear.value ? d.getFullYear() == selectedYear.value : true;
      const monthMatch = selectedMonth.value !== '' ? d.getMonth() == selectedMonth.value : true;
      
      return yearMatch && monthMatch;
    });
  }
  
  // Group by unique user reliably
  const grouped = {};
  for (const c of list) {
    const key = (c.user_email && c.user_email !== 'N/A') ? c.user_email 
              : (c.user_name && c.user_name !== 'Unknown') ? c.user_name 
              : c._id ? c._id 
              : c.id ? c.id 
              : 'Unknown_User_Group';
              
    if (!grouped[key]) {
      grouped[key] = { ...c, total_checkins: 1, unique_key: key };
    } else {
      if (new Date(c.checkin_time).getTime() > new Date(grouped[key].checkin_time).getTime()) {
        const currentTotal = grouped[key].total_checkins;
        grouped[key] = { ...c, total_checkins: currentTotal + 1, unique_key: key };
      } else {
        grouped[key].total_checkins += 1;
      }
    }
  }
  
  // Create a fresh array for sorting to absolutely guarantee Vue reactivity
  const results = [...Object.values(grouped)];
  
  if (sortCheckinsBy.value === 'total_desc') {
    results.sort((a, b) => (b.total_checkins || 0) - (a.total_checkins || 0) || new Date(b.checkin_time).getTime() - new Date(a.checkin_time).getTime());
  } else if (sortCheckinsBy.value === 'total_asc') {
    results.sort((a, b) => (a.total_checkins || 0) - (b.total_checkins || 0) || new Date(b.checkin_time).getTime() - new Date(a.checkin_time).getTime());
  } else {
    results.sort((a, b) => new Date(b.checkin_time).getTime() - new Date(a.checkin_time).getTime());
  }
  
  return results;
});

const printTotalCheckins = computed(() => {
  return filteredCheckins.value.reduce((total, c) => total + (c.total_checkins || 1), 0);
});

const totalPages = computed(() => Math.ceil(filteredCheckins.value.length / itemsPerPage.value) || 1);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const paginatedCheckins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredCheckins.value.slice(start, start + itemsPerPage.value);
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatLocation(lat, lng) {
  if (lat == null || lng == null) return 'Unknown';
  return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
}
</script>
