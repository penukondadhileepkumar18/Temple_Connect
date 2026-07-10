// src/composables/useTempleActivities.js
import { ref, reactive } from 'vue'
import axios from 'axios'

const API_URL = '/api/v1'

export function useTempleActivities() {
  // State
  const loading = ref(false)
  const error = ref(null)
  
  const activities = reactive({
    events: [],
    sevas: [],
    donations: [],
    announcements: []
  })

  // Computed stats
  const stats = reactive({
    totalEvents: 0,
    upcomingEvents: 0,
    totalSevas: 0,
    upcomingSevas: 0,
    totalDonations: 0,
    recentDonations: 0
  })

  // Create auth header
  const createAuthHeader = () => {
    const token = localStorage.getItem('auth_token')
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  }

  // Handle API errors consistently
  const handleError = (error) => {
    console.error('API Error:', error)
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    } else if (error.response?.data?.error) {
      return new Error(error.response.data.error)
    } else if (error.message) {
      return new Error(error.message)
    } else {
      return new Error('An unexpected error occurred')
    }
  }

  /**
   * Fetch all activities for a temple entity
   */
  const fetchAllActivities = async (entityId) => {
    if (!entityId) {
      console.error('Entity ID is required')
      return
    }

    loading.value = true
    error.value = null

    try {
      // Make parallel requests for efficiency
      const [eventsRes, sevasRes] = await Promise.all([
        fetchEvents(entityId),
        fetchSevas(entityId)
      ])

      // Update stats
      updateStats()
      
      return {
        events: activities.events,
        sevas: activities.sevas
      }
    } catch (err) {
      error.value = handleError(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch events for a temple
   */
  const fetchEvents = async (entityId) => {
    try {
      // The events endpoint gets entity ID from user context
      // But we'll set a localStorage value to help backend associate the user with the correct entity
      localStorage.setItem('current_entity_id', entityId)
      
      // Fetch all events
      //const response = await axios.get(`${API_URL}/events`, createAuthHeader())
      const response = await axios.get(`/events`, createAuthHeader())
      activities.events = response.data
      
      // Update event stats
      stats.totalEvents = activities.events.length
      stats.upcomingEvents = activities.events.filter(
        event => new Date(event.event_date) >= new Date()
      ).length
      
      return activities.events
    } catch (err) {
      console.error('Error fetching events:', err)
      // Don't throw here to allow other requests to continue
      return []
    }
  }

  /**
 * Fetch upcoming events for a temple
 */
const fetchUpcomingEvents = async (entityId) => {
  try {
    // Set current entity ID to help backend
    localStorage.setItem('current_entity_id', entityId)
    
    // Ensure we're using the correct entity ID in the request
    console.log(`Fetching upcoming events for entity ID: ${entityId}`)
    
    // Get the tenant ID from localStorage if available
    const tenantId = localStorage.getItem('current_tenant_id') || entityId
    console.log(`Using tenant ID: ${tenantId}`)
    
    // Set headers for this specific request
    const headers = createAuthHeader()

    
    // Make the API call with proper headers
    //const response = await axios.get(`${API_URL}/events/upcoming`, headers)
    const response = await axios.get(`/events/upcoming`, headers)
    
    // Store in activities and return
    if (Array.isArray(response.data)) {
      activities.upcomingEvents = response.data
      return activities.upcomingEvents
    } else {
      console.warn('Unexpected response format from events/upcoming:', response.data)
      return []
    }
  } catch (err) {
    console.error('Error fetching upcoming events:', err)
    return []
  }
}

  /**
   * Fetch sevas for a temple
   */
  const fetchSevas = async (entityId) => {
    try {
      // The sevas endpoint requires entity_id as query param
      //const response = await axios.get(`${API_URL}/sevas?entity_id=${entityId}`, createAuthHeader())
      const response = await axios.get(`/sevas?entity_id=${entityId}`, createAuthHeader())
      activities.sevas = response.data
      
      // Update seva stats
      stats.totalSevas = activities.sevas.length
      stats.upcomingSevas = activities.sevas.filter(
        seva => seva.active === true
      ).length
      
      return activities.sevas
    } catch (err) {
      console.error('Error fetching sevas:', err)
      return []
    }
  }

  /**
   * Fetch user's seva bookings
   */
  const fetchMySevaBookings = async () => {
    try {
      //const response = await axios.get(`${API_URL}/sevas/my-bookings1`, createAuthHeader())
      const response = await axios.get(`/sevas/my-bookings`, createAuthHeader())
      activities.myBookings = response.data
      return activities.myBookings
    } catch (err) {
      console.error('Error fetching seva bookings:', err)
      return []
    }
  }

  /**
   * Update activity stats
   */
  const updateStats = () => {
    // Events
    stats.totalEvents = activities.events.length
    stats.upcomingEvents = activities.events.filter(
      event => new Date(event.event_date) >= new Date()
    ).length

    // Sevas
    stats.totalSevas = activities.sevas.length
    stats.upcomingSevas = activities.sevas.filter(
      seva => seva.active === true
    ).length
  }

  /**
   * Get entity details
   */
  /**
 * Get entity details with proper error handling and fallback
 */
const fetchEntityDetails = async (entityId) => {
  console.log('🎯 NEW FUNCTION: Fetching entity details for:', entityId)
  
  try {
    // Get the dashboard response which we know returns 200
    const dashResponse = await axios.get(`/entity/${entityId}/devotee/dashboard`)
    
    console.log('🎯 Dashboard response received!')
    console.log('🎯 Full response data:', dashResponse.data)
    console.log('🎯 Response keys:', Object.keys(dashResponse.data))
    
    // Try to find entity/temple data
    let entityData = null
    
    if (dashResponse.data.entityDetails) {
      entityData = dashResponse.data.entityDetails
      console.log('✅ Found in: entityDetails')
    } else if (dashResponse.data.entity) {
      entityData = dashResponse.data.entity
      console.log('✅ Found in: entity')
    } else if (dashResponse.data.temple) {
      entityData = dashResponse.data.temple
      console.log('✅ Found in: temple')
    } else {
      console.warn('⚠️ No entity data in dashboard response')
    }
    
    if (entityData) {
      console.log('🎯 Entity data found:', entityData)
      console.log('🎯 Media field:', entityData.media || entityData.Media || 'NONE')
      entityDetails.value = entityData
      return entityData
    }
    
    return null
  } catch (err) {
    console.error('❌ Error in fetchEntityDetailsNew:', err)
    return null
  }
};

  /**
   * Get user profile and memberships
   */
  const fetchUserProfile = async () => {
    try {
      // First get user ID from auth context
      //const authResponse = await axios.get(`${API_URL}/auth/me`, createAuthHeader())
      const authResponse = await axios.get(`/auth/me`, createAuthHeader())
      const userId = authResponse.data.id
      
      // Then get profile
      //const profileResponse = await axios.get(`${API_URL}/profiles/${userId}`, createAuthHeader())
      const profileResponse = await axios.get(`/profiles/${userId}`, createAuthHeader())
      
      // Get memberships
      //const membershipResponse = await axios.get(`${API_URL}/memberships`, createAuthHeader())
      const membershipResponse = await axios.get(`/memberships`, createAuthHeader())
      
      return {
        profile: profileResponse.data,
        memberships: membershipResponse.data
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      throw handleError(err)
    }
  }

  return {
    // State
    loading,
    error,
    activities,
    stats,
    
    // Methods
    fetchAllActivities,
    fetchEvents,
    fetchUpcomingEvents,
    fetchSevas,
    fetchMySevaBookings,
    fetchEntityDetails,
    fetchUserProfile
  }
}