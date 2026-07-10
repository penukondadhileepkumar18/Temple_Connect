// src/services/seva.service.js
import api from '@/plugins/axios'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { logout } = useAuth()
const { showToast } = useToast()

class SevaService {

  /**
   * Get all sevas for the current entity (temple admin) - matches /entity-sevas route
   */
  async getSevas(params = {}) {
    try {
      const entityId = params.entity_id || this.getCurrentEntityId()
      console.log(`Fetching sevas for entity ID: ${entityId}`)

      if (entityId) {
        localStorage.setItem('current_entity_id', entityId)
      }

      const queryParams = {
        ...params,
        ...(entityId ? { entity_id: entityId } : {})
      }

      const response = await api.get('/sevas/entity-sevas', { params: queryParams })
      console.log('Seva response:', response.data)

      const sevas = (response.data?.sevas || []).map(seva => ({
        ...seva,
        available_slots: seva.available_slots || seva.AvailableSlots || 0,
        booked_slots: seva.booked_slots || seva.BookedSlots || 0,
        remaining_slots: seva.remaining_slots || seva.RemainingSlots || 0
      }))

      return {
        success: true,
        data: sevas,
        total: response.data?.total || 0,
        pagination: response.data?.pagination || {}
      }
    } catch (error) {
      console.error('Error fetching sevas:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view sevas', 'error')
        logout()
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to view sevas', 'error')
      } else {
        showToast('Failed to fetch sevas', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sevas',
        data: []
      }
    }
  }

  /**
   * Get all sevas for devotees - matches / route
   */
  async getDevoteeSevas(params = {}) {
    try {
      const entityId = params.entity_id || this.getCurrentEntityId()
      console.log(`Fetching devotee sevas for entity ID: ${entityId}`)

      const queryParams = {
        ...params,
        ...(entityId ? { entity_id: entityId } : {})
      }

      const response = await api.get('/sevas', { params: queryParams })
      console.log('Devotee seva response:', response.data)

      const sevas = (response.data?.sevas || []).map(seva => ({
        ...seva,
        available_slots: seva.available_slots || seva.AvailableSlots || 0,
        booked_slots: seva.booked_slots || seva.BookedSlots || 0,
        remaining_slots: seva.remaining_slots || seva.RemainingSlots || 0
      }))

      return {
        success: true,
        data: sevas,
        pagination: response.data?.pagination || {}
      }
    } catch (error) {
      console.error('Error fetching devotee sevas:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view sevas', 'error')
        logout()
      } else {
        showToast('Failed to fetch sevas', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sevas',
        data: []
      }
    }
  }

  /**
   * Get seva by ID - matches /:id route
   */
  async getSevaById(sevaId) {
    try {
      const response = await api.get(`/sevas/${sevaId}`)

      const seva = response.data || null
      if (seva) {
        seva.available_slots = seva.available_slots || seva.AvailableSlots || 0
        seva.booked_slots = seva.booked_slots || seva.BookedSlots || 0
        seva.remaining_slots = seva.remaining_slots || seva.RemainingSlots || 0
      }

      return {
        success: true,
        data: seva
      }
    } catch (error) {
      console.error('Error fetching seva:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch seva details',
        data: null
      }
    }
  }

  /**
   * Get booking counts - matches /booking-counts route
   */
  async getBookingCounts() {
    try {
      const entityId = this.getCurrentEntityId()
      console.log(`Fetching booking counts for entity ID: ${entityId}`)

      const params = {
        ...(entityId ? { entity_id: entityId } : {})
      }

      const response = await api.get('/sevas/booking-counts', { params })
      console.log('Booking counts response:', response.data)

      return {
        success: true,
        data: response.data || {}
      }
    } catch (error) {
      console.error('Error fetching booking counts:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking counts',
        data: { total: 0, approved: 0, pending: 0, rejected: 0 }
      }
    }
  }

