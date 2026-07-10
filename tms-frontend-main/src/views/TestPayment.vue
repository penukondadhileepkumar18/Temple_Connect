<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            🔴 Live Payment Test
          </h1>
          <p class="text-gray-600">Test your Razorpay integration with real payment</p>
        </div>
        
        <!-- Warning Banner -->
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-semibold text-red-800">⚠️ WARNING: LIVE MODE ACTIVE</p>
              <p class="text-sm text-red-700 mt-1">This will charge your real payment method. Use small amounts for testing.</p>
            </div>
          </div>
        </div>

        <!-- Test Form -->
        <div class="space-y-6">
          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input 
                v-model.number="amount" 
                type="number" 
                min="1"
                step="0.01"
                class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter amount (min ₹1)"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Recommended: ₹1 for testing</p>
          </div>

          <!-- Donation Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Donation Type <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="donationType" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="general">General Donation</option>
              <option value="seva">Seva</option>
              <option value="festival">Festival</option>
              <option value="construction">Construction Fund</option>
              <option value="annadanam">Annadanam</option>
            </select>
          </div>

          <!-- Note -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <input 
              v-model="note" 
              type="text" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Purpose of donation"
            />
          </div>

          <!-- Pay Button -->
          <button
            @click="testPayment"
            :disabled="loading || !amount || amount < 1"
            class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span v-if="loading">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>💳 Pay ₹{{ amount }} Now (LIVE)</span>
          </button>
        </div>

        <!-- Status Display -->
        <div v-if="status" class="mt-6 p-4 rounded-lg border-2" :class="statusClass">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="text-2xl">{{ status.icon }}</span>
            </div>
            <div class="ml-3 flex-1">
              <p class="font-semibold text-lg">{{ status.title }}</p>
              <p class="text-sm mt-1">{{ status.message }}</p>
              <div v-if="status.data" class="mt-3 bg-black rounded-lg p-3 overflow-auto">
                <pre class="text-xs text-green-400">{{ JSON.stringify(status.data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-2">📝 Testing Instructions:</h3>
          <ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Use ₹1 for initial testing</li>
            <li>Choose UPI for fastest verification</li>
            <li>Complete the payment on Razorpay</li>
            <li>Check backend logs for verification</li>
            <li>Verify database entry after success</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { donationService } from '@/services/donation.service'

const amount = ref(1)
const donationType = ref('general')
const note = ref('Live payment test')
const loading = ref(false)
const status = ref(null)

const statusClass = computed(() => {
  if (!status.value) return ''
  switch (status.value.type) {
    case 'success': 
      return 'bg-green-50 border-green-300 text-green-900'
    case 'error': 
      return 'bg-red-50 border-red-300 text-red-900'
    case 'info': 
      return 'bg-blue-50 border-blue-300 text-blue-900'
    default: 
      return 'bg-gray-50 border-gray-300 text-gray-900'
  }
})

async function testPayment() {
  loading.value = true
  status.value = null

  try {
    // Step 1: Create order
    status.value = {
      type: 'info',
      icon: '📡',
      title: 'Creating order...',
      message: 'Sending request to backend'
    }

    console.log('🔄 Creating donation order...')
    const orderResponse = await donationService.createDonation({
      amount: Number(amount.value),
      donationType: donationType.value,
      note: note.value || undefined
    })

    console.log('✅ Order response:', orderResponse)

    // Extract order data
    const orderData = orderResponse.data || orderResponse
    const razorpayOrderId = orderData.OrderID || orderData.order_id
    const razorpayKey = orderData.RazorpayKey || orderData.razorpay_key || import.meta.env.VITE_RAZORPAY_KEY_ID

    if (!razorpayOrderId) {
      throw new Error('Order ID not received from backend')
    }

    status.value = {
      type: 'info',
      icon: '💳',
      title: 'Opening payment gateway...',
      message: `Order ID: ${razorpayOrderId}`,
      data: { order_id: razorpayOrderId, amount: amount.value }
    }

    // Step 2: Open Razorpay
    const options = {
      key: razorpayKey,
      amount: (orderData.Amount || orderData.amount) * 100,
      currency: 'INR',
      name: 'Temple Management System',
      description: `${donationType.value} - ${note.value || 'Test Donation'}`,
      order_id: razorpayOrderId,
      handler: async function (response) {
        console.log('✅ Payment completed:', response)
        await handlePaymentSuccess(response)
      },
      modal: {
        ondismiss: function() {
          console.log('⚠️ Payment modal closed')
          status.value = {
            type: 'error',
            icon: '❌',
            title: 'Payment Cancelled',
            message: 'You closed the payment window'
          }
          loading.value = false
        }
      },
      prefill: {
        name: 'Test User',
        email: 'test@temple.com',
        contact: '9999999999'
      },
      theme: {
        color: '#4F46E5'
      },
      retry: {
        enabled: true,
        max_count: 3
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.on('payment.failed', function (response) {
      console.error('❌ Payment failed:', response.error)
      status.value = {
        type: 'error',
        icon: '❌',
        title: 'Payment Failed',
        message: response.error.description,
        data: response.error
      }
      loading.value = false
    })

    razorpay.open()

  } catch (error) {
    console.error('❌ Error in testPayment:', error)
    status.value = {
      type: 'error',
      icon: '❌',
      title: 'Error',
      message: error.message || 'Payment initialization failed',
      data: error.response?.data
    }
    loading.value = false
  }
}

async function handlePaymentSuccess(razorpayResponse) {
  try {
    status.value = {
      type: 'info',
      icon: '🔄',
      title: 'Verifying payment...',
      message: 'Confirming with backend server'
    }

    const verifyData = {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    }

    console.log('🔍 Verifying payment:', verifyData)

    await donationService.verifyDonation(verifyData)

    console.log('✅ Payment verified successfully')

    status.value = {
      type: 'success',
      icon: '✅',
      title: 'Payment Successful!',
      message: 'Your donation has been recorded successfully',
      data: {
        payment_id: razorpayResponse.razorpay_payment_id,
        order_id: razorpayResponse.razorpay_order_id,
        amount: `₹${amount.value}`,
        type: donationType.value,
        timestamp: new Date().toLocaleString()
      }
    }

    // Reset form after 3 seconds
    setTimeout(() => {
      amount.value = 1
      note.value = 'Live payment test'
      status.value = null
    }, 5000)

  } catch (error) {
    console.error('❌ Verification failed:', error)
    status.value = {
      type: 'error',
      icon: '⚠️',
      title: 'Verification Failed',
      message: 'Payment successful but backend verification failed. Check backend logs.',
      data: {
        payment_id: razorpayResponse.razorpay_payment_id,
        error: error.message,
        note: 'Payment was successful - contact support if needed'
      }
    }
  } finally {
    loading.value = false
  }
}
</script>