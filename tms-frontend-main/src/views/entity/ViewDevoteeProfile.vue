<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Devotee Profile</h1>
          <p class="text-sm text-gray-600 mt-1">
            Viewing profile for User ID: {{ userId }}
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            @click="goBackToList"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <span class="mt-4 block text-gray-600">Loading profile...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div class="flex items-start">
          <svg class="h-6 w-6 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-800 mb-1">Error Loading Profile</h3>
            <p class="text-red-700">{{ error }}</p>
            <button
              @click="retryLoad"
              class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-if="!loading && profile.id" class="space-y-6">
        
        <!-- Profile Completion Banner -->
        <div v-if="profile.profile_completion_percentage !== undefined" 
             class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-1">Profile Completion</h3>
              <p class="text-indigo-100 text-sm">
                {{ profile.profile_completion_percentage }}% Complete
              </p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold">{{ profile.profile_completion_percentage }}%</div>
            </div>
          </div>
          <div class="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              class="bg-white h-full rounded-full transition-all duration-500"
              :style="{ width: `${profile.profile_completion_percentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Personal Information Card -->
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Full Name" :value="profile.full_name" />
              <InfoField label="Gender" :value="formatGender(profile.gender)" />
              <InfoField label="Date of Birth" :value="formatDate(profile.dob)" />
              <InfoField label="Email" :value="profile.email" icon="mail" />
              <InfoField label="Phone" :value="profile.phone" icon="phone" />
              <InfoField label="User ID" :value="profile.user_id" badge />
            </div>
            
            <div v-if="hasAddress" class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address
              </h3>
              <div class="bg-gray-50 rounded-lg p-4 text-gray-700">
                <div v-if="profile.street_address" class="mb-1">{{ profile.street_address }}</div>
                <div>{{ [profile.city, profile.state, profile.pincode].filter(Boolean).join(', ') }}</div>
                <div v-if="profile.country" class="mt-1 text-gray-600">{{ profile.country }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spiritual Information Card -->
        <div v-if="hasSpiritualInfo" class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Spiritual Information
            </h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Gotra" :value="profile.gotra" />
              <InfoField label="Nakshatra" :value="profile.nakshatra" />
              <InfoField label="Rashi" :value="profile.rashi" />
              <InfoField label="Lagna" :value="profile.lagna" />
              <InfoField label="Veda Shaka" :value="profile.veda_shaka" />
            </div>
          </div>
        </div>

        <!-- Family Lineage Card -->
        <div v-if="hasFamilyLineage" class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Family Lineage
            </h2>
          </div>
          <div class="p-6">
            <!-- Parents Section -->
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Parents</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InfoField label="Father's Name" :value="profile.father_name" />
                  <InfoField label="Father's Gotra" :value="profile.father_gotra" />
                  <InfoField label="Father's Native Place" :value="profile.father_native_place" />
                  <InfoField label="Father's Veda Shaka" :value="profile.father_veda_shaka" />
                </div>
                <div>
                  <InfoField label="Mother's Name" :value="profile.mother_name" />
                  <InfoField label="Maiden Gotra" :value="profile.maiden_gotra" />
                  <InfoField label="Mother's Native Place" :value="profile.mother_native_place" />
                </div>
              </div>
            </div>

            <!-- Grandparents Section -->
            <div v-if="hasGrandparents" class="pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Grandparents</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Paternal Grandfather" :value="profile.paternal_grandfather_name" />
                <InfoField label="Paternal Grandmother" :value="profile.paternal_grandmother_name" />
                <InfoField label="Maternal Grandfather" :value="profile.maternal_grandfather_name" />
                <InfoField label="Maternal Grandmother" :value="profile.maternal_grandmother_name" />
              </div>
            </div>
          </div>
        </div>

        <!-- Spouse & Children Card -->
        <div v-if="hasSpouseOrChildren" class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Spouse & Children
            </h2>
          </div>
          <div class="p-6">
            <!-- Spouse Information -->
            <div v-if="hasSpouse" class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Spouse Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoField label="Name" :value="profile.spouse_name" />
                <InfoField label="Email" :value="profile.spouse_email" icon="mail" />
                <InfoField label="Phone" :value="profile.spouse_phone" icon="phone" />
                <InfoField label="Date of Birth" :value="formatDate(profile.spouse_dob)" />
                <InfoField label="Gotra" :value="profile.spouse_gotra" />
                <InfoField label="Nakshatra" :value="profile.spouse_nakshatra" />
              </div>
            </div>

            <!-- Children Information -->
            <div v-if="profile.children && profile.children.length > 0" class="pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">
                Children ({{ profile.children.length }})
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(child, index) in profile.children"
                  :key="index"
                  class="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div class="flex items-center gap-2 mb-3">
                    <div class="bg-pink-100 text-pink-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      {{ index + 1 }}
                    </div>
                    <h4 class="font-medium text-gray-900">{{ child.name || 'Child ' + (index + 1) }}</h4>
                  </div>
                  <div class="space-y-2 text-sm">
                    <div v-if="child.dob" class="flex items-center text-gray-600">
                      <span class="font-medium w-20">DOB:</span>
                      <span>{{ formatDate(child.dob) }}</span>
                    </div>
                    <div v-if="child.gender" class="flex items-center text-gray-600">
                      <span class="font-medium w-20">Gender:</span>
                      <span>{{ formatGender(child.gender) }}</span>
                    </div>
                    <div v-if="child.gotra" class="flex items-center text-gray-600">
                      <span class="font-medium w-20">Gotra:</span>
                      <span>{{ child.gotra }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seva & Donation Preferences Card -->
        <div v-if="hasSevaOrDonationPreferences" class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Seva & Donation Preferences
            </h2>
          </div>
          <div class="p-6">
            <!-- Seva Preferences -->
            <div v-if="sevaPreferences.length > 0" class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Seva Interests</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="seva in sevaPreferences"
                  :key="seva"
                  class="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {{ formatSevaName(seva) }}
                </span>
              </div>
            </div>

            <!-- Donation Preferences -->
            <div v-if="donationPreferences.length > 0" class="pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Donation Interests</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="donation in donationPreferences"
                  :key="donation"
                  class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {{ formatDonationName(donation) }}
                </span>
              </div>
            </div>

            <!-- Special Interests -->
            <div v-if="profile.special_interests_or_notes" class="pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Special Interests & Notes</h3>
              <p class="text-gray-700 bg-gray-50 rounded-lg p-4">{{ profile.special_interests_or_notes }}</p>
            </div>
          </div>
        </div>

        <!-- Emergency Contacts Card -->
        <div v-if="profile.emergency_contacts && profile.emergency_contacts.length > 0" class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emergency Contacts
            </h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(contact, index) in profile.emergency_contacts"
                :key="index"
                class="bg-red-50 rounded-lg p-4 border border-red-200"
              >
                <div class="flex items-center gap-2 mb-3">
                  <div class="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                    {{ index + 1 }}
                  </div>
                  <h4 class="font-medium text-gray-900">{{ contact.name || 'Emergency Contact ' + (index + 1) }}</h4>
                </div>
                <div class="space-y-2 text-sm">
                  <div v-if="contact.relationship" class="flex items-center text-gray-600">
                    <span class="font-medium w-28">Relationship:</span>
                    <span>{{ contact.relationship }}</span>
                  </div>
                  <div v-if="contact.phone" class="flex items-center text-gray-600">
                    <span class="font-medium w-28">Phone:</span>
                    <span>{{ contact.phone }}</span>
                  </div>
                  <div v-if="contact.email" class="flex items-center text-gray-600">
                    <span class="font-medium w-28">Email:</span>
                    <span>{{ contact.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Health & Additional Information Card -->
        <div v-if="hasHealthOrAdditionalInfo" class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Health & Additional Information
            </h2>
          </div>
          <div class="p-6 space-y-4">
            <InfoField 
              v-if="profile.health_notes" 
              label="Health Notes" 
              :value="profile.health_notes" 
              multiline 
            />
            <InfoField 
              v-if="profile.allergies_or_conditions" 
              label="Allergies/Conditions" 
              :value="profile.allergies_or_conditions" 
              multiline 
            />
            <InfoField 
              v-if="profile.dietary_restrictions" 
              label="Dietary Restrictions" 
              :value="profile.dietary_restrictions" 
              multiline 
            />
            <InfoField 
              v-if="profile.personal_sankalpa" 
              label="Personal Sankalpa" 
              :value="profile.personal_sankalpa" 
              multiline 
            />
            <InfoField 
              v-if="profile.additional_notes" 
              label="Additional Notes" 
              :value="profile.additional_notes" 
              multiline 
            />
          </div>
        </div>

        <!-- Account Information Card -->
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account Information
            </h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField label="Profile ID" :value="profile.id" badge />
              <InfoField label="User ID" :value="profile.user_id" badge />
              <InfoField label="Entity ID" :value="profile.entity_id" badge />
              <InfoField label="Created At" :value="formatDate(profile.created_at)" />
              <InfoField label="Last Updated" :value="formatDate(profile.updated_at)" />
              <div>
                <span class="text-sm font-medium text-gray-600 block mb-1">Status</span>
                <span 
                  :class="[
                    'inline-flex px-3 py-1 rounded-full text-sm font-medium',
                    profile.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ profile.status || 'Active' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Profile Found State -->
      <div v-if="!loading && !profile.id && !error" class="bg-white shadow-lg rounded-lg p-12 text-center">
        <div class="text-gray-400 mb-6">
          <svg class="h-24 w-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-800 mb-2">No Profile Found</h3>
        <p class="text-gray-600 mb-6">This user has not created a profile yet.</p>
        <button
          @click="goBackToList"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Devotees List
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

// Props
const userId = computed(() => route.query.userId || route.params.userId)

// State
const loading = ref(false)
const error = ref(null)
const profile = ref({})

// Computed Properties
const hasAddress = computed(() => {
  return profile.value.street_address || 
         profile.value.city || 
         profile.value.state || 
         profile.value.pincode || 
         profile.value.country
})

const hasSpiritualInfo = computed(() => {
  return profile.value.gotra || 
         profile.value.nakshatra || 
         profile.value.rashi || 
         profile.value.lagna || 
         profile.value.veda_shaka
})

const hasFamilyLineage = computed(() => {
  return profile.value.father_name || 
         profile.value.mother_name || 
         profile.value.father_gotra ||
         profile.value.maiden_gotra ||
         hasGrandparents.value
})

const hasGrandparents = computed(() => {
  return profile.value.paternal_grandfather_name ||
         profile.value.paternal_grandmother_name ||
         profile.value.maternal_grandfather_name ||
         profile.value.maternal_grandmother_name
})

const hasSpouse = computed(() => {
  return profile.value.spouse_name || 
         profile.value.spouse_email ||
         profile.value.spouse_phone
})

const hasSpouseOrChildren = computed(() => {
  return hasSpouse.value || (profile.value.children && profile.value.children.length > 0)
})

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

const donationPreferences = computed(() => {
  const donations = []
  if (profile.value.donate_temple_maintenance) donations.push('temple_maintenance')
  if (profile.value.donate_annadana_program) donations.push('annadana_program')
  if (profile.value.donate_festival_celebrations) donations.push('festival_celebrations')
  if (profile.value.donate_religious_education) donations.push('religious_education')
  if (profile.value.donate_temple_construction) donations.push('temple_construction')
  if (profile.value.donate_general) donations.push('general')
  return donations
})

const hasSevaOrDonationPreferences = computed(() => {
  return sevaPreferences.value.length > 0 || 
         donationPreferences.value.length > 0 ||
         profile.value.special_interests_or_notes
})

const hasHealthOrAdditionalInfo = computed(() => {
  return profile.value.health_notes ||
         profile.value.allergies_or_conditions ||
         profile.value.dietary_restrictions ||
         profile.value.personal_sankalpa ||
         profile.value.additional_notes
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Not provided'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
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
  return seva.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatDonationName = (donation) => {
  return donation.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const loadProfile = async () => {
  if (!userId.value) {
    error.value = 'No user ID provided'
    return
  }

  try {
    loading.value = true
    error.value = null
    
    console.log('🔍 Loading profile for user ID:', userId.value)
    const response = await devoteeService.getProfileByUserId(userId.value)
    
    if (response && response.data) {
      profile.value = response.data
      console.log('✅ Profile loaded successfully:', profile.value)
    } else {
      console.log('⚠️ No profile data found')
      profile.value = {}
    }
  } catch (err) {
    console.error('❌ Error loading profile:', err)
    error.value = err.response?.data?.error || err.message || 'Failed to load profile'
    
    // Don't show toast for 404
    if (err.response?.status !== 404) {
      showToast(error.value, 'error')
    }
    profile.value = {}
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  loadProfile()
}

const goBackToList = () => {
  const entityId = route.params.id
  if (entityId) {
    router.push(`/entity/${entityId}/devotees`)
  } else {
    router.back()
  }
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>