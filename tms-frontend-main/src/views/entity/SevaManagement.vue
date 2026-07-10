<template>
  <div class="min-h-screen bg-gray-50/90">
    <!-- Header with Temple Info -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ temple ? temple.name : 'Loading...' }}</h2>
              <p class="text-sm text-gray-500">{{ temple ? `${temple.city}, ${temple.state}` : 'Loading location...' }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-indigo-700">Seva Management</h3>
            <p class="mt-1 text-sm text-gray-500">
              Manage seva bookings, approvals, and scheduling
            </p>
          </div>
          <div class="flex gap-3">
           <!-- View Toggle Buttons -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="currentView = 'sevas'"
                :class="currentView === 'sevas' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              >
                View Sevas
              </button>
              <button
                @click="currentView = 'bookings'"
                :class="currentView === 'bookings' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              >
                Bookings
              </button>
            </div>
            <button
              @click="handleCreateSevaClick"
              :disabled="isMonitoringUser"
              :class="[
                'inline-flex items-center px-4 py-2.5 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm',
                isMonitoringUser
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              ]"
              :title="isMonitoringUser ? 'Monitoring users are not allowed to create sevas' : 'Create a new seva'"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Seva
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Permission Denied Alert for Monitoring Users -->
    <div v-if="showPermissionAlert" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-semibold text-red-800">Access Restricted</h3>
            <p class="mt-2 text-sm text-red-700">
              You are not allowed to create or modify sevas. Monitoring users have view-only access. 
              Please contact your administrator if you need additional permissions.
            </p>
          </div>
          <button 
            @click="showPermissionAlert = false"
            class="flex-shrink-0 ml-4 text-red-500 hover:text-red-700"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Bookings View (Default) -->
    <div v-if="currentView === 'bookings'" class="px-6 py-6">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-indigo-100 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Bookings</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaList.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => getStatus(s) === 'approved').length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => getStatus(s) === 'pending').length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rejected</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ sevaList.filter(s => getStatus(s) === 'rejected').length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-all duration-200">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
            <div class="relative">
              <input
                v-model="searchFilter"
                type="text"
                placeholder="Search by name, devotee, or type..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              v-model="dateRangeFilter"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Seva Type</label>
            <select
              v-model="typeFilter"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="daily">Daily Sevas</option>
              <option value="special">Special Sevas</option>
              <option value="festival">Festival Sevas</option>
              <option value="personal">Personal Sevas</option>
            </select>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            Showing {{ filteredSevas.length }} of {{ sevaList.length }} bookings
          </div>
          <button
            @click="clearFilters"
            class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Seva Bookings List -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div v-if="filteredSevas.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Devotee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="booking in filteredSevas"
                :key="getId(booking)"
                class="hover:bg-gray-50 transition-colors duration-150"
              >
                <!-- Booking Details Column -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ getSevaName(booking) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ getSevaType(booking) }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1" v-if="getSpecialRequests(booking)">
                    {{ getSpecialRequests(booking) }}
                  </div>
                </td>

                <!-- Devotee Column -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ getDevoteeName(booking) }}</div>
                  <div class="text-xs text-gray-500">{{ getDevoteePhone(booking) }}</div>
                </td>

                <!-- Date & Time Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatBookingDate(booking) }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatBookingTime(booking) }}
                  </div>
                </td>

                <!-- Status Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="getStatusClass(getStatus(booking))" 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    <span :class="getStatusDotClass(getStatus(booking))" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                    {{ (getStatus(booking)).charAt(0).toUpperCase() + (getStatus(booking)).slice(1) }}
                  </span>
                </td>

                <!-- Actions Column -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <!-- View Button -->
                    <button
                      @click="viewSevaDetails(booking)"
                      class="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                      title="View Details"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>

                    <!-- Approve/Reject for Pending -->
                    <template v-if="getStatus(booking) === 'pending'">
                      <button
                        v-if="!isMonitoringUser"
                        @click="approveSeva(booking)"
                        class="text-green-600 hover:text-green-900 transition-colors duration-150"
                        title="Approve"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button
                        v-else
                        @click="showPermissionAlert = true"
                        class="text-gray-400 cursor-not-allowed"
                        title="Monitoring users cannot approve bookings"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      
                      <button
                        v-if="!isMonitoringUser"
                        @click="rejectSeva(booking)"
                        class="text-red-600 hover:text-red-900 transition-colors duration-150"
                        title="Reject"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                      <button
                        v-else
                        @click="showPermissionAlert = true"
                        class="text-gray-400 cursor-not-allowed"
                        title="Monitoring users cannot reject bookings"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredSevas.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new seva.</p>
          <div v-if="!isMonitoringUser" class="mt-6">
            <button
              @click="handleCreateSevaClick"
              class="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add New Seva
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sevas Catalog View -->
    <div v-if="currentView === 'sevas'" class="px-6 py-6">
      <!-- Sevas Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.filter(s => s.is_active || s.status === 'active').length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Daily Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.filter(s => (s.seva_type || s.type) === 'daily').length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Special Sevas</p>
              <p class="text-2xl font-bold text-gray-900">{{ sevaCatalog.filter(s => (s.seva_type || s.type) === 'special').length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sevas Filters -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-all duration-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Sevas</label>
            <div class="relative">
              <input v-model="sevaSearchFilter" type="text" placeholder="Search by name or description..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Seva Type</label>
            <select v-model="sevaTypeFilter" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200">
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="special">Special</option>
              <option value="festival">Festival</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model="sevaStatusFilter" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">Showing {{ filteredSevaCatalog.length }} of {{ sevaCatalog.length }} sevas</div>
          <button @click="clearSevaFilters" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">Clear Filters</button>
        </div>
      </div>

      <!-- Loading indicator for sevas -->
      <div v-if="loadingSevaCatalog" class="flex justify-center items-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Sevas Catalog List -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div v-if="filteredSevaCatalog.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seva Details</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="seva in filteredSevaCatalog" :key="seva.id || seva.ID" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ seva.name || seva.Name }}</div>
                  <div class="text-sm text-gray-500 mt-1">{{ seva.description || seva.Description || 'No description' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ (seva.seva_type || seva.type || 'Unknown').charAt(0).toUpperCase() + (seva.seva_type || seva.type || 'Unknown').slice(1) }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">₹{{ seva.price || '0' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(seva.date) }}</div>
                  <div class="text-sm text-gray-500">{{ seva.start_time && seva.end_time ? `${formatTime(seva.start_time)} - ${formatTime(seva.end_time)}` : 'No time set' }}</div>
                  <div class="text-xs text-gray-400" v-if="seva.duration">Duration: {{ seva.duration }}min</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="seva.is_active || seva.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <span :class="seva.is_active || seva.status === 'active' ? 'bg-green-400' : 'bg-red-400'" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                    {{ seva.is_active || seva.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button 
                      v-if="!isMonitoringUser"
                      @click="editSeva(seva)" 
                      class="text-blue-600 hover:text-blue-900 transition-colors duration-150" 
                      title="Edit Seva"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      v-else
                      @click="showPermissionAlert = true"
                      class="text-gray-400 cursor-not-allowed"
                      title="Monitoring users cannot edit sevas"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    <button 
                      v-if="!isMonitoringUser"
                      @click="confirmDeleteSeva(seva)" 
                      class="text-red-600 hover:text-red-900 transition-colors duration-150" 
                      title="Delete Seva"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                    <button
                      v-else
                      @click="showPermissionAlert = true"
                      class="text-gray-400 cursor-not-allowed"
                      title="Monitoring users cannot delete sevas"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No sevas found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new seva.</p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="sevaToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 text-center mb-2">Delete Seva</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to delete "{{ sevaToDelete.name || sevaToDelete.Name }}"? This action cannot be undone.
          </p>
          <div class="flex space-x-3">
            <button @click="sevaToDelete = null" class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200">Cancel</button>
            <button @click="deleteSeva" :disabled="formLoading" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm">
              <span v-if="formLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Seva Modal -->
    <div
      v-if="showCreateForm || editingSeva"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingSeva ? 'Edit Seva' : 'Create New Seva' }}
          </h2>
          <button
            @click="closeForm"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Seva Form -->
        <div class="p-6">
          <div class="space-y-5">
            <!-- Basic Details Section -->
            <div class="pb-3 mb-3 border-b border-gray-200">
              <h3 class="text-md font-semibold text-gray-700 mb-3">Basic Details</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Seva Name*</label>
                  <input
                    v-model="sevaForm.name"
                    type="text"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter seva name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Seva Type*</label>
                  <select
                    v-model="sevaForm.type"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="" disabled>Select Seva Type</option>
                    <option value="daily">Daily Seva</option>
                    <option value="special">Special Seva</option>
                    <option value="festival">Festival Seva</option>
                    <option value="personal">Personal Seva</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    v-model="sevaForm.description"
                    rows="3"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Add any additional details about this seva"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)*</label>
                  <input
                    v-model="sevaForm.price"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter amount in ₹"
                  />
                </div>
              </div>
            </div>

            <!-- Scheduling Section -->
            <div class="pb-3 mb-3 border-b border-gray-200">
              <h3 class="text-md font-semibold text-gray-700 mb-3">Scheduling</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Seva Date*</label>
                  <input
                    v-model="sevaForm.date"
                    type="date"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                
                <!-- Time Section with Start and End Time -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      v-model="sevaForm.startTime"
                      type="time"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      v-model="sevaForm.endTime"
                      type="time"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
  <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
  <input
    v-model="sevaForm.duration"
    type="number"
    min="1"
    :disabled="sevaForm.startTime && sevaForm.endTime"
    :class="[
      'w-full px-3 py-2.5 border border-gray-300 rounded-lg transition-all duration-200',
      sevaForm.startTime && sevaForm.endTime 
        ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
        : 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
    ]"
    placeholder="Auto-calculated from time range"
  />
  <p v-if="sevaForm.startTime && sevaForm.endTime" class="mt-1 text-xs text-gray-500">
    Auto-calculated from start and end time
  </p>
