<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <AppBreadcrumb :items="breadcrumbItems" class="mb-6" />

      <!-- Content -->
      <div>
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center h-64">
          <BaseLoader size="lg" />
        </div>

        <!-- Error -->
        <BaseAlert
          v-else-if="error"
          type="error"
          title="Error Loading Temple"
          :message="error"
          class="mb-6"
        />

        <!-- Temple Found -->
        <div v-else-if="temple" class="space-y-8">
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Header with Logo -->
            <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <div class="flex items-center space-x-4">
                <!-- Temple Logo -->
                <div v-if="templeLogo" class="flex-shrink-0">
                  <img 
                    :src="getMediaUrl(templeLogo)" 
                    :alt="temple.name"
                    class="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                    @error="handleImageError"
                  />
                </div>
                <h1 class="text-2xl font-bold text-gray-900">{{ temple.name || 'Unnamed Temple' }}</h1>
              </div>
              <TempleApprovalStatus :status="temple.status" />
            </div>

            <!-- Details -->
            <div class="p-6">
              <!-- Media Gallery -->
              <div v-if="templeLogo || templeVideo" class="mb-6">
                <h3 class="text-sm font-medium text-gray-500 mb-3">Media Gallery</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Logo Display -->
                  <div v-if="templeLogo" class="border rounded-lg overflow-hidden bg-gray-50">
                    <div class="p-3 bg-gray-100 border-b">
                      <span class="text-xs font-medium text-gray-600">Temple Logo</span>
                    </div>
                    <div class="p-4 flex items-center justify-center">
                      <img 
                        :src="getMediaUrl(templeLogo)" 
                        :alt="temple.name + ' Logo'"
                        class="max-h-48 w-auto rounded-lg shadow-md object-contain"
                        @error="handleImageError"
                      />
                    </div>
                  </div>

                  <!-- Video Display -->
                  <div v-if="templeVideo" class="border rounded-lg overflow-hidden bg-gray-50">
                    <div class="p-3 bg-gray-100 border-b">
                      <span class="text-xs font-medium text-gray-600">Temple Video</span>
                    </div>
                    <div class="p-4">
                      <video 
                        :src="getMediaUrl(templeVideo)" 
                        controls
                        class="w-full rounded-lg shadow-md"
                        @error="handleVideoError"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- Temple Info -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Temple Details</h3>
                  <div class="mt-2 space-y-3">
                    <div>
                      <span class="text-sm text-gray-500">Location:</span>
                      <span class="ml-2 text-sm text-gray-900">
                        {{ temple.city || 'N/A' }}, {{ temple.state || 'N/A' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Established:</span>
                      <span class="ml-2 text-sm text-gray-900">
                        {{ temple.established_year ?? temple.establishedYear ?? temple.establishedyear ?? 'Not mentioned' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Main Deity:</span>
                      <span class="ml-2 text-sm text-gray-900">
                        {{ mainDeity }}
                      </span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Temple Type:</span>
                      <span class="ml-2 text-sm text-gray-900">
                        {{ temple.templetype || temple.templeType || temple.temple_type || 'Not mentioned' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Contact Info -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div class="mt-2 space-y-3">
                    <div>
                      <span class="text-sm text-gray-500">Email:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ temple.email || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Phone:</span>
                      <span class="ml-2 text-sm text-gray-900">{{ temple.phone || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-500">Address:</span>
                      <span class="ml-2 text-sm text-gray-900">
                        <template v-if="temple.address && typeof temple.address === 'object'">
                          {{ temple.address.street || '' }}{{ temple.address.street ? ', ' : '' }}
                          {{ temple.address.city || '' }}{{ temple.address.city ? ', ' : '' }}
                          {{ temple.address.district || '' }}{{ temple.address.district ? ', ' : '' }}
                          {{ temple.address.state || '' }}{{ temple.address.state ? ', ' : '' }}
                          {{ temple.address.pincode || '' }}{{ temple.address.pincode ? ', ' : '' }}
                          {{ temple.address.country || '' }}
                        </template>
                        <template v-else>
                          {{ fullAddress || 'N/A' }}
                        </template>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description + Status Info Two Column Layout -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <!-- LEFT SIDE: Description -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p class="text-sm text-gray-700">{{ temple.description || 'No description available.' }}</p>
                </div>

                <!-- RIGHT SIDE: Rejection Information -->
                <div v-if="isRejected">
                  <h3 class="text-sm font-medium text-red-600 mb-2">Rejection Information</h3>

                  <div class="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <div>
                      <span class="text-sm font-semibold text-red-800">Reason:</span>
                      <p class="text-sm text-red-700 mt-1">
                        {{ rejectionReason || 'No reason provided.' }}
                      </p>
                    </div>

                    <div v-if="adminNotes && adminNotes !== rejectionReason">
                      <span class="text-sm font-semibold text-red-800">Admin Notes:</span>
                      <p class="text-sm text-red-700 mt-1">
                        {{ adminNotes }}
                      </p>
                    </div>

                    <div class="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span class="text-gray-700">
                        Rejected on: {{ rejectedDate || 'Date not available' }}
                      </span>
                    </div>
                  </div>
                  

                  <!-- Edit Button (Only for SuperAdmin and TempleAdmin) -->
                  <div v-if="canEditTemple" class="mt-4">
                    <button
                      @click="$router.push(`/tenant/entities/${temple.id}/edit`)"
                      class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Edit Temple to Resubmit
                    </button>
                  </div>
                </div>

                <!-- RIGHT SIDE: Approval Information -->
                <div v-if="isApproved">
                  <h3 class="text-sm font-medium text-green-600 mb-2">Approval Details</h3>
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center space-x-2 text-sm">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span class="font-medium text-green-800">Approved on:</span>
                      <span class="text-green-700">{{ approvedDate || 'Date not available' }}</span>
                    </div>
                    
                    <!-- Debug Info (Remove in production) -->
                    <div v-if="!approvedDate" class="mt-2 text-xs text-gray-500">
                      <details>
                        <summary class="cursor-pointer">Debug: Show available date fields</summary>
                        <pre class="mt-2 p-2 bg-white rounded text-xs overflow-auto">{{ availableDateFields }}</pre>
                      </details>
                    </div>
                  </div>
                </div>

                <!-- RIGHT SIDE: Pending Information -->
                <div v-if="isPending">
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-start">
                      <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div>
                        <h3 class="text-sm font-medium text-yellow-800">Pending Approval</h3>
                        <p class="text-sm text-yellow-700 mt-1">
                          Your temple submission is currently under review.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <!-- End Two Column -->

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3">
                <!-- Edit Button (Only for SuperAdmin and TempleAdmin, and not rejected) -->
                <button
                  v-if="!isRejected && canEditTemple"
                  @click="$router.push(`/tenant/entities/${temple.id}/edit`)"
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit Temple
                </button>

                <button
                  @click="$router.push('/tenant/dashboard')"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Back to Temples
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
          <svg
            class="h-20 w-20 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No Temple Found</h3>
          <p class="mt-1 text-gray-500">The temple you're looking for doesn't exist.</p>

          <button
            @click="$router.push('/tenant/entities')"
            class="mt-6 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Back to Temples
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTempleStore } from '@/stores/temple'
import { useAuthStore } from '@/stores/auth' // Import auth store for user role
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import TempleApprovalStatus from '@/components/temple/TempleApprovalStatus.vue'

const route = useRoute()
const router = useRouter()
const templeStore = useTempleStore()
const authStore = useAuthStore() // Add auth store

const loading = ref(true)
const error = ref(null)
const temple = ref(null)

// Role-based permission check
const canEditTemple = computed(() => {
  const userRole = authStore.user?.role || authStore.userRole || ''
  const normalizedRole = userRole.toString().toLowerCase()
  
  // Only SuperAdmin and TempleAdmin can edit
  // Block StandardUser and MonitoringUser
  return normalizedRole === 'superadmin' || normalizedRole === 'templeadmin'
})

// Media computed properties
const templeLogo = computed(() => {
  console.log('🔍 Checking temple.value:', temple.value)
  console.log('🔍 Checking temple.value.media:', temple.value?.media)
  
  if (!temple.value) return null
  
  // Priority 1: Check media object
  if (temple.value.media && temple.value.media.logo) {
    console.log('✅ Found logo in media:', temple.value.media.logo)
    return temple.value.media.logo
  }
  
  if (temple.value.media && temple.value.media.Logo) {
    console.log('✅ Found Logo in media:', temple.value.media.Logo)
    return temple.value.media.Logo
  }
  
  // Priority 2: Check direct fields
  if (temple.value.logo) {
    console.log('✅ Found logo field:', temple.value.logo)
    return temple.value.logo
  }
  
  if (temple.value.image) {
    console.log('✅ Found image field:', temple.value.image)
    return temple.value.image
  }
  
  if (temple.value.logoUrl) {
    console.log('✅ Found logoUrl field:', temple.value.logoUrl)
    return temple.value.logoUrl
  }
  
  if (temple.value.imageUrl) {
    console.log('✅ Found imageUrl field:', temple.value.imageUrl)
    return temple.value.imageUrl
  }
  
  console.log('❌ No logo found in any field')
  return null
})

const templeVideo = computed(() => {
  if (!temple.value) return null
  
  // Priority 1: Check media object
  if (temple.value.media && temple.value.media.video) {
    console.log('✅ Found video in media:', temple.value.media.video)
    return temple.value.media.video
  }
  
  if (temple.value.media && temple.value.media.Video) {
    console.log('✅ Found Video in media:', temple.value.media.Video)
    return temple.value.media.Video
  }
  
  // Priority 2: Check direct fields
  if (temple.value.video) {
    console.log('✅ Found video field:', temple.value.video)
    return temple.value.video
  }
  
  if (temple.value.videoUrl) {
    console.log('✅ Found videoUrl field:', temple.value.videoUrl)
    return temple.value.videoUrl
  }
  
  console.log('❌ No video found in any field')
  return null
})

// Function to get full media URL
const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  
  console.log('🖼️ Using proxied path:', path)
  return path // Vite will proxy /files to backend
}
// Error handlers for media
const handleImageError = (event) => {
  console.error('Failed to load image:', event.target.src)
  event.target.style.display = 'none'
}

const handleVideoError = (event) => {
  console.error('Failed to load video:', event.target.src)
  event.target.parentElement.innerHTML = '<p class="text-sm text-red-600">Failed to load video</p>'
}

// Breadcrumb navigation
const breadcrumbItems = computed(() => [
  { name: 'My Temples', to: '/tenant/entities' },
  { name: temple.value?.name || 'Temple Details', current: true },
])

// Helper function to safely get value from multiple possible field names
const safeGet = (obj, keys) => {
  if (!obj) return ''
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key]
    }
  }
  return ''
}

// Main Deity - check multiple possible field names
const mainDeity = computed(() => {
  return safeGet(temple.value, [
    'mainDeity',
    'maindeity',
    'main_deity',
    'MainDeity',
    'deity',
    'Deity'
  ]) || 'Not mentioned'
})

// Full Address - construct from individual fields if not provided as object
const fullAddress = computed(() => {
  if (!temple.value) return ''
  
  const parts = [
    safeGet(temple.value, ['streetaddress', 'streetAddress', 'street_address', 'street']),
    safeGet(temple.value, ['landmark', 'Landmark']),
    safeGet(temple.value, ['city', 'City']),
    safeGet(temple.value, ['district', 'District']),
    safeGet(temple.value, ['state', 'State']),
    safeGet(temple.value, ['pincode', 'Pincode'])
  ].filter(Boolean)
  
  return parts.join(', ') || 'N/A'
})

// Status checks
const isRejected = computed(() => {
  const status = (temple.value?.status || '').toString().toUpperCase()
  return status === 'REJECTED'
})

const isApproved = computed(() => {
  const status = (temple.value?.status || '').toString().toUpperCase()
  return status === 'APPROVED'
})

const isPending = computed(() => {
  const status = (temple.value?.status || '').toString().toUpperCase()
  return status === 'PENDING' || status === ''
})

// Rejection information - check multiple possible field names
const rejectionReason = computed(() => {
  return safeGet(temple.value, [
    'rejectionReason',
    'rejection_reason',
    'RejectionReason',
    'reject_reason',
    'rejected_reason',
    'reason',
    'notes'
  ]) || ''
})

const adminNotes = computed(() => {
  return safeGet(temple.value, [
    'adminNotes',
    'admin_notes',
    'AdminNotes',
    'notes',
    'Notes'
  ]) || ''
})

const rejectedDate = computed(() => {
  const date = safeGet(temple.value, [
    'rejectedAt',
    'rejected_at',
    'RejectedAt',
    'rejectionDate',
    'rejection_date'
  ])
  
  if (!date) return ''
  
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return date
  }
})

// Approval date - Enhanced with more field checks
const approvedDate = computed(() => {
  const date = safeGet(temple.value, [
    'approvedAt',
    'approved_at',
    'ApprovedAt',
    'approvalDate',
    'approval_date',
    'approved_date',
    'approvedDate',
    'updatedAt',
    'updated_at',
    'UpdatedAt',
    'modifiedAt',
    'modified_at',
    'ModifiedAt',
    'lastModified',
    'last_modified'
  ])
  
  if (!date) return ''
  
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return date
  }
})

// Debug info for available date fields
const availableDateFields = computed(() => {
  if (!temple.value) return {}
  
  const dateFields = {}
  const possibleDateKeys = [
    'approvedAt', 'approved_at', 'ApprovedAt',
    'approvalDate', 'approval_date', 'approved_date',
    'updatedAt', 'updated_at', 'UpdatedAt',
    'createdAt', 'created_at', 'CreatedAt',
    'modifiedAt', 'modified_at', 'ModifiedAt',
    'rejectedAt', 'rejected_at', 'RejectedAt',
    'timestamp', 'Timestamp'
  ]
  
  possibleDateKeys.forEach(key => {
    if (temple.value[key]) {
      dateFields[key] = temple.value[key]
    }
  })
  
  return dateFields
})

// Fetch Temple
const fetchTempleData = async () => {
  try {
    loading.value = true
    error.value = null

    const templeId = route.params.id
    const response = await templeStore.getTempleById(templeId)

    if (response) {
      // Handle both response.data and direct response
      temple.value = response.data || response
      console.log('✅ Fetched temple:', temple.value)
      console.log('📋 Full Response:', JSON.stringify(temple.value, null, 2))
      console.log('🎨 Media Object:', temple.value?.media)
      console.log('🖼️ Logo Path:', temple.value?.media?.logo)
      console.log('🎥 Video Path:', temple.value?.media?.video)
      console.log('📋 Status:', temple.value?.status)
      console.log('🖼️ Computed Logo:', templeLogo.value)
      console.log('🎥 Computed Video:', templeVideo.value)
      console.log('❌ Rejection Reason:', rejectionReason.value)
      console.log('📝 Admin Notes:', adminNotes.value)
      console.log('🔍 All Temple Fields:', Object.keys(temple.value))
      console.log('📅 Date Fields:', availableDateFields.value)
      console.log('✅ Approval Date:', approvedDate.value)
      console.log('👤 User Role:', authStore.user?.role)
      console.log('🔐 Can Edit:', canEditTemple.value)
    } else {
      error.value = 'Temple not found'
    }
  } catch (err) {
    console.error('❌ Error fetching temple:', err)
    error.value = err.message || 'Failed to load temple details'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTempleData()
})
</script>

<style scoped>
/* Optional: Add smooth transitions for media */
img, video {
  transition: opacity 0.3s ease-in-out;
}

img:hover {
  opacity: 0.9;
}

/* Optional: Add a subtle shadow effect on hover */
.shadow-md:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>