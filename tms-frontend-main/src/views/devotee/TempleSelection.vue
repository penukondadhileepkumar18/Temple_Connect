<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
    <!-- Header -->
    <div class="bg-indigo-600">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-3">Find Your Spiritual Home</h1>
          <p class="text-indigo-100 text-base md:text-lg font-light">
            Begin your spiritual journey by joining an approved temple.
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Section -->
      <div class="bg-white rounded-xl shadow-lg border border-indigo-100 p-5 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <label for="search" class="block text-sm font-semibold text-indigo-900 mb-2">
              Find Your Temple
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by temple name, city, or state..."
                class="block w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div>
              <label class="block text-sm font-semibold text-indigo-900 mb-2">State</label>
              <select
                v-model="selectedState"
                class="px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800 min-w-[140px]"
              >
                <option value="">All States</option>
                <option v-for="state in allStates" :key="state" :value="state">
                  {{ state }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-indigo-900 mb-2">Type</label>
              <select
                v-model="selectedCategory"
                class="px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800 min-w-[140px]"
              >
                <option value="">All Types</option>
                <option value="traditional">Traditional</option>
                <option value="modern">Modern</option>
                <option value="heritage">Heritage</option>
                <option value="community">Community</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
        <p class="text-indigo-600 font-medium mt-4">Discovering sacred spaces...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTemples.length === 0 && !loading" class="text-center py-12 bg-white rounded-xl shadow-lg">
        <div class="max-w-md mx-auto px-6">
          <svg class="h-12 w-12 text-indigo-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h3 class="text-xl font-bold text-indigo-900 mb-3">No Temples Found</h3>
          <p class="text-indigo-700 mb-6">
            We couldn't find any temples matching your criteria. Please try different search terms.
          </p>
          <button 
            @click="resetFilters" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Temple Results -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="temple in filteredTemples"
          :key="temple.id || temple.ID"
          class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden group relative"
        >
          <!-- Header Background with Tenant Logo -->
          <div
            class="h-32 relative cursor-pointer overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700"
            @dblclick="openTenantVideo(temple)"
          >
            <!-- Dark overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300"></div>

            <!-- Full Width Tenant Logo Background -->
            <div class="absolute inset-0 flex items-center justify-center z-10">
              <img
                v-if="getTenantMedia(temple).logo"
                :src="getTenantMedia(temple).logo"
                @error="handleImageError"
                class="w-full h-full object-cover opacity-45 group-hover:opacity-55 transition-opacity duration-300 brightness-125 contrast-125"
                alt="Organization Banner"
              />
              <div v-else class="w-full h-full bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50 animate-pulse"></div>
            </div>

            <!-- Video Indicators -->
            <div class="absolute bottom-3 right-3 z-30">
              <div class="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/30">
                <svg class="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span class="text-sm font-semibold text-indigo-900">Org Video</span>
              </div>
            </div>

            <div class="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs text-indigo-700 font-medium">
                <span>👆 Double tap</span>
                <span class="animate-pulse">▶️</span>
              </div>
            </div>
          </div>

          <!-- Temple Content with Temple Logo Background -->
          <div class="relative min-h-[200px]">
            <!-- TEMPLE LOGO Background - MAXIMUM VISIBILITY -->
            <div class="absolute inset-0 z-0 overflow-hidden">
              <img
                v-if="getTempleMedia(temple).logo"
                :src="getTempleMedia(temple).logo"
                @error="handleTempleLogoError($event, temple)"
                @load="(e) => console.log('Temple logo loaded successfully:', e.target.src)"
                class="w-full h-full object-cover opacity-90 brightness-140 saturate-125 contrast-115"
                alt="Temple Background"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-gray-50/20 via-white/10 to-gray-50/20"
              ></div>
            </div>

            <!-- Minimal overlay - maximum logo visibility -->
            <div class="absolute inset-0 z-5 bg-white/40"></div>

            <!-- Double Tap Content Area -->
            <div 
              class="relative z-10 p-5 h-full flex flex-col justify-between cursor-pointer transition-all hover:bg-white/85"
              @dblclick="openTempleVideo(temple)"
            >
              <!-- Temple Header -->
              <div>
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-bold text-gray-900 flex-1 line-clamp-1 bg-white/98 px-3 py-2 rounded-xl backdrop-blur-md shadow-md border border-white/40">
                    {{ temple.name || temple.Name }}
                  </h3>
                  <span 
                    :class="[
                      'px-3 py-1.5 rounded-full text-sm font-semibold ml-3 shadow-md whitespace-nowrap',
                      isTempleActive(temple) 
                        ? 'bg-green-100/95 text-green-800 border border-green-200' 
                        : 'bg-red-100/95 text-red-800 border border-red-200'
                    ]"
                  >
                    {{ isTempleActive(temple) ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <!-- Location & Type -->
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-800 bg-white/98 px-3 py-2 rounded-xl backdrop-blur-md shadow-md border border-white/40">
                    <svg class="h-4 w-4 mr-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{{ temple.city || temple.City || 'Unknown' }}, {{ temple.state || temple.State || 'Unknown' }}</span>
                  </div>
                  
                  <div v-if="temple.temple_type || temple.templeType || temple.TempleType" class="flex items-center text-sm text-gray-800 bg-white/98 px-3 py-2 rounded-xl backdrop-blur-md shadow-md border border-white/40">
                    <svg class="h-4 w-4 mr-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span class="font-medium">{{ temple.temple_type || temple.templeType || temple.TempleType }}</span>
                  </div>
                </div>

                <!-- Description -->
                <p v-if="temple.description || temple.Description" class="text-sm text-gray-800 mb-4 line-clamp-2 bg-white/98 px-3 py-2 rounded-xl backdrop-blur-md shadow-md border border-white/40">
                  {{ temple.description || temple.Description }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="mt-auto space-y-2">
                <div v-if="!isTempleActive(temple)" class="w-full bg-gray-100/90 text-gray-600 font-medium py-3 px-4 rounded-xl flex items-center justify-center cursor-not-allowed backdrop-blur-sm border border-gray-200 shadow-sm">
                  <svg class="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Temple Inactive
                </div>
                <button
                  v-else-if="isTempleJoined(temple.id || temple.ID)"
                  @click.stop="goToDashboard(temple)"
                  class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-green-200"
                >
                  <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Go to Dashboard
                </button>
                <button
                  v-else
                  @click.stop="selectTemple(temple)"
                  :disabled="joiningTemple === (temple.id || temple.ID)"
                  class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div v-if="joiningTemple === (temple.id || temple.ID)" class="flex items-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Joining...
                  </div>
                  <span v-else>Join Temple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <div
      v-if="showVideoModal"
      class="fixed inset-0 bg-black bg-opacity-98 flex items-center justify-center p-4 z-50 overflow-hidden"
      @click="closeVideoModal"
    >
      <div class="relative w-full h-full max-w-7xl mx-auto flex flex-col" @click.stop>
        <button
          @click="closeVideoModal"
          class="absolute top-6 right-6 z-50 text-white hover:text-gray-200 transition-all duration-300 flex items-center gap-2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-black/80 hover:scale-105"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="text-sm font-semibold">Close Video</span>
        </button>
        
        <div class="flex-1 w-full flex items-center justify-center relative">
          <video
            v-if="currentVideo"
            ref="videoPlayer"
            :src="currentVideo"
            controls
            autoplay
            playsinline
            class="w-full h-full max-w-6xl max-h-[85vh] object-contain rounded-3xl shadow-2xl"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click="closeModal"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6" @click.stop>
        <div class="text-center">
          <h3 class="text-xl font-bold text-indigo-900 mb-2">Join Temple?</h3>
          <p class="text-gray-600 mb-4">Would you like to join {{ selectedTemple?.name || selectedTemple?.Name }}?</p>
          <div class="flex gap-3 mt-6">
            <button @click="closeModal" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">Cancel</button>
            <button @click="confirmJoinTemple" :disabled="isJoining" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
              <span v-if="isJoining">Joining...</span>
              <span v-else>Join Temple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import api from '@/plugins/axios'
import templeService from '@/services/temple.service'

const router = useRouter()
const { showToast } = useToast()
const { user } = useAuth()
const authStore = useAuthStore()

// Reactive data
const searchQuery = ref('')
const selectedState = ref('')
const selectedCategory = ref('')
const loading = ref(true)
const joiningTemple = ref(null)
const showConfirmModal = ref(false)
const isJoining = ref(false)
const selectedTemple = ref(null)
const temples = ref([])
const joinedTemples = ref([])
const joinSuccess = ref(false)
const tenantsData = ref([])
const showVideoModal = ref(false)
const currentVideo = ref(null)
const videoType = ref('')
const videoPlayer = ref(null)

const allStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
]

// BASE URL HELPER
const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE_URL

const getFullMediaUrl = (path) => {
  return path;
}

// TEMPLE MEDIA - ENHANCED VERSION WITH EXTENSIVE LOGGING
const getTempleMedia = (temple) => {
  try {
    if (!temple) {
      console.log('❌ No temple provided to getTempleMedia')
      return { logo: null, video: null }
    }

    console.log(`🔍 Getting media for temple: ${temple.name || temple.Name}`)
    console.log('Temple object keys:', Object.keys(temple))

    // Try multiple possible media field names
    const rawMedia = temple.media || temple.Media || temple.entityMedia || temple.entity_media
    
    console.log('Raw media value:', rawMedia)
    console.log('Raw media type:', typeof rawMedia)
    
    if (!rawMedia) {
      console.log(`⚠️ No media field found for temple: ${temple.name || temple.Name}`)
      console.log('Checked fields: media, Media, entityMedia, entity_media')
      return { logo: null, video: null }
    }

    // Parse if string
    let media
    try {
      media = typeof rawMedia === 'string' ? JSON.parse(rawMedia) : rawMedia
      console.log('Parsed media object:', media)
    } catch (parseError) {
      console.error('❌ Error parsing media JSON:', parseError)
      return { logo: null, video: null }
    }

    // Try multiple logo field names
    const logo = media?.logo || media?.logo_url || media?.logoUrl || media?.Logo || media?.LogoUrl
    const video = media?.video || media?.video_url || media?.videoUrl || media?.intro_video_url || media?.Video

    console.log('Found logo path:', logo)
    console.log('Found video path:', video)

    const result = {
      logo: logo ? getFullMediaUrl(logo) : null,
      video: video ? getFullMediaUrl(video) : null
    }

    console.log(`✅ Temple media result for ${temple.name || temple.Name}:`, result)

    return result
  } catch (e) {
    console.error('❌ Temple media error:', e)
    console.error('Temple object:', temple)
    return { logo: null, video: null }
  }
}

// TENANT MEDIA
const getTenantMedia = (temple) => {
  try {
    if (!temple) return { logo: null, video: null }

    const tenantId = temple.tenantId || temple.tenant_id || temple.created_by || temple.createdBy

    if (!tenantId) {
      console.log(`No tenant ID found for temple: ${temple.name || temple.Name}`)
      return { logo: null, video: null }
    }

    const tenant = tenantsData.value.find(t => String(t.id) === String(tenantId))

    if (!tenant || !tenant.temple_details) {
      console.log(`No tenant data found for ID: ${tenantId}`)
      return { logo: null, video: null }
    }

    const result = {
      logo: tenant.temple_details.logo_url ? getFullMediaUrl(tenant.temple_details.logo_url) : null,
      video: tenant.temple_details.intro_video_url ? getFullMediaUrl(tenant.temple_details.intro_video_url) : null
    }

    console.log(`Tenant media for ${temple.name || temple.Name}:`, result)

    return result
  } catch (e) {
    console.error('❌ Tenant media error:', e)
    return { logo: null, video: null }
  }
}

// Error Handlers with detailed logging
const handleImageError = (event) => {
  console.error('❌ Tenant logo failed to load:', event.target.src)
  console.error('Error event:', event)
  event.target.style.display = 'none'
}

const handleTempleLogoError = (event, temple) => {
  console.error(`❌ TEMPLE LOGO FAILED TO LOAD`)
  console.error(`Temple name: ${temple.name || temple.Name}`)
  console.error(`Failed URL: ${event.target.src}`)
  console.error(`Temple ID: ${temple.id || temple.ID}`)
  console.error('Full temple object:', temple)
  console.error('Temple media field:', temple.media || temple.Media || temple.entityMedia || temple.entity_media)
  
  // Don't hide it, show a placeholder instead
  event.target.alt = 'Logo not available'
  event.target.style.opacity = '0.1'
}

// VIDEO HANDLERS
const openTenantVideo = (temple) => {
  const { video } = getTenantMedia(temple)
  if (video) {
    currentVideo.value = video
    videoType.value = 'tenant'
    showVideoModal.value = true
  } else {
    showToast('Organization video not available', 'info')
  }
}

const openTempleVideo = (temple) => {
  const { video } = getTempleMedia(temple)
  if (video) {
    currentVideo.value = video
    videoType.value = 'temple'
    showVideoModal.value = true
  } else {
    showToast('Temple video not available', 'info')
  }
}

const closeVideoModal = () => {
  showVideoModal.value = false
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.currentTime = 0
  }
  currentVideo.value = null
  videoType.value = ''
}

// TEMPLE ACTIVE CHECK
const isTempleActive = (temple) => {
  const isActive = temple.isactive ?? temple.is_active ?? temple.isActive ?? temple.active ?? temple.Active ?? true
  return isActive === true || isActive === 'true' || isActive === 1 || isActive === '1'
}

// Fetch user's memberships
const fetchUserMemberships = async () => {
  try {
    console.log('Fetching user memberships...')
    const response = await api.get('/memberships')
    let memberships = response.data || response
    
    if (!Array.isArray(memberships)) {
      if (memberships.data && Array.isArray(memberships.data)) {
        memberships = memberships.data
      } else if (memberships.memberships && Array.isArray(memberships.memberships)) {
        memberships = memberships.memberships
      } else {
        memberships = []
      }
    }
    
    const entityIds = memberships
      .map(m => m.entity_id || m.entityId || m.temple_id || m.templeId)
      .filter(id => id != null)
      .map(id => String(id))
    
    joinedTemples.value = entityIds
    saveJoinedTemples()
    console.log('User joined temple IDs:', entityIds)
    return entityIds
  } catch (error) {
    console.error('Error fetching memberships:', error)
    loadJoinedTemples()
    return joinedTemples.value
  }
}

// Fetch tenants data
const fetchTenantsData = async () => {
  try {
    console.log('Fetching tenants data...')
    const response = await api.get('/tenantsInfo?status=active')
    tenantsData.value = response.data?.data || []
    console.log('Tenants loaded:', tenantsData.value.length)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    tenantsData.value = []
  }
}

// LocalStorage helpers
const loadJoinedTemples = () => {
  try {
    const stored = localStorage.getItem('devoteeJoinedTemples')
    if (stored) {
      const parsed = JSON.parse(stored)
      joinedTemples.value = Array.isArray(parsed) ? parsed.map(id => String(id)) : []
    }
  } catch (error) {
    console.error('Error loading joined temples:', error)
    joinedTemples.value = []
  }
}

const saveJoinedTemples = () => {
  try {
    const normalized = joinedTemples.value.map(id => String(id))
    localStorage.setItem('devoteeJoinedTemples', JSON.stringify(normalized))
  } catch (error) {
    console.error('Error saving joined temples:', error)
  }
}

const isTempleJoined = (templeId) => {
  if (!templeId) return false
  return joinedTemples.value.includes(String(templeId))
}

// Navigation
const goToDashboard = (temple) => {
  try {
    const templeId = temple.id || temple.ID
    if (!templeId) {
      showToast('Temple information missing', 'error')
      return
    }
    if (!isTempleActive(temple)) {
      showToast('Temple is inactive', 'error')
      return
    }
    saveAllTempleIds(templeId, temple)
    window.location.href = `/entity/${templeId}/devotee/dashboard`
  } catch (error) {
    console.error('Navigation error:', error)
    showToast('Navigation error', 'error')
  }
}

// Computed
const filteredTemples = computed(() => {
  if (!temples.value) return []
  
  let filtered = temples.value.filter(temple => 
    temple.status === 'approved' || 
    temple.status === 'APPROVED' || 
    temple.Status === 'approved' ||
    temple.Status === 'APPROVED' ||
    !temple.status
  )
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple => {
      const name = (temple.name || temple.Name || '').toLowerCase()
      const city = (temple.city || temple.City || '').toLowerCase()
      const state = (temple.state || temple.State || '').toLowerCase()
      return name.includes(query) || city.includes(query) || state.includes(query)
    })
  }
  
  if (selectedState.value) {
    filtered = filtered.filter(temple => 
      (temple.state || temple.State) === selectedState.value
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(temple => 
      (temple.temple_type || temple.templeType || temple.TempleType) === selectedCategory.value
    )
  }
  
  return filtered
})

