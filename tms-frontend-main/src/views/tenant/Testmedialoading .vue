<!-- Create this as: src/views/TestMediaLoading.vue -->
<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Media Loading Test Page</h1>
    
    <!-- Test Status -->
    <div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 class="font-bold text-lg mb-2">Test Configuration</h2>
      <div class="space-y-1 text-sm">
        <p><strong>Frontend URL:</strong> {{ frontendUrl }}</p>
        <p><strong>Backend URL:</strong> {{ backendUrl }}</p>
        <p><strong>Test Logo Path:</strong> {{ testLogoPath }}</p>
        <p><strong>Test Video Path:</strong> {{ testVideoPath }}</p>
      </div>
    </div>

    <!-- Test Results -->
    <div class="space-y-6">
      <!-- Test 1: Direct Backend URL -->
      <div class="border rounded-lg p-4">
        <h3 class="font-bold mb-3">Test 1: Direct Backend Access</h3>
        <p class="text-sm text-gray-600 mb-3">
          This tests if your backend is serving static files correctly.
        </p>
        
        <div class="mb-3">
          <p class="text-sm font-medium mb-2">Logo:</p>
          <img 
            :src="directBackendLogo" 
            alt="Direct Backend Logo"
            class="h-32 border rounded"
            @load="() => handleLoad('directBackendLogo')"
            @error="() => handleError('directBackendLogo')"
          />
          <p class="text-xs mt-1" :class="testResults.directBackendLogo.class">
            {{ testResults.directBackendLogo.message }}
          </p>
          <a :href="directBackendLogo" target="_blank" class="text-xs text-blue-600 hover:underline">
            Open in new tab: {{ directBackendLogo }}
          </a>
        </div>

        <div>
          <p class="text-sm font-medium mb-2">Video:</p>
          <video 
            :src="directBackendVideo" 
            controls
            class="max-w-md border rounded"
            @loadeddata="() => handleLoad('directBackendVideo')"
            @error="() => handleError('directBackendVideo')"
          ></video>
          <p class="text-xs mt-1" :class="testResults.directBackendVideo.class">
            {{ testResults.directBackendVideo.message }}
          </p>
          <a :href="directBackendVideo" target="_blank" class="text-xs text-blue-600 hover:underline">
            Open in new tab: {{ directBackendVideo }}
          </a>
        </div>
      </div>

      <!-- Test 2: Through Proxy -->
      <div class="border rounded-lg p-4">
        <h3 class="font-bold mb-3">Test 2: Through Vite Proxy</h3>
        <p class="text-sm text-gray-600 mb-3">
          This tests if your Vite proxy is configured correctly.
        </p>
        
        <div class="mb-3">
          <p class="text-sm font-medium mb-2">Logo:</p>
          <img 
            :src="proxyLogo" 
            alt="Proxy Logo"
            class="h-32 border rounded"
            @load="() => handleLoad('proxyLogo')"
            @error="() => handleError('proxyLogo')"
          />
          <p class="text-xs mt-1" :class="testResults.proxyLogo.class">
            {{ testResults.proxyLogo.message }}
          </p>
          <a :href="proxyLogo" target="_blank" class="text-xs text-blue-600 hover:underline">
            Open in new tab: {{ proxyLogo }}
          </a>
        </div>

        <div>
          <p class="text-sm font-medium mb-2">Video:</p>
          <video 
            :src="proxyVideo" 
            controls
            class="max-w-md border rounded"
            @loadeddata="() => handleLoad('proxyVideo')"
            @error="() => handleError('proxyVideo')"
          ></video>
          <p class="text-xs mt-1" :class="testResults.proxyVideo.class">
            {{ testResults.proxyVideo.message }}
          </p>
          <a :href="proxyVideo" target="_blank" class="text-xs text-blue-600 hover:underline">
            Open in new tab: {{ proxyVideo }}
          </a>
        </div>
      </div>

      <!-- Test 3: Using window.location.origin -->
      <div class="border rounded-lg p-4">
        <h3 class="font-bold mb-3">Test 3: Using window.location.origin (Recommended)</h3>
        <p class="text-sm text-gray-600 mb-3">
          This is the method used in your TenantProfile component.
        </p>
        
        <div class="mb-3">
          <p class="text-sm font-medium mb-2">Logo:</p>
          <img 
            :src="originLogo" 
            alt="Origin Logo"
            class="h-32 border rounded"
            @load="() => handleLoad('originLogo')"
            @error="() => handleError('originLogo')"
          />
          <p class="text-xs mt-1" :class="testResults.originLogo.class">
            {{ testResults.originLogo.message }}
          </p>
          <a :href="originLogo" target="_blank" class="text-xs text-blue-600 hover:underline">
            Open in new tab: {{ originLogo }}
          </a>
        </div>

        <div>
          <p class="text-sm font-medium mb-2">Video:</p>
          <video 
            :src="originVideo" 
            controls
            class="max-w-md border rounded"
            @loadeddata="() => handleLoad('originVideo')"
            @error="() => handleError('originVideo')"
          ></video>
          <p class="text-xs mt-1" :class="testResults.originVideo.class">
            {{ testResults.originVideo.message }}
          </p>
          <a :href="originVideo" target="_blank" class="text-xs text-blue-600 hover:underline">
            Open in new tab: {{ originVideo }}
          </a>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="mt-8 p-4 border rounded-lg" :class="summaryClass">
      <h3 class="font-bold mb-2">Summary</h3>
      <div class="text-sm space-y-1">
        <p>✓ Passed: {{ passedCount }}/6</p>
        <p>✗ Failed: {{ failedCount }}/6</p>
        <div v-if="failedCount > 0" class="mt-3">
          <p class="font-medium">Recommendations:</p>
          <ul class="list-disc ml-5 mt-1">
            <li v-if="!testResults.directBackendLogo.passed && !testResults.directBackendVideo.passed">
              Backend is NOT serving static files. Add express.static middleware to your server.
            </li>
            <li v-if="testResults.directBackendLogo.passed && !testResults.proxyLogo.passed">
              Vite proxy is NOT configured. Add '/uploads' proxy to vite.config.js.
            </li>
            <li v-if="!testResults.originLogo.passed">
              Issue with window.location.origin approach. Use the method that works above.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Configuration
