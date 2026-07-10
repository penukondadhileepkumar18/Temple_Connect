<template>
  <header class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
    <div class="px-2 sm:px-4 lg:px-6 xl:px-8">
      <div class="flex justify-between items-center h-14 sm:h-16">
        <!-- Left Side - Back Button, Menu Button, Logo -->
        <div class="flex items-center space-x-2">
          <!-- Back Button (All Devices) -->
          <button
            v-if="canGoBack"
            @click="goBack"
            class="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title="Go back"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Mobile Menu Toggle Button -->
          <button
            @click="emit('toggle-sidebar')"
            class="lg:hidden p-1.5 sm:p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 touch-target"
            title="Toggle menu"
          >
            <svg v-if="!sidebarOpen" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Devotee Quick Access Button (Desktop Only) -->
          <button
            v-if="currentRole === 'entity_admin' || currentRole === 'volunteer'"
            @click="navigateToDevotees"
            class="hidden lg:flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title="Devotees"
          >
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span>Devotees</span>
          </button>

          <!-- Logo and Brand -->
          <div class="flex-shrink-0 flex items-center ml-1 sm:ml-2">
            <router-link :to="getHomeLink()" class="flex items-center">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <div class="ml-2 sm:ml-3 hidden sm:block">
                <h1 class="text-base sm:text-lg lg:text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">{{ appTitle }}</h1>
                <p v-if="currentTemple" class="text-xs sm:text-sm text-gray-500 truncate max-w-24 sm:max-w-32 lg:max-w-48">{{ currentTemple }}</p>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Right Side - User Actions -->
        <div class="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          <!-- Notification Bell -->
          <button 
            @click="toggleNotifications"
            class="relative p-1.5 sm:p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 notifications-bell"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.64 5.36 6 7.929 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span 
              v-if="notificationCount > 0" 
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse"
            >
              {{ notificationCount > 9 ? '9+' : notificationCount }}
            </span>
          </button>

          <!-- Profile Dropdown -->
          <AppProfileDropdown 
            :user="currentUser"
            :role="currentRole"
            @logout="handleLogout"
          />
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet Breadcrumb (hidden on large screens) -->
    <div class="lg:hidden border-t border-gray-200 px-4 py-2 bg-gray-50">
      <AppBreadcrumb />
    </div>

    <!-- Notifications Dropdown -->
    <transition name="slide-fade">
      <div 
        v-if="showNotifications" 
        class="notifications-container absolute top-14 sm:top-16 right-2 sm:right-4 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
      >
        <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
              <span 
                v-if="notificationCount > 0"
                class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
              >
                {{ notificationCount }}
              </span>
            </div>
            <button 
              v-if="headerNotifications.length > 0 && headerNotifications.some(n => !n.isRead)"
              @click="markAllAsRead"
              class="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Mark all read
            </button>
          </div>
        </div>
        
        <div class="max-h-80 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="isLoading" class="p-6 text-center">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p class="text-gray-500 text-sm">Loading notifications...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="headerNotifications.length === 0" class="p-6 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"/>
            </svg>
            <p class="text-gray-500 font-medium">No notifications yet</p>
            <p class="text-gray-400 text-sm mt-1">We'll notify you when something new arrives</p>
          </div>
          
          <!-- Notification Items -->
          <div v-else>
            <div 
              v-for="notification in headerNotifications" 
              :key="notification.id"
              class="p-4 border-b border-gray-100 hover:bg-indigo-50 cursor-pointer transition-all duration-200"
              :class="{ 'bg-indigo-25': !notification.isRead }"
              @click="markAsReadAndClose(notification.id)"
            >
              <div class="flex items-start space-x-3">
                <!-- Status Indicator -->
                <div 
                  class="flex-shrink-0 w-2 h-2 mt-2 rounded-full transition-colors"
                  :class="notification.isRead ? 'bg-gray-300' : 'bg-indigo-500'"
                ></div>
                
                <!-- Notification Icon -->
                <div 
                  class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="getCategoryColor(notification.category)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      :d="getCategoryIcon(notification.category)"
                    />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ notification.title }}</p>
                  <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ notification.message }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <p class="text-xs text-gray-400">{{ formatTime(notification.createdAt) }}</p>
                    <span 
                      v-if="notification.category"
                      class="text-xs px-2 py-0.5 rounded-full"
                      :class="getCategoryBadge(notification.category)"
                    >
                      {{ notification.category }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="headerNotifications.length > 0" class="p-3 border-t border-gray-200 bg-gray-50">
          <button 
            @click="viewAllNotifications"
            class="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            View all notifications
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay for notifications -->
    <transition name="fade">
      <div 
        v-if="showNotifications" 
        @click="showNotifications = false"
        class="fixed inset-0 bg-black bg-opacity-10 z-40"
      ></div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useRouter, useRoute } from 'vue-router'
