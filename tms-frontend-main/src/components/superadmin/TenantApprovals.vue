<template>
  <div class="space-y-6">
    <!-- Heading Section -->
    <div class="border-b border-gray-200 pb-4">
      <h1 class="text-2xl font-bold text-gray-900 font-roboto">Tenant Approvals</h1>
      <p class="mt-1 text-sm text-gray-500">Review and manage tenant registration requests</p>
    </div>

    <!-- Stats Cards -->
    <div class="flex flex-wrap gap-3">
      <div class="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-center min-w-[100px] flex-1">
        <div class="text-2xl font-bold text-yellow-800">{{ pendingCount }}</div>
        <div class="text-xs text-yellow-600 font-medium">Pending</div>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center min-w-[100px] flex-1">
        <div class="text-2xl font-bold text-green-800">{{ approvedCount }}</div>
        <div class="text-xs text-green-600 font-medium">Approved</div>
      </div>
      <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center min-w-[100px] flex-1">
        <div class="text-2xl font-bold text-red-800">{{ rejectedCount }}</div>
        <div class="text-xs text-red-600 font-medium">Rejected</div>
      </div>
    </div>

    <!-- Filter & Refresh -->
    <div class="flex flex-col sm:flex-row justify-between gap-3">
      <!-- Filters -->
      <div class="flex gap-3">
        <select 
          v-model="statusFilter" 
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
        >
          <option value="">View All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      <!-- Refresh Button -->
      <button 
        @click="loadTenants" 
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
      >
        Refresh Data
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Tenant Applications List -->
    <div v-if="!loading && Array.isArray(filteredTenants) && filteredTenants.length > 0" class="space-y-4">
      <div
        v-for="(tenant, idx) in paginatedTenants"
        :key="tenant.id || tenant.ID || idx"
        class="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
      >
        <div class="p-6">
          <!-- Header Row -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span class="text-indigo-600 font-semibold text-lg">
                  {{ getTenantInitial(tenant) }}
                </span>
              </div>
              
              <!-- Basic Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 font-roboto">
                  {{ getTenantName(tenant) }}
                </h3>
                <p class="text-sm text-gray-600">{{ getTenantEmail(tenant) }}</p>
              </div>
            </div>

            <!-- Status & Date -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span
                :class="getStatusBadgeClass(tenant.status || tenant.Status)"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ tenant.status || tenant.Status || 'pending' }}
              </span>
              <span class="text-xs text-gray-500">
                Applied: {{ formatDate(tenant.created_at || tenant.CreatedAt) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- View Details Button -->
            <button
              @click="handleViewDetails(tenant)"
              class="flex-1 sm:flex-none px-6 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Details
            </button>
            
            <!-- Approval/Rejection Buttons -->
            <div v-if="isStatusPending(tenant)" class="flex flex-col sm:flex-row gap-3 flex-1">
              <button
                @click="handleApprove(tenant)"
                class="flex-1 sm:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                :disabled="isProcessing"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ isProcessing ? 'Processing...' : 'Approve' }}
              </button>
              
              <button
                @click="handleRejectClick(tenant)"
                class="flex-1 sm:flex-none px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                :disabled="isProcessing"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                {{ isProcessing ? 'Processing...' : 'Reject' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div class="text-sm text-gray-700 mb-3 sm:mb-0">
          Showing <span class="font-medium">{{ paginationStart }}</span> to 
          <span class="font-medium">{{ paginationEnd }}</span> of 
          <span class="font-medium">{{ Array.isArray(filteredTenants) ? filteredTenants.length : 0 }}</span> results
        </div>
        
        <div class="flex space-x-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div class="flex space-x-1">
            <button 
              v-for="page in displayedPageNumbers" 
              :key="page"
              @click="goToPage(page)"
              :class="[
                'inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md',
                currentPage === page 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No tenant applications found</h3>
      <p class="mt-2 text-sm text-gray-500">
        {{ statusFilter ? `No tenants with "${statusFilter}" status found` : 'Try refreshing or checking back later' }}
      </p>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Reject Tenant</h3>
        <p class="mb-4">Please provide a reason for rejecting <span class="font-medium">{{ selectedTenant ? getTenantName(selectedTenant) : '' }}</span>:</p>
        <textarea 
          v-model="rejectReason" 
          class="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter rejection reason..."
        ></textarea>
        <div class="flex justify-end gap-3">
          <button 
            @click="showRejectModal = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
            :disabled="isProcessing"
          >
            Cancel
          </button>
          <button 
            @click="confirmReject"
            :disabled="!rejectReason.trim() || isProcessing"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
          >
            {{ isProcessing ? 'Processing...' : 'Reject' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tenant Details Modal - ENHANCED WITH MEDIA -->
    <div v-if="showDetailsModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-5xl mx-auto max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
          <h3 class="text-xl font-bold text-gray-900">Tenant Details</h3>
          <button 
            @click="showDetailsModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="selectedTenant" class="space-y-6">
          <!-- Basic Info Header -->
          <div class="flex items-center gap-4 pb-4 border-b border-gray-200">
            <div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span class="text-indigo-600 font-semibold text-2xl">
                {{ getTenantInitial(selectedTenant) }}
              </span>
            </div>
            <div class="flex-1">
              <h4 class="text-xl font-semibold text-gray-900">
                {{ getTenantName(selectedTenant) }}
              </h4>
              <p class="text-gray-600">{{ getTenantEmail(selectedTenant) }}</p>
              <div class="mt-2">
                <span :class="getStatusBadgeClass(selectedTenant.status || selectedTenant.Status)" 
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                  {{ selectedTenant.status || selectedTenant.Status || 'pending' }}
                </span>
              </div>
            </div>
          </div>



          <!-- Temple Details -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Temple Information
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- First Column -->
              <div class="space-y-4">
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">Application Date</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ formatDate(selectedTenant.created_at || selectedTenant.CreatedAt) }}
                  </div>
                </div>
                
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">Phone Number</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ selectedTenant.phone || selectedTenant.Phone || 'Not provided' }}
                  </div>
                </div>
                
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">Temple Name</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ getTempleDetail(selectedTenant, 'temple_name') }}
                  </div>
                </div>
                
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">Temple Location</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ getTempleDetail(selectedTenant, 'temple_place') }}
                  </div>
                </div>
              </div>
              
              <!-- Second Column -->
              <div class="space-y-4">
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">User ID</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ selectedTenant.id || selectedTenant.ID || 'Not available' }}
                  </div>
                </div>
                
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">Temple Address</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ getTempleDetail(selectedTenant, 'temple_address') }}
                  </div>
                </div>
                
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">Temple Phone</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ getTempleDetail(selectedTenant, 'temple_phone_no') }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Description Section -->
            <div class="mt-5 border-t border-gray-100 pt-4">
              <div class="text-sm font-medium text-gray-500 mb-2">Temple Description</div>
              <div class="text-base text-gray-900 bg-gray-50 p-4 rounded-lg">
                {{ getTempleDescription(selectedTenant) }}
              </div>
            </div>
          </div>
        </div>
        <!-- MEDIA SECTION - Logo and Video -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Temple Media
            </h4>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Temple Logo -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Temple Logo</span>
                </div>
                
                <div v-if="getLogoUrl(selectedTenant)" class="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                  <img 
                    :src="getFullMediaUrl(getLogoUrl(selectedTenant))" 
                    :alt="`${getTempleDetail(selectedTenant, 'temple_name')} Logo`"
                    class="max-w-full max-h-[250px] object-contain rounded-lg shadow-md"
                    @error="handleImageError"
                  />
                </div>
                
                <div v-else class="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] text-gray-400">
                  <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">No logo uploaded</p>
                </div>
                
                <a 
                  v-if="getLogoUrl(selectedTenant)" 
                  :href="getFullMediaUrl(getLogoUrl(selectedTenant))" 
                  target="_blank"
                  class="mt-3 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in new tab
                </a>
              </div>

              <!-- Temple Intro Video -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Intro Video</span>
                </div>
                
                <div v-if="getVideoUrl(selectedTenant)" class="bg-gray-50 rounded-lg overflow-hidden">
                  <video 
                    :src="getFullMediaUrl(getVideoUrl(selectedTenant))" 
                    controls 
                    class="w-full max-h-[250px] object-contain"
                    @error="handleVideoError"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div v-else class="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] text-gray-400">
                  <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">No video uploaded</p>
                </div>
                
                <a 
                  v-if="getVideoUrl(selectedTenant)" 
                  :href="getFullMediaUrl(getVideoUrl(selectedTenant))" 
                  target="_blank"
                  download
                  class="mt-3 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download video
                </a>
              </div>
            </div>
          </div>
                  <!-- Bank Account Details Section -->
        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 mt-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Bank Account Details
          </h4>

          <!-- Loading -->
          <div v-if="loadingBankDetails" class="flex items-center justify-center py-6">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            <span class="ml-2 text-sm text-gray-500">Loading bank details...</span>
          </div>

          <!-- No details -->
          <div v-else-if="!tenantBankDetails"
            class="bg-white rounded-lg p-6 text-center text-gray-400 border border-dashed border-gray-200">
            <svg class="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
            </svg>
            <p class="text-sm">No bank details submitted yet</p>
          </div>

          <!-- Details grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-lg p-4 border border-gray-100 space-y-3">
              <div class="border-b border-gray-100 pb-2">
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Account Holder</div>
                <div class="text-sm font-semibold text-gray-900 mt-1">{{ tenantBankDetails.account_holder_name }}</div>
              </div>
              <div class="border-b border-gray-100 pb-2">
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Bank Name</div>
                <div class="text-sm text-gray-900 mt-1">{{ tenantBankDetails.bank_name }}</div>
              </div>
              <div class="border-b border-gray-100 pb-2">
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Branch</div>
                <div class="text-sm text-gray-900 mt-1">{{ tenantBankDetails.branch_name }}</div>
              </div>
              <div>
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Account Type</div>
                <div class="text-sm text-gray-900 mt-1 capitalize">{{ tenantBankDetails.account_type }}</div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-4 border border-gray-100 space-y-3">
              <div class="border-b border-gray-100 pb-2">
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Account Number</div>
                <div class="text-sm font-mono font-semibold text-gray-900 mt-1">{{ tenantBankDetails.account_number }}</div>
              </div>
              <div class="border-b border-gray-100 pb-2">
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">IFSC Code</div>
                <div class="text-sm font-mono text-gray-900 mt-1">{{ tenantBankDetails.ifsc_code }}</div>
              </div>
              
              <!-- Razorpay: only show configured status, never expose keys -->
              <div>
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Razorpay</div>
                <div class="mt-1">
                  <span v-if="tenantBankDetails.razorpay_configured"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    API Key Configured
                  </span>
                  <span v-else
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Not Configured
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button 
            @click="showDetailsModal = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
          
          <div v-if="isStatusPending(selectedTenant)" class="flex gap-3">
            <button
              @click="handleRejectFromDetails"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              :disabled="isProcessing"
            >
              {{ isProcessing ? 'Processing...' : 'Reject' }}
            </button>
            <button
              @click="handleApproveFromDetails"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              :disabled="isProcessing"
            >
              {{ isProcessing ? 'Processing...' : 'Approve' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useToast } from '@/composables/useToast'
import superAdminService from '@/services/superadmin.service'
// eslint-disable-next-line no-unused-vars
import api from '@/services/api'

export default {
  name: 'TenantApprovals',
  emits: ['updated'],
  setup(props, { emit }) {
    // Data
    const loading = ref(true)
    const tenants = ref([])
    const allTenants = ref([])
    const toast = useToast()
    const isProcessing = ref(false)
    const API_URL = '/api/v1'
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    
    // Debug mode
    const debugMode = ref(false)
    
    // Modals
    const showRejectModal = ref(false)
    const selectedTenant = ref(null)
    const rejectReason = ref('')
    const showDetailsModal = ref(false)
    
    // Filters
    const statusFilter = ref('')
    
    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(5)
    const tenantBankDetails = ref(null)
const loadingBankDetails = ref(false)

const loadBankDetails = async (tenantId) => {
  tenantBankDetails.value = null
  loadingBankDetails.value = true
  try {
    const response = await fetch(`${API_URL}/superadmin/tenants/${tenantId}/bank-details`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
    })
    if (response.ok) {
      const data = await response.json()
      tenantBankDetails.value = data.data || null
    }
  } catch (e) {
    console.error('Failed to load bank details:', e)
  } finally {
    loadingBankDetails.value = false
  }
}
    
    // ==================== MEDIA HELPER FUNCTIONS ====================
    
    const getLogoUrl = (tenant) => {    
      if (!tenant) return null
      
      // Check temple_details first
      if (tenant.temple_details?.logo_url) {      
        return tenant.temple_details.logo_url
      }
      
      // Check direct properties
      return tenant.logo_url || tenant.LogoURL || tenant.logoUrl || null
    }
    
    const getVideoUrl = (tenant) => {
      if (!tenant) return null
      
      // Check temple_details first
      if (tenant.temple_details?.intro_video_url) {
        return tenant.temple_details.intro_video_url
      }
      
      // Check direct properties
      return tenant.intro_video_url || tenant.IntroVideoURL || tenant.introVideoUrl || null
    }
    
    const getFullMediaUrl = (path) => {
      if (!path) return null
      
      // If already a full URL, return as is
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
      }
      
      // Remove leading slash if present to avoid double slashes
      const cleanPath = path.startsWith('/') ? path : `/${path}`
      
      // Construct full URL - use API_BASE_URL which points to your Go backend
      return `${API_BASE_URL}${cleanPath}`
    }
    
    const handleImageError = (event) => {
      console.error('Image failed to load:', event.target.src)
      event.target.style.display = 'none'
      toast.error('Failed to load temple logo')
    }
    
    const handleVideoError = (event) => {
      console.error('Video failed to load:', event.target.src)
      event.target.style.display = 'none'
      toast.error('Failed to load temple video')
    }
    
    // ==================== STATUS HELPERS ====================
    
    const normalizeStatus = (tenant) => {
      if (!tenant) return 'pending'
      
      let status = tenant.status || 
                   tenant.Status || 
                   tenant.approval_status || 
                   tenant.approvalStatus || 
                   tenant.tenant_status ||
                   tenant.user_status ||
                   ''
      
      status = String(status).toLowerCase().trim()
      
      if (!status || status === 'null' || status === 'undefined') {
        return 'pending'
      }
      
      const statusMappings = {
        'approved': 'approved',
        'active': 'approved', 
        'accepted': 'approved',
        'confirm': 'approved',
        'confirmed': 'approved',
        'approved_active': 'approved',
        
        'rejected': 'rejected',
        'declined': 'rejected',
        'denied': 'rejected',
        'cancelled': 'rejected',
        'refused': 'rejected',
        'inactive': 'rejected',
        
        'pending': 'pending',
        'pending_approval': 'pending',
        'waiting': 'pending',
        'submitted': 'pending',
        'under_review': 'pending',
        'new': 'pending'
      }
      
      return statusMappings[status] || 'pending'
    }
    
    const isStatusPending = (tenant) => {
      const status = normalizeStatus(tenant)
      return status === 'pending'
    }
    
    const isStatusApproved = (tenant) => {
      const status = normalizeStatus(tenant)
      return status === 'approved'
    }
    
    const isStatusRejected = (tenant) => {
      const status = normalizeStatus(tenant)
      return status === 'rejected'
    }
    
    // ==================== COMPUTED PROPERTIES ====================
    
    const pendingCount = computed(() => {
      const tenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      if (tenantsArray.length === 0) return 0
      
      return tenantsArray.filter(tenant => isStatusPending(tenant)).length
    })
    
    const approvedCount = computed(() => {
      const tenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      if (tenantsArray.length === 0) return 0
      
      return tenantsArray.filter(tenant => isStatusApproved(tenant)).length
    })
    
    const rejectedCount = computed(() => {
      const tenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      if (tenantsArray.length === 0) return 0
      
      return tenantsArray.filter(tenant => isStatusRejected(tenant)).length
    })
    
    const filteredTenants = computed(() => {
      const allTenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      
      if (!statusFilter.value || statusFilter.value === '' || statusFilter.value === 'all') {
        return allTenantsArray
      }
      
      switch (statusFilter.value.toLowerCase()) {
        case 'pending':
          return allTenantsArray.filter(tenant => isStatusPending(tenant))
        case 'approved':
          return allTenantsArray.filter(tenant => isStatusApproved(tenant))
        case 'rejected':
          return allTenantsArray.filter(tenant => isStatusRejected(tenant))
        default:
          return allTenantsArray
      }
    })
    
    // ==================== TEMPLE DETAILS HELPERS ====================
    
    const getTempleDetail = (tenant, field, fallback = 'Not provided') => {
      if (!tenant) return fallback
      
      if (tenant.temple_details && tenant.temple_details[field]) {
        return tenant.temple_details[field]
      }
      
      if (tenant[field]) {
        return tenant[field]
      }
      
      const variations = [
        field,
        field.toLowerCase(),
        field.toUpperCase(),
        field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase()),
        field.charAt(0).toUpperCase() + field.slice(1)
      ]
      
      for (const variation of variations) {
        if (tenant[variation]) {
          return tenant[variation]
        }
      }
      
      return fallback
    }

    const getTempleDescription = (tenant) => {
      if (!tenant) return 'No additional details provided.'
      
      if (tenant.temple_details) {
        if (tenant.temple_details.temple_description) {
          return tenant.temple_details.temple_description
        }
      }
      
      const descriptionFields = [
        'temple_description', 'templeDescription', 'TempleDescription',
        'description', 'Description'
      ]
      
      for (const field of descriptionFields) {
        if (tenant[field]) {
          return tenant[field]
        }
      }
      
      return 'No additional details provided.'
    }
    
    // ==================== PAGINATION ====================
    
    const paginatedTenants = computed(() => {
      const filtered = Array.isArray(filteredTenants.value) ? filteredTenants.value : []
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filtered.slice(start, end)
    })
    
    const totalPages = computed(() => {
      const filtered = Array.isArray(filteredTenants.value) ? filteredTenants.value : []
      return Math.ceil(filtered.length / itemsPerPage.value) || 1
    })
    
    const paginationStart = computed(() => {
      const filtered = Array.isArray(filteredTenants.value) ? filteredTenants.value : []
      return filtered.length === 0 
        ? 0 
        : (currentPage.value - 1) * itemsPerPage.value + 1
    })
    
    const paginationEnd = computed(() => {
      const filtered = Array.isArray(filteredTenants.value) ? filteredTenants.value : []
      return Math.min(currentPage.value * itemsPerPage.value, filtered.length)
    })
    
    const displayedPageNumbers = computed(() => {
      const maxDisplayed = 5
      const pages = []
      
      if (totalPages.value <= maxDisplayed) {
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        
        let startPage = Math.max(2, currentPage.value - 1)
        let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)
        
        if (currentPage.value <= 2) {
          endPage = 3
        }
        
        if (currentPage.value >= totalPages.value - 1) {
          startPage = totalPages.value - 2
        }
        
        if (startPage > 2) {
          pages.push('...')
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
        
        if (endPage < totalPages.value - 1) {
          pages.push('...')
        }
        
        if (totalPages.value > 1) {
          pages.push(totalPages.value)
        }
      }
      
      return pages
    })
    
    // ==================== HELPER METHODS ====================
    
    const getTenantName = (tenant) => {
      if (!tenant) return 'Unknown Tenant'
      
      if (tenant.full_name) return tenant.full_name
      if (tenant.FullName) return tenant.FullName
      if (tenant.fullName) return tenant.fullName
      if (tenant.name) return tenant.name
      if (tenant.Name) return tenant.Name
      
      if (tenant.email) return tenant.email.split('@')[0]
      if (tenant.Email) return tenant.Email.split('@')[0]
      
      return (tenant.id || tenant.ID) ? `User ${tenant.id || tenant.ID}` : 'Unknown Tenant'
    }
    
    const getTenantEmail = (tenant) => {
      if (!tenant) return 'No email provided'
      
      if (tenant.email) return tenant.email
      if (tenant.Email) return tenant.Email
      if (tenant.email_address) return tenant.email_address
      if (tenant.EmailAddress) return tenant.EmailAddress
      
      return 'No email provided'
    }
    
    const getTenantInitial = (tenant) => {
      if (!tenant) return 'T'
      
      const name = getTenantName(tenant)
      if (name && name !== 'Unknown Tenant' && name.length > 0) {
        return name.charAt(0).toUpperCase()
      }
      
      const email = getTenantEmail(tenant)
      if (email && email !== 'No email provided' && email.length > 0) {
        return email.charAt(0).toUpperCase()
      }
      
      return 'T'
    }
    
    const getStatusBadgeClass = (status) => {
      const normalizedStatus = normalizeStatus({ status })
      const classes = {
        'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        'approved': 'bg-green-100 text-green-800 border border-green-200',
        'rejected': 'bg-red-100 text-red-800 border border-red-200'
      }
      return classes[normalizedStatus] || 'bg-gray-100 text-gray-800 border border-gray-200'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return 'N/A'
      }
    }
    
    const goToPage = (page) => {
      if (page !== '...') {
        currentPage.value = page
      }
    }
    
    // ==================== FILTER FUNCTIONS ====================
    
    const applyFilters = (newFilter = null) => {
      if (newFilter !== null) {
        statusFilter.value = newFilter
      }
      
      currentPage.value = 1
      console.log(`Applied filter: ${statusFilter.value}`)
    }
    
    // ==================== MODAL HANDLERS ====================
    
    const handleViewDetails = (tenant) => {
  selectedTenant.value = tenant
  showDetailsModal.value = true
  const tenantId = tenant.id || tenant.ID
  loadBankDetails(tenantId)
}
    
    const handleApproveFromDetails = () => {
      handleApprove(selectedTenant.value)
      showDetailsModal.value = false
    }
    
    const handleRejectFromDetails = () => {
      showDetailsModal.value = false
      handleRejectClick(selectedTenant.value)
    }
    
    // ==================== DATA LOADING ====================
    
    const loadAllTenants = async () => {
      loading.value = true
      
      try {
        console.log('🔄 Loading ALL tenant data...')
        
        let allTenantsData = []
        
        const endpoints = [
          '/superadmin/tenants',
          '/superadmin/tenants?status=pending',
          '/superadmin/tenants?status=approved', 
          '/superadmin/tenants?status=active',
          '/superadmin/tenants?status=rejected'
        ]
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(API_URL + endpoint, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              let tenantData = []
              
              if (data && data.data && Array.isArray(data.data)) {
                tenantData = data.data
              } else if (Array.isArray(data)) {
                tenantData = data
              } else if (data && Array.isArray(data.tenants)) {
                tenantData = data.tenants
              }
              
              if (tenantData.length > 0) {
                console.log(`✅ Got ${tenantData.length} tenants from ${endpoint}`)
                
                tenantData.forEach(tenant => {
                  const tenantId = tenant.id || tenant.ID
                  if (tenantId && !allTenantsData.find(existing => (existing.id || existing.ID) === tenantId)) {
                    allTenantsData.push(tenant)
                  }
                })
              }
            }
          } catch (endpointError) {
            console.error(`❌ Error with endpoint ${endpoint}:`, endpointError)
          }
        }
        
        if (allTenantsData.length === 0) {
          console.log('🔧 Trying service methods as fallback...')
          
          try {
            const serviceResponse = await superAdminService.getAllTenants()
            
            if (serviceResponse && serviceResponse.success && serviceResponse.data) {
              if (Array.isArray(serviceResponse.data)) {
                allTenantsData = serviceResponse.data
                console.log(`✅ Loaded ${allTenantsData.length} tenants from service`)
              }
            }
          } catch (serviceError) {
            console.error('❌ Error with service methods:', serviceError)
          }
        }
        
        allTenants.value = [...allTenantsData]
        tenants.value = [...allTenantsData]
        
        await nextTick()
        
        console.log(`📊 FINAL RESULT: ${allTenantsData.length} total tenants loaded`)
        
        if (allTenantsData.length > 0) {
          toast.success(`Loaded ${allTenantsData.length} total tenants`)
        } else {
          toast.warning('No tenant data found')
        }
        
      } catch (error) {
        console.error('❌ Error in loadAllTenants:', error)
        allTenants.value = []
        tenants.value = []
        toast.error('Error loading tenant data')
      } finally {
        loading.value = false
      }
    }
    
    const loadTenants = async () => {
      await loadAllTenants()
    }
    
    // ==================== APPROVAL/REJECTION HANDLERS ====================
    
    const handleApprove = async (tenant) => {
      if (!tenant) {
        toast.error('Cannot approve: Missing tenant')
        return
      }
      
      const tenantId = tenant.id || tenant.ID
      
      if (!tenantId) {
        toast.error('Cannot approve: Missing tenant ID')
        return
      }
      
      isProcessing.value = true
      console.log(`🔄 Attempting to approve tenant ${tenantId}`)
      
      try {
        const response = await fetch(API_URL + `/superadmin/tenants/${tenantId}/approval`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            status: "APPROVED"
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Approval successful:', data)
          toast.success(`Tenant ${getTenantName(tenant)} approved successfully`)
          
          await loadAllTenants()
          emit('updated')
        } else {
          console.error('❌ Approval failed with status:', response.status)
          const errorData = await response.text()
          console.error('Error response:', errorData)
          toast.error(`Failed to approve tenant: ${response.statusText}`)
        }
      } catch (error) {
        console.error('❌ Error in approval process:', error)
        toast.error('Error approving tenant: ' + (error.message || 'Unknown error'))
      } finally {
        isProcessing.value = false
      }
    }
    
    const handleRejectClick = (tenant) => {
      if (!tenant) {
        toast.error('Cannot reject: Missing tenant')
        return
      }
      
      const tenantId = tenant.id || tenant.ID
      
      if (!tenantId) {
        toast.error('Cannot reject: Missing tenant ID')
        return
      }
      
      selectedTenant.value = tenant
      rejectReason.value = ''
      showRejectModal.value = true
    }
    
    const confirmReject = async () => {
      const tenant = selectedTenant.value
      
      if (!tenant) {
        toast.error('Cannot reject: Missing tenant')
        showRejectModal.value = false
        return
      }
      
      const tenantId = tenant.id || tenant.ID
      
      if (!tenantId) {
        toast.error('Cannot reject: Missing tenant ID')
        showRejectModal.value = false
        return
      }
      
      if (!rejectReason.value.trim()) {
        toast.warning('Please provide a rejection reason')
        return
      }
      
      isProcessing.value = true
      
      try {
        const response = await fetch(API_URL + `/superadmin/tenants/${tenantId}/approval`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            status: "REJECTED",
            reason: rejectReason.value
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Rejection successful:', data)
          toast.success(`Tenant ${getTenantName(tenant)} rejected successfully`)
          showRejectModal.value = false
          
          await loadAllTenants()
          emit('updated')
        } else {
          console.error('❌ Rejection failed with status:', response.status)
          const errorData = await response.text()
          console.error('Error response:', errorData)
          toast.error(`Failed to reject tenant: ${response.statusText}`)
        }
      } catch (error) {
        console.error('❌ Error in rejection process:', error)
        toast.error('Error rejecting tenant: ' + (error.message || 'Unknown error'))
      } finally {
        isProcessing.value = false
      }
    }
    
    // ==================== WATCHERS ====================
    
    watch(statusFilter, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        currentPage.value = 1
      }
    })
    
    // ==================== LIFECYCLE ====================
    
    onMounted(() => {
      console.log('🚀 Component mounted, loading tenants...')
      loadAllTenants()
    })
    
    return {
      loading,
      tenants,
      allTenants,
      pendingCount,
      approvedCount,
      rejectedCount,
      statusFilter,
      currentPage,
      itemsPerPage,
      filteredTenants,
      paginatedTenants,
      totalPages,
      paginationStart,
      paginationEnd,
      displayedPageNumbers,
      getStatusBadgeClass,
      formatDate,
      loadTenants,
      loadAllTenants,
      handleApprove,
      handleRejectClick,
      getTenantName,
      getTenantEmail,
      getTenantInitial,
      goToPage,
      isStatusPending,
      isStatusApproved,
      isStatusRejected,
      applyFilters,
      isProcessing,
      showRejectModal,
      selectedTenant,
      rejectReason,
      confirmReject,
      showDetailsModal,
      handleViewDetails,
      handleApproveFromDetails,
      handleRejectFromDetails,
      getTempleDetail,
      getTempleDescription,
      // Media helpers
      getLogoUrl,
      getVideoUrl,
      getFullMediaUrl,
      handleImageError,
      handleVideoError,
      debugMode,
      tenantBankDetails,
      loadingBankDetails,
      normalizeStatus
    }
  }
}
</script>