const frontendUrl = window.location.origin // e.g., http://localhost:5173
const backendUrl = 'http://localhost:3000'
const testLogoPath = '/uploads/tenants/4/logo.jpg'
const testVideoPath = '/uploads/tenants/4/intro.mp4'

// Test URLs
const directBackendLogo = `${backendUrl}${testLogoPath}`
const directBackendVideo = `${backendUrl}${testVideoPath}`
const proxyLogo = testLogoPath
const proxyVideo = testVideoPath
const originLogo = `${window.location.origin}${testLogoPath}`
const originVideo = `${window.location.origin}${testVideoPath}`

// Test results
const testResults = ref({
  directBackendLogo: { passed: false, message: 'Testing...', class: 'text-gray-500' },
  directBackendVideo: { passed: false, message: 'Testing...', class: 'text-gray-500' },
  proxyLogo: { passed: false, message: 'Testing...', class: 'text-gray-500' },
  proxyVideo: { passed: false, message: 'Testing...', class: 'text-gray-500' },
  originLogo: { passed: false, message: 'Testing...', class: 'text-gray-500' },
  originVideo: { passed: false, message: 'Testing...', class: 'text-gray-500' }
})

const handleLoad = (testName) => {
  console.log(`✅ ${testName} loaded successfully`)
  testResults.value[testName] = {
    passed: true,
    message: '✅ Loaded successfully',
    class: 'text-green-600'
  }
}

const handleError = (testName) => {
  console.error(`❌ ${testName} failed to load`)
  testResults.value[testName] = {
    passed: false,
    message: '❌ Failed to load',
    class: 'text-red-600'
  }
}

const passedCount = computed(() => {
  return Object.values(testResults.value).filter(r => r.passed).length
})

const failedCount = computed(() => {
  return 6 - passedCount.value
})

const summaryClass = computed(() => {
  if (passedCount.value === 6) return 'bg-green-50 border-green-200'
  if (passedCount.value === 0) return 'bg-red-50 border-red-200'
  return 'bg-yellow-50 border-yellow-200'
})
</script>