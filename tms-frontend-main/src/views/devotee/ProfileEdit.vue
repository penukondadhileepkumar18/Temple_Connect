<template>
  <div class="profile-edit-container min-h-screen bg-gray-50">
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
              <h2 class="text-lg font-semibold text-gray-900">
                {{ currentTemple.name || 'Temple' }}
              </h2>
              <p class="text-sm text-gray-500" v-if="currentTemple.city || currentTemple.state">
                {{ currentTemple.city }}{{ currentTemple.city && currentTemple.state ? ', ' : '' }}{{ currentTemple.state }}
              </p>
            </div>
          </div>
          
          <!-- User Info -->
          <div class="flex items-center space-x-3">
            <div class="text-right hidden sm:block">
              <p class="text-gray-900 font-medium text-sm">{{ currentUser.name || 'Devotee' }}</p>
              <p class="text-gray-500 text-xs">{{ currentUser.email || '' }}</p>
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

    <div class="max-w-4xl mx-auto py-8 px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
        <p class="text-gray-600">Update your personal and spiritual information</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-3 text-gray-600">Loading profile...</span>
      </div>

      <!-- Main Content -->
      <div v-if="!isLoading">
        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-indigo-600">Profile Completion</span>
            <span class="text-sm text-gray-500">{{ completionPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: completionPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Multi-step Form -->
        <div class="bg-white rounded-lg shadow-sm border">
          <!-- Step Navigation -->
          <div class="border-b border-gray-200 px-6 py-4">
            <nav class="flex space-x-8 overflow-x-auto">
              <button
                v-for="(step, index) in steps"
                :key="step.id"
                @click="currentStep = index"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentStep === index
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ step.title }}
              </button>
            </nav>
          </div>

          <!-- Step Content -->
          <div class="p-6">
            <!-- Personal Details -->
            <div v-if="currentStep === 0" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    v-model="profile.fullName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    v-model="profile.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    v-model="profile.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    v-model="profile.dateOfBirth"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    v-model="profile.gender"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  v-model="profile.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your complete address"
                ></textarea>
              </div>
            </div>

            <!-- Spiritual Information -->
            <div v-if="currentStep === 1" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Spiritual Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gotra</label>
                  <input
                    v-model="profile.gotra"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your gotra"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nakshatra</label>
                  <input
                    v-model="profile.nakshatra"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your nakshatra"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rashi</label>
                  <input
                    v-model="profile.rashi"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your rashi"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                  <select
                    v-model="profile.preferredLanguage"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Language</option>
                    <option value="kannada">Kannada</option>
                    <option value="hindi">Hindi</option>
                    <option value="sanskrit">Sanskrit</option>
                    <option value="tamil">Tamil</option>
                    <option value="telugu">Telugu</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Family Information -->
            <div v-if="currentStep === 2" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Family Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  <input
                    v-model="profile.fatherName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter father's name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                  <input
                    v-model="profile.motherName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter mother's name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                  <input
                    v-model="profile.spouseName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter spouse name (if applicable)"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                  <input
                    v-model="profile.numberOfChildren"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <!-- Preferences -->
            <div v-if="currentStep === 3" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Seva Preferences</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Preferred Sevas</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label
                    v-for="seva in sevaTypes"
                    :key="seva.id"
                    class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="seva.id"
                      v-model="profile.preferredSevas"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">{{ seva.name }}</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Notification Preferences</label>
                <div class="space-y-3">
                  <label class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      v-model="profile.emailNotifications"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">Email notifications for events and sevas</span>
                  </label>
                  <label class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      v-model="profile.smsNotifications"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">SMS notifications for important updates</span>
                  </label>
                  <label class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      v-model="profile.whatsappNotifications"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">WhatsApp notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              v-if="currentStep > 0"
              @click="currentStep--"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Previous
            </button>
            <div v-else></div>
            
            <div class="flex space-x-3">
              <button
                @click="saveProfile"
                :disabled="isSaving"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span v-if="isSaving">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
              
              <button
                v-if="currentStep < steps.length - 1"
                @click="currentStep++"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import devoteeService from '@/services/devotee.service'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

