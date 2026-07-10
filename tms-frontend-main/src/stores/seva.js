// src/stores/seva.js - Updated with slot management support

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sevaService } from '@/services/seva.service'

export const useSevaStore = defineStore('seva', () => {
  // State
  const sevas = ref([])
  const sevaBookings = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const filters = ref({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  })
  const selectedSeva = ref(null)
  
  const recentSevas = ref([])
  const loadingRecentSevas = ref(false)
  const bookingCounts = ref({})
  const loadingBookingCounts = ref(false)
  
  const sevaCatalog = ref([])
  const loadingCatalog = ref(false)
  
  // Computed properties
  const filteredSevas = computed(() => {
    let filtered = sevas.value
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(seva =>
        seva.name?.toLowerCase().includes(query) ||
        seva.description?.toLowerCase().includes(query)
      )
    }
    
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(seva => seva.status === filters.value.status)
    }
    
    if (filters.value.type !== 'all') {
      filtered = filtered.filter(seva => seva.type === filters.value.type)
    }
    
    return filtered
  })
  
  // Computed stats
  const sevaStats = computed(() => ({
    total: sevas.value.length,
    active: sevas.value.filter(s => s.is_active).length,
    pending: sevas.value.filter(s => s.status === 'pending').length,
  }))
  
  // ✅ NEW: Computed slot statistics
  const slotStats = computed(() => {
    const stats = {
      totalSlots: 0,
      bookedSlots: 0,
      remainingSlots: 0,
      fullyBooked: 0
    };
    
    sevas.value.forEach(seva => {
      stats.totalSlots += seva.available_slots || 0;
      stats.bookedSlots += seva.booked_slots || 0;
      stats.remainingSlots += seva.remaining_slots || 0;
      if ((seva.remaining_slots || 0) === 0 && (seva.available_slots || 0) > 0) {
        stats.fullyBooked++;
      }
    });
    
    return stats;
  })

  /**
   * Fetch sevas for temple admin view - uses /entity-sevas endpoint
   * ✅ UPDATED: Now includes slot information
   * @param {Object} params - Query parameters
   * @returns {Array} Seva list with slot data
   */
  const fetchSevas = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getSevas({
        page: params.page || 1,
        limit: params.limit || 10,
        seva_type: params.seva_type || '',
        search: params.search || ''
      })
      
      if (response.success) {
        // ✅ Ensure all sevas have slot fields
        sevas.value = (response.data || []).map(seva => ({
          ...seva,
          available_slots: seva.available_slots || 0,
          booked_slots: seva.booked_slots || 0,
          remaining_slots: seva.remaining_slots || 0
        }))
        
        console.log('Sevas loaded with slot data:', sevas.value.length)
        return sevas.value
      } else {
        error.value = response.error
        return []
      }
    } catch (err) {
      console.error('Error fetching sevas:', err)
      error.value = err.message || 'Failed to fetch sevas'
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch sevas for devotee view - uses / endpoint with devotee middleware
   * ✅ UPDATED: Now includes slot information
   * @param {Object} params - Query parameters
   * @returns {Array} Seva list with slot data
   */
  const fetchDevoteeSevas = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getDevoteeSevas({
        page: params.page || 1,
        limit: params.limit || 10,
        seva_type: params.seva_type || '',
        search: params.search || ''
      })
      
      if (response.success) {
        // ✅ Ensure all sevas have slot fields
        sevas.value = (response.data || []).map(seva => ({
          ...seva,
          available_slots: seva.available_slots || 0,
          booked_slots: seva.booked_slots || 0,
          remaining_slots: seva.remaining_slots || 0
        }))
        return sevas.value
      } else {
        error.value = response.error
        return []
      }
    } catch (err) {
      console.error('Error fetching devotee sevas:', err)
      error.value = err.message || 'Failed to fetch sevas'
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch booking counts - uses /booking-counts endpoint
   * @returns {Object} Booking statistics
   */
  const fetchBookingCounts = async () => {
    loadingBookingCounts.value = true
    
    try {
      const response = await sevaService.getBookingCounts()
      
      if (response.success) {
        bookingCounts.value = response.data || {}
        return bookingCounts.value
      } else {
        console.error('Failed to fetch booking counts:', response.error)
        bookingCounts.value = {}
        return {}
      }
    } catch (error) {
      console.error('Error fetching booking counts:', error)
      bookingCounts.value = {}
      return {}
    } finally {
      loadingBookingCounts.value = false
    }
  }
  
  /**
   * Fetch seva catalog for mapping purposes
   * ✅ UPDATED: Now includes slot information
   * @returns {Array} Complete seva catalog with slot data
   */
  const fetchSevaCatalog = async () => {
    loadingCatalog.value = true
    try {
      const response = await sevaService.getSevas({
        page: 1,
        limit: 1000,
        search: ''
      })
      
      if (response.success) {
        // ✅ Ensure all sevas have slot fields
        sevaCatalog.value = (response.data || []).map(seva => ({
          ...seva,
          available_slots: seva.available_slots || 0,
          booked_slots: seva.booked_slots || 0,
          remaining_slots: seva.remaining_slots || 0
        }))
        console.log('Seva catalog loaded:', sevaCatalog.value.length)
        return sevaCatalog.value
      } else {
        console.error('Failed to fetch seva catalog:', response.error)
        sevaCatalog.value = []
        return []
      }
    } catch (error) {
      console.error('Error fetching seva catalog:', error)
      sevaCatalog.value = []
      return []
    } finally {
      loadingCatalog.value = false
    }
  }
  
  /**
   * Fetch entity bookings - uses /entity-bookings endpoint
   * @param {string} entityId - Optional entity ID filter
   * @returns {Array} Booking list
   */
  const fetchEntityBookings = async (entityId = null) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getEntityBookings(entityId)
      
      if (response.success) {
        sevaBookings.value = response.data || []
        return sevaBookings.value
      } else {
        error.value = response.error
        sevaBookings.value = []
        return []
      }
    } catch (err) {
      console.error('Error fetching seva bookings:', err)
      error.value = err.response?.data?.error || 'Failed to fetch bookings'
      sevaBookings.value = []
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch single booking by ID - uses /bookings/:id endpoint
   * @param {string} bookingId - Booking ID
   * @returns {Object|null} Booking details
   */
  const fetchBookingById = async (bookingId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getBookingById(bookingId)
      
      if (response.success) {
        return response.data
      } else {
        error.value = response.error
        return null
      }
    } catch (err) {
      console.error('Error fetching booking:', err)
      error.value = err.response?.data?.error || 'Failed to fetch booking'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch recent sevas for devotee dashboard - uses /my-bookings endpoint
   * @param {string} entityId - Optional entity ID to filter bookings
   * @returns {Array} Recent bookings with seva details
   */
  const fetchRecentSevas = async (entityId = null) => {
    loadingRecentSevas.value = true;
    try {
      await fetchSevaCatalog();
      
      const response = await sevaService.getMyBookings(entityId);
      
      if (response.success) {
        let bookings = response.data || [];
        
        if (entityId) {
          bookings = bookings.filter(booking => {
            const bookingEntityId = booking.entity_id || booking.EntityID || booking.entityId;
            return bookingEntityId && parseInt(bookingEntityId) === parseInt(entityId);
          });
          console.log(`Filtered ${bookings.length} bookings for entity ${entityId}`);
        }
        
        bookings = bookings.map(booking => {
          const sevaId = booking.seva_id || booking.SevaID;
          const seva = sevaCatalog.value.find(s => s.id === sevaId || s.ID === sevaId);
          
          return {
            ...booking,
            seva_name: seva?.name || seva?.Name || `Seva ${sevaId}`,
            seva_type: seva?.type || seva?.Type || seva?.seva_type || '',
            seva_description: seva?.description || seva?.Description || '',
            seva: seva ? {
              id: seva.id || seva.ID,
              name: seva.name || seva.Name,
              type: seva.type || seva.Type || seva.seva_type,
              description: seva.description || seva.Description,
              // ✅ Include slot information
              available_slots: seva.available_slots || 0,
              booked_slots: seva.booked_slots || 0,
              remaining_slots: seva.remaining_slots || 0
            } : null
          };
        });
        
        console.log(`Bookings with seva names for entity ${entityId}:`, bookings.length);
        
        const sorted = [...bookings].sort((a, b) => {
          const dateA = new Date(a.booking_time || a.BookingTime || a.created_at || Date.now());
          const dateB = new Date(b.booking_time || b.BookingTime || b.created_at || Date.now());
          return dateB - dateA;
        });
        
        recentSevas.value = sorted;
        return recentSevas.value;
      } else {
        recentSevas.value = [];
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch recent sevas:', error);
      recentSevas.value = [];
      return [];
    } finally {
      loadingRecentSevas.value = false;
    }
  }

  /**
   * Create new seva - uses POST / endpoint
   * ✅ UPDATED: Backend handles slot initialization
   * @param {Object} sevaData - Seva creation data
   * @returns {Object} Operation result
   */
  const createSeva = async (sevaData) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Creating seva with data:', sevaData)
      
      const response = await sevaService.createSeva(sevaData)
      
      if (response.success && response.data) {
        // ✅ Ensure slot fields are present
        const newSeva = {
          ...response.data,
          available_slots: response.data.available_slots || 0,
          booked_slots: response.data.booked_slots || 0,
          remaining_slots: response.data.remaining_slots || 0
        }
        
        sevas.value.push(newSeva)
        sevaCatalog.value.push(newSeva)
      }
      
      return { 
        success: response.success, 
        message: response.message || 'Seva created successfully',
        data: response.data
      }
    } catch (err) {
      console.error('Error creating seva:', err)
      error.value = err.response?.data?.error || 'Failed to create seva'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Update existing seva - uses PUT /:id endpoint
   * ✅ UPDATED: Backend recalculates slots
   * @param {string} sevaId - Seva ID to update
   * @param {Object} sevaData - Updated seva data
   * @returns {Object} Operation result
   */
  const updateSeva = async (sevaId, sevaData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.updateSeva(sevaId, sevaData)
      
      if (response.success && response.data) {
        // ✅ Ensure slot fields are present
        const updatedSeva = {
          ...response.data,
          available_slots: response.data.available_slots || 0,
          booked_slots: response.data.booked_slots || 0,
          remaining_slots: response.data.remaining_slots || 0
        }
        
        const index = sevas.value.findIndex(s => s.id === sevaId)
        if (index !== -1) {
          sevas.value[index] = updatedSeva
        }
        
        const catalogIndex = sevaCatalog.value.findIndex(s => s.id === sevaId)
        if (catalogIndex !== -1) {
          sevaCatalog.value[catalogIndex] = updatedSeva
        }
      }
      
      return { 
        success: response.success, 
        message: response.message || 'Seva updated successfully',
        data: response.data
      }
    } catch (err) {
      console.error('Error updating seva:', err)
      error.value = err.response?.data?.error || 'Failed to update seva'
      return { 
        success: false, 
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Delete seva - PERMANENT DELETE - uses DELETE /:id endpoint
   * @param {string} sevaId - Seva ID to delete permanently
   * @returns {Object} Operation result
   */
  const deleteSeva = async (sevaId) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Permanently deleting seva with ID:', sevaId)
      
      const response = await sevaService.deleteSeva(sevaId)
      
      if (response.success) {
        sevas.value = sevas.value.filter(s => (s.id || s.ID) !== sevaId)
        sevaCatalog.value = sevaCatalog.value.filter(s => (s.id || s.ID) !== sevaId)
        sevaBookings.value = sevaBookings.value.filter(b => (b.seva_id || b.SevaID) !== sevaId)
        recentSevas.value = recentSevas.value.filter(b => (b.seva_id || b.SevaID) !== sevaId)
        
        console.log('Seva permanently removed from all local state')
      }
      
      return { 
        success: response.success, 
        message: response.message || 'Seva permanently deleted successfully' 
      }
    } catch (err) {
      console.error('Error permanently deleting seva:', err)
      error.value = err.response?.data?.error || 'Failed to permanently delete seva'
      return { 
        success: false, 
        message: error.value 
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Book a seva for devotees - uses POST /bookings endpoint
   * ✅ NOTE: Slots are NOT reduced until admin approves
   * @param {number} sevaId - Seva ID to book
   * @returns {Object} Operation result
   */
  const bookSeva = async (sevaId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.bookSeva(sevaId)
      
      // ✅ Note: We don't update slots here - they update when admin approves
      return {
        success: response.success,
        message: response.message || 'Seva booking request submitted',
        data: response.data
      }
    } catch (err) {
      console.error('Error booking seva:', err)
      error.value = err.response?.data?.error || 'Failed to book seva'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Update booking status - uses PATCH /bookings/:id/status endpoint
   * ✅ IMPORTANT: This triggers slot updates on the backend
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Object} Operation result
   */
  const updateBookingStatus = async (bookingId, status) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.updateBookingStatus(bookingId, status)
      
      if (response.success) {
        // Update the booking status in local state
        const bookingIndex = sevaBookings.value.findIndex(b => (b.id || b.ID) === bookingId)
        if (bookingIndex !== -1) {
          sevaBookings.value[bookingIndex].status = status
          sevaBookings.value[bookingIndex].Status = status
        }
        
        // ✅ IMPORTANT: Refresh sevas to get updated slot counts from backend
        await fetchSevas()
      }
      
      return { 
        success: response.success, 
        message: response.message || `Booking ${status} successfully` 
      }
    } catch (err) {
      console.error('Error updating booking status:', err)
      error.value = err.response?.data?.error || 'Failed to update booking status'
      return { 
        success: false, 
        message: error.value 
      }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Get seva by ID - uses /:id endpoint
   * @param {string} sevaId - Seva ID
   * @returns {Object|null} Seva details
   */
  const getSevaById = async (sevaId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await sevaService.getSevaById(sevaId)
      
      if (response.success) {
        // ✅ Ensure slot fields are present
        const seva = response.data
        if (seva) {
          seva.available_slots = seva.available_slots || 0
          seva.booked_slots = seva.booked_slots || 0
          seva.remaining_slots = seva.remaining_slots || 0
        }
        return seva
      } else {
        error.value = response.error
        return null
      }
    } catch (err) {
      console.error('Error fetching seva:', err)
      error.value = err.response?.data?.error || 'Failed to fetch seva'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Utility functions
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }
  
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  const clearFilters = () => {
    searchQuery.value = ''
    filters.value = {
      status: 'all',
      type: 'all',
      dateRange: 'all'
    }
  }
  
  const setSelectedSeva = (seva) => {
    selectedSeva.value = seva
  }
  
  return {
    // State
    sevas,
    sevaBookings,
    loading,
    error,
    searchQuery,
    filters,
    selectedSeva,
    recentSevas,
    loadingRecentSevas,
    sevaCatalog,
    loadingCatalog,
    bookingCounts,
    loadingBookingCounts,
    
    // Getters
    filteredSevas,
    sevaStats,
    slotStats, // ✅ NEW: Slot statistics
    
    // Actions
    fetchSevas,
    fetchDevoteeSevas,
    fetchBookingCounts,
    fetchSevaCatalog,
    fetchEntityBookings,
    fetchBookingById,
    fetchRecentSevas,
    createSeva,
    updateSeva,
    deleteSeva,
    bookSeva,
    updateBookingStatus,
    getSevaById,
    setSearchQuery,
    setFilters,
    clearFilters,
    setSelectedSeva
  }
})