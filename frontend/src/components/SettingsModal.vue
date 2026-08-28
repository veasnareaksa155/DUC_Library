<template>
  <Teleport to="body">
    <Transition name="settings-modal">
    <div v-if="isOpen" class="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 sm:backdrop-blur-sm transition-opacity" @click="close"></div>
      
      <!-- Modal -->
      <div class="modal-content relative bg-[var(--bg-primary)] sm:border border-[var(--border-color)] rounded-none sm:rounded-[24px] shadow-2xl w-full h-full sm:max-w-4xl sm:h-[80vh] sm:max-h-[700px] flex flex-col overflow-hidden">
      
      <!-- Header (Fixed at top) -->
      <div class="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shrink-0 relative z-30">
        <h2 class="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2.5">
          <div class="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Settings :size="20" stroke-width="2.5" />
          </div>
          Settings
        </h2>
        <button @click="close" class="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
          <X :size="22" stroke-width="2.5" />
        </button>
      </div>

      <!-- Body / Split Layout -->
      <div class="flex flex-1 overflow-hidden relative">
        
        <!-- Sidebar (Menu) -->
        <div :class="[
          'w-full sm:w-[260px] shrink-0 sm:border-r border-[var(--border-color)] bg-[var(--bg-primary)] sm:bg-[var(--bg-secondary)]/30 p-4 sm:p-5 flex flex-col space-y-2 custom-scrollbar overflow-y-auto absolute sm:relative inset-0 z-10 transition-transform duration-300 ease-in-out',
          showMobileMenu ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        ]">
          
          <button 
            @click="selectTab('appearance')" 
            :class="[
              'w-full flex items-center justify-between p-4 sm:px-4 sm:py-3.5 rounded-2xl sm:rounded-xl transition-all font-bold text-[1.05rem] sm:text-[0.95rem]',
              activeTab === 'appearance' 
                ? 'bg-[var(--bg-secondary)]/80 text-[var(--text-primary)] sm:bg-indigo-500 sm:text-white sm:shadow-md' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 sm:hover:bg-indigo-500/5 sm:hover:text-indigo-600'
            ]"
          >
            <div class="flex items-center gap-3.5">
              <Palette :size="20" stroke-width="2.5" class="text-indigo-500 sm:text-inherit" />
              <span>Appearance</span>
            </div>
            <ChevronRight :size="20" class="sm:hidden opacity-40" />
          </button>
          
          <button 
            @click="selectTab('language')" 
            :class="[
              'w-full flex items-center justify-between p-4 sm:px-4 sm:py-3.5 rounded-2xl sm:rounded-xl transition-all font-bold text-[1.05rem] sm:text-[0.95rem]',
              activeTab === 'language' 
                ? 'bg-[var(--bg-secondary)]/80 text-[var(--text-primary)] sm:bg-indigo-500 sm:text-white sm:shadow-md' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 sm:hover:bg-indigo-500/5 sm:hover:text-indigo-600'
            ]"
          >
            <div class="flex items-center gap-3.5">
              <Globe :size="20" stroke-width="2.5" class="text-blue-500 sm:text-inherit" />
              <span>Language</span>
            </div>
            <ChevronRight :size="20" class="sm:hidden opacity-40" />
          </button>

          <button 
            @click="selectTab('security')" 
            :class="[
              'w-full flex items-center justify-between p-4 sm:px-4 sm:py-3.5 rounded-2xl sm:rounded-xl transition-all font-bold text-[1.05rem] sm:text-[0.95rem]',
              activeTab === 'security' 
                ? 'bg-[var(--bg-secondary)]/80 text-[var(--text-primary)] sm:bg-indigo-500 sm:text-white sm:shadow-md' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 sm:hover:bg-indigo-500/5 sm:hover:text-indigo-600'
            ]"
          >
            <div class="flex items-center gap-3.5">
              <ShieldCheck :size="20" stroke-width="2.5" class="text-emerald-500 sm:text-inherit" />
              <span>Security</span>
            </div>
            <ChevronRight :size="20" class="sm:hidden opacity-40" />
          </button>

          <button 
            @click="selectTab('sessions')" 
            :class="[
              'w-full flex items-center justify-between p-4 sm:px-4 sm:py-3.5 rounded-2xl sm:rounded-xl transition-all font-bold text-[1.05rem] sm:text-[0.95rem]',
              activeTab === 'sessions' 
                ? 'bg-[var(--bg-secondary)]/80 text-[var(--text-primary)] sm:bg-indigo-500 sm:text-white sm:shadow-md' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 sm:hover:bg-indigo-500/5 sm:hover:text-indigo-600'
            ]"
          >
            <div class="flex items-center gap-3.5">
              <Laptop :size="20" stroke-width="2.5" class="text-blue-500 sm:text-inherit" />
              <span>Sessions</span>
            </div>
            <ChevronRight :size="20" class="sm:hidden opacity-40" />
          </button>

          <div class="mt-auto pt-4 border-t border-[var(--border-color)]">
            <button 
              @click="handleLogout" 
              class="w-full flex items-center justify-center sm:justify-start gap-3.5 p-4 sm:px-4 sm:py-3.5 rounded-2xl sm:rounded-xl transition-all font-bold text-[1.05rem] sm:text-[0.95rem] text-red-500 hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut :size="20" stroke-width="2.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

        <!-- Content Area -->
        <div :class="[
          'flex-1 flex flex-col bg-[var(--bg-primary)] absolute sm:relative inset-0 z-20 sm:z-10 transition-transform duration-300 ease-in-out',
          !showMobileMenu ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'
        ]">
          
          <!-- Mobile Back Button Header -->
          <div class="sm:hidden flex items-center p-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
            <button @click="backToMenu" class="flex items-center gap-1 text-indigo-500 font-bold p-2 pr-4 rounded-xl hover:bg-indigo-500/10 transition-colors">
              <ChevronLeft :size="22" stroke-width="2.5" /> Back
            </button>
            <span class="absolute left-1/2 -translate-x-1/2 font-extrabold text-[1.1rem]">{{ currentTabTitle }}</span>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar">
            
            <!-- APPEARANCE TAB -->
            <div v-if="activeTab === 'appearance'" class="animate-fade-in">
              <h3 class="hidden sm:block text-2xl font-extrabold text-[var(--text-primary)] mb-2">Appearance</h3>
              <p class="hidden sm:block text-[0.95rem] text-[var(--text-secondary)] mb-8">
                Customize the look and feel of the application.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <!-- Light Mode Option -->
                <button 
                  @click="themeStore.setTheme(false)"
                  :class="[
                    'group flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden',
                    !themeStore.isDark 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10' 
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/30 hover:bg-indigo-500/5'
                  ]"
                >
                  <div :class="[
                    'w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors shadow-sm relative z-10',
                    !themeStore.isDark ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] group-hover:bg-indigo-500/10 group-hover:text-indigo-500'
                  ]">
                    <Sun :size="26" stroke-width="2.5" />
                  </div>
                  <h4 class="font-bold text-[1.15rem] text-[var(--text-primary)] mb-1 relative z-10">Light Mode</h4>
                  <p class="text-[0.9rem] text-[var(--text-secondary)] relative z-10">
                    Clear and readable for bright environments.
                  </p>
                  
                  <div v-if="!themeStore.isDark" class="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                    <Check :size="14" stroke-width="3" />
                  </div>
                </button>

                <!-- Dark Mode Option -->
                <button 
                  @click="themeStore.setTheme(true)"
                  :class="[
                    'group flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden',
                    themeStore.isDark 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10' 
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/30 hover:bg-indigo-500/5'
                  ]"
                >
                  <div :class="[
                    'w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors shadow-sm relative z-10',
                    themeStore.isDark ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] group-hover:bg-indigo-500/10 group-hover:text-indigo-500'
                  ]">
                    <Moon :size="26" stroke-width="2.5" />
                  </div>
                  <h4 class="font-bold text-[1.15rem] text-[var(--text-primary)] mb-1 relative z-10">Dark Mode</h4>
                  <p class="text-[0.9rem] text-[var(--text-secondary)] relative z-10">
                    Easier on the eyes for dark environments.
                  </p>
                  
                  <div v-if="themeStore.isDark" class="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                    <Check :size="14" stroke-width="3" />
                  </div>
                </button>
              </div>
            </div>

            <!-- LANGUAGE TAB -->
            <div v-if="activeTab === 'language'" class="animate-fade-in">
              <h3 class="hidden sm:block text-2xl font-extrabold text-[var(--text-primary)] mb-2">Language Preference</h3>
              <p class="hidden sm:block text-[0.95rem] text-[var(--text-secondary)] mb-8">
                Select your preferred language for the interface.
              </p>

              <div class="flex flex-col gap-3">
                
                <!-- English Option -->
                <button 
                  @click="localeStore.setLanguage('en')"
                  :class="[
                    'group w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all overflow-hidden relative',
                    localeStore.currentLang === 'en' 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10' 
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/30 hover:bg-indigo-500/5'
                  ]"
                >
                  <div class="flex items-center gap-4 relative z-10">
                    <div class="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm border border-[var(--border-color)] group-hover:border-indigo-500/50 transition-colors">
                      <img src="https://flagcdn.com/w80/us.png" alt="English (US)" class="w-full h-full object-cover object-center" />
                    </div>
                    <div class="text-left">
                      <h4 class="font-bold text-[1.15rem] text-[var(--text-primary)] leading-tight mb-0.5">English</h4>
                      <p class="text-[0.85rem] text-[var(--text-secondary)]">American English</p>
                    </div>
                  </div>
                  <div v-if="localeStore.currentLang === 'en'" class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm relative z-10">
                    <Check :size="14" stroke-width="3" />
                  </div>
                </button>

                <!-- Khmer Option -->
                <button 
                  @click="localeStore.setLanguage('km')"
                  :class="[
                    'group w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all overflow-hidden relative',
                    localeStore.currentLang === 'km' 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10' 
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/30 hover:bg-indigo-500/5'
                  ]"
                >
                  <div class="flex items-center gap-4 relative z-10">
                    <div class="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm border border-[var(--border-color)] group-hover:border-indigo-500/50 transition-colors">
                      <img src="https://flagcdn.com/w80/kh.png" alt="Khmer (Cambodia)" class="w-full h-full object-cover object-center" />
                    </div>
                    <div class="text-left">
                      <h4 class="font-bold text-[1.15rem] text-[var(--text-primary)] leading-tight mb-0.5 font-khmer">ភាសាខ្មែរ</h4>
                      <p class="text-[0.85rem] text-[var(--text-secondary)]">Khmer Language</p>
                    </div>
                  </div>
                  <div v-if="localeStore.currentLang === 'km'" class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm relative z-10">
                    <Check :size="14" stroke-width="3" />
                  </div>
                </button>
              </div>
            </div>

            <!-- SECURITY TAB -->
            <div v-if="activeTab === 'security'" class="animate-fade-in relative h-full flex flex-col">
              <!-- 2FA Section -->
              <h3 class="hidden sm:block text-2xl font-extrabold text-[var(--text-primary)] mb-2">Two-Factor Authentication</h3>
              <p class="hidden sm:block text-[0.95rem] text-[var(--text-secondary)] mb-6">
                Add an extra layer of security to your account.
              </p>

              <div class="relative overflow-hidden p-6 mb-10 rounded-[24px] border-2 border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 group">
                <div class="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div class="relative z-10">
                  <h4 class="font-extrabold text-[1.15rem] text-[var(--text-primary)] flex items-center gap-2">
                    Status: 
                    <span v-if="is2FAEnabled" class="text-emerald-500 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 shadow-sm"><Check :size="16" stroke-width="3"/> Enabled</span>
                    <span v-else class="text-amber-500 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 shadow-sm"><AlertCircle :size="16" stroke-width="2.5"/> Disabled</span>
                  </h4>
                  <p class="text-[0.95rem] text-[var(--text-secondary)] mt-2.5 max-w-sm leading-relaxed">
                    Protect your account by requiring an authentication code in addition to your password.
                  </p>
                </div>
                <button v-if="!is2FAEnabled" @click="start2FASetup" :disabled="starting2FA" class="relative z-10 px-7 py-3.5 rounded-[16px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold whitespace-nowrap hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2">
                  <Loader2 v-if="starting2FA" class="animate-spin" :size="20"/>
                  Enable 2FA
                </button>
                <button v-else @click="handleDisable2FA" class="relative z-10 px-7 py-3.5 rounded-[16px] bg-red-500/10 text-red-500 border border-red-500/20 font-bold whitespace-nowrap hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all">
                  Disable 2FA
                </button>
              </div>
            </div>

            <!-- SESSIONS TAB -->
            <div v-if="activeTab === 'sessions'" class="animate-fade-in relative h-full flex flex-col">
              <!-- Active Sessions Section -->
              <h3 class="hidden sm:block text-2xl font-extrabold text-[var(--text-primary)] mb-2">Active Sessions</h3>
              <p class="hidden sm:block text-[0.95rem] text-[var(--text-secondary)] mb-8">
                Manage the devices that are currently logged into your account.
              </p>

              <div v-if="loading && authStore.sessions.length === 0" class="flex justify-center p-12">
                <Loader2 class="animate-spin text-indigo-500" :size="40" />
              </div>
              
              <div v-else-if="authStore.sessions.length === 0 && !loading" class="text-center p-12 text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-secondary)]/30">
                <ShieldCheck :size="56" class="mx-auto mb-4 opacity-50" />
                <p class="font-bold text-[1.15rem]">No active sessions found.</p>
                <p class="text-[0.95rem] mt-1">You are not logged in anywhere.</p>
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="session in authStore.sessions" 
                  :key="session.id"
                  @click="selectedSession = session"
                  class="relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-[24px] border-2 border-[var(--border-color)] bg-[var(--bg-card)] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.02] to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div class="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                    <!-- Device Icon -->
                    <div class="w-14 h-14 shrink-0 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300 text-[var(--text-muted)] shadow-inner">
                      <Laptop v-if="session.device_type === 'desktop'" :size="26" stroke-width="2.5" />
                      <Smartphone v-else-if="session.device_type === 'mobile'" :size="26" stroke-width="2.5" />
                      <Monitor v-else :size="26" stroke-width="2.5" />
                    </div>

                    <!-- Details -->
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <h4 class="font-extrabold text-[1.1rem] text-[var(--text-primary)] truncate group-hover:text-indigo-500 transition-colors">
                          {{ session.device_name || session.os || 'Unknown Device' }}
                        </h4>
                        <span v-if="session.id === currentSessionId" class="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider shadow-sm">
                          Current
                        </span>
                      </div>
                      <div class="text-[0.85rem] text-[var(--text-secondary)] flex items-center gap-2 truncate mb-1">
                        <span>{{ session.os || 'Unknown OS' }} &middot; {{ session.browser || 'Unknown Browser' }}</span>
                      </div>
                      <div class="text-[0.8rem] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                        {{ session.location || 'Unknown Location' }} &middot; {{ new Date(session.created_at).toLocaleString() }}
                      </div>
                    </div>
                  </div>

                  <!-- Action -->
                  <div class="shrink-0 pt-2 sm:pt-0 relative z-10" v-if="session.id !== currentSessionId">
                    <button 
                      @click.stop="terminate(session.id)"
                      :disabled="terminatingId === session.id"
                      class="w-full sm:w-auto text-[0.9rem] font-bold px-5 py-3 rounded-[14px] border-2 border-[var(--border-color)] text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span v-if="terminatingId === session.id" class="flex items-center gap-2">
                        <Loader2 :size="18" class="animate-spin" /> Terminating...
                      </span>
                      <span v-else class="flex items-center gap-2">
                        <LogOut :size="18" stroke-width="2.5" /> Terminate
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Session Detail Sub-view -->
          <Transition name="slide-left">
            <div v-if="selectedSession" class="absolute inset-0 z-50 bg-[var(--bg-primary)] flex flex-col">
            <div class="flex items-center gap-3 p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
              <button @click="selectedSession = null" class="p-2 -ml-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
                <ChevronLeft :size="24" stroke-width="2.5" />
              </button>
              <h3 class="font-extrabold text-[1.15rem]">Session Details</h3>
            </div>
            
            <div class="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar bg-[var(--bg-primary)]">
              <!-- Detail Icon -->
              <div class="flex justify-center mb-4">
                 <div class="w-24 h-24 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                    <Laptop v-if="selectedSession.device_type === 'desktop'" :size="48" stroke-width="2" />
                    <Smartphone v-else-if="selectedSession.device_type === 'mobile'" :size="48" stroke-width="2" />
                    <Monitor v-else :size="48" stroke-width="2" />
                 </div>
              </div>
              
              <!-- Info List -->
              <div class="space-y-4 bg-[var(--bg-secondary)]/30 rounded-2xl p-5 border border-[var(--border-color)]">
                 <div class="flex flex-col gap-1">
                   <span class="text-[0.7rem] text-[var(--text-muted)] font-bold uppercase tracking-wider">Device Name / OS</span>
                   <span class="font-bold text-[1.05rem] text-[var(--text-primary)]">{{ selectedSession.device_name || selectedSession.os || 'Unknown Device' }}</span>
                 </div>
                 <div class="w-full h-px bg-[var(--border-color)]/50"></div>
                 
                 <div class="flex flex-col gap-1">
                   <span class="text-[0.7rem] text-[var(--text-muted)] font-bold uppercase tracking-wider">Browser</span>
                   <span class="font-medium text-[0.95rem] text-[var(--text-primary)]">{{ selectedSession.browser || 'Unknown' }}</span>
                 </div>
                 <div class="w-full h-px bg-[var(--border-color)]/50"></div>
                 
                 <div class="flex flex-col gap-1">
                   <span class="text-[0.7rem] text-[var(--text-muted)] font-bold uppercase tracking-wider">Location / IP Address</span>
                   <span class="font-medium text-[0.95rem] text-[var(--text-primary)]">{{ selectedSession.location || 'Unknown Location' }} &middot; {{ selectedSession.ip_address || 'Hidden' }}</span>
                 </div>
                 <div class="w-full h-px bg-[var(--border-color)]/50"></div>
                 
                 <div class="flex flex-col gap-1">
                   <span class="text-[0.7rem] text-[var(--text-muted)] font-bold uppercase tracking-wider">Sign-In Time</span>
                   <span class="font-medium text-[0.95rem] text-[var(--text-primary)]">{{ new Date(selectedSession.created_at).toLocaleString() }}</span>
                 </div>
                 <div class="w-full h-px bg-[var(--border-color)]/50"></div>
                 
                 <div class="flex flex-col gap-1">
                   <span class="text-[0.7rem] text-[var(--text-muted)] font-bold uppercase tracking-wider">Last Active</span>
                   <span class="font-medium text-[0.95rem] text-[var(--text-primary)]">{{ new Date(selectedSession.last_active).toLocaleString() }}</span>
                 </div>
              </div>

              <!-- Terminate Button -->
              <button 
                v-if="selectedSession.id !== currentSessionId"
                @click="terminate(selectedSession.id)"
                :disabled="terminatingId === selectedSession.id"
                class="w-full mt-4 py-4 rounded-xl font-bold text-[1.05rem] text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex justify-center items-center gap-2"
              >
                <LogOut v-if="terminatingId !== selectedSession.id" :size="20" stroke-width="2.5" />
                <Loader2 v-else :size="20" class="animate-spin" />
                {{ terminatingId === selectedSession.id ? 'Terminating...' : 'Terminate Session' }}
              </button>
            </div>
          </div>
          </Transition>

          <!-- 2FA Setup Modal -->
          <Transition name="slide-left">
            <div v-if="show2FAModal" class="absolute inset-0 z-50 bg-[var(--bg-primary)] flex flex-col">
              <div class="flex items-center gap-3 p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0">
                <button @click="show2FAModal = false" class="p-2 -ml-2 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
                  <ChevronLeft :size="24" stroke-width="2.5" />
                </button>
                <h3 class="font-black text-[1.2rem] text-[var(--text-primary)] tracking-tight">Enable 2FA</h3>
              </div>
              
              <div class="flex-1 overflow-hidden relative">
                <div class="absolute inset-0 flex transition-transform duration-500 ease-in-out" :style="{ transform: setup2FAStep === 'verify' ? 'translateX(-50%)' : 'translateX(0)', width: '200%' }">
                  
                  <!-- Step 1: Setup -->
                  <div class="w-1/2 h-full overflow-y-auto p-6 sm:p-8 flex flex-col items-center text-center">
                    <ShieldCheck :size="48" class="text-indigo-500 mb-6" />
                    <h4 class="text-xl font-bold mb-2">Setup Authenticator</h4>
                    <p class="text-[0.95rem] text-[var(--text-secondary)] max-w-sm mb-6">
                      Add this key to your authenticator app like Google Authenticator or Authy.
                    </p>

                    <!-- Manual Key -->
                    <div v-if="!showQR" class="w-full max-w-sm mb-6 animate-fade-in flex flex-col items-center justify-center">
                      <div class="group cursor-pointer w-full flex flex-col items-center" @click="copySecret">
                        <div class="relative w-full">
                          <div class="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] px-4 py-4 rounded-2xl font-mono text-[var(--text-primary)] tracking-widest text-lg sm:text-xl group-hover:border-indigo-500/50 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all flex justify-center items-center overflow-hidden">
                            <span class="truncate">{{ twoFASecret || 'Loading...' }}</span>
                            <div class="absolute right-3 shrink-0 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:bg-indigo-500/10 transition-colors">
                              <Copy v-if="!copied" :size="20" />
                              <Check v-else :size="20" class="text-emerald-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button @click="showQR = true" class="mt-4 text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                        Scan QR Code instead
                      </button>
                    </div>

                    <!-- QR Code -->
                    <div v-else class="w-full max-w-sm mb-6 animate-fade-in flex flex-col items-center">
                      <div class="bg-white p-4 rounded-3xl shadow-md mb-4 inline-block border-2 border-[var(--border-color)]">
                        <img :src="twoFAQrCode" class="w-48 h-48" alt="2FA QR Code" />
                      </div>
                      <button @click="showQR = false" class="text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                        Enter setup key manually
                      </button>
                    </div>

                    <div class="mt-auto pt-8 w-full max-w-sm">
                      <button @click="setup2FAStep = 'verify'" class="w-full bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-indigo-600 hover:text-white font-black text-[1.05rem] py-4 rounded-[16px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 group">
                        Proceed to Verify
                        <ChevronRight :size="20" stroke-width="3" class="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>

                  <!-- Step 2: Verify -->
                  <div class="w-1/2 h-full overflow-y-auto p-6 sm:p-8 flex flex-col items-center text-center relative">
                    <div class="w-full max-w-sm flex items-center justify-start mb-6 absolute top-6 left-6 sm:left-8">
                      <button @click="setup2FAStep = 'setup'" class="flex items-center gap-1.5 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <ChevronLeft :size="18" stroke-width="3" /> Back
                      </button>
                    </div>

                    <div class="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 mt-12 sm:mt-10">
                      <Lock :size="32" stroke-width="2.5" />
                    </div>
                    
                    <h4 class="text-xl font-bold mb-2">Verify Code</h4>
                    <p class="text-[0.95rem] text-[var(--text-secondary)] max-w-sm mb-10">
                      Enter the 6-digit code from your authenticator app to enable 2FA.
                    </p>

                    <div class="w-full max-w-sm mx-auto">
                      <OTPInput v-model="twoFAVerifyCode" class="mb-8" />
                      
                      <button @click="confirm2FASetup" :disabled="verifying2FA || twoFAVerifyCode.length !== 6" class="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white font-black text-[1.05rem] py-4 rounded-[16px] transition-all shadow-[0_4px_14px_rgba(99,102,241,0.2)] flex items-center justify-center">
                        <Loader2 v-if="verifying2FA" class="animate-spin mr-2" :size="20"/>
                        Verify & Enable
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </Transition>

        </div>
      </div>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useConfirmStore } from '../stores/confirm';
