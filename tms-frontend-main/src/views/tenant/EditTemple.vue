<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Simple Document Viewer (replaces main content when viewing) -->
    <div v-if="showDocumentViewer" class="min-h-screen bg-gray-50">
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <button
              @click="closeDocumentViewer"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>
            <h2 class="text-lg font-semibold text-gray-900">{{ currentDocumentTitle }}</h2>
            <button
              @click="downloadFromViewer"
              :disabled="downloadingFiles.viewer"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span v-if="downloadingFiles.viewer">Downloading...</span>
              <span v-else>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <object 
            v-if="isDocumentPdf && currentDocumentUrl" 
            :data="currentDocumentUrl" 
            type="application/pdf"
            class="w-full h-[calc(100vh-120px)] border border-gray-300 rounded"
            :key="`pdf-${currentDocumentUrl}`"
          >
            <iframe 
              :src="currentDocumentUrl" 
              class="w-full h-[calc(100vh-120px)] border border-gray-300 rounded"
            ></iframe>
          </object>
          <img 
            v-else-if="currentDocumentUrl && !isDocumentPdf"
            :src="currentDocumentUrl" 
            :alt="currentDocumentTitle" 
            class="max-w-full h-auto mx-auto rounded"
            :key="`img-${currentDocumentUrl}`"
            @error="handleImageError"
          />
          <div v-if="!currentDocumentUrl" class="flex items-center justify-center h-[calc(100vh-120px)] text-gray-500">
            <p>Loading document...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Edit Form (shown when not viewing document) -->
    <template v-else>
      <!-- Header Section -->
      <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <router-link to="/tenant/dashboard" class="hover:text-indigo-600">Dashboard</router-link>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <router-link to="/tenant/entities" class="hover:text-indigo-600">Manage Temples</router-link>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-gray-900">Edit Temple</span>
            </nav>
            <h1 class="text-2xl font-bold text-gray-900">Edit Temple</h1>
            <p class="text-gray-600 mt-1">Update temple information</p>
          </div>
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

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <span class="ml-3 text-gray-600">Loading temple data...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h3 class="text-lg font-medium text-red-800 mb-2">Failed to load temple data</h3>
        <p class="text-red-700 mb-4">{{ loadError }}</p>
        <button @click="fetchTempleData"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Try Again
        </button>
      </div>

      <!-- Form Container -->
      <form v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" @submit.prevent="handleSubmit">
        <!-- Step 1: Basic Information -->
        <div v-show="currentStep === 1" class="p-8">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-2">Temple Basic Information</h2>
            <p class="text-gray-600">Update the essential details about the temple</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label for="templeName" class="block text-sm font-medium text-gray-700 mb-2">Temple Name</label>
              <input id="templeName" v-model="form.name" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="Enter temple name" />
            </div>

            <div>
              <label for="deity" class="block text-sm font-medium text-gray-700 mb-2">Main Deity</label>
              <input id="deity" v-model="form.mainDeity" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="e.g., Lord Vishnu, Goddess Lakshmi" />
            </div>

            <div>
              <label for="templeType" class="block text-sm font-medium text-gray-700 mb-2">Temple Type</label>
              <select id="templeType" v-model="form.templeType" required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200">
                <option value="">Select temple type</option>
                <option value="traditional">Traditional</option>
                <option value="modern">Modern</option>
                <option value="heritage">Heritage</option>
                <option value="community">Community</option>
              </select>
            </div>

            <div>
              <label for="establishedYear" class="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
              <input id="establishedYear" v-model="form.establishedYear" type="number" :min="1800" :max="new Date().getFullYear()"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="YYYY" />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input id="phone" v-model="form.phone" type="tel" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="+91 XXXXX XXXXX" />
            </div>

            <div class="md:col-span-2">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Temple Email</label>
              <input id="email" v-model="form.email" type="email"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="temple@example.com" />
            </div>

            <div class="md:col-span-2">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Temple Description</label>
              <textarea id="description" v-model="form.description" rows="4"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="Brief description of the temple, its history, and significance..."></textarea>
            </div>
          </div>
        </div>

        <!-- Step 2: Address -->
        <div v-show="currentStep === 2" class="p-8">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-2">Temple Address</h2>
            <p class="text-gray-600">Update the complete address details</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input id="address" v-model="form.streetAddress" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="Enter complete street address" />
            </div>

            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input id="city" v-model="form.city" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="Enter city name" />
            </div>

            <div>
              <label for="state" class="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select id="state" v-model="form.state" required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200">
                <option value="">Select state</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Odisha">Odisha</option>
              </select>
            </div>

            <div>
              <label for="district" class="block text-sm font-medium text-gray-700 mb-2">District</label>
              <input id="district" v-model="form.district" type="text" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="Enter district name" />
            </div>

            <div>
              <label for="pinCode" class="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
              <input id="pinCode" v-model="form.pincode" type="text" pattern="[0-9]{6}" required
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="Enter 6-digit PIN code" />
            </div>

            <div class="md:col-span-2">
              <label for="landmark" class="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
              <input id="landmark" v-model="form.landmark" type="text"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="Nearby landmark for easy identification" />
            </div>

            <div class="md:col-span-2">
              <label for="googleMapsLink" class="block text-sm font-medium text-gray-700 mb-2">Google Maps Link (Optional)</label>
              <input id="googleMapsLink" v-model="form.mapLink" type="url"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                     placeholder="https://maps.google.com/..." />
            </div>
          </div>
        </div>

        <!-- Step 3: Documents & Media Upload -->
        <div v-show="currentStep === 3" class="p-8">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Update Documents & Media</h2>
              <p class="text-gray-600">Upload or update temple verification documents and media</p>
            </div>
            <button
              type="button"
              @click="showDocumentsModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              v-if="hasExistingDocuments"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View All Documents
            </button>
          </div>

          <div class="space-y-6">
            <!-- Registration Certificate -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Registration Certificate</h3>
                <p class="text-gray-600 mb-4">Upload temple registration certificate</p>

                <div class="flex flex-col items-center space-y-2">
                  <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                    <span>{{ existingFiles.registration ? 'Replace File' : 'Choose File' }}</span>
                    <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png"
                           @change="handleFileUpload($event, 'registration')" />
                  </label>

                  <div v-if="form.documents.registration" class="flex items-center space-x-2 mt-2">
                    <p class="text-sm text-green-600">✓ {{ form.documents.registration.name }}</p>
                    <button type="button"
                            @click="viewLocalFile(form.documents.registration, 'Registration Certificate', 'registration')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button type="button"
                            @click="downloadLocalFile(form.documents.registration, 'registration-certificate')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                      Download
                    </button>
                  </div>

                  <div v-else-if="documentUrls.registration" class="flex items-center space-x-2 mt-2">
                    <p class="text-sm text-gray-600">Current: {{ existingFiles.registration }}</p>
                    <button type="button"
                            v-if="documentUrls.registration"
                            @click="viewRemote(documentUrls.registration, 'Registration Certificate')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button type="button"
                            v-if="documentUrls.registration"
                            :disabled="downloadingFiles.registration"
                            @click="downloadRemote(documentUrls.registration, 'registration-certificate', 'registration')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span v-if="downloadingFiles.registration">Downloading...</span>
                      <span v-else>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trust Deed -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Trust Deed</h3>
                <p class="text-gray-600 mb-4">Upload temple trust deed document</p>

                <div class="flex flex-col items-center space-y-2">
                  <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                    <span>{{ existingFiles.trustDeed ? 'Replace File' : 'Choose File' }}</span>
                    <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png"
                           @change="handleFileUpload($event, 'trustDeed')" />
                  </label>

                  <div v-if="form.documents.trustDeed" class="flex items-center space-x-2 mt-2">
                    <p class="text-sm text-green-600">✓ {{ form.documents.trustDeed.name }}</p>
                    <button type="button"
                            @click="viewLocalFile(form.documents.trustDeed, 'Trust Deed', 'trustDeed')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button type="button"
                            @click="downloadLocalFile(form.documents.trustDeed, 'trust-deed')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                      Download
                    </button>
                  </div>

                  <div v-else-if="documentUrls.trustDeed" class="flex items-center space-x-2 mt-2">
                    <p class="text-sm text-gray-600">Current: {{ existingFiles.trustDeed }}</p>
                    <button type="button"
                            v-if="documentUrls.trustDeed"
                            @click="viewRemote(documentUrls.trustDeed, 'Trust Deed')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button type="button"
                            v-if="documentUrls.trustDeed"
                            :disabled="downloadingFiles.trustDeed"
                            @click="downloadRemote(documentUrls.trustDeed, 'trust-deed', 'trustDeed')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span v-if="downloadingFiles.trustDeed">Downloading...</span>
                      <span v-else>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Property Documents -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 01-2-2z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Property Documents</h3>
                <p class="text-gray-600 mb-4">Upload property ownership documents (Optional)</p>

                <div class="flex flex-col items-center space-y-2">
                  <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <span>{{ existingFiles.property ? 'Replace File' : 'Choose File' }}</span>
                    <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png"
                           @change="handleFileUpload($event, 'property')" />
                  </label>

                  <div v-if="form.documents.property" class="flex items-center space-x-2 mt-2">
                    <p class="text-sm text-green-600">✓ {{ form.documents.property.name }}</p>
                    <button type="button"
                            @click="viewLocalFile(form.documents.property, 'Property Documents', 'property')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button type="button"
                            @click="downloadLocalFile(form.documents.property, 'property-documents')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                      Download
                    </button>
                  </div>

                  <div v-else-if="documentUrls.property" class="flex items-center space-x-2 mt-2">
                    <p class="text-sm text-gray-600">Current: {{ existingFiles.property }}</p>
                    <button type="button"
                            v-if="documentUrls.property"
                            @click="viewRemote(documentUrls.property, 'Property Documents')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button type="button"
                            v-if="documentUrls.property"
                            :disabled="downloadingFiles.property"
                            @click="downloadRemote(documentUrls.property, 'property-documents', 'property')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span v-if="downloadingFiles.property">Downloading...</span>
                      <span v-else>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Documents -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Additional Documents</h3>
                <p class="text-gray-600 mb-4">Upload any additional supporting documents (Optional)</p>

                <div class="flex flex-col items-center">
                  <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <span>{{ 
                      (existingFiles.additional && existingFiles.additional.length > 0) || 
                      (form.documents.additional && form.documents.additional.length > 0) 
                        ? 'Add More Files' 
                        : 'Choose Files' 
                    }}</span>
                    <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple
                           @change="handleFileUpload($event, 'additional')" />
                  </label>

                  <!-- Show newly uploaded files (not yet saved) -->
                  <div v-if="form.documents.additional && form.documents.additional.length > 0" 
                       class="mt-4 w-full space-y-2">
                    <p class="text-sm font-medium text-gray-700 mb-2">📎 New Files to Upload:</p>
                    <div v-for="(file, idx) in form.documents.additional" 
                         :key="`new-${idx}`" 
                         class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                      <div class="flex items-center space-x-2 flex-1">
                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-sm text-green-700 font-medium">{{ file.name }}</span>
                        <span class="text-xs text-green-600">({{ (file.size / 1024).toFixed(1) }} KB)</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button type="button"
                                @click="viewLocalAdditional(idx)"
                                class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                          View
                        </button>
                        <button type="button"
                                @click="downloadLocalFile(file, `additional-document-${idx+1}`)"
                                class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors">
                          Download
                        </button>
                        <button type="button"
                                @click="removeNewAdditionalFile(idx)"
                                class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Show existing saved files -->
                  <div v-if="existingFiles.additional && existingFiles.additional.length > 0" 
                       class="mt-4 w-full space-y-2">
                    <p class="text-sm font-medium text-gray-700 mb-2">
                      📁 Currently Saved Documents ({{ existingFiles.additional.length }}):
                    </p>
                    <div v-for="(name, index) in existingFiles.additional" 
                         :key="`existing-${index}`"
                         class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                      <div class="flex items-center space-x-2 flex-1">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span class="text-sm text-blue-700">{{ name }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button type="button"
                                v-if="documentUrls.additional && documentUrls.additional[index]"
                                @click="viewRemote(documentUrls.additional[index], `Additional Document ${index+1}`)"
                                class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                          View
                        </button>
                        <button type="button"
                                v-if="documentUrls.additional && documentUrls.additional[index]"
                                :disabled="downloadingFiles[`additional-${index}`]"
                                @click="downloadRemote(documentUrls.additional[index], `additional-document-${index+1}`, `additional-${index}`)"
                                class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          <span v-if="downloadingFiles[`additional-${index}`]">Downloading...</span>
                          <span v-else>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Empty state -->
                  <div v-if="(!existingFiles.additional || existingFiles.additional.length === 0) && 
                             (!form.documents.additional || form.documents.additional.length === 0)"
                       class="mt-4 text-sm text-gray-500 italic">
                    No additional documents uploaded yet
                  </div>
                </div>
              </div>
            </div>

            <!-- Temple Logo -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Temple Logo</h3>
                <p class="text-gray-600 mb-4">Upload temple logo (JPG, PNG - Max 500kb)</p>
                
                <div class="flex flex-col items-center space-y-3">
                  <!-- Current/New Logo Preview -->
                  <div v-if="form.media.logo || mediaUrls.logo" class="mb-4">
                    <img 
                      :src="form.media.logo ? localPreviews.logo : mediaUrls.logo" 
                      :alt="form.name || 'Temple Logo'"
                      class="max-w-[200px] max-h-[200px] object-contain border-2 border-gray-300 rounded-lg shadow-sm"
                    />
                    <p class="text-xs text-gray-600 mt-2">
                      {{ form.media.logo ? '🆕 New Logo (not saved yet)' : '📁 Current Logo' }}
                    </p>
                  </div>

                  <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                    <span>{{ form.media.logo || mediaUrls.logo ? 'Replace Logo' : 'Choose Logo' }}</span>
                    <input 
                      type="file" 
                      class="hidden" 
                      accept="image/jpeg,image/jpg,image/png" 
                      @change="handleMediaUpload($event, 'logo')" 
                    />
                  </label>

                  <div v-if="form.media.logo" class="flex items-center space-x-2">
                    <p class="text-sm text-green-600">✓ {{ form.media.logo.name }}</p>
                    <button type="button"
                            @click="viewLocalMedia('logo')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View Full
                    </button>
                    <button type="button"
                            @click="downloadLocalFile(form.media.logo, 'temple-logo')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                      Download
                    </button>
                    <button type="button"
                            @click="clearMediaFile('logo')"
                            class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                      Remove
                    </button>
                  </div>

                  <div v-else-if="existingFiles.logo && mediaUrls.logo" class="flex items-center space-x-2">
                    <p class="text-sm text-gray-600">Current: {{ existingFiles.logo }}</p>
                    <button type="button"
                            @click="viewRemote(mediaUrls.logo, 'Temple Logo')"
                            class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button type="button"
                            :disabled="downloadingFiles.logo"
                            @click="downloadRemote(mediaUrls.logo, 'temple-logo', 'logo')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50">
                      {{ downloadingFiles.logo ? 'Downloading...' : 'Download' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Temple Video -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Temple Video (Optional)</h3>
                <p class="text-gray-600 mb-4">Upload temple video (MP4, MOV, AVI - Max 5MB)</p>
                
                <div class="flex flex-col items-center space-y-3">
                  <!-- Current/New Video Preview -->
                  <div v-if="form.media.video || mediaUrls.video" class="mb-4 w-full max-w-md">
                    <video 
                      :src="form.media.video ? localPreviews.video : mediaUrls.video"
                      controls
                      class="w-full max-h-[300px] border-2 border-gray-300 rounded-lg shadow-sm"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <p class="text-xs text-gray-600 mt-2">
                      {{ form.media.video ? '🆕 New Video (not saved yet)' : '📁 Current Video' }}
                    </p>
                  </div>

                  <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <span>{{ form.media.video || mediaUrls.video ? 'Replace Video' : 'Choose Video' }}</span>
                    <input 
                      type="file" 
                      class="hidden" 
                      accept="video/mp4,video/quicktime,video/x-msvideo" 
                      @change="handleMediaUpload($event, 'video')" 
                    />
                  </label>

                  <div v-if="form.media.video" class="flex items-center space-x-2">
                    <p class="text-sm text-green-600">✓ {{ form.media.video.name }}</p>
                    <button type="button"
                            @click="downloadLocalFile(form.media.video, 'temple-video')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                      Download
                    </button>
                    <button type="button"
                            @click="clearMediaFile('video')"
                            class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                      Remove
                    </button>
                  </div>

                  <div v-else-if="existingFiles.video && mediaUrls.video" class="flex items-center space-x-2">
                    <p class="text-sm text-gray-600">Current: {{ existingFiles.video }}</p>
                    <button type="button"
                            :disabled="downloadingFiles.video"
                            @click="downloadRemote(mediaUrls.video, 'temple-video', 'video')"
                            class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50">
                      {{ downloadingFiles.video ? 'Downloading...' : 'Download' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Information -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-gray-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-1">Current Status: <span :class="statusClass">{{ form.status || 'PENDING' }}</span></h3>
                  <p v-if="form.rejectionReason" class="text-sm text-red-600 mt-1"><strong>Rejection Reason</strong>: {{ form.rejectionReason }}</p>
                  <p v-if="form.adminNotes" class="text-sm text-gray-700 mt-1"><strong>Admin Notes</strong>: {{ form.adminNotes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button v-if="currentStep > 1"
                  type="button"
                  @click="previousStep"
                  class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>
          <div v-else></div>

          <div class="flex space-x-3">
            <button 
              type="button" 
              @click="router.back()"
              class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              Cancel
            </button>

            <button v-if="currentStep < 3"
                    type="button"
                    @click="nextStep"
                    class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200">
              Next
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <button v-else type="submit" :disabled="isSubmitting"
                    class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Saving Changes...' : 'Update Temple' }}
            </button>
          </div>
        </div>
      </form>

      <!-- Help Section -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-blue-800 mb-1">Need Help?</h3>
            <p class="text-sm text-blue-700">
              For assistance with updating temple information, contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
    </template>

    <!-- Documents Modal -->
    <div v-if="showDocumentsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Temple Documents</h3>
          <button @click="closeDocumentsModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div class="space-y-6">
            <div v-if="documentUrls.registration" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-medium text-gray-900">Registration Certificate</h4>
                <div class="flex space-x-2">
                  <button @click="viewRemote(documentUrls.registration, 'Registration Certificate')"
                          class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View
                  </button>
                  <button @click="downloadRemote(documentUrls.registration, 'registration-certificate', 'registration')"
                          :disabled="downloadingFiles.registration"
                          class="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="downloadingFiles.registration">Downloading...</span>
                    <span v-else>Download</span>
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-600">{{ existingFiles.registration }}</p>
            </div>

            <div v-if="documentUrls.trustDeed" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-medium text-gray-900">Trust Deed</h4>
                <div class="flex space-x-2">
                  <button @click="viewRemote(documentUrls.trustDeed, 'Trust Deed')"
                          class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View
                  </button>
                  <button @click="downloadRemote(documentUrls.trustDeed, 'trust-deed', 'trustDeed')"
                          :disabled="downloadingFiles.trustDeed"
                          class="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="downloadingFiles.trustDeed">Downloading...</span>
                    <span v-else>Download</span>
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-600">{{ existingFiles.trustDeed }}</p>
            </div>

            <div v-if="documentUrls.property" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-medium text-gray-900">Property Documents</h4>
                <div class="flex space-x-2">
                  <button @click="viewRemote(documentUrls.property, 'Property Documents')"
                          class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                    View
                  </button>
                  <button @click="downloadRemote(documentUrls.property, 'property-documents', 'property')"
                          :disabled="downloadingFiles.property"
                          class="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="downloadingFiles.property">Downloading...</span>
                    <span v-else>Download</span>
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-600">{{ existingFiles.property }}</p>
            </div>

            <div v-if="documentUrls.additional && documentUrls.additional.length > 0">
              <h4 class="text-md font-medium text-gray-900 mb-3">Additional Documents</h4>
              <div class="space-y-3">
                <div v-for="(url, index) in documentUrls.additional" :key="`additional-doc-${index}`"
                     class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-sm font-medium text-gray-800">Additional Document {{ index + 1 }}</h5>
                    <div class="flex space-x-2">
                      <button @click="viewRemote(url, `Additional Document ${index+1}`)"
                              class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                        View
                      </button>
                      <button @click="downloadRemote(url, `additional-document-${index+1}`, `additional-${index}`)"
                              :disabled="downloadingFiles[`additional-${index}`]"
                              class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="downloadingFiles[`additional-${index}`]">Downloading...</span>
                        <span v-else>Download</span>
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-gray-600">{{ existingFiles.additional[index] }}</p>
                </div>
              </div>
            </div>

            <div v-if="!hasExistingDocuments" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
              <p class="text-gray-600">No documents have been uploaded for this temple yet.</p>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 px-6 py-4">
          <div class="flex justify-end">
            <button @click="closeDocumentsModal"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import templeService from '@/services/temple.service.js'

const API_URL = import.meta.env.VITE_API_BASE_URL

const router = useRouter()
const route = useRoute()
const toast = useToast()

const currentStep = ref(1)
const isSubmitting = ref(false)
const isLoading = ref(true)
const loadError = ref(null)

const showDocumentsModal = ref(false)
const showDocumentViewer = ref(false)
const currentDocumentUrl = ref('')
const currentDocumentTitle = ref('')
const currentDocumentType = ref('') // Store MIME type for better detection

const downloadingFiles = reactive({
  registration: false,
  trustDeed: false,
  property: false,
  logo: false,
  video: false,
  viewer: false
})

const localPreviews = reactive({
  registration: '',
  trustDeed: '',
  property: '',
  additional: [],
  logo: '',
  video: ''
})

const form = reactive({
  name: '',
  mainDeity: '',
  templeType: '',
  establishedYear: '',
  phone: '',
  email: '',
  description: '',
  streetAddress: '',
  city: '',
  state: '',
  district: '',
  pincode: '',
  landmark: '',
  mapLink: '',
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
  status: 'PENDING',
  rejectionReason: '',
  adminNotes: ''
})

const existingFiles = reactive({
  registration: '',
  trustDeed: '',
  property: '',
  additional: [],
  logo: '',
  video: ''
})

const documentUrls = reactive({
  registration: '',
  trustDeed: '',
  property: '',
  additional: []
})

const mediaUrls = reactive({
  logo: '',
  video: ''
})

const showToast = (message, type = 'success') => {
  try {
    if (type === 'success' && toast.success) toast.success(message)
    else if (type === 'error' && toast.error) toast.error(message)
    else if (toast.addToast) toast.addToast({ content: message, type })
    else console.log(type.toUpperCase(), message)
  } catch (e) {
    console.error('Toast error', e)
    if (type === 'error') alert(message)
  }
}

const templeId = computed(() => route.params.id)

const statusClass = computed(() => {
  const status = (form.status || '').toUpperCase()
  switch (status) {
    case 'APPROVED': return 'text-green-600 font-medium'
    case 'PENDING': return 'text-yellow-600 font-medium'
    case 'REJECTED': return 'text-red-600 font-medium'
    default: return 'text-gray-600'
  }
})

const hasExistingDocuments = computed(() => {
  return !!(documentUrls.registration || documentUrls.trustDeed || documentUrls.property ||
            (documentUrls.additional && documentUrls.additional.length > 0))
})

const isDocumentPdf = computed(() => {
  const url = (currentDocumentUrl.value || '').toLowerCase()
  const title = (currentDocumentTitle.value || '').toLowerCase()
  const mimeType = (currentDocumentType.value || '').toLowerCase()
  
  // Check MIME type first (most reliable)
  if (mimeType === 'application/pdf') return true
  
  // Check URL for PDF indicators
  if (url.includes('.pdf') || url.includes('application/pdf')) return true
  
  // For blob URLs, check the file name extension in title
  if (url.startsWith('blob:')) {
    // Check if title ends with .pdf or contains .pdf
    if (title.includes('.pdf')) return true
  }
  
  return false
})

const sanitizeFileName = (name) => {
  const fallback = 'document'
  const raw = (name || '').trim() || fallback
  return raw.replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_').slice(0, 200)
}

const getFilenameFromDisposition = (disposition) => {
  if (!disposition) return ''
  const star = /filename\*\s*=\s*([^;]+)/i.exec(disposition)
  if (star) {
    let v = star[1].trim().replace(/^"+|"+$/g, '')
    if (v.toLowerCase().startsWith("utf-8''")) v = v.substring(7)
    try { return sanitizeFileName(decodeURIComponent(v)) } catch { return sanitizeFileName(v) }
  }
  const normal = /filename\s*=\s*("?)([^";]+)\1/i.exec(disposition)
  if (normal && normal[2]) return sanitizeFileName(normal[2])
  return ''
}

const getFilenameFromUrl = (url) => {
  try {
    const u = new URL(url, window.location.origin)
    const last = u.pathname.split('/').filter(Boolean).pop() || ''
    return sanitizeFileName(decodeURIComponent(last))
  } catch {
    const path = (url || '').split('?')[0].split('#')[0]
    const last = path.split('/').filter(Boolean).pop() || ''
    try { return sanitizeFileName(decodeURIComponent(last)) } catch { return sanitizeFileName(last) }
  }
}

const pickDownloadName = (preferred, url, disposition) => {
  return sanitizeFileName(
    getFilenameFromDisposition(disposition) ||
    preferred ||
    getFilenameFromUrl(url) ||
    'document'
  )
}

const fixToAbsoluteUrl = (direct) => {
  // Remove protocol + domain if present
  const urlPath = direct.replace(/^https?:\/\/[^/]+/, '');

  // Remove leading slash
  const cleanPath = urlPath.replace(/^\/+/, '');

  // Remove "uploads/" or "files/" prefix
  //return cleanPath.replace(/^(uploads|files)\//, '');
  return `/uploads/${cleanPath.replace(/^(uploads|files)\//, '')}`
}

function convertToHttps(url) {
    const parsedUrl = new URL(url);
    //parsedUrl.protocol = 'https:';  // Set protocol to https
    parsedUrl.protocol = window.location.protocol
    return parsedUrl.href;  // Return the modified URL
}

const viewRemote = async (rawUrl, title) => {
  const url = fixToAbsoluteUrl(rawUrl)
  if (!url) {
    showToast('Document URL not available', 'error')
    return
  }

  try {
    const tenantId = localStorage.getItem('current_tenant_id')
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || ''
    const response = await fetch(url, {      
        headers: { ...(token? {Authorization: `Bearer ${token}`} : {}), Accept: '*/*' },
    })

    if (!response.ok) throw new Error('Failed to load document')

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    currentDocumentType.value = blob.type
    currentDocumentUrl.value = objectUrl
    currentDocumentTitle.value = title || 'Document'
    showDocumentViewer.value = true
  } catch (err) {
    showToast('Unable to load document', 'error')
  }
}


const viewLocalFile = (file, title, key) => {
  if (!file) {
    showToast('No file selected', 'error')
    return
  }

  if (!(file instanceof File) && !(file instanceof Blob)) {
    showToast('Invalid file type', 'error')
    return
  }

  // Revoke old URL if exists
  if (localPreviews[key]) {
    try {
      URL.revokeObjectURL(localPreviews[key])
    } catch (e) {
      // Ignore
    }
  }

  try {
    // Verify file is valid
    if (file.size === 0) {
      showToast('File is empty', 'error')
      return
    }

    const blobUrl = URL.createObjectURL(file)
    
    // Verify blob URL was created
    if (!blobUrl || !blobUrl.startsWith('blob:')) {
      throw new Error('Failed to create blob URL')
    }
    
    localPreviews[key] = blobUrl
    currentDocumentType.value = file.type || ''
    currentDocumentTitle.value = title || file.name || 'Document'
    
    // Clear URL first to force re-render
    currentDocumentUrl.value = ''
    
    // Use nextTick to ensure DOM is ready
    nextTick(() => {
      currentDocumentUrl.value = blobUrl
      showDocumentViewer.value = true
    })
  } catch (error) {
    console.error('Error creating object URL:', error)
    showToast('Error creating file preview', 'error')
  }
}

const handleImageError = (event) => {
  console.error('Error loading image:', event)
  showToast('Failed to load document image', 'error')
}

/*
const viewLocalFile = (file, title, key) => {
  if (!file) {
    showToast('No file selected', 'error');
    return;
  }

  // Introducing a delay using setTimeout (e.g., 2 seconds delay)
  setTimeout(() => {
    console.log('Selected file name after delay:', file.name);
    
    // Proceed with the rest of your logic after the delay
    if (!(file instanceof Blob)) {
      showToast('Invalid file type', 'error');
      return;
    }

    if (!localPreviews[key]) {
      try {
        localPreviews[key] = URL.createObjectURL(file);
      } catch (error) {
        showToast('Error creating object URL', 'error');
        console.error('Error creating object URL:', error);
        return;
      }
    }

    currentDocumentUrl.value = localPreviews[key];
    currentDocumentTitle.value = title || file.name;
    showDocumentViewer.value = true;
  }, 2000); // 2000 milliseconds = 2 seconds delay
};
*/

const viewLocalAdditional = (idx) => {
  const file = form.documents.additional?.[idx]
  if (!file) return
  if (!localPreviews.additional[idx]) {
    localPreviews.additional[idx] = URL.createObjectURL(file)
  }
  currentDocumentType.value = file.type || ''
  currentDocumentTitle.value = `Additional Document ${idx + 1}`
  currentDocumentUrl.value = localPreviews.additional[idx]
  showDocumentViewer.value = true
}

const viewLocalMedia = (type) => {
  if (!form.media[type]) {
    showToast(`No ${type} file selected`, 'error')
    return
  }
  currentDocumentType.value = form.media[type].type || ''
  currentDocumentTitle.value = `Temple ${type.charAt(0).toUpperCase() + type.slice(1)}`
  currentDocumentUrl.value = localPreviews[type]
  showDocumentViewer.value = true
}

const downloadFromViewer = async () => {
  try {
    downloadingFiles.viewer = true
    const url = currentDocumentUrl.value
    const base = sanitizeFileName((currentDocumentTitle.value || 'document').replace(/\s+/g, '-'))
    if (url.startsWith('blob:')) {
      const a = document.createElement('a')
      a.href = url
      a.download = base
      document.body.appendChild(a)
      a.click()
      a.remove()
      showToast('Document download started')
      return
    }
    await downloadRemote(url, base, 'viewer')
  } catch {
    showToast('Failed to download from viewer', 'error')
  } finally {
    downloadingFiles.viewer = false
  }
}

const downloadLocalFile = (file, fallbackName = 'document') => {
  if (!file) return
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = sanitizeFileName(file.name || `${fallbackName}`)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
  showToast('Document download started')
}

const downloadRemote = async (rawUrl, filename, key) => {
  const url = fixToAbsoluteUrl(rawUrl)
  if (!url) {
    showToast('Document URL not available', 'error')
    return
  }
  try { downloadingFiles[key] = true } catch {}

  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || ''
    const resp = await fetch(url, {
      method: 'GET',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), Accept: '*/*' },
      credentials: 'include'
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const disposition = resp.headers.get('Content-Disposition') || resp.headers.get('content-disposition') || ''
    const blob = await resp.blob()
    const dlName = pickDownloadName(`${filename}`, url, disposition)
    const bUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = bUrl
    a.download = dlName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(bUrl), 0)
    showToast('Document downloaded successfully!')
    downloadingFiles[key] = false
    return
  } catch (e) {
    console.log('Blob download failed, falling back', e)
  }

  try {
    const a = document.createElement('a')
    a.href = url
    a.download = sanitizeFileName(`${filename}`)
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    a.remove()
    showToast('Document download initiated')
    downloadingFiles[key] = false
    return
  } catch (e2) {
    console.log('Direct link failed, trying iframe', e2)
  }

  try {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe) }, 5000)
    showToast('Download attempted via alternative method')
  } catch (e3) {
    console.log('Iframe fallback failed, opening new tab', e3)
    window.open(url, '_blank', 'noopener,noreferrer')
    showToast('Opened in a new tab; use Save As')
  } finally {
    try { downloadingFiles[key] = false } catch {}
  }
}

const revokeIfExists = (u) => { if (u) try { URL.revokeObjectURL(u) } catch {} }

const handleFileUpload = (event, type) => {
  const files = Array.from(event.target.files || [])
  if (type === 'additional') {
    form.documents.additional = files
    localPreviews.additional.forEach(u => revokeIfExists(u))
    localPreviews.additional = files.map(f => URL.createObjectURL(f))
  } else {
    form.documents[type] = files[0] || null
    if (localPreviews[type]) revokeIfExists(localPreviews[type])
    localPreviews[type] = form.documents[type] ? URL.createObjectURL(form.documents[type]) : ''
  }
}

const handleMediaUpload = (event, type) => {
  const file = event.target.files?.[0]
  if (!file) return

  const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024
  if (file.size > maxSize) {
    const sizeMB = type === 'video' ? '50MB' : '5MB'
    showToast(`File size exceeds ${sizeMB} limit`, 'error')
    return
  }

  const allowedTypes = {
    logo: ['image/jpeg', 'image/jpg', 'image/png'],
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo']
  }

  if (!allowedTypes[type].includes(file.type)) {
    showToast(`Invalid ${type} file type`, 'error')
    return
  }

  if (localPreviews[type]) {
    revokeIfExists(localPreviews[type])
  }

  form.media[type] = file
  localPreviews[type] = URL.createObjectURL(file)
  
  console.log(`✅ ${type.toUpperCase()} selected:`, file.name, file.type, file.size)
  showToast(`${type.toUpperCase()} uploaded successfully`)
}

const clearMediaFile = (type) => {
  if (localPreviews[type]) {
    revokeIfExists(localPreviews[type])
    localPreviews[type] = ''
  }
  form.media[type] = null
  showToast(`${type.toUpperCase()} removed`)
}

const removeNewAdditionalFile = (index) => {
  if (form.documents.additional && form.documents.additional.length > index) {
    if (localPreviews.additional[index]) {
      try {
        URL.revokeObjectURL(localPreviews.additional[index])
      } catch (e) {
        console.warn('Failed to revoke URL:', e)
      }
    }
    
    form.documents.additional.splice(index, 1)
    localPreviews.additional.splice(index, 1)
  }
}

const nextStep = () => { if (validateCurrentStep()) currentStep.value++ }
const previousStep = () => { currentStep.value-- }

const validateCurrentStep = () => {
  if (currentStep.value === 1) {
    const required = ['name', 'mainDeity', 'templeType', 'phone']
    const missing = required.filter(f => !(form[f] || '').toString().trim())
    if (missing.length) {
      showToast('Please fill in all required fields', 'error')
      return false
    }
  } else if (currentStep.value === 2) {
    const required = ['streetAddress', 'city', 'state', 'district', 'pincode']
    const missing = required.filter(f => !(form[f] || '').toString().trim())
    if (missing.length) {
      showToast('Please fill in all required address fields', 'error')
      return false
    }
    if (!/^\d{6}$/.test(form.pincode || '')) {
      showToast('PIN Code must be a 6-digit number', 'error')
      return false
    }
  }
  return true
}

const handleSubmit = async () => {
  if (!validateCurrentStep()) return
  
  try {
    isSubmitting.value = true
    
    let establishedYear = null
    if (form.establishedYear && !isNaN(parseInt(form.establishedYear))) {
      establishedYear = parseInt(form.establishedYear)
    }
    
    const formData = new FormData()
    
    formData.append('name', (form.name || '').trim())
    formData.append('main_deity', (form.mainDeity || '').trim())
    formData.append('temple_type', (form.templeType || '').trim())
    
    if (establishedYear) {
      formData.append('established_year', establishedYear.toString())
    }
    
    formData.append('phone', (form.phone || '').trim())
    formData.append('email', (form.email || '').trim())
    formData.append('description', (form.description || '').trim())
    
    formData.append('street_address', (form.streetAddress || '').trim())
    formData.append('city', (form.city || '').trim())
    formData.append('state', (form.state || '').trim())
    formData.append('district', (form.district || '').trim())
    formData.append('pincode', (form.pincode || '').trim())
    formData.append('landmark', (form.landmark || '').trim())
    formData.append('map_link', (form.mapLink || '').trim())
    
    let hasNewFiles = false
    
    if (form.documents.registration instanceof File) {
      formData.append('registration_cert', form.documents.registration)
      hasNewFiles = true
      console.log('📄 Adding NEW registration certificate:', form.documents.registration.name)
    }
    
    if (form.documents.trustDeed instanceof File) {
      formData.append('trust_deed', form.documents.trustDeed)
      hasNewFiles = true
      console.log('📄 Adding NEW trust deed:', form.documents.trustDeed.name)
    }
    
    if (form.documents.property instanceof File) {
      formData.append('property_docs', form.documents.property)
      hasNewFiles = true
      console.log('📄 Adding NEW property documents:', form.documents.property.name)
    }
    
    if (form.documents.additional && form.documents.additional.length > 0) {
      let hasAdditionalFiles = false
      form.documents.additional.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(`additional_docs_${index}`, file)
          hasNewFiles = true
          hasAdditionalFiles = true
          console.log(`📄 Adding NEW additional document ${index}:`, file.name)
        }
      })
      if (!hasAdditionalFiles) {
        console.log('ℹ️ No new additional docs - keeping existing')
      }
    }
    
    if (form.media.logo instanceof File) {
      formData.append('temple_logo', form.media.logo)
      hasNewFiles = true
      console.log('🖼️ Adding NEW temple logo:', form.media.logo.name, form.media.logo.type)
    }

    if (form.media.video instanceof File) {
      formData.append('temple_video', form.media.video)
      hasNewFiles = true
      console.log('🎥 Adding NEW temple video:', form.media.video.name, form.media.video.type)
    }
    
    console.log('📦 FormData contents:')
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }
    
    console.log(`🚀 Submitting temple update with ${hasNewFiles ? 'NEW FILES' : 'NO NEW FILES'}`)
    // ✅ Safety: tell backend to preserve old media if user didn't change it