// Current step
const currentStep = ref(0)
const isSaving = ref(false)
const isLoading = ref(false)

// Temple and User info
const currentTemple = ref({
  name: '',
  city: '',
  state: ''
})

const currentUser = ref({
  name: '',
  email: ''
})

// Steps configuration
const steps = ref([
  { id: 'personal', title: 'Personal' },
  { id: 'spiritual', title: 'Spiritual' },
  { id: 'family', title: 'Family' },
  { id: 'preferences', title: 'Preferences' }
])

// Profile data - Initialize with empty values
const profile = ref({
  fullName: '',
  email: '',
  dateOfBirth: '',
  phone: '',
  gender: '',
  address: '',
  gotra: '',
  nakshatra: '',
  rashi: '',
  preferredLanguage: '',
  fatherName: '',
  motherName: '',
  spouseName: '',
  numberOfChildren: 0,
  preferredSevas: [],
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: false
})

// Seva types (static data)
const sevaTypes = ref([
  { id: 'abhisheka', name: 'Abhisheka' },
  { id: 'archana', name: 'Archana' },
  { id: 'annadana', name: 'Annadana' },
  { id: 'pradakshina', name: 'Pradakshina' },
  { id: 'bhajan', name: 'Bhajan' },
  { id: 'cleaning', name: 'Cleaning' }
])