import { useThemeStore } from '../stores/theme';
import { useLocaleStore } from '../stores/locale';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import OTPInput from './OTPInput.vue';
import { 
  Settings, X, Loader2, Laptop, Smartphone, Monitor,
  Moon, Sun, Globe, Palette, ShieldCheck, LogOut, Check,
  ChevronRight, ChevronLeft, AlertCircle, Copy, Lock
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const toastStore = useToastStore();
const confirmStore = useConfirmStore();
const themeStore = useThemeStore();
const localeStore = useLocaleStore();
const router = useRouter();

const loading = ref(false);
const terminatingId = ref(null);
const activeTab = ref('appearance');
const showMobileMenu = ref(true);
const selectedSession = ref(null);

const is2FAEnabled = ref(false);
const show2FAModal = ref(false);
const setup2FAStep = ref('setup');
const showQR = ref(false);
const starting2FA = ref(false);
const twoFASecret = ref('');
const twoFAQrCode = ref('');
const twoFAVerifyCode = ref('');
const verifying2FA = ref(false);
const copied = ref(false);

const copySecret = () => {
  if (!twoFASecret.value) return;
  navigator.clipboard.writeText(twoFASecret.value);
  copied.value = true;
  toastStore.show('Copied to clipboard!', { type: 'success' });
  setTimeout(() => { copied.value = false; }, 2000);
};

const currentTabTitle = computed(() => {
  if (activeTab.value === 'appearance') return 'Appearance';
  if (activeTab.value === 'language') return 'Language';
  if (activeTab.value === 'security') return 'Security';
  if (activeTab.value === 'sessions') return 'Sessions';
  return '';
});

const currentSessionId = computed(() => {
  if (!authStore.token) return null;
  try {
    const decoded = jwtDecode(authStore.token);
    return decoded.session_id;
  } catch (e) {
    return null;
  }
});

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    loading.value = true;
    activeTab.value = 'appearance';
    showMobileMenu.value = true;
    show2FAModal.value = false;
    twoFAVerifyCode.value = '';
    await authStore.fetchSessions();
    is2FAEnabled.value = await authStore.check2FAStatus();
    loading.value = false;
  }
});