</div>
                
                <!-- Maximum Slots Per Day Field -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Maximum Bookings Per Day</label>
                  <input
                    v-model="sevaForm.max_bookings_per_day"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter maximum slots available per day"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeForm"
              class="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveSeva"
              :disabled="formLoading"
              class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm"
            >
              <span v-if="formLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>
                {{ editingSeva ? 'Update Seva' : 'Create Seva' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

   <!-- REPLACE YOUR EXISTING Seva Details Modal (around line 600-700) with this complete version -->

<!-- Seva Details Modal -->
<div
  v-if="selectedSeva"
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
>
  <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-900">Booking Details</h2>
      <button
        @click="selectedSeva = null"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- From Details (Devotee Information) -->
        <div class="space-y-4">
          <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              From (Devotee)
            </h4>
            <div class="space-y-2">
              <div>
                <p class="text-xs text-blue-700">Name</p>
                <p class="font-semibold text-blue-900">{{ getDevoteeName(selectedSeva) }}</p>
              </div>
              <div>
                <p class="text-xs text-blue-700">Contact</p>
                <p class="text-sm text-blue-900">{{ getDevoteePhone(selectedSeva) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- To Details (Temple/Recipient Bank Information) -->
        <div class="space-y-4">
          <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-green-900 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                To (Temple Account)
              </h4>
              <div v-if="templeDetails.loading" class="flex items-center">
                <svg class="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <div class="space-y-2">
              <div>
                <p class="text-xs text-green-700">Temple/Organization</p>
                <p class="font-semibold text-green-900">{{ temple?.name || templeDetails.name || 'N/A' }}</p>
              </div>
              <div v-if="templeDetails.bank">
                <p class="text-xs text-green-700">Account Holder</p>
                <p class="text-sm text-green-900">{{ templeDetails.bank.account_holder_name || 'N/A' }}</p>
              </div>
              <div v-if="templeDetails.bank">
                <p class="text-xs text-green-700">Account Number</p>
               <p class="text-sm font-mono text-green-900">
  {{ maskAccountNumber(templeDetails.bank.account_number) }}
</p>

              </div>
              
              <div v-if="!templeDetails.bank && !templeDetails.loading">
                <p class="text-xs text-green-700 italic">Bank details not available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment/Booking Details -->
      <div class="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
        <h4 class="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          Payment & Booking Information
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-indigo-700">Seva Name</p>
            <p class="text-sm font-semibold text-indigo-900">{{ getSevaName(selectedSeva) }}</p>
          </div>
          <div>
            <p class="text-xs text-indigo-700">Booking ID</p>
            <p class="text-sm font-mono text-indigo-900">#{{ getId(selectedSeva) || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-xs text-indigo-700">Amount Paid</p>
            <p class="text-lg font-bold text-indigo-900">₹{{ getAmountPaid(selectedSeva) }}</p>
          </div>
        </div>
      </div>

      <!-- Seva/Transaction Details -->
      <div class="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
        <h4 class="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Seva Details
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-amber-700">Type</p>
            <span class="inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 bg-blue-100 text-blue-800">
              {{ getSevaType(selectedSeva) }}
            </span>
          </div>
          <div>
            <p class="text-xs text-amber-700">Status</p>
            <span :class="getStatusClass(getStatus(selectedSeva))" class="inline-block px-2 py-1 text-xs font-medium rounded-full mt-1">
              {{ (getStatus(selectedSeva)).charAt(0).toUpperCase() + (getStatus(selectedSeva)).slice(1) }}
            </span>
          </div>
          <div>
            <p class="text-xs text-amber-700">Date</p>
            <p class="text-sm text-amber-900">{{ formatBookingDate(selectedSeva) }}</p>
          </div>
          <div>
            <p class="text-xs text-amber-700">Time</p>
            <p class="text-sm text-amber-900">{{ formatBookingTime(selectedSeva) }}</p>
          </div>
        </div>
        <div v-if="getSpecialRequests(selectedSeva)" class="mt-3 pt-3 border-t border-amber-300">
          <p class="text-xs text-amber-700">Special Requests</p>
          <p class="text-sm text-amber-900">{{ getSpecialRequests(selectedSeva) }}</p>
        </div>
        <div class="mt-3 pt-3 border-t border-amber-300">
          <p class="text-xs text-amber-700">Booking Date</p>
          <p class="text-sm text-amber-900">{{ formatDate(getCreatedAt(selectedSeva)) }}</p>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div v-if="getStatus(selectedSeva) === 'pending' && !isMonitoringUser" class="flex justify-end space-x-3 pt-4 border-t">
        <button
          @click="rejectSeva(selectedSeva)"
          class="px-4 py-2.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200"
        >
          Reject Booking
        </button>
        <button
          @click="approveSeva(selectedSeva)"
          class="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm"
        >
          Approve Booking
        </button>
      </div>
      
      <!-- Read-only message for monitoring users -->
      <div v-if="getStatus(selectedSeva) === 'pending' && isMonitoringUser" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm text-yellow-800">You have view-only access. Contact an administrator to approve or reject this booking.</p>
        </div>
      </div>
    </div>
  </div>
</div>

    <!-- Toast Notifications -->
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="fixed top-4 right-4 z-50 transform transition-all duration-300"
      :class="toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
    >
      <div
        class="px-4 py-3 rounded-lg shadow-lg border-l-4 max-w-sm"
        :class="{
          'bg-green-50 border-green-400 text-green-800': toast.type === 'success',
          'bg-red-50 border-red-400 text-red-800': toast.type === 'error',
          'bg-yellow-50 border-yellow-400 text-yellow-800': toast.type === 'warning',
          'bg-blue-50 border-blue-400 text-blue-800': toast.type === 'info'
        }"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSevaStore } from '@/stores/seva'
import { sevaService } from '@/services/seva.service'
import { useTempleStore } from '@/stores/temple'
import { useAuthStore } from '@/stores/auth'
import api from '@/plugins/axios'

// Get entity ID from route
const route = useRoute()
const entityId = route.params.id

// Initialize stores
const sevaStore = useSevaStore()
const templeStore = useTempleStore()
const authStore = useAuthStore()

// Check if user is monitoring user
const isMonitoringUser = computed(() => {
  const role = (authStore.userRole || '').toLowerCase()
  const roleId = authStore.user?.roleId || authStore.user?.role_id
  // Check both role name and roleId (6 for monitoring_user)
  return role === 'monitoring_user' || role === 'monitoringuser' || roleId === 6 || roleId === '6'
})

// Local state
const temple = ref(null)
const loading = ref(false)
const formLoading = ref(false)
const showCreateForm = ref(false)
const editingSeva = ref(null)
const selectedSeva = ref(null)
const toasts = ref([])
const nextToastId = ref(1)
const sevaList = ref([])
const sevaCache = ref({})
const showPermissionAlert = ref(false)

// View and filter states
const currentView = ref('sevas')
const loadingSevaCatalog = ref(false)
const sevaCatalog = ref([])
const sevaToDelete = ref(null)

// Filters - for bookings
const searchFilter = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const dateRangeFilter = ref('')

// Filters - for sevas catalog
const sevaSearchFilter = ref('')
const sevaTypeFilter = ref('')
const sevaStatusFilter = ref('')

// ========================================
// NEW: Temple/Entity bank details state
// ========================================
const templeDetails = ref({
  id: null,
  name: '',
  loading: false,
  error: null,
  bank: null,
  creator: null
})

// Hardcoded mapping of seva_id to seva name and type
const sevaMapping = {
  1: { name: 'Archana Seva', type: 'daily' },
  2: { name: 'Anadhana Seva', type: 'daily' },
  3: { name: 'Archana Seva', type: 'daily' }
}

// Helper functions to handle both lowercase and uppercase field names
const getId = (booking) => booking?.ID || booking?.id || 0
const getSevaId = (booking) => booking?.SevaID || booking?.seva_id || 1
const getUserId = (booking) => booking?.UserID || booking?.user_id || 0
const getEntityId = (booking) => booking?.EntityID || booking?.entity_id || 0
const getStatus = (booking) => booking?.Status || booking?.status || 'pending'
const getSpecialRequests = (booking) => booking?.SpecialRequests || booking?.special_requests || ''
//const getAmountPaid = (booking) => booking?.AmountPaid || booking?.amount_paid || 0
const getAmountPaid = (booking) =>
  booking?.AmountPaid ??
  booking?.amount_paid ??
  booking?.Amount ??
  booking?.amount ??
  0

const getBookingTime = (booking) => booking?.BookingTime || booking?.booking_time || null
const getCreatedAt = (booking) => booking?.CreatedAt || booking?.created_at || null
const getUpdatedAt = (booking) => booking?.UpdatedAt || booking?.updated_at || null
const getDevoteeName = (booking) => booking?.DevoteeName || booking?.devotee_name || 'Dileep'
const getDevoteePhone = (booking) => booking?.DevoteePhone || booking?.devotee_phone || '8765453434'

// Helper function to get Seva name from a booking
const getSevaName = (booking) => {
  if (!booking) return 'Unknown Seva'
  
  if (booking.SevaName || booking.seva_name) {
    return booking.SevaName || booking.seva_name
  }
  
  const sevaId = getSevaId(booking)
  if (sevaMapping[sevaId]) {
    return sevaMapping[sevaId].name
  }
  
  return 'Archana Seva'
}
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'N/A'

  const str = accountNumber.toString()
  if (str.length <= 4) return str

  const last4 = str.slice(-4)
  const masked = 'X'.repeat(str.length - 4)

  return masked + last4
}

// Helper function to get Seva type from a booking
const getSevaType = (booking) => {
  if (!booking) return 'Not Categorized'
  
  if (booking.SevaType || booking.seva_type) {
    return booking.SevaType || booking.seva_type
  }
  
  const sevaId = getSevaId(booking)
  if (sevaMapping[sevaId]) {
    return sevaMapping[sevaId].type
  }
  
  return 'daily'
}

// Format the booking date from BookingTime field
const formatBookingDate = (booking) => {
  const dateTime = getBookingTime(booking)
  if (!dateTime) return 'No Date'
  
  try {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting booking date:', error, dateTime)
    return 'No Date'
  }
}

// Format the booking time from BookingTime field
const formatBookingTime = (booking) => {
  const dateTime = getBookingTime(booking)
  if (!dateTime) return ''
  
  try {
    const date = new Date(dateTime)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting booking time:', error, dateTime)
    return ''
  }
}

// Computed filtered sevas
const filteredSevas = computed(() => {
  let filtered = [...sevaList.value]
  
  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase()
    filtered = filtered.filter(booking => {
      const sevaName = getSevaName(booking).toLowerCase()
      const sevaType = getSevaType(booking).toLowerCase()
      return sevaName.includes(search) ||
        (getSpecialRequests(booking) || '').toLowerCase().includes(search) ||
        (getDevoteeName(booking) || '').toLowerCase().includes(search) ||
        sevaType.includes(search)
    })
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(booking => getStatus(booking) === statusFilter.value)
  }
  
  if (typeFilter.value) {
    filtered = filtered.filter(booking => {
      return getSevaType(booking).toLowerCase() === typeFilter.value.toLowerCase()
    })
  }
  
  if (dateRangeFilter.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const getBookingDate = (booking) => {
      const bookingTime = getBookingTime(booking)
      if (bookingTime) return new Date(bookingTime)
      
      const createdAt = getCreatedAt(booking)
      if (createdAt) return new Date(createdAt)
      
      return null
    }
    
    if (dateRangeFilter.value === 'today') {
      filtered = filtered.filter(booking => {
        const bookingDate = getBookingDate(booking)
        if (!bookingDate) return false
        
        const bookingDay = new Date(bookingDate)
        bookingDay.setHours(0, 0, 0, 0)
        return bookingDay.getTime() === today.getTime()
      })
    } else if (dateRangeFilter.value === 'week') {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      filtered = filtered.filter(booking => {
        const bookingDate = getBookingDate(booking)
        if (!bookingDate) return false
        return bookingDate >= weekStart && bookingDate <= weekEnd
      })
    } else if (dateRangeFilter.value === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
      filtered = filtered.filter(booking => {
        const bookingDate = getBookingDate(booking)
        if (!bookingDate) return false
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })
    }
  }
  
  return filtered
})

// Computed filtered seva catalog
const filteredSevaCatalog = computed(() => {
  let filtered = [...sevaCatalog.value]
  
  if (sevaSearchFilter.value) {
    const search = sevaSearchFilter.value.toLowerCase()
    filtered = filtered.filter(seva => {
      const name = (seva.name || seva.Name || '').toLowerCase()
      const description = (seva.description || seva.Description || '').toLowerCase()
      return name.includes(search) || description.includes(search)
    })
  }
  
  if (sevaTypeFilter.value) {
    filtered = filtered.filter(seva => {
      const type = seva.seva_type || seva.type || ''
      return type.toLowerCase() === sevaTypeFilter.value.toLowerCase()
    })
  }
  
  if (sevaStatusFilter.value) {
    filtered = filtered.filter(seva => {
      const isActive = seva.is_active || seva.status === 'active'
      return sevaStatusFilter.value === 'active' ? isActive : !isActive
    })
  }
  
  return filtered
})

// Form data for create/edit
const sevaForm = ref({
  name: '',
  type: '',
  description: '',
  price: 0,
  duration: 30,
  date: '',
  startTime: '',
  endTime: '',
  max_bookings_per_day: 10,
  is_active: true
})

// Toast function
const showToast = (message, type = 'info') => {
  const id = nextToastId.value++
  const toast = { id, message, type, show: true }
  toasts.value.push(toast)
  
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value[index].show = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }, 3000)
  
  return id
}

