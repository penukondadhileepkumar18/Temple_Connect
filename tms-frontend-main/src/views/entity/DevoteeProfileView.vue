<template>
  <div class="min-h-screen bg-gray-50/90">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Devotee Profile</h2>
              <p class="text-sm text-gray-500">Complete devotee information</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col items-center justify-center space-y-4 py-12">
        <svg class="animate-spin h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Loading profile...</p>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Personal Information -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center mb-6">
          <div class="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
            <span class="text-3xl font-bold text-indigo-600">{{ getInitial(profile.full_name) }}</span>
          </div>
          <div>
            <h3 class="text-3xl font-bold text-gray-900">{{ profile.full_name || 'N/A' }}</h3>
            <p class="text-sm text-gray-500">User ID: #{{ profile.user_id }}</p>
            <span :class="getStatusClass(profile.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2">
              {{ profile.status || 'active' }}
            </span>
          </div>
        </div>
<!---->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!--
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 uppercase font-medium">Email</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.email || 'N/A' }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 uppercase font-medium">Phone</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.phone || 'N/A' }}</p>
          </div>
        -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 uppercase font-medium">Date of Birth</p>
            <p class="text-sm font-semibold text-gray-900">{{ formatDate(profile.dob) }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-xs text-gray-500 uppercase font-medium">Gender</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.gender || 'N/A' }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <p class="text-xs text-gray-500 uppercase font-medium">Address</p>
            <p class="text-sm font-semibold text-gray-900">{{ formatAddress(profile) }}</p>
          </div>
        </div>
      </div>

      <!-- Spiritual Information -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg class="h-6 w-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          Spiritual Information
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-xs text-purple-600 uppercase font-medium">Gotra</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.gotra || 'N/A' }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-xs text-purple-600 uppercase font-medium">Nakshatra</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.nakshatra || 'N/A' }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-xs text-purple-600 uppercase font-medium">Rashi</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.rashi || 'N/A' }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-xs text-purple-600 uppercase font-medium">Lagna</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.lagna || 'N/A' }}</p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg md:col-span-2">
            <p class="text-xs text-purple-600 uppercase font-medium">Veda Shaka</p>
            <p class="text-sm font-semibold text-gray-900">{{ profile.veda_shaka || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Seva Preferences -->
      <div v-if="hasSevaPreferences" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg class="h-6 w-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Seva & Donation Preferences
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div v-if="profile.seva_abhisheka" class="flex items-center text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">
            <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Abhisheka
          </div>
          <div v-if="profile.seva_arti" class="flex items-center text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">
            <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Arti
          </div>
          <div v-if="profile.seva_annadana" class="flex items-center text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">
            <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Annadana
          </div>
          <div v-if="profile.seva_archana" class="flex items-center text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">
            <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Archana
          </div>
        </div>
      </div>

      <!-- Family Lineage -->
      <div v-if="hasFamilyInfo" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg class="h-6 w-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Family Lineage
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="profile.father_name" class="border border-gray-200 p-4 rounded-lg">
            <p class="text-sm font-semibold text-gray-700 mb-3">Father</p>
            <div class="space-y-2 text-sm">
              <p><span class="text-gray-500">Name:</span> <span class="font-medium">{{ profile.father_name }}</span></p>
              <p v-if="profile.father_gotra"><span class="text-gray-500">Gotra:</span> <span class="font-medium">{{ profile.father_gotra }}</span></p>
            </div>
          </div>
          <div v-if="profile.mother_name" class="border border-gray-200 p-4 rounded-lg">
            <p class="text-sm font-semibold text-gray-700 mb-3">Mother</p>
            <div class="space-y-2 text-sm">
              <p><span class="text-gray-500">Name:</span> <span class="font-medium">{{ profile.mother_name }}</span></p>
            </div>
          </div>
        </div>
      </div>

     
    </div>

    <!-- Error State -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Devotee has not created their complete profile</h3>
        <p class="mt-2 text-sm text-gray-500">The devotee profile is not created.</p>
        <button @click="goBack" class="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'

export default {
  name: 'DevoteeProfileView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const profile = ref(null)
    const loading = ref(true)

    const entityId = computed(() => route.params.id)
    const devoteeId = computed(() => route.params.devoteeId)

    const getInitial = (name) => {
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        return new Date(dateString).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch {
        return 'N/A'
      }
    }

    const formatAddress = (profile) => {
      if (!profile) return 'N/A'
      const parts = [profile.street_address, profile.city, profile.state, profile.pincode].filter(Boolean)
      return parts.length > 0 ? parts.join(', ') : 'N/A'
    }

    const getStatusClass = (status) => {
      const s = (status || 'active').toLowerCase()
      return s === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }

    const hasSevaPreferences = computed(() => {
      return profile.value?.seva_abhisheka || profile.value?.seva_arti || 
             profile.value?.seva_annadana || profile.value?.seva_archana
    })

    const hasFamilyInfo = computed(() => {
      return profile.value?.father_name || profile.value?.mother_name
    })

    const loadProfile = async () => {
      loading.value = true
      try {
        console.log('🔍 Loading profile:', { entityId: entityId.value, devoteeId: devoteeId.value })
        const response = await api.get(`/entities/${entityId.value}/devotees/${devoteeId.value}/profile`)
        if (response.data) {
          profile.value = response.data
          console.log('✅ Profile loaded:', response.data)
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error)
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.push({ name: 'DevoteeManagement', params: { id: entityId.value } })
    }

    onMounted(() => {
      if (!entityId.value || !devoteeId.value) {
        goBack()
        return
      }
      loadProfile()
    })

    return {
      profile,
      loading,
      getInitial,
      formatDate,
      formatAddress,
      getStatusClass,
      hasSevaPreferences,
      hasFamilyInfo,
      goBack
    }
  }
}
</script>