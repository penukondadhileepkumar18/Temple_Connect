<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <router-link to="/tenant/dashboard" class="hover:text-indigo-600">Dashboard</router-link>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-gray-900">Create Temple</span>
            </nav>
            <h1 class="text-2xl font-bold text-gray-900">Register New Temple</h1>
            <p class="text-gray-600 mt-1">Fill out the form below to register your temple for approval</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Error Display -->
    <div v-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800 mb-1">Error</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
          <button @click="error = null" class="ml-auto">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-indigo-600">Step {{ currentStep }} of 3</span>
          <span class="text-sm text-gray-500">{{ Math.round((currentStep / 3) * 100) }}% Complete</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / 3) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: Basic Information -->
          <div v-show="currentStep === 1" class="p-8">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Temple Basic Information</h2>
              <p class="text-gray-600">Provide the essential details about your temple</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Temple Name -->
              <div class="md:col-span-2">
                <label for="templeName" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Name *
                </label>
                <input
                  id="templeName"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.name }"
                  placeholder="Enter temple name"
                />
                <p v-if="fieldErrors.name" class="text-red-600 text-sm mt-1">{{ fieldErrors.name }}</p>
              </div>

              <!-- Deity -->
              <div>
                <label for="deity" class="block text-sm font-medium text-gray-700 mb-2">
                  Main Deity *
                </label>
                <input
                  id="deity"
                  v-model="form.main_deity"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.main_deity }"
                  placeholder="e.g., Lord Vishnu, Goddess Lakshmi"
                />
                <p v-if="fieldErrors.main_deity" class="text-red-600 text-sm mt-1">{{ fieldErrors.main_deity }}</p>
              </div>

              <!-- Temple Type -->
              <div>
                <label for="templeType" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Type *
                </label>
                <select
                  id="templeType"
                  v-model="form.temple_type"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.temple_type }"
                >
                  <option value="">Select temple type</option>
                  <option value="traditional">Traditional</option>
                  <option value="modern">Modern</option>
                  <option value="heritage">Heritage</option>
                  <option value="community">Community</option>
                </select>
                <p v-if="fieldErrors.temple_type" class="text-red-600 text-sm mt-1">{{ fieldErrors.temple_type }}</p>
              </div>

              <!-- Established Year -->
              <div>
                <label for="establishedYear" class="block text-sm font-medium text-gray-700 mb-2">
                  Established Year *
                </label>
                <input
                  id="establishedYear"
                  v-model="form.established_year"
                  type="number"
                  min="1800"
                  :max="new Date().getFullYear()"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.established_year }"
                  placeholder="YYYY"
                />
                <p v-if="fieldErrors.established_year" class="text-red-600 text-sm mt-1">{{ fieldErrors.established_year }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.phone }"
                  placeholder="+91 XXXXX XXXXX"
                  @input="formatPhoneNumber"
                />
                <p v-if="fieldErrors.phone" class="text-red-600 text-sm mt-1">{{ fieldErrors.phone }}</p>
                <p class="text-gray-500 text-xs mt-1">Enter with country code (e.g., +91 9876543210)</p>
              </div>

              <!-- Email -->
              <div class="md:col-span-2">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Email *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.email }"
                  placeholder="temple@example.com"
                />
                <p v-if="fieldErrors.email" class="text-red-600 text-sm mt-1">{{ fieldErrors.email }}</p>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Description
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Brief description of the temple, its history, and significance..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 2: Address Information -->
          <div v-show="currentStep === 2" class="p-8">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Temple Address</h2>
              <p class="text-gray-600">Provide the complete address details</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Street Address -->
              <div class="md:col-span-2">
                <label for="street_address" class="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  id="street_address"
                  v-model="form.street_address"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.street_address }"
                  placeholder="Enter complete street address"
                />
                <p v-if="fieldErrors.street_address" class="text-red-600 text-sm mt-1">{{ fieldErrors.street_address }}</p>
              </div>

              <!-- City -->
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  id="city"
                  v-model="form.city"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.city }"
                  placeholder="Enter city name"
                />
                <p v-if="fieldErrors.city" class="text-red-600 text-sm mt-1">{{ fieldErrors.city }}</p>
              </div>

              <!-- State -->
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  id="state"
                  v-model="form.state"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.state }"
                >
                  <option value="">Select state</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
                <p v-if="fieldErrors.state" class="text-red-600 text-sm mt-1">{{ fieldErrors.state }}</p>
              </div>

              <!-- District -->
              <div>
                <label for="district" class="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  id="district"
                  v-model="form.district"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.district }"
                  placeholder="Enter district name"
                />
                <p v-if="fieldErrors.district" class="text-red-600 text-sm mt-1">{{ fieldErrors.district }}</p>
              </div>

              <!-- PIN Code -->
              <div>
                <label for="pincode" class="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>
                <input
                  id="pincode"
                  v-model="form.pincode"
                  type="text"
                  pattern="[0-9]{6}"
                  required
                  maxlength="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.pincode }"
                  placeholder="Enter 6-digit PIN code"
                  @input="validatePincode"
                />
                <p v-if="fieldErrors.pincode" class="text-red-600 text-sm mt-1">{{ fieldErrors.pincode }}</p>
              </div>

              <!-- Landmark -->
              <div class="md:col-span-2">
                <label for="landmark" class="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  v-model="form.landmark"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Nearby landmark for easy identification"
                />
              </div>

              <!-- Google Maps Link -->
              <div class="md:col-span-2">
                <label for="map_link" class="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Link (Optional)
                </label>
                <input
                  id="map_link"
                  v-model="form.map_link"
                  type="url"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.map_link }"
                  placeholder="https://maps.google.com/..."
                />
                <p v-if="fieldErrors.map_link" class="text-red-600 text-sm mt-1">{{ fieldErrors.map_link }}</p>
              </div>
            </div>
          </div>

          <!-- Step 3: Documents Upload -->
          <div v-show="currentStep === 3" class="p-8">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Upload Documents & Media</h2>
              <p class="text-gray-600">Upload required documents and temple media for verification</p>
            </div>

            <div class="space-y-6">
              <!-- Registration Certificate -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Registration Certificate *</h3>
                  <p class="text-gray-600 mb-4">Upload temple registration certificate</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                      <span>Choose File</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileUpload($event, 'registration')" />
                    </label>
                  </div>
                  <p v-if="form.documents.registration" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.documents.registration.name }}
                  </p>
                  <p v-if="fileErrors.registration" class="text-red-600 text-sm mt-2">{{ fileErrors.registration }}</p>
                </div>
              </div>

              <!-- Trust Deed -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Trust Deed *</h3>
                  <p class="text-gray-600 mb-4">Upload temple trust deed document</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                      <span>Choose File</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileUpload($event, 'trustDeed')" />
                    </label>
                  </div>
                  <p v-if="form.documents.trustDeed" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.documents.trustDeed.name }}
                  </p>
                  <p v-if="fileErrors.trustDeed" class="text-red-600 text-sm mt-2">{{ fileErrors.trustDeed }}</p>
                </div>
              </div>

              <!-- Property Documents -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Property Documents</h3>
                  <p class="text-gray-600 mb-4">Upload property ownership documents (Optional)</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <span>Choose File</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileUpload($event, 'property')" />
                    </label>
                  </div>
                  <p v-if="form.documents.property" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.documents.property.name }}
                  </p>
                  <p v-if="fileErrors.property" class="text-red-600 text-sm mt-2">{{ fileErrors.property }}</p>
                </div>
              </div>

              <!-- Additional Documents -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Additional Documents</h3>
                  <p class="text-gray-600 mb-4">Upload any additional supporting documents (Optional)</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <span>Choose Files</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple @change="handleFileUpload($event, 'additional')" />
                    </label>
                  </div>
                  <div v-if="form.documents.additional && form.documents.additional.length > 0" class="mt-2">
                    <p v-for="(file, index) in form.documents.additional" :key="index" class="text-sm text-green-600">
                      ✓ {{ file.name }}
                    </p>
                  </div>
                  <p v-if="fileErrors.additional" class="text-red-600 text-sm mt-2">{{ fileErrors.additional }}</p>
                </div>
              </div>

              <!-- Temple Logo -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Temple Logo *</h3>
                  <p class="text-gray-600 mb-4">Upload temple logo (JPG, PNG - Max 5MB)</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                      <span>Choose Logo</span>
                      <input
                        type="file"
                        class="hidden"
                        accept="image/jpeg,image/jpg,image/png"
                        @change="handleMediaUpload($event, 'logo')"
                      />
                    </label>
                  </div>
                  <p v-if="form.media.logo" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.media.logo.name }}
                  </p>
                  <p v-if="fileErrors.logo" class="text-red-600 text-sm mt-2">{{ fileErrors.logo }}</p>
                </div>
              </div>

              <!-- Temple Video -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Temple Video (Optional)</h3>
                  <p class="text-gray-600 mb-4">Upload temple video (MP4, MOV, AVI - Max 50MB)</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <span>Choose Video</span>
                      <input
                        type="file"
                        class="hidden"
                        accept="video/mp4,video/quicktime,video/x-msvideo"
                        @change="handleMediaUpload($event, 'video')"
                      />
                    </label>
                  </div>
                  <p v-if="form.media.video" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.media.video.name }}
                  </p>
                  <p v-if="fileErrors.video" class="text-red-600 text-sm mt-2">{{ fileErrors.video }}</p>
                </div>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg">
              <label class="flex items-start">
                <input
                  v-model="form.acceptTerms"
                  type="checkbox"
                  class="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  required
                />
                <span class="text-sm text-gray-700">
                  I agree to the
                  <router-link to="/terms" class="text-indigo-600 hover:text-indigo-800 underline">Terms and Conditions</router-link>
                  and
                  <router-link to="/privacy" class="text-indigo-600 hover:text-indigo-800 underline">Privacy Policy</router-link>.
                  I confirm that all information provided is accurate and complete.
                </span>
              </label>
              <p v-if="fieldErrors.acceptTerms" class="text-red-600 text-sm mt-1">{{ fieldErrors.acceptTerms }}</p>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="previousStep"
              class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Previous
            </button>
            <div v-else></div>

            <div class="flex space-x-3">
              <router-link
                to="/tenant/dashboard"
                class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </router-link>

              <button
                v-if="currentStep < 3"
                type="button"
                @click="nextStep"
                class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                Next
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <button
                v-else
                type="submit"
                :disabled="isSubmitting"
                class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Submitting...' : 'Submit Temple Registration' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Help Section -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-blue-800 mb-1">Need Help?</h3>
            <p class="text-sm text-blue-700">
              If you need assistance with temple registration, please contact our support team at
              <a href="mailto:support@templesaas.com" class="underline">support@templesaas.com</a>
              or call us at <a href="tel:+91-800-123-4567" class="underline">+91-800-123-4567</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/plugins/axios'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const userStore = useAuthStore()