function selectTab(tab) {
  activeTab.value = tab;
  showMobileMenu.value = false;
  selectedSession.value = null;
}

function backToMenu() {
  showMobileMenu.value = true;
  selectedSession.value = null;
  show2FAModal.value = false;
}

function close() {
  emit('close');
}

async function handleLogout() {
  const confirmed = await confirmStore.showConfirm({
    title: 'Log Out',
    message: 'Are you sure you want to log out of this device?',
    confirmText: 'Log Out',
    type: 'danger'
  });
  if (!confirmed) return;
  
  close();
  authStore.logout();
  router.push('/login');
}

async function terminate(id) {
  const confirmed = await confirmStore.showConfirm({
    title: 'Terminate Session',
    message: 'Are you sure you want to terminate this session? The device will be logged out immediately.',
    confirmText: 'Terminate',
    type: 'danger'
  });
  if (!confirmed) return;

  terminatingId.value = id;
  const success = await authStore.terminateSession(id);
  if (success) {
    toastStore.show('Session terminated successfully.', { type: 'success' });
    if (selectedSession.value?.id === id) {
      selectedSession.value = null;
    }
    if (id === currentSessionId.value) {
      close();
      authStore.logout();
      router.push('/login');
    }
  } else {
    toastStore.show('Failed to terminate session.', { type: 'error' });
  }
  terminatingId.value = null;
}

