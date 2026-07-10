<!-- eslint-disable no-unused-vars -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading Screen for Initial Load -->
    <div v-if="initialLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600 font-medium">Loading temple information...</p>
      </div>
    </div>

    <!-- Main Content (shows after initial load) -->
    <template v-else>
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
                <h1 class="text-lg font-semibold text-gray-900">
                  {{ currentTemple.name || 'Temple' }}
                </h1>
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

      <!-- Page Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-3xl font-bold text-gray-900">Book Seva</h2>
                <p class="mt-2 text-sm text-gray-600">Choose from available sevas and book your preferred time slots</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Filters and Search -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search Sevas</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by seva name..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Seva Type</label>
              <select
                v-model="selectedCategory"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Seva Type</option>
                <option value="daily">Daily Seva</option>
                <option value="special">Special Seva</option>
                <option value="festival">Festival Seva</option>
                <option value="personal">Personal Seva</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                v-model="priceRange"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Prices</option>
                <option value="0-500">₹0 - ₹500</option>
                <option value="500-1000">₹500 - ₹1,000</option>
                <option value="1000-5000">₹1,000 - ₹5,000</option>
                <option value="5000+">₹5,000+</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading sevas...</p>
          </div>
        </div>

        <!-- No Sevas Available -->
        <div v-else-if="filteredSevas.length === 0" class="text-center py-12">
          <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Sevas Available</h3>
          <p class="text-gray-500 mb-4">No sevas match your current filters or none have been added by the temple yet.</p>
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <!-- Seva Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="seva in filteredSevas"
            :key="seva.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <!-- Seva Image -->
            <div class="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
              <img
                v-if="seva.image"
                :src="seva.image"
                :alt="seva.name"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black bg-opacity-20"></div>
              <div class="absolute top-4 right-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    seva.seva_type === 'daily' ? 'bg-green-100 text-green-800' :
                    seva.seva_type === 'special' ? 'bg-blue-100 text-blue-800' :
                    seva.seva_type === 'festival' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ seva.seva_type }}
                </span>
              </div>
            </div>

            <!-- Seva Content -->
            <div class="p-6">
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold text-gray-900">{{ seva.name }}</h3>
                <div class="text-right">
                  <p class="text-xl font-bold text-indigo-600">₹{{ seva.price.toLocaleString() }}</p>
                  <p v-if="seva.originalPrice && seva.originalPrice > seva.price" class="text-sm text-gray-500 line-through">
                    ₹{{ seva.originalPrice.toLocaleString() }}
                  </p>
                </div>
              </div>

              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ seva.description }}</p>

              <!-- Seva Details -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Duration: {{ seva.duration }} minutes
                </div>
                
                <!-- Show slot information from backend -->
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>Slots:</span>
                  </div>
                  <div class="text-right">
                    <span class="font-medium" :class="getRemainingSlots(seva) > 0 ? 'text-green-600' : 'text-red-600'">
                      {{ getRemainingSlots(seva) }} / {{ getAvailableSlots(seva) }}
                    </span>
                    <span class="text-gray-500 text-xs ml-1">available</span>
                  </div>
                </div>
                
                <!-- Show booked slots -->
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Booked: {{ getBookedSlots(seva) }} slots
                </div>
                
                <div v-if="seva.date" class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Date: {{ formatDate(seva.date) }}
                </div>
                <div v-if="seva.start_time && seva.end_time" class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Time: {{ seva.start_time }} - {{ seva.end_time }}
                </div>
              </div>

              <!-- Action Button -->
              <button
                @click="directBookSeva(seva)"
                :disabled="bookedSevas[seva.id] || bookingInProgress[seva.id] || getRemainingSlots(seva) === 0"
                :class="[
                  'w-full py-3 px-4 rounded-lg font-medium transition-colors',
                  bookingInProgress[seva.id] ? 'bg-gray-400 text-white cursor-wait' :
                  bookedSevas[seva.id] ? 'bg-green-600 text-white cursor-default' :
                  getRemainingSlots(seva) > 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                {{ bookingInProgress[seva.id] ? 'Processing...' :
                   bookedSevas[seva.id] ? 'Seva Booked ✓' : 
                   getRemainingSlots(seva) > 0 ? 'Book Now' : 'Fully Booked' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSevaStore } from '@/stores/seva'
import { useToast } from '@/composables/useToast'
import sevaService from '@/services/seva.service'
import api from '@/plugins/axios'

const route = useRoute()
// eslint-disable-next-line no-unused-vars
const router = useRouter()
const sevaStore = useSevaStore()
const toast = useToast()

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Reactive data
const initialLoading = ref(true)
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedDate = ref('')
const priceRange = ref('')
const bookedSevas = reactive({}) // Track if user has booked this seva
const bookingInProgress = reactive({}) // Track booking in progress

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

// User context for entity association
const userContext = ref(null)

// Get current entity ID from route
const currentEntityId = computed(() => route.params.id)

// Get available slots from backend data
const getAvailableSlots = (seva) => {
  return seva.available_slots || 0
}

// Get booked slots from backend data
const getBookedSlots = (seva) => {
  return seva.booked_slots || 0
}

// Get remaining slots from backend data
const getRemainingSlots = (seva) => {
  return seva.remaining_slots || 0
}

// Fetch temple information
const fetchTempleInfo = async () => {
  try {
    console.log('Fetching temple information...')
    
    // Try localStorage first for immediate display
    const storedTempleName = localStorage.getItem('selectedTempleName')
    if (storedTempleName) {
      currentTemple.value.name = storedTempleName
      console.log('Temple name from localStorage:', storedTempleName)
    }
    
    // Get entity ID
    const entityId = currentEntityId.value ||
                     localStorage.getItem('selectedEntityId') || 
                     localStorage.getItem('current_entity_id') ||
                     localStorage.getItem('current_tenant_id')
    
    if (!entityId) {
      console.warn('No entity ID found')
      currentTemple.value.name = 'Temple'
      return
    }
    
    console.log('Fetching temple details for entity ID:', entityId)
    
    // Fetch from API (don't block on this)
    try {
      const response = await api.get(`/entities/${entityId}`)
      console.log('Temple API response:', response)
      
      const templeData = response.data?.data || response.data || response
      
      if (templeData) {
        currentTemple.value = {
          name: templeData.name || templeData.Name || storedTempleName || 'Temple',
          city: templeData.city || templeData.City || '',
          state: templeData.state || templeData.State || ''
        }
        
        // Save to localStorage
        if (currentTemple.value.name) {
          localStorage.setItem('selectedTempleName', currentTemple.value.name)
        }
        
        console.log('Temple info loaded:', currentTemple.value)
      }
    } catch (apiError) {
      console.warn('API fetch failed, using localStorage data:', apiError)
      currentTemple.value.name = storedTempleName || 'Temple'
    }
  } catch (error) {
    console.error('Error fetching temple info:', error)
    currentTemple.value.name = localStorage.getItem('selectedTempleName') || 'Temple'
  }
}

// Fetch user information
const fetchUserInfo = () => {
  try {
    // Try to get user info from localStorage
    const userName = localStorage.getItem('user_name') || localStorage.getItem('userName')
    const userEmail = localStorage.getItem('user_email') || localStorage.getItem('userEmail')
    
    // Try to parse user_data if available
    try {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        const parsed = JSON.parse(userData)
        currentUser.value = {
          name: parsed.name || parsed.Name || userName || 'Devotee',
          email: parsed.email || parsed.Email || userEmail || ''
        }
        return
      }
    } catch (parseError) {
      console.warn('Error parsing user_data:', parseError)
    }
    
    // Fallback to individual localStorage items
    currentUser.value = {
      name: userName || 'Devotee',
      email: userEmail || ''
    }
    
    console.log('User info loaded:', currentUser.value)
  } catch (error) {
    console.error('Error fetching user info:', error)
    currentUser.value = {
      name: 'Devotee',
      email: ''
    }
  }
}