// ============================================================
// TENANT ID RESOLUTION
// Covers all roles: superadmin, templeadmin, standard_user,
// monitoring_user — without relying on a single localStorage key
// ============================================================
const resolvedTenantId = computed(() => {
  const role = (userStore.userRole || '').toLowerCase()

  console.log('🔍 resolvedTenantId - role:', role)
  console.log('🔍 resolvedTenantId - userStore.assignedTenantId:', userStore.assignedTenantId)
  console.log('🔍 resolvedTenantId - userStore.user:', userStore.user)
  console.log('🔍 resolvedTenantId - route.query.tenant_id:', route.query.tenant_id)
  console.log('🔍 resolvedTenantId - route.params.tenantId:', route.params.tenantId)

  // 1. Superadmin navigating from tenant dashboard via route query (?tenant_id=X)
  if (route.query.tenant_id) {
    console.log('✅ Using tenant_id from route query:', route.query.tenant_id)
    return String(route.query.tenant_id)
  }

  // 2. Superadmin navigating via route params (/tenant/:tenantId/...)
  if (route.params.tenantId) {
    console.log('✅ Using tenantId from route params:', route.params.tenantId)
    return String(route.params.tenantId)
  }

  // 3. Standard user / Monitoring user — use their assigned tenant ID
  //    This comes from the JWT token parsed during login/initialize
  if (
    role === 'standard_user' || role === 'standarduser' ||
    role === 'monitoring_user' || role === 'monitoringuser'
  ) {
    const assigned =
      userStore.assignedTenantId ||                      // Pinia store ref (set from JWT)
      userStore.user?.assignedTenantId ||                // Attached to user object during login
      userStore.user?.assigned_tenant_id ||              // Direct field from backend
      userStore.user?.tenant_id ||                       // Alternative field name
      localStorage.getItem('assigned_tenant_id') ||     // Persisted from JWT parse
      localStorage.getItem('selected_tenant_id')        // Set during tenant selection flow

    if (assigned) {
      console.log('✅ Using assigned tenant ID for standard/monitoring user:', assigned)
      return String(assigned)
    }

    console.warn('⚠️ Standard/Monitoring user has no assigned tenant ID')
    return null
  }

  // 4. Templeadmin / Tenant — their own user ID is the tenant ID
  if (role === 'templeadmin' || role === 'tenant') {
    const tid =
      userStore.currentTenantId ||
      localStorage.getItem('current_tenant_id') ||
      userStore.user?.id

    if (tid) {
      console.log('✅ Using templeadmin own ID as tenant ID:', tid)
      return String(tid)
    }
  }

  // 5. Superadmin without route context — check localStorage set by TenantDashboard
  if (role === 'superadmin' || role === 'super_admin') {
    const tid =
      localStorage.getItem('currentTenantId') ||
      localStorage.getItem('selected_tenant_id') ||
      localStorage.getItem('current_tenant_id')

    if (tid) {
      console.log('✅ Using superadmin localStorage tenant ID:', tid)
      return String(tid)
    }
  }

  // 6. Last resort — try all localStorage keys
  const fallback =
    localStorage.getItem('currentTenantId') ||
    localStorage.getItem('current_tenant_id') ||
    localStorage.getItem('selected_tenant_id') ||
    localStorage.getItem('tenant_id') ||
    localStorage.getItem('assigned_tenant_id')

  if (fallback) {
    console.log('✅ Using localStorage fallback tenant ID:', fallback)
    return String(fallback)
  }

  console.error('❌ Could not resolve tenant ID from any source')
  return null
})