  /**
   * Create a new seva - matches POST /sevas route
   *
   * FIX: entity_id MUST be explicitly provided by the caller (component sets this
   * from route.params.id). We NEVER fall back to JWT/localStorage because the JWT
   * entity_id may be 0 or belong to a different entity than the page being viewed.
   */
  async createSeva(sevaData) {
    try {
      // ALWAYS use entity_id from sevaData — caller (component) is responsible for passing it
      // from route.params.id. Never fall back to JWT which may have entity_id = 0.
      const entityId = sevaData.entity_id ? parseInt(sevaData.entity_id) : null

      if (!entityId || entityId === 0) {
        throw new Error(`Invalid entity ID for seva creation: ${entityId}. Ensure entity_id is passed from the route.`)
      }

      console.log(`Creating seva with entity ID from route: ${entityId}`)

      const payload = {
        name: sevaData.name,
        seva_type: sevaData.seva_type || sevaData.sevaType,
        description: sevaData.description || '',
        price: sevaData.price || 0,
        date: sevaData.date || sevaData.seva_date,
        start_time: sevaData.start_time || sevaData.startTime,
        end_time: sevaData.end_time || sevaData.endTime,
        duration: sevaData.duration || 30,
        available_slots:
          sevaData.available_slots ||
          sevaData.availableSlots ||
          sevaData.max_bookings_per_day ||
          sevaData.maxBookingsPerDay ||
          10,
        entity_id: entityId  // always from sevaData (route.params.id), never from JWT
      }

      console.log('Creating seva with payload:', payload)

      const response = await api.post('/sevas', payload)
      console.log('Seva created successfully:', response.data)

      return {
        success: true,
        data: response.data,
        message: 'Seva created successfully'
      }
    } catch (error) {
      console.error('Error creating seva:', error)
      if (error.response?.status === 401) {
        showToast('Please login to create a seva', 'error')
        logout()
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Invalid seva data'
        showToast(errorMsg, 'error')
      } else {
        showToast('Failed to create seva', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Update seva - matches PUT /:id route
   *
   * FIX: Trust entity_id from sevaData (set from the seva's own record in the component).
   * This ensures we send the correct entity_id of the seva being updated,
   * not the templeadmin's own user entity_id from JWT.
   */
  async updateSeva(sevaId, sevaData) {
    try {
      // Trust entity_id from sevaData — component sets this from the seva's own record
      const entityId = sevaData.entity_id
        ? parseInt(sevaData.entity_id)
        : parseInt(this.getWriteEntityId())

      console.log(`Updating seva ID: ${sevaId} with resolved entity ID: ${entityId}`)

      const payload = {
        name: sevaData.name,
        seva_type: sevaData.seva_type || sevaData.sevaType,
        description: sevaData.description || '',
        price: sevaData.price || 0,
        date: sevaData.date || sevaData.seva_date,
        start_time: sevaData.start_time || sevaData.startTime,
        end_time: sevaData.end_time || sevaData.endTime,
        duration: sevaData.duration || 30,
        available_slots:
          sevaData.available_slots ||
          sevaData.availableSlots ||
          sevaData.max_bookings_per_day ||
          sevaData.maxBookingsPerDay,
        status: sevaData.status,
        entity_id: entityId  // from seva's own record, not JWT
      }

      console.log('Updating seva with payload:', payload)

      const response = await api.put(`/sevas/${sevaId}`, payload)

      return {
        success: true,
        data: response.data,
        message: 'Seva updated successfully',
        wasUpdate: true,
        id: sevaId
      }
    } catch (error) {
      console.error('Error updating seva:', error)
      if (error.response?.status === 401) {
        showToast('Please login to update a seva', 'error')
        logout()
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to update this seva', 'error')
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Invalid seva data'
        showToast(errorMsg, 'error')
      } else {
        showToast('Failed to update seva', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Delete seva - HARD DELETE - matches DELETE /:id route
   */
  async deleteSeva(sevaId, entityId = null) {
    try {
      console.log('Permanently deleting seva with ID:', sevaId, '| entity_id:', entityId)

      const params = { force: true, permanent: true }
      if (entityId) {
        params.entity_id = parseInt(entityId)
      }

      const response = await api.delete(`/sevas/${sevaId}`, { params })

      console.log('Delete response:', response.data)

      return {
        success: true,
        message: 'Seva permanently deleted successfully',
        id: sevaId
      }
    } catch (error) {
      console.error('Error deleting seva:', error)

      if (error.response?.status === 401) {
        showToast('Please login to delete a seva', 'error')
        logout()
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Seva not found or already deleted'
        }
      } else if (error.response?.status === 409) {
        return {
          success: false,
          error: 'Cannot delete seva - it has existing bookings. Please contact administrator.'
        }
      } else {
        showToast('Failed to delete seva', 'error')
      }

      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to permanently delete seva'
      }
    }
  }

  /**
   * Book a seva - matches POST /bookings route (devotee only)
   */
  async bookSeva(sevaId) {
    try {
      const entityId = this.getWriteEntityId()

      const payload = {
        seva_id: sevaId,
        ...(entityId ? { entity_id: parseInt(entityId) } : {})
      }

      console.log(`Booking seva ${sevaId} for entity ${entityId}`)
      const response = await api.post('/sevas/bookings', payload)

      return {
        success: true,
        data: response.data,
        message: 'Seva booking request submitted successfully'
      }
    } catch (error) {
      console.error('Error booking seva:', error.response?.data || error)
      if (error.response?.status === 401) {
        showToast('Please login to book a seva', 'error')
        logout()
      } else {
        showToast('Failed to book seva', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to book seva'
      }
    }
  }
  /**
 * Create a free seva booking (no payment) — goes to admin approval queue
 * matches POST /sevas/bookings route
 */
async createSevaBooking(bookingData) {
  try {
    const entityId = parseInt(bookingData.entity_id || bookingData.entityId || this.getWriteEntityId())

    const payload = {
      seva_id: parseInt(bookingData.seva_id),
      entity_id: entityId,
      temple_id: parseInt(bookingData.temple_id || bookingData.templeId || entityId),
      seva_name: bookingData.seva_name,
      seva_type: bookingData.seva_type
    }

    console.log('Creating free seva booking payload:', payload)

    const response = await api.post('/sevas/bookings', payload)
    console.log('Free seva booking response:', response.data)

    return {
      success: true,
      data: response.data,
      message: 'Seva booking request submitted for approval'
    }
  } catch (error) {
    console.error('Error creating free seva booking:', error)
    if (error.response?.status === 401) {
      showToast('Please login to book a seva', 'error')
      logout()
    } else if (error.response?.status === 400) {
      const errorMsg = error.response.data?.error || 'Invalid booking data'
      showToast(errorMsg, 'error')
    } else {
      showToast('Failed to submit seva booking', 'error')
    }
    throw error
  }
}

  /**
   * Create a seva booking with Razorpay payment order
   */
  async createSevaBookingWithPayment(bookingData) {
    try {
      const entityId = this.getWriteEntityId()
      console.log('Creating seva booking with payment:', bookingData)

      const payload = {
        seva_id: parseInt(bookingData.seva_id),
        amount: Number(bookingData.amount),
        entity_id: parseInt(bookingData.entity_id || bookingData.entityId || entityId),
        temple_id: parseInt(bookingData.temple_id || bookingData.templeId || entityId),
        seva_name: bookingData.seva_name,
        seva_type: bookingData.seva_type
      }

      console.log('Payment payload:', payload)

      const response = await api.post('/sevas/book-with-payment', payload)
      console.log('Seva booking payment response:', response.data)

      return response.data
    } catch (error) {
      console.error('Error creating seva booking with payment:', error)
      if (error.response?.status === 401) {
        showToast('Please login to make a payment', 'error')
        logout()
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Invalid payment data'
        showToast(errorMsg, 'error')
      } else {
        showToast('Failed to initiate payment', 'error')
      }
      throw error
    }
  }

  /**
   * Verify seva payment after Razorpay success
   */
  async verifySevaPayment(paymentData) {
    try {
      console.log('Verifying seva payment:', paymentData)

      const payload = {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
        seva_id: paymentData.seva_id
      }

      const response = await api.post('/sevas/verify-payment', payload)
      console.log('Seva payment verification response:', response.data)

      return response.data
    } catch (error) {
      console.error('Error verifying seva payment:', error)
      if (error.response?.status === 400) {
        showToast('Payment verification failed', 'error')
      } else {
        showToast('Failed to verify payment', 'error')
      }
      throw error
    }
  }

  /**
   * Get user's seva bookings - matches GET /my-bookings route (devotee only)
   */
  async getMyBookings(entityId = null) {
    try {
      const resolvedEntityId = entityId || this.getCurrentEntityId()
      console.log(`Fetching my bookings for entity ${resolvedEntityId}`)

      const params = {
        ...(resolvedEntityId ? { entity_id: resolvedEntityId } : {})
      }

      const response = await api.get('/sevas/my-bookings', { params })

      let bookings = response.data?.bookings || []

      if (resolvedEntityId) {
        bookings = bookings.filter(booking => {
          const bookingEntityId = booking.entity_id || booking.EntityID || booking.entityId
          return bookingEntityId && parseInt(bookingEntityId) === parseInt(resolvedEntityId)
        })
        console.log(`Filtered ${bookings.length} bookings for entity ${resolvedEntityId}`)
      }

      return {
        success: true,
        data: bookings
      }
    } catch (error) {
      console.error('Error fetching my bookings:', error.response?.data || error)
      if (error.response?.status === 401) {
        showToast('Please login to view your bookings', 'error')
        logout()
      } else {
        showToast('Failed to fetch booking history', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking history',
        data: []
      }
    }
  }

  /**
   * Get entity bookings - matches GET /entity-bookings route (temple admin)
   */
  async getEntityBookings(entityId) {
    try {
      const resolvedEntityId = entityId || this.getCurrentEntityId()
      console.log(`Fetching entity bookings for entity ID: ${resolvedEntityId}`)

      const params = {
        ...(resolvedEntityId ? { entity_id: resolvedEntityId } : {})
      }

      const response = await api.get('/sevas/entity-bookings', { params })
      console.log('Entity bookings response:', response.data)

      return {
        success: true,
        data: response.data.bookings || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching entity bookings:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view bookings', 'error')
        logout()
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to view bookings', 'error')
      } else {
        showToast('Failed to fetch bookings', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch bookings',
        data: []
      }
    }
  }

  /**
   * Get booking by ID - matches GET /bookings/:id route (temple admin)
   */
  async getBookingById(bookingId) {
    try {
      const response = await api.get(`/sevas/bookings/${bookingId}`)

      return {
        success: true,
        data: response.data || null
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to view this booking', 'error')
      } else {
        showToast('Failed to fetch booking details', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking details',
        data: null
      }
    }
  }

  /**
   * Update booking status - matches PATCH /bookings/:id/status route (temple admin)
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await api.patch(`/sevas/bookings/${bookingId}/status`, { status })

      return {
        success: true,
        data: response.data,
        message: `Booking ${status} successfully`
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      if (error.response?.status === 401) {
        showToast('Please login to update booking status', 'error')
        logout()
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to update booking status', 'error')
      } else {
        showToast('Failed to update booking status', 'error')
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update booking status'
      }
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Write-safe entity ID resolution.
   * Used only as FALLBACK when entity_id is not explicitly provided by the caller.
   * Components should always pass entity_id directly from route.params.id.
   */
  getWriteEntityId() {
    // Priority 1: URL path (most reliable for entity-scoped pages)
    const currentPath = window.location.pathname
    const entityMatch = currentPath.match(/\/entity\/(\d+)/)
    if (entityMatch) {
      return entityMatch[1]
    }

    // Priority 2: JWT token role-based
    const userInfo = this.getUserInfo()
    if (userInfo) {
      if (userInfo.role === 'templeadmin' && userInfo.entityId) {
        return userInfo.entityId.toString()
      }
    }

    // Priority 3: localStorage fallback
    const storedEntityId = localStorage.getItem('current_entity_id')
    if (storedEntityId && storedEntityId !== 'null') {
      return storedEntityId
    }

    return null
  }

  /**
   * Read entity ID resolution.
   * Priority: URL path → localStorage → JWT token role fallback
   */
  getCurrentEntityId() {
    const currentPath = window.location.pathname
    const entityMatch = currentPath.match(/\/entity\/(\d+)/)
    if (entityMatch) {
      console.log(`Entity ID from URL path: ${entityMatch[1]}`)
      return entityMatch[1]
    }

    const storedEntityId = localStorage.getItem('current_entity_id')
    if (storedEntityId && storedEntityId !== 'null' && storedEntityId !== 'undefined') {
      console.log(`Entity ID from localStorage: ${storedEntityId}`)
      return storedEntityId
    }

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

    console.warn('Could not resolve entity ID for seva service')
    return null
  }

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
  }

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

export const sevaService = new SevaService()
export default sevaService