if (!form.media.logo && mediaUrls.logo) {
  formData.append('preserve_logo', 'true')
}
if (!form.media.video && mediaUrls.video) {
  formData.append('preserve_video', 'true')
}

    const response = await templeService.updateTemple(templeId.value, formData)
    
    console.log('✅ Temple update response:', response)
    
    if (response.files_updated) {
      showToast(`Temple information and ${response.files_updated} file(s) updated successfully!`)
    } else {
      showToast('Temple information updated successfully!')
    }
    
    router.push('/tenant/dashboard')
    
  } catch (error) {
    console.error('Failed to update temple', error)
    
    const errorData = error?.response?.data
    let msg = 'Failed to update temple information. Please try again.'
    
    if (errorData?.error) {
      msg = errorData.error
    } else if (errorData?.message) {
      msg = errorData.message
    } else if (error?.message) {
      msg = error.message
    }
    
    showToast(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const safeGet = (obj, keys) => {
  for (const k of keys) {
    if (obj && typeof obj[k] === 'string' && obj[k]) return obj[k]
  }
  return ''
}

const fetchTempleData = async () => {
  isLoading.value = true
  loadError.value = null

  try {
    const response = await templeService.getTempleById(templeId.value)
    const d = response?.data || response || {}

    // -------- BASIC INFO --------
    form.name = d.name || d.Name || ''
    form.mainDeity = d.maindeity || d.mainDeity || d.MainDeity || d.main_deity || ''
    form.templeType = d.templetype || d.templeType || d.TempleType || d.temple_type || ''
    form.establishedYear = d.establishedyear || d.establishedYear || d.EstablishedYear || d.established_year || ''
    form.phone = d.phone || d.Phone || ''
    form.email = d.email || d.Email || ''
    form.description = d.description || d.Description || ''

    // -------- ADDRESS --------
    form.streetAddress =
      d.streetaddress || d.streetAddress || d.street_address ||
      d.StreetAddress || d.Address || d.addressLine1 || ''
    form.city = d.city || d.City || ''
    form.state = d.state || d.State || ''
    form.district = d.district || d.District || ''
    form.pincode = d.pincode || d.Pincode || ''
    form.landmark = d.landmark || d.Landmark || ''
    form.mapLink = d.maplink || d.mapLink || d.map_link || d.MapLink || ''

    // -------- STATUS --------
    form.status = (d.status || d.Status || 'PENDING').toString().toUpperCase()
    form.rejectionReason = d.rejectionReason || d.rejection_reason || d.RejectionReason || ''
    form.adminNotes = d.adminNotes || d.admin_notes || d.AdminNotes || ''

    // -------- DOCUMENT FILE NAMES --------
    existingFiles.registration =
      d.registrationCertName ||
      d.registration_cert_name ||
      d.registration_certificate_name ||
      ''

    existingFiles.trustDeed =
      d.trustDeedName ||
      d.trust_deed_name ||
      ''

    existingFiles.property =
      d.propertyDocsName ||
      d.property_docs_name ||
      ''

    const additionalNames =
      d.additionalDocsNames ||
      d.additional_docs_names ||
      d.additionalDocumentsNames ||
      d.additional_documents_names ||
      []

    existingFiles.additional = Array.isArray(additionalNames) ? additionalNames : []

    // ================= MEDIA FIX (IMPORTANT PART) =================
    let media = {}

    if (d.media) {
      try {
        media = typeof d.media === 'string'
          ? JSON.parse(d.media)
          : d.media
      } catch (e) {
        console.error('❌ Failed to parse media JSON:', d.media)
        media = {}
      }
    }

    // ✅ SET MEDIA URLS (ONLY HERE)
    mediaUrls.logo = media.logo ? fixToAbsoluteUrl(media.logo) : ''
    mediaUrls.video = media.video ? fixToAbsoluteUrl(media.video) : ''

    // ✅ SET MEDIA FILE NAMES
    existingFiles.logo = media.logo ? getFilenameFromUrl(media.logo) : ''
    existingFiles.video = media.video ? getFilenameFromUrl(media.video) : ''

    console.log('✅ FINAL MEDIA:', media)
    console.log('🎬 Media URLs:', mediaUrls)

    // -------- DOCUMENT URLS --------
    const getFirstUrl = (obj, keys) => {
      const raw = safeGet(obj, keys)
      return fixToAbsoluteUrl(raw)
    }

    documentUrls.registration = getFirstUrl(d, [
      'registrationCertUrl', 'registration_cert_url',
      'registrationUrl', 'registration_url',
      'registrationCert', 'registration_cert'
    ])

    documentUrls.trustDeed = getFirstUrl(d, [
      'trustDeedUrl', 'trust_deed_url',
      'trustDeed', 'trust_deed'
    ])

    documentUrls.property = getFirstUrl(d, [
      'propertyDocsUrl', 'property_docs_url',
      'propertyUrl', 'property_url',
      'propertyDocs', 'property_docs'
    ])

    // -------- ADDITIONAL DOCUMENT URLS --------
    // -------- ADDITIONAL DOCUMENT URLS (FIXED) --------
const additionalDocsData =
  d.additional_docs_urls ||
  d.additionalDocsUrls ||
  d.additional_docs ||
  d.additionalDocs ||
  []

if (Array.isArray(additionalDocsData)) {
  documentUrls.additional = additionalDocsData
    .map(u => typeof u === 'string' ? fixToAbsoluteUrl(u) : '')
    .filter(Boolean)

  // ✅ extract file names for UI
  existingFiles.additional = documentUrls.additional.map(u => getFilenameFromUrl(u))
} else {
  documentUrls.additional = []
  existingFiles.additional = []
}

console.log('📎 Additional Docs URLs:', documentUrls.additional)
console.log('📎 Additional Docs Names:', existingFiles.additional)


    if (!existingFiles.additional.length && documentUrls.additional.length) {
      existingFiles.additional = documentUrls.additional.map(u => getFilenameFromUrl(u))
    }

    console.log('✅ Final existingFiles:', JSON.stringify(existingFiles))
    console.log('✅ Final documentUrls:', JSON.stringify(documentUrls))

    isLoading.value = false
  } catch (err) {
    console.error('Failed to load temple data', err)
    loadError.value = err?.message || 'Unable to load details'
    isLoading.value = false
  }
}

const closeDocumentsModal = () => {
  showDocumentsModal.value = false
}

const closeDocumentViewer = () => {
  showDocumentViewer.value = false
  currentDocumentUrl.value = ''
  currentDocumentTitle.value = ''
  currentDocumentType.value = ''
}

const revokeAllPreviews = () => {
  try {
    ;['registration', 'trustDeed', 'property', 'logo', 'video'].forEach(k => revokeIfExists(localPreviews[k]))
    if (Array.isArray(localPreviews.additional)) {
      localPreviews.additional.forEach(u => revokeIfExists(u))
    }
  } catch {}
}

onMounted(async () => {
  await fetchTempleData()
})

onBeforeUnmount(() => {
  revokeAllPreviews()
})
</script>