// Get user context with entity/temple ID
const getUserContext = async () => {
  try {
    console.log('Getting user context for entity association...')
    // You may need to implement this in your seva service
    // For now, we'll use localStorage data
    const entityId = localStorage.getItem('selectedEntityId') || 
                     localStorage.getItem('current_entity_id') ||
                     localStorage.getItem('current_tenant_id')
    
    if (entityId) {
      userContext.value = {
        entity_id: entityId,
        temple_id: entityId,
        temple_name: currentTemple.value.name
      }
      console.log('User context set:', userContext.value)
    }
  } catch (error) {
    console.error('Error getting user context:', error)
  }
}

// Debug function to analyze response structure
const debugSevaBookingResponse = (response) => {
  console.log('=== SEVA BOOKING RESPONSE DEBUG ===')
  console.log('Full response object:', response)
  console.log('Response type:', typeof response)
  console.log('Response keys:', Object.keys(response || {}))
  
  if (response.data) {
    console.log('response.data:', response.data)
    console.log('response.data keys:', Object.keys(response.data || {}))
  }
  
  console.log('JSON stringified response:', JSON.stringify(response, null, 2))
  console.log('=== END DEBUG ===')
}

// Comprehensive response parsing for Razorpay
const parseRazorpayResponse = (response) => {
  const possibleDataSources = [
    response,
    response.data,
    response.result,
    response.payload,
    response.order,
    response.razorpay
  ].filter(source => source && typeof source === 'object')
  
  let order_id, razorpay_key, amount
  
  for (const source of possibleDataSources) {
    order_id = order_id || 
      source.order_id || 
      source.OrderID || 
      source.orderId || 
      source.razorpay_order_id ||
      source.RazorpayOrderID ||
      source.orderID ||
      source.id
    
    razorpay_key = razorpay_key || 
      source.razorpay_key || 
      source.RazorpayKey || 
      source.razorpayKey || 
      source.key || 
      source.Key ||
      source.api_key ||
      source.ApiKey ||
      source.razorpay_api_key ||
      source.RazorpayApiKey
    
    amount = amount || 
      source.amount || 
      source.Amount || 
      source.total || 
      source.Total ||
      source.payment_amount ||
      source.PaymentAmount
  }
  
  return { order_id, razorpay_key, amount }
}