async function start2FASetup() {
  starting2FA.value = true;
  try {
    const data = await authStore.generate2FA();
    twoFASecret.value = data.secret;
    twoFAQrCode.value = data.qrCodeUrl;
    setup2FAStep.value = 'setup';
    showQR.value = false;
    show2FAModal.value = true;
  } catch (err) {
    toastStore.show('Failed to start 2FA setup', { type: 'error' });
  } finally {
    starting2FA.value = false;
  }
}

async function confirm2FASetup() {
  if (!twoFAVerifyCode.value || twoFAVerifyCode.value.length !== 6) return;
  verifying2FA.value = true;
  try {
    await authStore.verify2FASetup(twoFAVerifyCode.value);
    is2FAEnabled.value = true;
    show2FAModal.value = false;
    twoFAVerifyCode.value = '';
    toastStore.show('Two-Factor Authentication Enabled', { type: 'success' });
  } catch (err) {
    toastStore.show(err.message || 'Invalid code', { type: 'error' });
  } finally {
    verifying2FA.value = false;
  }
}

async function handleDisable2FA() {
  const confirmed = await confirmStore.showConfirm({
    title: 'Disable 2FA',
    message: 'Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.',
    confirmText: 'Disable 2FA',
    type: 'danger'
  });
  if (!confirmed) return;

  try {
    await authStore.disable2FA();
    is2FAEnabled.value = false;
    toastStore.show('2FA Disabled', { type: 'success' });
  } catch (err) {
    toastStore.show('Failed to disable 2FA', { type: 'error' });
  }
}
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}
</style>
