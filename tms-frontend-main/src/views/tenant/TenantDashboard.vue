<template>
  <div 
    class="min-h-screen relative overflow-x-hidden"
  >
    <!-- Full viewport background layer - light grey -->
    <div 
      v-if="hasValidLogo"
      class="fixed inset-0 pointer-events-none"
      style="z-index: 0; background-color: #e5e7eb;"
    ></div>
    
    <!-- Background logo layer - black and white impression watermark -->
    <div 
      v-if="hasValidLogo"
      class="fixed inset-0 pointer-events-none flex"
      style="z-index: 1; justify-content: center; align-items: center; padding-left: 20%; padding-top: 5%;"
    >
      <img
        :src="dashboardLogo"
        alt="Background Logo"
        class="object-contain"
        style="max-width: 80%; max-height: 80%; width: auto; height: auto; display: block; opacity: 0.15; filter: grayscale(100%) brightness(0.5) contrast(0.8);"
        @error="handleImageError"
        @load="handleImageLoad"
      />
    </div>

    <!-- Content wrapper with relative positioning -->
    <div class="relative" style="z-index: 10;">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
       <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0 flex items-center space-x-3 -ml-2 sm:-ml-4 -mt-2 -mb-2 sm:-mt-4 sm:-mb-4">
          <img 
            v-if="hasValidLogo"
            :key="dashboardLogo"
            :src="dashboardLogo" 
            alt="Tenant Logo" 
            class="object-contain flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            @error="handleImageError"
            @load="handleImageLoad"
            @click="expandLogo"
            style="height: 80px; width: auto; max-width: 300px; display: block;"
            title="Click to view logo"
          />
          <div v-else class="h-20 w-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <span class="text-gray-400 text-xs">{{ dashboardLogo && dashboardLogo.trim() !== '' ? 'Loading...' : 'No logo' }}</span>
          </div>
          <div>
           <h1 
             :class="[
               'text-base sm:text-lg font-bold',
               hasVideo ? 'cursor-pointer hover:text-indigo-600 transition-colors' : 'text-gray-900'
             ]"
             @click="hasVideo ? playVideo() : null"
             :title="hasVideo ? 'Click to play intro video' : ''"
           >
             {{ dashboardTitle }}
           </h1>
           <p class="text-xs sm:text-sm text-gray-600 mt-1">
              Manage your temple registrations and applications
              <span v-if="tenantId" class="text-indigo-600 font-medium"> (Tenant ID: {{ tenantId }})</span>
            </p>
          </div>
        </div>
          <div class="flex items-center space-x-4">
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
     <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Welcome Banner with Approval Status -->
      <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-white">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="flex-1">
           <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome back!</h2>
            <p class="text-indigo-100 text-sm sm:text-base lg:text-lg mb-4">
              {{ isTenantUser ? 'Manage your temple applications and track their approval status' : 'View and access temples for this tenant' }}
            </p>
          </div>
          
          <div class="mt-6 md:mt-0" v-if="isTenantUser">
            <button
              @click="handleCreateTempleClick"
              :disabled="isMonitoringUser"
              :class="[
                'inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg',
                isMonitoringUser 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-xl transform hover:-translate-y-1'
              ]"
              :title="isMonitoringUser ? 'Monitoring users are not allowed to create temples' : 'Create a new temple'"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create New Temple
            </button>
          </div>
        </div>
      </div>

      <!-- Permission Denied Alert for Monitoring Users -->
      <div v-if="showPermissionAlert" class="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-semibold text-red-800">Access Restricted</h3>
            <p class="mt-2 text-sm text-red-700">
              You are not allowed to create temples. Monitoring users have view-only access to temple data. 
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-indigo-100 rounded-xl">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total Temples</p>
              <p class="text-2xl font-bold text-gray-900">{{ templeStore.temples.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-xl">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Approved</p>
              <p class="text-2xl font-bold text-gray-900">{{ approvedTemplesCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 bg-amber-100 rounded-xl">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingTemplesCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Temple List Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ isTenantUser ? 'Your Temples' : 'Available Temples' }}</h3>
              <p class="text-gray-600 mt-1">
                {{ isTenantUser ? 'Manage and track your temple applications' : 'Select a temple to access its dashboard' }}
              </p>
            </div>
            <div class="mt-4 sm:mt-0" v-if="isTenantUser">
              <button
                @click="handleCreateTempleClick"
                :disabled="isMonitoringUser"
                :class="[
                  'inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 font-medium',
                  isMonitoringUser 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                ]"
                :title="isMonitoringUser ? 'Monitoring users are not allowed to create temples' : 'Add a new temple'"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Temple
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading temples...</p>
        </div>

        <!-- Temples List -->
        <div v-else-if="templeStore.temples.length > 0" class="divide-y divide-gray-200">
          <div 
            v-for="temple in templeStore.temples" 
            :key="temple.id"
            class="p-6 hover:bg-gray-50 transition-colors duration-150"
          >
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <!-- Temple Info -->
              <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center mb-2">
                  <h4 class="text-base sm:text-lg font-semibold text-gray-900 mr-0 sm:mr-3 mb-2 sm:mb-0">{{ temple.name }}</h4>
                  <TempleApprovalStatus :status="temple.status" />
                </div>
                <p class="text-gray-600 mb-2">{{ formatAddress(temple.address) }}</p>
                <div class="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Created: {{ formatDate(temple.createdAt) }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ temple.city }}, {{ temple.state }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
               <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  @click="viewTemple(temple)"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  View
                </button>
                
                <!-- Only show Edit button for tenant users who are not monitoring users -->
                <button
                  v-if="isTenantUser && !isMonitoringUser"
                  @click="editTemple(temple)"
                  class="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit
                </button>

                <!-- Access or Manage Button -->
                <button
                  @click="manageTemple(temple)"
                  :disabled="isTenantUser && !isMonitoringUser && !isTempleApproved(temple)"
                  :class="[
                    'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    (isTenantUser && !isMonitoringUser && !isTempleApproved(temple))
                      ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  ]"
                  :title="(isTenantUser && !isMonitoringUser && !isTempleApproved(temple)) ? 'Temple needs approval before it can be managed' : ''"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                  </svg>
                  {{ (isTenantUser && !isMonitoringUser) ? 'Manage' : 'Access Dashboard' }}
                </button>
              </div>
            </div>

            <!-- Rejection Notes (if rejected) - Only show for non-monitoring tenant users -->
            <div v-if="isTenantUser && !isMonitoringUser && isTempleRejected(temple) && temple.adminNotes" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h5 class="text-sm font-medium text-red-800 mb-1">Admin Notes:</h5>
                  <p class="text-sm text-red-700">{{ temple.adminNotes }}</p>
                  <button
                    @click="reUploadDocuments(temple)"
                    class="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                  >
                    Re-upload Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="p-12 text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No temples registered yet</h3>
          <p class="text-gray-600 mb-6">
            {{ isTenantUser && !isMonitoringUser ? 'Get started by creating your first temple registration' : 'No temples are available for this tenant' }}
          </p>
          <button
            v-if="isTenantUser && !isMonitoringUser"
            @click="handleCreateTempleClick"
            class="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Create Your First Temple
          </button>
        </div>
      </div>
    </div>
    </div>
    
    <!-- Logo Expand Modal -->
    <div 
      v-if="showLogoModal && hasValidLogo"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      @click.self="closeLogoModal"
    >
      <div class="relative w-full max-w-4xl mx-4">
        <button
          @click="closeLogoModal"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          style="z-index: 51;"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="bg-white rounded-lg shadow-2xl p-8">
          <img
            :src="dashboardLogo"
            alt="Tenant Logo"
            class="w-full h-auto object-contain max-h-[80vh]"
            @error="handleImageError"
            @load="handleImageLoad"
          />
        </div>
      </div>
    </div>
    
    <!-- Video Player Modal -->
    <div 
      v-if="showVideoPlayer && introVideoUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      @click.self="closeVideoPlayer"
    >
      <div class="relative w-full max-w-4xl mx-4">
        <button
          @click="closeVideoPlayer"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          style="z-index: 51;"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <video
          :src="introVideoUrl"
          controls
          autoplay
          class="w-full h-auto rounded-lg shadow-2xl"
          @ended="closeVideoPlayer"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTempleStore } from '@/stores/temple'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import TempleApprovalStatus from '@/components/temple/TempleApprovalStatus.vue'
import api from '@/services/api'

const selectedSection = ref('dashboard')
const dashboardLogo = ref('')
const introVideoUrl = ref('')
const showVideoPlayer = ref(false)
const showLogoModal = ref(false)
const tenantName = ref('')

const hasValidLogo = computed(() => {
  return dashboardLogo.value &&
         dashboardLogo.value.trim() !== '' &&
         !dashboardLogo.value.includes('jay-jagannath-group-logo.png')
})

const hasVideo = computed(() => {
  return introVideoUrl.value && introVideoUrl.value.trim() !== ''
})

const dashboardTitle = computed(() => {
  if (tenantName.value) {
    return `${tenantName.value} Dashboard`
  }
  return 'Tenant Dashboard'
})

const router = useRouter()
const route = useRoute()
const templeStore = useTempleStore()
const userStore = useAuthStore()
const { showToast } = useToast()

const isLoading = ref(true)
const showPermissionAlert = ref(false)

// ============================================================
// STATUS HELPERS
// ============================================================
const isTempleApproved = (temple) => {
  return (temple.status || '').toString().toLowerCase() === 'approved'
}

const isTempleRejected = (temple) => {
  return (temple.status || '').toString().toLowerCase() === 'rejected'
}

const isTemplePending = (temple) => {
  return (temple.status || '').toString().toLowerCase() === 'pending'
}

const isUserApproved = computed(() => {
  return (userStore.user?.status || '').toString().toLowerCase() === 'approved'
})

const isUserRejected = computed(() => {
  return (userStore.user?.status || '').toString().toLowerCase() === 'rejected'
})

const isUserPending = computed(() => {
  const status = (userStore.user?.status || '').toString().toLowerCase()
  return status === 'pending' || !status
})

// ============================================================
// ROLE CHECKS
// ============================================================
const isTenantUser = computed(() => {
  const role = (userStore.userRole || '').toLowerCase()
  return role === 'tenant' || role === 'templeadmin'
})

const isMonitoringUser = computed(() => {
  const role = (userStore.userRole || '').toLowerCase()
  const roleId = userStore.user?.roleId || userStore.user?.role_id
  return role === 'monitoring_user' || role === 'monitoringuser' || roleId === 6 || roleId === '6'
})

const isStandardUser = computed(() => {
  const role = (userStore.userRole || '').toLowerCase()
  return role === 'standard_user' || role === 'standarduser'
})

// ============================================================
// TENANT ID — covers all roles
// ============================================================
const tenantId = computed(() => {
  // 1. Superadmin viewing a specific tenant via route params
  if (route.params.tenantId) {
    console.log('Using tenantId from route params:', route.params.tenantId)
    return route.params.tenantId
  }

  // 2. Superadmin navigating from tenant dashboard via query param
  if (route.query.tenant_id) {
    console.log('Using tenantId from route query:', route.query.tenant_id)
    return route.query.tenant_id
  }

  // 3. Standard/Monitoring user — try all possible sources for assigned tenant
  if (isMonitoringUser.value || isStandardUser.value) {
    const assignedId =
      userStore.assignedTenantId ||
      userStore.user?.assignedTenantId ||
      userStore.user?.assigned_tenant_id ||
      userStore.user?.tenant_id ||
      userStore.user?.tenantId ||
      localStorage.getItem('assigned_tenant_id') ||
      localStorage.getItem('selected_tenant_id')

    if (assignedId) {
      console.log('Using assigned tenant ID for standard/monitoring user:', assignedId)
      return assignedId
    }

    console.warn('⚠️ Standard/Monitoring user has no assigned tenant ID in any source')
  }

  // 4. Templeadmin — their own user ID is the tenant ID
  if (isTenantUser.value) {
    const tid = userStore.currentTenantId || localStorage.getItem('current_tenant_id') || userStore.user?.id
    if (tid) {
      console.log('Using templeadmin own ID as tenant ID:', tid)
      return tid
    }
  }

  // 5. Superadmin without route context — check localStorage
  const fallback =
    localStorage.getItem('current_tenant_id') ||
    localStorage.getItem('currentTenantId') ||
    localStorage.getItem('tenant_id')

  console.log('Using localStorage fallback tenant ID:', fallback)
  return fallback
})

// ============================================================
// HANDLE CREATE TEMPLE CLICK
// Passes tenant ID via route query so CreateTemple.vue can
// always resolve it regardless of role
// ============================================================
const handleCreateTempleClick = () => {
  if (isMonitoringUser.value) {
    showPermissionAlert.value = true
    showToast('You are not allowed to create temples. Monitoring users have view-only access.', 'error')
    setTimeout(() => { showPermissionAlert.value = false }, 5000)
    return
  }

  const tid = tenantId.value

  if (!tid) {
    showToast('Unable to determine tenant. Please refresh and try again.', 'error')
    return
  }

  console.log('🏛️ Navigating to CreateTemple with tenant_id:', tid)

  // Always pass tenant_id as query param — CreateTemple.vue reads this first
  // Also persist to localStorage as a safety net
  localStorage.setItem('currentTenantId', String(tid))

  router.push({
    path: '/tenant/entities/create',
    query: { tenant_id: String(tid) }
  })
}

// ============================================================
// COMPUTED COUNTS
// ============================================================
const approvedTemplesCount = computed(() => {
  return templeStore.temples.filter(t => isTempleApproved(t)).length
})

const pendingTemplesCount = computed(() => {
  return templeStore.temples.filter(t => isTemplePending(t)).length
})

// ============================================================
// METHODS
// ============================================================
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewTemple = (temple) => {
  router.push(`/tenant/entities/${temple.id}`)
}

const editTemple = (temple) => {
  if (isMonitoringUser.value) {
    showToast('You are not allowed to edit temples. Monitoring users have view-only access.', 'error')
    return
  }
  router.push(`/tenant/entities/${temple.id}/edit`)
}

const manageTemple = (temple) => {
  router.push(`/entity/${temple.id}/dashboard`)
}

const reUploadDocuments = (temple) => {
  if (isMonitoringUser.value) {
    showToast('You are not allowed to re-upload documents. Monitoring users have view-only access.', 'error')
    return
  }
  router.push(`/tenant/entities/${temple.id}/documents`)
}

const resetTempleData = () => {
  localStorage.removeItem('temple_data')
  localStorage.removeItem('temple_cache')
  if (typeof templeStore.clearTempleData === 'function') {
    templeStore.clearTempleData()
  }
}

const loadTempleData = async () => {
  isLoading.value = true

  if (!tenantId.value) {
    console.warn('No tenant ID available, cannot load temples')
    isLoading.value = false
    return
  }

  try {
    resetTempleData()

    const selectedTenantId = localStorage.getItem('selected_tenant_id')
    console.log('Loading temples for tenant ID:', tenantId.value, 'Selected tenant ID:', selectedTenantId)

    if (selectedTenantId) {
      console.log('Using fetchDirectByTenant for SuperAdmin tenant view')
      await templeStore.fetchDirectByTenant(selectedTenantId)
    } else {
      console.log('Using standard fetchTemples')
      await templeStore.fetchTemples(tenantId.value)
    }
  } catch (error) {
    console.error('Error loading temple data:', error)
    showToast('Failed to load temple data. Please try again.', 'error')
  } finally {
    isLoading.value = false
  }
}

const formatAddress = (address) => {
  if (!address) return ''
  try {
    const addr = typeof address === 'string' ? JSON.parse(address) : address
    if (!addr) return ''
    return [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ')
  } catch {
    return address || ''
  }
}

const handleImageError = () => {}
const handleImageLoad = () => {}

const playVideo = () => {
  if (introVideoUrl.value) {
    showVideoPlayer.value = true
  } else {
    showToast('No video available for this tenant', 'info')
  }
}

const closeVideoPlayer = () => { showVideoPlayer.value = false }
const expandLogo = () => { if (hasValidLogo.value) showLogoModal.value = true }
const closeLogoModal = () => { showLogoModal.value = false }

// ============================================================
// FETCH LOGO / VIDEO FROM API
// ============================================================
const fetchLogoFromAPI = async () => {
  try {
    let targetTenantId = tenantId.value

    console.log('=== FETCH LOGO DEBUG ===')
    console.log('📍 Target Tenant ID:', targetTenantId)
    console.log('👤 User Role:', userStore.userRole)
    console.log('👤 User ID:', userStore.user?.id)
    console.log('👤 Is Monitoring/Standard User:', isMonitoringUser.value || isStandardUser.value)
    console.log('👤 Assigned Tenant ID:', userStore.assignedTenantId)

    // For monitoring/standard users, prefer assigned tenant ID
    if ((isMonitoringUser.value || isStandardUser.value)) {
      const assigned =
        userStore.assignedTenantId ||
        userStore.user?.assignedTenantId ||
        userStore.user?.assigned_tenant_id ||
        userStore.user?.tenant_id ||
        localStorage.getItem('assigned_tenant_id')

      if (assigned) {
        targetTenantId = assigned
        console.log('✅ Using assigned tenant ID for logo fetch:', targetTenantId)
      }
    }

    if (!targetTenantId) {
      console.warn('⚠️ No tenant ID available for logo fetch')
      return
    }

    // Method 1: /tenant-details/:id
    console.log('🔄 Method 1: Fetching from /tenant-details/' + targetTenantId)
    try {
      const response1 = await api.get(`/tenant-details/${targetTenantId}`)
      const tenantData = response1?.data?.data || response1?.data || response1

      if (tenantData) {
        tenantName.value = tenantData.full_name || tenantData.fullName || tenantData.temple_name || tenantData.name || ''

        const logoUrl = tenantData.temple_details?.logo_url || tenantData.logo_url || null
        const videoUrl = tenantData.temple_details?.intro_video_url || tenantData.intro_video_url || null

        if (logoUrl && logoUrl.trim() !== '') {
          let finalLogoUrl = logoUrl
          if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
            finalLogoUrl = `${API_BASE_URL}${logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl}`
          }
          dashboardLogo.value = finalLogoUrl
          await nextTick()
        }

        if (videoUrl && videoUrl.trim() !== '') {
          let finalVideoUrl = videoUrl
          if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
            finalVideoUrl = `${API_BASE_URL}${videoUrl.startsWith('/') ? videoUrl : '/' + videoUrl}`
          }
          introVideoUrl.value = finalVideoUrl
        }

        if (tenantName.value || dashboardLogo.value) {
          console.log('✅ Successfully fetched data from tenant-details endpoint')
          return
        }
      }
    } catch (error1) {
      console.warn('⚠️ Method 1 failed, trying Method 2:', error1.message)
    }

    // Method 2: /tenantsInfo?status=active (fallback)
    console.log('🔄 Method 2: Fetching from /tenantsInfo?status=active')
    try {
      const response2 = await api.get('/tenantsInfo?status=active')
      let tenants = []
      if (Array.isArray(response2)) tenants = response2
      else if (response2 && Array.isArray(response2.data)) tenants = response2.data
      else if (response2?.tenants && Array.isArray(response2.tenants)) tenants = response2.tenants

      const matchingTenant = tenants.find(t => {
        const tId = t.id || t.user_id || t.userId || t.ID || null
        return tId && String(tId) === String(targetTenantId)
      })

      if (matchingTenant) {
        tenantName.value = matchingTenant.full_name || matchingTenant.fullName || matchingTenant.name || ''

        const logoUrl = matchingTenant.temple_details?.logo_url || matchingTenant.logo_url || null
        const videoUrl = matchingTenant.temple_details?.intro_video_url || matchingTenant.intro_video_url || null

        if (logoUrl && logoUrl.trim() !== '') {
          let finalLogoUrl = logoUrl
          if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
            finalLogoUrl = `${API_BASE_URL}${logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl}`
          }
          dashboardLogo.value = finalLogoUrl
          await nextTick()
        }

        if (videoUrl && videoUrl.trim() !== '') {
          let finalVideoUrl = videoUrl
          if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
            finalVideoUrl = `${API_BASE_URL}${videoUrl.startsWith('/') ? videoUrl : '/' + videoUrl}`
          }
          introVideoUrl.value = finalVideoUrl
        }
      }
    } catch (error2) {
      console.error('❌ Method 2 also failed:', error2.message)
    }
  } catch (error) {
    console.error('❌ Fatal error in fetchLogoFromAPI:', error)
  }
}

// ============================================================
// WATCHERS
// ============================================================
watch(tenantId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    console.log(`TenantId changed from ${oldValue} to ${newValue}, reloading data...`)
    await loadTempleData()
  }
})

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(async () => {
  console.log('TenantDashboard mounted with tenantId:', tenantId.value)
  console.log('User role:', userStore.userRole, 'Role ID:', userStore.user?.roleId)
  console.log('Is Monitoring User:', isMonitoringUser.value)
  console.log('Is Standard User:', isStandardUser.value)
  console.log('assignedTenantId:', userStore.assignedTenantId)
  console.log('user object:', userStore.user)

  await fetchLogoFromAPI()
  await loadTempleData()

  if (isTenantUser.value && !isMonitoringUser.value) {
    if (isUserPending.value) {
      showToast('Your account is pending approval from the administrator.', 'info')
    } else if (isUserRejected.value) {
      showToast('Your account has been rejected. Please contact support.', 'error')
    }
  }
})
</script>