// Handle create seva button click
const handleCreateSevaClick = () => {
  if (isMonitoringUser.value) {
    showPermissionAlert.value = true
    showToast('You are not allowed to create sevas. Monitoring users have view-only access.', 'error')
    
    setTimeout(() => {
      showPermissionAlert.value = false
    }, 5000)
    
    return
  }
  
  showCreateForm.value = true
}

// Load temple data
const loadTempleData = async () => {
  try {
    const fetchedTemple = await templeStore.getTempleById(entityId)
    if (fetchedTemple) {
      temple.value = fetchedTemple
    }
  } catch (error) {
    console.error('Error loading temple data:', error)
    showToast('Failed to load temple details', 'error')
  }
}

// ========================================
// FIXED: Fetch temple bank details from entity API
// ========================================
const fetchTempleBankDetails = async () => {
  if (!entityId) {
    console.warn('No entity ID available')
    return
  }
  
  try {
    templeDetails.value.loading = true
    templeDetails.value.error = null
    
    const response = await api.get(`/entities/${entityId}/details`)
    const data = response.data?.data || response.data
    
    if (data && data.creator) {
      // Bank details are directly in the creator object
      const creator = data.creator
      
      templeDetails.value = {
        id: data.id || entityId,
        name: data.name || temple.value?.name || 'N/A',
        loading: false,
        error: null,
        bank: {
          account_holder_name: creator.account_holder_name || null,
          account_number: creator.account_number || null,
          ifsc_code: creator.ifsc_code || null,
          account_type: creator.account_type || null,
          bank_name: creator.ifsc_code ? getBankNameFromIFSC(creator.ifsc_code) : null,
          upi_id: creator.upi_id || null,
        },
        creator: creator
      }
      
      console.log('Temple bank details loaded:', templeDetails.value)
    } else {
      templeDetails.value.loading = false
      templeDetails.value.error = 'Bank details not available'
    }
  } catch (error) {
    console.error('Error fetching temple bank details:', error)
    templeDetails.value.loading = false
    templeDetails.value.error = 'Failed to load bank details'
  }
}

