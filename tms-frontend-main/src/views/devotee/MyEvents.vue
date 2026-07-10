<template>
  <div class="min-h-screen bg-gray-50">    
    <!-- Temple Header Bar -->
    <div class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">
                {{ currentTemple.name || 'Temple' }}
              </h1>
              <p class="text-sm text-gray-500" v-if="currentTemple.city || currentTemple.state">
                {{ currentTemple.city }}{{ currentTemple.city && currentTemple.state ? ', ' : '' }}{{ currentTemple.state }}
              </p>
            </div>
          </div>
          
          <!-- User Info -->
          <div class="flex items-center space-x-3">
            <div class="text-right hidden sm:block">
              <p class="text-gray-900 font-medium text-sm">{{ currentUser?.name || 'Devotee' }}</p>
              <p class="text-gray-500 text-xs">{{ currentUser?.email || '' }}</p>
            </div>
            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <WelcomeBanner 
      :user="currentUser"
      :userName="currentUser?.fullName || currentUser?.name || ''"
      :userRole="currentUser?.role || 'devotee'"
      title="My Temple Events"
      :subtitle="`Explore upcoming events and festivals at ${currentTemple?.name || 'the temple'}`"
    />

    <BaseCard class="p-6">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <!-- Search Events -->
          <div class="relative flex-1 min-w-0">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search events..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>              

          <!-- Filter by Status -->
          <select
            v-model="selectedFilter"
            class="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-200"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </BaseCard>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <BaseLoader />
    </div>
    
    <!-- Events Display - List View Only -->
    <div v-else-if="filteredEvents.length > 0" class="space-y-4">
      <BaseCard
        v-for="event in filteredEvents"
        :key="event.id"
        class="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
        @click="openEventModal(event)"
      >
        <div class="flex flex-col">
          <!-- Event Details -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row gap-4 justify-between">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ event.title }}</h3>
                <p class="text-gray-600 mb-3 line-clamp-2">{{ event.description }}</p>
                
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-1">
                    <Calendar class="h-4 w-4" />
                    {{ formatDate(event.date) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <Clock class="h-4 w-4" />
                    {{ formatTime(event.time) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <MapPin class="h-4 w-4" />
                    {{ event.venue || 'Temple Premises' }}
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex flex-col gap-2 items-start sm:items-end">
                <div class="flex items-center gap-2">
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <BaseCard class="p-8">
        <Calendar class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
        <p class="text-gray-600 mb-6">
          {{ getEmptyStateMessage() }}
        </p>
        <BaseButton
          variant="outline"
          @click="resetFilters"
        >
          View All Events
        </BaseButton>
      </BaseCard>
    </div>
        
    <!-- Event Details Modal -->
    <BaseModal
      v-if="selectedEvent"
      :show="showEventModal"
      @close="closeEventModal"
      size="lg"
    >
      <div class="p-6">
        <!-- Event Header -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedEvent.title }}</h2>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              <div class="flex items-center gap-1">
                <Calendar class="h-4 w-4" />
                {{ formatDate(selectedEvent.date) }}
              </div>
              <div class="flex items-center gap-1">
                <Clock class="h-4 w-4" />
                {{ formatTime(selectedEvent.time) }}
              </div>
              <div class="flex items-center gap-1">
                <MapPin class="h-4 w-4" />
                {{ selectedEvent.venue || 'Temple Premises' }}
              </div>
            </div>
          </div>
          <button
            @click="closeEventModal"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Event Description -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
          <p class="text-gray-700 leading-relaxed">{{ selectedEvent.description }}</p>
        </div>

        <!-- Attached Sevas -->
        <div v-if="selectedEvent.sevas && selectedEvent.sevas.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Available Sevas</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="seva in selectedEvent.sevas"
              :key="seva.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div class="font-medium text-gray-900">{{ seva.name }}</div>
                <div class="text-sm text-gray-600">₹{{ seva.amount }}</div>
              </div>
              <BaseButton size="sm" variant="outline">
                Book Now
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- RSVP Section -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-6 border-t border-gray-200">
          <div>
            <div class="text-sm text-gray-600 mb-1">RSVP Status</div>
            <span :class="getRSVPStatusClass(selectedEvent.id)">
              {{ getUserRSVP(selectedEvent.id) ? 'Attending' : 'Not Attending' }}
            </span>
          </div>
          
          <div class="flex gap-3">
            <BaseButton
              variant="outline"
              @click="closeEventModal"
            >
              Close
            </BaseButton>
            <BaseButton
              v-if="canRSVP(selectedEvent)"
              :variant="getUserRSVP(selectedEvent.id) ? 'danger' : 'primary'"
              @click="handleRSVP(selectedEvent.id, !getUserRSVP(selectedEvent.id))"
            >
              {{ getUserRSVP(selectedEvent.id) ? 'Cancel RSVP' : 'RSVP Now' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  X,
} from 'lucide-vue-next'
import eventService from '@/services/event.service'
import axios from 'axios'

// Base Components
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import BaseModal from '@/components/common/BaseModal.vue'

// Dashboard Components
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'

const route = useRoute()
const { currentUser: authUser } = useAuth()
const { showToast } = useToast()

// Reactive state
const loading = ref(true)
const searchQuery = ref('')
const selectedFilter = ref('all')
const viewMode = ref('list')
const showEventModal = ref(false)
const selectedEvent = ref(null)

// Temple and User data
const events = ref([])
const userRSVPs = ref(new Set())
const currentTemple = ref({
  name: '',
  city: '',
  state: ''
})
const currentUser = ref({
  name: '',
  email: ''
})

// Get current entity ID from route
const currentEntityId = computed(() => route.params.id)

// Get API base URL
const getApiBaseUrl = () => {
  return API_URL || 
         localStorage.getItem('api_base_url') || 
         'https://api.yourdomain.com'
}

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('access_token') || 
         localStorage.getItem('token') || 
         localStorage.getItem('authToken')
}

// Fetch temple information
const fetchTempleInfo = async () => {
  try {
    console.log('🏛️ Fetching temple information...')
    
    // FIRST: Try localStorage for immediate display
    const storedTempleName = localStorage.getItem('selectedTempleName')
    const storedTempleCity = localStorage.getItem('selectedTempleCity')
    const storedTempleState = localStorage.getItem('selectedTempleState')
    
    if (storedTempleName) {
      currentTemple.value = {
        name: storedTempleName,
        city: storedTempleCity || '',
        state: storedTempleState || ''
      }
      console.log('✅ Temple info from localStorage:', currentTemple.value)
    }
    
    // Get entity ID from multiple sources
    const entityId = currentEntityId.value ||
                     route.params.id ||
                     localStorage.getItem('selectedEntityId') || 
                     localStorage.getItem('current_entity_id') ||
                     localStorage.getItem('current_tenant_id')
    
    if (!entityId) {
      console.warn('⚠️ No entity ID found')
      if (!storedTempleName) {
        currentTemple.value.name = 'Temple'
      }
      return
    }
    
    console.log('🔍 Fetching temple details for entity ID:', entityId)
    
    // SECOND: Fetch from API to get complete/updated information
    try {
      const apiUrl = getApiBaseUrl()
      const token = getAuthToken()
      
      const response = await axios.get(`${apiUrl}/entities/${entityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📥 Temple API response:', response.data)
      
      const templeData = response.data?.data || response.data
      
      if (templeData) {
        currentTemple.value = {
          name: templeData.name || templeData.Name || storedTempleName || 'Temple',
          city: templeData.city || templeData.City || storedTempleCity || '',
          state: templeData.state || templeData.State || storedTempleState || ''
        }
        
        // Update localStorage with latest data
        if (currentTemple.value.name) {
          localStorage.setItem('selectedTempleName', currentTemple.value.name)
        }
        if (currentTemple.value.city) {
          localStorage.setItem('selectedTempleCity', currentTemple.value.city)
        }
        if (currentTemple.value.state) {
          localStorage.setItem('selectedTempleState', currentTemple.value.state)
        }
        
        console.log('✅ Temple info updated from API:', currentTemple.value)
      }
    } catch (apiError) {
      console.warn('⚠️ API fetch failed, using localStorage data:', apiError.message)
      // Keep the localStorage data that we already set
      if (!currentTemple.value.name) {
        currentTemple.value.name = storedTempleName || 'Temple'
      }
    }
  } catch (error) {
    console.error('❌ Error in fetchTempleInfo:', error)
    // Final fallback
    currentTemple.value.name = localStorage.getItem('selectedTempleName') || 'Temple'
  }
}

// Fetch user information
const fetchUserInfo = () => {
  try {
    console.log('👤 Fetching user information...')
    
    // Try authUser first
    if (authUser?.value) {
      currentUser.value = {
        name: authUser.value.name || authUser.value.full_name || 'Devotee',
        email: authUser.value.email || ''
      }
      console.log('✅ User info from auth:', currentUser.value)
      return
    }
    
    // Method 1: Try user_data object
    const userDataStr = localStorage.getItem('user_data')
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr)
        currentUser.value = {
          name: userData.name || userData.Name || userData.full_name || 'Devotee',
          email: userData.email || userData.Email || ''
        }
        console.log('✅ User info from user_data:', currentUser.value)
        return
      } catch (parseError) {
        console.warn('⚠️ Error parsing user_data:', parseError)
      }
    }
    
    // Method 2: Try individual localStorage items
    const userName = localStorage.getItem('user_name') || 
                     localStorage.getItem('userName') ||
                     localStorage.getItem('full_name')
    const userEmail = localStorage.getItem('user_email') || 
                      localStorage.getItem('userEmail') ||
                      localStorage.getItem('email')
    
    if (userName || userEmail) {
      currentUser.value = {
        name: userName || 'Devotee',
        email: userEmail || ''
      }
      console.log('✅ User info from localStorage items:', currentUser.value)
      return
    }
    
    // Method 3: Try profile data
    const profileData = localStorage.getItem('devotee_profile')
    if (profileData) {
      try {
        const profile = JSON.parse(profileData)
        currentUser.value = {
          name: profile.full_name || profile.name || 'Devotee',
          email: profile.email || ''
        }
        console.log('✅ User info from profile:', currentUser.value)
        return
      } catch (parseError) {
        console.warn('⚠️ Error parsing profile data:', parseError)
      }
    }
    
    // Fallback
    console.log('⚠️ No user info found, using defaults')
    currentUser.value = {
      name: 'Devotee',
      email: ''
    }
  } catch (error) {
    console.error('❌ Error fetching user info:', error)
    currentUser.value = {
      name: 'Devotee',
      email: ''
    }
  }
}

// Computed properties
const filteredEvents = computed(() => {
  let filtered = events.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    )
  }

  // Filter by status
  switch (selectedFilter.value) {
    case 'upcoming':
      filtered = filtered.filter(event => event.status === 'upcoming')
      break
    case 'ongoing':
      filtered = filtered.filter(event => event.status === 'ongoing')
      break
    case 'completed':
      filtered = filtered.filter(event => event.status === 'completed')
      break
    case 'attending':
      filtered = filtered.filter(event => userRSVPs.value.has(event.id))
      break
    case 'all':
    default:
      filtered = filtered.filter(e => e.status)
      break
  }

  return filtered
})

// Methods
const loadEvents = async () => {
  try {
    loading.value = true
    
    const data = await eventService.getUpcomingEvents()
    console.log("🔍 Events Response:", data)
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    events.value = (Array.isArray(data) ? data : []).map(event => {
      const eventDate = new Date(event.event_date)
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      
      let status = 'upcoming'
      
      if (!isNaN(eventDate)) {
        if (eventDateOnly < today) {
          status = 'completed'
        } else if (eventDateOnly.getTime() === today.getTime()) {
          if (event.event_time) {
            try {
              const eventTimeDate = new Date(event.event_time)
              const eventHours = eventTimeDate.getUTCHours()
              const eventMinutes = eventTimeDate.getUTCMinutes()
              
              const currentHours = now.getHours()
              const currentMinutes = now.getMinutes()
              
              if (currentHours > eventHours || 
                  (currentHours === eventHours && currentMinutes >= eventMinutes)) {
                status = 'ongoing'
              } else {
                status = 'upcoming'
              }
            } catch (e) {
              status = 'ongoing'
            }
          } else {
            status = 'ongoing'
          }
        } else {
          status = 'upcoming'
        }
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.event_date,
        time: event.event_time || null,
        venue: event.location || 'Temple Premises',
        status,
        attendees: event.rsvp_count || 0,
        eventType: event.event_type,
        maxAttendees: 200
      }
    })
    
    console.log('✅ Mapped Events:', events.value)

  } catch (error) {
    console.error('❌ Error fetching events:', error)
    showToast('Failed to load events', 'error')
  } finally {
    loading.value = false
  }
}

const handleRSVP = async (eventId, isRSVP) => {
  try {
    if (isRSVP) {
      if (typeof eventService.registerForEvent === 'function') {
        await eventService.registerForEvent(eventId)
        userRSVPs.value.add(eventId)
        showToast('RSVP confirmed successfully!', 'success')
      } else {
        showToast('RSVP functionality not available', 'error')
      }
    } else {
      showToast('RSVP cancellation is not supported yet', 'error')
      return
    }
  } catch (error) {
    console.error('Error updating RSVP:', error)
    showToast('Failed to update RSVP', 'error')
  }
}

const openEventModal = (event) => {
  selectedEvent.value = event
  showEventModal.value = true
}

const closeEventModal = () => {
  showEventModal.value = false
  selectedEvent.value = null
}

const getUserRSVP = (eventId) => {
  return userRSVPs.value.has(eventId)
}

const canRSVP = (event) => {
  return event.status === 'upcoming' && 
         (!event.maxAttendees || event.attendees < event.maxAttendees)
}

const getEventStatus = (event) => {
  if (event.status === 'completed') return 'Completed'
  if (event.status === 'ongoing') return 'Ongoing'
  if (event.maxAttendees && event.attendees >= event.maxAttendees) return 'Full'
  return 'Open'
}

const getEventStatusClass = (event) => {
  const status = getEventStatus(event)
  const baseClasses = 'px-2 py-1 rounded-lg text-xs font-medium'
  
  switch (status) {
    case 'Completed':
      return `${baseClasses} bg-gray-100 text-gray-800`
    case 'Ongoing':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'Full':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-green-100 text-green-800`
  }
}

const getRSVPStatusClass = (eventId) => {
  const baseClasses = 'px-3 py-1 rounded-lg text-sm font-medium'
  return getUserRSVP(eventId)
    ? `${baseClasses} bg-green-100 text-green-800`
    : `${baseClasses} bg-gray-100 text-gray-800`
}

const formatDate = (dateString) => {
  if (!dateString) return 'No date available'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  
  return date.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTime = (timeString) => {
  if (!timeString) return 'Time not specified'
  
  try {
    if (typeof timeString === 'string' && timeString.includes('T')) {
      const date = new Date(timeString)
      if (!isNaN(date.getTime())) {
        let hours = date.getUTCHours()
        const minutes = date.getUTCMinutes()
        
        const period = hours >= 12 ? 'PM' : 'AM'
        hours = hours % 12 || 12
        
        return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
      }
    }
    
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const timeParts = timeString.split(':')
      if (timeParts.length >= 2) {
        let hours = parseInt(timeParts[0], 10)
        const minutes = parseInt(timeParts[1], 10)
        
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          const period = hours >= 12 ? 'PM' : 'AM'
          hours = hours % 12 || 12
          
          return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
        }
      }
    }
  } catch (error) {
    console.error('Error formatting time:', error, timeString)
  }
  
  return timeString
}

const getEmptyStateMessage = () => {
  switch (selectedFilter.value) {
    case 'upcoming':
      return 'No upcoming events found. Check back later for new events.'
    case 'ongoing':
      return 'No events are currently ongoing.'
    case 'attending':
      return 'You haven\'t RSVP\'d to any events yet. Browse upcoming events to participate.'
    case 'completed':
      return 'No completed events to display.'
    default:
      return 'No events match your search criteria.'
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedFilter.value = 'all'
}

// Lifecycle
onMounted(async () => {
  console.log("🚀 Devotee Events page mounted")
  
  // Load user and temple info first
  fetchUserInfo()
  await fetchTempleInfo()
  
  // Then load events
  await loadEvents()
  
  console.log("✅ Page initialization complete", {
    temple: currentTemple.value,
    user: currentUser.value,
    eventsCount: events.value.length
  })
})

onUnmounted(() => {  
  console.log("👋 Devotee Events page unmounted")
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
</style>