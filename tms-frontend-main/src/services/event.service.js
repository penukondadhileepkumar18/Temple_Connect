// src/services/event.service.js
import api from '@/plugins/axios'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { logout } = useAuth()
const { showToast } = useToast()

const eventService = {

  async getEvents() {
    try {
      const entityId = this.getCurrentEntityId()
      console.log(`Fetching events for entity ID: ${entityId}`)

      // Store entity ID in localStorage for future use
      if (entityId) {
        localStorage.setItem('current_entity_id', entityId)
      }

      const params = {
        ...(entityId ? { entity_id: entityId } : {})
      }

      const response = await api.get('/events', { params })
      console.log('Events API response:', response.data)
      return response.data || []
    } catch (error) {
      console.error('Error fetching events:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view events', 'error')
        logout()
      } else {
        showToast('Failed to load events', 'error')
      }
      throw this.handleError(error)
    }
  },

  async getUpcomingEvents() {
    try {
      const entityId = this.getCurrentEntityId()
      console.log(`Fetching upcoming events for entity ID: ${entityId}`)

      const params = {
        ...(entityId ? { entity_id: entityId } : {})
      }

      const response = await api.get('/events/upcoming', { params })
      console.log('Upcoming events API response:', response.data)
      return response.data || []
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view upcoming events', 'error')
        logout()
      } else {
        showToast('Failed to load upcoming events', 'error')
      }
      throw this.handleError(error)
    }
  },

  async getEventById(id) {
    try {
      const response = await api.get(`/events/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching event by ID:', error)
      throw this.handleError(error)
    }
  },

 async getEventStats() {
  try {
    const entityId = this.getCurrentEntityId()

    console.log("Fetching event stats for entity ID:", entityId)

    if (!entityId) {
      console.warn("No entity ID found for stats request")
      return {
        total_events: 0,
        upcoming_events: 0,
        this_month_events: 0,
        total_rsvps: 0
      }
    }

    const response = await api.get('/events/stats', {
      params: {
        entity_id: entityId
      }
    })

    console.log("Event stats API response:", response.data)

    return response.data || {
      total_events: 0,
      upcoming_events: 0,
      this_month_events: 0,
      total_rsvps: 0
    }

  } catch (error) {
    console.error("Error fetching event stats:", error)

    return {
      total_events: 0,
      upcoming_events: 0,
      this_month_events: 0,
      total_rsvps: 0
    }
  }
},
  async createEvent(eventData) {
    try {
      const entityId = this.getCurrentEntityId()

      if (!entityId) {
        throw new Error('No entity ID available for event creation')
      }

      const payload = {
        title: eventData.title,
        description: eventData.description || '',
        event_type: eventData.event_type || eventData.type || eventData.eventType,
        event_date: eventData.event_date || eventData.date,
        event_time: eventData.event_time || eventData.time,
        location: eventData.location || 'Temple Premises',
        is_active: eventData.isActive !== undefined ? eventData.isActive : true,
        entity_id: parseInt(entityId) // entity_id in body, same as donations
      }

      console.log('Creating event with payload:', payload)

      const response = await api.post('/events', payload)
      console.log('Event created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      if (error.response?.status === 401) {
        showToast('Please login to create an event', 'error')
        logout()
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Invalid event data'
        showToast(errorMsg, 'error')
      } else {
        showToast('Failed to create event', 'error')
      }
      throw this.handleError(error)
    }
  },

  async updateEvent(id, eventData) {
    try {
      const entityId = this.getCurrentEntityId()

      const payload = {
        title: eventData.title,
        description: eventData.description || '',
        event_type: eventData.event_type || eventData.type || eventData.eventType,
        event_date: eventData.event_date || eventData.date,
        event_time: eventData.event_time || eventData.time,
        location: eventData.location || 'Temple Premises',
        is_active: eventData.isActive !== undefined ? eventData.isActive : true,
        entity_id: parseInt(entityId) // entity_id in body, same as donations
      }

      console.log('Updating event with payload:', payload)

      const response = await api.put(`/events/${id}`, payload)
      console.log('Event updated successfully:', response.data)

      return {
        ...response.data,
        message: 'Event updated successfully',
        wasUpdate: true,
        id
      }
    } catch (error) {
      console.error('Error updating event:', error)
      if (error.response?.status === 401) {
        showToast('Please login to update an event', 'error')
        logout()
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Invalid event data'
        showToast(errorMsg, 'error')
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to update this event', 'error')
      } else {
        showToast('Failed to update event', 'error')
      }
      throw this.handleError(error)
    }
  },

  async deleteEvent(id, entityId) {
    try {
      const response = await api.delete(`/events/${id}`, {
        params: { entity_id: entityId }
      })
      console.log('Event deleted successfully')
      return {
        ...response.data,
        message: 'Event deleted successfully',
        id
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      if (error.response?.status === 401) {
        showToast('Please login to delete an event', 'error')
        logout()
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to delete this event', 'error')
      } else {
        showToast('Failed to delete event', 'error')
      }
      throw this.handleError(error)
    }
  },

  async registerForEvent(eventId) {
    try {
      const entityId = this.getCurrentEntityId()

      const payload = {
        ...(entityId ? { entity_id: parseInt(entityId) } : {})
      }

      const response = await api.post(`/events/${eventId}/rsvp`, payload)
      console.log('RSVP created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error registering for event:', error)
      if (error.response?.status === 401) {
        showToast('Please login to register for an event', 'error')
        logout()
      } else {
        showToast('Failed to register for event', 'error')
      }
      throw this.handleError(error)
    }
  },

  async cancelRegistration(eventId) {
    try {
      console.warn('CANCEL RSVP: No endpoint exists.')
      throw new Error('RSVP cancellation not supported by backend API')
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async getEventRSVPs(eventId) {
    try {
      const entityId = this.getCurrentEntityId()

      const params = {
        ...(entityId ? { entity_id: entityId } : {})
      }

      const response = await api.get(`/events/${eventId}/rsvps`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching event RSVPs:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to view RSVPs', 'error')
      } else {
        showToast('Failed to load RSVPs', 'error')
      }
      throw this.handleError(error)
    }
  },

  // ─── Helpers ────────────────────────────────────────────────────────────────

  // Same resolution priority as donation.service.js:
  // 1. URL path  →  2. localStorage  →  3. JWT token role fallback
  getCurrentEntityId() {
    // Priority 1: URL path
    const currentPath = window.location.pathname
    const entityMatch = currentPath.match(/\/entity\/(\d+)/)
    if (entityMatch) {
      console.log(`Entity ID from URL path: ${entityMatch[1]}`)
      return entityMatch[1]
    }

    // Priority 2: localStorage
    const storedEntityId = localStorage.getItem('current_entity_id')
    if (storedEntityId && storedEntityId !== 'null' && storedEntityId !== 'undefined') {
      console.log(`Entity ID from localStorage: ${storedEntityId}`)
      return storedEntityId
    }

    // Priority 3: JWT token role-based fallback
    const userInfo = this.getUserInfo()
    if (userInfo) {
      switch (userInfo.role) {
        case 'templeadmin':
          if (userInfo.entityId) {
            console.log(`TempleAdmin entity ID: ${userInfo.entityId}`)
            return userInfo.entityId.toString()
          }
          break
        case 'standarduser':
        case 'monitoringuser':
          if (userInfo.assignedTenantId) {
            console.log(`StandardUser/MonitoringUser assigned tenant ID: ${userInfo.assignedTenantId}`)
            return userInfo.assignedTenantId.toString()
          }
          break
      }
    }

    console.warn('Could not resolve entity ID')
    return null
  },

  getUserInfo() {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return {
          userId: payload.user_id,
          role: payload.role || payload.role_name,
          entityId: payload.entity_id,
          assignedTenantId: payload.assigned_tenant_id
        }
      }
    } catch (error) {
      console.warn('Error parsing user info from token:', error)
    }
    return null
  },

  handleError(error) {
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
}

export default eventService