// Computed properties
// eslint-disable-next-line no-unused-vars
const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

const filteredSevas = computed(() => {
  let filtered = sevaStore.sevas
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(seva =>
      seva.name?.toLowerCase().includes(query) ||
      seva.description?.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(seva => seva.seva_type === selectedCategory.value)
  }
  
  if (priceRange.value) {
    filtered = filtered.filter(seva => {
      const price = seva.price
      switch (priceRange.value) {
        case '0-500': return price <= 500
        case '500-1000': return price > 500 && price <= 1000
        case '1000-5000': return price > 1000 && price <= 5000
        case '5000+': return price > 5000
        default: return true
      }
    })
  }
  
  return filtered
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedDate.value = ''
  priceRange.value = ''
}

// Direct booking function with Razorpay payment
const directBookSeva = async (seva) => {
  if (bookedSevas[seva.id] || 
      bookingInProgress[seva.id] || 
      getRemainingSlots(seva) <= 0) {
    return
  }
  
  bookingInProgress[seva.id] = true
  
  try {
    if (!userContext.value) {
      await getUserContext()
    }

    const entityId = userContext.value?.entity_id || userContext.value?.temple_id

    // ✅ FREE SEVA — skip payment, go directly to approval flow
    if (!seva.price || seva.price === 0) {
      const freeBookingData = {
        seva_id: seva.id,
        entity_id: Number(entityId),
        temple_id: Number(entityId),
        seva_name: seva.name,
        seva_type: seva.seva_type,
      }

      console.log('Free seva — creating direct booking request:', freeBookingData)

      const response = await sevaService.createSevaBooking(freeBookingData)

      if (response.success || response.data || response.id) {
        toast.success("Seva booking request submitted! Awaiting temple admin approval.")
        bookedSevas[seva.id.toString()] = true
        await fetchSevas()
        await fetchUserBookings()
      } else {
        toast.error("Failed to submit booking request. Please try again.")
      }

      return // exit early, no payment needed
    }

    // ✅ PAID SEVA — Razorpay flow
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      toast.error("Razorpay SDK failed to load. Please check your internet connection.")
      return
    }

    const bookingData = {
      seva_id: seva.id,
      amount: Number(seva.price),
      seva_name: seva.name,
      seva_type: seva.seva_type,
      entity_id: Number(entityId),
      temple_id: Number(entityId),
      entityId: entityId,
    }

    console.log('Paid seva — creating booking with payment:', bookingData)

    const response = await sevaService.createSevaBookingWithPayment(bookingData)

    debugSevaBookingResponse(response)

    const { order_id, razorpay_key, amount } = parseRazorpayResponse(response)

    console.log('Extracted values:', { order_id, razorpay_key, amount })

    if (!order_id || !razorpay_key) {
      const missingFields = []
      if (!order_id) missingFields.push('order_id')
      if (!razorpay_key) missingFields.push('razorpay_key')
      toast.error(`Server response missing required fields: ${missingFields.join(', ')}`)
      throw new Error(`Missing fields: ${missingFields.join(', ')}`)
    }

    const options = {
      key: razorpay_key,
      amount: (amount || seva.price) * 100,
      currency: "INR",
      name: currentTemple.value.name || "Temple Seva",
      description: `${seva.name} - ${seva.seva_type}`,
      order_id: order_id,
      handler: async function (razorpayResponse) {
        try {
          console.log('Payment successful, verifying...', razorpayResponse)
          await sevaService.verifySevaPayment({
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            seva_id: seva.id
          })
          toast.success("Seva booking successful! Payment confirmed.")
          bookedSevas[seva.id.toString()] = true
          await fetchSevas()
          await fetchUserBookings()
        } catch (verifyError) {
          console.error("Verification failed:", verifyError)
          toast.error("Payment verification failed. Please contact support if amount was deducted.")
        }
      },
      prefill: {
        name: currentUser.value.name || "Devotee",
        email: currentUser.value.email || "devotee@example.com",
      },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed')
          bookingInProgress[seva.id] = false
        }
      }
    }

    console.log('Opening Razorpay with options:', options)
    const rzp = new window.Razorpay(options)
    rzp.open()

  } catch (error) {
    console.error('Seva Booking Flow Error:', error)
    console.error('Error details:', error.response?.data || 'No response data')
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Something went wrong while processing your seva booking'
    toast.error("Error: " + errorMessage)
  } finally {
    if (!window.Razorpay) {
      bookingInProgress[seva.id] = false
    }
  }
}
const fetchSevas = async () => {
  loading.value = true
  try {
    // Apply current filters when fetching
    const params = {
      search: searchQuery.value,
      seva_type: selectedCategory.value
    }
    
    await sevaStore.fetchSevas(params)
    
    // Check if user has any booked sevas
    await fetchUserBookings()
    
    console.log('Sevas loaded with slot data:', sevaStore.sevas.map(s => ({
      id: s.id,
      name: s.name,
      available_slots: s.available_slots,
      booked_slots: s.booked_slots,
      remaining_slots: s.remaining_slots
    })))
    
  } catch (error) {
    console.error('Failed to load sevas:', error)
    
    // Display more specific error message
    if (error.toString && error.toString().includes('Availability: unsupported relations')) {
      toast.error('Database schema issue. Please contact the administrator.')
    } else {
      toast.error('Failed to load sevas. Please try again.')
    }
  } finally {
    loading.value = false
  }
}