import AppBreadcrumb from './AppBreadcrumb.vue'
import AppProfileDropdown from './AppProfileDropdown.vue'

// Props
const props = defineProps({
  showSidebar: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['toggle-menu', 'toggle-sidebar'])
 
// Composables
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const route = useRoute()

// Inject sidebar state from parent layout (no fallback)
const sidebarOpen = inject('sidebarOpen')

// Reactive data
const showNotifications = ref(false)
const isLoading = ref(false)
const hasNewNotification = ref(false)

// Computed properties
const currentUser = computed(() => authStore.user)
const currentRole = computed(() => authStore.user?.role)
const notificationCount = computed(() => notificationStore.unreadCount)
const headerNotifications = computed(() => notificationStore.notifications.slice(0, 10))

const appTitle = computed(() => {
  switch (currentRole.value) {
    case 'tenant':
      return 'Temple Admin'
    case 'entity_admin':
      return 'Devotee Connect'
    case 'devotee':
      return 'Devotee Dashboard'
    case 'volunteer':
      return 'Volunteer Portal'
    case 'superadmin':
      return 'Devotee Connect'
    default:
      return 'Devotee Connect'
  }
})

const currentTemple = computed(() => {
  if (currentRole.value === 'entity_admin' || currentRole.value === 'devotee' || currentRole.value === 'volunteer') {
    return 'Sri Venkateshwara Temple, Bangalore'
  }
  return null
})

const canGoBack = computed(() => {
  return window.history.length > 1
})

// Watch for new notifications
watch(notificationCount, (newCount, oldCount) => {
  if (newCount > oldCount && oldCount !== undefined) {
    hasNewNotification.value = true
    setTimeout(() => {
      hasNewNotification.value = false
    }, 3000)
  }
})

// Methods
const getHomeLink = () => {
  const entityId = route.params.entityId
  
  switch (currentRole.value) {
    case 'tenant':
      return '/tenant/dashboard'
    case 'entity_admin':
      return `/entity/${entityId}/dashboard`
    case 'devotee':
      return `/entity/${entityId}/devotee/dashboard`
    case 'volunteer':
      return `/entity/${entityId}/volunteer/dashboard`
    case 'superadmin':
      return '/superadmin/dashboard'
    default:
      return '/'
  }
}
const goBack = () => {
  const dashboardPath = getHomeLink()
  const currentPath = route.path

  const blockedRoutes = ['/login', '/register', '/forgot-password', '/', '/terms', '/privacy']

  let navHistory = JSON.parse(sessionStorage.getItem('nav_history') || '[]')

  // Remove duplicates of current path
  while (navHistory.length && navHistory[navHistory.length - 1] === currentPath) {
    navHistory.pop()
  }

  // If we have previous in-app history
  if (navHistory.length > 0) {
    const previousPath = navHistory[navHistory.length - 1]

    // ❌ Block public pages
    if (blockedRoutes.includes(previousPath)) {
      router.push(dashboardPath)
      sessionStorage.setItem('nav_history', JSON.stringify([dashboardPath]))
      return
    }

    // ✅ If already on dashboard root, stop here
    if (currentPath === dashboardPath) {
      router.push(dashboardPath)
      sessionStorage.setItem('nav_history', JSON.stringify([dashboardPath]))
      return
    }

    // ✅ Normal back navigation inside dashboard
    navHistory.pop()
    sessionStorage.setItem('nav_history', JSON.stringify(navHistory))
    router.push(previousPath)
  } 
  else {
    // No history → stay on dashboard
    router.push(dashboardPath)
    sessionStorage.setItem('nav_history', JSON.stringify([dashboardPath]))
  }
}

router.afterEach((to) => {
  const history = JSON.parse(sessionStorage.getItem('nav_history') || '[]')

  if (history[history.length - 1] !== to.path) {
    history.push(to.path)
  }

  sessionStorage.setItem('nav_history', JSON.stringify(history))
})

const navigateToDevotees = () => {
  const entityId = route.params.entityId
  if (currentRole.value === 'entity_admin') {
    router.push(`/entity/${entityId}/devotees`)
  } else if (currentRole.value === 'volunteer') {
    router.push(`/entity/${entityId}/volunteer/devotees`)
  }
}

const toggleNotifications = (event) => {
  event.stopPropagation()
  showNotifications.value = !showNotifications.value
}

const markAsReadAndClose = async (notificationId) => {
  await notificationStore.markInAppAsRead(notificationId)
  showNotifications.value = false
  
  const notification = headerNotifications.value.find(n => n.id === notificationId)
  if (!notification) return
  
  const entityId = route.params.entityId
  
  switch (notification.category) {
    case 'event':
      router.push(`/entity/${entityId}/devotee/events`)
      break
    case 'seva':
      router.push(`/entity/${entityId}/devotee/seva-booking`)
      break
    case 'donation':
      router.push(`/entity/${entityId}/devotee/donations`)
      break
    case 'announcement':
      router.push(`/entity/${entityId}/devotee/dashboard`)
      break
    default:
      if (notification.link) {
        router.push(notification.link)
      }
  }
}

const markAllAsRead = async () => {
  const toMark = headerNotifications.value.filter(n => !n.isRead).map(n => n.id)
  for (const id of toMark) {
    await notificationStore.markInAppAsRead(id)
  }
  showNotifications.value = false
}

const viewAllNotifications = () => {
  showNotifications.value = false
  const entityId = route.params.entityId
  router.push(`/entity/${entityId}/notifications`)
}

const getCategoryColor = (category) => {
  const colors = {
    'seva': 'bg-purple-100 text-purple-600',
    'donation': 'bg-green-100 text-green-600',
    'event': 'bg-blue-100 text-blue-600',
    'system': 'bg-gray-100 text-gray-600',
    'announcement': 'bg-yellow-100 text-yellow-600'
  }
  return colors[category] || 'bg-gray-100 text-gray-600'
}

const getCategoryBadge = (category) => {
  const badges = {
    'seva': 'bg-purple-100 text-purple-700',
    'donation': 'bg-green-100 text-green-700',
    'event': 'bg-blue-100 text-blue-700',
    'system': 'bg-gray-100 text-gray-700',
    'announcement': 'bg-yellow-100 text-yellow-700'
  }
  return badges[category] || 'bg-gray-100 text-gray-700'
}

const getCategoryIcon = (category) => {
  const icons = {
    'seva': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'donation': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'event': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    'system': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    'announcement': 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
  }
  return icons[category] || icons['system']
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const notificationDate = new Date(timestamp)
  const diff = now - notificationDate
  
  if (diff < 60 * 1000) {
    return 'Just now'
  } else if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}m ago`
  } else if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}h ago`
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}d ago`
  } else {
    return notificationDate.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    })
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Click outside handler for notifications
const handleClickOutside = (event) => {
  const isClickOnBell = event.target.closest('.notifications-bell')
  const isClickInContainer = event.target.closest('.notifications-container')
  
  if (showNotifications.value && !isClickInContainer && !isClickOnBell) {
    showNotifications.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // Log initial state for debugging
  console.log('AppHeader mounted. Sidebar state:', sidebarOpen?.value)
  
  // Load notifications on mount
  isLoading.value = true
  try {
    await notificationStore.fetchNotifications(20)
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    isLoading.value = false
  }
  
  // Connect SSE stream for realtime updates
  notificationStore.connectStream()
})

onUnmounted(() => {
  notificationStore.disconnectStream()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Touch target for better mobile UX */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
</style>