// Form state
const currentStep = ref(1)
const isSubmitting = ref(false)
const error = ref(null)

// Error handling
const fieldErrors = ref({})
const fileErrors = ref({})

// Form data
const form = reactive({
  name: '',
  main_deity: '',
  temple_type: '',
  established_year: '',
  phone: '',
  email: '',
  description: '',
  street_address: '',
  city: '',
  state: '',
  district: '',
  pincode: '',
  landmark: '',
  map_link: '',
  documents: {
    registration: null,
    trustDeed: null,
    property: null,
    additional: []
  },
  media: {
    logo: null,
    video: null
  },
  acceptTerms: false
})

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const digitsOnly = phone.replace(/\D/g, '')
  return (digitsOnly.length === 12 && digitsOnly.startsWith('91')) || digitsOnly.length === 10
}

const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const validateYear = (year) => {
  const currentYear = new Date().getFullYear()
  const yearNum = parseInt(year)
  return yearNum >= 1800 && yearNum <= currentYear
}

// Phone number formatting
const formatPhoneNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '')

  if (value.startsWith('91') && value.length > 2) {
    value = '+91 ' + value.slice(2)
  } else if (value.length === 10) {
    value = '+91 ' + value
  } else if (value.length > 0 && !value.startsWith('+')) {
    if (value.length <= 10) {
      value = '+91 ' + value
    }
  }

  form.phone = value
}