// Methods
const resetFilters = () => {
  searchQuery.value = ''
  selectedState.value = ''
  selectedCategory.value = ''
}

const selectTemple = (temple) => {
  if (!isTempleActive(temple)) {
    showToast('This temple is currently inactive', 'error')
    return
  }
  selectedTemple.value = temple
  showConfirmModal.value = true
  joinSuccess.value = false
}

const closeModal = () => {
  showConfirmModal.value = false
  joinSuccess.value = false
  selectedTemple.value = null
}

const confirmJoinTemple = async () => {
  if (!selectedTemple.value) return
  
  const templeId = selectedTemple.value.id || selectedTemple.value.ID
  isJoining.value = true
  joiningTemple.value = templeId
  
  try {
    console.log(`Joining temple: ${templeId}`)
    await api.post('/memberships', { entity_id: templeId })
    console.log('Successfully joined temple')
    
    const normalizedId = String(templeId)
    if (!joinedTemples.value.includes(normalizedId)) {
      joinedTemples.value.push(normalizedId)
      saveJoinedTemples()
    }
    
    saveAllTempleIds(templeId, selectedTemple.value)
    joinSuccess.value = true
    showToast('Successfully joined temple!', 'success')
    closeModal()
  } catch (error) {
    console.error('Error joining temple:', error)
    
    if (error.message.includes('Network Error') || error.response?.status === 404) {
      console.log('Using localStorage fallback')
      const normalizedId = String(templeId)
      if (!joinedTemples.value.includes(normalizedId)) {
        joinedTemples.value.push(normalizedId)
        saveJoinedTemples()
      }
      saveAllTempleIds(templeId, selectedTemple.value)
      joinSuccess.value = true
      showToast('Successfully joined temple!', 'success')
      closeModal()
    } else {
      showToast('Failed to join temple', 'error')
    }
  } finally {
    isJoining.value = false
    joiningTemple.value = null
  }
}

