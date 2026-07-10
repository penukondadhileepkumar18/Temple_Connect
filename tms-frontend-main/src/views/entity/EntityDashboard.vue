<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with Temple Info -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <!-- Temple Logo -->
            <div 
              v-if="templeLogo" 
              class="h-18 w-18 rounded-full overflow-hidden border-2 border-indigo-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
              @click="openLogoModal"
            >
              <img :src="templeLogo" :alt="temple?.name || 'Temple'" class="h-full w-full object-cover" @error="handleLogoError" />
            </div>
            <div v-else class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all" @click="openTempleVideo">
              <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h2 
                class="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2"
                @click="openTempleVideo"
              >
                {{ temple ? temple.name : 'Loading...' }}
                <!-- Video indicator icon -->
                <svg 
                  v-if="templeVideo"
                  class="h-5 w-5 text-indigo-500 animate-pulse" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </h2>
              <p class="text-sm text-gray-500">{{ temple ? `${temple.city}, ${temple.state}` : 'Loading location...' }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button class="relative p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span v-if="notifications.length > 0" class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">{{ notifications.length }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Logo Modal -->
    <transition name="modal">
      <div v-if="showLogoModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-98 flex items-center justify-center p-4" @click.self="closeLogoModal">
        <div class="relative w-full h-full max-w-7xl mx-auto flex flex-col" @click.stop>
          <!-- Close Button -->
          <button
            @click="closeLogoModal"
            class="absolute top-6 right-6 z-50 text-white hover:text-gray-200 transition-all duration-300 flex items-center gap-2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-black/80 hover:scale-105"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span class="text-sm font-semibold">Close</span>
          </button>
          
          <!-- Temple Name Title -->
          <div class="absolute top-6 left-6 z-50 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20">
            <h2 class="text-white text-lg font-semibold">{{ temple?.name }}</h2>
          </div>
          
          <!-- Logo Image -->
          <div class="flex-1 w-full flex items-center justify-center relative">
            <img
              v-if="templeLogo"
              :src="templeLogo"
              :alt="temple?.name || 'Temple Logo'"
              class="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl"
              @error="handleLogoError"
            />
            
            <!-- No Logo Message -->
            <div v-else class="text-center text-white">
              <svg class="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p class="text-lg">Temple logo not available</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Video Modal -->
    <transition name="modal">
      <div v-if="showVideoModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-98 flex items-center justify-center p-4" @click.self="closeVideoModal">
        <div class="relative w-full h-full max-w-7xl mx-auto flex flex-col" @click.stop>
          <!-- Close Button -->
          <button
            @click="closeVideoModal"
            class="absolute top-6 right-6 z-50 text-white hover:text-gray-200 transition-all duration-300 flex items-center gap-2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-black/80 hover:scale-105"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span class="text-sm font-semibold">Close Video</span>
          </button>
          
          <!-- Temple Name Title -->
          <div class="absolute top-6 left-6 z-50 bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20">
            <h2 class="text-white text-lg font-semibold">{{ temple?.name }}</h2>
          </div>
          
          <!-- Video Player -->
          <div class="flex-1 w-full flex items-center justify-center relative">
            <video
              v-if="templeVideo"
              ref="videoPlayer"
              :src="templeVideo"
              controls
              autoplay
              playsinline
              class="w-full h-full max-w-6xl max-h-[85vh] object-contain rounded-3xl shadow-2xl"
              @error="handleVideoError"
            >
              Your browser does not support the video tag.
            </video>
            
            <!-- No Video Message -->
            <div v-else class="text-center text-white">
              <svg class="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <p class="text-lg">Temple video not available</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-white mb-2">Welcome back, {{ user ? user.fullName : 'Admin' }}!</h3>
            <p class="text-indigo-100">Here's what's happening at your temple today</p>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-32 hover:shadow-md transition-shadow duration-200">
          <div class="animate-pulse flex items-center">
            <div class="h-12 w-12 bg-gray-200 rounded-lg mr-4"></div>
            <div class="space-y-2 flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
              <div class="h-6 bg-gray-200 rounded w-1/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Registered Devotees -->
        <router-link :to="{ name: 'DevoteeManagement', params: { id: $route.params.id } }" class="block">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-32 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Registered Devotees</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.devotees?.total || 0 }}</p>
                <p class="text-xs text-green-600">+{{ dashboardData.devotees?.newThisMonth || 0 }} this month</p>
              </div>
            </div>
          </div>
        </router-link>

        <!-- Seva Bookings -->
        <router-link :to="{ name: 'SevaManagement', params: { id: $route.params.id } }" class="block">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-32 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Seva Bookings</p>
                <div class="flex items-baseline">
                  <p class="text-2xl font-bold text-gray-900">{{ dashboardData.sevas?.today || 0 }}</p>
                  <span class="text-sm text-gray-500 ml-1">today</span>
                </div>
                <p class="text-xs text-blue-600">{{ dashboardData.sevas?.thisMonth || 0 }} this month</p>
              </div>
            </div>
          </div>
        </router-link>

        <!-- Donations -->
        <router-link :to="{ name: 'DonationManagement', params: { id: $route.params.id } }" class="block">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-32 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div class="flex items-center h-full">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex flex-col">
                <p class="text-sm font-medium text-gray-600 whitespace-nowrap">Month Donations</p>
                <p class="text-2xl font-bold text-gray-900">₹{{ formatCurrency(dashboardData.donations?.thisMonth || 0) }}</p>
                <p class="text-xs text-green-600 mb-4">+{{ dashboardData.donations?.growth || 0 }}% from last month</p>
              </div>
            </div>
          </div>
        </router-link>

        <!-- Upcoming Events -->
        <router-link :to="{ name: 'EventManagement', params: { id: $route.params.id } }" class="block">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-32 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.events?.upcoming || 0 }}</p>
                <p class="text-xs text-purple-600">{{ dashboardData.events?.thisWeek || 0 }} this week</p>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Quick Actions -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <router-link :to="`/entity/${entityId}/sevas`" 
                           class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Manage Sevas</p>
                    <p class="text-xs text-gray-500">Create and approve sevas</p>
                  </div>
                </router-link>

                <router-link :to="`/entity/${entityId}/events`" 
                           class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Create Event</p>
                    <p class="text-xs text-gray-500">Schedule temple events</p>
                  </div>
                </router-link>

                <router-link :to="`/entity/${entityId}/devotees`" 
                           class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">View Devotees</p>
                    <p class="text-xs text-gray-500">Manage devotee profiles</p>
                  </div>
                </router-link>

                <!-- Send Message - Disabled for Monitoring Users -->
                <div 
                  v-if="isMonitoringUser"
                  class="flex items-center p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed opacity-60 relative group"
                  :title="isMonitoringUser ? 'Monitoring users are not allowed to send messages' : ''"
                >
                  <div class="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-600">Send Message</p>
                    <p class="text-xs text-gray-400">Communicate with devotees</p>
                  </div>
                  <div class="absolute -top-8 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Restricted for monitoring users
                  </div>
                </div>

                <!-- Send Message - Enabled for Regular Users -->
                <router-link 
                  v-else
                  :to="`/entity/${entityId}/communication`" 
                  class="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                  <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                    <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Send Message</p>
                    <p class="text-xs text-gray-500">Communicate with devotees</p>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Upcoming Events -->
        <div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                <router-link 
                  :to="`/entity/${entityId}/events`" 
                  class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                  View All
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="upcomingEvents.length === 0" class="text-center py-4">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500">No upcoming events</p>
                <router-link :to="`/entity/${entityId}/events`" 
                           class="mt-1 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Create Event
                </router-link>
              </div>
              <div v-else class="space-y-4">
                <div v-for="event in upcomingEvents.slice(0, 3)" :key="event.id" 
                     class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span class="text-xs font-semibold text-purple-600">{{ formatEventDate(event.date) }}</span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                    <p class="text-xs text-gray-500">{{ formatFullDate(event.date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Donors -->
      <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Top Donors</h3>
            <router-link 
              :to="`/entity/${entityId}/donations`" 
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
              View All
            </router-link>
          </div>
        </div>
        <div class="p-6">
          <div v-if="topDonors.length === 0" class="text-center py-4">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-500">No donations yet</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="(donor, index) in topDonors.slice(0, 5)" :key="donor.id || donor.email || index" 
                 class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="h-8 w-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <span class="text-xs font-bold text-white">{{ index + 1 }}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ donor.name || 'Unknown Donor' }}</p>
                <p class="text-xs text-gray-500">{{ donor.totalDonations || donor.donation_count || 0 }} donations</p>
              </div>
              <div class="text-sm font-semibold text-green-600">
                ₹{{ formatCurrency(donor.amount || donor.total_amount || 0) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTempleStore } from '@/stores/temple'
import { useToast } from '@/composables/useToast'
import api from '@/plugins/axios'
import { donationService } from '@/services/donation.service'

const route = useRoute()
const entityId = computed(() => route.params.id)
const authStore = useAuthStore()
const templeStore = useTempleStore()
const toast = useToast()

const user = computed(() => authStore.user)
const temple = ref(null)
const loading = ref(true)
const dashboardData = ref({
  devotees: { total: 0, newThisMonth: 0 },
  sevas: { today: 0, thisMonth: 0 },
  donations: { thisMonth: 0, growth: 0 },
  events: { upcoming: 0, thisWeek: 0 }
})

const notifications = ref([])
const upcomingEvents = ref([])
const topDonors = ref([])

// Modal states
const showVideoModal = ref(false)
const showLogoModal = ref(false)
const videoPlayer = ref(null)

// Media URLs
const templeLogo = ref(null)
const templeVideo = ref(null)

const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE_URL

// Check if user is monitoring user
const isMonitoringUser = computed(() => {
  const role = (authStore.userRole || '').toLowerCase()
  const roleId = authStore.user?.roleId || authStore.user?.role_id
  return role === 'monitoring_user' || role === 'monitoringuser' || roleId === 6 || roleId === '6'
})

// Helper function to construct full media URL
const getFullMediaUrl = (path) => {
  if (!path) return null
  
  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Remove leading slash if present, we'll add it
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Construct full URL
  return `${BACKEND_ORIGIN}${cleanPath}`
}

// Extract media from temple data
const extractTempleMedia = (templeData) => {
  if (!templeData) return { logo: null, video: null }
  
  console.log('🔍 Extracting media from temple data:', templeData)
  
  let logo = null
  let video = null
  
  // Strategy 1: Check for media object (JSON string or object)
  if (templeData.media) {
    try {
      const media = typeof templeData.media === 'string' 
        ? JSON.parse(templeData.media) 
        : templeData.media
      
      logo = media.logo || media.Logo || media.logo_url || media.logoUrl
      video = media.video || media.Video || media.video_url || media.videoUrl || media.intro_video_url
    } catch (e) {
      console.warn('⚠️ Error parsing media JSON:', e)
    }
  }
  
  // Strategy 2: Check for direct fields
  if (!logo) {
    logo = templeData.logo_url || templeData.logoUrl || templeData.logo || templeData.Logo
  }
  if (!video) {
    video = templeData.intro_video_url || templeData.videoUrl || templeData.video || templeData.Video
  }
  
  const result = {
    logo: logo ? getFullMediaUrl(logo) : null,
    video: video ? getFullMediaUrl(video) : null
  }
  
  console.log('✅ Extracted media:', result)
  return result
}

// Load entity details with media
const loadEntityDetails = async (entityId) => {
  try {
    console.log('Fetching entity details for entity:', entityId)

    const response = await api.get(`/entities/${entityId}/details`, {
      params: { entity_id: entityId }
    })

    console.log('Entity details response:', response.data)

    if (response.data) {
      temple.value = response.data

      const media = extractTempleMedia(response.data)
      templeLogo.value = media.logo
      templeVideo.value = media.video

      console.log('Temple logo URL:', templeLogo.value)
      console.log('Temple video URL:', templeVideo.value)

      return response.data
    }
  } catch (err) {
    console.error('Error loading entity details:', err)

    // Fallback: try to get from temple store
    try {
      const fetchedTemple = await templeStore.getTempleById(entityId)
      if (fetchedTemple) {
        temple.value = fetchedTemple
        const media = extractTempleMedia(fetchedTemple)
        templeLogo.value = media.logo
        templeVideo.value = media.video
      }
    } catch (storeErr) {
      console.error('Fallback temple fetch failed:', storeErr)
    }
  }

  return null
}

// Open temple video modal
const openTempleVideo = () => {
  if (templeVideo.value) {
    showVideoModal.value = true
  } else {
    console.log('Temple video not available')
  }
}

// Open logo modal
const openLogoModal = () => {
  if (templeLogo.value) {
    showLogoModal.value = true
  } else {
    console.log('Temple logo not available')
  }
}

// Close video modal
const closeVideoModal = () => {
  showVideoModal.value = false
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.currentTime = 0
  }
}

// Close logo modal
const closeLogoModal = () => {
  showLogoModal.value = false
}

// Handle logo error
const handleLogoError = (event) => {
  console.error('Temple logo failed to load:', event.target.src)
  event.target.style.display = 'none'
}

// Handle video error
const handleVideoError = (event) => {
  console.error('Temple video failed to load:', event.target.src)
  toast.error('Failed to load temple video')
}

const loadEntityData = async () => {
  try {
    loading.value = true
    console.log('Loading entity data for ID:', entityId.value)
    
    // Load entity details with media
    await loadEntityDetails(entityId.value)
    
    // Load dashboard summary
    try {
      const dashboardResponse = await api.get(`/entities/dashboard-summary?entity_id=${entityId.value}`)
      
      if (dashboardResponse && dashboardResponse.data) {
        dashboardData.value = {
          devotees: {
            total: dashboardResponse.data.registered_devotees.total || 0,
            newThisMonth: dashboardResponse.data.registered_devotees.this_month || 0
          },
          sevas: {
            today: dashboardResponse.data.seva_bookings.today || 0,
            thisMonth: dashboardResponse.data.seva_bookings.this_month || 0
          },
          donations: {
            thisMonth: dashboardResponse.data.month_donations.amount || 0,
            growth: dashboardResponse.data.month_donations.percent_change || 0
          },
          events: {
            upcoming: dashboardResponse.data.upcoming_events.total || 0,
            thisWeek: dashboardResponse.data.upcoming_events.this_week || 0
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    }
    
    // Load upcoming events
    try {
      const eventsResponse = await api.get(`/events/upcoming?entity_id=${entityId.value}&limit=3`)
      
      if (eventsResponse && eventsResponse.data) {
        upcomingEvents.value = eventsResponse.data.map(event => ({
          ...event,
          date: new Date(event.event_date || event.date || Date.now())
        }))
      }
    } catch (err) {
      console.error('Failed to fetch upcoming events:', err)
    }
    
    // Load top donors
    try {
      const donorsResponse = await donationService.getTopDonors(5)
      
      if (donorsResponse && donorsResponse.success && Array.isArray(donorsResponse.data)) {
        topDonors.value = donorsResponse.data.map(donor => ({
          id: donor.email || Math.random(),
          name: donor.name || 'Unknown Donor',
          email: donor.email || '',
          amount: donor.total_amount || donor.totalAmount || 0,
          totalDonations: donor.donation_count || donor.donationCount || 0
        }))
      }
    } catch (err) {
      console.error('Failed to fetch top donors:', err)
    }
    
  } catch (err) {
    console.error('Error loading entity data:', err)
    toast.error('Failed to load entity data')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount)
}

const formatEventDate = (date) => {
  if (!date) return ''
  return date.getDate().toString()
}

const formatFullDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  console.log('EntityDashboard mounted for entity:', entityId.value)
  loadEntityData()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>