// Helper function to extract bank name from IFSC code
function getBankNameFromIFSC(ifscCode) {
  if (!ifscCode || ifscCode.length < 4) return null
  
  const bankCodes = {
    'HDFC': 'HDFC Bank',
    'ICIC': 'ICICI Bank',
    'SBIN': 'State Bank of India',
    'AXIS': 'Axis Bank',
    'PUNB': 'Punjab National Bank',
    'BARB': 'Bank of Baroda',
    'CNRB': 'Canara Bank',
    'UBIN': 'Union Bank of India',
    'IDIB': 'Indian Bank',
    'IOBA': 'Indian Overseas Bank',
  }
  
  const code = ifscCode.substring(0, 4).toUpperCase()
  return bankCodes[code] || `${code} Bank`
}


const formatDate = (dateString) => {
  if (!dateString || dateString === '') return 'No Date Set'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error, dateString)
    return 'Invalid Date'
  }
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  
  try {
    if (timeString.includes(' ')) {
      const parts = timeString.split(' ')
      if (parts.length > 1) {
        const timePart = parts[1].split('.')[0]
        const [hours, minutes, seconds] = timePart.split(':')
        const hour24 = parseInt(hours, 10)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const ampm = hour24 >= 12 ? 'PM' : 'AM'
        return `${hour12}:${minutes} ${ampm}`
      }
    }
    
    if (timeString.includes('T')) {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }
    
    return timeString
  } catch (error) {
    console.error('Error formatting time:', error, timeString)
    return timeString
  }
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusDotClass = (status) => {
  const classes = {
    pending: 'bg-yellow-400',
    approved: 'bg-green-400',
    rejected: 'bg-red-400',
    completed: 'bg-blue-400',
    success: 'bg-green-400'
  }
  return classes[status] || 'bg-gray-400'
}

