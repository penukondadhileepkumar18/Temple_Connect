<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">My Profile</h1>
      
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600">Loading profile...</span>
    </div>

    <!-- Error State -->
    

    <!-- Profile Content -->
    <div v-if="!loading" class="space-y-6">
      <!-- Personal Information -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">Personal Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center">
            <span class="font-medium w-32">Name:</span>
            <span>{{ profile.full_name || 'Not provided' }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium w-32">Email:</span>
            <span>{{ userEmail || 'Not provided' }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium w-32">Role:</span>
            <span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {{ userRole || 'Devotee' }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="font-medium w-32">Phone:</span>
            <span>{{ profile.phone || 'Not provided' }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium w-32">Gender:</span>
            <span>{{ formatGender(profile.gender) }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium w-32">Date of Birth:</span>
            <span>{{ formatDate(profile.dob) }}</span>
          </div>
        </div>
        
        <div v-if="profile.street_address || profile.city" class="mt-4">
          <div class="flex items-start">
            <span class="font-medium w-32">Address:</span>
            <div>
              <div v-if="profile.street_address">{{ profile.street_address }}</div>
              <div>
                {{ [profile.city, profile.state, profile.pincode].filter(Boolean).join(', ') }}
              </div>
              <div v-if="profile.country">{{ profile.country }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spiritual Information -->
      <div v-if="hasSpiritualInfo" class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">Spiritual Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="profile.gotra" class="flex items-center">
            <span class="font-medium w-32">Gotra:</span>
            <span>{{ profile.gotra }}</span>
          </div>
          <div v-if="profile.nakshatra" class="flex items-center">
            <span class="font-medium w-32">Nakshatra:</span>
            <span>{{ profile.nakshatra }}</span>
          </div>
          <div v-if="profile.rashi" class="flex items-center">
            <span class="font-medium w-32">Rashi:</span>
            <span>{{ profile.rashi }}</span>
          </div>
          <div v-if="profile.lagna" class="flex items-center">
            <span class="font-medium w-32">Lagna:</span>
            <span>{{ profile.lagna }}</span>
          </div>
          <div v-if="profile.veda_shaka" class="flex items-center">
            <span class="font-medium w-32">Veda Shaka:</span>
            <span>{{ profile.veda_shaka }}</span>
          </div>
        </div>
      </div>

      <!-- Family Information -->
      <div v-if="hasFamilyInfo" class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">Family Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="profile.father_name" class="flex items-center">
            <span class="font-medium w-32">Father:</span>
            <span>{{ profile.father_name }}</span>
          </div>
          <div v-if="profile.mother_name" class="flex items-center">
            <span class="font-medium w-32">Mother:</span>
            <span>{{ profile.mother_name }}</span>
          </div>
          <div v-if="profile.spouse_name" class="flex items-center">
            <span class="font-medium w-32">Spouse:</span>
            <span>{{ profile.spouse_name }}</span>
          </div>
          <div v-if="profile.children && profile.children.length > 0" class="flex items-center">
            <span class="font-medium w-32">Children:</span>
            <span>{{ profile.children.length }}</span>
          </div>
        </div>
      </div>

      <!-- Seva Preferences -->
      <div v-if="sevaPreferences.length > 0" class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">Seva Preferences</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="seva in sevaPreferences"
            :key="seva"
            class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
          >
            {{ formatSevaName(seva) }}
          </span>
        </div>
      </div>

      

      <!-- Empty State for New Users -->
      <div v-if="isEmptyProfile" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div class="text-yellow-600 mb-4">
          <svg class="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-yellow-800 mb-2">Complete Your Profile</h3>
        <p class="text-yellow-700 mb-4">
          Your profile is mostly empty. Complete it to get the most out of your temple experience.
        </p>
        <button
          @click="editProfile"
          class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Complete Profile
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import devoteeService from '@/services/devotee.service'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

// State
const loading = ref(false)
const error = ref(null)
const profile = ref({})

// Get user data from localStorage for email/role
const userEmail = computed(() => {
  const userData = JSON.parse(localStorage.getItem('temple_user_data') || '{}')
  return userData.email || 'Not provided'
})

const userRole = computed(() => {
  const role = localStorage.getItem('temple_user_role')
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Devotee'
})

// Check if profile has spiritual information
const hasSpiritualInfo = computed(() => {
  return profile.value.gotra || 
         profile.value.nakshatra || 
         profile.value.rashi || 
         profile.value.lagna || 
         profile.value.veda_shaka
})

// Check if profile has family information
const hasFamilyInfo = computed(() => {
  return profile.value.father_name || 
         profile.value.mother_name || 
         profile.value.spouse_name || 
         (profile.value.children && profile.value.children.length > 0)
})

// Get seva preferences
const sevaPreferences = computed(() => {
  const sevas = []
  if (profile.value.seva_abhisheka) sevas.push('abhisheka')
  if (profile.value.seva_arti) sevas.push('arti')
  if (profile.value.seva_annadana) sevas.push('annadana')
  if (profile.value.seva_archana) sevas.push('archana')
  if (profile.value.seva_kalyanam) sevas.push('kalyanam')
  if (profile.value.seva_homam) sevas.push('homam')
  return sevas
})

// Check if profile is mostly empty
const isEmptyProfile = computed(() => {
  const essentialFields = [
    profile.value.full_name,
    profile.value.dob,
    profile.value.phone,
    profile.value.gotra
  ]
  return essentialFields.filter(Boolean).length < 2
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Not provided'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (err) {
    return 'Invalid date'
  }
}

const formatGender = (gender) => {
  if (!gender) return 'Not provided'
  return gender.charAt(0).toUpperCase() + gender.slice(1)
}

const formatSevaName = (seva) => {
  return seva.charAt(0).toUpperCase() + seva.slice(1)
}

const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Loading user profile...')
    const response = await devoteeService.getProfile()
    
    if (response && response.data) {
      profile.value = response.data
      console.log('Profile loaded:', profile.value)
    } else {
      console.log('No profile data found')
      profile.value = {}
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = err.message || 'Failed to load profile'
    
    // Don't show error toast for 404 (new user without profile)
    if (!err.message?.includes('404') && !err.message?.includes('not found')) {
      showToast(error.value, 'error')
    }
    profile.value = {}
  } finally {
    loading.value = false
  }
}

const editProfile = () => {
  const entityId = route.params.id
  if (entityId) {
    router.push(`/entity/${entityId}/devotee/profile/create`)
  } else {
    router.push('/devotee/profile/create')
  }
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>