// Fetch user's bookings and update the UI
const fetchUserBookings = async () => {
  try {
    const response = await sevaService.getMyBookings()
    
    if (response.success && response.data) {
      console.log('User bookings response:', response.data)
      
      // Clear existing bookings
      Object.keys(bookedSevas).forEach(key => {
        delete bookedSevas[key]
      })
      
      // Mark sevas as booked if they exist in the user's bookings (pending or approved)
      response.data.forEach(booking => {
  const sevaId = booking.seva_id || booking.SevaID
  const isFreeSeva = !booking.amount || booking.amount === 0
  const isPaid = booking.payment_status === 'paid' || booking.payment_verified === true

  // Only count as booked if it's free (no payment needed) OR payment is actually verified
  if (sevaId && (booking.status === 'pending' || booking.status === 'approved')) {
    if (isFreeSeva || isPaid) {
      bookedSevas[sevaId] = true
    }
  }
})
      
      console.log('Updated bookedSevas:', bookedSevas)
    }
  } catch (error) {
    console.error('Failed to fetch user bookings:', error)
  }
}

// Lifecycle
onMounted(async () => {
  console.log('SevaBooking component mounted')
  
  try {
    // Load user info first (synchronous, from localStorage)
    fetchUserInfo()
    
    // Load temple info (quick, uses localStorage first)
    await fetchTempleInfo()
    
    // Get user context for entity association
    await getUserContext()
    
    // Show the page immediately after temple info loads
    initialLoading.value = false
    
    // Then load sevas in background
    loading.value = true
    
    // First fetch sevas
    await fetchSevas()
    
    console.log('Component initialized - Seva IDs:', 
      sevaStore.sevas.map(s => s.id), 
      'Booked sevas:', bookedSevas,
      'Temple:', currentTemple.value,
      'User:', currentUser.value
    )
  } catch (error) {
    console.error('Error during component initialization:', error)
    toast.error('Failed to load page data')
  } finally {
    initialLoading.value = false
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
</style>
