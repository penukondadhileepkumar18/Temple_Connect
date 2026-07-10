<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex items-center space-x-4">
  <!-- Temple Logo -->
  <div 
    v-if="templeLogo" 
    class="h-18 w-20 rounded-full overflow-hidden border-2 border-indigo-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
    @click="openTemplelogo"
  >
    <img :src="templeLogo" :alt="temple?.name || 'Temple'" class="h-full w-full object-cover" @error="handleLogoError" />
  </div>
  <div v-else class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all" @click="openTempleVideo">
    <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
    </svg>
  </div>
  <div>
    <h2 
      class="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2"
      @click="openTempleVideo"
    >
      {{ temple ? temple.name : 'Loading...' }}
      <!-- Video indicator icon -->
      <svg 
        v-if="templeVideo"
        class="h-5 w-5 text-indigo-500 animate-pulse" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z"/>
      </svg>
    </h2>
    <p class="text-sm text-gray-500">{{ temple ? `${temple.city}, ${temple.state}` : 'Loading location...' }}</p>
  </div>
</div>

 <transition name="modal">
      <div v-if="showLogoModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-98 flex items-center justify-center p-4" @click.self="closeLogoModal">
        <div class="relative w-full h-full max-w-7xl mx-auto flex flex-col" @click.stop>
          <!-- Close Button -->
          <button
            @click="closeLogoModal"
            class="absolute top-6 right-6 z-50 text-white hover:text-gray-200 transition-all duration-300 flex items-center gap-2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-black/80 hover:scale-105"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span class="text-sm font-semibold">Close</span>
          </button>
          
          <!-- Temple Name Title -->
          <div class="absolute top-6 left-6 z-50 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20">
            <h2 class="text-white text-lg font-semibold">{{ temple?.name }}</h2>
          </div>
          
          <!-- Logo Image -->
          <div class="flex-1 w-full flex items-center justify-center relative">
            <img
              v-if="templeLogo"
              :src="templeLogo"
              :alt="temple?.name || 'Temple Logo'"
              class="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl"
              @error="handleLogoError"
            />
            
            <!-- No Logo Message -->
            <div v-else class="text-center text-white">
              <svg class="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p class="text-lg">Temple logo not available</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
<!-- Video Modal -->
<transition name="modal">
  <div v-if="showVideoModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-98 flex items-center justify-center p-4" @click.self="closeVideoModal">
    <div class="relative w-full h-full max-w-7xl mx-auto flex flex-col" @click.stop>
      <!-- Close Button -->
      <button
        @click="closeVideoModal"
        class="absolute top-6 right-6 z-50 text-white hover:text-gray-200 transition-all duration-300 flex items-center gap-2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-black/80 hover:scale-105"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span class="text-sm font-semibold">Close Video</span>
      </button>
      
      <!-- Temple Name Title -->
      <div class="absolute top-6 left-6 z-50 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20">
        <h2 class="text-white text-lg font-semibold">{{ temple?.name }}</h2>
      </div>
      
      <!-- Video Player -->
      <div class="flex-1 w-full flex items-center justify-center relative">
        <video
          v-if="templeVideo"
          ref="videoPlayer"
          :src="templeVideo"
          controls
          autoplay
          playsinline
          class="w-full h-full max-w-6xl max-h-[85vh] object-contain rounded-3xl shadow-2xl"
          @error="handleVideoError"
        >
          Your browser does not support the video tag.
        </video>
        
        <!-- No Video Message -->
        <div v-else class="text-center text-white">
          <svg class="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <p class="text-lg">Temple video not available</p>
        </div>
      </div>
    </div>
  </div>