// Pincode validation
const validatePincode = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 6) {
    value = value.slice(0, 6)
  }
  form.pincode = value
}

// Step validation
const validateCurrentStep = () => {
  fieldErrors.value = {}
  fileErrors.value = {}
  let isValid = true

  if (currentStep.value === 1) {
    if (!form.name?.trim()) {
      fieldErrors.value.name = 'Temple name is required'
      isValid = false
    }
    if (!form.main_deity?.trim()) {
      fieldErrors.value.main_deity = 'Main deity is required'
      isValid = false
    }
    if (!form.temple_type) {
      fieldErrors.value.temple_type = 'Temple type is required'
      isValid = false
    }
    if (!form.established_year) {
      fieldErrors.value.established_year = 'Established year is required'
      isValid = false
    } else if (!validateYear(form.established_year)) {
      fieldErrors.value.established_year = 'Please enter a valid year'
      isValid = false
    }
    if (!form.phone?.trim()) {
      fieldErrors.value.phone = 'Phone number is required'
      isValid = false
    } else if (!validatePhone(form.phone)) {
      fieldErrors.value.phone = 'Please enter a valid phone number'
      isValid = false
    }
    if (!form.email?.trim()) {
      fieldErrors.value.email = 'Email is required'
      isValid = false
    } else if (!validateEmail(form.email)) {
      fieldErrors.value.email = 'Please enter a valid email address'
      isValid = false
    }
  } else if (currentStep.value === 2) {
    if (!form.street_address?.trim()) {
      fieldErrors.value.street_address = 'Street address is required'
      isValid = false
    }
    if (!form.city?.trim()) {
      fieldErrors.value.city = 'City is required'
      isValid = false
    }
    if (!form.state) {
      fieldErrors.value.state = 'State is required'
      isValid = false
    }
    if (!form.district?.trim()) {
      fieldErrors.value.district = 'District is required'
      isValid = false
    }
    if (!form.pincode?.trim()) {
      fieldErrors.value.pincode = 'PIN code is required'
      isValid = false
    } else if (!/^\d{6}$/.test(form.pincode)) {
      fieldErrors.value.pincode = 'PIN code must be 6 digits'
      isValid = false
    }
    if (form.map_link?.trim() && !validateUrl(form.map_link)) {
      fieldErrors.value.map_link = 'Please enter a valid URL'
      isValid = false
    }
  } else if (currentStep.value === 3) {
    if (!form.documents.registration) {
      fileErrors.value.registration = 'Registration certificate is required'
      isValid = false
    }
    if (!form.documents.trustDeed) {
      fileErrors.value.trustDeed = 'Trust deed is required'
      isValid = false
    }
    if (!form.media.logo) {
      fileErrors.value.logo = 'Temple logo is required'
      isValid = false
    }
    if (!form.acceptTerms) {
      fieldErrors.value.acceptTerms = 'You must accept the terms'
      isValid = false
    }
  }

  if (!isValid) {
    error.value = 'Please fix the errors before proceeding'
  } else {
    error.value = null
  }

  return isValid
}

