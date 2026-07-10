<template>
  <!-- Permission Denied Alert for Monitoring Users -->
  <transition name="fade">
    <div v-if="showPermissionAlert" class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-semibold text-red-800">Access Restricted</h3>
            <p class="mt-1 text-xs text-red-700">
              Monitoring users have view-only access. Contact your administrator for additional permissions.
            </p>
          </div>
          <button 
            @click="showPermissionAlert = false"
            class="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Mobile Overlay -->
  <transition name="fade">
    <div 
      v-if="sidebarOpen && isMobile"
      @click="closeMobileMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      style="margin-top: 56px;"
    ></div>
  </transition>
<!-- Sidebar -->
  <aside 
    class="fixed left-0 top-0 bottom-0 w-80 sm:w-72 bg-white border-r border-gray-200 overflow-y-auto shadow-lg transition-transform duration-300 ease-in-out z-40"
    :class="[
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0'
    ]"
    style="margin-top: 56px;"
  >
    <!-- Logo Area -->
    <div class="p-3 sm:p-4 pt-4 sm:pt-6 lg:pt-8 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm sm:text-base lg:text-lg font-semibold text-indigo-600">Temple Management</h3>
          <p v-if="actualRole" class="text-xs sm:text-sm text-gray-500">{{ formatRoleName(actualRole) }}</p>
        </div>
        <!-- Close button for mobile -->
        <button
          @click="closeMobileMenu"
          class="lg:hidden p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Close menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Navigation Menu -->
    <nav class="px-3 sm:px-4 py-3 sm:py-4 space-y-1">
      <!-- TENANT Navigation -->
      <div v-if="actualRole === 'tenant'" class="space-y-1">
        <!-- Quick Tenant Switch Button (Only for Superadmin accessing as Tenant) -->
        <router-link 
          v-if="isSuperadminAsTenant"
          to="/tenant-selection" 
          class="flex items-center justify-center px-3 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-indigo-200 shadow-sm transition-all duration-200 hover:shadow-md active:scale-95" 
          :class="isActiveRoute('/tenant-selection') ? 'bg-indigo-100 text-indigo-700 border-indigo-400' : 'text-indigo-700 hover:from-purple-100 hover:to-indigo-100 hover:border-indigo-300'" 
          @click="closeMobileMenu"
        >
          <svg class="mr-2 h-5 w-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="font-semibold whitespace-nowrap">Switch Tenant</span>
        </router-link>

        <!-- Divider (Only shown if superadmin) -->
        <div v-if="isSuperadminAsTenant" class="my-3 border-t border-gray-200"></div>

        <router-link to="/tenant/dashboard" class="flex items-center px-3 py-3 text-sm font-medium rounded-md touch-target" :class="isActiveRoute('/tenant/dashboard') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/tenant/dashboard') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </router-link>

        <!-- Create Temple - Disabled for Monitoring Users -->
        <button
          v-if="isMonitoringUser"
          @click="showMonitoringUserAlert"
          class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed bg-gray-50"
          title="Monitoring users are not allowed to create temples"
        >
          <svg class="mr-3 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Temple
        </button>
        <router-link 
          v-else
          to="/tenant/entities/create" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md" 
          :class="isActiveRoute('/tenant/entities/create') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" 
          @click="closeMobileMenu"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/tenant/entities/create') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Temple
        </router-link>

        <!-- Tenant User Management - Disabled for Monitoring Users -->
        <button
          v-if="isMonitoringUser"
          @click="showMonitoringUserAlert"
          class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed bg-gray-50"
          title="Monitoring users are not allowed to manage users"
        >
          <svg class="mr-3 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Tenant User Management
        </button>
        <router-link 
          v-else
          to="/tenant/user-management" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md" 
          :class="isActiveRoute('/tenant/user-management') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" 
          @click="closeMobileMenu"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/tenant/user-management') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Tenant User Management
        </router-link>

        <!-- Reports Dashboard with Subsections -->
        <div class="mt-3">
          <div 
            class="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 cursor-pointer"
            @click="toggleReportsDashboard">
            <div class="flex items-center">
              <svg class="mr-3 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Reports Dashboard</span>
            </div>
            <span class="text-xs font-bold text-indigo-600">
              {{ isReportsDashboardActive ? '−' : '+' }}
            </span>
          </div>

          <transition name="slide-down">
            <div v-if="isReportsDashboardActive" class="mt-1 ml-5 space-y-1 bg-indigo-50 p-2 rounded-md">
              <router-link 
                to="/tenant/reports/temple-register" 
                class="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center"
                :class="isActiveRoute('/tenant/reports/temple-register') ? 'text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-100'"
                @click="closeMobileMenu"
              >
                <svg class="mr-2 h-4 w-4" :class="isActiveRoute('/tenant/reports/temple-register') ? 'text-indigo-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Temple Register Report</span>
              </router-link>

              <router-link 
                to="/tenant/reports/temple-activities" 
                class="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center"
                :class="isActiveRoute('/tenant/reports/temple-activities') ? 'text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-100'"
                @click="closeMobileMenu"
              >
                <svg class="mr-2 h-4 w-4" :class="isActiveRoute('/tenant/reports/temple-activities') ? 'text-indigo-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Temple Activities Report</span>
              </router-link>

              <router-link 
                to="/tenant/reports/birthdays" 
                class="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center"
                :class="isActiveRoute('/tenant/reports/birthdays') ? 'text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-100'"
                @click="closeMobileMenu"
              >
                <svg class="mr-2 h-4 w-4" :class="isActiveRoute('/tenant/reports/birthdays') ? 'text-indigo-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                <span>Devotee Reports</span>
              </router-link>

              <router-link 
                to="/tenant/reports/audit-logs" 
                class="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center"
                :class="isActiveRoute('/tenant/reports/audit-logs') ? 'text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-100'"
                @click="closeMobileMenu"
              >
                <svg class="mr-2 h-4 w-4" :class="isActiveRoute('/tenant/reports/audit-logs') ? 'text-indigo-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Audit Logs Report</span>
              </router-link>
            </div>
          </transition>
        </div>
        
      </div>

      <!-- ENTITY ADMIN Navigation -->
      <div v-else-if="actualRole === 'entity_admin'" class="space-y-1">
        <router-link :to="`/entity/${entityId}/dashboard`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/dashboard`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/dashboard`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </router-link>

        <router-link :to="`/entity/${entityId}/devotees`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/devotees`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/devotees`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Devotees
        </router-link>

        <router-link :to="`/entity/${entityId}/sevas`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/sevas`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/sevas`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Seva Management
        </router-link>

        <router-link :to="`/entity/${entityId}/donations`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/donations`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/donations`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Donations
        </router-link>

        <router-link :to="`/entity/${entityId}/events`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/events`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/events`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Events & Festivals
        </router-link>

        <!-- Communication - Disabled for Monitoring Users -->
        <button
          v-if="isMonitoringUser"
          @click="showMonitoringUserAlert"
          class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed bg-gray-50"
          title="Monitoring users are not allowed to access communication"
        >
          <svg class="mr-3 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Communication
        </button>
        <router-link
          v-else
          :to="`/entity/${entityId}/communication`" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md" 
          :class="isActiveRoute(`/entity/${entityId}/communication`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" 
          @click="closeMobileMenu"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/communication`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Communication
        </router-link>
      </div>

      <!-- DEVOTEE Navigation -->
      <div v-else-if="actualRole === 'devotee'" class="space-y-1">
        <!-- Dashboard - Show on all pages except temple-selection -->
        <router-link 
          v-if="!isActiveRoute('/devotee/temple-selection')"
          :to="`/entity/${entityId}/devotee/dashboard`" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md" 
          :class="isActiveRoute(`/entity/${entityId}/devotee/dashboard`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" 
          @click="closeMobileMenu"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/devotee/dashboard`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </router-link>
        
        <!-- Show all links on dashboard and other pages, only Temple Profile on temple-selection -->
        <template v-if="!isActiveRoute('/devotee/temple-selection')">
          <router-link 
            to="/devotee/temple-selection" 
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md" 
            :class="isActiveRoute('/devotee/temple-selection') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" 
            @click="closeMobileMenu"
          >
            <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/devotee/temple-selection') ? 'text-indigo-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 24 24" stroke="none">
              <path d="M12 2L2 7h3v13h6V14h2v6h6V7h3L12 2zM12 4.5L18 8v10h-4v-4H10v4H6V8l6-3.5z" />
            </svg>
            Temple Selection
          </router-link>

          <router-link 
            to="/devotee/profile/create" 
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md" 
            :class="isActiveRoute('/devotee/profile/create') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" 
            @click="closeMobileMenu"
          >
            <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/devotee/profile/create') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </router-link>

          <router-link :to="`/entity/${entityId}/devotee/seva-booking`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/devotee/seva-booking`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
            <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/devotee/seva-booking`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Book Seva
          </router-link>

          <router-link :to="`/entity/${entityId}/devotee/donations`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/devotee/donations`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
            <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/devotee/donations`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            My Donations
          </router-link>

          <router-link :to="`/entity/${entityId}/devotee/events`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/devotee/events`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
            <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/devotee/events`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Temple Events
          </router-link>
        </template>

        <!-- On temple-selection page, show only Temple Profile -->
        <router-link 
          v-if="isActiveRoute('/devotee/temple-selection')"
          to="/devotee/profile/create" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md" 
          :class="isActiveRoute('/devotee/profile/create') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" 
          @click="closeMobileMenu"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/devotee/profile/create') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </router-link>
      </div>

      <!-- VOLUNTEER Navigation -->
      <div v-else-if="actualRole === 'volunteer'" class="space-y-1">
        <router-link :to="`/entity/${entityId}/volunteer/dashboard`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/volunteer/dashboard`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/volunteer/dashboard`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </router-link>

        <router-link :to="`/entity/${entityId}/volunteer/assignments`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/volunteer/assignments`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/volunteer/assignments`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          My Assignments
        </router-link>

        <router-link :to="`/entity/${entityId}/volunteer/schedule`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/volunteer/schedule`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/volunteer/schedule`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          My Schedule
        </router-link>

        <router-link :to="`/entity/${entityId}/volunteer/events`" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute(`/entity/${entityId}/volunteer/events`) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute(`/entity/${entityId}/volunteer/events`) ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Temple Events
        </router-link>
      </div>

      <!-- SUPERADMIN Navigation -->
      <div v-else-if="actualRole === 'superadmin'" class="space-y-1">
        <router-link to="/superadmin/dashboard" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/superadmin/dashboard') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/superadmin/dashboard') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Super Admin Dashboard
        </router-link>

        <router-link to="/superadmin/tenant-approvals" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/superadmin/tenant-approvals') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/superadmin/tenant-approvals') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Tenant Approvals
        </router-link>

        <router-link to="/superadmin/dashboard" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/superadmin/temples') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/superadmin/dashboard') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Temple Approvals
        </router-link>

        <router-link to="/superadmin/user-management" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/superadmin/user-management') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/superadmin/user-management') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Tenant & User Management
        </router-link>

        <router-link to="/superadmin/role-management" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/superadmin/role-management') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/superadmin/role-management') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          User Role Management
        </router-link>
        
        <router-link to="/superadmin/reset-password" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/superadmin/reset-password') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/superadmin/reset-password') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Reset Password
        </router-link>

        <div class="mt-3">
          <div 
            class="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 cursor-pointer"
            @click="toggleSuperadminReports">
            <div class="flex items-center">
              <svg class="mr-3 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Reports Management</span>
            </div>
            <span class="text-xs font-bold text-indigo-600">
              {{ isSuperadminReportsActive ? '−' : '+' }}
            </span>
          </div>

          <transition name="slide-down">
            <div v-if="isSuperadminReportsActive" class="mt-1 ml-6 space-y-1 bg-indigo-50 p-2 rounded-md">
              <router-link 
                to="/superadmin/reports" 
                class="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center"
                :class="isActiveRoute('/superadmin/reports') ? 'text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-100'"
                @click="closeMobileMenu"
              >
                <svg class="mr-2 h-4 w-4" :class="isActiveRoute('/superadmin/reports') ? 'text-indigo-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Tenant Reports</span>
              </router-link>

              <router-link 
                to="/superadmin/reports/approval-status" 
                class="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center"
                :class="isActiveRoute('/superadmin/reports/approval-status') ? 'text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-100'"
                @click="closeMobileMenu"
              >
                <svg class="mr-2 h-4 w-4" :class="isActiveRoute('/superadmin/reports/approval-status') ? 'text-indigo-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l6 3-6 3 9-3V9l-9-3z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 20l14-8" />
                </svg>
                <span>Approval Status Report</span>
              </router-link>

              <router-link 
                to="/superadmin/reports/user-details" 
                class="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center"
                :class="isActiveRoute('/superadmin/reports/user-details') ? 'text-indigo-700 font-medium' : 'text-gray-700 hover:bg-indigo-100'"
                @click="closeMobileMenu"
              >
                <svg class="mr-2 h-4 w-4" :class="isActiveRoute('/superadmin/reports/user-details') ? 'text-indigo-600' : 'text-gray-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>User Details Report</span>
              </router-link>
            </div>
          </transition>
        </div>
        
        <router-link to="/superadmin/audit-logs" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/superadmin/audit-logs') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/superadmin/audit-logs') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Audit Logs
        </router-link>

        <router-link to="/tenant-selection" class="flex items-center px-3 py-2 text-sm font-medium rounded-md" :class="isActiveRoute('/tenant-selection') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'" @click="closeMobileMenu">
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/tenant-selection') ? 'text-indigo-500' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Tenant Dashboard
        </router-link>
      </div>

      <!-- Default message when no role is set -->
      <div v-else class="text-center py-6">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500">Menu will appear once your role is assigned.</p>
        <p class="text-xs text-gray-400 mt-2">Current path: {{ route.path }}</p>
        <p v-if="user" class="text-xs text-gray-400 mt-1">User role: {{ user.role }}</p>
      </div>
    </nav>
    
    <!-- Help & Support Section -->
    <div class="mt-6 px-4 py-4 border-t border-gray-200">
      <router-link to="/support" class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50" @click="closeMobileMenu">
        <svg class="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Help & Support
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, inject, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  },
  user: {
    type: Object,
    default: null
  }
});

const route = useRoute();
const authStore = useAuthStore();

// Inject sidebar state from parent layout
const sidebarOpen = inject('sidebarOpen', ref(false));
const showPermissionAlert = ref(false);
const isMobile = ref(window.innerWidth < 1024);

const entityId = computed(() => {
  return route.params.id || route.params.entityId || '1';
});

// Check if user is monitoring user
const isMonitoringUser = computed(() => {
  const role = (authStore.userRole || '').toLowerCase()
  const roleId = authStore.user?.roleId || authStore.user?.role_id
  return role === 'monitoring_user' || role === 'monitoringuser' || roleId === 6 || roleId === '6'
})

const isSuperadminAsTenant = computed(() => {
  const userRole = authStore.user?.role?.toLowerCase() || props.user?.role?.toLowerCase();
  const isSuperadmin = userRole === 'superadmin';
  const isOnTenantRoute = route.path.includes('/tenant/');
  return isSuperadmin && isOnTenantRoute;
});

const actualRole = computed(() => {
  if (authStore.user && authStore.user.role) {
    return authStore.user.role.toLowerCase();
  }
  if (props.user && props.user.role) {
    return props.user.role.toLowerCase();
  }
  const path = route.path;
  if (path.includes('/tenant/')) return 'tenant';
  if (path.includes('/devotee/')) return 'devotee';
  if (path.includes('/volunteer/')) return 'volunteer';
  if (path.includes('/entity/') && !path.includes('/devotee/') && !path.includes('/volunteer/')) return 'entity_admin';
  if (path.includes('/superadmin/')) return 'superadmin';
  return '';
});

const isReportsDashboardActive = ref(false);
const isSuperadminReportsActive = ref(false);

const isActiveRoute = (path) => {
  return route.path.startsWith(path);
};

const toggleReportsDashboard = () => {
  isReportsDashboardActive.value = !isReportsDashboardActive.value;
};

const toggleSuperadminReports = () => {
  isSuperadminReportsActive.value = !isSuperadminReportsActive.value;
};

const closeMobileMenu = () => {
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
};

const showMonitoringUserAlert = () => {
  showPermissionAlert.value = true;
  setTimeout(() => {
    showPermissionAlert.value = false;
  }, 5000);
};

const formatRoleName = (role) => {
  if (!role) return '';
  if (role === 'entity_admin') return 'Entity Admin';
  if (role === 'monitoring_user') return 'Monitoring User';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 1024;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.3s ease-out;
}

.slide-down-leave-active {
  transition: all 0.2s ease-in;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Touch target for better mobile UX */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Scrollbar styling */
aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: #f1f1f1;
}

aside::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>