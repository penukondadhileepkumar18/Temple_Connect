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
          @change="applyFilters"
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

    <!-- Tenant Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
          <h3 class="text-xl font-bold text-gray-900">Tenant Details</h3>
          <button 
            @click="showDetailsModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="selectedTenant" class="space-y-5">
          <!-- Basic Info -->
          <div>
            <div class="flex items-center gap-4 mb-4">
              <div class="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span class="text-indigo-600 font-semibold text-2xl">
                  {{ getTenantInitial(selectedTenant) }}
                </span>
              </div>
              <div>
                <h4 class="text-xl font-semibold text-gray-900">
                  {{ getTenantName(selectedTenant) }}
                </h4>
                <p class="text-gray-600">{{ getTenantEmail(selectedTenant) }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- First Column -->
              <div class="space-y-4">
                <div class="border-b border-gray-100 pb-3">
                  <div class="text-sm font-medium text-gray-500">Status</div>
                  <div class="text-base text-gray-900 mt-1">
                    <span :class="getStatusBadgeClass(selectedTenant.status || selectedTenant.Status)" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                      {{ selectedTenant.status || selectedTenant.Status || 'pending' }}
                    </span>
                  </div>
                </div>
                
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
                  <div class="text-sm font-medium text-gray-500">User ID</div>
                  <div class="text-base text-gray-900 mt-1">
                    {{ selectedTenant.id || selectedTenant.ID || 'Not available' }}
                  </div>
                </div>
              </div>
              
              <!-- Second Column - Temple Details -->
              <div class="space-y-4">
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
        
        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button 
            @click="showDetailsModal = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
          >
            Close
          </button>
          
          <div v-if="isStatusPending(selectedTenant)">
            <button
              @click="handleApproveFromDetails"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
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

export default {
  name: 'TenantApprovals',
  emits: ['updated'],
  setup(props, { emit }) {
    const loading = ref(true)
    const tenants = ref([])
    const allTenants = ref([])
    const toast = useToast()
    const isProcessing = ref(false)
    const API_URL = '/api/v1'
    
    const debugMode = ref(false)
    
    const showRejectModal = ref(false)
    const selectedTenant = ref(null)
    const rejectReason = ref('')
    const showDetailsModal = ref(false)
    const statusFilter = ref('')
    const currentPage = ref(1)
    const itemsPerPage = ref(5)
    
    // ==================== STATUS HELPERS ====================
    
    const normalizeStatus = (tenant) => {
      if (!tenant) return 'pending'
      
      let status = tenant.status || tenant.Status || tenant.approval_status || tenant.approvalStatus || ''
      status = String(status).toLowerCase().trim()
      
      if (!status || status === 'null' || status === 'undefined') return 'pending'
      
      const statusMappings = {
        'approved': 'approved',
        'active': 'approved',
        'accepted': 'approved',
        'confirmed': 'approved',
        'rejected': 'rejected',
        'declined': 'rejected',
        'denied': 'rejected',
        'pending': 'pending',
        'pending_approval': 'pending',
        'waiting': 'pending',
        'submitted': 'pending'
      }
      
      return statusMappings[status] || 'pending'
    }
    
    const isStatusPending = (tenant) => normalizeStatus(tenant) === 'pending'
    const isStatusApproved = (tenant) => normalizeStatus(tenant) === 'approved'
    const isStatusRejected = (tenant) => normalizeStatus(tenant) === 'rejected'
    
    // ==================== COMPUTED PROPERTIES ====================
    
    const pendingCount = computed(() => {
      const tenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      return tenantsArray.filter(tenant => isStatusPending(tenant)).length
    })
    
    const approvedCount = computed(() => {
      const tenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      return tenantsArray.filter(tenant => isStatusApproved(tenant)).length
    })
    
    const rejectedCount = computed(() => {
      const tenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      return tenantsArray.filter(tenant => isStatusRejected(tenant)).length
    })
    
    const filteredTenants = computed(() => {
      const allTenantsArray = Array.isArray(allTenants.value) ? allTenants.value : []
      
      if (!statusFilter.value || statusFilter.value === '') {
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
      if (!tenant) {
        console.warn('getTempleDetail: No tenant provided')
        return fallback
      }
      
      // Priority 1: Check temple_details object
      if (tenant.temple_details && typeof tenant.temple_details === 'object') {
        if (tenant.temple_details[field]) {
          return tenant.temple_details[field]
        }
        
        const camelCase = field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
        if (tenant.temple_details[camelCase]) {
          return tenant.temple_details[camelCase]
        }
        
        const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
        if (tenant.temple_details[pascalCase]) {
          return tenant.temple_details[pascalCase]
        }
      }
      
      // Priority 2: Check direct tenant properties
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
      
      // Priority 3: Check temple object
      if (tenant.temple && typeof tenant.temple === 'object') {
        const simpleField = field.replace('temple_', '')
        
        if (tenant.temple[simpleField]) {
          return tenant.temple[simpleField]
        }
        
        if (tenant.temple[field]) {
          return tenant.temple[field]
        }
      }
      
      return fallback
    }

    const getTempleDescription = (tenant) => {
      if (!tenant) return 'No additional details provided.'
      
      if (tenant.temple_details) {
        const descFields = ['temple_description', 'templeDescription', 'TempleDescription', 'description', 'Description']
        
        for (const field of descFields) {
          if (tenant.temple_details[field]) {
            return tenant.temple_details[field]
          }
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
      return filtered.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
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
        
        if (currentPage.value <= 2) endPage = 3
        if (currentPage.value >= totalPages.value - 1) startPage = totalPages.value - 2
        
        if (startPage > 2) pages.push('...')
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
        
        if (endPage < totalPages.value - 1) pages.push('...')
        if (totalPages.value > 1) pages.push(totalPages.value)
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
    }
    
    // ==================== MODAL HANDLERS ====================
    
    const handleViewDetails = async (tenant) => {
      selectedTenant.value = tenant
      
      console.log('Opening details for tenant:', tenant)
      console.log('Temple details:', tenant.temple_details)
      
      // If temple details are missing, try to fetch them
      const tenantId = tenant.id || tenant.ID
      if (tenantId && (!tenant.temple_details || Object.keys(tenant.temple_details).length === 0)) {
        console.log('Temple details missing, fetching...')
        
        try {
          const response = await fetch(API_URL + `/tenant-details/${tenantId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('Fetched temple details:', data)
            
            // Update the selected tenant with temple details
            selectedTenant.value = {
              ...tenant,
              temple_details: data.data || data
            }
            
            // Also update in the main tenants array
            const index = allTenants.value.findIndex(t => (t.id || t.ID) === tenantId)
            if (index !== -1) {
              allTenants.value[index] = {
                ...allTenants.value[index],
                temple_details: data.data || data
              }
            }
          }
        } catch (error) {
          console.error('Error fetching temple details:', error)
        }
      }
      
      showDetailsModal.value = true
    }
    
    const handleApproveFromDetails = () => {
      handleApprove(selectedTenant.value)
      showDetailsModal.value = false
    }
    
    // ==================== DATA LOADING ====================
    
    const loadAllTenants = async () => {
      loading.value = true
      
      try {
        console.log('🔄 Loading ALL tenant data with temple details...')
        
        let allTenantsData = []
        
        // Method 1: Try the main tenants endpoint
        try {
          console.log('🔗 Trying main /superadmin/tenants endpoint...')
          
          const response = await fetch(API_URL + '/superadmin/tenants', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            let tenantData = []
            
            // Handle different response structures
            if (data && data.data && Array.isArray(data.data)) {
              tenantData = data.data
            } else if (Array.isArray(data)) {
              tenantData = data
            } else if (data && Array.isArray(data.tenants)) {
              tenantData = data.tenants
            }
            
            if (tenantData.length > 0) {
              console.log(`✅ Got ${tenantData.length} tenants from main endpoint`)
              
              // Check if temple_details are included
              const firstTenant = tenantData[0]
              console.log('First tenant structure:', firstTenant)
              console.log('First tenant temple_details:', firstTenant.temple_details)
              
              // If temple_details are missing, fetch them individually
              for (const tenant of tenantData) {
                if (!tenant.temple_details || Object.keys(tenant.temple_details || {}).length === 0) {
                  console.log(`⚠️ Tenant ${tenant.id || tenant.ID} missing temple_details, fetching...`)
                  
                  try {
                    const tenantId = tenant.id || tenant.ID
                    const detailsResponse = await fetch(API_URL + `/tenant-details/${tenantId}`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                      }
                    })
                    
                    if (detailsResponse.ok) {
                      const detailsData = await detailsResponse.json()
                      console.log(`✅ Fetched temple details for tenant ${tenantId}:`, detailsData)
                      
                      // Merge temple details into tenant object
                      tenant.temple_details = detailsData.data || detailsData
                    }
                  } catch (detailsError) {
                    console.warn(`Failed to fetch temple details for tenant ${tenant.id || tenant.ID}:`, detailsError)
                  }
                }
              }
              
              allTenantsData = tenantData
            }
          }
        } catch (error) {
          console.error('❌ Error with main endpoint:', error)
        }
        
        // Method 2: If main endpoint failed, try status-based endpoints
        if (allTenantsData.length === 0) {
          console.log('🔧 Trying status-based endpoints...')
          
          const statusEndpoints = [
            '/superadmin/tenants?status=pending',
            '/superadmin/tenants?status=approved',
            '/superadmin/tenants?status=active',
            '/superadmin/tenants?status=rejected'
          ]
          
          for (const endpoint of statusEndpoints) {
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
                }
                
                if (tenantData.length > 0) {
                  console.log(`✅ Got ${tenantData.length} tenants from ${endpoint}`)
                  
                  // Fetch temple details for each tenant if missing
                  for (const tenant of tenantData) {
                    const tenantId = tenant.id || tenant.ID
                    
                    if (tenantId && (!tenant.temple_details || Object.keys(tenant.temple_details || {}).length === 0)) {
                      try {
                        const detailsResponse = await fetch(API_URL + `/tenant-details/${tenantId}`, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                          }
                        })
                        
                        if (detailsResponse.ok) {
                          const detailsData = await detailsResponse.json()
                          tenant.temple_details = detailsData.data || detailsData
                        }
                      } catch (detailsError) {
                        console.warn(`Failed to fetch details for tenant ${tenantId}:`, detailsError)
                      }
                    }
                    
                    // Add tenant if not already in array
                    if (!allTenantsData.find(existing => (existing.id || existing.ID) === tenantId)) {
                      allTenantsData.push(tenant)
                    }
                  }
                }
              }
            } catch (error) {
              console.error(`❌ Error with ${endpoint}:`, error)
            }
          }
        }
        
        // Method 3: Fallback to service methods
        if (allTenantsData.length === 0) {
          console.log('🔧 Trying service methods as fallback...')
          
          try {
            const serviceResponse = await superAdminService.getAllTenants()
            
            if (serviceResponse && serviceResponse.success && serviceResponse.data) {
              if (Array.isArray(serviceResponse.data)) {
                allTenantsData = serviceResponse.data
                console.log(`✅ Loaded ${allTenantsData.length} tenants from service`)
                
                // Fetch temple details for each
                for (const tenant of allTenantsData) {
                  if (!tenant.temple_details) {
                    const tenantId = tenant.id || tenant.ID
                    if (tenantId) {
                      try {
                        const detailsResponse = await superAdminService.getTenantDetails(tenantId)
                        if (detailsResponse.success && detailsResponse.data) {
                          tenant.temple_details = detailsResponse.data.temple_details || detailsResponse.data
                        }
                      } catch (err) {
                        console.warn(`Failed to get details for tenant ${tenantId}`)
                      }
                    }
                  }
                }
              }
            }
          } catch (serviceError) {
            console.error('❌ Error with service methods:', serviceError)
          }
        }
        
        // Log final data structure
        console.log('📦 Final tenant data loaded:', allTenantsData.length)
        if (allTenantsData.length > 0) {
          console.log('📦 Sample tenant with temple details:', {
            id: allTenantsData[0].id || allTenantsData[0].ID,
            name: allTenantsData[0].full_name || allTenantsData[0].FullName,
            temple_details: allTenantsData[0].temple_details
          })
        }
        
        // CRITICAL: Force reactive update
        allTenants.value = [...allTenantsData]
        tenants.value = [...allTenantsData]
        
        // Force computed property recalculation
        await nextTick()
        
        console.log(`📊 FINAL RESULT: ${allTenantsData.length} total tenants loaded`)
        console.log(`📊 STATUS BREAKDOWN:
          - Pending: ${allTenantsData.filter(t => isStatusPending(t)).length}
          - Approved: ${allTenantsData.filter(t => isStatusApproved(t)).length}
          - Rejected: ${allTenantsData.filter(t => isStatusRejected(t)).length}`)
        
        if (allTenantsData.length > 0) {
          toast.success(`Loaded ${allTenantsData.length} total tenants with temple details`)
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
          
          // Refresh the tenant list
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
          
          // Refresh the tenant list
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
    
    watch(allTenants, (newTenants) => {
      console.log(`🔄 allTenants changed: ${newTenants.length} tenants`)
    }, { deep: true })
    
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
      getTempleDetail,
      getTempleDescription,
      debugMode
    }
  }
}
</script>