// Navigation
const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousStep = () => {
  currentStep.value--
  error.value = null
  fieldErrors.value = {}
  fileErrors.value = {}
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// File upload handlers
const handleFileUpload = (event, type) => {
  const files = Array.from(event.target.files)

  if (fileErrors.value[type]) {
    delete fileErrors.value[type]
  }

  if (files.length === 0) return

  const maxSize = 10 * 1024 * 1024 // 10MB
  const invalidFiles = files.filter(file => file.size > maxSize)

  if (invalidFiles.length > 0) {
    fileErrors.value[type] = 'File size too large (max 10MB)'
    return
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  const invalidTypes = files.filter(file => !allowedTypes.includes(file.type))

  if (invalidTypes.length > 0) {
    fileErrors.value[type] = 'Invalid file type (PDF, JPG, PNG only)'
    return
  }

  if (type === 'additional') {
    if (!form.documents.additional) {
      form.documents.additional = []
    }
    form.documents.additional = [...form.documents.additional, ...files]
  } else {
    form.documents[type] = files[0]
  }

  error.value = null
  toast.success('File(s) uploaded successfully')
}

// Media upload handler
const handleMediaUpload = (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  if (fileErrors.value[type]) {
    delete fileErrors.value[type]
  }

  const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024
  if (file.size > maxSize) {
    const sizeMB = type === 'video' ? '50MB' : '5MB'
    fileErrors.value[type] = `File size exceeds ${sizeMB} limit`
    toast.error(`${type.toUpperCase()} file too large`)
    return
  }

  const allowedTypes = {
    logo: ['image/jpeg', 'image/jpg', 'image/png'],
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo']
  }

  if (!allowedTypes[type].includes(file.type)) {
    fileErrors.value[type] = 'Invalid file type'
    toast.error(`Invalid ${type} file type`)
    return
  }

  form.media[type] = file
  console.log(`✅ ${type.toUpperCase()} selected:`, file.name, file.type, file.size)

  error.value = null
  toast.success(`${type.toUpperCase()} uploaded successfully`)
}

// Form submission
const handleSubmit = async () => {
  if (!validateCurrentStep()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  try {
    isSubmitting.value = true
    error.value = null

    console.log('🔍 Starting form submission...')
    console.log('📋 Form data:', form)
    console.log('📁 Documents:', form.documents)
    console.log('🎬 Media:', form.media)

    // ============================================================
    // RESOLVE TENANT ID
    // ============================================================
    const selectedTenantId = resolvedTenantId.value

    console.log('🏛️ Resolved tenant_id:', selectedTenantId)
    console.log('👤 User role:', userStore.userRole)
    console.log('👤 User object:', userStore.user)
    console.log('👤 assignedTenantId:', userStore.assignedTenantId)

    if (!selectedTenantId) {
      const role = (userStore.userRole || '').toLowerCase()
      let errMsg = 'Tenant not selected. Please go back to the dashboard.'

      if (role === 'standard_user' || role === 'standarduser' ||
          role === 'monitoring_user' || role === 'monitoringuser') {
        errMsg = 'Your account is not assigned to a tenant. Please contact your administrator.'
      }

      error.value = errMsg
      toast.error(errMsg)
      isSubmitting.value = false
      return
    }

    // Prepare phone number
    let phoneNumber = form.phone.replace(/\D/g, '')
    if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
      phoneNumber = '+' + phoneNumber
    } else if (phoneNumber.length === 10) {
      phoneNumber = '+91' + phoneNumber
    }

    // Build FormData
    const formData = new FormData()

    formData.append('name', form.name?.trim() || '')
    formData.append('main_deity', form.main_deity?.trim() || '')
    formData.append('temple_type', form.temple_type || '')
    formData.append('established_year', form.established_year?.toString() || '')
    formData.append('phone', phoneNumber)
    formData.append('email', form.email?.trim() || '')
    formData.append('description', form.description?.trim() || '')
    formData.append('street_address', form.street_address?.trim() || '')
    formData.append('city', form.city?.trim() || '')
    formData.append('district', form.district?.trim() || '')
    formData.append('state', form.state || '')
    formData.append('pincode', form.pincode || '')
    formData.append('landmark', form.landmark?.trim() || '')
    formData.append('map_link', form.map_link?.trim() || '')
    formData.append('status', 'pending')
    formData.append('tenant_id', selectedTenantId)

    // Documents
    if (form.documents.registration) {
      formData.append('registration_cert', form.documents.registration)
      console.log('📎 Added registration_cert')
    }
    if (form.documents.trustDeed) {
      formData.append('trust_deed', form.documents.trustDeed)
      console.log('📎 Added trust_deed')
    }
    if (form.documents.property) {
      formData.append('property_docs', form.documents.property)
      console.log('📎 Added property_docs')
    }
    if (form.documents.additional?.length > 0) {
      form.documents.additional.forEach((file, index) => {
        formData.append(`additional_docs_${index}`, file)
        console.log(`📎 Added additional_docs_${index}`)
      })
    }

    // Media
    if (form.media.logo) {
      formData.append('temple_logo', form.media.logo)
      console.log('🖼️ Added temple_logo:', form.media.logo.name, form.media.logo.type)
    }
    if (form.media.video) {
      formData.append('temple_video', form.media.video)
      console.log('🎥 Added temple_video:', form.media.video.name, form.media.video.type)
    }

    // Debug FormData
    console.log('📋 FormData contents:')
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }

    const response = await api.post('/entities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000
    })

    console.log('✅ Temple created successfully:', response.data)
    toast.success('Temple registration submitted successfully!')

    // Reset form
    Object.keys(form).forEach(key => {
      if (key === 'documents') {
        form[key] = { registration: null, trustDeed: null, property: null, additional: [] }
      } else if (key === 'media') {
        form[key] = { logo: null, video: null }
      } else if (key === 'acceptTerms') {
        form[key] = false
      } else {
        form[key] = ''
      }
    })

    setTimeout(() => {
      router.push('/tenant/dashboard')
    }, 2000)

  } catch (err) {
    console.error('❌ Temple registration failed:', err)

    if (err.code === 'ECONNABORTED') {
      error.value = 'Request timed out. Please try again.'
    } else if (err.response?.status === 413) {
      error.value = 'Files too large. Please reduce file sizes.'
    } else if (err.response?.status === 400) {
      error.value = err.response.data?.error || 'Invalid data submitted'
    } else {
      error.value = err.response?.data?.error || 'Failed to submit registration'
    }

    toast.error(error.value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}
</script>