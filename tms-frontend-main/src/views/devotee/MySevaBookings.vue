<template>
  <div>
    <!-- Temple Header Bar -->
    <div class="bg-white shadow-lg mb-6">
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
                {{ currentTemple.name || 'Loading Temple...' }}
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
    <div class="bg-white p-6 rounded-xl shadow-sm mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">My Seva Bookings</h2>
          <p class="text-gray-600 mt-1">View and manage all your seva bookings</p>
        </div>
        <router-link 
          :to="`/entity/${route.params.id}/devotee/seva-booking`"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Book New Seva
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-6 rounded-xl shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            v-model="filters.dateRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search seva name..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading || sevaStore.loadingRecentSevas || sevaStore.loadingCatalog" class="bg-white p-6 rounded-xl shadow-sm flex justify-center">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">Loading your seva bookings...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white p-6 rounded-xl shadow-sm flex justify-center">
      <div class="flex flex-col items-center text-center">
        <svg class="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Error loading seva bookings</h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <button 
          @click="fetchSevaBookings"
          class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Seva Bookings List -->
    <div v-else-if="filteredBookings.length > 0" class="bg-white p-6 rounded-xl shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seva
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="booking in filteredBookings" :key="booking.id || booking.ID" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ booking.seva_name || (booking.seva && booking.seva.name) || `Seva ${booking.seva_id || booking.SevaID || ''}` }}</div>
                    <div class="text-xs text-gray-500">{{ booking.seva_type || (booking.seva && booking.seva.type) || '' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(booking.booking_time || booking.BookingTime || booking.created_at) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(booking.booking_time || booking.BookingTime || booking.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-indigo-600">₹{{ getBookingAmount(booking) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(booking.status || booking.Status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ formatStatus(booking.status || booking.Status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  type="button"
                  @click="viewBookingDetails(booking)"
                  class="text-indigo-600 hover:text-indigo-900 font-medium focus:outline-none hover:underline transition-colors duration-150"
                  title="View Details"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white p-8 rounded-xl shadow-sm text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">No seva bookings found</h3>
      <p class="mt-1 text-sm text-gray-500">You haven't booked any sevas yet for this temple.</p>
      <div class="mt-6">
        <router-link 
          :to="`/entity/${route.params.id}/devotee/seva-booking`"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          Book Your First Seva
        </router-link>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <div
      v-if="selectedBooking"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Seva Booking Details</h2>
          <button
            type="button"
            @click="selectedBooking = null"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- From Details (Devotee) -->
            <div class="space-y-4">
              <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  From (Devotee)
                </h4>
                <div class="space-y-2">
                  <div>
                    <p class="text-xs text-blue-700">Name</p>
                    <p class="font-semibold text-blue-900">{{ selectedBooking.user_name || currentUser.name || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700">Email</p>
                    <p class="text-sm text-blue-900">{{ selectedBooking.user_email || currentUser.email || 'N/A' }}</p>
                  </div>
                  </div>
              </div>
            </div>

            <!-- To Details (Temple) -->
            <div class="space-y-4">
              <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  To (Temple)
                </h4>
                <div class="space-y-2">
                  <div>
                    <p class="text-xs text-green-700">Temple Name</p>
                    <p class="font-semibold text-green-900">{{ selectedBooking.temple_name || currentTemple.name || 'N/A' }}</p>
                  </div>
                  <div v-if="creatorDetails.bank">
                    <p class="text-xs text-green-700">Account Holder</p>
                    <p class="text-sm text-green-900">{{ creatorDetails.bank.account_holder_name || 'N/A' }}</p>
                  </div>
                  <div v-if="creatorDetails.bank">
                    <p class="text-xs text-green-700">Account Number</p>
                    <p class="text-sm font-mono text-green-900">{{ maskAccountNumber(creatorDetails.bank.account_number) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Details -->
            <div class="md:col-span-2">
              <div class="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  Payment Information
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-indigo-700">Payment ID</p>
                    <p class="text-sm font-mono text-indigo-900 break-all">{{ selectedBooking.payment_id || selectedBooking.razorpay_payment_id || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-indigo-700">Order ID</p>
                    <p class="text-sm font-mono text-indigo-900 break-all">{{ selectedBooking.order_id || selectedBooking.razorpay_order_id || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-indigo-700">Amount Paid</p>
                    <p class="text-lg font-bold text-indigo-900">₹{{ getBookingAmount(selectedBooking) }}</p>
                  </div>
                </div>
                <div v-if="selectedBooking.payment_method" class="mt-3 pt-3 border-t border-indigo-300">
                  <p class="text-xs text-indigo-700">Payment Method</p>
                  <p class="text-sm font-medium text-indigo-900">{{ getPaymentMethodLabel(selectedBooking.payment_method) }}</p>
                </div>
              </div>
            </div>

            <!-- Seva & Booking Details -->
            <div class="md:col-span-2">
              <div class="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Seva & Booking Details
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-xs text-amber-700">Seva Name</p>
                    <p class="text-sm font-semibold text-amber-900">{{ selectedBooking.seva_name || (selectedBooking.seva && selectedBooking.seva.name) || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-amber-700">Seva Type</p>
                    <p class="text-sm text-amber-900">{{ selectedBooking.seva_type || (selectedBooking.seva && selectedBooking.seva.type) || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-amber-700">Status</p>
                    <span :class="getStatusClass(selectedBooking.status || selectedBooking.Status)" class="inline-block px-2 py-1 text-xs font-medium rounded-full mt-1">
                      {{ formatStatus(selectedBooking.status || selectedBooking.Status) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-amber-700">Booking Date</p>
                    <p class="text-sm text-amber-900">{{ formatDate(selectedBooking.booking_time || selectedBooking.BookingTime || selectedBooking.created_at) }}</p>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-amber-300">
                  <p class="text-xs text-amber-700">Booking Time</p>
                  <p class="text-sm text-amber-900">{{ formatTime(selectedBooking.booking_time || selectedBooking.BookingTime || selectedBooking.created_at) }}</p>
                </div>
                
              </div>
            </div>

            <!-- Refund Information (if rejected) -->
            <div v-if="selectedBooking.status === 'rejected'" class="md:col-span-2">
              <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 class="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Rejection & Refund Information
                </h4>
                <div class="space-y-3">
                  <div v-if="selectedBooking.rejection_reason">
                    <p class="text-xs text-red-700">Rejection Reason</p>
                    <p class="text-sm text-red-900">{{ selectedBooking.rejection_reason }}</p>
                  </div>
                  <div v-if="selectedBooking.rejected_at">
                    <p class="text-xs text-red-700">Rejected On</p>
                    <p class="text-sm text-red-900">{{ formatDate(selectedBooking.rejected_at) }} at {{ formatTime(selectedBooking.rejected_at) }}</p>
                  </div>
                  <div v-if="selectedBooking.refund_status" class="pt-3 border-t border-red-300">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs text-red-700">Refund Status</p>
                        <p class="text-sm font-semibold text-red-900">{{ selectedBooking.refund_status.toUpperCase() }}</p>
                      </div>
                      <span :class="[
                        'px-3 py-1 rounded-full text-xs font-medium',
                        selectedBooking.refund_status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedBooking.refund_status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      ]">
                        {{ selectedBooking.refund_status }}
                      </span>
                    </div>
                  </div>
                  <div v-if="selectedBooking.refund_initiated_at">
                    <p class="text-xs text-red-700">Refund Initiated</p>
                    <p class="text-sm text-red-900">{{ formatDate(selectedBooking.refund_initiated_at) }}</p>
                  </div>
                  <div v-if="selectedBooking.refund_amount">
                    <p class="text-xs text-red-700">Refund Amount</p>
                    <p class="text-lg font-bold text-red-900">₹{{ Number(selectedBooking.refund_amount).toLocaleString() }}</p>
                  </div>
                  <div v-if="selectedBooking.refund_reference_id">
                    <p class="text-xs text-red-700">Refund Reference ID</p>
                    <p class="text-sm font-mono text-red-900">{{ selectedBooking.refund_reference_id }}</p>
                  </div>
                </div>
              </div>
            </div>

          
          </div>
          
          <!-- Modal Footer -->
          <div class="flex gap-3 mt-6 pt-6 border-t">
            <button 
              type="button"
              @click="selectedBooking = null"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button 
              v-if="selectedBooking.status === 'approved' || selectedBooking.status === 'completed'"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSevaStore } from '@/stores/seva'
import { useToast } from '@/composables/useToast'
import api from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const sevaStore = useSevaStore()
const toast = useToast()

// State
const loading = ref(false)
const error = ref(null)
const filters = ref({
  status: 'all',
  dateRange: 'all',
  search: ''
})
const selectedBooking = ref(null)

// Temple and User info
const currentTemple = ref({
  id: null,
  name: '',
  city: '',
  state: ''
})

const currentUser = ref({
  id: null,
  name: '',
  email: '',
  phone: ''
})

// Creator details with bank info
const creatorDetails = ref({
  id: null,
  fullName: '',
  email: '',
  phone: '',
  bank: null,
})

// Get current entity ID from route
const currentEntityId = computed(() => route.params.id)

// Fetch temple information with creator details
const fetchTempleInfo = async () => {
  try {
    console.log('🏛️ Fetching temple information...')

    const storedTempleName = localStorage.getItem('selectedTempleName')
    if (storedTempleName) {
      currentTemple.value.name = storedTempleName
    }

    let entityId = null
    const match = window.location.pathname.match(/\/entity\/(\d+)\//)
    if (match && match[1]) {
      entityId = match[1]
    }

    if (!entityId) {
      console.warn('⚠️ Entity ID not found in URL')
      return
    }

    console.log('✅ Using entity ID:', entityId)

    const response = await api.get(`/entities/${entityId}/details`)
    const data = response.data?.data || response.data

    console.log('🔍 Temple API Response:', data)

    if (!data || !data.id) {
      console.warn('⚠️ No temple data received')
      return
    }

    currentTemple.value = {
      id: data.id,
      name: data.name || storedTempleName || 'Temple',
      city: data.city || '',
      state: data.state || '',
      status: data.status || '',
      createdBy: data.created_by || null,
    }

    if (data.creator) {
      console.log('✅ Creator found in response')
      
      // Map bank details - handle both nested and flat structures
      let bankDetails = null
      if (data.creator.bank) {
        // Nested structure: creator.bank object exists
        bankDetails = data.creator.bank
      } else if (data.creator.account_number) {
        // Flat structure: bank details directly in creator
        bankDetails = {
          account_holder_name: data.creator.account_holder_name,
          account_number: data.creator.account_number,
          ifsc_code: data.creator.ifsc_code,
          account_type: data.creator.account_type,
          upi_id: data.creator.upi_id,
          bank_name: data.creator.bank_name || 'N/A',
          branch_name: data.creator.branch_name || 'N/A'
        }
      }
      console.log('✅ Creator details loaded:', {
        name: creatorDetails.value.fullName,
        bank: creatorDetails.value.bank ? 'Available' : 'Not available'
      })

      creatorDetails.value = {
        id: data.creator.id,
        fullName: data.creator.name || data.creator.full_name || 'N/A',
        email: data.creator.email || 'N/A',
        phone: data.creator.phone || 'N/A',
        roleName: data.creator.role || 'N/A',
        loading: false,
        error: null,
        temple: data.creator.temple || null,
        bank: bankDetails,
      }
    }

    localStorage.setItem('selectedTempleName', currentTemple.value.name)
    localStorage.setItem('selectedEntityId', currentTemple.value.id)

    console.log('✅ Temple details loaded:', currentTemple.value.name)
  } catch (error) {
    console.error('❌ Failed to fetch temple details:', error)
    currentTemple.value.name = localStorage.getItem('selectedTempleName') || 'Temple'
  }
}
// Fetch user information
const fetchUserInfo = () => {
  try {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const parsed = JSON.parse(userData)
      currentUser.value = {
        id: parsed.id,
        name: parsed.fullName || parsed.full_name || parsed.name || 'Devotee',
        email: parsed.email || '',
        phone: parsed.phone || ''
      }
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
  }
}

// Format helpers
const formatDate = (dateTime) => {
  if (!dateTime) return 'N/A'
  
  try {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    return 'N/A'
  }
}

const formatTime = (dateTime) => {
  if (!dateTime) return 'N/A'
  
  try {
    const date = new Date(dateTime)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return 'N/A'
  }
}

const formatStatus = (status) => {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'N/A'
  const accStr = accountNumber.toString()
  if (accStr.length <= 4) return accStr
  const lastFour = accStr.slice(-4)
  const masked = 'X'.repeat(accStr.length - 4)
  return masked + lastFour
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    'upi': 'UPI',
    'online': 'Online Payment',
    'razorpay': 'Razorpay',
    'bank': 'Bank Transfer',
    'card': 'Card'
  }
  return labels[method?.toLowerCase()] || method || 'Online'
}

// Status styles
const getStatusClass = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  
  const statusMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800'
  }
  
  return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

// Helper to get booking amount
const getBookingAmount = (booking) => {
  if (!booking) return '0'
  
  const amount = booking.amount || 
                 booking.Amount || 
                 booking.price || 
                 booking.Price || 
                 (booking.seva && booking.seva.price) ||
                 0
  
  return parseFloat(amount).toLocaleString('en-IN')
}

// Computed - Filter bookings by current entity
const filteredBookings = computed(() => {
  let result = sevaStore.recentSevas || []
  
  // Filter by current entity ID
  result = result.filter(booking => {
    const bookingEntityId = booking.entity_id || booking.EntityID || booking.seva?.entity_id
    const currentEntity = parseInt(currentEntityId.value)
    return parseInt(bookingEntityId) === currentEntity
  })
  
  // Filter by status
  if (filters.value.status !== 'all') {
    result = result.filter(booking => {
      const bookingStatus = (booking.status || booking.Status || '').toLowerCase()
      return bookingStatus === filters.value.status.toLowerCase()
    })
  }
  
  // Filter by date range
  if (filters.value.dateRange !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    
    result = result.filter(booking => {
      const bookingDate = new Date(booking.booking_time || booking.BookingTime || booking.created_at || new Date())
      
      switch (filters.value.dateRange) {
        case 'today':
          return bookingDate >= today
        case 'week':
          return bookingDate >= startOfWeek
        case 'month':
          return bookingDate >= startOfMonth
        case 'year':
          return bookingDate >= startOfYear
        default:
          return true
      }
    })
  }
  
  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(booking => {
      const sevaName = (booking.seva_name || (booking.seva && booking.seva.name) || '').toLowerCase()
      const sevaType = (booking.seva_type || (booking.seva && booking.seva.type) || '').toLowerCase()
      
      return sevaName.includes(search) || sevaType.includes(search)
    })
  }
  
  return result
})

// Methods
const fetchSevaBookings = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch the seva catalog to get seva details
    await sevaStore.fetchSevas({ entity_id: currentEntityId.value })
    
    // Fetch bookings
    await sevaStore.fetchRecentSevas(currentEntityId.value)
    
    // Merge seva details with bookings
    if (sevaStore.recentSevas && sevaStore.recentSevas.length > 0) {
      sevaStore.recentSevas = sevaStore.recentSevas.map(booking => {
        const sevaId = booking.seva_id || booking.SevaID
        const sevaDetails = sevaStore.sevas.find(s => 
          parseInt(s.id) === parseInt(sevaId) || parseInt(s.ID) === parseInt(sevaId)
        )
        
        if (sevaDetails) {
          return {
            ...booking,
            seva: sevaDetails,
            seva_name: booking.seva_name || sevaDetails.name,
            seva_type: booking.seva_type || sevaDetails.seva_type,
            seva_description: booking.seva_description || sevaDetails.description
          }
        }
        return booking
      })
    }
  } catch (err) {
    console.error('Error fetching seva bookings:', err)
    error.value = err.message || 'Failed to load seva bookings'
  } finally {
    loading.value = false
  }
}

const viewBookingDetails = (booking) => {
  selectedBooking.value = booking
}

// Watch for route changes
watch(() => route.params.id, (newEntityId, oldEntityId) => {
  if (newEntityId && newEntityId !== oldEntityId) {
    fetchTempleInfo()
    fetchSevaBookings()
  }
})

// Lifecycle hooks
onMounted(async () => {
  fetchUserInfo()
  await fetchTempleInfo()
  await fetchSevaBookings()
})
</script>