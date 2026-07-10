<!-- src/views/devotee/DonationHistory.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
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
                {{ currentTemple.name || 'Loading Temple...' }}
              </h1>
              <p class="text-sm text-gray-500" v-if="currentTemple.city || currentTemple.state">
                {{ currentTemple.city }}{{ currentTemple.city && currentTemple.state ? ', ' : '' }}{{ currentTemple.state }}
              </p>
              <div class="flex items-center gap-3 mt-1">
                <div v-if="currentTemple.createdBy" class="flex items-center gap-2">
                  <p class="text-xs text-gray-400">
                    Created by:
                    <span v-if="creatorDetails.loading" class="text-gray-400">Loading...</span>
                    <span v-else-if="creatorDetails.fullName" class="text-indigo-600 font-medium">
                      {{ creatorDetails.fullName }}
                    </span>
                    <span v-else class="text-gray-400">User ID: {{ currentTemple.createdBy }}</span>
                  </p>
                  <span v-if="creatorDetails.roleName"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ creatorDetails.roleName }}
                  </span>
                </div>
                <span v-if="currentTemple.status"
                  :class="{
                    'bg-green-100 text-green-800': currentTemple.status === 'approved',
                    'bg-yellow-100 text-yellow-800': currentTemple.status === 'pending',
                    'bg-red-100 text-red-800': currentTemple.status === 'rejected'
                  }"
                  class="px-2 py-0.5 text-xs font-medium rounded-full">
                  {{ currentTemple.status }}
                </span>
              </div>
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
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">My Donations</h2>
              <p class="mt-1 text-sm text-gray-600">Track your donation history and receipts</p>
            </div>
            <button
              @click="showDonationForm = true"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-3 bg-indigo-100 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Donated</p>
              <p class="text-2xl font-bold text-gray-900">₹{{ totalDonated.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Donations</p>
              <p class="text-2xl font-bold text-gray-900">{{ donationHistory.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-3 bg-amber-100 rounded-lg">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m4-8a4 4 0 118 0v4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">This Month</p>
              <p class="text-2xl font-bold text-gray-900">₹{{ thisMonthDonated.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              v-model="filters.dateRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Donation Type</label>
            <select
              v-model="filters.donationType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="general">General Donation</option>
              <option value="seva">Seva Donation</option>
              <option value="festival">Festival Donation</option>
              <option value="construction">Construction Fund</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
            <select
              v-model="filters.amountRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Amounts</option>
              <option value="0-500">₹0 - ₹500</option>
              <option value="501-1000">₹501 - ₹1,000</option>
              <option value="1001-5000">₹1,001 - ₹5,000</option>
              <option value="5000+">₹5,000+</option>
            </select>
          </div>

          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Donation History Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Donation History</h3>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="donation in filteredDonations" :key="donation.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(getDonationDate(donation)) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getDonationTypeClass(donation.type || donation.donationType)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ (donation.type || donation.donationType || 'N/A').toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₹{{ Number(donation.amount || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getPaymentMethodClass(donation.method || donation.paymentMethod)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getPaymentMethodLabel(donation.method || donation.paymentMethod) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(donation.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ (donation.status || 'N/A').toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    @click="viewDonationDetails(donation)"
                    class="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing page {{ pagination.page }} of {{ pagination.totalPages }} ({{ pagination.total }} total donations)
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              :class="[
                'px-3 py-1 rounded border',
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              Previous
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              :class="[
                'px-3 py-1 rounded border',
                pagination.page >= pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredDonations.length === 0 && !loading" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
          <p class="mt-1 text-sm text-gray-500">No donations match your current filters.</p>
        </div>
      </div>
    </div>

    <!-- Donation Details Modal -->
    <div v-if="selectedDonation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Donation Details</h3>
          <button @click="selectedDonation = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- FROM: Donor Information -->
          <div class="space-y-4">
            <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                From (Donor)
              </h4>
              <div class="space-y-2">
                <div>
                  <p class="text-xs text-blue-700">Name</p>
                  <p class="font-semibold text-blue-900">
                    {{ selectedDonation.donorName || selectedDonation.userName || selectedDonation.user_name || currentUser.name || 'N/A' }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-blue-700">Email</p>
                  <p class="text-sm text-blue-900">
                    {{ selectedDonation.donorEmail || selectedDonation.userEmail || selectedDonation.user_email || currentUser.email || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- TO: Temple / Recipient Information -->
          <div class="space-y-4">
            <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                To (Recipient)
              </h4>
              <div class="space-y-2">
                <div>
                  <p class="text-xs text-green-700">Temple Name</p>
                  <p class="font-semibold text-green-900">
                    {{ selectedDonation.entityName || selectedDonation.entity_name || currentTemple.name || 'N/A' }}
                  </p>
                </div>
                <div v-if="getField(selectedDonation, 'account_holder_name')">
                  <p class="text-xs text-green-700">Payment Received By</p>
                  <p class="text-sm font-semibold text-green-900">
                    {{ getField(selectedDonation, 'account_holder_name') }}
                  </p>
                </div>
                <div v-if="getField(selectedDonation, 'upi_id') || getField(selectedDonation, 'account_number')">
                  <p class="text-xs text-green-700">UPI ID / Account</p>
                  <p class="text-sm font-mono text-green-900">
                    {{ getField(selectedDonation, 'upi_id') || getField(selectedDonation, 'account_number') }}
                  </p>
                </div>
                <div v-if="getField(selectedDonation, 'account_type')">
                  <p class="text-xs text-green-700">Payment Type</p>
                  <p class="text-sm text-green-900">{{ getField(selectedDonation, 'account_type') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Information Section -->
          <div class="md:col-span-2">
            <div v-if="isOnlinePayment(selectedDonation)" class="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                {{ getPaymentSectionTitle(selectedDonation) }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-indigo-700">Payment ID</p>
                  <p class="text-sm font-mono text-indigo-900 break-all">{{ getPaymentId(selectedDonation) }}</p>
                </div>
                <div>
                  <p class="text-xs text-indigo-700">Order / Transaction ID</p>
                  <p class="text-sm font-mono text-indigo-900 break-all">{{ getOrderId(selectedDonation) }}</p>
                </div>
                <div>
                  <p class="text-xs text-indigo-700">Amount</p>
                  <p class="text-lg font-bold text-indigo-900">₹{{ Number(selectedDonation.amount || 0).toLocaleString() }}</p>
                </div>
                <div v-if="getField(selectedDonation, 'upi_id')">
                  <p class="text-xs text-indigo-700">UPI ID</p>
                  <p class="text-sm font-mono text-indigo-900">{{ getField(selectedDonation, 'upi_id') }}</p>
                </div>
                <div v-if="getField(selectedDonation, 'account_number') && isCardPayment(selectedDonation)">
                  <p class="text-xs text-indigo-700">Card Number</p>
                  <p class="text-sm font-mono text-indigo-900">{{ getField(selectedDonation, 'account_number') }}</p>
                </div>
                <div v-if="getField(selectedDonation, 'account_holder_name')">
                  <p class="text-xs text-indigo-700">Account Holder</p>
                  <p class="text-sm font-semibold text-indigo-900">{{ getField(selectedDonation, 'account_holder_name') }}</p>
                </div>
              </div>
            </div>

            <div v-else-if="isBankTransfer(selectedDonation)" class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                </svg>
                Bank Transfer Information
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-green-700">Bank Name</p>
                  <p class="text-sm font-semibold text-green-900">{{ creatorDetails.bank?.bank_name || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-green-700">Account Holder</p>
                  <p class="text-sm font-semibold text-green-900">{{ creatorDetails.bank?.account_holder_name || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-green-700">Account Number</p>
                  <p class="text-sm font-mono font-semibold text-green-900">{{ creatorDetails.bank?.account_number || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-green-700">IFSC Code</p>
                  <p class="text-sm font-mono font-semibold text-green-900">{{ creatorDetails.bank?.ifsc_code || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-green-700">Branch</p>
                  <p class="text-sm text-green-900">{{ creatorDetails.bank?.branch_name || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-xs text-green-700">Amount Transferred</p>
                  <p class="text-lg font-bold text-green-900">₹{{ Number(selectedDonation.amount || 0).toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <div v-else class="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Payment Information
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-700">Payment ID</p>
                  <p class="text-sm font-mono text-gray-900 break-all">{{ getPaymentId(selectedDonation) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-700">Order ID</p>
                  <p class="text-sm font-mono text-gray-900 break-all">{{ getOrderId(selectedDonation) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-700">Amount</p>
                  <p class="text-lg font-bold text-gray-900">₹{{ Number(selectedDonation.amount || 0).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="md:col-span-2">
            <div class="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Transaction Details
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p class="text-xs text-amber-700">Type</p>
                  <span :class="getDonationTypeClass(selectedDonation.type || selectedDonation.donationType)" class="inline-block px-2 py-1 text-xs font-medium rounded-full mt-1">
                    {{ (selectedDonation.type || selectedDonation.donationType || 'N/A').toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-amber-700">Status</p>
                  <span :class="getStatusClass(selectedDonation.status)" class="inline-block px-2 py-1 text-xs font-medium rounded-full mt-1">
                    {{ (selectedDonation.status || 'N/A').toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-amber-700">Date</p>
                  <p class="text-sm text-amber-900">{{ formatDate(getDonationDate(selectedDonation)) }}</p>
                </div>
                <div>
                  <p class="text-xs text-amber-700">Time</p>
                  <p class="text-sm text-amber-900">{{ formatTime(getDonationDate(selectedDonation)) }}</p>
                </div>
              </div>
              <div v-if="selectedDonation.note" class="mt-3 pt-3 border-t border-amber-300">
                <p class="text-xs text-amber-700">Purpose/Note</p>
                <p class="text-sm text-amber-900">{{ selectedDonation.note }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6 pt-6 border-t">
          <button
            @click="selectedDonation = null"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- ==============================
         Donation Form Modal
         ============================== -->
    <div v-if="showDonationForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Make a Donation</h3>
          <button @click="closeDonationForm" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Step 1: Donation Form -->
        <div v-if="!donationForm.showBankDetails && !donationForm.showUpiDirect" class="space-y-4">

          <!-- ✅ UPDATED: Payment Method Selection — 3 options -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div class="grid grid-cols-3 gap-3">

            

              <!-- Razorpay / Online -->
              <button
                type="button"
                @click="donationForm.paymentMethod = 'online'"
                :class="[
                  'p-4 border-2 rounded-lg transition-all duration-200',
                  donationForm.paymentMethod === 'online'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                ]"
              >
                <span class="text-3xl block mb-1">💳</span>
                <p :class="['text-sm font-medium', donationForm.paymentMethod === 'online' ? 'text-indigo-900' : 'text-gray-700']">
                  Razorpay
                </p>
                <p class="text-xs text-gray-500 mt-1">Card / NetBanking</p>
              </button>
            </div>
          </div>

          <form @submit.prevent="handleDonationSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Donation Type</label>
              <select
                v-model="donationForm.type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Type</option>
                <option value="general">General Donation</option>
                <option value="seva">Seva Donation</option>
                <option value="festival">Festival Donation</option>
                <option value="event">Event Donation</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
              <input
                type="number"
                v-model="donationForm.amount"
                required
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter amount"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Purpose (Optional)</label>
              <textarea
                v-model="donationForm.purpose"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Purpose of donation (optional)"
              ></textarea>
            </div>

            <!-- Tenant Bank Info Panel -->
            <div
              v-if="tenantBankInfo.account_holder_name || tenantBankInfo.upi_id"
              class="bg-blue-50 border border-blue-300 rounded-lg p-4"
            >
              <p class="text-xs font-semibold text-blue-800 mb-3 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                </svg>
                🏦 Your donation will be received by:
              </p>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-blue-600 text-xs font-medium">Account Holder</span>
                  <span class="font-semibold text-blue-900">{{ tenantBankInfo.account_holder_name || 'N/A' }}</span>
                </div>
                <div v-if="tenantBankInfo.upi_id" class="flex justify-between items-center">
                  <span class="text-blue-600 text-xs font-medium">UPI ID</span>
                  <span class="font-mono font-semibold text-blue-900">{{ tenantBankInfo.upi_id }}</span>
                </div>
                <div v-if="tenantBankInfo.account_number" class="flex justify-between items-center">
                  <span class="text-blue-600 text-xs font-medium">Account No</span>
                  <span class="font-mono text-blue-900">{{ tenantBankInfo.account_number }}</span>
                </div>
                <div v-if="tenantBankInfo.ifsc_code" class="flex justify-between items-center">
                  <span class="text-blue-600 text-xs font-medium">IFSC</span>
                  <span class="font-mono text-blue-900">{{ tenantBankInfo.ifsc_code }}</span>
                </div>
                <div v-if="tenantBankInfo.bank_name" class="flex justify-between items-center">
                  <span class="text-blue-600 text-xs font-medium">Bank</span>
                  <span class="text-blue-900">{{ tenantBankInfo.bank_name }}</span>
                </div>
                <div v-if="tenantBankInfo.branch_name" class="flex justify-between items-center">
                  <span class="text-blue-600 text-xs font-medium">Branch</span>
                  <span class="text-blue-900">{{ tenantBankInfo.branch_name }}</span>
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeDonationForm"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submittingDonation"
                :class="[
                  'flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                  donationForm.paymentMethod === 'bank'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : donationForm.paymentMethod === 'upi_direct'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white',
                  submittingDonation ? 'opacity-50 cursor-not-allowed' : ''
                ]"
              >
                {{
                  submittingDonation
                    ? 'Processing...'
                    : donationForm.paymentMethod === 'bank'
                      ? 'View Bank Details'
                      : donationForm.paymentMethod === 'upi_direct'
                        ? 'View UPI Details'
                        : 'Proceed to Payment'
                }}
              </button>
            </div>
          </form>
        </div>

       
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { donationService } from '@/services/donation.service'
import api from '@/plugins/axios'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ==============================
// Reactive Data
// ==============================
const showDonationForm    = ref(false)
const selectedDonation    = ref(null)
const donationHistory     = ref([])
const loading             = ref(true)
const submittingDonation  = ref(false)
const pagination          = ref({ page: 1, limit: 20, total: 0, totalPages: 0 })
const upiLoading     = ref(false)
const upiError       = ref(null)
const upiPaymentData = ref(null)
const upiCopied      = ref(false)
const qrCanvas       = ref(null)

// ✅ tenantBankInfo — loaded on page mount from fetchTempleInfo
const tenantBankInfo = ref({})

const currentTemple   = ref({ id: null, name: '', city: '', state: '', status: '', createdBy: null })
const creatorDetails  = ref({ id: null, fullName: '', email: '', phone: '', roleId: null, roleName: '', loading: false, error: null, temple: null, bank: null })
const currentUser     = ref({ id: null, name: '', email: '', phone: '' })
const userContext     = ref(null)
const filters         = ref({ dateRange: 'all', donationType: 'all', amountRange: 'all' })

// ✅ UPDATED: donationForm now includes showUpiDirect flag
const donationForm = ref({
  type: '',
  amount: '',
  purpose: '',
  paymentMethod: 'upi_direct',   // default to UPI Direct
  showBankDetails: false,
  showUpiDirect: false,
})

// ==============================
// Helper: resolve field from donation object
// ==============================
const getField = (donation, fieldName) => {
  if (!donation) return null
  const fieldMap = {
    'account_holder_name': ['account_holder_name', 'AccountHolderName'],
    'account_number':      ['account_number', 'AccountNumber'],
    'account_type':        ['account_type', 'AccountType'],
    'ifsc_code':           ['ifsc_code', 'IFSCCode', 'ifscCode'],
    'upi_id':              ['upi_id', 'UPIID', 'upiId'],
  }
  const keys = fieldMap[fieldName] || [fieldName]
  for (const key of keys) {
    const val = donation[key]
    if (val !== undefined && val !== null && val !== '') return val
  }
  return null
}

const getPaymentId = (donation) => {
  if (!donation) return 'N/A'
  return donation.paymentId || donation.payment_id || donation.PaymentID || donation.razorpay_payment_id || 'Pending'
}

const getOrderId = (donation) => {
  if (!donation) return 'N/A'
  return donation.transactionId || donation.order_id || donation.OrderID || donation.razorpay_order_id || 'N/A'
}

const getDonationDate = (donation) => {
  if (!donation) return null
  return donation.donatedAt || donation.donated_at || donation.date || donation.created_at || donation.createdAt || null
}

const isOnlinePayment = (donation) => {
  if (!donation) return false
  const method = (donation.method || donation.paymentMethod || '').toLowerCase().trim()
  return !['bank', 'bank_transfer', 'cash', ''].includes(method)
}

const isCardPayment = (donation) => {
  if (!donation) return false
  const method = (donation.method || donation.paymentMethod || '').toLowerCase()
  const accountType = (getField(donation, 'account_type') || '').toUpperCase()
  return method === 'card' || accountType.startsWith('CARD')
}

const isBankTransfer = (donation) => {
  if (!donation) return false
  const method = (donation.method || donation.paymentMethod || '').toLowerCase()
  return method === 'bank' || method === 'bank_transfer'
}

const getPaymentSectionTitle = (donation) => {
  if (!donation) return 'Payment Information'
  const method = (donation.method || donation.paymentMethod || '').toLowerCase()
  const titles = {
    upi: 'UPI Payment Information',
    upi_direct: 'UPI Direct Payment Information',
    card: 'Card Payment Information',
    netbanking: 'Net Banking Information',
    wallet: 'Wallet Payment Information',
    online: 'Online Payment Information',
    unknown: 'Online Payment Information',
  }
  return titles[method] || 'Payment Information'
}

// ==============================
// Computed
// ==============================
const totalDonated = computed(() =>
  donationHistory.value
    .filter(d => (d.status || '').toLowerCase() === 'success')
    .reduce((total, d) => total + (Number(d.amount) || 0), 0)
)

const thisMonthDonated = computed(() => {
  const thisMonth = new Date().getMonth()
  const thisYear  = new Date().getFullYear()
  return donationHistory.value
    .filter(d => {
      if ((d.status || '').toLowerCase() !== 'success') return false
      const date = new Date(getDonationDate(d))
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear
    })
    .reduce((total, d) => total + Number(d.amount || 0), 0)
})

const filteredDonations = computed(() =>
  [...donationHistory.value].sort((a, b) =>
    new Date(getDonationDate(b)) - new Date(getDonationDate(a))
  )
)

// ==============================
// Formatters
// ==============================
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const getDonationTypeClass = (type) => {
  const classes = {
    general: 'bg-blue-100 text-blue-800',
    seva: 'bg-green-100 text-green-800',
    festival: 'bg-amber-100 text-amber-800',
    construction: 'bg-purple-100 text-purple-800',
    event: 'bg-pink-100 text-pink-800',
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    success: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
  }
  return classes[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getPaymentMethodClass = (method) => {
  const classes = {
    upi: 'bg-purple-100 text-purple-800',
    upi_direct: 'bg-green-100 text-green-800',
    online: 'bg-indigo-100 text-indigo-800',
    bank: 'bg-blue-100 text-blue-800',
    card: 'bg-blue-100 text-blue-800',
    cash: 'bg-gray-100 text-gray-800',
    wallet: 'bg-orange-100 text-orange-800',
    netbanking: 'bg-teal-100 text-teal-800',
    unknown: 'bg-indigo-100 text-indigo-800',
  }
  return classes[(method || '').toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    upi: 'UPI',
    upi_direct: 'UPI Direct',
    online: 'Online (Razorpay)',
    netbanking: 'Net Banking',
    card: 'Card',
    wallet: 'Wallet',
    bank: 'Bank Transfer',
    unknown: 'Online',
  }
  return labels[(method || '').toLowerCase()] || method || 'N/A'
}

// ==============================
// Actions
// ==============================
const resetFilters = () => {
  filters.value = { dateRange: 'all', donationType: 'all', amountRange: 'all' }
}

const viewDonationDetails = (donation) => {
  selectedDonation.value = donation
  console.log('📋 Donation:', JSON.stringify(donation, null, 2))
}

const changePage = async (newPage) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return
  pagination.value.page = newPage
  await fetchDonationHistory()
}

const copyToClipboard = async (text) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    alert('✅ Copied to clipboard!')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('✅ Copied to clipboard!')
  }
}

const handleDonationSubmit = () => submitDonation()

const closeDonationForm = () => {
  showDonationForm.value = false
  donationForm.value = {
    type: '',
    amount: '',
    purpose: '',
    paymentMethod: 'upi_direct',
    showBankDetails: false,
    showUpiDirect: false,
  }
}

const goBackToForm = () => {
  donationForm.value.showBankDetails = false
  donationForm.value.showUpiDirect   = false
}

// ==============================
// Data Fetching
// ==============================
const fetchLoggedInUser = async () => {
  try {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const parsed = JSON.parse(userData)
      currentUser.value = {
        id:    parsed.id,
        name:  parsed.fullName || parsed.full_name || 'Devotee',
        email: parsed.email || '',
        phone: parsed.phone || '',
      }
    }
  } catch (error) {
    console.error('❌ Error loading user data:', error)
  }
}

const fetchTempleInfo = async () => {
  try {
    const storedTempleName = localStorage.getItem('selectedTempleName')
    if (storedTempleName) currentTemple.value.name = storedTempleName

    let entityId = null
    const match = window.location.pathname.match(/\/entity\/(\d+)\//)
    if (match && match[1]) entityId = match[1]
    if (!entityId) return

    const response = await api.get(`/entities/${entityId}/details`)
    const data = response.data?.data || response.data
    if (!data || !data.id) return

    currentTemple.value = {
      id:        data.id,
      name:      data.name || storedTempleName || 'Temple',
      city:      data.city || '',
      state:     data.state || '',
      status:    data.status || '',
      createdBy: data.created_by || null,
    }

    // ✅ Support both data.creator and data.tenant as the source of bank/contact info
    const creatorSrc = data.creator || data.tenant || null
    if (creatorSrc) {
      let bankDetails = null

      if (creatorSrc.bank) {
        bankDetails = creatorSrc.bank
      } else if (creatorSrc.account_number || creatorSrc.upi_id) {
        bankDetails = {
          account_holder_name: creatorSrc.account_holder_name || '',
          account_number:      creatorSrc.account_number      || '',
          ifsc_code:           creatorSrc.ifsc_code           || '',
          account_type:        creatorSrc.account_type        || '',
          upi_id:              creatorSrc.upi_id              || '',
          bank_name:           creatorSrc.bank_name           || '',
          branch_name:         creatorSrc.branch_name         || '',
        }
      }

      // ✅ Only store meaningful phone/email — empty string means "not available"
      const creatorPhone = creatorSrc.phone  || creatorSrc.mobile || ''
      const creatorEmail = creatorSrc.email  || ''
      const creatorName  = creatorSrc.name   || creatorSrc.full_name || creatorSrc.account_holder_name || ''

      creatorDetails.value = {
        id:       creatorSrc.id       || null,
        fullName: creatorName,
        email:    creatorEmail,
        phone:    creatorPhone,
        roleName: creatorSrc.role     || creatorSrc.roleName || '',
        loading:  false,
        error:    null,
        temple:   creatorSrc.temple   || null,
        bank:     bankDetails,
      }

      if (bankDetails) {
        tenantBankInfo.value = {
          account_holder_name: bankDetails.account_holder_name || '',
          account_number:      bankDetails.account_number      || '',
          ifsc_code:           bankDetails.ifsc_code           || '',
          account_type:        bankDetails.account_type        || '',
          upi_id:              bankDetails.upi_id              || '',
          bank_name:           bankDetails.bank_name           || '',
          branch_name:         bankDetails.branch_name         || '',
        }
        console.log('🏦 Tenant bank loaded from entity details:', tenantBankInfo.value)
      }
    }

    localStorage.setItem('selectedTempleName', currentTemple.value.name)
    localStorage.setItem('selectedEntityId', currentTemple.value.id)
  } catch (error) {
    console.error('❌ Failed to fetch temple details:', error)
    currentTemple.value.name = localStorage.getItem('selectedTempleName') || 'Temple'
  }
}

const getUserContext = async () => {
  try {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const parsed = JSON.parse(userData)
      userContext.value = {
        id:          parsed.id,
        user_id:     parsed.id,
        entity_id:   parsed.entityId,
        temple_name: localStorage.getItem('selectedTempleName'),
      }
    }
  } catch (error) {
    console.error('❌ Error getting user context:', error)
  }
}

const parseRazorpayResponse = (response) => {
  const sources = [response?.data, response, response?.result, response?.order]
    .filter(s => s && typeof s === 'object')
  let order_id, razorpay_key, amount

  for (const source of sources) {
    order_id    = order_id    || source.order_id    || source.OrderID    || source.orderId    || source.orderID || source.id
    razorpay_key = razorpay_key || source.razorpay_key || source.RazorpayKey || source.razorpayKey || source.key || source.Key
    amount      = amount      || source.amount      || source.Amount
  }

  amount = amount || Number(donationForm.value.amount)
  return { order_id, razorpay_key, amount }
}

const submitDonation = async () => {
  if (submittingDonation.value) return

  try {
    submittingDonation.value = true

    if (!donationForm.value.type || !donationForm.value.amount) {
      alert('Please fill in all required fields')
      return
    }

    // ✅ UPI Direct — show UPI details step, no Razorpay needed
    if (donationForm.value.paymentMethod === 'upi_direct') {
      donationForm.value.showUpiDirect = true
      return
    }

    // Bank transfer — show bank details step, no Razorpay needed
    if (donationForm.value.paymentMethod === 'bank') {
      donationForm.value.showBankDetails = true
      return
    }

    if (!userContext.value) await getUserContext()

    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.')
      return
    }

    const donationData = {
      amount:       Number(donationForm.value.amount),
      donationType: donationForm.value.type,
      note:         donationForm.value.purpose || undefined,
    }

    if (currentTemple.value.id) {
      donationData.entityId  = currentTemple.value.id
      donationData.entity_id = currentTemple.value.id
    } else if (userContext.value?.entity_id) {
      donationData.entityId  = userContext.value.entity_id
      donationData.entity_id = userContext.value.entity_id
    }

    const response = await donationService.createDonation(donationData)
    console.log('💰 Create donation response:', JSON.stringify(response, null, 2))

    const { order_id, razorpay_key, amount } = parseRazorpayResponse(response)

    const backendTenantBank = response?.data?.tenant || response?.tenant || {}
    if (backendTenantBank.account_holder_name || backendTenantBank.upi_id) {
      tenantBankInfo.value = {
        account_holder_name: backendTenantBank.account_holder_name || tenantBankInfo.value.account_holder_name || '',
        account_number:      backendTenantBank.account_number      || tenantBankInfo.value.account_number      || '',
        ifsc_code:           backendTenantBank.ifsc_code           || tenantBankInfo.value.ifsc_code           || '',
        account_type:        backendTenantBank.account_type        || tenantBankInfo.value.account_type        || '',
        upi_id:              backendTenantBank.upi_id              || tenantBankInfo.value.upi_id              || '',
        bank_name:           backendTenantBank.bank_name           || tenantBankInfo.value.bank_name           || '',
        branch_name:         backendTenantBank.branch_name         || tenantBankInfo.value.branch_name         || '',
      }
      // ✅ Also fill creatorDetails contact info from tenant if currently missing
      if (!creatorDetails.value.phone && backendTenantBank.phone)    creatorDetails.value.phone    = backendTenantBank.phone
      if (!creatorDetails.value.email && backendTenantBank.email)    creatorDetails.value.email    = backendTenantBank.email
      if (!creatorDetails.value.fullName && backendTenantBank.name)  creatorDetails.value.fullName = backendTenantBank.name
      console.log('🏦 Tenant bank updated from createDonation response:', tenantBankInfo.value)
    }

    if (!order_id || !razorpay_key) {
      throw new Error(`Server response missing: ${!order_id ? 'order_id ' : ''}${!razorpay_key ? 'razorpay_key' : ''}`)
    }

    const tb = tenantBankInfo.value
    const options = {
      key:      razorpay_key,
      amount:   amount * 100,
      currency: 'INR',
      name:     currentTemple.value.name || 'Temple Donation',
      description: tb.upi_id
        ? `Paying to UPI: ${tb.upi_id}`
        : tb.account_holder_name
          ? `Paying to: ${tb.account_holder_name}`
          : 'Thank you for your generosity!',
      order_id: order_id,
      notes: {
        tenant_account_holder: tb.account_holder_name || '',
        tenant_upi:            tb.upi_id              || '',
        tenant_account:        tb.account_number      || '',
        tenant_ifsc:           tb.ifsc_code           || '',
        tenant_bank:           tb.bank_name           || '',
        donation_type:         donationForm.value.type,
      },
      handler: async function (rzpResponse) {
        try {
          console.log('✅ Razorpay payment success:', rzpResponse)
          await donationService.verifyDonation({
            orderID:     rzpResponse.razorpay_order_id,
            paymentID:   rzpResponse.razorpay_payment_id,
            razorpaySig: rzpResponse.razorpay_signature,
          })
          alert('Donation successful! Thank you for your generosity.')
          showDonationForm.value = false
          donationForm.value = {
            type: '', amount: '', purpose: '',
            paymentMethod: 'upi_direct',
            showBankDetails: false,
            showUpiDirect: false,
          }
          await fetchDonationHistory()
        } catch (verifyError) {
          console.error('❌ Verification failed:', verifyError)
          alert('Payment verification failed. Please contact support.')
        }
      },
      prefill: {
        name:  currentUser.value.name  || 'Donor',
        email: currentUser.value.email || '',
      },
      theme: { color: '#6366f1' },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()

  } catch (error) {
    console.error('❌ Donation error:', error)
    alert('Error: ' + (error.response?.data?.error || error.message || 'Something went wrong'))
  } finally {
    submittingDonation.value = false
  }
}

const fetchDonationHistory = async () => {
  try {
    loading.value = true

    const filterParams = { page: pagination.value.page, limit: pagination.value.limit }
    if (filters.value.dateRange !== 'all') filterParams.dateRange = filters.value.dateRange
    if (filters.value.donationType !== 'all') filterParams.type = filters.value.donationType

    if (filters.value.amountRange !== 'all') {
      const range = filters.value.amountRange
      if (range === '0-500')      { filterParams.minAmount = 0;    filterParams.maxAmount = 500  }
      else if (range === '501-1000')  { filterParams.minAmount = 501;  filterParams.maxAmount = 1000 }
      else if (range === '1001-5000') { filterParams.minAmount = 1001; filterParams.maxAmount = 5000 }
      else if (range === '5000+')     { filterParams.minAmount = 5000 }
    }

    let response
    try {
      response = await donationService.getDonationHistory(filterParams)
    } catch {
      response = await donationService.getMyDonations()
    }

    if (response) {
      if (response.data !== undefined) {
        donationHistory.value = Array.isArray(response.data) ? response.data : (response.data || [])
        if (response.total !== undefined) {
          pagination.value.total      = response.total
          pagination.value.page       = response.page       || 1
          pagination.value.limit      = response.limit      || 20
          pagination.value.totalPages = response.total_pages || 1
        }
      } else if (Array.isArray(response)) {
        donationHistory.value = response
      } else {
        donationHistory.value = []
      }
    } else {
      donationHistory.value = []
    }

    console.log(`✅ Loaded ${donationHistory.value.length} donations`)
  } catch (error) {
    console.error('❌ Error fetching donation history:', error)
    donationHistory.value = []
  } finally {
    loading.value = false
  }
}

// ==============================
// Lifecycle
// ==============================
onMounted(async () => {
  await fetchLoggedInUser()
  await getUserContext()
  await fetchTempleInfo()
  await fetchDonationHistory()
})

watch(
  () => filters.value,
  async () => {
    pagination.value.page = 1
    await fetchDonationHistory()
  },
  { deep: true }
)
</script>