const saveAllTempleIds = (templeId, templeData = null) => {
  if (!templeId) return
  
  const temple = templeData || selectedTemple.value
  const templeName = temple?.name || temple?.Name || 'Selected Temple'
  const idString = String(templeId)
  
  console.log('Saving temple ID:', idString)
  
  localStorage.setItem('selectedEntityId', idString)
  localStorage.setItem('current_entity_id', idString)
  localStorage.setItem('current_tenant_id', idString)
  localStorage.setItem('selectedTempleName', templeName)
  
  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    userData.current_entity = { id: templeId, name: templeName }
    userData.entityId = templeId
    localStorage.setItem('user_data', JSON.stringify(userData))
  } catch (err) {
    console.error('Error updating user data:', err)
  }
}

const fetchTemples = async () => {
  loading.value = true
  
  try {
    console.log('Fetching temples...')
    const templeData = await templeService.getTemples()
    temples.value = templeData || []
    console.log(`Successfully loaded ${temples.value.length} temples`)
    
    // Log first temple's media structure for debugging
    if (temples.value.length > 0) {
      console.log('First temple media structure:', {
        name: temples.value[0].name || temples.value[0].Name,
        media: temples.value[0].media || temples.value[0].Media,
        entityMedia: temples.value[0].entityMedia || temples.value[0].entity_media
      })
    }
  } catch (error) {
    console.error('Error fetching temples:', error)
    showToast('Error loading temples', 'error')
    temples.value = []
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('Component mounted - Loading data...')
  await fetchUserMemberships()
  await fetchTenantsData()
  await fetchTemples()
  
  // Debug: Log media URLs for first temple
  if (temples.value.length > 0) {
    const firstTemple = temples.value[0]
    console.log('=== MEDIA DEBUG ===')
    console.log('Temple:', firstTemple.name || firstTemple.Name)
    console.log('Temple Media:', getTempleMedia(firstTemple))
    console.log('Tenant Media:', getTenantMedia(firstTemple))
    console.log('==================')
  }
})
</script>
