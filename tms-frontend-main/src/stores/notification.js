import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/plugins/axios'

export const useNotificationStore = defineStore('notification', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  // In-app notifications (bell icon)
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const lastFetch = ref(null)
  
  // SSE connection management
  let eventSource = null
  let reconnectTimer = null
  let reconnectAttempts = 0
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 3000
  const isConnected = ref(false)
  const connectionError = ref(null)

  // ============================================================================
  // NOTIFICATION TYPES & CONSTANTS
  // ============================================================================
  
  const NOTIFICATION_TYPES = {
    // Temple Admin notifications
    TEMPLE_APPROVED: 'temple_approved',
    TEMPLE_REJECTED: 'temple_rejected',
    TEMPLE_PENDING: 'temple_pending',
    NEW_DEVOTEE_REGISTRATION: 'new_devotee_registration',
    NEW_SEVA_BOOKING: 'new_seva_booking',
    NEW_DONATION: 'new_donation',
    EVENT_RSVP: 'event_rsvp',
    
    // Devotee notifications
    PROFILE_INCOMPLETE: 'profile_incomplete',
    SEVA_CONFIRMATION: 'seva_confirmation',
    SEVA_REMINDER: 'seva_reminder',
    DONATION_RECEIPT: 'donation_receipt',
    EVENT_INVITATION: 'event_invitation',
    EVENT_REMINDER: 'event_reminder',
    TEMPLE_ANNOUNCEMENT: 'temple_announcement',
    
    // Volunteer notifications
    ASSIGNMENT_CREATED: 'assignment_created',
    ASSIGNMENT_UPDATED: 'assignment_updated',
    SCHEDULE_CHANGED: 'schedule_changed',
    
    // Super Admin notifications
    NEW_TENANT_REGISTRATION: 'new_tenant_registration',
    TEMPLE_APPROVAL_REQUIRED: 'temple_approval_required',
    
    // System notifications
    SYSTEM_MAINTENANCE: 'system_maintenance',
    SYSTEM_UPDATE: 'system_update',
    WELCOME: 'welcome',
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  }

  const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  }

  const CATEGORIES = {
    TEMPLE: 'temple',
    SEVA: 'seva',
    DONATION: 'donation',
    EVENT: 'event',
    PROFILE: 'profile',
    SYSTEM: 'system',
    APPROVAL: 'approval',
    COMMUNICATION: 'communication'
  }

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  )

  const recentNotifications = computed(() => 
    notifications.value
      .filter(n => !n.isRead)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  )

  const notificationsByCategory = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      const category = notification.category || 'general'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(notification)
    })
    return grouped
  })

  const highPriorityNotifications = computed(() =>
    notifications.value.filter(n => 
      n.priority === PRIORITY_LEVELS.HIGH || n.priority === PRIORITY_LEVELS.URGENT
    )
  )

  // ============================================================================
  // BASIC NOTIFICATION ACTIONS
  // ============================================================================
  
  const addNotification = (notification) => {
    const newNotification = {
      id: notification.id || Date.now() + Math.random(),
      title: notification.title || 'Notification',
      message: notification.message || '',
      type: notification.type || NOTIFICATION_TYPES.INFO,
      category: notification.category || CATEGORIES.SYSTEM,
      priority: notification.priority || PRIORITY_LEVELS.MEDIUM,
      isRead: notification.isRead || false,
      isPersistent: notification.isPersistent || false,
      autoClose: notification.autoClose !== false,
      duration: notification.duration || 5000,
      createdAt: notification.createdAt || new Date().toISOString(),
      readAt: notification.readAt || null,
      userId: notification.userId || null,
      entityId: notification.entityId || null,
      actionUrl: notification.actionUrl || null,
      actionText: notification.actionText || null,
      metadata: notification.metadata || {},
      icon: notification.icon || getDefaultIcon(notification.type),
      color: notification.color || getDefaultColor(notification.type)
    }

    // Check for duplicates
    const existingIndex = notifications.value.findIndex(n => n.id === newNotification.id)
    if (existingIndex === -1) {
      notifications.value.unshift(newNotification)
      if (!newNotification.isRead) {
        unreadCount.value++
      }
    }

    return newNotification.id
  }

  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.isRead) {
      notification.isRead = true
      notification.readAt = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true
        notification.readAt = new Date().toISOString()
      }
    })
    unreadCount.value = 0
  }

  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      const notification = notifications.value[index]
      if (!notification.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  const clearRead = () => {
    notifications.value = notifications.value.filter(n => !n.isRead)
  }

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================
  
  const showToast = (message, type = 'info', options = {}) => {
    return addNotification({
      title: options.title || getToastTitle(type),
      message,
      type: type,
      category: CATEGORIES.SYSTEM,
      priority: options.priority || PRIORITY_LEVELS.MEDIUM,
      autoClose: options.autoClose !== false,
      duration: options.duration || getToastDuration(type),
      isPersistent: false,
      ...options
    })
  }

  const showSuccess = (message, options = {}) => 
    showToast(message, NOTIFICATION_TYPES.SUCCESS, options)

  const showError = (message, options = {}) => 
    showToast(message, NOTIFICATION_TYPES.ERROR, { 
      duration: 8000, 
      priority: PRIORITY_LEVELS.HIGH,
      ...options 
    })

  const showWarning = (message, options = {}) => 
    showToast(message, NOTIFICATION_TYPES.WARNING, options)

  const showInfo = (message, options = {}) => 
    showToast(message, NOTIFICATION_TYPES.INFO, options)

  // ============================================================================
  // ROLE-SPECIFIC NOTIFICATION HELPERS
  // ============================================================================
  
  const showTempleApprovalNotification = (templeData, isApproved) => {
    return addNotification({
      title: isApproved ? 'Temple Approved!' : 'Temple Rejected',
      message: isApproved 
        ? `Your temple "${templeData.name}" has been approved. You can now start managing your temple.`
        : `Your temple "${templeData.name}" was rejected. Please check the notes and resubmit.`,
      type: isApproved ? NOTIFICATION_TYPES.TEMPLE_APPROVED : NOTIFICATION_TYPES.TEMPLE_REJECTED,
      category: CATEGORIES.TEMPLE,
      priority: PRIORITY_LEVELS.HIGH,
      isPersistent: true,
      autoClose: false,
      actionUrl: isApproved ? '/tenant/dashboard' : '/tenant/entities/create',
      actionText: isApproved ? 'View Dashboard' : 'Resubmit Temple',
      metadata: { templeId: templeData.id }
    })
  }

  const showSevaBookingNotification = (sevaData, devoteeData) => {
    return addNotification({
      title: 'New Seva Booking',
      message: `${devoteeData.name} has booked ${sevaData.name} seva.`,
      type: NOTIFICATION_TYPES.NEW_SEVA_BOOKING,
      category: CATEGORIES.SEVA,
      priority: PRIORITY_LEVELS.MEDIUM,
      isPersistent: true,
      actionUrl: `/entity/${sevaData.entityId}/sevas`,
      actionText: 'View Seva',
      metadata: { sevaId: sevaData.id, devoteeId: devoteeData.id }
    })
  }

  const showDonationNotification = (donationData) => {
    return addNotification({
      title: 'Donation Received',
      message: `New donation of ₹${donationData.amount} received from ${donationData.donorName}.`,
      type: NOTIFICATION_TYPES.NEW_DONATION,
      category: CATEGORIES.DONATION,
      priority: PRIORITY_LEVELS.MEDIUM,
      isPersistent: true,
      actionUrl: `/entity/${donationData.entityId}/donations`,
      actionText: 'View Donation',
      metadata: { donationId: donationData.id }
    })
  }

  const showProfileIncompleteReminder = (devoteeData) => {
    return addNotification({
      title: 'Complete Your Profile',
      message: 'Please complete your profile to enjoy full temple services.',
      type: NOTIFICATION_TYPES.PROFILE_INCOMPLETE,
      category: CATEGORIES.PROFILE,
      priority: PRIORITY_LEVELS.MEDIUM,
      isPersistent: true,
      actionUrl: '/profile/complete',
      actionText: 'Complete Profile',
      metadata: { devoteeId: devoteeData.id }
    })
  }

  const showEventInvitation = (eventData) => {
    return addNotification({
      title: 'Event Invitation',
      message: `You're invited to ${eventData.name} on ${new Date(eventData.date).toLocaleDateString()}.`,
      type: NOTIFICATION_TYPES.EVENT_INVITATION,
      category: CATEGORIES.EVENT,
      priority: PRIORITY_LEVELS.MEDIUM,
      isPersistent: true,
      actionUrl: `/entity/${eventData.entityId}/events/${eventData.id}`,
      actionText: 'View Event',
      metadata: { eventId: eventData.id }
    })
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getDefaultIcon = (type) => {
    const iconMap = {
      [NOTIFICATION_TYPES.SUCCESS]: 'CheckCircle',
      [NOTIFICATION_TYPES.ERROR]: 'XCircle',
      [NOTIFICATION_TYPES.WARNING]: 'AlertTriangle',
      [NOTIFICATION_TYPES.INFO]: 'Info',
      [NOTIFICATION_TYPES.TEMPLE_APPROVED]: 'CheckCircle',
      [NOTIFICATION_TYPES.TEMPLE_REJECTED]: 'XCircle',
      [NOTIFICATION_TYPES.NEW_SEVA_BOOKING]: 'Calendar',
      [NOTIFICATION_TYPES.NEW_DONATION]: 'CreditCard',
      [NOTIFICATION_TYPES.EVENT_INVITATION]: 'Calendar',
      [NOTIFICATION_TYPES.PROFILE_INCOMPLETE]: 'User',
      [NOTIFICATION_TYPES.ASSIGNMENT_CREATED]: 'UserCheck',
      [NOTIFICATION_TYPES.SYSTEM_MAINTENANCE]: 'Settings'
    }
    return iconMap[type] || 'Bell'
  }

  const getDefaultColor = (type) => {
    const colorMap = {
      [NOTIFICATION_TYPES.SUCCESS]: 'text-green-600 bg-green-50',
      [NOTIFICATION_TYPES.ERROR]: 'text-red-600 bg-red-50',
      [NOTIFICATION_TYPES.WARNING]: 'text-yellow-600 bg-yellow-50',
      [NOTIFICATION_TYPES.INFO]: 'text-indigo-600 bg-indigo-50',
      [NOTIFICATION_TYPES.TEMPLE_APPROVED]: 'text-green-600 bg-green-50',
      [NOTIFICATION_TYPES.TEMPLE_REJECTED]: 'text-red-600 bg-red-50',
      [NOTIFICATION_TYPES.NEW_SEVA_BOOKING]: 'text-indigo-600 bg-indigo-50',
      [NOTIFICATION_TYPES.NEW_DONATION]: 'text-purple-600 bg-purple-50',
      [NOTIFICATION_TYPES.EVENT_INVITATION]: 'text-blue-600 bg-blue-50'
    }
    return colorMap[type] || 'text-indigo-600 bg-indigo-50'
  }

  const getToastTitle = (type) => {
    const titleMap = {
      [NOTIFICATION_TYPES.SUCCESS]: 'Success',
      [NOTIFICATION_TYPES.ERROR]: 'Error',
      [NOTIFICATION_TYPES.WARNING]: 'Warning',
      [NOTIFICATION_TYPES.INFO]: 'Information'
    }
    return titleMap[type] || 'Notification'
  }

  const getToastDuration = (type) => {
    const durationMap = {
      [NOTIFICATION_TYPES.SUCCESS]: 4000,
      [NOTIFICATION_TYPES.ERROR]: 8000,
      [NOTIFICATION_TYPES.WARNING]: 6000,
      [NOTIFICATION_TYPES.INFO]: 5000
    }
    return durationMap[type] || 5000
  }

  // ============================================================================
  // API METHODS
  // ============================================================================
  
  const fetchNotifications = async (limit = 20) => {
    isLoading.value = true
    try {
      const { data } = await apiClient.inapp.listInApp(limit)
      notifications.value = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        message: item.message,
        category: item.category,
        isRead: item.is_read,
        createdAt: item.created_at,
        type: item.type || NOTIFICATION_TYPES.INFO,
        priority: item.priority || PRIORITY_LEVELS.MEDIUM,
        actionUrl: item.action_url || null,
        actionText: item.action_text || null,
        metadata: item.metadata || {}
      }))
      unreadCount.value = notifications.value.filter(n => !n.isRead).length
      lastFetch.value = new Date().toISOString()
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Don't show error toast during initial load to avoid noise
      if (lastFetch.value) {
        showError('Failed to load notifications')
      }
    } finally {
      isLoading.value = false
    }
  }

  const markInAppAsRead = async (id) => {
    try {
      await apiClient.inapp.markInAppRead(id)
      const n = notifications.value.find(x => x.id === id)
      if (n && !n.isRead) {
        n.isRead = true
        n.readAt = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      // Silently fail - not critical enough to show error to user
    }
  }

  // ============================================================================
  // SSE REALTIME CONNECTION
  // ============================================================================
  
  const connectStream = () => {
    // Prevent multiple connections
    if (eventSource) {
      console.log('SSE already connected')
      return
    }

    // Check if we've exceeded max reconnection attempts
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max SSE reconnection attempts reached')
      connectionError.value = 'Unable to establish real-time connection'
      return
    }
    
    try {
      // Match the axios baseURL configuration
      const baseURL = '/api/v1'
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        console.warn('No auth token available for SSE connection')
        return
      }
      
      console.log('SSE Connection baseURL:', baseURL)
      
      // Construct SSE URL with token for authentication
      const url = `${baseURL}/notifications/stream-token?token=${token}`
      
      console.log('Connecting to SSE:', url)
      
      eventSource = new EventSource(url, { withCredentials: true })
      
      // Handle connection open
      eventSource.addEventListener('open', () => {
        console.log('✓ SSE connection established')
        isConnected.value = true
        connectionError.value = null
        reconnectAttempts = 0 // Reset attempts on successful connection
      })
      
      // Handle heartbeat/ping events to keep connection alive
      eventSource.addEventListener('ping', () => {
        console.log('SSE heartbeat received')
      })
      
      // Handle incoming notification events
      eventSource.addEventListener('inapp', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📬 Received SSE notification:', data)
          
          const n = {
            id: data.id,
            title: data.title,
            message: data.message,
            category: data.category,
            isRead: data.is_read || false,
            createdAt: data.created_at,
            type: data.type || NOTIFICATION_TYPES.INFO,
            priority: data.priority || PRIORITY_LEVELS.MEDIUM,
            actionUrl: data.action_url || null,
            actionText: data.action_text || null,
            metadata: data.metadata || {}
          }
          
          // Check if notification already exists (prevent duplicates)
          const existingIndex = notifications.value.findIndex(existing => existing.id === n.id)
          if (existingIndex === -1) {
            // Add to notifications array
            notifications.value.unshift(n)
            if (!n.isRead) {
              unreadCount.value++
              
              // Show toast notification for new unread messages
              // But don't show toast if it's a system notification to avoid double notifications
              if (n.category !== CATEGORIES.SYSTEM) {
                showToast(n.message, n.type, {
                  title: n.title,
                  duration: 6000
                })
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse SSE notification:', e)
        }
      })
      
      // Handle connection errors
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        isConnected.value = false
        connectionError.value = 'Connection lost'
        
        // Clean up current connection
        disconnectStream()
        
        // Increment reconnection attempts
        reconnectAttempts++
        
        // Calculate exponential backoff delay
        const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 30000)
        
        console.log(`Attempting to reconnect SSE... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms`)
        
        // Schedule reconnection
        reconnectTimer = setTimeout(() => {
          connectStream()
        }, delay)
      }
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      isConnected.value = false
      connectionError.value = 'Failed to connect'
    }
  }

  const disconnectStream = () => {
    // Clear any pending reconnection timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    // Close the event source
    if (eventSource) {
      console.log('Disconnecting SSE stream')
      eventSource.close()
      eventSource = null
      isConnected.value = false
    }
  }

  const reconnectStream = () => {
    disconnectStream()
    reconnectAttempts = 0 // Reset attempts for manual reconnection
    connectStream()
  }

  // ============================================================================
  // CLEANUP UTILITIES
  // ============================================================================
  
  const cleanupOldNotifications = (daysOld = 30) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const initialCount = notifications.value.length
    notifications.value = notifications.value.filter(notification => {
      const notificationDate = new Date(notification.createdAt)
      return notificationDate > cutoffDate || notification.isPersistent
    })
    
    // Recalculate unread count
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
    
    const removedCount = initialCount - notifications.value.length
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old notifications`)
    }
  }

  // ============================================================================
  // RETURN STORE API
  // ============================================================================
  
  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    lastFetch,
    isConnected,
    connectionError,
    
    // Constants
    NOTIFICATION_TYPES,
    PRIORITY_LEVELS,
    CATEGORIES,
    
    // Getters
    unreadNotifications,
    recentNotifications,
    notificationsByCategory,
    highPriorityNotifications,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    
    // Toast methods
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Role-specific notifications
    showTempleApprovalNotification,
    showSevaBookingNotification,
    showDonationNotification,
    showProfileIncompleteReminder,
    showEventInvitation,
    
    // API methods
    fetchNotifications,
    markInAppAsRead,
    cleanupOldNotifications,
    
    // SSE methods
    connectStream,
    disconnectStream,
    reconnectStream
  }
})