// Computed properties
const completionPercentage = computed(() => {
  const fields = [
    profile.value.fullName,
    profile.value.email,
    profile.value.dateOfBirth,
    profile.value.phone,
    profile.value.gender,
    profile.value.address,
    profile.value.gotra,
    profile.value.preferredLanguage
  ]
  
  const filledFields = fields.filter(field => field && field.toString().trim() !== '').length
  return Math.round((filledFields / fields.length) * 100)
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

// Helper function to format date for input field
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch (err) {
    console.error('Error formatting date:', err)
    return ''
  }
}

// Helper function to get seva preferences from API data
const getSevaPreferences = (data) => {
  const sevas = []
  if (data.seva_abhisheka) sevas.push('abhisheka')
  if (data.seva_archana) sevas.push('archana')
  if (data.seva_annadana) sevas.push('annadana')
  if (data.seva_pradakshina) sevas.push('pradakshina')
  if (data.seva_bhajan) sevas.push('bhajan')
  if (data.seva_cleaning) sevas.push('cleaning')
  return sevas
}

// Methods
const loadProfile = async () => {
  try {
    isLoading.value = true
    
    console.log('Loading profile data...')
    const response = await devoteeService.getProfile()
    
    if (response && response.data) {
      const data = response.data
      console.log('Profile data received:', data)
      
      // Build address string from components
      const addressParts = []
      if (data.street_address) addressParts.push(data.street_address)
      if (data.city) addressParts.push(data.city)
      if (data.state) addressParts.push(data.state)
      if (data.pincode) addressParts.push(data.pincode)
      
      // Map API response to form fields
      profile.value = {
        fullName: data.full_name || '',
        email: data.email || '',
        dateOfBirth: formatDateForInput(data.dob),
        phone: data.phone || '',
        gender: data.gender || '',
        address: addressParts.join(', '),
        gotra: data.gotra || '',
        nakshatra: data.nakshatra || '',
        rashi: data.rashi || '',
        preferredLanguage: data.preferred_language || '',
        fatherName: data.father_name || '',
        motherName: data.mother_name || '',
        spouseName: data.spouse_name || '',
        numberOfChildren: data.number_of_children || 0,
        preferredSevas: getSevaPreferences(data),
        emailNotifications: data.email_notifications !== false,
        smsNotifications: data.sms_notifications !== false,
        whatsappNotifications: data.whatsapp_notifications === true
      }
      
      console.log('Profile mapped to form:', profile.value)
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    // Silently handle errors - just keep empty form for new users
  } finally {
    isLoading.value = false
  }
}

const saveProfile = async () => {
  try {
    isSaving.value = true
    
    console.log('Saving profile data:', profile.value)
    
    // Convert form data to API format - only include non-empty values
    const profileData = {}
    
    // Add only filled fields
    if (profile.value.fullName?.trim()) profileData.full_name = profile.value.fullName.trim()
    if (profile.value.email?.trim()) profileData.email = profile.value.email.trim()
    
    if (profile.value.dateOfBirth) {
      // Convert date to ISO 8601 format with time
      const date = new Date(profile.value.dateOfBirth + 'T00:00:00')
      profileData.dob = date.toISOString()
    }
    
    if (profile.value.phone?.trim()) profileData.phone = profile.value.phone.trim()
    if (profile.value.gender) profileData.gender = profile.value.gender
    
    // Address - send the full address as street_address
    if (profile.value.address?.trim()) {
      profileData.street_address = profile.value.address.trim()
      profileData.country = 'India'
    }
    
    // Spiritual information
    if (profile.value.gotra?.trim()) profileData.gotra = profile.value.gotra.trim()
    if (profile.value.nakshatra?.trim()) profileData.nakshatra = profile.value.nakshatra.trim()
    if (profile.value.rashi?.trim()) profileData.rashi = profile.value.rashi.trim()
    if (profile.value.preferredLanguage) profileData.preferred_language = profile.value.preferredLanguage
    
    // Family information
    if (profile.value.fatherName?.trim()) profileData.father_name = profile.value.fatherName.trim()
    if (profile.value.motherName?.trim()) profileData.mother_name = profile.value.motherName.trim()
    if (profile.value.spouseName?.trim()) profileData.spouse_name = profile.value.spouseName.trim()
    if (profile.value.numberOfChildren) profileData.number_of_children = parseInt(profile.value.numberOfChildren)
    
    // Seva preferences
    profileData.seva_abhisheka = profile.value.preferredSevas.includes('abhisheka')
    profileData.seva_archana = profile.value.preferredSevas.includes('archana')
    profileData.seva_annadana = profile.value.preferredSevas.includes('annadana')
    profileData.seva_pradakshina = profile.value.preferredSevas.includes('pradakshina')
    profileData.seva_bhajan = profile.value.preferredSevas.includes('bhajan')
    profileData.seva_cleaning = profile.value.preferredSevas.includes('cleaning')
    
    // Notification preferences
    profileData.email_notifications = profile.value.emailNotifications
    profileData.sms_notifications = profile.value.smsNotifications
    profileData.whatsapp_notifications = profile.value.whatsappNotifications
    
    console.log('Sending profile data to API:', profileData)
    
    const response = await devoteeService.createOrUpdateProfile(profileData)
    console.log('Profile saved successfully:', response.data)
    
    showToast('Profile updated successfully!', 'success')
    
    // Redirect back to dashboard after successful save
    const entityId = route.params.id
    if (entityId) {
      router.push(`/entity/${entityId}/devotee/dashboard`)
    } else {
      router.push('/devotee/dashboard')
    }
    
  } catch (err) {
    console.error('Error saving profile:', err)
    const errorMessage = err.message || 'Error saving profile'
    showToast(errorMessage, 'error')
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 Edit Profile page mounted')
  
  // Load user and temple info first (synchronous from localStorage)
  fetchUserInfo()
  
  // Then fetch temple info (may include API call)
  await fetchTempleInfo()
  
  // Finally load profile data
  await loadProfile()
  
  console.log('✅ Page initialization complete', {
    temple: currentTemple.value,
    user: currentUser.value
  })
})
</script>

<style scoped>
.profile-edit-container {
  background-color: #f9fafb;
}
</style>