// API Integration Functions
const loadSevas = async () => {
  console.log('Loading seva bookings for entity ID:', entityId)
  try {
    loading.value = true
    const result = await sevaService.getEntityBookings(entityId)

    const bookings = result?.data
    sevaList.value = Array.isArray(bookings) ? bookings : []

    console.log('First booking object fields:', sevaList.value.length > 0 ? Object.keys(sevaList.value[0]) : 'No bookings')
    console.log('Sample booking data:', sevaList.value.length > 0 ? sevaList.value[0] : 'No bookings')

  } catch (error) {
    console.error('Error loading seva bookings:', error)
    showToast('Failed to load seva bookings. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

// Load seva catalog
const loadSevaCatalog = async () => {
  console.log('Loading seva catalog for entity:', entityId)
  try {
    loadingSevaCatalog.value = true
    const result = await sevaService.getSevas({ limit: 1000, entity_id: entityId })
    
    if (result.success) {
      sevaCatalog.value = result.data || []
      console.log('Seva catalog loaded:', sevaCatalog.value)
    } else {
      console.error('Failed to load seva catalog:', result.error)
      showToast('Failed to load seva catalog', 'error')
    }
  } catch (error) {
    console.error('Error loading seva catalog:', error)
    showToast('Failed to load seva catalog. Please try again.', 'error')
  } finally {
    loadingSevaCatalog.value = false
  }
}

// Action handlers
const approveSeva = async (booking) => {
  if (isMonitoringUser.value) {
    showPermissionAlert.value = true
    showToast('You are not allowed to approve bookings. Monitoring users have view-only access.', 'error')
    return
  }
  
  const bookingId = getId(booking)
  console.log('Approving booking:', bookingId)
  
  try {
    const result = await sevaService.updateBookingStatus(bookingId, 'approved')
    if (result.success) {
      await loadSevas()
      showToast(`Booking approved successfully`, 'success')
      
      if (selectedSeva.value && getId(selectedSeva.value) === bookingId) {
        selectedSeva.value = null
      }
    } else {
      showToast(result.message || 'Failed to approve booking', 'error')
    }
  } catch (error) {
    console.error('Error approving booking:', error)
    showToast('Failed to approve booking. Please try again.', 'error')
  }
}

const rejectSeva = async (booking) => {
  if (isMonitoringUser.value) {
    showPermissionAlert.value = true
    showToast('You are not allowed to reject bookings. Monitoring users have view-only access.', 'error')
    return
  }
  
  const bookingId = getId(booking)
  console.log('Rejecting booking:', bookingId)
  
  try {
    const result = await sevaService.updateBookingStatus(bookingId, 'rejected')
    if (result.success) {
      await loadSevas()
      showToast(`Booking rejected`, 'warning')
      
      if (selectedSeva.value && getId(selectedSeva.value) === bookingId) {
        selectedSeva.value = null
      }
    } else {
      showToast(result.message || 'Failed to reject booking', 'error')
    }
  } catch (error) {
    console.error('Error rejecting booking:', error)
    showToast('Failed to reject booking. Please try again.', 'error')
  }
}

const editSeva = (seva) => {
  if (isMonitoringUser.value) {
    showPermissionAlert.value = true
    showToast('You are not allowed to edit sevas. Monitoring users have view-only access.', 'error')
    return
  }
  
  console.log('Editing seva:', seva)
  
  sevaForm.value = {
    name: seva.name || seva.Name || '',
    type: seva.seva_type || seva.type || seva.SevaType || '',
    description: seva.description || seva.Description || '',
    price: seva.price || seva.Price || 0,
    duration: seva.duration || seva.Duration || 30,
    date: seva.date || seva.Date || '', 
    startTime: seva.start_time || seva.StartTime || '',
    endTime: seva.end_time || seva.EndTime || '',
    max_bookings_per_day: seva.max_bookings_per_day || seva.MaxBookingsPerDay || seva.available_slots || seva.AvailableSlots || 10,
    is_active: seva.is_active !== undefined ? seva.is_active : (seva.status === 'active' || true)
  }
  
  editingSeva.value = seva
}

const confirmDeleteSeva = (seva) => {
  if (isMonitoringUser.value) {
    showPermissionAlert.value = true
    showToast('You are not allowed to delete sevas. Monitoring users have view-only access.', 'error')
    return
  }
  
  sevaToDelete.value = seva
}

const deleteSeva = async () => {
  if (!sevaToDelete.value) return

  formLoading.value = true

  try {
    const sevaId = sevaToDelete.value.id || sevaToDelete.value.ID

    // Use the seva's own entity_id — NOT the session entity
    const sevaEntityId = sevaToDelete.value.entity_id ||
                         sevaToDelete.value.EntityID ||
                         parseInt(entityId)

    console.log('Deleting seva ID:', sevaId, '| Seva entity_id:', sevaEntityId)

    const result = await sevaService.deleteSeva(sevaId, sevaEntityId)

    if (result && result.success) {
      await loadSevaCatalog()
      showToast(`Seva "${sevaToDelete.value.name || sevaToDelete.value.Name}" deleted successfully`, 'success')
      sevaToDelete.value = null
    } else {
      console.error('Delete failed:', result)
      showToast(result?.message || result?.error || 'Failed to delete seva', 'error')
    }
  } catch (error) {
    console.error('Error deleting seva:', error)
    if (error?.response) {
      showToast(`Error (${error.response.status}): ${error.response.data?.message || 'Failed to delete seva'}`, 'error')
    } else {
      showToast('Failed to delete seva. Please try again.', 'error')
    }
  } finally {
    formLoading.value = false
  }
}

const saveSeva = async () => {
  if (!sevaForm.value.name || !sevaForm.value.type || !sevaForm.value.description) {
    showToast('Please fill in all required fields', 'error')
    return
  }
  
  if (!editingSeva.value && !entityId) {
    showToast('Missing entity ID. Please try again.', 'error')
    return
  }
  
  formLoading.value = true
  
  try {
    const payload = {
      name: sevaForm.value.name.trim(),
      seva_type: sevaForm.value.type,
      description: sevaForm.value.description.trim(),
      price: parseFloat(sevaForm.value.price) || 0,
      duration: parseInt(sevaForm.value.duration) || 30,
      max_bookings_per_day: parseInt(sevaForm.value.max_bookings_per_day) || 10,
      status: "upcoming",
      is_active: true
    }
    
    if (sevaForm.value.date && sevaForm.value.date.trim()) {
      payload.date = sevaForm.value.date
    }
    if (sevaForm.value.startTime && sevaForm.value.startTime.trim()) {
      payload.start_time = sevaForm.value.startTime
    }
    if (sevaForm.value.endTime && sevaForm.value.endTime.trim()) {
      payload.end_time = sevaForm.value.endTime
    }
    
    console.log("Base payload:", payload)
    
    if (editingSeva.value) {
      const sevaId = editingSeva.value.id || editingSeva.value.ID

      // Use the seva's own entity_id — NOT the session entity
      const sevaEntityId = editingSeva.value.entity_id ||
                           editingSeva.value.EntityID ||
                           parseInt(entityId)

      console.log("Updating seva ID:", sevaId)
      console.log("Seva entity_id:", sevaEntityId, "| Session entity:", entityId)
      
      const updatePayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => {
          return value !== null && value !== undefined && value !== ''
        })
      )

      // Explicitly attach the seva's own entity_id
      updatePayload.entity_id = parseInt(sevaEntityId)
      
      console.log("Final update payload:", updatePayload)
      
      const result = await sevaService.updateSeva(sevaId, updatePayload)
      
      if (result && result.success) {
        await Promise.all([loadSevas(), loadSevaCatalog()])
        showToast(`Seva "${sevaForm.value.name}" updated successfully`, 'success')
        closeForm()
      } else {
        console.error('Update failed:', result)
        const errorMsg = result?.message || result?.error || 'Failed to update seva'
        showToast(errorMsg, 'error')
      }
    } else {
      console.log("Creating new seva")
      
      payload.entity_id = parseInt(entityId)
      console.log("Final create payload:", payload)
      
      const result = await sevaService.createSeva(payload)
      
      if (result && result.success) {
        await Promise.all([loadSevas(), loadSevaCatalog()])
        showToast(`Seva "${sevaForm.value.name}" created successfully`, 'success')
        currentView.value = 'sevas' 
        closeForm()
      } else {
        console.error('Create failed:', result)
        
        if (result?.errors && Object.keys(result.errors).length > 0) {
          const firstErrorField = Object.keys(result.errors)[0]
          const errorMessage = result.errors[firstErrorField]
          showToast(`Validation error: ${firstErrorField} - ${errorMessage}`, 'error')
        } else {
          const errorMsg = result?.message || result?.error || 'Failed to create seva'
          showToast(errorMsg, 'error')
        }
      }
    }
  } catch (error) {
    console.error('Error saving seva:', error)
    
    if (error?.response) {
      const status = error.response.status
      const data = error.response.data
      console.error('API Error Response:', data)
      
      let errorMessage = `Error (${status})`
      if (data?.message) {
        errorMessage += `: ${data.message}`
      } else if (data?.error) {
        errorMessage += `: ${data.error}`
      } else {
        errorMessage += ': Failed to save seva'
      }
      
      showToast(errorMessage, 'error')
    } else if (error?.message) {
      showToast(`Error: ${error.message}`, 'error')
    } else {
      showToast('Failed to save seva. Please try again.', 'error')
    }
  } finally {
    formLoading.value = false
  }
}

// ========================================
// UPDATED: View seva details with bank details fetching
// ========================================
const viewSevaDetails = async (booking) => {
  console.log('Viewing booking details:', booking)
  selectedSeva.value = booking
  
  // Fetch temple bank details if not already loaded
  if (!templeDetails.value.bank) {
    await fetchTempleBankDetails()
  }
}

const closeForm = () => {
  showCreateForm.value = false
  editingSeva.value = null
  
  sevaForm.value = {
    name: '',
    type: '',
    description: '',
    price: 0,
    duration: 30,
    date: '',
    startTime: '',
    endTime: '',
    max_bookings_per_day: 10,
    is_active: true
  }
}

const clearFilters = () => {
  searchFilter.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
  dateRangeFilter.value = ''
}

const clearSevaFilters = () => {
  sevaSearchFilter.value = ''
  sevaTypeFilter.value = ''
  sevaStatusFilter.value = ''
}

// Watch for changes in start and end time to auto-calculate duration
watch([() => sevaForm.value.startTime, () => sevaForm.value.endTime], ([newStartTime, newEndTime]) => {
  if (newStartTime && newEndTime) {
    try {
      // Parse time strings (HH:MM format)
      const [startHour, startMin] = newStartTime.split(':').map(Number)
      const [endHour, endMin] = newEndTime.split(':').map(Number)
      
      // Create date objects for today with the specified times
      const startDate = new Date()
      startDate.setHours(startHour, startMin, 0, 0)
      
      const endDate = new Date()
      endDate.setHours(endHour, endMin, 0, 0)
      
      // If end time is before start time, assume it's next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1)
      }
      
      // Calculate difference in minutes
      const diffMs = endDate - startDate
      const diffMins = Math.floor(diffMs / (1000 * 60))
      
      // Update duration only if it's a positive value
      if (diffMins > 0) {
        sevaForm.value.duration = diffMins
      } else {
        sevaForm.value.duration = 30 // Default fallback
      }
    } catch (error) {
      console.error('Error calculating duration:', error)
      sevaForm.value.duration = 30 // Default fallback on error
    }
  }
})

// ========================================
// UPDATED: onMounted with bank details fetching
// ========================================
onMounted(async () => {
  console.log('SevaManagement component mounted for entity:', entityId)
  await loadTempleData()
  await fetchTempleBankDetails() // ADDED: Fetch bank details on mount
  loadSevas()
  loadSevaCatalog()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>