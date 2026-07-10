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
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-indigo-700">Devotee Management</h3>
              <p class="mt-1 text-sm text-gray-600">Manage your temple's registered devotees</p>
            </div>
            <div class="flex items-center space-x-2">
              <!-- Bulk Upload Button -->
              <button
                @click="openBulkUploadModal"
                class="inline-flex items-center px-3 py-1.5 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Bulk Upload
              </button>
              <!-- Add Devotee Button -->
              <button
                @click="openAddDevoteeModal"
                class="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Devotee
              </button>
              <button @click="refreshData" :disabled="loading" class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Stats Overview -->
      <div class="mb-4">
        <DevoteeStats :stats="devoteeStats" :loading="loading" />
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
        <div class="p-3">
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="flex-1">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input v-model="searchQuery" type="text" placeholder="Search devotees by name, email, or phone..." class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <select v-model="statusFilter" class="block w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select v-model="itemsPerPage" @change="resetPagination" class="block w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
            </div>

            <!-- Spiritual Filters -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Nakshatra</label>
                <select v-model="spiritualFilters.nakshatra" @change="applyFilters" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="">All Nakshatras</option>
                  <option v-for="nakshatra in nakshatraList" :key="nakshatra" :value="nakshatra">{{ nakshatra }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Rashi</label>
                <select v-model="spiritualFilters.rashi" @change="applyFilters" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="">All Rashis</option>
                  <option v-for="rashi in rashiList" :key="rashi" :value="rashi">{{ rashi }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Lagna</label>
                <select v-model="spiritualFilters.lagna" @change="applyFilters" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="">All Lagnas</option>
                  <option v-for="lagna in lagnaList" :key="lagna" :value="lagna">{{ lagna }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Veda Shaka</label>
                <select v-model="spiritualFilters.vedaShaka" @change="applyFilters" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="">All Vedas</option>
                  <option v-for="veda in vedaShakaList" :key="veda" :value="veda">{{ veda }}</option>
                </select>
              </div>
            </div>

            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="flex items-center space-x-2 flex-wrap gap-2">
              <span class="text-xs text-gray-500 font-medium">Active Filters:</span>
              <span v-if="spiritualFilters.nakshatra" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Nakshatra: {{ spiritualFilters.nakshatra }}
                <button @click="spiritualFilters.nakshatra = ''; applyFilters()" class="ml-1 hover:text-purple-900">×</button>
              </span>
              <span v-if="spiritualFilters.rashi" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Rashi: {{ spiritualFilters.rashi }}
                <button @click="spiritualFilters.rashi = ''; applyFilters()" class="ml-1 hover:text-blue-900">×</button>
              </span>
              <span v-if="spiritualFilters.lagna" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Lagna: {{ spiritualFilters.lagna }}
                <button @click="spiritualFilters.lagna = ''; applyFilters()" class="ml-1 hover:text-green-900">×</button>
              </span>
              <span v-if="spiritualFilters.vedaShaka" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Veda: {{ spiritualFilters.vedaShaka }}
                <button @click="spiritualFilters.vedaShaka = ''; applyFilters()" class="ml-1 hover:text-orange-900">×</button>
              </span>
              <button @click="clearFilters" class="text-xs text-red-600 hover:text-red-800 font-medium">Clear All</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Devotee List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-3">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">All Devotees</h3>
              <p class="text-sm text-gray-600">
                Showing {{ paginationInfo.start }}-{{ paginationInfo.end }} of {{ paginationInfo.total }} devotees
              </p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nakshatra</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rashi</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lagna</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="devotee in paginatedDevotees" :key="getDevoteeId(devotee)" class="hover:bg-gray-50">
                  <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">#{{ getDevoteeId(devotee) }}</td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-medium text-indigo-600">{{ getDevoteeName(devotee).charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="ml-2 text-sm font-medium text-gray-900">{{ getDevoteeName(devotee) }}</div>
                    </div>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ devotee.email || 'Not provided' }}</td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ devotee.phone || 'Not provided' }}</td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm">
                    <span v-if="devotee.nakshatra" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">{{ devotee.nakshatra }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm">
                    <span v-if="devotee.rashi" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{{ devotee.rashi }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm">
                    <span v-if="devotee.lagna" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">{{ devotee.lagna }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span :class="getStatusClass(devotee.status)" class="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full">{{ devotee.status || 'active' }}</span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                    <div class="flex items-center justify-center space-x-2">
                      <button
                        @click="viewDevoteeProfile(devotee)"
                        class="px-2 py-0.5 rounded text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 border border-blue-300 transition-colors"
                        title="View Profile">
                        View
                      </button>
                      <!-- Edit Button -->
                      <button
                        @click="openEditModal(devotee)"
                        class="px-2 py-0.5 rounded text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 border border-indigo-300 transition-colors"
                        title="Edit Profile">
                        Edit
                      </button>
                      <button
                        @click="handleToggleStatus(devotee)"
                        :disabled="statusUpdateLoading === getDevoteeId(devotee)"
                        :class="getToggleButtonClass(devotee.status)"
                        class="px-2 py-0.5 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        :title="getStatusToggleText(devotee.status)">
                        <span v-if="statusUpdateLoading === getDevoteeId(devotee)" class="flex items-center">
                          <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-current" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                        <span v-else>{{ getStatusToggleText(devotee.status) }}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2 mt-3">
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ paginationInfo.start }}</span> to
                <span class="font-medium">{{ paginationInfo.end }}</span> of
                <span class="font-medium">{{ paginationInfo.total }}</span> results
              </p>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
                </button>
                <template v-for="page in visiblePages" :key="page">
                  <button v-if="page !== '...'" @click="goToPage(page)" :class="['relative inline-flex items-center px-3 py-1.5 text-sm font-semibold focus:z-20', page === currentPage ? 'z-10 bg-indigo-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50']">{{ page }}</button>
                  <span v-else class="relative inline-flex items-center px-3 py-1.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>
                </template>
                <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="relative inline-flex items-center rounded-r-md px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
                </button>
              </nav>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="paginatedDevotees.length === 0 && !loading" class="text-center py-6">
            <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No devotees found</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ searchQuery || statusFilter || hasActiveFilters ? 'Try adjusting your search criteria or filters.' : 'No devotees have joined this temple yet.' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-4 flex items-center space-x-3">
        <BaseLoader size="sm" />
        <span class="text-gray-700">Loading devotees...</span>
      </div>
    </div>

    <!-- ===================== ADD DEVOTEE MODAL ===================== -->
    <Teleport to="body">
      <div v-if="showAddDevoteeModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeAddDevoteeModal"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white">Add New Devotee</h3>
                  <p class="text-indigo-200 text-xs">Register a new devotee to this temple</p>
                </div>
              </div>
              <button @click="closeAddDevoteeModal" class="text-white/70 hover:text-white transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-5 max-h-[70vh] overflow-y-auto">
              <div class="space-y-5">
                <!-- Section: Basic Info -->
                <div>
                  <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                    <span class="inline-block w-5 h-px bg-gray-300 mr-2"></span>Basic Information
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
                      <input v-model="addForm.full_name" type="text" placeholder="Enter full name"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                        :class="{ 'border-red-400 bg-red-50': addFormErrors.full_name }" />
                      <p v-if="addFormErrors.full_name" class="mt-1 text-xs text-red-600">{{ addFormErrors.full_name }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number <span class="text-red-500">*</span></label>
                      <input v-model="addForm.phone" type="tel" placeholder="Enter phone number"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                        :class="{ 'border-red-400 bg-red-50': addFormErrors.phone }" />
                      <p v-if="addFormErrors.phone" class="mt-1 text-xs text-red-600">{{ addFormErrors.phone }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
                      <input v-model="addForm.email" type="email" placeholder="Enter email address"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                        :class="{ 'border-red-400 bg-red-50': addFormErrors.email }" />
                      <p v-if="addFormErrors.email" class="mt-1 text-xs text-red-600">{{ addFormErrors.email }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
                      <div class="relative">
                        <input v-model="addForm.password" :type="showAddPassword ? 'text' : 'password'" placeholder="Set initial password"
                          class="block w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                          :class="{ 'border-red-400 bg-red-50': addFormErrors.password }" />
                        <button type="button" @click="showAddPassword = !showAddPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                          <svg v-if="!showAddPassword" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        </button>
                      </div>
                      <p v-if="addFormErrors.password" class="mt-1 text-xs text-red-600">{{ addFormErrors.password }}</p>
                    </div>
                  </div>
                </div>

                <!-- Section: Spiritual Details -->
                <div>
                  <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                    <span class="inline-block w-5 h-px bg-gray-300 mr-2"></span>Spiritual Details
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nakshatra</label>
                      <select v-model="addForm.nakshatra" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                        <option value="">Select Nakshatra</option>
                        <option v-for="n in nakshatraList" :key="n" :value="n">{{ n }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Rashi</label>
                      <select v-model="addForm.rashi" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                        <option value="">Select Rashi</option>
                        <option v-for="r in rashiList" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Lagna</label>
                      <select v-model="addForm.lagna" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                        <option value="">Select Lagna</option>
                        <option v-for="l in lagnaList" :key="l" :value="l">{{ l }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Gotra</label>
                      <input v-model="addForm.gotra" type="text" placeholder="Enter Gotra"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button @click="closeAddDevoteeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button @click="submitAddDevotee" :disabled="addFormLoading" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg v-if="addFormLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ addFormLoading ? 'Adding...' : 'Add Devotee' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===================== BULK UPLOAD MODAL ===================== -->
    <Teleport to="body">
      <div v-if="showBulkUploadModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeBulkUploadModal"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white">Bulk Upload Devotees</h3>
                  <p class="text-violet-200 text-xs">Import multiple devotees via CSV file</p>
                </div>
              </div>
              <button @click="closeBulkUploadModal" class="text-white/70 hover:text-white transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-5">
              <!-- Template Download -->
              <div class="mb-5 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start space-x-3">
                <div class="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-indigo-900">Download Template</p>
                  <p class="text-xs text-indigo-600 mt-0.5">Use our CSV template for correct formatting</p>
                  <button @click="downloadTemplate" class="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors">
                    <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download CSV Template
                  </button>
                </div>
              </div>

              <!-- Required Columns Info -->
              <div class="mb-5">
                <p class="text-xs font-medium text-gray-600 mb-2">Required CSV Columns:</p>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="col in csvColumns" :key="col.key" :class="col.required ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border">
                    {{ col.label }}<span v-if="col.required" class="ml-0.5 text-red-500">*</span>
                  </span>
                </div>
              </div>

              <!-- File Upload Drop Zone -->
              <div
                class="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer"
                :class="dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'"
                @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false"
                @drop.prevent="handleFileDrop"
                @click="$refs.csvFileInput.click()">
                <input ref="csvFileInput" type="file" accept=".csv" class="hidden" @change="handleFileSelect" />
                <div v-if="!bulkFile">
                  <svg class="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p class="text-sm font-medium text-gray-700">Drop your CSV file here</p>
                  <p class="text-xs text-gray-500 mt-1">or click to browse</p>
                </div>
                <div v-else class="flex items-center justify-center space-x-3">
                  <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">{{ bulkFile.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(bulkFile.size) }} · CSV file</p>
                  </div>
                  <button @click.stop="bulkFile = null; bulkPreviewRows = []" class="ml-2 text-red-400 hover:text-red-600">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </div>

              <!-- Preview Table -->
              <div v-if="bulkPreviewRows.length > 0" class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs font-medium text-gray-600">Preview (first {{ Math.min(bulkPreviewRows.length, 5) }} rows)</p>
                  <span class="text-xs text-indigo-600 font-medium">{{ bulkPreviewRows.length }} total records</span>
                </div>
                <div class="overflow-x-auto rounded-lg border border-gray-200">
                  <table class="min-w-full text-xs">
                    <thead class="bg-gray-50">
                      <tr>
                        <th v-for="col in csvColumns.slice(0, 4)" :key="col.key" class="px-2 py-1.5 text-left font-medium text-gray-600">{{ col.label }}</th>
                        <th class="px-2 py-1.5 text-left font-medium text-gray-600">...</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="(row, idx) in bulkPreviewRows.slice(0, 5)" :key="idx" class="hover:bg-gray-50">
                        <td v-for="col in csvColumns.slice(0, 4)" :key="col.key" class="px-2 py-1.5 text-gray-700 truncate max-w-24">{{ row[col.key] || '-' }}</td>
                        <td class="px-2 py-1.5 text-gray-400">...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Error List -->
              <div v-if="bulkErrors.length > 0" class="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p class="text-xs font-medium text-red-700 mb-1">Upload errors:</p>
                <ul class="space-y-0.5">
                  <li v-for="(err, idx) in bulkErrors.slice(0, 5)" :key="idx" class="text-xs text-red-600">• {{ err }}</li>
                  <li v-if="bulkErrors.length > 5" class="text-xs text-red-500">...and {{ bulkErrors.length - 5 }} more errors</li>
                </ul>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p class="text-xs text-gray-500">Max 500 devotees per upload</p>
              <div class="flex items-center space-x-3">
                <button @click="closeBulkUploadModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button @click="submitBulkUpload" :disabled="!bulkFile || bulkUploadLoading" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <svg v-if="bulkUploadLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ bulkUploadLoading ? 'Uploading...' : 'Upload Devotees' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===================== EDIT DEVOTEE MODAL ===================== -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeEditModal"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white">Edit Devotee Profile</h3>
                  <p class="text-emerald-200 text-xs">Editing: {{ editForm.full_name }}</p>
                </div>
              </div>
              <button @click="closeEditModal" class="text-white/70 hover:text-white transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 max-h-[70vh] overflow-y-auto">
              <div class="space-y-5">
                <!-- Basic Info -->
                <div>
                  <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                    <span class="inline-block w-5 h-px bg-gray-300 mr-2"></span>Basic Information
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
                      <input v-model="editForm.full_name" type="text" placeholder="Full name"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        :class="{ 'border-red-400 bg-red-50': editFormErrors.full_name }" />
                      <p v-if="editFormErrors.full_name" class="mt-1 text-xs text-red-600">{{ editFormErrors.full_name }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number <span class="text-red-500">*</span></label>
                      <input v-model="editForm.phone" type="tel" placeholder="Phone number"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        :class="{ 'border-red-400 bg-red-50': editFormErrors.phone }" />
                      <p v-if="editFormErrors.phone" class="mt-1 text-xs text-red-600">{{ editFormErrors.phone }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Email Address <span class="text-red-500">*</span></label>
                      <input v-model="editForm.email" type="email" placeholder="Email address"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        :class="{ 'border-red-400 bg-red-50': editFormErrors.email }" />
                      <p v-if="editFormErrors.email" class="mt-1 text-xs text-red-600">{{ editFormErrors.email }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">New Password <span class="text-gray-400 text-xs font-normal">(leave blank to keep current)</span></label>
                      <div class="relative">
                        <input v-model="editForm.password" :type="showEditPassword ? 'text' : 'password'" placeholder="New password (optional)"
                          class="block w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm" />
                        <button type="button" @click="showEditPassword = !showEditPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                          <svg v-if="!showEditPassword" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Spiritual Details -->
                <div>
                  <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                    <span class="inline-block w-5 h-px bg-gray-300 mr-2"></span>Spiritual Details
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nakshatra</label>
                      <select v-model="editForm.nakshatra" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm">
                        <option value="">Select Nakshatra</option>
                        <option v-for="n in nakshatraList" :key="n" :value="n">{{ n }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Rashi</label>
                      <select v-model="editForm.rashi" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm">
                        <option value="">Select Rashi</option>
                        <option v-for="r in rashiList" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Lagna</label>
                      <select v-model="editForm.lagna" class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm">
                        <option value="">Select Lagna</option>
                        <option v-for="l in lagnaList" :key="l" :value="l">{{ l }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Gotra</label>
                      <input v-model="editForm.gotra" type="text" placeholder="Enter Gotra"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button @click="closeEditModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button @click="submitEditDevotee" :disabled="editFormLoading" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg v-if="editFormLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ editFormLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useDevoteeStore } from '@/stores/devotee'
import { useTempleStore } from '@/stores/temple'
import { storeToRefs } from 'pinia'
import api from '@/plugins/axios'

import DevoteeStats from '@/components/devotee/DevoteeStats.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'

export default {
  name: 'DevoteeManagement',
  components: { DevoteeStats, BaseLoader },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()
    const devoteeStore = useDevoteeStore()
    const templeStore = useTempleStore()
    const { devotees, devoteeStats } = storeToRefs(devoteeStore)

    // Core state
    const temple = ref(null)
    const loading = ref(false)
    const statusUpdateLoading = ref(null)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(25)

    const spiritualFilters = ref({ nakshatra: '', rashi: '', lagna: '', vedaShaka: '' })

    // ── Add Devotee Modal ──
    const showAddDevoteeModal = ref(false)
    const addFormLoading = ref(false)
    const showAddPassword = ref(false)
    const addForm = ref({
      full_name: '', email: '', phone: '', password: '',
      nakshatra: '', rashi: '', lagna: '', gotra: ''
    })
    const addFormErrors = ref({})

    // ── Bulk Upload Modal ──
    const showBulkUploadModal = ref(false)
    const bulkUploadLoading = ref(false)
    const bulkFile = ref(null)
    const bulkPreviewRows = ref([])
    const bulkErrors = ref([])
    const dragOver = ref(false)

    // ── Edit Modal ──
    const showEditModal = ref(false)
    const editFormLoading = ref(false)
    const showEditPassword = ref(false)
    const editingDevotee = ref(null)
    const editForm = ref({
      full_name: '', email: '', phone: '', password: '',
      nakshatra: '', rashi: '', lagna: '', gotra: ''
    })
    const editFormErrors = ref({})

    // CSV column definitions
    const csvColumns = ref([
      { key: 'full_name', label: 'full_name', required: true },
      { key: 'email', label: 'email', required: true },
      { key: 'phone', label: 'phone', required: true },
      { key: 'password', label: 'password', required: true },
      { key: 'nakshatra', label: 'nakshatra', required: false },
      { key: 'rashi', label: 'rashi', required: false },
      { key: 'lagna', label: 'lagna', required: false },
      { key: 'gotra', label: 'gotra', required: false },
    ])

    // Filter lists
    const nakshatraList = ref([
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
      'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
      'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
      'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
      'Uttara Bhadrapada', 'Revati'
    ])
    const rashiList = ref([
      'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
      'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
      'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
    ])
    const lagnaList = ref([
      'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
      'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
    ])
    const vedaShakaList = ref([
      'Rigveda - Shakala', 'Yajurveda - Krishna', 'Yajurveda - Shukla',
      'Samaveda - Kauthuma', 'Samaveda - Jaiminiya', 'Atharvaveda - Shaunaka'
    ])

    const templeId = computed(() => {
      const routeId = route.params.id || route.params.templeId
      return routeId ? parseInt(routeId, 10) : null
    })

    const hasActiveFilters = computed(() =>
      spiritualFilters.value.nakshatra || spiritualFilters.value.rashi ||
      spiritualFilters.value.lagna || spiritualFilters.value.vedaShaka
    )

  const filteredDevotees = computed(() => {
  let list = [...(devoteeStore.devotees || [])]

  console.log("====================================")
  console.log("Total devotees from store:", devoteeStore.devotees?.length || 0)
  console.log("Search Query:", searchQuery.value)
  console.log("Status Filter:", statusFilter.value)
  console.log("Spiritual Filters:", spiritualFilters.value)

  // Search Filter
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const q = searchQuery.value.trim().toLowerCase()

    list = list.filter((d) => {
      const name = (getDevoteeName(d) || "").toLowerCase()
      const email = (d.email || "").toLowerCase()
      const phone = String(d.phone || "").toLowerCase()

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q)
      )
    })

    console.log("After search filter:", list.length)
  }

  // Status Filter
  if (statusFilter.value && statusFilter.value !== "") {
    list = list.filter(
      (d) => (d.status || "active") === statusFilter.value
    )

    console.log("After status filter:", list.length)
  }

  // Nakshatra
  if (spiritualFilters.value.nakshatra) {
    list = list.filter(
      (d) => d.nakshatra === spiritualFilters.value.nakshatra
    )

    console.log("After nakshatra filter:", list.length)
  }

  // Rashi
  if (spiritualFilters.value.rashi) {
    list = list.filter(
      (d) => d.rashi === spiritualFilters.value.rashi
    )

    console.log("After rashi filter:", list.length)
  }

  // Lagna
  if (spiritualFilters.value.lagna) {
    list = list.filter(
      (d) => d.lagna === spiritualFilters.value.lagna
    )

    console.log("After lagna filter:", list.length)
  }

  // Veda Shaka
  if (spiritualFilters.value.vedaShaka) {
    list = list.filter(
      (d) => d.veda_shaka === spiritualFilters.value.vedaShaka
    )

    console.log("After veda shaka filter:", list.length)
  }

  console.log("Final devotees:", list.length)
  console.log(list)
  console.log("====================================")

  return list
})

    const totalPages = computed(() => Math.ceil(filteredDevotees.value.length / itemsPerPage.value))
    const paginatedDevotees = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      return filteredDevotees.value.slice(start, start + itemsPerPage.value)
    })
    const paginationInfo = computed(() => {
      const start = filteredDevotees.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
      const end = Math.min(currentPage.value * itemsPerPage.value, filteredDevotees.value.length)
      return { start, end, total: filteredDevotees.value.length }
    })
    const visiblePages = computed(() => {
      const total = totalPages.value, current = currentPage.value, delta = 2
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
      const pages = [1]
      if (current - delta > 2) pages.push('...')
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) pages.push(i)
      if (current + delta < total - 1) pages.push('...')
      if (total > 1) pages.push(total)
      return pages
    })

    watch([searchQuery, statusFilter, spiritualFilters], () => { currentPage.value = 1 }, { deep: true })

    // Helpers
    const getDevoteeId = d => d.user_id || d.id || 'unknown'
    const getDevoteeName = d => d.full_name || d.fullName || 'Unknown'
    const getStatusClass = status => {
      switch (status || 'active') {
        case 'active': return 'bg-green-100 text-green-800'
        case 'inactive': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    const getToggleButtonClass = status =>
      (status || 'active') === 'active'
        ? 'text-red-600 hover:text-red-900 hover:bg-red-50 border border-red-300'
        : 'text-green-600 hover:text-green-900 hover:bg-green-50 border border-green-300'
    const getStatusToggleText = status => (status || 'active') === 'active' ? 'Deactivate' : 'Activate'

    // ── Add Devotee ──
    const openAddDevoteeModal = () => {
      addForm.value = { full_name: '', email: '', phone: '', password: '', nakshatra: '', rashi: '', lagna: '', gotra: '' }
      addFormErrors.value = {}
      showAddPassword.value = false
      showAddDevoteeModal.value = true
    }
    const closeAddDevoteeModal = () => { showAddDevoteeModal.value = false }

    const validateAddForm = () => {
      const errors = {}
      if (!addForm.value.full_name.trim()) errors.full_name = 'Full name is required'
      if (!addForm.value.email.trim()) errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.value.email)) errors.email = 'Invalid email format'
      if (!addForm.value.phone.trim()) errors.phone = 'Phone number is required'
      if (!addForm.value.password.trim()) errors.password = 'Password is required'
      else if (addForm.value.password.length < 6) errors.password = 'Password must be at least 6 characters'
      addFormErrors.value = errors
      return Object.keys(errors).length === 0
    }

    const submitAddDevotee = async () => {
      if (!validateAddForm()) return
      if (!templeId.value) { toast.error('Temple ID is missing'); return }
      addFormLoading.value = true
      try {
        await api.post(`/entities/${templeId.value}/devotees`, {
          ...addForm.value,
          entity_id: templeId.value
        })
        toast.success('Devotee added successfully')
        closeAddDevoteeModal()
        await loadDevotees()
        await loadDevoteeStats()
      } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to add devotee'
        toast.error(msg)
      } finally {
        addFormLoading.value = false
      }
    }

    // ── Bulk Upload ──
    const openBulkUploadModal = () => {
      bulkFile.value = null
      bulkPreviewRows.value = []
      bulkErrors.value = []
      dragOver.value = false
      showBulkUploadModal.value = true
    }
    const closeBulkUploadModal = () => { showBulkUploadModal.value = false }

    const downloadTemplate = () => {
      const headers = csvColumns.value.map(c => c.key).join(',')
      const example = 'Arjuna Kumar,arjuna@example.com,9876543210,Pass@123,Ashwini,Mesha (Aries),Mesha,Bharadwaja'
      const blob = new Blob([headers + '\n' + example], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'devotee_bulk_upload_template.csv'
      a.click()
      URL.revokeObjectURL(url)
    }

    const parseCSV = (text) => {
      const lines = text.trim().split('\n')
      if (lines.length < 2) return { rows: [], errors: ['CSV file must have a header row and at least one data row'] }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
      const errors = []
      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim())
        const row = {}
        headers.forEach((h, idx) => { row[h] = vals[idx] || '' })
        const required = csvColumns.value.filter(c => c.required).map(c => c.key)
        const missing = required.filter(k => !row[k])
        if (missing.length) errors.push(`Row ${i + 1}: Missing required fields: ${missing.join(', ')}`)
        else rows.push(row)
      }
      return { rows, errors }
    }

    const handleFileSelect = (e) => {
      const file = e.target.files[0]
      if (!file) return
      bulkFile.value = file
      const reader = new FileReader()
      reader.onload = (ev) => {
        const { rows, errors } = parseCSV(ev.target.result)
        bulkPreviewRows.value = rows
        bulkErrors.value = errors
      }
      reader.readAsText(file)
    }

    const handleFileDrop = (e) => {
      dragOver.value = false
      const file = e.dataTransfer.files[0]
      if (!file || !file.name.endsWith('.csv')) { toast.error('Please upload a CSV file'); return }
      bulkFile.value = file
      const reader = new FileReader()
      reader.onload = (ev) => {
        const { rows, errors } = parseCSV(ev.target.result)
        bulkPreviewRows.value = rows
        bulkErrors.value = errors
      }
      reader.readAsText(file)
    }

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const submitBulkUpload = async () => {
      if (!bulkFile.value || !templeId.value) return
      if (bulkErrors.value.length > 0) { toast.error('Please fix CSV errors before uploading'); return }
      if (bulkPreviewRows.value.length === 0) { toast.error('No valid rows found in the CSV'); return }
      bulkUploadLoading.value = true
      try {
        const formData = new FormData()
        formData.append('file', bulkFile.value)
        formData.append('entity_id', templeId.value)
        await api.post(`/entities/${templeId.value}/devotees/bulk-upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success(`${bulkPreviewRows.value.length} devotees uploaded successfully`)
        closeBulkUploadModal()
        await loadDevotees()
        await loadDevoteeStats()
      } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Bulk upload failed'
        toast.error(msg)
      } finally {
        bulkUploadLoading.value = false
      }
    }

    // ── Edit Devotee ──
    const openEditModal = (devotee) => {
      editingDevotee.value = devotee
      editForm.value = {
        full_name: devotee.full_name || devotee.fullName || '',
        email: devotee.email || '',
        phone: devotee.phone || '',
        password: '',
        nakshatra: devotee.nakshatra || '',
        rashi: devotee.rashi || '',
        lagna: devotee.lagna || '',
        gotra: devotee.gotra || ''
      }
      editFormErrors.value = {}
      showEditPassword.value = false
      showEditModal.value = true
    }
    const closeEditModal = () => { showEditModal.value = false; editingDevotee.value = null }

    const validateEditForm = () => {
      const errors = {}
      if (!editForm.value.full_name.trim()) errors.full_name = 'Full name is required'
      if (!editForm.value.email.trim()) errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.value.email)) errors.email = 'Invalid email format'
      if (!editForm.value.phone.trim()) errors.phone = 'Phone number is required'
      if (editForm.value.password && editForm.value.password.length < 6) errors.password = 'Password must be at least 6 characters'
      editFormErrors.value = errors
      return Object.keys(errors).length === 0
    }

    const submitEditDevotee = async () => {
      if (!validateEditForm()) return
      if (!templeId.value || !editingDevotee.value) return
      const devoteeId = getDevoteeId(editingDevotee.value)
      editFormLoading.value = true
      try {
        const payload = {
          full_name: editForm.value.full_name,
          email: editForm.value.email,
          phone: editForm.value.phone,
          nakshatra: editForm.value.nakshatra,
          rashi: editForm.value.rashi,
          lagna: editForm.value.lagna,
          gotra: editForm.value.gotra,
        }
        if (editForm.value.password) payload.password = editForm.value.password

        await api.put(`/entities/${templeId.value}/devotees/${devoteeId}`, payload)
        toast.success('Devotee profile updated successfully')
        closeEditModal()
        await loadDevotees()
      } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to update devotee'
        toast.error(msg)
      } finally {
        editFormLoading.value = false
      }
    }

    // Data methods
    const viewDevoteeProfile = (devotee) => {
      const userId = getDevoteeId(devotee)
      if (!userId || userId === 'unknown') { toast.error('Invalid devotee ID'); return }
      router.push({ name: 'devotee-profile', params: { id: templeId.value, devoteeId: userId } })
    }

    const clearFilters = () => {
      spiritualFilters.value = { nakshatra: '', rashi: '', lagna: '', vedaShaka: '' }
      searchQuery.value = ''
      statusFilter.value = ''
      currentPage.value = 1
    }
    const applyFilters = () => { currentPage.value = 1 }
    const goToPage = (page) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page }
    const resetPagination = () => { currentPage.value = 1 }

    const loadTempleData = async () => {
      try {
        const fetchedTemple = await templeStore.getTempleById(templeId.value)
        if (fetchedTemple) temple.value = fetchedTemple
      } catch (error) { console.error('Error loading temple data:', error) }
    }

    const loadDevotees = async () => {
      if (!templeId.value) return
      try { await devoteeStore.fetchDevoteesByEntity(templeId.value) } catch (error) { console.error('Error loading devotees:', error) }
    }

    const loadDevoteeStats = async () => {
      if (!templeId.value) return
      try { await devoteeStore.fetchDevoteeStats(templeId.value) } catch (error) { console.error('Error loading devotee stats:', error) }
    }

    const refreshData = async () => {
      loading.value = true
      try { await Promise.all([loadDevotees(), loadDevoteeStats()]) } finally { loading.value = false }
    }

    const handleToggleStatus = async (devotee) => {
      if (!templeId.value) { toast.error('Temple ID is missing'); return }
      const devoteeId = getDevoteeId(devotee)
      if (!devoteeId || devoteeId === 'unknown') { toast.error('Invalid devotee ID'); return }
      const newStatus = (devotee.status || 'active') === 'active' ? 'inactive' : 'active'
      statusUpdateLoading.value = devoteeId
      try {
        await api.patch(`/entities/${templeId.value}/devotees/${devoteeId}/status`, {
          entity_id: parseInt(templeId.value, 10),
          user_id: parseInt(devoteeId, 10),
          status: newStatus
        })
        await loadDevotees()
        await loadDevoteeStats()
        toast.success(`Devotee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      } catch (error) {
        const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to update status'
        toast.error(msg)
      } finally {
        statusUpdateLoading.value = null
      }
    }

    onMounted(async () => {
  // Validate temple ID
  if (!templeId.value) {
    toast.error('Invalid temple ID')
    router.push('/dashboard')
    return
  }

  loading.value = true

  try {
    // Load temple details first
    await loadTempleData()

    // Then load devotees
    await loadDevotees()

    // Finally load devotee statistics
    await loadDevoteeStats()

    // Reset pagination
    currentPage.value = 1
  } catch (error) {
    console.error('Error initializing devotee page:', error)
    toast.error('Failed to load devotee data')
  } finally {
    loading.value = false
  }
})

    return {
      temple, devoteeStats, loading, statusUpdateLoading,
      searchQuery, statusFilter, spiritualFilters, currentPage, itemsPerPage,
      totalPages, paginatedDevotees, paginationInfo, visiblePages, filteredDevotees,
      hasActiveFilters, nakshatraList, rashiList, lagnaList, vedaShakaList,
      // Add devotee
      showAddDevoteeModal, addFormLoading, showAddPassword, addForm, addFormErrors,
      // Bulk upload
      showBulkUploadModal, bulkUploadLoading, bulkFile, bulkPreviewRows, bulkErrors, dragOver, csvColumns,
      // Edit modal
      showEditModal, editFormLoading, showEditPassword, editForm, editFormErrors,
      // Methods
      getDevoteeId, getDevoteeName, getStatusClass, getToggleButtonClass, getStatusToggleText,
      openAddDevoteeModal, closeAddDevoteeModal, submitAddDevotee,
      openBulkUploadModal, closeBulkUploadModal, downloadTemplate, handleFileSelect, handleFileDrop, formatFileSize, submitBulkUpload,
      openEditModal, closeEditModal, submitEditDevotee,
      viewDevoteeProfile, clearFilters, applyFilters, handleToggleStatus, refreshData, goToPage, resetPagination
    }
  }
}
</script>