</transition>

    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-bold text-indigo-700">Communication Center</h3>
          <p class="mt-1 text-sm text-gray-600">
            Send messages, manage templates, and track communication history
          </p>
        </div>
        
        <!-- Quick Stats -->
        <!-- <div class="flex space-x-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ stats.totalMessages }}</div>
            <div class="text-xs text-gray-500">Total Sent</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ stats.deliveredMessages }}</div>
            <div class="text-xs text-gray-500">Delivered</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ stats.activeTemplates }}</div>
            <div class="text-xs text-gray-500">Templates</div>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-white border-b border-gray-200">
      <nav class="flex space-x-8 px-4 sm:px-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
            activeTab === tab.id
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center space-x-2">
            <component :is="tab.icon" class="w-5 h-5" />
            <span>{{ tab.name }}</span>
            
          </div>
        </button>
      </nav>
    </div>

    <!-- Content Area -->
    <div class="p-4 sm:p-6">
      <!-- Compose Message Tab -->
      <div v-if="activeTab === 'compose'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Compose New Message</h3>
            <MessageComposer 
              @message-sent="handleMessageSent"
              @save-template="handleSaveTemplate"
            />
          </div>
        </div>
      </div>

      <!-- Bulk Message Tab -->
      <div v-if="activeTab === 'bulk'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Bulk Messaging</h2>
            <BulkMessage 
              @bulk-sent="handleBulkSent"
              @preview-requested="handlePreviewRequest"
            />
          </div>
        </div>
      </div>

      <!-- Templates Tab -->
      <div v-if="activeTab === 'templates'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6">
            <!-- <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Message Templates</h2>
              <button
                @click="showCreateTemplate = true"
                class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus class="w-4 h-4" />
                <span>New Template</span>
              </button>
            </div> -->
            <MessageTemplates 
              @template-selected="handleTemplateSelect"
              @template-edited="handleTemplateEdit"
              @template-deleted="handleTemplateDelete"
            />
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6">
            <!-- <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Message History</h2>
              
              
              <div class="flex items-center space-x-3">
                <select 
                  v-model="historyFilter"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Messages</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
                
                <input
                  type="date"
                  v-model="dateFilter"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                
                <button
                  @click="exportHistory"
                  class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download class="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div> -->
            
            <MessageHistory 
              :filter="historyFilter"
              :date-filter="dateFilter"
              @resend-message="handleResendMessage"
              @view-details="handleViewDetails"
            />
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Message Statistics -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Message Statistics</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Messages Sent Today</span>
                <span class="font-semibold text-gray-900">{{ analytics.today }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">This Week</span>
                <span class="font-semibold text-gray-900">{{ analytics.week }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">This Month</span>
                <span class="font-semibold text-gray-900">{{ analytics.month }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Delivery Rate</span>
                <span class="font-semibold text-green-600">{{ analytics.deliveryRate }}%</span>
              </div>
            </div>
          </div>

          <!-- Popular Templates -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Popular Templates</h3>
            <div class="space-y-3">
              <div 
                v-for="template in popularTemplates" 
                :key="template.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div class="font-medium text-gray-900">{{ template.name }}</div>
                  <div class="text-sm text-gray-500">{{ template.category }}</div>
                </div>
                <div class="text-sm font-medium text-indigo-600">
                  {{ template.usage }} uses
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <div 
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  activity.type === 'sent' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'delivered' ? 'bg-green-100 text-green-600' :
                  'bg-red-100 text-red-600'
                ]"
              >
                <Mail class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ activity.message }}</div>
                <div class="text-sm text-gray-500">{{ activity.time }}</div>
              </div>
              <div 
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  activity.type === 'sent' ? 'bg-blue-100 text-blue-800' :
                  activity.type === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                ]"
              >
                {{ activity.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div 
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 z-50"
    >
      <div class="flex items-center space-x-2">
        <CheckCircle class="w-5 h-5" />
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTempleStore } from '@/stores/temple'
import api from '@/plugins/axios'
import { 
  Mail, 
  Users, 
  FileText, 
  Clock, 
  BarChart3, 
  Plus, 
  Download,
  CheckCircle
} from 'lucide-vue-next'

// Import communication components
import MessageComposer from '@/components/communication/MessageComposer.vue'
import MessageTemplates from '@/components/communication/MessageTemplates.vue'
import BulkMessage from '@/components/communication/BulkMessage.vue'
import MessageHistory from '@/components/communication/MessageHistory.vue'

// Route and store
const route = useRoute()
const templeStore = useTempleStore()
const showLogoModal = ref(false)
const temple = ref(null)

// ✅ Computed templeId
const templeId = computed(() =>
  route.params.id || route.params.templeId || route.query.templeId || localStorage.getItem('current_entity_id')
)


// Load temple data
// Replace your existing loadTempleData function with this:
const loadTempleData = async () => {
  try {
    const fetchedTemple = await templeStore.getTempleById(templeId.value)
    if (fetchedTemple) {
      temple.value = fetchedTemple
      
      // Extract media URLs
      const media = extractTempleMedia(fetchedTemple)
      templeLogo.value = media.logo
      templeVideo.value = media.video
      
      console.log('✅ Temple logo URL:', templeLogo.value)
      console.log('✅ Temple video URL:', templeVideo.value)
    }
  } catch (error) {
    console.error('Error loading temple data:', error)
    toast.error('Failed to load temple details')
  }
}
// Reactive state
const activeTab = ref('compose')
const historyFilter = ref('all')
const dateFilter = ref('')
const showCreateTemplate = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
// Add these new refs after the existing refs
const templeLogo = ref(null)
const templeVideo = ref(null)
const showVideoModal = ref(false)
const videoPlayer = ref(null)

const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE_URL

// Stats data
const stats = reactive({
  totalMessages: 1247,
  deliveredMessages: 1195,
  activeTemplates: 12
})

// Analytics data
const analytics = reactive({
  today: 23,
  week: 156,
  month: 678,
  deliveryRate: 95.8
})

// Tab configuration
const tabs = computed(() => [
  { id: 'compose', name: 'Compose', icon: Mail, count: null },
  // { id: 'bulk', name: 'Bulk Message', icon: Users, count: null },
  { id: 'templates', name: 'Templates', icon: FileText, count: stats.activeTemplates }
  // { id: 'history', name: 'History', icon: Clock, count: stats.totalMessages },
  // { id: 'analytics', name: 'Analytics', icon: BarChart3, count: null }
])

// Popular templates data
const popularTemplates = ref([
  { id: 1, name: 'Seva Reminder', category: 'Seva', usage: 89 },
  { id: 2, name: 'Festival Invitation', category: 'Event', usage: 67 },
  { id: 3, name: 'Donation Receipt', category: 'Finance', usage: 45 },
  { id: 4, name: 'Welcome Message', category: 'General', usage: 34 }
])

// Recent activity data
const recentActivity = ref([
  { id: 1, message: 'Bulk message sent to 45 devotees about upcoming Diwali celebration', time: '2 hours ago', type: 'sent', status: 'Sent' },
  { id: 2, message: 'Seva reminder delivered to all registered volunteers', time: '4 hours ago', type: 'delivered', status: 'Delivered' },
  { id: 3, message: 'Welcome message sent to new devotee registrations', time: '6 hours ago', type: 'delivered', status: 'Delivered' },
  { id: 4, message: 'Event notification failed to deliver to 3 recipients', time: '1 day ago', type: 'failed', status: 'Failed' }
])

// Event handlers
const handleMessageSent = (messageData) => {
  stats.totalMessages++
  stats.deliveredMessages++
  showToastMessage('Message sent successfully!')
}

const handleBulkSent = (bulkData) => {
  stats.totalMessages += bulkData.recipientCount
  stats.deliveredMessages += bulkData.deliveredCount
  showToastMessage(`Bulk message sent to ${bulkData.recipientCount} recipients!`)
}

const handleSaveTemplate = (templateData) => {
  stats.activeTemplates++
  showToastMessage('Template saved successfully!')
}

const handleTemplateSelect = (template) => {
  activeTab.value = 'compose'
}

const handleTemplateEdit = (template) => {
  showToastMessage('Template updated successfully!')
}

const handleTemplateDelete = (templateId) => {
  stats.activeTemplates--
  showToastMessage('Template deleted successfully!')
}

const handlePreviewRequest = (previewData) => {
  console.log('Preview requested:', previewData)
}

const handleResendMessage = (messageId) => {
  showToastMessage('Message resent successfully!')
}

const handleViewDetails = (messageId) => {
  console.log('View details for message:', messageId)
}

// Helper function to construct full media URL
const getFullMediaUrl = (path) => {
  if (!path) return null
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BACKEND_ORIGIN}${cleanPath}`
}

// Open logo modal
const openLogoModal = () => {
  const { logo } = getTempleMedia()
  if (logo) {
    showLogoModal.value = true
  } else {
    console.log('Temple logo not available')
  }
}

// Close logo modal
const closeLogoModal = () => {
  showLogoModal.value = false
}
// Extract media from temple data
const extractTempleMedia = (templeData) => {
  if (!templeData) return { logo: null, video: null }
  
  console.log('🔍 Extracting media from temple data:', templeData)
  
  let logo = null
  let video = null
  
  if (templeData.media) {
    try {
      const media = typeof templeData.media === 'string' 
        ? JSON.parse(templeData.media) 
        : templeData.media
      
      logo = media.logo || media.Logo || media.logo_url || media.logoUrl
      video = media.video || media.Video || media.video_url || media.videoUrl || media.intro_video_url
    } catch (e) {
      console.warn('⚠️ Error parsing media JSON:', e)
    }
  }
  
  if (!logo) {
    logo = templeData.logo_url || templeData.logoUrl || templeData.logo || templeData.Logo
  }
  if (!video) {
    video = templeData.intro_video_url || templeData.videoUrl || templeData.video || templeData.Video
  }
  
  const result = {
    logo: logo ? getFullMediaUrl(logo) : null,
    video: video ? getFullMediaUrl(video) : null
  }
  
  console.log('✅ Extracted media:', result)
  return result
}

// Open temple video modal
const openTempleVideo = () => {
  if (templeVideo.value) {
    showVideoModal.value = true
  } else {
    console.log('Temple video not available')
  }
}

// Close video modal
const closeVideoModal = () => {
  showVideoModal.value = false
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.currentTime = 0
  }
}

// Handle logo error
const handleLogoError = (event) => {
  console.error('Temple logo failed to load:', event.target.src)
  event.target.style.display = 'none'
}

// Handle video error
const handleVideoError = (event) => {
  console.error('Temple video failed to load:', event.target.src)
  toast.error('Failed to load temple video')
}

const exportHistory = () => {
  showToastMessage('Export started! Check your downloads.')
}

const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

// Load initial data on mount
onMounted(() => {
  loadTempleData()
  console.log('Communication Center loaded for temple:', templeId.value)
})
</script>
