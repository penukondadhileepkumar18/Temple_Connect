
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
              :disabled="downloadingFromViewer"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span v-if="downloadingFromViewer">Downloading...</span>
              <span v-else>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <!-- Loading state -->
          <div v-if="documentViewerLoading" class="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-gray-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p>Loading document...</p>
          </div>
          
          <!-- PDF Viewer using object tag with blob URL -->
          <object 
            v-else-if="isDocumentPdf && currentDocumentBlobUrl" 
            :data="currentDocumentBlobUrl" 
            type="application/pdf"
            class="w-full h-[calc(100vh-120px)] border border-gray-300 rounded"
            :key="`pdf-${currentDocumentBlobUrl}`"
          >
            <iframe 
              :src="currentDocumentBlobUrl" 
              class="w-full h-[calc(100vh-120px)] border border-gray-300 rounded"
            ></iframe>
          </object>
          
          <!-- Image Viewer with blob URL -->
          <img 
            v-else-if="currentDocumentBlobUrl && !isDocumentPdf"
            :src="currentDocumentBlobUrl" 
            :alt="currentDocumentTitle" 
            class="max-w-full h-auto mx-auto rounded"
            :key="`img-${currentDocumentBlobUrl}`"
            @error="handleImageError"
          />
          
          <!-- Fallback for non-PDF docs -->
          <div v-else-if="!documentViewerLoading && currentDocumentUrl" class="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-gray-500">
            <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="mb-2">Document preview not available</p>
            <button 
              @click="downloadFromViewer"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Download to view
            </button>
          </div>
          
          <div v-else-if="!documentViewerLoading && !currentDocumentUrl" class="flex items-center justify-center h-[calc(100vh-120px)] text-gray-500">
            <p>Loading document...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content (shown when not viewing document) -->
    <div v-else>
      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
       <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
           <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900" style="font-family: 'Roboto', sans-serif;">
              Super Admin Dashboard
            </h1>
        <p class="mt-1 text-xs sm:text-sm text-gray-600">
              Manage temple registrations and system oversight
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              System Administrator
            </div>
            <div v-if="isLoadingStats" class="flex items-center text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent mr-2"></div>
              Loading stats...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Quick Access Links -->
       <div class="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
        <router-link
          to="/superadmin/reports"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Reports
        </router-link>

        <button
          @click="refreshData"
          class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582M20 12a8 8 0 10-15.418-3M20 12h-5" />
          </svg>
          Refresh
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending Approvals</p>
              <p class="text-3xl font-bold text-orange-600 mt-2">{{ summaryStats.pendingApprovals }}</p>
            </div>
            <div class="bg-orange-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500">Awaiting review</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Temples</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ summaryStats.activeTemples }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2M5 21H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-green-600">+{{ summaryStats.newThisWeek }} this week</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Users</p>
              <p class="text-3xl font-bold text-indigo-600 mt-2">{{ summaryStats.totalUsers }}</p>
            </div>
            <div class="bg-indigo-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2m.356-1.857a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500">Across all temples</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Rejected</p>
              <p class="text-3xl font-bold text-red-600 mt-2">{{ summaryStats.rejectedTemples }}</p>
            </div>
            <div class="bg-red-100 p-3 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01M5.062 19h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.33 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500">This month</span>
          </div>
        </div>
      </div>

      <!-- Pending Approvals Section -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900" style="font-family: 'Roboto', sans-serif;">
              Pending Temple Approvals
            </h2>
            <div class="flex items-center space-x-3">
              <select v-model="filterStatus" class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button @click="refreshData" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span class="ml-3 text-gray-600">Loading temple applications...</span>
        </div>

        <!-- Temple Applications List -->
        <div v-else class="divide-y divide-gray-200">
          <div v-if="filteredApplications.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p class="mt-1 text-sm text-gray-500">No temple applications match your current filter.</p>
          </div>

          <div v-for="application in filteredApplications" :key="application.id" class="p-6 hover:bg-gray-50 transition-colors duration-200">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">{{ application.templeName }}</h3>
                  <span :class="getStatusBadgeClass(application.status)" class="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                    {{ application.status }}
                  </span>
                </div>

                 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div>
                    <p class="text-sm text-gray-600">Email</p>
                    <p class="font-medium text-gray-900">{{ application.adminEmail }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Phone</p>
                    <p class="font-medium text-gray-900">{{ application.phone || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Location</p>
                    <p class="font-medium text-gray-900">{{ application.city }}, {{ application.state }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Submitted</p>
                    <p class="font-medium text-gray-900">{{ formatDate(application.submittedAt) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Documents</p>
                    <p class="font-medium text-indigo-600">{{ application.documents?.length || 0 }} files</p>
                  </div>
                </div>

                <div v-if="application.address" class="mb-4">
                  <p class="text-sm text-gray-600">Address</p>
                  <p class="text-gray-900">{{ application.address }}</p>
                </div>

                <div v-if="application.notes" class="mb-4">
                  <p class="text-sm text-gray-600">Admin Notes</p>
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-1">
                    <p class="text-yellow-800 text-sm">{{ application.notes }}</p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 ml-0 sm:ml-4 lg:ml-6 mt-4 sm:mt-0">
                <button @click="viewApplication(application)" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap">
                  <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  View Details
                </button>

                <div v-if="application.status === 'pending'" class="flex flex-col space-y-2">
                  <button
                    @click="approveApplication(application)"
                    class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 whitespace-nowrap"
                    :disabled="isProcessing"
                  >
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Approve
                  </button>
                  <button
                    @click="rejectApplication(application)"
                    class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 whitespace-nowrap"
                    :disabled="isProcessing"
                  >
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Application Details Modal -->
      <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Temple Application Details</h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6">
            <div v-if="selectedApplication" class="space-y-6">
              <!-- Temple Logo & Video Media Gallery -->
              <div v-if="templeLogo || templeVideo" class="mb-6">
                <h4 class="text-md font-semibold text-gray-900 mb-3">Temple Media</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Logo Display -->
                  <div v-if="templeLogo" class="border rounded-lg overflow-hidden bg-gray-50">
                    <div class="p-3 bg-gray-100 border-b">
                      <span class="text-xs font-medium text-gray-600">Temple Logo</span>
                    </div>
                    <div class="p-4 flex items-center justify-center">
                      <img 
                        :src="getMediaUrl(templeLogo)" 
                        :alt="selectedApplication.templeName + ' Logo'"
                        class="max-h-48 w-auto rounded-lg shadow-md object-contain"
                        @error="handleImageError"
                      />
                    </div>
                  </div>

                  <!-- Video Display -->
                  <div v-if="templeVideo" class="border rounded-lg overflow-hidden bg-gray-50">
                    <div class="p-3 bg-gray-100 border-b">
                      <span class="text-xs font-medium text-gray-600">Temple Video</span>
                    </div>
                    <div class="p-4">
                      <video 
                        :src="getMediaUrl(templeVideo)" 
                        controls
                        class="w-full rounded-lg shadow-md"
                        @error="handleVideoError"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Temple Details -->
              <div>
                <h4 class="text-md font-semibold text-gray-900 mb-3">Temple Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-600">Temple Name</label>
                    <p class="font-medium text-gray-900">{{ selectedApplication.templeName }}</p>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Temple Type</label>
                    <p class="font-medium text-gray-900">{{ selectedApplication.registrationType || 'Religious Trust' }}</p>
                  </div>
                  <div class="md:col-span-2">
                    <label class="text-sm text-gray-600">Address</label>
                    <p class="font-medium text-gray-900">{{ selectedApplication.address }}</p>
                  </div>
                </div>
              </div>

              <!-- Admin Details -->
              <div>
                <h4 class="text-md font-semibold text-gray-900 mb-3">Administrator Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-600">Email</label>
                    <p class="font-medium text-gray-900">{{ selectedApplication.adminEmail }}</p>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Phone</label>
                    <p class="font-medium text-gray-900">{{ selectedApplication.phone || 'Not provided' }}</p>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Role</label>
                    <p class="font-medium text-gray-900">Temple Administrator</p>
                  </div>
                </div>
              </div>


              <!-- Documents -->
              <div>
                <h4 class="text-md font-semibold text-gray-900 mb-3">Uploaded Documents</h4>

                <div v-if="!selectedApplication.documents || selectedApplication.documents.length === 0" class="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600">
                  No documents uploaded or available.
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    v-for="doc in selectedApplication.documents"
                    :key="doc.id || doc.name"
                    class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div class="flex items-center justify-center w-10 h-10 rounded bg-indigo-50 text-indigo-600">
                      <svg v-if="isPdf(doc)" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 11c0-.943 0-1.414.293-1.707C12.586 9 13.057 9 14 9h1c.943 0 1.414 0 1.707.293C17 9.586 17 10.057 17 11v2c0 .943 0 1.414-.293 1.707C16.414 15 15.943 15 15 15h-1m-4 0H9c-.943 0-1.414 0-1.707-.293C7 14.414 7 13.943 7 13v-2c0-.943 0-1.414.293-1.707C7.586 9 8.057 9 9 9h1m2 6V9m0 0V5.5c0-.465 0-.697.146-.854C12.293 4.5 12.526 4.5 12.99 4.5h1.02c.465 0 .697 0  .854.146.146.157.146.389.146.854V9" />
                      </svg>
                      <svg v-else-if="isImage(doc)" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M4 16l4-4 4 4 4-4 4 4M4 8h16M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ doc.name || doc.filename || 'document' }}</p>
                      <p class="text-xs text-gray-500">
                        {{ displayDocMeta(doc) }}
                      </p>
                    </div>

                    <div class="flex items-center space-x-2">
                      <button
                        @click="viewDocument(doc)"
                        class="px-2 py-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium rounded hover:bg-indigo-50"
                        :disabled="isDownloadingId === (doc.id || doc.name)"
                        title="View"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button
                        @click="downloadDocument(doc)"
                        class="px-2 py-1 text-gray-700 hover:text-gray-900 text-sm font-medium rounded hover:bg-gray-100"
                        :disabled="isDownloadingId === (doc.id || doc.name)"
                        title="Download"
                      >
                        <svg v-if="isDownloadingId === (doc.id || doc.name)" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button @click="closeDetailsModal" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              Close
            </button>
            <div v-if="selectedApplication?.status === 'pending'" class="flex space-x-3">
              <button
                @click="approveApplication(selectedApplication)"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                :disabled="isProcessing"
              >
                Approve Temple
              </button>
              <button
                @click="rejectApplication(selectedApplication)"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                :disabled="isProcessing"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Rejection Notes Modal -->
      <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-bold text-gray-900">Reject Application</h3>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">Please provide a reason for rejecting this temple application:</p>
            <textarea v-model="rejectionNotes" class="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Enter rejection reason..."></textarea>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button @click="closeRejectModal" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              Cancel
            </button>
            <button
              @click="confirmReject"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              :disabled="isProcessing"
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>

      <!-- Debug Modal for API Testing -->
      <div v-if="showDebugModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-auto">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Temple Counts API Debug</h3>
            <button @click="showDebugModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6">
            <div class="bg-gray-100 p-4 rounded font-mono text-xs overflow-auto whitespace-pre">
              {{ debugInfo }}
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button @click="showDebugModal = false" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useToast } from '@/composables/useToast'
import superAdminService from '@/services/superadmin.service'

// Toast notifications
const toast = useToast()

// Reactive data
const isLoading = ref(false)
const isLoadingActivities = ref(false)
const isProcessing = ref(false)
const isLoadingStats = ref(false)
const filterStatus = ref('all')
const showDetailsModal = ref(false)
const showRejectModal = ref(false)
const selectedApplication = ref(null)

// Document viewer state
const showDocumentViewer = ref(false)
const currentDocumentUrl = ref('')
const currentDocumentBlobUrl = ref('')
const currentDocumentTitle = ref('')
const currentDocumentType = ref('')
const downloadingFromViewer = ref(false)
const currentViewingDoc = ref(null)
const rejectionNotes = ref('')
const documentViewerLoading = ref(false)

// Debug mode and API status tracking
const debugMode = ref(false)
const showDebugModal = ref(false)
const debugInfo = ref('')
const templeCountsApiStatus = ref('Not tested')
const lastStatsUpdate = ref(null)

// API data
const summaryStats = ref({
  pendingApprovals: 0,
  activeTemples: 0,
  totalUsers: 0,
  rejectedTemples: 0,
  newThisWeek: 0
})

const templeApplications = ref([])
const recentActivities = ref([])

// Download state
const isDownloadingId = ref(null)

// Computed properties
const filteredApplications = computed(() => {
  if (filterStatus.value === 'all') {
    return templeApplications.value
  }
  return templeApplications.value.filter(app => {
    const appStatus = (app.status || '').toLowerCase().trim()
    const filterValue = filterStatus.value.toLowerCase().trim()
    
    // Handle "active" and "approved" as synonyms
    if (filterValue === 'active' || filterValue === 'approved') {
      return appStatus === 'active' || appStatus === 'approved'
    }
    
    return appStatus === filterValue
  })
})

// Helpers: document normalization and utilities
const isPdf = (doc) => {
  const t = (doc?.type || '').toLowerCase()
  const name = (doc?.name || doc?.filename || '').toLowerCase()
  return t.includes('pdf') || name.endsWith('.pdf')
}
const isImage = (doc) => {
  const t = (doc?.type || '').toLowerCase()
  const name = (doc?.name || doc?.filename || '').toLowerCase()
  return t.startsWith('image/') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')
}

const bytesToNice = (n) => {
  if (!n && n !== 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = Number(n)
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(1)} ${units[i]}`
}

const displayDocMeta = (doc) => {
  const parts = []
  if (doc.size) parts.push(bytesToNice(doc.size))
  if (doc.type) parts.push(doc.type)
  return parts.join(' • ') || 'Document'
}

const safeString = (v) => typeof v === 'string' ? v : ''

const inferMimeFromUrlOrName = (url, name) => {
  const n = (name || '').toLowerCase()
  const u = (url || '').toLowerCase()
  const s = n || u
  if (s.endsWith('.pdf')) return 'application/pdf'
  if (s.endsWith('.png')) return 'image/png'
  if (s.endsWith('.jpg') || s.endsWith('.jpeg')) return 'image/jpeg'
  return ''
}
// -----------------------------
// Temple Media (Logo & Video)
// -----------------------------
const templeLogo = computed(() => {
  if (!selectedApplication.value) return null
  return selectedApplication.value.media?.logo || null
})

const templeVideo = computed(() => {
  if (!selectedApplication.value) return null
  return selectedApplication.value.media?.video || null
})

// Media URL helper (backend already serves /files)
const getMediaUrl = (path) => {
  if (!path) return ''
  
  if (path.startsWith('http')) {
    return path
  }
  return path
}

// Error handlers
const handleImageError = (e) => {
  console.error('❌ Image load failed:', e.target?.src || e)
  if (e.target) {
    e.target.style.display = 'none'
  } else {
    toast.error('Failed to load document image')
  }
}

const handleVideoError = (e) => {
  console.error('❌ Video load failed:', e.target.src)
  e.target.outerHTML =
    '<p class="text-sm text-red-600">Failed to load video</p>'
}


// FIXED: Replace your normalizeTempleDocuments function with this version
const normalizeTempleDocuments = (temple) => {
  console.log('normalizeTempleDocuments - input temple:', temple)
  const docs = []

  // Helper to clean URLs
  const cleanUrl = (url) => {
    if (!url) return ''

    let cleaned = url.trim()

    // Remove protocol + host, keep pathname
    try {
      const parsed = new URL(cleaned)
      cleaned = parsed.pathname
    } catch {
      // Already a path, do nothing
    }

    // Optional: if you still want this rule
    cleaned = cleaned.replace(/\/files\//g, '/')

    // Ensure exactly one leading slash
    cleaned = '/' + cleaned.replace(/^\/+/, '')

    return cleaned
  }

  // Track processed documents by their actual URL to avoid true duplicates
  const processedUrls = new Set()
  
  // Helper to add document if not already processed
  const addDoc = (doc) => {
    if (!doc.url || processedUrls.has(doc.url)) {
      console.log('Skipping duplicate URL:', doc.url)
      return false
    }
    processedUrls.add(doc.url)
    docs.push(doc)
    console.log('Added document:', doc.name, '| URL:', doc.url)
    return true
  }

  // 1. Main documents array from backend
  if (Array.isArray(temple.documents) && temple.documents.length > 0) {
    console.log('normalizeTempleDocuments - found documents array:', temple.documents)
    temple.documents.forEach((d, idx) => {
      let url = d.download_url || d.downloadUrl || d.url || d.file_url || d.fileUrl || d.path || ''
      url = cleanUrl(url)
      
      if (url) {
        addDoc({
          id: d.id || `doc-${idx}-${Date.now()}`,
          name: d.name || d.filename || `Document ${idx + 1}`,
          type: d.type || inferMimeFromUrlOrName(url, d.name || d.filename),
          size: d.size || null,
          url
        })
      }
    })
  }

  // 2. Single-field docs (trust deed, registration cert, etc.)
  const singleFields = [
    { key: 'registration_cert', label: 'Registration Certificate' },
    { key: 'trust_deed', label: 'Trust Deed' },
    { key: 'property_docs', label: 'Property Documents' }
  ]

  singleFields.forEach(({ key, label }) => {
    const candidates = [
      temple[`${key}_url`], 
      temple[`${key}Url`], 
      temple[key], 
      temple[`${key}_path`], 
      temple[`${key}_link`]
    ]
      .map(safeString)
      .filter(Boolean)

    let url = candidates.find(v => v.startsWith('http') || v.startsWith('/')) || ''
    url = cleanUrl(url)

    if (url) {
      console.log(`normalizeTempleDocuments - checking single field ${key}:`, url)
      addDoc({
        id: `${key}-${Date.now()}`,
        name: label,
        type: inferMimeFromUrlOrName(url, label),
        size: null,
        url
      })
    }
  })

  // 3. Additional document arrays
  const additionalArrays = [
    temple.additional_docs,
    temple.additionalDocs,
    temple.additional_documents,
    temple.additionalDocuments
  ].find(arr => Array.isArray(arr))

  if (additionalArrays && additionalArrays.length > 0) {
    console.log('normalizeTempleDocuments - found additional docs:', additionalArrays)
    additionalArrays.forEach((d, idx) => {
      let url = d.download_url || d.downloadUrl || d.url || d.file_url || d.fileUrl || d.path || ''
      url = cleanUrl(url)
      
      if (url) {
        addDoc({
          id: d.id || `additional-${idx}-${Date.now()}`,
          name: d.name || d.filename || `Additional Document ${idx + 1}`,
          type: d.type || inferMimeFromUrlOrName(url, d.name || d.filename),
          size: d.size || null,
          url
        })
      }
    })
  }

  // 4. Parse JSON fields for additional documents
  const jsonFields = [
    temple.additional_docs_urls,
    temple.additionalDocsUrls,
    temple.additional_docs_info,
    temple.additionalDocsInfo
  ]

  jsonFields.forEach(field => {
    if (typeof field === 'string' && field.trim() && field !== '[]') {
      try {
        const parsed = JSON.parse(field)
        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            let url = ''
            if (typeof item === 'string') {
              url = cleanUrl(item)
            } else if (typeof item === 'object') {
              url = cleanUrl(item.url || item.file_url || item.fileUrl || '')
            }
            
            if (url) {
              addDoc({
                id: `json-doc-${idx}-${Date.now()}`,
                name: item.name || item.filename || `Document ${idx + 1}`,
                type: item.type || inferMimeFromUrlOrName(url, item.name),
                size: item.size || null,
                url
              })
            }
          })
        }
      } catch (e) {
        console.warn('Failed to parse JSON field:', field, e)
      }
    }
  })

  console.log(`✅ normalizeTempleDocuments - final count: ${docs.length} documents`)
  console.log('Final docs:', docs)
  return docs
}

// Clean and stable buildDocUrl - FINAL VERSION
// Always returns normalized path like: /uploads/number/filename
const buildDocUrl = (doc, appId, action = 'view') => {
  console.log("buildDocUrl - doc:", doc);
  console.log("buildDocUrl - appId:", appId);
  console.log("buildDocUrl - action:", action);

  let direct =
    doc.download_url ||
    doc.downloadUrl ||
    doc.url ||
    doc.file_url ||
    doc.fileUrl ||
    doc.path ||
    "";

  console.log("buildDocUrl - direct (raw):", direct);

  if (!direct) {
    // Fallback API (environment-safe)
    if (doc.id && appId) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const apiUrl = `${API_BASE_URL}/entities/${encodeURIComponent(
        appId
      )}/documents/${encodeURIComponent(doc.id)}/${action}`;
      console.log("buildDocUrl - API fallback:", apiUrl);
      return apiUrl;
    }
    return "";
  }

  // Step 1: If URL has protocol (http:// or https://), extract just the pathname
  if (direct.startsWith("http://") || direct.startsWith("https://")) {
    try {
      const parsed = new URL(direct);
      direct = parsed.pathname;
      console.log("buildDocUrl - extracted pathname:", direct);
    } catch (e) {
      console.warn("buildDocUrl - failed to parse URL:", e);
    }
  }

  // Step 2: Remove /files/ from path
  direct = direct.replace(/\/files\//g, "/");

  // Step 3: Normalize - ensure path starts with uploads/ and preserve temple ID folder
  let cleanPath = direct.replace(/^\/+/, ""); // remove leading slashes
  
  // Ensure uploads/ prefix is present
  if (!cleanPath.startsWith("uploads/")) {
    cleanPath = `uploads/${cleanPath}`;
  }

  // Fix double uploads
  cleanPath = cleanPath.replace(/uploads\/uploads\//g, "uploads/");

  // Step 4: Build final normalized path with leading slash
  const normalizedPath = '/' + cleanPath;
  
  console.log("buildDocUrl - normalized path:", normalizedPath);

  // For view action, return just the path (relative)
  if (action === 'view') {
    return normalizedPath;
  }

  // For download action, construct full URL with download params
  const finalUrl = `${window.location.origin}${normalizedPath}?download=true&filename=${encodeURIComponent(doc.name || doc.filename || 'document')}`;
  console.log("buildDocUrl - FINAL URL:", finalUrl);

  return finalUrl;
};

// Fixed openInNewTab function (was missing)
const openInNewTab = (url) => {
  try {
    console.log("openInNewTab the url: ", url)
    const w = window.open(url, '_blank', 'noopener,noreferrer')
    if (!w) {
      toast.warning('Pop-up blocked. Please allow pop-ups for this site.')
    }
  } catch (error) {
    console.error('Error opening new tab:', error)
    toast.error('Unable to open document in a new tab.')
  }
}

// Helpers to pick a safe filename for download
const sanitizeFileName = (name) => {
  const fallback = 'document'
  const raw = (name || '').trim() || fallback
  // remove illegal characters \ / : * ? " < > | and control chars
  return raw.replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_').slice(0, 200)
}

const getFilenameFromDisposition = (disposition) => {
  if (!disposition) return ''
  // RFC 5987 filename*
  const star = /filename\*\s*=\s*([^;]+)/i.exec(disposition)
  if (star) {
    let v = star[1].trim()
    // strip quotes
    v = v.replace(/^"+|"+$/g, '')
    // UTF-8'' prefix
    if (v.toLowerCase().startsWith("utf-8''")) {
      v = v.substring(7)
    }
    try {
      return sanitizeFileName(decodeURIComponent(v))
    } catch {
      return sanitizeFileName(v)
    }
  }
  // fallback filename=
  const normal = /filename\s*=\s*("?)([^";]+)\1/i.exec(disposition)
  if (normal && normal[2]) {
    return sanitizeFileName(normal[2])
  }
  return ''
}

const getFilenameFromUrl = (url) => {
  try {
    const u = new URL(url, window.location.origin)
    const last = u.pathname.split('/').filter(Boolean).pop() || ''
    return sanitizeFileName(decodeURIComponent(last))
  } catch {
    // relative or invalid, fallback to basic parse
    const path = (url || '').split('?')[0].split('#')[0]
    const last = path.split('/').filter(Boolean).pop() || ''
    try { return sanitizeFileName(decodeURIComponent(last)) } catch { return sanitizeFileName(last) }
  }
}

const pickDownloadName = (doc, url, disposition) => {
  return sanitizeFileName(
    getFilenameFromDisposition(disposition) ||
    (doc?.name || doc?.filename) ||
    getFilenameFromUrl(url) ||
    'document'
  )
}

// Document viewer functions - fetch with auth headers and create blob URL
const viewDocument = async (doc) => {
  console.log('viewDocument called with doc:', doc)
  if (!selectedApplication.value) {
    console.log('viewDocument - no selected application')
    return
  }
  
  const url = buildDocUrl(doc, selectedApplication.value.id, 'view')
  console.log('viewDocument - built URL:', url)
  if (!url) {
    toast.error('View URL not available for this document.')
    return
  }
  
  try {
    currentViewingDoc.value = doc
    currentDocumentType.value = doc.type || ''
    currentDocumentTitle.value = doc.name || doc.filename || 'Document'
    currentDocumentUrl.value = url
    
    // Clear previous blob URL
    if (currentDocumentBlobUrl.value) {
      URL.revokeObjectURL(currentDocumentBlobUrl.value)
      currentDocumentBlobUrl.value = ''
    }
    
    // Set loading state
    documentViewerLoading.value = true
    
    // Fetch document with authorization header
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || ''
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
    
    console.log('viewDocument - fetching document from:', fullUrl)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept': doc.type || '*/*'
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    // Get content type from response or use document type
    const contentType = response.headers.get('Content-Type') || doc.type || 'application/octet-stream'
    
    // Create blob from response
    const blob = await response.blob()
    const blobWithType = new Blob([blob], { type: contentType })
    
    // Create blob URL
    currentDocumentBlobUrl.value = URL.createObjectURL(blobWithType)
    console.log('viewDocument - created blob URL:', currentDocumentBlobUrl.value)
    
    // Show document viewer
    showDocumentViewer.value = true
  } catch (error) {
    console.error('Error viewing document:', error)
    toast.error('Failed to load document. Please try again.')
    // Fallback: show the document viewer anyway with the regular URL
    showDocumentViewer.value = true
  } finally {
    documentViewerLoading.value = false
  }
}

const closeDocumentViewer = () => {
  showDocumentViewer.value = false
  currentDocumentUrl.value = ''
  currentDocumentBlobUrl.value = ''
  currentDocumentTitle.value = ''
  currentDocumentType.value = ''
  currentViewingDoc.value = null
  documentViewerLoading.value = false
}

const downloadFromViewer = async () => {
  if (!currentViewingDoc.value || !selectedApplication.value) return
  
  downloadingFromViewer.value = true
  try {
    await downloadDocument(currentViewingDoc.value)
  } catch (error) {
    console.error('Error downloading from viewer:', error)
    toast.error('Failed to download document')
  } finally {
    downloadingFromViewer.value = false
  }
}


const isDocumentPdf = computed(() => {
  const url = (currentDocumentUrl.value || '').toLowerCase()
  const mimeType = (currentDocumentType.value || '').toLowerCase()
  
  // Check MIME type first (most reliable)
  if (mimeType === 'application/pdf') return true
  
  // Check URL for PDF indicators
  if (url.includes('.pdf') || url.includes('application/pdf')) return true
  
  // For blob URLs, check the file name extension in title
  if (url.startsWith('blob:')) {
    const title = (currentDocumentTitle.value || '').toLowerCase()
    if (title.includes('.pdf')) return true
  }
  
  return false
})

// UPDATED: Force-download implementation with Blob first, then graceful fallbacks
const downloadDocument = async (doc) => {
  if (!selectedApplication.value) return

  const url = buildDocUrl(doc, selectedApplication.value.id, 'view') // just the file URL
  if (!url) {
    toast.error('Download URL not available')
    return
  }

  const docKey = doc.id || doc.name
  isDownloadingId.value = docKey

  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || ''

    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include'
    })

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const blob = await resp.blob()
    const fileName =
      doc.name ||
      doc.filename ||
      url.split('/').pop() ||
      'document'

    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)

    toast.success('Downloaded')
  } catch (e) {
    console.error('Download failed:', e)
    toast.error('Download failed')
  } finally {
    isDownloadingId.value = null
  }
}


// Stats loader
const loadDashboardStats = async () => {
  try {
    isLoadingStats.value = true
    templeCountsApiStatus.value = 'Loading...'
    const response = await superAdminService.getTempleApprovalCounts()
    if (response && response.success && response.data) {
      summaryStats.value = {
        pendingApprovals: response.data.pendingApprovals || 0,
        activeTemples: response.data.activeTemples || 0,
        totalUsers: response.data.totalUsers || 0,
        rejectedTemples: response.data.rejectedTemples || 0,
        newThisWeek: response.data.newThisWeek || 0
      }
      templeCountsApiStatus.value = 'Success'
      lastStatsUpdate.value = new Date().toLocaleString()
      toast.success('Dashboard stats updated from API')
    } else {
      templeCountsApiStatus.value = 'Invalid response format'
      if (summaryStats.value.pendingApprovals === 0) {
        summaryStats.value = {
          pendingApprovals: 5,
          activeTemples: 32,
          totalUsers: 178,
          rejectedTemples: 3,
          newThisWeek: 4
        }
      }
      toast.warning('Using fallback data for dashboard stats')
    }
  } catch (error) {
    console.error('Failed to load temple counts:', error)
    templeCountsApiStatus.value = `Error: ${error.message}`
    if (import.meta.env.DEV) {
      summaryStats.value = {
        pendingApprovals: 5,
        activeTemples: 32,
        totalUsers: 178,
        rejectedTemples: 3,
        newThisWeek: 4
      }
      toast.info('Using mock dashboard data (development mode)')
    } else {
      toast.error('Failed to load dashboard statistics')
    }
  } finally {
    isLoadingStats.value = false
  }
}

// API debug helper
const testTempleCountsApi = async () => {
  debugInfo.value = 'Testing temple counts API...\n'
  showDebugModal.value = true
  try {
    const info = []
    info.push('==== TEMPLE COUNTS API TEST ====\n')
    info.push('Testing direct API call to /api/v1/superadmin/temple-approval-count...')
    try {
      const response = await fetch(API_URL + '/superadmin/temple-approval-count', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      })
      if (!response.ok) {
        info.push(`Direct API Error: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        info.push(`Error details: ${errorText}`)
      } else {
        const data = await response.json()
        info.push(`Direct API Response Status: ${response.status}`)
        info.push(`Direct API Response Data: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      info.push(`Direct API Error: ${error.message}`)
    }

    info.push('\n==== SERVICE METHOD TEST ====\n')
    try {
      const serviceResponse = await superAdminService.getTempleApprovalCounts()
      info.push(`Service Response: ${JSON.stringify(serviceResponse, null, 2)}`)
      if (serviceResponse.success && serviceResponse.data) {
        summaryStats.value = {
          pendingApprovals: serviceResponse.data.pendingApprovals || 0,
          activeTemples: serviceResponse.data.activeTemples || 0,
          totalUsers: serviceResponse.data.totalUsers || 0,
          rejectedTemples: serviceResponse.data.rejectedTemples || 0,
          newThisWeek: serviceResponse.data.newThisWeek || 0
        }
        info.push(`Updated dashboard stats: ${JSON.stringify(summaryStats.value, null, 2)}`)
        lastStatsUpdate.value = new Date().toLocaleString()
        toast.success('Stats updated from API test!')
      } else {
        info.push('Service method returned failure')
      }
    } catch (error) {
      info.push(`Service Error: ${error.message}`)
    }

    info.push('\n==== CURRENT STATS ====\n')
    info.push(`Current summaryStats: ${JSON.stringify(summaryStats.value, null, 2)}`)
    info.push(`Last update: ${lastStatsUpdate.value || 'Never'}`)
    info.push(`API Status: ${templeCountsApiStatus.value}`)
    debugInfo.value = info.join('\n')
  } catch (error) {
    debugInfo.value += `\nError running test: ${error.message}`
  }
}

// Data loaders
// Add this debugging code inside your loadPendingEntities function
// Right after you receive the response

const loadPendingEntities = async () => {
  try {
    isLoading.value = true
    const response = await superAdminService.getPendingEntities().catch(err => {
      console.error('Error fetching pending entities:', err)
      return null
    })

    if (response && response.success && response.data) {
      console.log('🔍 RAW RESPONSE DATA:', response.data)
      
      templeApplications.value = response.data.map((temple, templeIndex) => {
        // 🆕 DEBUG: Log each temple's document fields
        console.log(`\n========== TEMPLE ${templeIndex + 1}: ${temple.Name || temple.name} ==========`)
        console.log('Documents array:', temple.documents)
        console.log('registration_cert_url:', temple.registration_cert_url)
        console.log('trust_deed_url:', temple.trust_deed_url)
        console.log('property_docs_url:', temple.property_docs_url)
        console.log('additional_docs_urls:', temple.additional_docs_urls)
        console.log('additional_docs_info:', temple.additional_docs_info)
        console.log('additional_docs:', temple.additional_docs)
        console.log('additionalDocs:', temple.additionalDocs)
        console.log('====================================================\n')

        const status = (temple.Status || temple.status || 'pending').toLowerCase()
        const submittedDate = temple.CreatedAt ||
                              temple.createdAt ||
                              temple.SubmittedAt ||
                              temple.submittedAt ||
                              temple.created_at ||
                              temple.submitted_at ||
                              new Date().toISOString()

        // Build address
        let fullAddress = ''
        if (temple.Address && temple.Address.trim()) {
          fullAddress = temple.Address.trim()
        } else if (temple.address && temple.address.trim()) {
          fullAddress = temple.address.trim()
        } else {
          const parts = []
          const street = temple.StreetAddress || temple.streetAddress || temple.street_address
          if (street && street.trim()) parts.push(street.trim())
          const city = temple.City || temple.city
          if (city && city.trim()) parts.push(city.trim())
          const state = temple.State || temple.state
          if (state && state.trim()) parts.push(state.trim())
          const pin = temple.Pincode || temple.pincode || temple.PostalCode || temple.postalCode || temple.zipcode
          if (pin && pin.toString().trim()) parts.push(pin.toString().trim())
          fullAddress = parts.filter(Boolean).join(', ')
        }

        // 🆕 Call normalized document function and log result
        const normalizedDocs = normalizeTempleDocuments(temple)
        console.log(`📄 Temple "${temple.Name || temple.name}" - Normalized ${normalizedDocs.length} documents`)

        return {
  id: temple.ID || temple.id,
  templeName: temple.Name || temple.name,
  adminName: temple.CreatedBy || temple.createdBy || 'Unknown',
  adminEmail: temple.Email || temple.email || 'unknown@example.com',
  phone: temple.Phone || temple.phone,
  city: temple.City || temple.city,
  state: temple.State || temple.state,
  address: fullAddress || 'Address not provided',
  status,
  submittedAt: submittedDate,
  approvedAt: temple.ApprovedAt || temple.approvedAt,
  rejectedAt: temple.RejectedAt || temple.rejectedAt,
  notes: temple.Notes || temple.notes,
  registrationType: temple.TempleType || temple.templeType,

  media: (() => {
  try {
    // backend sends JSON string
    if (typeof temple.media === 'string') {
      const value = temple.media.trim()
      if (value) {
        return JSON.parse(value)
      }
    }

    // backend sends object
    if (typeof temple.media === 'object' && temple.media !== null) {
      return temple.media
    }

    // fallback fields
    return {
      logo:
        temple.logo ||
        temple.logo_url ||
        temple.temple_logo ||
        temple.templeLogo ||
        null,

      video:
        temple.video ||
        temple.video_url ||
        temple.temple_video ||
        temple.templeVideo ||
        null
    }
  } catch (e) {
    console.warn('Media parsing failed:', temple.media, e)
    return {}
  }
})(),


  // existing documents logic
  documents: normalizedDocs
}

      })
      
      console.log('✅ Total temples loaded:', templeApplications.value.length)
      console.log('📊 Document counts per temple:', 
        templeApplications.value.map(t => `${t.templeName}: ${t.documents.length} files`)
      )
      
      toast.success(`Loaded ${templeApplications.value.length} temple applications`)
    } else {
      templeApplications.value = []
    }
  } catch (error) {
    console.error('Failed to load pending temples:', error)
    if (import.meta.env.DEV) {
      templeApplications.value = []
    } else {
      toast.error('Failed to load pending temple applications')
    }
  } finally {
    isLoading.value = false
  }
}

const loadRecentActivities = async () => {
  try {
    isLoadingActivities.value = true
    try {
      const response = await superAdminService.getRecentActivities()
      if (response && response.success && response.data) {
        recentActivities.value = response.data
        return
      }
    } catch {
      // silent
    }
    recentActivities.value = []
  } catch (error) {
    console.error('Failed to load activities:', error)
    if (!import.meta.env.DEV) {
      toast.error('Failed to load recent activities')
    }
  } finally {
    isLoadingActivities.value = false
  }
}

// Actions
const refreshData = async () => {
  try {
    isLoading.value = true
    await Promise.all([
      loadDashboardStats(),
      loadPendingEntities(),
      loadRecentActivities()
    ])
    toast.success('Data refreshed successfully')
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast.error('Failed to refresh data')
  } finally {
    isLoading.value = false
  }
}

const viewApplication = (application) => {
  selectedApplication.value = application
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedApplication.value = null
}

const approveApplication = async (application) => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    if (showDetailsModal.value) closeDetailsModal()
    try {
      await superAdminService.approveEntity(application.id, { notes: 'Approved by super admin' })
    } catch {
      await new Promise(r => setTimeout(r, 500))
    }
    const idx = templeApplications.value.findIndex(app => app.id === application.id)
    if (idx !== -1) {
      templeApplications.value[idx].status = 'approved'
      templeApplications.value[idx].approvedAt = new Date().toISOString()
    }
    await loadDashboardStats()
    toast.success(`${application.templeName} has been approved successfully!`)
  } catch (error) {
    console.error('Error approving temple:', error)
    toast.error('Failed to approve temple. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

const rejectApplication = (application) => {
  // keep selected application active
  selectedApplication.value = application

  // open reject modal
  showRejectModal.value = true

  // close the details modal WITHOUT clearing selectedApplication
  if (showDetailsModal.value) {
    showDetailsModal.value = false   // FIXED: do NOT call closeDetailsModal()
  }
}

const closeRejectModal = () => {
  showRejectModal.value = false
  selectedApplication.value = null     // clear only when rejecting is fully cancelled
  rejectionNotes.value = ''
}


// Fixed confirmReject function
const confirmReject = async () => {
  if (!rejectionNotes.value.trim()) {
    toast.error('Please provide a reason for rejection')
    return
  }
  if (isProcessing.value || !selectedApplication.value) return
  
  try {
    isProcessing.value = true
    const application = selectedApplication.value
    try {
      await superAdminService.rejectEntity(application.id, { notes: rejectionNotes.value, reason: rejectionNotes.value })
    } catch {
      await new Promise(r => setTimeout(r, 500))
    }
    const idx = templeApplications.value.findIndex(app => app.id === application.id)
    if (idx !== -1) {
      templeApplications.value[idx].status = 'rejected'
      templeApplications.value[idx].rejectedAt = new Date().toISOString()
      templeApplications.value[idx].notes = rejectionNotes.value
    }
    await loadDashboardStats()
    toast.success(`${application.templeName} application has been rejected`)
    closeRejectModal()
  } catch (error) {
    console.error('Error rejecting temple:', error)
    toast.error('Failed to reject temple. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not available'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Date unavailable'
  }
}

// Lifecycle
onMounted(async () => {
  await loadDashboardStats()
  await Promise.all([loadPendingEntities(), loadRecentActivities()])
})
</script>
